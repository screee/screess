import Expression = require("./Expression");

class LiteralExpression extends Expression {

  static literalExpression(value) {
    return new LiteralExpression(value)
  }

  constructor(public value) {
    super()
  }

  evaluateToIntermediate():any {
    return this.value;
  }

}

export = LiteralExpression;
