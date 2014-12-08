import AttributeReferenceValue = require("../values/AttributeReferenceValue");
import assert = require("assert");
import Expression = require("./Expression");
import Scope = require("../Scope");
import Stack = require("../Stack");
import _ = require("../utilities");

function isFalse(value:any):boolean { return value === false }
function isTrue(value:any):boolean { return value === true }

class BooleanLogicExpression extends Expression {

  private static operators = {
    "||": "any",
    "&&": "all"
  };

  constructor(public operator:string, public expressions:Expression[]) {
    super();
  }

  evaluateToIntermediates(scope:Scope, stack:Stack):any[] {
    var operator = BooleanLogicExpression.operators[this.operator];

    var values:any[] = _.map(
      this.expressions,
      (expression) => { return expression.evaluate(scope, stack) }
    )

    console.log("TEST", operator, values)

    if (operator == "any") {
      if (_.all(values, isFalse)) { return [false] }
      values = _.reject(values, isFalse)
      if (values.length === 0) { return [true] }
      else if (_.any(values, isTrue)) { return [true] }

    } else if (operator == "all") {
      if (_.all(values, isTrue)) { return [true] }
      values = _.reject(values, isTrue)
      if (values.length === 0) { return [true] }
      else if (_.any(values, isFalse)) { return [false] }

    } else {
      assert(false)
    }

    return [[operator].concat(values)]
  }

}

export = BooleanLogicExpression