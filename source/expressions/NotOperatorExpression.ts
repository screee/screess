import Expression = require("./Expression");
import assert = require("assert");
import _ = require("../utilities");
import Scope = require("../scopes/Scope");
import Stack = require("../Stack");

class SetOperatorExpression extends Expression {

  constructor(public expression:Expression) { super(); }

  evaluate(scope:Scope, stack:Stack):any[] {
    return ["none", this.expression.evaluate(scope, stack)];
  }

}

export = SetOperatorExpression;

