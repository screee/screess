import assert = require('assert')
import Scope = require('./Scope')
import _ = require('./utilities')
import Expression = require('./expressions/Expression');

interface Definition {
  name: string;
  index?: number;
  expression?: Expression;
}

class ValuesDefinition {

  static ZERO:ValuesDefinition = new ValuesDefinition([], null);

  public named:{[name:string]: Definition};
  public length:number;

  constructor(public definitions:Definition[], public scope:Scope) {
    if (this.definitions.length > 0) {
      assert(this.scope != null);
    }

    this.named = {};

    for (var index in this.definitions) {
      var definition = this.definitions[index];
      definition.index = index
      if (definition.name) {
        this.named[definition.name] = definition;
      }
    }

    this.length = this.definitions.length;
  }
}

export = ValuesDefinition;