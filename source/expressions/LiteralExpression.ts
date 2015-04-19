import Expression = require("./Expression");

class LiteralExpression extends Expression {

  // TODO depracate this
  static literalExpression(value) {
    return new LiteralExpression(value)
  }

  constructor(public value) {
    super()
  }

  evaluateToIntermediates():any[] {
    return [this.value];
  }

}

export = LiteralExpression;
