import Expression = require("./Expression");
import ExpressionSet = require("../ExpressionSet");
import LiteralExpression = require("./LiteralExpression");
import Scope = require("../Scope");
import Stack = require("../Stack");
import assert = require("assert");
import _ = require("../utilities");

class ScopeExpression extends Expression {

  constructor(public body:Scope) {
    super();
  }

  evaluateToIntermediate(scope:Scope, stack:Stack):any {
    return this.body.evaluate(Scope.Type.OBJECT, stack);
  }

}

export = ScopeExpression;
