import Stack = require('../Stack');
import Scope = require("../Scope");
import Statement = require("./Statement");
import assert = require("assert");
import ExpressionSet = require("../ExpressionSet");
import Value = require("../values/Value");
import _ = require("../utilities");

class PropertyStatement extends Statement {
  constructor(
    scope:Scope,
    public name:string,
    public expressions:ExpressionSet
  ) { super(scope) }

  evaluate(scope:Scope, stack:Stack, layers, classes, properties) {
    assert(scope == this.scope);
    var values = this.expressions.toValueSet(scope, stack);
    if (values.length != 1 || values.positional.length != 1) {
      throw new Error("Cannot apply " + values.length + " args to primitive property " + this.name)
    }

    properties[this.name] = Value.evaluate(values.positional[0]);
  }

  eachPrimitiveStatement(scope:Scope, stack:Stack, callback:(scope:Scope, statement:Statement) => void):void {
    var values = this.expressions.toValueSet(scope, stack);

    assert(scope == this.scope);

    var macro;
    if (macro = scope.getPropertyMacro(this.name, values, stack)) {
      macro.evaluate(values, stack, callback);
    } else {
      callback(scope, this);
    }

  }
}

export = PropertyStatement