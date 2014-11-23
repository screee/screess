import LiteralExpression = require("../expressions/LiteralExpression")
import Scope  = require('../scopes/Scope');
import assert = require("assert");
import MacroArgValues = require("./MacroArgValues");
import MacroArgDefinitions = require("./MacroArgDefinitions");
import Options = require("../Options");
import _ = require("../utilities");

class PropertyMacro {

  public scope;
  public argLengthMin:number;
  public argLengthMax:number;

  constructor(public parentScope:Scope, public name:string, public argDefinition:MacroArgDefinitions, public body:Function = null) {
    var ClassScope = require("../scopes/ClassScope")
    this.scope = new ClassScope(this.parentScope)

    this.argLengthMin = _.count(
      this.argDefinition.definitions,
      (argDefinition) => { return !argDefinition.expression }
    )
    this.argLengthMax = this.argDefinition.length;
  }

  evaluateScope(argValues:MacroArgValues, options:Options) {
    var args = argValues.toArguments(this.argDefinition, options)

    var scope = new Scope(this.scope)
    scope.addLiteralValueMacros(args)

    options.scopeStack.push(scope)
    var values = _.extend(
      scope.evaluateProperties(options, this.scope.properties),
      this.body ? this.body.apply({}, argValues) : null
    )
    options.scopeStack.pop()
    return values
  }

  matches(name:string, argValues:MacroArgValues):boolean {
    return name == this.name && argValues.matches(this.argDefinition)
  }

}

export = PropertyMacro