import Expression = require("./Expression");
import Scope = require("../Scope");
import Stack = require("../Stack");

class TernaryExpression extends Expression {

  constructor(public conditionExpression:Expression, public trueExpression:Expression, public falseExpression:Expression) { super(); }

  evaluateToIntermediates(scope:Scope, stack:Stack):any[] {
    var conditionValue = this.conditionExpression.evaluate(scope, stack);

    if (conditionValue === true) {
      return this.trueExpression.evaluateToIntermediates(scope, stack)
    } else if (conditionValue === false) {
      return this.falseExpression.evaluateToIntermediates(scope, stack);
    } else {
      throw new Error("Compile-time condition could not be resolved.")
    }
  }

}

export = TernaryExpression;

