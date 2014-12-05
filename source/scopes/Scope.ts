import Value = require("../values/value")
import Values = require("../Values")
import ValuesDefinition = require('../ValuesDefinition')
import assert = require("assert")
import LiteralExpression = require('../expressions/LiteralExpression')
import Stack = require('../Stack')
import Expression = require('../expressions/Expression');
import ValueMacro = require('../macros/ValueMacro');
import PropertyMacro = require('../macros/PropertyMacro');
import _ = require("../utilities")
import ScopeType = require('./ScopeType')
import MapboxGLStyleSpec = require('../MapboxGLStyleSpec')
import Stylesheet = require('../Stylesheet');
var Globals = require('../globals');

interface Loop {
  scope:Scope;
  valueIdentifier:string;
  keyIdentifier:string;
  collectionExpression:Expression;
}

enum StatementType {
  LOOP,
  LAYER,
  CLASS,
  PROPERTY,
  IF,
  ELSE,
  ELSE_IF
}

// TODO just make this more freeform
interface Statement {
  type:StatementType;
  loop?:Loop;
  name?:string;
  scope?:Scope;
  expressions?:Expression[];
}

class Scope {

  public parent:Scope;
  public stylesheet:Stylesheet;

  public valueMacros:ValueMacro[];
  public propertyMacros:PropertyMacro[];

  constructor(stylesheet:Stylesheet, name?:string, statements?:Statement[]);
  constructor(parent:Scope, name?:string, statements?:Statement[]);
  constructor(
      parent,
      public name:string = null,
      public statements:Statement[] = []
  ) {
    this.valueMacros = [];
    this.propertyMacros = [];

    if (parent instanceof Scope) {
      this.parent = parent;
      this.stylesheet = parent.stylesheet;

    } else { // parent instanceof Stylesheet
      this.parent = null;
      this.stylesheet = parent;

      for (var macroName in Globals.valueMacros) {
        var fn = Globals.valueMacros[macroName];
        this.addValueMacro(macroName, null, fn);
      }

      for (var macroName in Globals.propertyMacros) {
        var fn = Globals.propertyMacros[macroName];
        this.addPropertyMacro(macroName, null, fn);
      }
    }
  }

  isGlobal():boolean {
    return !this.parent
  }

  getGlobalScope():Scope {
    return this.isGlobal() ? this : this.parent.getGlobalScope();
  }

  //////////////////////////////////////////////////////////////////////////////
  // Construction

  // TODO make Source class
  addSource(source:{}):string {
    return this.stylesheet.addSource(source);
  }

  addProperty(name:string, expressions:Expression[]):void {
    // TODO check for duplicate properties
    assert(name != null);
    this.statements.push({
      type: StatementType.PROPERTY,
      name: name,
      expressions: expressions
    })
  }

  addClassScope(name:string):Scope {
    // TODO ensure class scopes are merged properly
    var scope = new Scope(this, name)

    this.statements.push({
      type: StatementType.CLASS,
      scope: scope
    })

    return scope;
  }

  addLayerScope(name?:string):Scope {
    // TODO check for duplicate layer scopes
    var scope = new Scope(this, name)

    this.statements.push({
      type: StatementType.LAYER,
      scope: scope
    })

    return scope;
  }


  addLoop(valueIdentifier:string, keyIdentifier:string, collectionExpression:Expression):Scope {
    var loop = {
      valueIdentifier: valueIdentifier,
      keyIdentifier: keyIdentifier,
      collectionExpression: collectionExpression,
      scope: new Scope(this)
    }

    this.statements.push({
      type: StatementType.LOOP,
      loop: loop
    })

    return loop.scope;
  }

  addIf(expression:Expression):Scope {
    var scope = new Scope(this);

    this.statements.push({
      type: StatementType.IF,
      expressions: [expression],
      scope: scope
    })

    return scope;
  }

  addElseIf(expression:Expression):Scope {
    var scope = new Scope(this);

    this.statements.push({
      type: StatementType.ELSE_IF,
      expressions: [expression],
      scope: scope
    })

    return scope;
  }

  addElse():Scope {
    var scope = new Scope(this);

    this.statements.push({
      type: StatementType.ELSE,
      scope: scope
    })

    return scope;
  }

  addLiteralValueMacros(values:{[name:string]:any}):void {
    for (var identifier in values) {
      this.addLiteralValueMacro(identifier, values[identifier]);
    }
  }

  addLiteralValueMacro(identifier:string, value:any) {
    this.addValueMacro(identifier, ValuesDefinition.ZERO, [new LiteralExpression(value)]);
  }

  addValueMacro(name:String, argDefinition:ValuesDefinition, body:Function);
  addValueMacro(name:String, argDefinition:ValuesDefinition, body:Expression[]);
  addValueMacro(name:String, argDefinition:ValuesDefinition, body:any) {
    var ValueMacro_ = require("../macros/ValueMacro");
    var macro = new ValueMacro_(name, argDefinition, this, body);

    return this.valueMacros.unshift(macro);
  }

  addPropertyMacro(name:string, argDefinition:ValuesDefinition, body:ValuesDefinition):Scope {
    var PropertyMacro = require("../macros/PropertyMacro");
    var macro = new PropertyMacro(this, name, argDefinition, body)
    this.propertyMacros.unshift(macro)

    return macro.scope
  }

  //////////////////////////////////////////////////////////////////////////////
  // Evaluation Helpers

  getValueMacro(name:string, values:Values, stack:Stack):ValueMacro {
    for (var i in this.valueMacros) {
      var macro = this.valueMacros[i];
      if (macro.matches(name, values) && !_.contains(stack.valueMacro, macro)) {
        return macro;
      }
    }

    if (this.isGlobal() && values.length == 0) {
      var ValueMacro_ = require("../macros/ValueMacro");
      return new ValueMacro_(name, ValuesDefinition.ZERO, this, [new LiteralExpression(name)]);
    } else if (this.parent) {
      return this.parent.getValueMacro(name, values, stack);
    } else {
      return null;
    }
  }

  getPropertyMacro(name:string, values:Values, stack:Stack):PropertyMacro {
    for (var i in this.propertyMacros) {
      var macro = this.propertyMacros[i];
      if (macro.matches(name, values) && !_.contains(stack.propertyMacro, macro)) {
        return macro;
      }
    }

    return this.parent ? this.parent.getPropertyMacro(name, values, stack) : null;
  }

  // Properties, layers, classes
  eachStatement(stack:Stack, callback:(scope:Scope, statement:Statement) => void): void {
    var statements = this.statements;

    for (var i=0; i < statements.length; i++) {
      var statement = statements[i];

      if (statement.type == StatementType.LOOP) {

        var loop = statement.loop;
        var scope = loop.scope;
        var collectionExpression = loop.collectionExpression;
        var valueIdentifier = loop.valueIdentifier;
        var keyIdentifier = loop.keyIdentifier;

        var collection = collectionExpression.toValue(this, stack);
        assert(_.isArray(collection) || _.isObject(collection))

        for (var key in collection) {
          var value = collection[key];
          scope.addLiteralValueMacro(valueIdentifier, value);
          if (keyIdentifier) { scope.addLiteralValueMacro(keyIdentifier, key); }
          scope.eachStatement(stack, callback)
        }

      } else if (statement.type == StatementType.IF) {

        if (statement.expressions[0].toValue(this, stack)) {
          statement.scope.eachStatement(stack, callback);
          continue;
        }

        var flag = false;
        while (statements[i + 1] && statements[i + 1].type == StatementType.ELSE_IF) {
          if (statements[++i].expressions[0].toValue(this, stack)) {
            statements[i].scope.eachStatement(stack, callback)
            flag = true
            break
          }
        }

        if (!flag && statements[i + 1] && statements[i + 1].type == StatementType.ELSE) {
          statement = statements[++i];
          statement.scope.eachStatement(stack, callback)
        }

      } else if (statement.type == StatementType.PROPERTY) {

        // TODO refactor Values to accept this as a constructor
        var values = new Values(
          _.map(statement.expressions, (expression) => {
            return { expression: expression }
          }),
          this,
          stack
        );

        var macro;
        if (macro = this.getPropertyMacro(statement.name, values, stack)) {
          stack.propertyMacro.push(macro);
          macro.getScope(values, stack).eachStatement(stack, callback);
          stack.propertyMacro.pop()
        } else {
          callback(this, statement);
        }

      } else {
        callback(this, statement);
      }
    }
  }

  // TODO rename
  private evaluate_(stack:Stack):{layers:Scope[]; classes:Scope[]; properties:{}} {
    var layers = [];
    var classes = [];
    var properties = {};

    this.eachStatement(stack, (scope, statement) => {
      if (statement.type == StatementType.LAYER) {
        layers.push(statement.scope.evaluateLayerScope(stack));

      } else if (statement.type == StatementType.CLASS) {
        classes.push(statement.scope.evaluateClassScope(stack))

      } else if (statement.type == StatementType.PROPERTY) {
        // TODO refactor Values to accept this as a constructor
        var values = new Values(
          _.map(statement.expressions, (expression) => {
            return { expression: expression }
          }),
          scope,
          stack
        );

        if (values.length != 1 || values.positional.length != 1) {
          throw new Error("Cannot apply " + values.length + " args to primitive property " + name)
        }

        properties[statement.name] = Value.evaluate(values.positional[0], stack);
      }
    });

    layers = _.sortBy(layers, 'z-index');
    if (layers.length == 0) { layers = undefined }

    return {layers: layers, classes: classes, properties: properties};
  }

  //////////////////////////////////////////////////////////////////////////////
  // Evaluation

  evaluate(type:ScopeType, stack:Stack):{} {
    if (type == ScopeType.GLOBAL) {
      return this.evaluateGlobalScope(stack)
    } else if (type == ScopeType.LAYER) {
      return this.evaluateLayerScope(stack)
    } else if (type == ScopeType.CLASS) {
      return this.evaluateClassScope(stack)
    } else {
      assert(false);
    }
  }

  evaluateClassScope(stack:Stack):any {
    // TODO assert there are no child layers or classes
    // TODO ensure all properties are paint properties, not layout properties
    stack.scope.push(this);
    var evaluated = this.evaluate_(stack);
    stack.scope.pop();

    return evaluated.properties;
  }

  evaluateGlobalScope(stack:Stack = new Stack()):any {
    stack.scope.push(this)

    var evaluated = this.evaluate_(stack);

    var layers = evaluated.layers;
    var properties = evaluated.properties;

    var sources = _.objectMapValues(this.stylesheet.sources, (source, name) => {
      return _.objectMapValues(source, (value, key) => {
        return Value.evaluate(value, stack);
      });
    });

    var transition = {
      duration: properties["transition-delay"],
      delay: properties["transition-duration"]
    }
    delete properties["transition-delay"];
    delete properties["transition-duration"];

    stack.scope.pop();

    return _.extend(
      properties,
      {
        version: 6,
        layers: layers,
        sources: sources,
        transition: transition
      }
    )
  }

  evaluateLayerScope(stack:Stack):any {
    // TODO should this be in this method?
    stack.scope.push(this);

    var evaluated = this.evaluate_(stack);

    var properties = evaluated.properties;
    var metaProperties = { 'z-index': 0 };
    var paintProperties = {};
    var layoutProperties = {};

    var layers = evaluated.layers;
    var type = properties['$type'] || 'raster';

    for (var name in properties) {
      var value = properties[name];

      if (_.startsWith(name, '$')) {
        metaProperties[name.slice(1)] = value;
      } else if (name == 'z-index') {
        metaProperties['z-index'] = value;
      } else if (_.contains(MapboxGLStyleSpec[type].paint, name)) {
        paintProperties[name] = value;
      } else if (_.contains(MapboxGLStyleSpec[type].layout, name)) {
        layoutProperties[name] = value;
      } else {
        assert(false);
      }
    }

    if (layers) {
      if (metaProperties['type']) {
        assert.equal(metaProperties['type'], 'raster');
      }
      metaProperties['type'] = 'raster'
    }

    var classes = _.objectMap(evaluated.classes, (scope) => {
      return ["paint." + scope.name, scope]
    });

    // TODO ensure layer has a source and type

    // TODO remove this _.objectCompact call -- some falsey values are important.
    var output = _.objectCompact(_.extend(
      {
        id: this.name || _.uniqueId('scope'),
        layers: layers,
        paint: paintProperties,
        layout: layoutProperties
      },
      metaProperties,
      classes
    ));

    stack.scope.pop();

    return output;
  }

}

export = Scope
