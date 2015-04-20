import assert = require("assert");
import Expression = require("./Expression");
import Scope = require("../Scope");
import Stack = require("../Stack");
import FunctionValue = require("../values/FunctionValue")
import _ = require("../utilities");

class ArithmeticOperatorExpression extends Expression {

  constructor(public left:Expression, public operator:string, public right:Expression) {
    super();
  }

  evaluateToIntermediate(scope:Scope, stack:Stack):any {
    var left = this.left.evaluateToIntermediate(scope, stack);
    var right = this.right.evaluateToIntermediate(scope, stack);

    function apply(left:number, operator:string, right:number):number {
      if (operator == '+') { return left + right }
      else if (operator == '-') { return left - right }
      else if (operator == '*') { return left * right }
      else if (operator == '/') { return left / right }
    }

    if (_.isNumber(left) && _.isNumber(right)) {
      return apply(left, this.operator, right);

    } else if (_.isNumber(left) && right instanceof FunctionValue) {
      return new FunctionValue(right.base, <[number, number][]> _.map(right.stops, (value) => {
        return [value[0], apply(left, this.operator, value[1])]
      }));

    } else if (left instanceof FunctionValue && _.isNumber(right)) {
      return new FunctionValue(left.base, <[number, number][]> _.map(left.stops, (value) => {
        return [value[0], apply(value[1], this.operator, right)]
      }));

    } else {
      assert(false);
    }

  }

}

export = ArithmeticOperatorExpression