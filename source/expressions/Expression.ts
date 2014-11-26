import Value = require('../values/Value')

class Expression {

  toValue(scope, stack):any {
    var values = this.toValues(scope, stack);

    if (values.length > 1) {
      throw new Error("Expected 1 value but found " + values.length + " values");
    }

    return values[0];
  }

  // TODO use union types on return type
  toValues(scope, stack):any[] {
    throw new Error("Abstract method");
  }

  evaluate(scope, stack):any[] {
    return Value.evaluate(this.toValue(scope, stack), stack);
  }

  evaluateFilter(scope, stack):any[] {
    throw new Error("Abstract method");
  }

}

export = Expression