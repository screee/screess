import LiteralExpression = require("../expressions/LiteralExpression")
import Scope  = require('../Scope');
import assert = require("assert");
import Values = require("../Values");
import ValuesDefinition = require("../ValuesDefinition");
import Stack = require("../Stack");
import _ = require("../utilities");

class PropertyMacro {

  public scope:Scope;
  public argLengthMin:number;
  public argLengthMax:number;

  constructor(public parentScope:Scope, public name:string, public argDefinition:ValuesDefinition, public body:Function = null) {
    var _Scope = require("../Scope")
    this.scope = new _Scope(this.parentScope)

    this.argLengthMin = _.count(
      this.argDefinition.definitions,
      (argDefinition) => { return !argDefinition.expression }
    )
    this.argLengthMax = this.argDefinition.length;
  }

  getScope(values:Values, stack:Stack):Scope {
    var scope = new Scope(this.scope, null, this.scope.statements)
    var args = values.evaluate(this.argDefinition, stack);
    scope.addLiteralValueMacros(args)
    return scope
  }

  matches(name:string, argValues:Values):boolean {
    return name == this.name && argValues.matches(this.argDefinition)
  }

}

export = PropertyMacro