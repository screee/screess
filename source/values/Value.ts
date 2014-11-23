import Options = require('../Options');

class Value {

  static evaluateValue(value:any, options:Options):any {
    if (value.evaluateValue) {
      return value.evaluateValue(options);
    } else {
      return value;
    }
  }

  evaluateValue(options:Options):any {
    throw "Abstract method"
  }

}

export = Value;