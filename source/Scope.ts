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
import Statement = require('./statements/Statement');
import FS = require("fs");
import getPropertyType = require("./getPropertyType");
import PropertyType = require("./PropertyType");
var Parser = require("./parser");

class Scope {

  private static coreLibrary:Scope = null;

  static getCoreLibrary():Scope {
    if (!this.coreLibrary) {
      this.coreLibrary = Parser.parse(FS.readFileSync(__dirname + "/../core.sss", "utf8"));
    }
    return this.coreLibrary;
  }

  static createGlobal():Scope {
    var scope = new Scope()

    scope.addPropertyMacro("include", ValueSetDefinition.WILDCARD, null, (macro:PropertyMacro, values:ValueSet, stack:Stack, callback:(scope:Scope, statement:Statement) => void) => {
      macro.parentScope.includeFile(values.positional[0], stack, callback);
    });

    return scope;
  }

  public sources:{};
  public version:number;
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

  includeFile(filename:string, stack:Stack, callback:(scope:Scope, statement:Statement) => void) {
    this.includeScope(Parser.parse(FS.readFileSync(filename, "utf8")), stack, callback);
  }

  includeScope(scope:Scope, stack:Stack, callback:(scope:Scope, statement:Statement) => void) {
    scope.eachPrimitiveStatement(stack, callback);
    this.valueMacros = scope.valueMacros.concat(this.valueMacros);
    this.propertyMacros = scope.propertyMacros.concat(this.propertyMacros);
  }

  //////////////////////////////////////////////////////////////////////////////
  // Construction

  // TODO this belongs somewhere else, semantically. Maybe on the Stack object, renamed to "context"?
  addSource(source:{}):string {
    var hash = _.hash(JSON.stringify(source)).toString();
    this.getGlobalScope().sources[hash] = source;
    return hash;
  }

  addStatement(statement:Statement) {
    this.statements.push(statement);
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
    this.valueMacros.unshift(macro);
  }

  addPropertyMacro(name:string, argDefinition:ValueSetDefinition, bodyScope:Scope = null, bodyFunction:(macro:PropertyMacro, values:ValueSet, stack:Stack, callback:(scope:Scope, statement:Statement) => void) => void = null):void {
    var PropertyMacro = require("./macros/PropertyMacro");
    var macro = new PropertyMacro(this, name, argDefinition, bodyScope, bodyFunction);
    this.propertyMacros.unshift(macro);
  }

  //////////////////////////////////////////////////////////////////////////////
  // Evaluation Helpers

  getValueMacro(name:string, values:ValueSet, stack:Stack):ValueMacro {
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


    return _.objectMap(names, (name) => {
      var that = this;
      return [name, function() {
        var args = ValueSet.fromPositionalValues(_.toArray(arguments));
        var macro = that.getValueMacro(name, args, stack);
        if (!macro) return null;
        else return macro.evaluateToIntermediate(args, stack);
      }];
    });

  }

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
  eachPrimitiveStatement(stack:Stack, callback:(scope:Scope, statement:Statement) => void): void {
    var statements = this.statements;
    assert(stack != null);

    for (var i=0; i < statements.length; i++) {
      statements[i].eachPrimitiveStatement(this, stack, callback);
    }
  }

  // TODO actually do a seperate pass over each primitive statement to extract this
  getVersion():number {
    return this.getGlobalScope().version || 7;
  }

  //////////////////////////////////////////////////////////////////////////////
  // Evaluation

  // Move these into individual files
  evaluate(type:Scope.Type = Scope.Type.GLOBAL, stack:Stack = new Stack()):{} {
    stack.scope.push(this);

    var layers = [];
    var classes = [];
    var properties = {};

    if (type == Scope.Type.GLOBAL) {
      this.version = parseInt(properties["version"], 10) || 7;

      this.includeScope(Scope.getCoreLibrary(), stack, (scope: Scope, statement: Statement) => {
        statement.evaluate(scope, stack, layers, classes, properties);
      });
    }

    this.eachPrimitiveStatement(stack, (scope: Scope, statement: Statement) => {
      statement.evaluate(scope, stack, layers, classes, properties);
    });

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

      var version = this.getVersion();

      for (var name in properties) {
        var value = Value.evaluate(properties[name]);

        if (name == 'z-index') {
          metaProperties['z-index'] = value;

        } else if (name == "source-tile-size") {
          source["tileSize"] = value;

        } else if (_.startsWith(name, "source-") && name != "source-layer") {
          source[name.substr("source-".length)] = value;

        } else if (getPropertyType(version, name) == PropertyType.PAINT) {
          paintProperties[name] = value;

        } else if (getPropertyType(version, name) == PropertyType.LAYOUT) {
          layoutProperties[name] = value;

        } else if (getPropertyType(version, name) == PropertyType.META) {
          metaProperties[name] = value;

        } else {
          assert(false, "Property name '" + name + "' is unknown");
        }
      }

      if (!_.isEmpty(source)) {
        metaProperties["source"] = stack.getGlobalScope().addSource(source);
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

      return _.extend(
        {
          id: this.name || _.uniqueId('scope'),
          layers: layers,
          paint: paintProperties,
          layout: layoutProperties
        },
        metaProperties,
        classes
      );
    },

    // CLASS
    2: (stack:Stack, properties:{}, layers:Scope[], classes:Scope[]):any => {
      assert(layers.length == 0);
      assert(classes.length == 0);

      return properties;
    }

  }

}

module Scope {
  export enum Type { GLOBAL, LAYER, CLASS }
}

export = Scope
