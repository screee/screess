import Stack = require('../Stack');
import Scope = require("../Scope");
import Statement = require("./Statement");
import assert = require("assert");
import Expression = require("../expressions/Expression");
import Value = require("../values/Value");
import _ = require("../utilities");

class PropertyStatement extends Statement {

  constructor(public name:string, public expression:Expression) {
    super();
    assert(expression instanceof Expression);
  }

  evaluateValueToIntermediate(scope:Scope, stack:Stack) {
    return this.expression.evaluateToIntermediate(scope, stack);
  }

  evaluate(scope:Scope, stack:Stack, layers, classes, properties) {
    properties[this.name] = Value.evaluate(this.evaluateValueToIntermediate(scope, stack));
  }

  eachPrimitiveStatement(scope:Scope, stack:Stack, callback:(scope:Scope, statement:Statement) => void):void {
    callback(scope, this);
  }
}

export = PropertyStatement
