import Value = require('../values/Value')

class Expression {

  toValue(scope, context):any {
    var values = this.toValues(scope, context);

    if (values.length > 1) {
      console.log(values);
      throw new Error("Expected 1 value but found " + values.length + " values");
    }

    return values[0];
  }

  // TODO use union types on return type
  toValues(scope, context):any[] {
    throw new Error("Abstract method");
  }

  evaluate(scope, context):any[] {
    return Value.evaluate(this.toValue(scope, context), context);
  }

  evaluateFilter(scope, context):any[] {
    throw new Error("Abstract method");
  }

}

export = Expression