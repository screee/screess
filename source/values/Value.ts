import Context = require('../Context');

class Value {

  static evaluate(value:any, context:Context):any {
    if (value.evaluate) {
      return value.evaluate(context);
    } else {
      return value;
    }
  }

  evaluate(context:Context):any {
    throw "Abstract method"
  }

}

export = Value;