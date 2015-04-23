import assert = require('assert');
import ValueSet = require('./ValueSet');
import Scope = require("./Scope");
import Stack = require("./Stack");
import _ = require('./utilities');
import Expression = require('./expressions/Expression');
import LiteralExpression = require('./expressions/LiteralExpression');


interface Item {
  name?:string;
  expression:Expression;
}

class ExpressionSet {

  static fromPositionalExpressions(expressions:Expression[]): ExpressionSet {
    return new ExpressionSet(<Item[]> _.map(expressions, (expression: Expression): Item => {
      return { expression: expression }
    }));
  }

  static fromPositionalValues(values:any[]):ExpressionSet {
    return new ExpressionSet(<Item[]> _.map(values, (value:any):Item  => {
      return {expression: new LiteralExpression(value)};
    }));
  }

  static ZERO:ExpressionSet = new ExpressionSet([]);

  private isNamed_:boolean = true;
  private isUnnamed_:boolean = true;

  constructor(public items:Item[]) {
    for (var i in items) {
      assert(items[i].expression);
      if (items[i].name) this.isUnnamed_ = false;
      else this.isNamed_ = false;
    }
  }

  isNamed():boolean {
    return this.isNamed_;
  }

  isUnnamed():boolean {
    return this.isUnnamed_;
  }

  toArray():Expression[] {
    return _.pluck(this.items, 'expression');
  }

  toValueSet(scope:Scope, stack:Stack):ValueSet {
    return new ValueSet(_.map(this.items, (item:Item) => {
      return {
        value: item.expression.evaluateToIntermediate(scope, stack),
        name: item.name
      }
    }));
  }

}

export = ExpressionSet;


