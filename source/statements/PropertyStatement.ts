import Stack = require('../Stack');
import Scope = require("../Scope");
import Statement = require("./Statement");
import assert = require("assert");
import ExpressionSet = require("../ExpressionSet");
import Value = require("../values/Value");
import _ = require("../utilities");

class PropertyStatement extends Statement {

  constructor(public name:string, public expressions:ExpressionSet) {
    super();
    assert(expressions instanceof ExpressionSet);
  }

  evaluateValueToIntermediate(scope:Scope, stack:Stack) {
    var values = this.expressions.toValueSet(scope, stack);
    if (values.length != 1 || values.positional.length != 1) {
      throw new Error("Cannot apply " + values.length + " args to primitive property " + this.name)
    }

    return values.positional[0];
  }

  evaluate(scope:Scope, stack:Stack, layers, classes, properties) {
    var values = this.expressions.toValueSet(scope, stack);
    if (values.length != 1 || values.positional.length != 1) {
      throw new Error("Cannot apply " + values.length + " args to primitive property " + this.name)
    }

    properties[this.name] = Value.evaluate(this.evaluateValueToIntermediate(scope, stack));
  }

  eachPrimitiveStatement(scope:Scope, stack:Stack, callback:(scope:Scope, statement:Statement) => void):void {
    callback(scope, this);
  }
}

export = PropertyStatement
