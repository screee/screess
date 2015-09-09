import FS = require("fs");
import Path = require("path");
import assert = require("assert")

import _ = require("./utilities")
import Arguments = require("./Arguments")
import ArgumentsDefinition = require('./ArgumentsDefinition')
import LiteralExpression = require('./expressions/LiteralExpression')
import Stack = require('./Stack')
import Expression = require('./expressions/Expression');
import Macro = require('./Macro');
import Statement = require('./statements/Statement');
import MacroDefinitionStatement = require('./statements/MacroDefinitionStatement');
import PropertyStatement = require('./statements/PropertyStatement');
import formatGlobalScope = require('./scopes/global');
import formatLayerScope = require('./scopes/layer');
import formatClassScope = require('./scopes/class');
import formatObjectScope = require('./scopes/object');
var Parser = require("./parser");

class Scope {

  private static coreLibrary:Scope = null;

  static createFromFile(file) {
    return Parser.parse(FS.readFileSync(file, "utf8"));
  }

  static createCoreLibrary():Scope {
    if (!this.coreLibrary) {
      this.coreLibrary = this.createFromFile(Path.join(__dirname, "../core.sss"));
    }
    return this.coreLibrary;
  }

  static createGlobal():Scope {
    var globalScope = new Scope(null)
    globalScope.name = "[global]";
    return globalScope;
  }

  public sources:{} = {};
  public version:number;
  public macros:Macro[] = [];
  public statements:Statement[] = [];
  public name:string = null;

  constructor(public parent:Scope) {}

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
      this.addMacro(statement.name, statement.argumentsDefinition, statement.body);
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
    this.addMacro(identifier, ArgumentsDefinition.ZERO, new LiteralExpression(value));
  }

  addMacro(name:String, argumentsDefinition:ArgumentsDefinition, body:Function|Expression) {
    var Macro_ = require("./Macro");
    var macro = new Macro_(this, name, argumentsDefinition, body);
    this.macros.unshift(macro);
  }

  //////////////////////////////////////////////////////////////////////////////
  // Evaluation Helpers

  getMacro(name:string, values:Arguments, stack:Stack):Macro {
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
        var args = Arguments.fromPositionalValues(_.toArray(arguments));
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

  evaluate(type:Scope.Type = Scope.Type.GLOBAL, stack:Stack = new Stack()):{} {
    stack.scope.push(this);

    var layers = [];
    var classes = [];
    var properties = {};

    if (type == Scope.Type.GLOBAL) {
      this.version = parseInt(properties["version"], 10) || 7;
      this.macros = this.macros.concat(Scope.createCoreLibrary().macros);
    }

    this.eachPrimitiveStatement(stack, (scope: Scope, statement: Statement) => {
      statement.evaluate(scope, stack, layers, classes, properties);
    });

    layers = _.sortBy(layers, 'z-index');

    var formater;
    if (type == Scope.Type.GLOBAL) {
      formater = formatGlobalScope;
    } else if (type == Scope.Type.LAYER) {
      formater = formatLayerScope;
    } else if (type == Scope.Type.CLASS) {
      formater = formatClassScope;
    } else if (type == Scope.Type.OBJECT) {
      formater = formatObjectScope;
    } else {
      assert(false);
    }

    var output = formater.call(this, stack, properties, layers, classes)

    stack.scope.pop();

    return output;
  }

}

module Scope {
  export enum Type { GLOBAL, LAYER, CLASS, OBJECT }
}

export = Scope
