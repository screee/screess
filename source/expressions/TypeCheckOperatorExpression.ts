import Expression = require("./Expression");
import AttributeReferenceValue = require("../values/AttributeReferenceValue");
import assert = require("assert");
import Scope = require("../Scope");
import Stack = require("../Stack");
import _ = require("../utilities");
import SourceLocation = require("../SourceLocation");

class TypeCheckExpression extends Expression {

  constructor(public type:Expression, location:SourceLocation) {
    super(location)
  }

  evaluateToIntermediate(scope:Scope, stack:Stack):any {
    return ["==", "$type", this.type.evaluate(scope, stack)];
  }
}

export = TypeCheckExpression
