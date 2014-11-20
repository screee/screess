import Expression = require("./Expression");
import assert = require("assert");
var _ = require("../utilities");

class SetOperatorExpression extends Expression {

  constructor(public expression) { super(); }

  toMGLFilter(scope, options) {
    return ["none", this.expression.toMGLFilter(scope, options)];
  }

}

export = SetOperatorExpression;

