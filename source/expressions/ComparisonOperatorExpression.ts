import Expression = require("./Expression");
import assert = require("assert");
import AttributeReferenceValue = require("../values/AttributeReferenceValue");
import Value = require('../values/Value');
import _ = require("../utilities");

class ComparisonOperatorExpression extends Expression {

  constructor(public left, public operator, public right) { super() }

  evaluateFilter(scope, context):any[] {
    var lvalue = this.left.toValue(scope, context)
    var rvalue = this.right.toValue(scope, context)

    // Only one of the values can be an AttributeReferenceValue and it must be
    // the lvalue
    assert(lvalue instanceof AttributeReferenceValue)
    assert(!(rvalue instanceof AttributeReferenceValue))

    return [this.operator, lvalue.name, Value.evaluate(rvalue, context)]
  }

}

export = ComparisonOperatorExpression