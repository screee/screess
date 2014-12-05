import Expression = require("./Expression");
import assert = require("assert");
import _ = require("../utilities");
import Scope = require("../Scope");
import Stack = require("../Stack");

class SetOperatorExpression extends Expression {

  constructor(public expression:Expression) { super(); }

  toValues(scope:Scope, stack:Stack):any[] {
    return [["none", this.expression.evaluate(scope, stack)]];
  }

}

export = SetOperatorExpression;

