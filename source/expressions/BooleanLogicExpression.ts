import AttributeReferenceValue = require("../values/AttributeReferenceValue");
import assert = require("assert");
import Expression = require("./Expression");
import Scope = require("../scopes/Scope");
import Context = require("../Context");
import _ = require("../utilities");

class BooleanLogicExpression extends Expression {

  private static operators = {
    "||": "any",
    "&&": "all"
  };

  constructor(public operator:string, public expressions:Expression[]) {
    super();
  }

  evaluateFilter(scope:Scope, context:Context):any[] {

    context.pushFilter();

    var filter = [BooleanLogicExpression.operators[this.operator]].concat(
      _.map(
        this.expressions,
        (expression) => { return expression.evaluateFilter(scope, context) }
      )
    )

    context.popFilter();

    return filter;
  }

}

export = BooleanLogicExpression