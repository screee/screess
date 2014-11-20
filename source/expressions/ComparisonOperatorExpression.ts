import Expression = require("./Expression");
var AttributeReferenceValue = require("../values/AttributeReferenceValue");
var _ = require("../utilities");
import assert = require("assert");
var Value = require('../values/Value');

class ComparisonOperatorExpression extends Expression {

  constructor(public left, public operator, public right) { super() }

  toMGLFilter(scope, options) {
    var lvalue = this.left.toValue(scope, options)
    var rvalue = this.right.toValue(scope, options)

    // Only one of the values can be an AttributeReferenceValue and it must be
    // the lvalue
    assert(lvalue instanceof AttributeReferenceValue)
    assert(!(rvalue instanceof AttributeReferenceValue))

    return [this.operator, lvalue.name, Value.toMGLValue(rvalue, options)]
  }

}

export = ComparisonOperatorExpression