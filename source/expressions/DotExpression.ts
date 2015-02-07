import Expression = require("./Expression");
import Scope = require("../Scope");
import Stack = require("../Stack");
import assert = require('assert')

// TODO merge this class with SubscriptExpression
class DotExpression extends Expression {

  constructor(public baseExpression:Expression, public property:string) {
    super()
    assert(this.baseExpression instanceof Expression)
  }

  evaluateToIntermediates(scope:Scope, stack:Stack):any[] {
    var base = this.baseExpression.evaluateToIntermediates(scope, stack)[0];
    return [base[this.property]];
  }

}

export = DotExpression;
