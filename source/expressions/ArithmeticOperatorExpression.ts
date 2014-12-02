import AttributeReferenceValue = require("../values/AttributeReferenceValue");
import assert = require("assert");
import Expression = require("./Expression");
import Scope = require("../scopes/Scope");
import Stack = require("../Stack");
import _ = require("../utilities");

class ArithmeticOperatorExpression extends Expression {

  constructor(public left:Expression, public operator:string, public right:Expression) {
    super();
  }

  toValues(scope:Scope, stack:Stack):any[] {
    var left = this.left.toValue(scope, stack);
    var right = this.right.toValue(scope, stack);

    assert(_.isNumber(left))
    assert(_.isNumber(right))

    var output:Number;
    if (this.operator == '+') {
      output = left + right
    } else if (this.operator == '-') {
      output = left - right
    } else if (this.operator == '*') {
      output = left * right
    } else if (this.operator == '/') {
      output = left / right
    } else if (this.operator == '^') {
      output = Math.pow(left, right)
    }

    return [output];
  }

}

export = ArithmeticOperatorExpression