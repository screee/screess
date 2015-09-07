import FS = require("fs");
import Path = require("path");
import assert = require("assert")

import _ = require("./utilities")
import ValueSet = require("./ValueSet")
import ValueSetDefinition = require('./ValueSetDefinition')
import LiteralExpression = require('./expressions/LiteralExpression')
import Stack = require('./Stack')
import Expression = require('./expressions/Expression');
import ValueMacro = require('./macros/ValueMacro');
import PropertyMacro = require('./macros/PropertyMacro');
import Statement = require('./statements/Statement');
import ValueMacroDefinitionStatement = require('./statements/ValueMacroDefinitionStatement');
import PropertyMacroDefinitionStatement = require('./statements/PropertyMacroDefinitionStatement');
import evaluateGlobalScope = require('./scopes/global');
import evaluateLayerScope = require('./scopes/layer');
import evaluateClassScope = require('./scopes/class');
import evaluateObjectScope = require('./scopes/object');
var Parser = require("./parser");

type PropertyMacroBodyFunction = (macro:PropertyMacro, values:ValueSet, stack:Stack, callback:(scope:Scope, statement:Statement) => void) => void

class Scope {

  private static coreLibrary:Scope = null;

  static getCoreLibrary():Scope {
    if (!this.coreLibrary) {
      // TODO use path.join
      this.coreLibrary = Parser.parse(FS.readFileSync(Path.join(__dirname, "../core.sss"), "utf8"));
    }
    return this.coreLibrary;
  }

  static createGlobal():Scope {
    var scope = new Scope(null)
    scope.name = "[global]";

    scope.addPropertyMacro("include", ValueSetDefinition.WILDCARD, (macro:PropertyMacro, values:ValueSet, stack:Stack, callback:(scope:Scope, statement:Statement) => void) => {
      macro.parentScope.includeFile(values.positional[0], stack, callback);
    });

    return scope;
  }

  public sources:{};
  public version:number;
  public valueMacros:ValueMacro[];
  public propertyMacros:PropertyMacro[];
  public statements:Statement[] = []
  public name:string = null

  constructor(public parent:Scope) {
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

    if (statement instanceof ValueMacroDefinitionStatement) {
      this.addValueMacro(statement.name, statement.argDefinition, statement.body);
    } else if (statement instanceof PropertyMacroDefinitionStatement) {
      this.addPropertyMacro(statement.name, statement.argDefinition, statement.body);
    }
  }

  addStatements(statements:Statement[]) {
    for (var i = 0; i < statements.length; i++) {
      this.addStatement(statements[i]);
    }
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

  addValueMacro(name:String, argDefinition:ValueSetDefinition, body:Function|Expression) {
    var ValueMacro_ = require("./macros/ValueMacro");
    var macro = new ValueMacro_(this, name, argDefinition, body);
    this.valueMacros.unshift(macro);
  }

  addPropertyMacro(name:string, argDefinition:ValueSetDefinition, body:Scope|PropertyMacroBodyFunction):void {
    var PropertyMacro_ = require("./macros/PropertyMacro");
    var macro = new PropertyMacro_(this, name, argDefinition, body);
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

    for (var i = 0; i < statements.length; i++) {
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

    var evaluator;
    if (type == Scope.Type.GLOBAL) {
      evaluator = evaluateGlobalScope;
    } else if (type == Scope.Type.LAYER) {
      evaluator = evaluateLayerScope;
    } else if (type == Scope.Type.CLASS) {
      evaluator = evaluateClassScope;
    } else if (type == Scope.Type.OBJECT) {
      evaluator = evaluateObjectScope;
    } else {
      assert(false);
    }

    var output = evaluator.call(this, stack, properties, layers, classes)

    stack.scope.pop();

    return output;
  }

}

module Scope {
  export enum Type { GLOBAL, LAYER, CLASS, OBJECT }
}

export = Scope
