import Value = require("./values/value")
import ValueSet = require("./ValueSet")
import ValueSetDefinition = require('./ValueSetDefinition')
import assert = require("assert")
import LiteralExpression = require('./expressions/LiteralExpression')
import Stack = require('./Stack')
import Expression = require('./expressions/Expression');
import ExpressionSet = require('./ExpressionSet');
import ValueMacro = require('./macros/ValueMacro');
import PropertyMacro = require('./macros/PropertyMacro');
import _ = require("./utilities")
import Statement = require('./Statement');
import FS = require("fs");
var Parser = require("./parser");
var Globals = require('./globals');
var MBGLStyleSpec = require('mapbox-gl-style-spec');

class Scope {

  static createGlobal():Scope {
    var scope = new Scope()

    var include = (values:ValueSet, callback:(scope:Scope, statement:Statement) => void, scope:Scope, stack:Stack) => {
      scope.include(values.positional[0], callback, scope, stack);
    }

    scope.addPropertyMacro("include", ValueSetDefinition.WILDCARD, include);

    return scope;
  }

  public sources:{};
  public valueMacros:ValueMacro[];
  public propertyMacros:PropertyMacro[];

  constructor(
      public parent:Scope = null,
      public name:string = null,
      public statements:Statement[] = []
  ) {
    this.valueMacros = [];
    this.propertyMacros = [];
    this.sources = {};
  }

  isGlobal():boolean {
    return !this.parent
  }

  getGlobalScope():Scope {
    return this.isGlobal() ? this : this.parent.getGlobalScope();
  }

  include(filename:string, callback:(scope:Scope, statement:Statement) => void, scope:Scope, stack:Stack) {
    var scopeIncluded = Parser.parse(FS.readFileSync(filename, "utf8"));
    scopeIncluded.eachPrimitiveStatement(stack, callback);
    this.valueMacros = scopeIncluded.valueMacros.concat(this.valueMacros);
    this.propertyMacros = scopeIncluded.propertyMacros.concat(this.propertyMacros);
  }

  //////////////////////////////////////////////////////////////////////////////
  // Construction

  addSource(source:{}):string {
    var hash = _.hash(JSON.stringify(source)).toString();
    this.getGlobalScope().sources[hash] = source;
    return hash;
  }

  addProperty(name:string, expressions:ExpressionSet):void {
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

  addLiteralValueMacros(macros:{[name:string]:any}):void {
    for (var identifier in macros) {
      var value = macros[identifier];
      this.addLiteralValueMacro(identifier, value);
    }
  }

  addLiteralValueMacro(identifier:string, value:any) {
    this.addValueMacro(identifier, ValueSetDefinition.ZERO, new LiteralExpression(value));
  }

  addValueMacro(name:String, argDefinition:ValueSetDefinition, body:Function);
  addValueMacro(name:String, argDefinition:ValueSetDefinition, body:Expression);
  addValueMacro(name:String, argDefinition:ValueSetDefinition, body:any) {
    var ValueMacro_ = require("./macros/ValueMacro");
    var macro = new ValueMacro_(name, argDefinition, this, body);

    return this.valueMacros.unshift(macro);
  }

  addPropertyMacro(name:string, argDefinition:ValueSetDefinition, body:(values:ValueSet, callback:(scope:Scope, statement:Statement) => void, scope:Scope, stack:Stack) => void):Scope {
    var PropertyMacro = require("./macros/PropertyMacro");
    var macro = new PropertyMacro(this, name, argDefinition, body)
    this.propertyMacros.unshift(macro)

    return macro.scope
  }

  //////////////////////////////////////////////////////////////////////////////
  // Evaluation Helpers

  getValueMacro(name:string, values:ValueSet, stack:Stack):ValueMacro {
    // TODO refactor to use eachValueMacro
    for (var i in this.valueMacros) {
      var macro = this.valueMacros[i];
      if (macro.matches(name, values) && !_.contains(stack.valueMacro, macro)) {
        return macro;
      }
    }

    if (this.parent) {
      return this.parent.getValueMacro(name, values, stack);
    } else {
      return null;
    }
  }

  eachValueMacro(callback:(macro:ValueMacro) => void):void {
    for (var i in this.valueMacros) {
      callback(this.valueMacros[i]);
    }
    if (this.parent) this.parent.eachValueMacro(callback);
  }

  getValueMacrosAsFunctions(stack:Stack):{[name:string]:any} {
    var names = [];
    this.eachValueMacro((macro: ValueMacro) => { names.push(macro.name); });
    names = _.uniq(names);

    var scope = this;

    return _.objectMap(names, (name) => {
      return [name, function() {
        var args = ValueSet.fromPositionalValues(_.toArray(arguments));
        var macro = scope.getValueMacro(name, args, stack);
        if (!macro) return null;
        else return macro.evaluateToIntermediate(args, stack);
      }];
    });

  }

  // TODO write eachPropertyMacro
  getPropertyMacro(name:string, values:ValueSet, stack:Stack):PropertyMacro {
    for (var i in this.propertyMacros) {
      var macro = this.propertyMacros[i];
      if (macro.matches(name, values) && !_.contains(stack.propertyMacro, macro)) {
        return macro;
      }
    }

    return this.parent ? this.parent.getPropertyMacro(name, values, stack) : null;
  }

  // Properties, layers, classes
  // TODO refactor into statement classes?
  eachPrimitiveStatement(stack:Stack, callback:(scope:Scope, statement:Statement) => void): void {
    var statements = this.statements;
    assert(stack != null);

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

        var values = propertyStatement.expressions.toValueSet(this, stack);

        var macro;
        if (macro = this.getPropertyMacro(propertyStatement.name, values, stack)) {
          stack.propertyMacro.push(macro);
          // Property macros may have primitive statements and/or a body function
          macro.getScope(values, stack).eachPrimitiveStatement(stack, callback);
          if (macro.body) macro.body(values, callback, this, stack);
          stack.propertyMacro.pop();
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

  evaluate(type:Scope.Type = Scope.Type.GLOBAL, stack:Stack = new Stack()):{} {
    stack.scope.push(this);

    var layers = [];
    var classes = [];
    var properties = {};

    var evaluatePrimitiveStatement = (scope:Scope, statement:Statement) => {
      if (statement instanceof Statement.LayerStatement) {
        var layerStatement = <Statement.LayerStatement> statement;

        layers.push(layerStatement.scope.evaluate(Scope.Type.LAYER, stack));

      } else if (statement instanceof Statement.ClassStatement) {
        var classStatement = <Statement.ClassStatement> statement;
        classes.push(classStatement.scope.evaluate(Scope.Type.CLASS, stack))

      } else if (statement instanceof Statement.PropertyStatement) {
        var propertyStatement = <Statement.PropertyStatement> statement;

        var values = propertyStatement.expressions.toValueSet(scope, stack);
        if (values.length != 1 || values.positional.length != 1) {
          throw new Error("Cannot apply " + values.length + " args to primitive property " + propertyStatement.name)
        }

        properties[propertyStatement.name] = Value.evaluate(values.positional[0]);
      }
    }

    if (type == Scope.Type.GLOBAL) {
      this.include("core.sss", evaluatePrimitiveStatement, this, stack);
    }

    this.eachPrimitiveStatement(stack, evaluatePrimitiveStatement);

    layers = _.sortBy(layers, 'z-index');
    if (layers.length == 0) { layers = undefined }

    var output = this.formatScope[type](stack, properties, layers, classes);
    stack.scope.pop();

    return output;
  }

  private formatScope:{[type:number]: (stack:Stack, properties:{}, layers:Scope[], classes:Scope[]) => {}} = {

    // GLOBAL
    0: (stack:Stack, properties:{}, layers:Scope[], classes:Scope[]):any => {
      var sources = this.sources;

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
          layers: layers,
          sources: sources,
          transition: transition
        }
      )
    },

    // LAYER
    1: (stack:Stack, properties:{}, layers:Scope[], _classes:Scope[]):any => {
      var metaProperties = { 'z-index': 0 };
      var paintProperties = {};
      var layoutProperties = {};
      var source = {};

      var type = properties['type'] || 'raster';

      // TODO actually parse the version from the global scope, don't hardcode 7
      var version = 7;

      for (var name in properties) {
        var value = Value.evaluate(properties[name]);

        // TODO remove scree test props
        if (name == 'z-index') {
          metaProperties['z-index'] = value;

        } else if (name == "source-tile-size") {
          source["tileSize"] = value;

        } else if (_.startsWith(name, "source-")) {
          source[name.substr("source-".length)] = value;

        } else if (getPropertyType(version, Scope.Type.LAYER, name) == PropertyType.PAINT) {
          paintProperties[name] = value;

        } else if (getPropertyType(version, Scope.Type.LAYER, name) == PropertyType.LAYOUT) {
          layoutProperties[name] = value;

        } else if (getPropertyType(version, Scope.Type.LAYER, name) == PropertyType.META) {
          metaProperties[name] = value;

        } else {
          assert(false, "Property name '" + name + "' is unknown");
        }
      }

      metaProperties["source"] = stack.getGlobalScope().addSource(source);

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

    // CLASS
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

enum PropertyType { PAINT, LAYOUT, META }

function getPropertyType(version:number, scopeType: Scope.Type, name: string): PropertyType {
  assert(scopeType == Scope.Type.LAYER);

  if (name == 'scree-test-paint') return PropertyType.PAINT;
  else if (name == 'scree-test-layout') return PropertyType.LAYOUT;
  else if (name == 'scree-test-meta') return PropertyType.META;
  else {
    var spec = MBGLStyleSpec["v" + version];

    for (var i in spec["layout"]) {
      for (var name_ in spec[spec["layout"][i]]) {
        if (name == name_) return PropertyType.LAYOUT;
      }
    }

    for (var i in spec["paint"]) {
      for (var name_ in spec[spec["paint"][i]]) {
        if (name == name_) return PropertyType.PAINT;
      }
    }

    assert(spec["layer"][name]);
    return PropertyType.META;
  }
}

export = Scope
