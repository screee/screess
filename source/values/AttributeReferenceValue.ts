import Value = require("./Value")

class AttributeReferenceValue extends Value {
  constructor(public name) { super() }
  toMGLValue(options) { return "{" + this.name + "}" }
}

export = AttributeReferenceValue;