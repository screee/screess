import Expression = require("./Expression");
import LiteralExpression = require("./LiteralExpression");
import Scope = require("../scopes/Scope");
import Context = require("../Context");

import _ = require("../utilities");

class ArrayExpression extends Expression {

  constructor(public expressions:Expression[]) {
    super()
  }

  toValues(scope:Scope, context:Context):any[] {
    var value = _.flatten(_.map(this.expressions, (expression) => {
      return expression.toValues(scope, context)
    }));

    return [value];
  }

}

export = ArrayExpression;
