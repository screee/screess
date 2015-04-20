import Stack = require('../Stack');

class Value {

  static evaluate(value:any):any {
    if (value && value.evaluate) {
      return value.evaluate();
    } else {
      return value;
    }
  }

  evaluate():any {
    throw "Abstract method"
  }

}

export = Value;