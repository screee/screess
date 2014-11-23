import Options = require('../Options');

class Value {

  static evaluate(value:any, options:Options):any {
    if (value.evaluate) {
      return value.evaluate(options);
    } else {
      return value;
    }
  }

  evaluate(options:Options):any {
    throw "Abstract method"
  }

}

export = Value;