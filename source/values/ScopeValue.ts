import Value = require("./Value");
import Scope = require("../Scope");
import Stack = require("../Stack");
import _ = require("../utilities");
import assert = require("assert");
import Statement = require("../statements/Statement");
import PropertyStatement = require("../statements/PropertyStatement");


class ScopeValue extends Value {

  constructor(public scope:Scope) { super(); }

  evaluate():any {
    return this.scope.evaluate(Scope.Type.OBJECT);
  }

  // TODO this is ugly
  toObject(stack:Stack = new Stack()) {
    stack.scope.push(this.scope);
    var output = {};
    this.scope.eachPrimitiveStatement(stack, (scope: Scope, statement: Statement) => {
      if (statement instanceof PropertyStatement) {
        output[statement.name] = statement.evaluateValueToIntermediate(scope, stack);
      }
    });
    stack.scope.pop();
    return output;
  }
}

export = ScopeValue;
