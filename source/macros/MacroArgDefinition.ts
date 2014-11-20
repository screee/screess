import assert = require('assert')
var _ = require('../utilities')

class MacroArgDefinition {

  static ZERO = new MacroArgDefinition([], null);

  public namedArgs;
  public length:number;

  constructor(public definitions, public scope) {
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