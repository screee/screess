import Stack = require('../Stack');
import Scope = require("../Scope");
import Statement = require("./Statement");
import assert = require("assert");
import Expression = require("../expressions/Expression");
import _ = require("../utilities");

class LoopStatement extends Statement {
  constructor(
      scope:Scope,
      public body:Scope,
      public valueIdentifier:string,
      public keyIdentifier:string,
      public collectionExpression:Expression
  ) { super(scope) }

  eachPrimitiveStatement(scope:Scope, stack:Stack, callback:(scope:Scope, statement:Statement) => void):void {
    assert(scope == this.scope);

    var collection = this.collectionExpression.evaluateToIntermediate(this, stack);
    assert(_.isArray(collection) || _.isObject(collection))

    for (var key in collection) {
      var value = collection[key];
      this.body.addLiteralValueMacro(this.valueIdentifier, value);
      if (this.keyIdentifier) { this.body.addLiteralValueMacro(this.keyIdentifier, key); }
      this.body.eachPrimitiveStatement(stack, callback)
    }

  }
}

export = LoopStatement;