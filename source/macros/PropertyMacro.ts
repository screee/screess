import LiteralExpression = require("../expressions/LiteralExpression")
import Scope  = require('../Scope');
import assert = require("assert");
import ValueSet = require("../ValueSet");
import ValueSetDefinition = require("../ValueSetDefinition");
import Stack = require("../Stack");
import _ = require("../utilities");
import Statement = require("../statements/Statement");

class PropertyMacro {

  public scope:Scope;
  public argLengthMin:number;
  public argLengthMax:number;

  constructor(public parentScope:Scope, public name:string, public argDefinition:ValueSetDefinition, public bodyScope:Scope = null, public bodyFunction:(macro:PropertyMacro, values:ValueSet, stack:Stack, callback:(scope:Scope, statement:Statement) => void) => void = null) {
    this.argLengthMin = _.count(
      this.argDefinition.definitions,
      (argDefinition) => { return !argDefinition.expression }
    )
    this.argLengthMax = this.argDefinition.length;

    if (!this.bodyScope) this.bodyScope = new Scope(this.parentScope);
  }

  matches(name:string, argValues:ValueSet):boolean {
    return name == this.name && argValues.matches(this.argDefinition)
  }

  evaluate(values:ValueSet, stack:Stack, callback:(scope:Scope, statement:Statement) => void):void {
    stack.propertyMacro.push(this);
    var args = values.toObject(this.argDefinition, stack);
    this.bodyScope.addLiteralValueMacros(args)
    this.bodyScope.eachPrimitiveStatement(stack, callback);
    if (this.bodyFunction) this.bodyFunction(this, values, stack, callback);
    stack.propertyMacro.pop();
  }

}

export = PropertyMacro