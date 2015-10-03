import Expression = require("./Expression");
import assert = require("assert");
import _ = require("../utilities");
import Scope = require("../Scope");
import Stack = require("../Stack");
import SourceLocation = require("../SourceLocation");

class SetOperatorExpression extends Expression {

  constructor(public expression:Expression, location:SourceLocation) {
    super(location);
  }

  evaluateToIntermediate(scope:Scope, stack:Stack):any {
    return ["none", this.expression.evaluate(scope, stack)];
  }

}

export = SetOperatorExpression;
