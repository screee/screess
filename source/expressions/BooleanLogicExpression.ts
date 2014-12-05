import AttributeReferenceValue = require("../values/AttributeReferenceValue");
import assert = require("assert");
import Expression = require("./Expression");
import Scope = require("../Scope");
import Stack = require("../Stack");
import _ = require("../utilities");

class BooleanLogicExpression extends Expression {

  private static operators = {
    "||": "any",
    "&&": "all"
  };

  constructor(public operator:string, public expressions:Expression[]) {
    super();
  }

  toValues(scope:Scope, stack:Stack):any[] {
    var filter = [BooleanLogicExpression.operators[this.operator]].concat(
      _.map(
        this.expressions,
        (expression) => { return expression.evaluate(scope, stack) }
      )
    )

    return [filter];
  }

}

export = BooleanLogicExpression