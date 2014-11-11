Expression = require('../expressions/Expression')
{literalExpression} = require('../expressions/LiteralExpression')
_ = require("../utilities")
Scope = require('../scopes/Scope')
assert = require 'assert'

module.exports = class ValueMacro

  @createFromExpression: (name, argDefinitions, expression) ->
    @createFromExpressions(name, argDefinitions, [expression])

  @createFromExpressions: (name, argDefinitions, expressions) ->
    assert _.isArray(expressions)
    @createFromFunction name, argDefinitions, (args, parentScope, options) ->
      scope = new Scope(parentScope)
      for name, value of args
        scope.addValueMacro(name, [], [literalExpression(value)])
      expression.toValue(scope, options) for expression in expressions

  @createFromFunction: (name, argDefinitions, body) ->
    new ValueMacro(name, argDefinitions, body)

  constructor: (@name, @argDefinitions, @body) ->
    @argDefinitionsMap = _.objectMap @argDefinitions, (index, argDefinition) ->
      [argDefinition.name, _.extend(argDefinition, index:index)]

  matches: (name, argValues) -> name == @name && @matchesArgValues(argValues)

  matchesArgValues: (argValues) ->
    return true if @argDefinitions == null

    indicies = _.times(@argDefinitions.length - 1, -> false)

    # Identify named arguments
    for argValue in argValues
      if argValue.name
        argDefinition = @argDefinitionsMap[argValue.name]
        return false unless argDefinition
        indicies[argDefinition.index] = true

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

  toValues: (scope, argValues, options) ->
    args = @processArgs(argValues, scope, options)
    values = @body(args, scope, options)
    assert _.isArray(values)
    return values

  processArgs: (argValues, scope, options) ->
    args = {}

    if !@argDefinitions
      positionalIndex = 0
      for argValue in argValues
        for value in argValue.values
          args[argValue.name || positionalIndex++] = value

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
          assert.equal argValue.values.length, 1
          args[argDefinition.name] = argValue.values[0]

      # Extract positional arguments
      positionalIndex = -1
      for argValue in argValues
        if !argValue.name
          for value in argValue.values
            # Advance positionalIndex to the next unused positional argument
            null while args[@argDefinitions[++positionalIndex]?.name] && positionalIndex < @argDefinitions.length
            argDefinition = @argDefinitions[positionalIndex]
            assert(argDefinition)
            args[argDefinition.name] = value

      # Extract default arguments
      for argDefinition in @argDefinitions
        if !args[argDefinition.name]
          args[argDefinition.name] = argDefinition.expression.toValue(scope, options)

    args





