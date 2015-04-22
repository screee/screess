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
        public scope:Scope,
        public valueIdentifier:string,
        public keyIdentifier:string,
        public collectionExpression:Expression
    ) { super() }

    eachPrimitiveStatement(scope:Scope, stack:Stack, callback:(scope:Scope, statement:Statement) => void):void {

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

    eachPrimitiveStatement(scope:Scope, stack:Stack, callback:(scope:Scope, statement:Statement) => void):void {
      var values = this.expressions.toValueSet(scope, stack);

      var macro;
      if (macro = scope.getPropertyMacro(this.name, values, stack)) {
        stack.propertyMacro.push(macro);
        // Property macros may have primitive statements and/or a body function
        macro.getScope(values, stack).eachPrimitiveStatement(stack, callback);
        if (macro.body) macro.body(values, callback, scope, stack);
        stack.propertyMacro.pop();
      } else {
        callback(scope, this);
      }
    }
  }

  export class ConditionalStatement extends Statement {

    // TODO only accept a condition, true statement, and false statement; chain for "else if"
    constructor(public items:{condition:Expression; scope:Scope;}[]) { super(); }

    eachPrimitiveStatement(scope:Scope, stack:Stack, callback:(scope:Scope, statement:Statement) => void):void {
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