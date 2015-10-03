import Expression = require("./Expression");
import Scope = require("../Scope");
import Stack = require("../Stack");
import SourceLocation = require("../SourceLocation");

class TernaryExpression extends Expression {

  constructor(public conditionExpression:Expression, public trueExpression:Expression, public falseExpression:Expression, location:SourceLocation) {
    super(location);
  }

  evaluateToIntermediate(scope:Scope, stack:Stack):any {
    var conditionValue = this.conditionExpression.evaluate(scope, stack);

    if (conditionValue === true) {
      return this.trueExpression.evaluateToIntermediate(scope, stack)
    } else if (conditionValue === false) {
      return this.falseExpression.evaluateToIntermediate(scope, stack);
    } else {
      throw new Error("Compile-time condition could not be resolved.")
    }
  }

}

export = TernaryExpression;
