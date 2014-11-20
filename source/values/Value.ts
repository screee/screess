class Value {

  static toMGLValue(value, options) {
    if (value.toMGLValue) {
      return value.toMGLValue(options);
    } else {
      return value;
    }
  }

  toMGLValue(options):any {
    throw "Abstract method"
  }

}

export = Value;