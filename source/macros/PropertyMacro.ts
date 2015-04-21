import LiteralExpression = require("../expressions/LiteralExpression")
import Scope  = require('../Scope');
import assert = require("assert");
import ValueSet = require("../ValueSet");
import ValueSetDefinition = require("../ValueSetDefinition");
import Stack = require("../Stack");
import _ = require("../utilities");

class PropertyMacro {

  public scope:Scope;
  public argLengthMin:number;
  public argLengthMax:number;

  constructor(public parentScope:Scope, public name:string, public argDefinition:ValueSetDefinition, public body:(values:ValueSet, scope:Scope, stack:Stack) => void = null) {
    var _Scope = require("../Scope")
    this.scope = new _Scope(this.parentScope)

    this.argLengthMin = _.count(
      this.argDefinition.definitions,
      (argDefinition) => { return !argDefinition.expression }
    )
    this.argLengthMax = this.argDefinition.length;
  }

  getScope(values:ValueSet, stack:Stack):Scope {
    var scope = new Scope(this.scope, null, this.scope.statements)
    var args = values.toObject(this.argDefinition, stack);
    scope.addLiteralValueMacros(args)
    return scope
  }

  matches(name:string, argValues:ValueSet):boolean {
    return name == this.name && argValues.matches(this.argDefinition)
  }

}

export = PropertyMacro