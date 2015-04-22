import Stack = require('./Stack')
import Scope = require("./Scope")
import Expression = require("./expressions/Expression")
import ExpressionSet = require("./ExpressionSet")
import assert = require("assert");
import _ = require("./utilities");
import Value = require("./values/value");

class Statement {

  eachPrimitiveStatement(stack:Stack, callback:(scope:Scope, statement:Statement) => void):void {
    assert(false, "abstract method");
  }

  evaluate(scope:Scope, stack:Stack, layers, classes, properties) {
    assert(false, "abstract method");
  }

}

module Statement {

  export class LoopStatement extends Statement {
    constructor(
        public scope:Scope,
        public valueIdentifier:string,
        public keyIdentifier:string,
        public collectionExpression:Expression
    ) { super() }

    eachPrimitiveStatement(stack:Stack, callback:(scope:Scope, statement:Statement) => void):void {

      var collection = this.collectionExpression.evaluateToIntermediate(this, stack);
      assert(_.isArray(collection) || _.isObject(collection))

      for (var key in collection) {
        var value = collection[key];
        this.scope.addLiteralValueMacro(this.valueIdentifier, value);
        if (this.keyIdentifier) { this.scope.addLiteralValueMacro(this.keyIdentifier, key); }
        this.scope.eachPrimitiveStatement(stack, callback)
      }

    }
  }

  export class LayerStatement extends Statement {
    constructor(
        public name:string,
        public scope:Scope
    ) { super() }

    evaluate(scope:Scope, stack:Stack, layers, classes, properties) {
      layers.push(this.scope.evaluate(Scope.Type.LAYER, stack));
    }
  }

  export class ClassStatement extends Statement {
    constructor(
        public name:string,
        public scope:Scope
    ) { super() }

    evaluate(scope:Scope, stack:Stack, layers, classes, properties) {
      classes.push(this.scope.evaluate(Scope.Type.CLASS, stack));
    }
  }

  export class PropertyStatement extends Statement {
    constructor(
      public name:string,
      public expressions:ExpressionSet
    ) { super() }

    evaluate(scope:Scope, stack:Stack, layers, classes, properties) {
      var values = this.expressions.toValueSet(scope, stack);
      if (values.length != 1 || values.positional.length != 1) {
        throw new Error("Cannot apply " + values.length + " args to primitive property " + this.name)
      }

      properties[this.name] = Value.evaluate(values.positional[0]);
    }
  }

  export class IfStatement extends Statement {
    constructor(
      public expression:Expression,
      public scope:Scope
    ) { super() }
  }

  export class ElseIfStatement extends Statement {
    constructor(
      public expression:Expression,
      public scope:Scope
    ) { super() }
  }

  export class ElseStatement extends Statement {
    constructor(
      public scope:Scope
    ) { super() }
  }

}

export = Statement