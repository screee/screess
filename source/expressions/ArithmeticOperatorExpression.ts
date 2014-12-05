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

  evaluateToIntermediates(scope:Scope, stack:Stack):any[] {
    var left = this.left.evaluateToIntermediate(scope, stack);
    var right = this.right.evaluateToIntermediate(scope, stack);

    function apply(left:number, operator:string, right:number):number {
      if (operator == '+') { return left + right }
      else if (operator == '-') { return left - right }
      else if (operator == '*') { return left * right }
      else if (operator == '/') { return left / right }
    }

    if (_.isNumber(left) && _.isNumber(right)) {
      return [apply(left, this.operator, right)];

    } else if (_.isNumber(left) && right instanceof FunctionValue) {
      var base = right.base
      var stops = <[number, number][]> _.map(right.stops, (value) => {
        return [value[0], apply(left, this.operator, value[1])]
      })
      return [ new FunctionValue(base, stops) ]

    } else if (left instanceof FunctionValue && _.isNumber(right)) {
      var base = left.base
      var stops = <[number, number][]> _.map(left.stops, (value) => {
        return [value[0], apply(value[1], this.operator, right)]
      })
      return [ new FunctionValue(base, stops) ]

    } else {
      assert(false);
    }

  }

}

export = ArithmeticOperatorExpression