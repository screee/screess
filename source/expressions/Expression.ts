import Value = require('../values/Value')

class Expression {

  toValue(scope, options) {
    var values = this.toValues(scope, options);

    if (values.length > 1) {
      throw new Error("Expected 1 value but found #{values.length} values");
    }

    return values[0];
  }

  toValues(scope, options):any[] {
    throw new Error("Abstract method");
  }

  toMGLValue(scope, options) {
    return Value.toMGLValue(this.toValue(scope, options), options);
  }

}

export = Expression