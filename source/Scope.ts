import Value = require("./values/value")
import Values = require("./Values")
import ValuesDefinition = require('./ValuesDefinition')
import assert = require("assert")
import LiteralExpression = require('./expressions/LiteralExpression')
import Stack = require('./Stack')
import Expression = require('./expressions/Expression');
import ValueMacro = require('./macros/ValueMacro');
import PropertyMacro = require('./macros/PropertyMacro');
import _ = require("./utilities")
import MapboxGLStyleSpec = require('./MapboxGLStyleSpec')
import Stylesheet = require('./Stylesheet');
import Statement = require('./Statement');
var Globals = require('./globals');

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

  addSource(source:{}):string {
    return this.stylesheet.addSource(source);
  }

  addProperty(name:string, expressions:Expression[]):void {
    // TODO check for duplicate properties
    assert(name != null);
    this.statements.push(new Statement.PropertyStatement(name, expressions));
  }

  addClass(name:string):Scope {
    // TODO ensure class scopes are merged properly
    var scope = new Scope(this, name)
    this.statements.push(new Statement.ClassStatement(name, scope));
    return scope;
  }

  addLayer(name?:string):Scope {
    // TODO check for duplicate layer scopes
    var scope = new Scope(this, name)
    this.statements.push(new Statement.LayerStatement(name, scope));
    return scope;
  }

  addLoop(valueIdentifier:string, keyIdentifier:string, collectionExpression:Expression):Scope {
    var scope = new Scope(this);
    this.statements.push(new Statement.LoopStatement(
      scope,
      valueIdentifier,
      keyIdentifier,
      collectionExpression
    ))
    return scope;
  }

  addIf(expression:Expression):Scope {
    var scope = new Scope(this);
    this.statements.push(new Statement.IfStatement(expression, scope));
    return scope;
  }

  addElseIf(expression:Expression):Scope {
    var scope = new Scope(this);
    this.statements.push(new Statement.ElseIfStatement(expression, scope));
    return scope;
  }

  addElse():Scope {
    var scope = new Scope(this);
    this.statements.push(new Statement.ElseStatement(scope));
    return scope;
  }

  //////////////////////////////////////////////////////////////////////////////
  // Macro Construction

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
    var ValueMacro_ = require("./macros/ValueMacro");
    var macro = new ValueMacro_(name, argDefinition, this, body);

    return this.valueMacros.unshift(macro);
  }

  addPropertyMacro(name:string, argDefinition:ValuesDefinition, body:ValuesDefinition):Scope {
    var PropertyMacro = require("./macros/PropertyMacro");
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
      var ValueMacro_ = require("./macros/ValueMacro");
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
  eachPrimitiveStatement(stack:Stack, callback:(scope:Scope, statement:Statement) => void): void {
    var statements = this.statements;

    for (var i=0; i < statements.length; i++) {
      var statement = statements[i];

      if (statement instanceof Statement.LoopStatement) {
        var loopStatement = <Statement.LoopStatement> statement;

        var scope = loopStatement.scope;
        var collectionExpression = loopStatement.collectionExpression;
        var valueIdentifier = loopStatement.valueIdentifier;
        var keyIdentifier = loopStatement.keyIdentifier;

        var collection = collectionExpression.evaluateToIntermediate(this, stack);
        assert(_.isArray(collection) || _.isObject(collection))

        for (var key in collection) {
          var value = collection[key];
          scope.addLiteralValueMacro(valueIdentifier, value);
          if (keyIdentifier) { scope.addLiteralValueMacro(keyIdentifier, key); }
          scope.eachPrimitiveStatement(stack, callback)
        }

      } else if (statement instanceof Statement.IfStatement) {
        var ifStatement = <Statement.IfStatement> statement;

        if (ifStatement.expression.evaluateToIntermediate(this, stack)) {
          ifStatement.scope.eachPrimitiveStatement(stack, callback);
          continue;
        }

        var flag = false;
        while (statements[i + 1] instanceof Statement.ElseIfStatement) {
          var elseIfStatement = <Statement.ElseIfStatement> statements[++i];

          if (elseIfStatement.expression.evaluateToIntermediate(this, stack)) {
            elseIfStatement.scope.eachPrimitiveStatement(stack, callback)
            flag = true
            break
          }
        }

        if (!flag && statements[i + 1] instanceof Statement.ElseStatement) {
          var elseStatement = <Statement.ElseStatement> statements[++i];
          elseStatement.scope.eachPrimitiveStatement(stack, callback)
        }

      } else if (statement instanceof Statement.PropertyStatement) {
        var propertyStatement = <Statement.PropertyStatement> statement;
        var values = new Values(propertyStatement.expressions, this, stack);

        var macro;
        if (macro = this.getPropertyMacro(propertyStatement.name, values, stack)) {
          stack.propertyMacro.push(macro);
          macro.getScope(values, stack).eachPrimitiveStatement(stack, callback);
          stack.propertyMacro.pop()
        } else {
          callback(this, statement);
        }

      } else {
        callback(this, statement);
      }
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  // Evaluation

  evaluate(type:Scope.Type, stack:Stack):{} {
    stack.scope.push(this)

    var layers = [];
    var classes = [];
    var properties = {};

    this.eachPrimitiveStatement(stack, (scope, statement) => {
      if (statement instanceof Statement.LayerStatement) {
        var layerStatement = <Statement.LayerStatement> statement;

        layers.push(layerStatement.scope.evaluate(Scope.Type.LAYER, stack));

      } else if (statement instanceof Statement.ClassStatement) {
        var classStatement = <Statement.ClassStatement> statement;
        classes.push(classStatement.scope.evaluate(Scope.Type.CLASS, stack))

      } else if (statement instanceof Statement.PropertyStatement) {
        var propertyStatement = <Statement.PropertyStatement> statement;

        var values = new Values(propertyStatement.expressions, scope, stack);
        if (values.length != 1 || values.positional.length != 1) {
          throw new Error("Cannot apply " + values.length + " args to primitive property " + name)
        }

        properties[propertyStatement.name] = Value.evaluate(values.positional[0], stack);
      }
    });

    layers = _.sortBy(layers, 'z-index');
    if (layers.length == 0) { layers = undefined }

    var output = this.formatScope[type](stack, properties, layers, classes);
    stack.scope.pop();

    return output;
  }

  private formatScope:{[type:number]: (stack:Stack, properties:{}, layers:Scope[], classes:Scope[]) => {}} = {

    0: (stack:Stack, properties:{}, layers:Scope[], classes:Scope[]):any => {
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
    },

    1: (stack:Stack, properties:{}, layers:Scope[], _classes:Scope[]):any => {
      var metaProperties = { 'z-index': 0 };
      var paintProperties = {};
      var layoutProperties = {};

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

      var classes = _.objectMap(_classes, (scope) => {
        return ["paint." + scope.name, scope]
      });

      // TODO ensure layer has a source and type

      // TODO remove this _.objectCompact call -- some falsey values are important.
      return _.objectCompact(_.extend(
        {
          id: this.name || _.uniqueId('scope'),
          layers: layers,
          paint: paintProperties,
          layout: layoutProperties
        },
        metaProperties,
        classes
      ));
    },

    2: (stack:Stack, properties:{}, layers:Scope[], classes:Scope[]):any => {
      // TODO assert there are no child layers or classes
      // TODO ensure all properties are paint properties, not layout properties

      return properties;
    }

  }

}

module Scope {
  export enum Type { GLOBAL, LAYER, CLASS }
}

export = Scope
