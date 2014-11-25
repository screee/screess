import Stack = require('../Stack');

class Value {

  static evaluate(value:any, stack:Stack):any {
    if (value.evaluate) {
      return value.evaluate(stack);
    } else {
      return value;
    }
  }

  evaluate(stack:Stack):any {
    throw "Abstract method"
  }

}

export = Value;