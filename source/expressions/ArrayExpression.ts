import Expression = require("./Expression");
import LiteralExpression = require("./LiteralExpression");
import Scope = require("../Scope");
import Stack = require("../Stack");

import _ = require("../utilities");

class ArrayExpression extends Expression {

  constructor(public expressions:Expression[]) {
    super()
  }

  toValues(scope:Scope, stack:Stack):any[] {
    var values = []

    for (var i in this.expressions) {
      var expression = this.expressions[i]
      var expressionValues = expression.toValues(scope, stack)
      values = values.concat(expressionValues)
    }

    return [values];
  }

}

export = ArrayExpression;
