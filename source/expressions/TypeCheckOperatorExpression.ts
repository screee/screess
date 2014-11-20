import Expression = require("./Expression");
var AttributeReferenceValue = require("../values/AttributeReferenceValue");
var _ = require("../utilities");
import assert = require("assert");

class TypeCheckExpression extends Expression {

  constructor(public type) { super() }

  toMGLFilter(scope, options) {
    return ["==", "$type", this.type.toMGLValue(scope, options)]
  }
}

export = TypeCheckExpression
