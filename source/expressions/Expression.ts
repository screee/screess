import Value = require('../values/Value')

class Expression {

  evaluateToIntermediate(scope, stack):any {
    throw new Error("Abstract method");
  }

  evaluate(scope, stack):any {
    return Value.evaluate(this.evaluateToIntermediate(scope, stack));
  }

}

export = Expression