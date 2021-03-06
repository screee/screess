import Stack = require('../Stack');
import Scope = require("../Scope");
import Statement = require("./Statement");
import assert = require("assert");
import Expression = require("../expressions/Expression");
import _ = require("../utilities");
import ScopeValue = require('../values/ScopeValue');

class LoopStatement extends Statement {
  constructor(
      public body:Scope,
      public valueIdentifier:string,
      public keyIdentifier:string,
      public collectionExpression:Expression
  ) { super(); }

  eachPrimitiveStatement(scope:Scope, stack:Stack, callback:(scope:Scope, statement:Statement) => void):void {
    var collection = this.collectionExpression.evaluateToIntermediate(scope, stack);
    if (collection instanceof ScopeValue) { collection = collection.toObject(stack); }
    assert(_.isArray(collection) || _.isObject(collection))

    for (var key in collection) {
      var value = collection[key];
      this.body.addLiteralMacro(this.valueIdentifier, value);
      if (this.keyIdentifier) { this.body.addLiteralMacro(this.keyIdentifier, key); }
      this.body.eachPrimitiveStatement(stack, callback)
    }

  }
}

export = LoopStatement;
