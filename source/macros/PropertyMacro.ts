import LiteralExpression = require("../expressions/LiteralExpression")
import Scope  = require('../scopes/Scope');
import assert = require("assert");
import Values = require("../Values");
import ValuesDefinition = require("../ValuesDefinition");
import Stack = require("../Stack");
import _ = require("../utilities");

class PropertyMacro {

  public scope;
  public argLengthMin:number;
  public argLengthMax:number;

  constructor(public parentScope:Scope, public name:string, public argDefinition:ValuesDefinition, public body:Function = null) {
    var ClassScope = require("../scopes/ClassScope")
    this.scope = new ClassScope(this.parentScope)

    this.argLengthMin = _.count(
      this.argDefinition.definitions,
      (argDefinition) => { return !argDefinition.expression }
    )
    this.argLengthMax = this.argDefinition.length;
  }

  evaluate(argValues:Values, stack:Stack) {
    var args = argValues.evaluate(this.argDefinition, stack)

    var scope = new Scope(this.scope)
    scope.addLiteralValueMacros(args)

    stack.scope.push(scope)
    var values = _.extend(
      scope.evaluateProperties(stack, this.scope.properties),
      this.body ? this.body.apply({}, argValues) : null
    )
    stack.scope.pop()
    return values
  }

  matches(name:string, argValues:Values):boolean {
    return name == this.name && argValues.matches(this.argDefinition)
  }

}

export = PropertyMacro