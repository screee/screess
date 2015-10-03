import assert = require('assert')
import Scope = require('./Scope')
import _ = require('./utilities')
import Expression = require('./expressions/Expression');

interface ValueDefinition {
  name: string;
  index?: number;
  expression?: Expression;
}

class ArgumentsDefinition {

  static ZERO:ArgumentsDefinition = new ArgumentsDefinition([], null);
  static WILDCARD:ArgumentsDefinition = new ArgumentsDefinition([], null);

  public named:{[name:string]: ValueDefinition};
  public length:number;

  constructor(public definitions:ValueDefinition[], public scope:Scope) {
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
    return false;
  }
}

ArgumentsDefinition.WILDCARD.isWildcard = function() { return true };

export = ArgumentsDefinition;
