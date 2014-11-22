import assert = require('assert')
import Scope = require('../scopes/Scope')
import _ = require('../utilities')
import Expression = require('../expressions/Expression');

interface Definition {
  name: string;
  index?: number;
  expression?: Expression;
}

class MacroArgDefinitions {

  static ZERO:MacroArgDefinitions = new MacroArgDefinitions([], null);

  // TODO create type for namedArgs
  public namedArgs;
  public length:number;

  // TODO create type for definitions
  constructor(public definitions:Definition[], public scope:Scope) {
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

export = MacroArgDefinitions;