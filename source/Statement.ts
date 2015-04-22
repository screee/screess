import Stack = require('./Stack')
import Scope = require("./Scope")
import Expression = require("./expressions/Expression")
import ExpressionSet = require("./ExpressionSet")
import assert = require("assert");
import _ = require("./utilities");
import Value = require("./values/value");

// TODO put each statement class in its own file
// TODO always pass a scope at statment construction time, don't pass into methods after that
class Statement {

  constructor(public scope:Scope) {}

  eachPrimitiveStatement(scope:Scope, stack:Stack, callback:(scope:Scope, statement:Statement) => void):void {
    assert(false, "abstract method");
  }

  evaluate(scope:Scope, stack:Stack, layers, classes, properties) {
    assert(false, "abstract method");
  }

}

module Statement {

  export class LoopStatement extends Statement {
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

  export class LayerStatement extends Statement {
    constructor(
        scope:Scope,
        public name:string,
        public body:Scope
    ) {
      super(scope);
       // TODO deprecate names on scopes in general
      this.body.name = name;
    }

    evaluate(scope:Scope, stack:Stack, layers, classes, properties) {
      assert(scope == this.scope);
      layers.push(this.body.evaluate(Scope.Type.LAYER, stack));
    }
  }

  export class ClassStatement extends Statement {
    constructor(
        scope:Scope,
        public name:string,
        public body:Scope
    ) { super(scope) }

    evaluate(scope:Scope, stack:Stack, layers, classes, properties) {
      assert(scope == this.scope);
      classes.push(this.body.evaluate(Scope.Type.CLASS, stack));
    }
  }

  export class PropertyStatement extends Statement {
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

  export class ConditionalStatement extends Statement {

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

}

export = Statement