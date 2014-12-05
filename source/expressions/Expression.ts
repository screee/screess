import Value = require('../values/Value')

class Expression {

  evaluateToIntermediate(scope, stack):any {
    var values = this.evaluateToIntermediates(scope, stack);

    if (values.length > 1) {
      throw new Error("Expected 1 value but found " + values.length + " values");
    }

    return values[0];
  }

  evaluateToIntermediates(scope, stack):any[] {
    throw new Error("Abstract method");
  }

  evaluate(scope, stack):any[] {
    return Value.evaluate(this.evaluateToIntermediate(scope, stack), stack);
  }

}

export = Expression