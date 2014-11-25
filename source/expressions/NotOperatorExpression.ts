import Expression = require("./Expression");
import assert = require("assert");
import _ = require("../utilities");
import Scope = require("../scopes/Scope");
import Context = require("../Context");

class SetOperatorExpression extends Expression {

  constructor(public expression:Expression) { super(); }

  evaluateFilter(scope:Scope, context:Context):any[] {
    return ["none", this.expression.evaluateFilter(scope, context)];
  }

}

export = SetOperatorExpression;

