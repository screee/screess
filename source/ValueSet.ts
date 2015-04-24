import assert = require('assert');
import ValueSetDefinition = require('./ValueSetDefinition');
import Value = require('./values/Value');
import Scope = require("./Scope");
import Stack = require("./Stack");
import _ = require('./utilities');
import Expression = require('./expressions/Expression');

interface Item {
  name?:string;
  value:any;
}

class ValueSet {

  static fromPositionalValues(values:any[]):ValueSet {
    return this.fromValues(<Item[]> _.map(values, (value:any):Item  => {
      return {value: value}
    }));
  }

  static fromValues(values:Item[]):ValueSet {
    return new ValueSet(values);
  }

  static ZERO: ValueSet = new ValueSet([]);

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

  matches(argDefinition:ValueSetDefinition):boolean {
    assert(argDefinition != null);

    if (argDefinition.isWildcard()) return true;

    var indicies = _.times(argDefinition.length, () => { return false });

    // Mark named arguments
    for (var name in this.named) {
      var value = this.named[name];
      if (!argDefinition.named[name]) { return false; }
      indicies[argDefinition.named[name].index] = true
    }

    // Mark positional arguments
    var positionalIndex = -1
    for (var i in this.positional) {
      var value = this.positional[i]
      while (indicies[++positionalIndex] && positionalIndex < argDefinition.definitions.length) {}
      if (positionalIndex >= argDefinition.definitions.length) { return false  }
      indicies[positionalIndex] = true;
    }

    // Mark default arguments
    for (var i in argDefinition.definitions) {
      var definition = argDefinition.definitions[i];
      if (definition.expression) {
        indicies[definition.index] = true;
      }
    }

    return _.all(indicies);
  }

  toObject(
      argDefinition:ValueSetDefinition,
      stack:Stack
  ):{[s:string]: any} {

    assert(this.matches(argDefinition));

    if (!argDefinition) {
      return _.extend(
        _.objectMap(
          this.positional,
          (values, index) => { return [index.toString(), values]; }
        ),
        this.named
      );

    } else if (argDefinition.isWildcard()) {
      return {arguments: this}

    } else {
      var args:{[s:string]: any} = {}

      for (var name in this.named) {
        var value = this.named[name];
        args[name] = value
      }

      var positionalIndex = 0
      for (var i in argDefinition.definitions) {
        var definition = argDefinition.definitions[i];
        if (!args[definition.name]) {
          if (positionalIndex < this.positional.length) {
            args[definition.name] = this.positional[positionalIndex++]
          } else {
            args[definition.name] = definition.expression.evaluateToIntermediate(argDefinition.scope, stack)
          }
        }
      }

      return args
    }
  }
}

export = ValueSet;


