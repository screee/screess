import Expression = require("./Expression");
import AttributeReferenceValue = require("../values/AttributeReferenceValue");
import assert = require("assert");
var _ = require("../utilities");

class TypeCheckExpression extends Expression {

  constructor(public type) { super() }

  toMGLFilter(scope, options) {
    return ["==", "$type", this.type.toMGLValue(scope, options)]
  }
}

export = TypeCheckExpression
