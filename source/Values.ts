import assert = require('assert');
import ValuesDefinition = require('./ValuesDefinition');
import Scope = require("./scopes/Scope");
import Stack = require("./Stack");
import _ = require('./utilities');
import Expression = require('./expressions/Expression');

interface Value {
  name?: string;
  expression: Expression;
}

class Values {

  public length:number;
  public positional:Value[];
  public named:{[s:string]:Value};

  constructor(args:Value[], scope:Scope, stack:Stack) {
    this.positional = [];
    this.named = {};

    for (var i in args) {
      var arg = args[i];
      var argValues = arg.expression.toValues(scope, stack)

      if (arg.name) {
        assert(argValues.length == 1);
        this.named[arg.name] = argValues[0]
      } else {
        this.positional = this.positional.concat(argValues)
      }
    }

    this.length = this.positional.length + _.values(this.named).length;
  }

  matches(argDefinition:ValuesDefinition):boolean {
    if (!argDefinition) { return true }

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

  evaluate(
      argDefinition:ValuesDefinition,
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
            args[definition.name] = definition.expression.toValue(argDefinition.scope, stack)
          }
        }
      }

      return args
    }
  }
}

export = Values;


