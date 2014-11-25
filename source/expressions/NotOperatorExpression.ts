import Expression = require("./Expression");
import assert = require("assert");
import _ = require("../utilities");
import Scope = require("../scopes/Scope");
import Stack = require("../Stack");

class SetOperatorExpression extends Expression {

  constructor(public expression:Expression) { super(); }

  evaluateFilter(scope:Scope, stack:Stack):any[] {
    return ["none", this.expression.evaluateFilter(scope, stack)];
  }

}

export = SetOperatorExpression;

