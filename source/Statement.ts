import Scope = require("./Scope")
import Expression = require("./expressions/Expression")
import ExpressionSet = require("./ExpressionSet")
import assert = require("assert");

class Statement {  }

module Statement {

  export class LoopStatement extends Statement {
    constructor(
        public scope:Scope,
        public valueIdentifier:string,
        public keyIdentifier:string,
        public collectionExpression:Expression
    ) { super() }
  }

  export class LayerStatement extends Statement {
    constructor(
        public name:string,
        public scope:Scope
    ) { super() }
  }

  export class ClassStatement extends Statement {
    constructor(
        public name:string,
        public scope:Scope
    ) { super() }
  }

  export class PropertyStatement extends Statement {
    constructor(
      public name:string,
      public expressions:ExpressionSet
    ) { super() }
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