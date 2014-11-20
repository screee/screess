import Expression = require("./Expression");

class LiteralExpression extends Expression {

  // To be depracated
  static literalExpression(value) {
    return new LiteralExpression(value)
  }

  constructor(public value) {
    super()
  }

  toValues() {
    return [this.value];
  }

}

export = LiteralExpression;