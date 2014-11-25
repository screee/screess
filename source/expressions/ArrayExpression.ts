import Expression = require("./Expression");
import LiteralExpression = require("./LiteralExpression");
import Scope = require("../scopes/Scope");
import Stack = require("../Stack");

import _ = require("../utilities");

class ArrayExpression extends Expression {

  constructor(public expressions:Expression[]) {
    super()
  }

  toValues(scope:Scope, stack:Stack):any[] {
    var value = _.flatten(_.map(this.expressions, (expression) => {
      return expression.toValues(scope, stack)
    }));

    return [value];
  }

}

export = ArrayExpression;
