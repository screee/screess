import Expression = require("./Expression");
import LiteralExpression = require("./LiteralExpression");
import Scope = require("../scopes/Scope");
import Options = require("../Options");

import _ = require("../utilities");

class ArrayExpression extends Expression {

  constructor(public expressions:Expression[]) {
    super()
  }

  toValues(scope:Scope, options:Options):any[] {
    var value = _.flatten(_.map(this.expressions, (expression) => {
      return expression.toValues(scope, options)
    }));

    return [value];
  }

}

export = ArrayExpression;
