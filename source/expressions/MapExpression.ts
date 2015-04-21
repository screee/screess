import Expression = require("./Expression");
import ExpressionSet = require("../ExpressionSet");
import LiteralExpression = require("./LiteralExpression");
import Scope = require("../Scope");
import Stack = require("../Stack");
import assert = require("assert");
import _ = require("../utilities");

class MapExpression extends Expression {

  constructor(public expressions:ExpressionSet) {
    super();
    assert(expressions.isNamed());
  }

  evaluateToIntermediate(scope:Scope, stack:Stack):any {
    var output = _.objectMap(this.expressions.items, (item) => {
      return [item.name, item.expression.evaluateToIntermediate(scope, stack)]
    });

    return output;
  }

}

export = MapExpression;
