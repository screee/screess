/// <reference path="../../definitions/index.d.ts" />

var AttributeReferenceValue = require("../values/AttributeReferenceValue");
var _ = require("../utilities");
import assert = require("assert");
import Expression = require("./Expression");

class BooleanLogicExpression extends Expression {

  private static operators = {
    "||": "any",
    "&&": "all"
  };

  constructor(public operator, public expressions) {
    super();
  }

  toMGLFilter(scope, options) {

    options.pushFilter();

    var filter = [BooleanLogicExpression.operators[this.operator]].concat(
      _.map(
        this.expressions,
        (expression) => { return expression.toMGLFilter(scope, options) }
      )
    )

    options.popFilter();

    return filter;
  }

}

export = BooleanLogicExpression