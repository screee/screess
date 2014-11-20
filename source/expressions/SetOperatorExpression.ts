import Expression = require("./Expression");
import assert = require("assert");
var ArrayValue = require("../values/ArrayValue");
var AttributeReferenceValue = require("../values/AttributeReferenceValue");
var _ = require("../utilities");
var Value = require('../values/Value');

class SetOperatorExpression extends Expression {

  constructor(public left, public operator, public right) { super() }

  toMGLFilter(scope, options) {
    var lvalue = this.left.toValue(scope, options);
    // TODO allow for multiple rvalues
    var rvalue = this.right.toValue(scope, options);

    assert(lvalue instanceof AttributeReferenceValue);
    assert(rvalue instanceof ArrayValue);

    return [this.operator, lvalue.name].concat(Value.toMGLValue(rvalue, options))
  }

}

export = SetOperatorExpression;