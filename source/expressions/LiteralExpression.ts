import Expression = require("./Expression");
import SourceLocation = require("../SourceLocation");

class LiteralExpression extends Expression {

  constructor(public value, location:SourceLocation) {
    super(location)
  }

  evaluateToIntermediate():any {
    return this.value;
  }

}

export = LiteralExpression;
