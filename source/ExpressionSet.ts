import assert = require('assert');
import ValueSet = require('./ValueSet');
import Scope = require("./Scope");
import Stack = require("./Stack");
import _ = require('./utilities');
import Expression = require('./expressions/Expression');

interface Item {
  name?:string;
  expression:Expression;
}

class ExpressionSet {

  static ZERO:ExpressionSet = new ExpressionSet([]);

  private isNamed_:boolean = true;
  private isUnnamed_:boolean = true;

  constructor(public items:Item[]) {
    // TODO maybe check for duplicate properties
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
    return ValueSet.fromExpressions(scope, stack, this.items);
  }

}

export = ExpressionSet;


