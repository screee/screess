import Expression = require("./Expression");
import Scope = require("../scopes/Scope");
import Stack = require("../Stack");
import assert = require('assert')
import _ = require('underscore')

// TODO merge this class with DotExpression
class SubscriptExpression extends Expression {

  constructor(public baseExpression:Expression, public propertyExpression:Expression) {
    super()
  }

  toValues(scope:Scope, stack:Stack):any[] {
    var base = this.baseExpression.toValue(scope, stack);
    var property = this.propertyExpression.toValue(scope, stack);
    assert(_.isString(property) || _.isNumber(property));

    assert(base[property] !== undefined);
    return [base[property]];
  }

}

export = SubscriptExpression;
