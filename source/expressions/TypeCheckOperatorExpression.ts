import Expression = require("./Expression");
import AttributeReferenceValue = require("../values/AttributeReferenceValue");
import assert = require("assert");
import Scope = require("../scopes/Scope");
import Options = require("../Options");
import _ = require("../utilities");

class TypeCheckExpression extends Expression {

  constructor(public type:Expression) { super() }

  evaluateFilter(scope:Scope, options:Options) {
    return ["==", "$type", this.type.evaluate(scope, options)]
  }
}

export = TypeCheckExpression
