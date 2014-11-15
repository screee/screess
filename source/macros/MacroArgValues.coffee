_ = require '../utilities'
assert = require 'assert'

module.exports = class MacroArgValues

  @createFromExpressions: (args, scope, options) ->
    positionalArgs = []
    namedArgs = {}

    for arg in args
      argValues = arg.expression.toValues(scope, options)

      if arg.name
        assert argValues.length == 1
        namedArgs[arg.name] = argValues[0]
      else
        positionalArgs = positionalArgs.concat(argValues)

    new MacroArgValues(positionalArgs, namedArgs)

  constructor: (@positionalArgs, @namedArgs) ->
    @length = @positionalArgs.length + _.values(@namedArgs).length

  matches: (argDefinition) ->
    return true if !argDefinition

    indicies = _.times(argDefinition.length, -> false)

    # Mark named arguments
    for name, value of @namedArgs
      return false if !argDefinition.namedArgs[name]
      indicies[argDefinition.namedArgs[name].index] = true

    # Mark positional arguments
    positionalIndex = -1
    for value in @positionalArgs
      null while indicies[++positionalIndex] && positionalIndex < argDefinition.definitions.length
      return false if positionalIndex >= argDefinition.definitions.length
      indicies[positionalIndex] = true

    # Mark default arguments
    for definition in argDefinition.definitions
      if definition.expression
        indicies[definition.index] = true

    _.all(indicies)

  toArguments: (argDefinition, options) ->
    assert @matches(argDefinition)

    if !argDefinition
      _.extend(
        _.objectMap(@positionalArgs, (values, index) -> [index, values]),
        @namedArgs
      )
    else
      args = {}

      for name, value of @namedArgs
        args[name] = value

      positionalIndex = 0
      for definition in argDefinition.definitions
        if !args[definition.name]
          if positionalIndex < @positionalArgs.length
            args[definition.name] = @positionalArgs[positionalIndex++]
          else
            debugger unless argDefinition.scope
            args[definition.name] = definition.expression.toValue(argDefinition.scope, options)

      args


