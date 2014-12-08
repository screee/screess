import Expression = require("./Expression");
import assert = require("assert");
import AttributeReferenceValue = require("../values/AttributeReferenceValue");
import Value = require('../values/Value');
import _ = require("../utilities");

class ComparisonOperatorExpression extends Expression {

  private static operators:{[operator:string]: (left:any, right:any) => boolean} = {
    "==": (left, right) => { return left == right; },
    ">=": (left, right) => { return left >= right; },
    "<=": (left, right) => { return left <= right; },
    "<":  (left, right) => { return left <  right; },
    ">":  (left, right) => { return left >  right; },
    "!=": (left, right) => { return left != right; }
  }

  private static operatorInverses = {
    "==": "==",
    ">=": "<=",
    "<=": ">=",
    "<":  ">",
    ">":  "<",
    "!=": "!="
  }

  constructor(public left, public operator, public right) { super() }

  evaluateToIntermediates(scope, stack):any[] {
    var left = this.left.evaluateToIntermediate(scope, stack)
    var right = this.right.evaluateToIntermediate(scope, stack)
    var operator = this.operator

    if (right instanceof AttributeReferenceValue) {
      var temp = left
      left = right
      right = temp
      operator = ComparisonOperatorExpression.operatorInverses[operator]
    }

    if (left instanceof AttributeReferenceValue) {
      assert(!(right instanceof AttributeReferenceValue))
      // TODO create a FilterValue class that will evaluate this later.
      return [[operator, left.name, Value.evaluate(right, stack)]]
    } else {
      return [ComparisonOperatorExpression.operators[operator](left, right)]
    }
  }

}

export = ComparisonOperatorExpression