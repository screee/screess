import Expression = require("./Expression");
import Scope = require("../Scope");
import Stack = require("../Stack");
import _ = require("../utilities");

class NullCoalescingExpression extends Expression {

  constructor(public headExpression:Expression, public tailExpression:Expression) { super(); }

  evaluateToIntermediate(scope:Scope, stack:Stack):any {
    var headValue = this.headExpression.evaluate(scope, stack);
    if (headValue == null) {
      return this.tailExpression.evaluateToIntermediate(scope, stack);
    } else {
      return headValue;
    }
  }

}

export = NullCoalescingExpression;

