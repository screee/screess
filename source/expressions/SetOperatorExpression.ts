import Expression = require("./Expression");
import assert = require("assert");
import AttributeReferenceValue = require("../values/AttributeReferenceValue");
import Value = require('../values/Value');
var _ = require("../utilities");

class SetOperatorExpression extends Expression {

  constructor(public left, public operator, public right) { super() }

  toMGLFilter(scope, options) {
    var lvalue = this.left.toValue(scope, options);
    // TODO allow for multiple rvalues
    var rvalue = this.right.toValue(scope, options);

    assert(lvalue instanceof AttributeReferenceValue);
    assert(rvalue instanceof Array);

    return [this.operator, lvalue.name].concat(Value.toMGLValue(rvalue, options))
  }

}

export = SetOperatorExpression;