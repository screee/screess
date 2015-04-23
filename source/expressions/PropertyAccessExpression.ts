import Expression = require("./Expression");
import Scope = require("../Scope");
import Stack = require("../Stack");
import assert = require('assert');
import _ = require("underscore");

class PropertyAccessExpression extends Expression {

  constructor(public baseExpression:Expression, public propertyExpression:Expression) {
    super()
    assert(this.baseExpression instanceof Expression)
    assert(this.propertyExpression instanceof Expression)
  }

  evaluateToIntermediate(scope:Scope, stack:Stack):any {
    var base = this.baseExpression.evaluateToIntermediate(scope, stack);
    var property = this.propertyExpression.evaluateToIntermediate(scope, stack);

    assert(_.isString(property) || _.isNumber(property));
    assert(base[property] !== undefined);

    return base[property];
  }

}

export = PropertyAccessExpression;
