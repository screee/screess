import Value = require("./Value");
import Stack = require('../Stack');

class AttributeReferenceValue extends Value {
  constructor(public name:string) { super() }
  evaluate(stack:Stack):string { return "{" + this.name + "}" }
}

export = AttributeReferenceValue;