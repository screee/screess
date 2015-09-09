import assert = require('assert');
import ArgumentsDefinition = require('./ArgumentsDefinition');
import Value = require('./values/Value');
import Scope = require("./Scope");
import Stack = require("./Stack");
import _ = require('./utilities');
import Expression = require('./expressions/Expression');

interface Item {
  name?:string;
  value:any;
}

class Arguments {

  static fromPositionalValues(values:any[]):Arguments {
    return this.fromValues(<Item[]> _.map(values, (value:any):Item  => {
      return {value: value}
    }));
  }

  static fromValues(values:Item[]):Arguments {
    return new Arguments(values);
  }

  static ZERO: Arguments = new Arguments([]);

  public length:number;
  public positional:any[];
  public named:{[s:string]:any};

  constructor(items:Item[]) {
    this.positional = [];
    this.named = {};

    for (var i in items) {
      var item = items[i];

      if (item.name !== undefined) {
        this.named[item.name] = item.value;
      } else {
        this.positional.push(item.value);
      }
    }

    this.length = this.positional.length + _.values(this.named).length;
  }

  matches(argumentsDefinition:ArgumentsDefinition):boolean {
    assert(argumentsDefinition != null);

    if (argumentsDefinition.isWildcard()) return true;

    var indicies = _.times(argumentsDefinition.length, () => { return false });

    // Mark named arguments
    for (var name in this.named) {
      var value = this.named[name];
      if (!argumentsDefinition.named[name]) { return false; }
      indicies[argumentsDefinition.named[name].index] = true
    }

    // Mark positional arguments
    var positionalIndex = -1
    for (var i in this.positional) {
      var value = this.positional[i]
      while (indicies[++positionalIndex] && positionalIndex < argumentsDefinition.definitions.length) {}
      if (positionalIndex >= argumentsDefinition.definitions.length) { return false  }
      indicies[positionalIndex] = true;
    }

    // Mark default arguments
    for (var i in argumentsDefinition.definitions) {
      var definition = argumentsDefinition.definitions[i];
      if (definition.expression) {
        indicies[definition.index] = true;
      }
    }

    return _.all(indicies);
  }

  toObject(argumentsDefinition:ArgumentsDefinition, stack:Stack):{[name:string]: any} {

    assert(this.matches(argumentsDefinition));

    if (!argumentsDefinition) {
      return _.extend(
        _.objectMap(
          this.positional,
          (values, index) => { return [index.toString(), values]; }
        ),
        this.named
      );

    } else if (argumentsDefinition.isWildcard()) {
      return {arguments: this}

    } else {
      var args:{[s:string]: any} = {}

      for (var name in this.named) {
        var value = this.named[name];
        args[name] = value
      }

      var positionalIndex = 0
      for (var i in argumentsDefinition.definitions) {
        var definition = argumentsDefinition.definitions[i];
        if (!args[definition.name]) {
          if (positionalIndex < this.positional.length) {
            args[definition.name] = this.positional[positionalIndex++]
          } else {
            args[definition.name] = definition.expression.evaluateToIntermediate(argumentsDefinition.scope, stack)
          }
        }
      }

      return args
    }
  }
}

export = Arguments;
