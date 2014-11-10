Expression = require('../expressions/Expression')
{literalExpression} = require('../expressions/LiteralExpression')
_ = require("../utilities")
Scope = require('../scopes/Scope')
assert = require 'assert'

module.exports = class ValueMacro

  @createFromExpressions: (name, argDefinitions, expressions) ->
    @createFromFunction name, argDefinitions, (args, parentScope, options) ->
      scope = new Scope(parentScope)
      for name, value of args
        scope.addValueMacro(name, [], literalExpression(value))
      expressions.toValue(scope, options)

  @createFromFunction: (name, argDefinitions, body) ->
    new ValueMacro(name, argDefinitions, body)

  constructor: (@name, @argDefinitions, @body) ->
    @argDefinitionsMap = _.objectMap @argDefinitions, (argDefinition, index) ->
      [argDefinition.name, _.extend(argDefinition, index:index)]

  matches: (name, argValues) -> name == @name && @matchesArgValues(argValues)

  matchesArgValues: (argValues) ->
    return true if @argDefinitions == null

    indicies = _.times(@argDefinitions.length - 1, -> false)

    # Ensure arg values has no names not included in argDefinitions
    return false if _.any(_.difference(
      _.pluck(argValues, 'name'),
      _.pluck(@argDefinitions, 'name')
    ))

    # Identify named arguments
    for argValue in argValues
      if argValue.name
        indicies[@argDefinitionMap[argValue.name].index] = true

    # Identify positional arguments
    positionalIndex = -1
    for argValue in argValues
      if !argValue.name
        null while indicies[++positionalIndex] && positionalIndex < @argDefinitions.length
        indicies[positionalIndex] = true

    return false if positionalIndex >= @argDefinitions.length

    # Identify default arguments
    for argDefinition in @argDefinitions
      if argDefinition.value
        indicies[argDefinition.index] = !!argDefinition.value

    _.all(indicies)

  toValue: (scope, argValues, options) ->
    args = @processArgs(argValues, scope, options)
    @body(args, scope, options)

  processArgs: (argValues, scope, options) ->
    args = {}

    if !@argDefinitions
      positionalIndex = 0
      for argValue in argValues
        args[argValue.name || positionalIndex++] = argValue.value

    else
      assert @matchesArgValues(argValues)

      args = {}

      # Extract named arguments
      for argValue in argValues
        if argValue.name
          argDefinition = _.find(
            @argDefinitions,
            (argDefinition) -> argDefinition.name == argValue.name
          )
          args[argDefinition.name] = argValue.value

      # Extract positional arguments
      positionalIndex = -1
      for argValue in argValues
        if !argValue.name
          null while args[@argDefinitions[++positionalIndex]?.name] && positionalIndex < @argDefinitions.length
          argDefinition = @argDefinitions[positionalIndex++]
          assert(argDefinition)
          args[argDefinition.name] = argValue.value

      # Extract default arguments
      for argDefinition in @argDefinitions
        if !args[argDefinition.name]
          args[argDefinition.name] = argDefinition.value

    args





