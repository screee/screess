import FS = require("fs");
import Path = require("path");
import assert = require("assert")

import _ = require("./utilities")
import ValueSet = require("./ValueSet")
import ValueSetDefinition = require('./ValueSetDefinition')
import LiteralExpression = require('./expressions/LiteralExpression')
import Stack = require('./Stack')
import Expression = require('./expressions/Expression');
import Macro = require('./Macro');
import Statement = require('./statements/Statement');
import MacroDefinitionStatement = require('./statements/MacroDefinitionStatement');
import PropertyStatement = require('./statements/PropertyStatement');
import evaluateGlobalScope = require('./scopes/global');
import evaluateLayerScope = require('./scopes/layer');
import evaluateClassScope = require('./scopes/class');
import evaluateObjectScope = require('./scopes/object');
var Parser = require("./parser");

class Scope {

  private static coreLibrary:Scope = null;

  static createFromFile(file) {
    return Parser.parse(FS.readFileSync(file, "utf8"));
  }

  static getCoreLibrary():Scope {
    if (!this.coreLibrary) {
      this.coreLibrary = this.createFromFile(Path.join(__dirname, "../core.sss"));
    }
    return this.coreLibrary;
  }

  static createGlobal():Scope {
    var globalScope = new Scope(null)
    globalScope.name = "[global]";

    globalScope.addMacro("include", ValueSetDefinition.WILDCARD, (args:{}, stack:Stack) => {
      var file:string = args['arguments']['positional'][0];
      var ScopeValue = require('./values/ScopeValue');
      var includeeScope:Scope = Scope.createFromFile(file);

      var includerScope = stack.getScope();

      includerScope.macros = includeeScope.macros.concat(includerScope.macros);
      return new ScopeValue(includeeScope);
    });

    return globalScope;
  }

  public sources:{} = {};
  public version:number;
  public macros:Macro[] = [];
  public statements:Statement[] = [];
  public name:string = null;

  constructor(public parent:Scope) {}

  clone(parent:Scope = this.parent):Scope {
    var that = new Scope(parent);
    that.macros = _.clone(this.macros);
    that.sources = _.clone(this.sources);
    that.statements = _.clone(this.statements);
    that.name = _.clone(this.name);
    that.version = this.version;
    return that;
  }

  isGlobalScope():boolean {
    return !this.parent
  }

  getGlobalScope():Scope {
    return this.isGlobalScope() ? this : this.parent.getGlobalScope();
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

    if (statement instanceof MacroDefinitionStatement) {
      this.addMacro(statement.name, statement.argDefinition, statement.body);
    }
  }

  addStatements(statements:Statement[]) {
    for (var i = 0; i < statements.length; i++) {
      this.addStatement(statements[i]);
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  // Macro Construction

  addLiteralMacros(macros:{[name:string]:any}):void {
    for (var identifier in macros) {
      var value = macros[identifier];
      this.addLiteralMacro(identifier, value);
    }
  }

  addLiteralMacro(identifier:string, value:any) {
    this.addMacro(identifier, ValueSetDefinition.ZERO, new LiteralExpression(value));
  }

  addMacro(name:String, argDefinition:ValueSetDefinition, body:Function|Expression) {
    var Macro_ = require("./macros/Macro");
    var macro = new Macro_(this, name, argDefinition, body);
    this.macros.unshift(macro);
  }

  //////////////////////////////////////////////////////////////////////////////
  // Evaluation Helpers

  getMacro(name:string, values:ValueSet, stack:Stack):Macro {
    for (var i in this.macros) {
      var macro = this.macros[i];

      if (macro.matches(name, values) && !_.contains(stack.macros, macro)) {
        return macro;
      }
    }

    if (this.parent) {
      return this.parent.getMacro(name, values, stack);
    } else {
      return null;
    }
  }

  eachMacro(callback:(macro:Macro) => void):void {
    for (var i in this.macros) {
      callback(this.macros[i]);
    }
    if (this.parent) this.parent.eachMacro(callback);
  }

  getMacrosAsFunctions(stack:Stack):{[name:string]:any} {
    var names = [];
    this.eachMacro((macro: Macro) => { names.push(macro.name); });
    names = _.uniq(names);

    return _.objectMap(names, (name) => {
      var that = this;
      return [name, function() {
        var args = ValueSet.fromPositionalValues(_.toArray(arguments));
        var macro = that.getMacro(name, args, stack);
        if (!macro) return null;
        else return macro.evaluateToIntermediate(args, stack);
      }];
    });

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

  // TODO factor out Mapbox specific stuff into macros?
  evaluate(type:Scope.Type = Scope.Type.GLOBAL, stack:Stack = new Stack()):{} {
    stack.scope.push(this);

    var layers = [];
    var classes = [];
    var properties = {};

    if (type == Scope.Type.GLOBAL) {
      this.version = parseInt(properties["version"], 10) || 7;

      this.macros = this.macros.concat(Scope.getCoreLibrary().macros);
    }

    this.eachPrimitiveStatement(stack, (scope: Scope, statement: Statement) => {
      statement.evaluate(scope, stack, layers, classes, properties);
    });

    layers = _.sortBy(layers, 'z-index');

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
