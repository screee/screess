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

interface Statement {
  type:StatementType;
  loop?:Loop;
  scope?:Scope;
  name?:string;
  expressions?:Expression[];
}

class Scope {

  // TODO move to a global class
  public sources:{[name:string]: any};

  public valueMacros:ValueMacro[];
  public propertyMacros:PropertyMacro[];

  private statements:Statement[];

  constructor(public parent:Scope, public name:string = null) {
    this.valueMacros = [];
    this.propertyMacros = [];
    this.sources = {};

    this.statements = [];

    if (this.parent == null) {
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

  addSource(source:{}):string {
    if (this.isGlobal()) {
      var hash = _.hash(JSON.stringify(source)).toString();
      this.sources[hash] = source;
      return hash;
    } else {
      return this.parent.addSource(source);
    }
  }

  getGlobalScope():Scope {
    return this.isGlobal() ? this : this.parent.getGlobalScope();
  }

  getSource(name:string):any {
    return this.isGlobal() ? this.getSource(name) : this.parent.getSource(name);
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

    // TODO create super parent class that returns null for everything to
    // avoid this.
    return this.parent ? this.parent.getPropertyMacro(name, values, stack) : null;
  }

  evaluateProperties(stack:Stack, statements:Statement[] = this.statements):any {
    var output = {}

    for (var i = 0; i < statements.length; i++) {
      var statement = statements[i];

      if (statement.type == StatementType.PROPERTY) {
        var name = statement.name;
        var expressions = statement.expressions;

        // TODO refactor Values constructor to accept this
        var values = new Values(
          _.map(expressions, (expression) => { return { expression: expression } }),
          this,
          stack
        );

        var propertyMacro;
        if (propertyMacro = this.getPropertyMacro(name, values, stack)) {
          stack.propertyMacro.push(propertyMacro);
          _.extend(output, propertyMacro.evaluate(values, stack));
          stack.propertyMacro.pop()
        } else {
          if (values.length != 1 || values.positional.length != 1) {
            console.log(values)
            throw new Error("Cannot apply " + values.length + " args to primitive property " + name)
          }

          output[name] = Value.evaluate(values.positional[0], stack);
        }

      } else if (statement.type == StatementType.IF) {

        if (statement.expressions[0].toValue(this, stack)) {
          _.extend(output, statement.scope.evaluateProperties(stack));

        } else if (statements[i+1] && statements[i+1].type == StatementType.ELSE_IF && statements[i+1].expressions[0].toValue(this, stack)) {
          var statement = statements[++i];
          _.extend(output, statement.scope.evaluateProperties(stack));

        } else if (statements[i + 1] && statements[i + 1].type == StatementType.ELSE) {
          var statement = statements[++i];
          _.extend(output, statement.scope.evaluateProperties(stack));
        }

      }
    }

    return output
  }

  evaluateGlobalScope(stack:Stack = new Stack()):any {
    stack.scope.push(this)

    var layers = this.evaluateLayers(stack);
    var properties = this.evaluateProperties(stack)

    var sources = _.objectMapValues(this.sources, (source, name) => {
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

  evaluateClassScope(stack:Stack):any {
    // TODO assert there are no child layers or classes
    stack.scope.push(this);
    this.evaluateProperties(stack);
    stack.scope.pop();
  }

  evaluateClassPaintProperties(type:string, stack:Stack):{} {
    // TODO ensure all properties are paint properties, not layout properties
    var classStatements = _.filter(this.statements, (statement) => {
      return statement.type == StatementType.CLASS;
    });

    return _.objectMap(classStatements, (statement, name) => {
      return [
        "paint." + name,
        statement.scope.evaluateClassScope(stack)
      ]
    })
  }

  evaluateLayerScope(stack:Stack):any {
    stack.scope.push(this);

    var properties = this.evaluateProperties(stack);

    var metaProperties = { 'z-index': 0 };
    var paintProperties = {};
    var layoutProperties = {};

    var layers = this.evaluateLayers(stack);
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
      this.evaluateClassPaintProperties(type, stack)
    ));

    stack.scope.pop();

    return output;
  }

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

  eachLoopScope(loop:Loop, stack:Stack, callback:(Scope) => void):void {
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
      callback(scope);
    }
  }

  evaluateLayers(stack:Stack):{}[] {
    var layers = [];

    for (var i in this.statements) {
      var statement = this.statements[i];

      if (statement.type == StatementType.LAYER) {
        layers.push(statement.scope.evaluateLayerScope(stack));

      } else if (statement.type == StatementType.LOOP) {
        this.eachLoopScope(statement.loop, stack, (scope) => {
          layers = layers.concat(scope.evaluateLayers(stack));
        })
      }
    }

    // We are relying on the behavior that the original ordering is preserved
    // for layers with the same z-index
    layers = _.sortBy(layers, 'z-index')
    // for (var i in layers) {
    //   var layer = layers[i];
    //   delete layer['z-index']
    // }

    return layers.length ? layers : undefined;
  }

}

export = Scope
