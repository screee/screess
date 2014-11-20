import Options = require('../Options');

class Value {

  static toMGLValue(value:any, options:Options):any {
    if (value.toMGLValue) {
      return value.toMGLValue(options);
    } else {
      return value;
    }
  }

  toMGLValue(options:Options):any {
    throw "Abstract method"
  }

}

export = Value;