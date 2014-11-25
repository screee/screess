import Value = require("./Value");
import Context = require('../Context');

class AttributeReferenceValue extends Value {
  constructor(public name:string) { super() }
  evaluate(context:Context):string { return "{" + this.name + "}" }
}

export = AttributeReferenceValue;