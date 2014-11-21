import assert = require('assert');
import MacroArgDefinition = require('./MacroArgDefinition');
import Scope = require("../scopes/Scope");
import Options = require("../Options");
import _ = require('../utilities');

class MacroArgValues {

  // TODO make all factory methods into overloaded constructors
  // TODO add types to arguments
  static createFromExpressions(args, scope:Scope, options:Options) {
    var positionalArgs = [];
    var namedArgs = {};

    for (var i in args) {
      var arg = args[i];
      var argValues = arg.expression.toValues(scope, options)

      if (arg.name) {
        assert(argValues.length == 1);
        namedArgs[arg.name] = argValues[0]
      } else {
        positionalArgs = positionalArgs.concat(argValues)
      }
    }

    return new MacroArgValues(positionalArgs, namedArgs);
  }

  public length:number;

  // TODO add types to arguments
  constructor(public positionalArgs, public namedArgs) {
    this.length = this.positionalArgs.length + _.values(this.namedArgs).length
  }

  matches(argDefinition:MacroArgDefinition):boolean {
    if (!argDefinition) { return true }

    var indicies = _.times(argDefinition.length, () => { return false });

    // Mark named arguments
    for (var name in this.namedArgs) {
      var value = this.namedArgs[name];
      if (!argDefinition.namedArgs[name]) { return false; }
      indicies[argDefinition.namedArgs[name].index] = true
    }

    // Mark positional arguments
    var positionalIndex = -1
    for (var i in this.positionalArgs) {
      var value = this.positionalArgs[i]
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

  toArguments(argDefinition, options) {
    assert(this.matches(argDefinition));

    if (!argDefinition) {
      return _.extend(
        _.objectMap(this.positionalArgs, (values, index) => { return [index, values]; }),
        this.namedArgs
      )
    } else {
      var args = {}

      for (var name in this.namedArgs) {
        var value = this.namedArgs[name];
        args[name] = value
      }

      var positionalIndex = 0
      for (var i in argDefinition.definitions) {
        var definition = argDefinition.definitions[i];
        if (!args[definition.name]) {
          if (positionalIndex < this.positionalArgs.length) {
            args[definition.name] = this.positionalArgs[positionalIndex++]
          } else {
            args[definition.name] = definition.expression.toValue(argDefinition.scope, options)
          }
        }
      }

      return args
    }
  }
}

export = MacroArgValues;


