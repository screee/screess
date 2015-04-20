import Expression = require("./Expression");
import Scope = require("../Scope");
import Stack = require("../Stack");
import assert = require('assert')
import _ = require("../utilities");

// TODO merge this class with DotExpression
class SubscriptExpression extends Expression {

  constructor(public baseExpression:Expression, public propertyExpression:Expression) {
    super()
  }

  evaluateToIntermediate(scope:Scope, stack:Stack):any {
    var base = this.baseExpression.evaluateToIntermediate(scope, stack);
    var property = this.propertyExpression.evaluateToIntermediate(scope, stack);
    assert(_.isString(property) || _.isNumber(property));

    assert(base[property] !== undefined);
    return base[property];
  }

}

export = SubscriptExpression;
