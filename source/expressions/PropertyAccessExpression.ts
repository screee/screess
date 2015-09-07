import Expression = require("./Expression");
import Scope = require("../Scope");
import Stack = require("../Stack");
import assert = require('assert');
import _ = require("underscore");
import ScopeValue = require('../values/ScopeValue');

class PropertyAccessExpression extends Expression {

  constructor(public baseExpression:Expression, public propertyExpression:Expression) {
    super()
    assert(this.baseExpression instanceof Expression);
    assert(this.propertyExpression instanceof Expression);
  }

  evaluateToIntermediate(scope:Scope, stack:Stack):any {
    var base = this.baseExpression.evaluateToIntermediate(scope, stack);
    var property = this.propertyExpression.evaluateToIntermediate(scope, stack);

    if (base instanceof ScopeValue) {
      base = base.toObject();
    }

    assert(_.isString(property) || _.isNumber(property), "Property is of invalid type (" + property + ")");

    return base[property];
  }

}

export = PropertyAccessExpression;
