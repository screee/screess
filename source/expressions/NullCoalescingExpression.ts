import Expression = require("./Expression");
import Scope = require("../Scope");
import Stack = require("../Stack");
import _ = require('underscore');

class NullCoalescingExpression extends Expression {

  constructor(public headExpression:Expression, public tailExpression:Expression) { super(); }

  evaluateToIntermediates(scope:Scope, stack:Stack):any[] {
    var headValue = this.headExpression.evaluate(scope, stack);
    if (headValue == null) {
      return this.tailExpression.evaluateToIntermediates(scope, stack);
    } else {
      return [headValue];
    }
  }

}

export = NullCoalescingExpression;

