import assert = require('assert')
import Scope = require('../scopes/Scope')
var _ = require('../utilities')

class MacroArgDefinition {

  static ZERO:MacroArgDefinition = new MacroArgDefinition([], null);

  // TODO create type for namedArgs
  public namedArgs;
  public length:number;

  // TODO create type for definitions
  constructor(public definitions, public scope:Scope) {
    if (this.definitions.length > 0) {
      assert(this.scope != null);
    }

    this.namedArgs = {};

    for (var index in this.definitions) {
      var definition = this.definitions[index];
      definition.index = index
      if (definition.name) {
        this.namedArgs[definition.name] = definition;
      }
    }

    this.length = this.definitions.length;
  }
}

export = MacroArgDefinition;