import Value = require("./Value");
import Options = require('../Options');

class AttributeReferenceValue extends Value {
  constructor(public name:string) { super() }
  evaluateValue(options:Options):string { return "{" + this.name + "}" }
}

export = AttributeReferenceValue;