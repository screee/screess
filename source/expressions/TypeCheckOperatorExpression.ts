import Expression = require("./Expression");
import AttributeReferenceValue = require("../values/AttributeReferenceValue");
import assert = require("assert");
import Scope = require("../Scope");
import Stack = require("../Stack");
import _ = require("../utilities");

class TypeCheckExpression extends Expression {

  constructor(public type:Expression) { super() }

  toValues(scope:Scope, stack:Stack) {
    return [["==", "$type", this.type.evaluate(scope, stack)]]
  }
}

export = TypeCheckExpression
