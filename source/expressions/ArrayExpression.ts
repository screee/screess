import Expression = require("./Expression");
import LiteralExpression = require("./LiteralExpression");
import Scope = require("../Scope");
import Stack = require("../Stack");
import _ = require("../utilities");
import SourceLocation = require("../SourceLocation");

class ArrayExpression extends Expression {

  constructor(public expressions:Expression[], location:SourceLocation) {
    super(location);
  }

  evaluateToIntermediate(scope:Scope, stack:Stack):any {
    return _.map(this.expressions, function(expression: Expression): any {
      return expression.evaluateToIntermediate(scope, stack);
    });
  }

}

export = ArrayExpression;
