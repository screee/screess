import Expression = require("./Expression");
import assert = require("assert");
import AttributeReferenceValue = require("../values/AttributeReferenceValue");
import Value = require('../values/Value');
import Scope = require("../Scope");
import Stack = require("../Stack");
import _ = require("../utilities");

class SetOperatorExpression extends Expression {

  private static operators = {
    "in": (needle, haystack) => { return _.contains(haystack, needle) },
    "!in": (needle, haystack) => { return !_.contains(haystack, needle) }
  }

  constructor(public needle:Expression, public operator:string, public haystack:Expression) { super() }

  evaluateToIntermediate(scope:Scope, stack:Stack):any {
    var needle = this.needle.evaluateToIntermediate(scope, stack);
    var haystack = this.haystack.evaluateToIntermediate(scope, stack);
    var operator = this.operator;

    haystack = Value.evaluate(haystack);
    assert(haystack instanceof Array);

    if (needle instanceof AttributeReferenceValue) {
      return [operator, needle.name].concat(haystack);
    } else {
      return SetOperatorExpression.operators[operator](needle, haystack)
    }

  }
}

export = SetOperatorExpression;