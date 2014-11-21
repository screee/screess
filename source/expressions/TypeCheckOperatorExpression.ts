import Expression = require("./Expression");
import AttributeReferenceValue = require("../values/AttributeReferenceValue");
import assert = require("assert");
import Scope = require("../scopes/Scope");
import Options = require("../Options");
import _ = require("../utilities");

class TypeCheckExpression extends Expression {

  constructor(public type:Expression) { super() }

  toMGLFilter(scope:Scope, options:Options) {
    return ["==", "$type", this.type.toMGLValue(scope, options)]
  }
}

export = TypeCheckExpression
