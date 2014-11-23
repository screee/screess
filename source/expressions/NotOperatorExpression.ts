import Expression = require("./Expression");
import assert = require("assert");
import _ = require("../utilities");
import Scope = require("../scopes/Scope");
import Options = require("../Options");

class SetOperatorExpression extends Expression {

  constructor(public expression:Expression) { super(); }

  evaluateFilter(scope:Scope, options:Options):any[] {
    return ["none", this.expression.evaluateFilter(scope, options)];
  }

}

export = SetOperatorExpression;

