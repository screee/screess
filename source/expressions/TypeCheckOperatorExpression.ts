import Expression = require("./Expression");
import AttributeReferenceValue = require("../values/AttributeReferenceValue");
import assert = require("assert");
import Scope = require("../scopes/Scope");
import Context = require("../Context");
import _ = require("../utilities");

class TypeCheckExpression extends Expression {

  constructor(public type:Expression) { super() }

  evaluateFilter(scope:Scope, context:Context) {
    return ["==", "$type", this.type.evaluate(scope, context)]
  }
}

export = TypeCheckExpression
