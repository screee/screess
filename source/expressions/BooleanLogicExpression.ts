import AttributeReferenceValue = require("../values/AttributeReferenceValue");
import assert = require("assert");
import Expression = require("./Expression");
import Scope = require("../scopes/Scope");
import Options = require("../Options");
var _ = require("../utilities");

class BooleanLogicExpression extends Expression {

  private static operators = {
    "||": "any",
    "&&": "all"
  };

  constructor(public operator:string, public expressions:Expression[]) {
    super();
  }

  toMGLFilter(scope:Scope, options:Options):any[] {

    options.pushFilter();

    var filter = [BooleanLogicExpression.operators[this.operator]].concat(
      _.map(
        this.expressions,
        (expression) => { return expression.toMGLFilter(scope, options) }
      )
    )

    options.popFilter();

    return filter;
  }

}

export = BooleanLogicExpression