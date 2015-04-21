import Expression = require("./Expression");
import LiteralExpression = require("./LiteralExpression");
import Scope = require("../Scope");
import Stack = require("../Stack");
import _ = require("../utilities");
import ExpressionSet = require("../ExpressionSet");

class ArrayExpression extends Expression {

  constructor(public expressions:ExpressionSet) {
    super();
  }

  evaluateToIntermediate(scope:Scope, stack:Stack):any {
    return _.map(this.expressions.toArray(), function(expression: Expression): any {
      return expression.evaluateToIntermediate(scope, stack);
    });
  }

}

export = ArrayExpression;
