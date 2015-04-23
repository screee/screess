import Stack = require('../Stack');
import Scope = require("../Scope");
import Statement = require("./Statement");
import assert = require("assert");
import Expression = require("../expressions/Expression");
import _ = require("../utilities");

class ConditionalStatement extends Statement {

  // TODO only accept a condition, true statement, and false statement; chain for "else if"
  constructor(scope:Scope, public items:{condition:Expression; scope:Scope;}[]) {
    super(scope);
  }

  eachPrimitiveStatement(scope:Scope, stack:Stack, callback:(scope:Scope, statement:Statement) => void):void {
    assert(scope == this.scope);
    for (var i in this.items) {
      var item = this.items[i];
      if (item.condition.evaluateToIntermediate(scope, stack)) {
        item.scope.eachPrimitiveStatement(stack, callback);
        break;
      }
    }
  }
}

export = ConditionalStatement;