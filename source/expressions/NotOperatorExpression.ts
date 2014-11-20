import Expression = require("./Expression");
var _ = require("../utilities");
import assert = require("assert");

class SetOperatorExpression extends Expression {

  constructor(public expression) { super(); }

  toMGLFilter(scope, options) {
    return ["none", this.expression.toMGLFilter(scope, options)];
  }

}

export = SetOperatorExpression;

