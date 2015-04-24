import assert = require('assert')
import Scope = require('./Scope')
import _ = require('./utilities')
import Expression = require('./expressions/Expression');

interface ValueDefinition {
  name: string;
  index?: number;
  expression?: Expression;
}

class ValueSetDefinition {

  static ZERO:ValueSetDefinition = new ValueSetDefinition([], null);
  static WILDCARD:ValueSetDefinition = new ValueSetDefinition([], null, true);

  public named:{[name:string]: ValueDefinition};
  public length:number;

  constructor(public definitions:ValueDefinition[], public scope:Scope, public isWildcard_ = false) {
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

  public isWildcard():boolean {
    return this.isWildcard_;
  }
}

export = ValueSetDefinition;