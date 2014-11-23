import Value = require("./Value");
import Options = require('../Options');

class AttributeReferenceValue extends Value {
  constructor(public name:string) { super() }
  evaluate(options:Options):string { return "{" + this.name + "}" }
}

export = AttributeReferenceValue;