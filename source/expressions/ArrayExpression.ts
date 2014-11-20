import Expression = require("./Expression");
import LiteralExpression = require("./LiteralExpression");
var _ = require("../utilities");

class ArrayExpression extends Expression {

  constructor(public expressions) {
    super()
  }

  toValues(scope, options) {
    var value = _.flatten(_.map(this.expressions, (expression) => {
      return expression.toValues(scope, options)
    }));

    return [value];
  }

}

export = ArrayExpression;
