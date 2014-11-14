Expression = require('../expressions/Expression')
{literalExpression} = require('../expressions/LiteralExpression')
_ = require("../utilities")
Scope = require('../scopes/Scope')
assert = require 'assert'

module.exports = class ValueMacro

  @createFromValue: (name, scope, value) ->
    @createFromExpression(name, null, scope, literalExpression(value))

  @createFromExpression: (name, argDefinitions, parentScope, expression) ->
    @createFromExpressions(name, argDefinitions, parentScope, [expression])

  @createFromExpressions: (name, argDefinitions, parentScope, expressions) ->
    assert _.isArray(expressions)
    @createFromFunction name, argDefinitions, parentScope, (args, options) ->
      scope = new Scope(parentScope)
      for name, value of args
        scope.addValueMacro(name, [], [literalExpression(value)])
      expression.toValue(scope, options) for expression in expressions

  @createFromFunction: (name, argDefinitions, parentScope, body) ->
    assert _.isFunction(body)
    new ValueMacro(name, argDefinitions, parentScope, body)

  constructor: (@name, @argDefinitions, @parentScope, @body) ->
    assert _.is(@parentScope, Scope)
    @argDefinitionsMap = _.objectMap @argDefinitions, (index, argDefinition) ->
      [argDefinition.name, _.extend(argDefinition, index:index)]

  matches: (name, argValues) -> name == @name && @matchesArgValues(argValues)

  matchesArgValues: (argValues) ->
    return true if @argDefinitions == null

    indicies = _.times(@argDefinitions.length, -> false)

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
        for values in argValue.values
          null while indicies[++positionalIndex] && positionalIndex < @argDefinitions.length
          indicies[positionalIndex] = true

    return false if positionalIndex >= @argDefinitions.length

    # Identify default arguments
    for argDefinition in @argDefinitions
      if argDefinition.expression
        indicies[argDefinition.index] = !!argDefinition.expression

    _.all(indicies)

  toValues: (argValues, options) ->
    args = @processArgs(argValues, options)
    values = @body(args, options)
    assert _.isArray(values)
    values

  # TODO this scope shoud come from the place the macro is defined
  processArgs: (argValues, options) ->
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
          assert(argDefinition.expression, "No default value for argument '#{argDefinition.name}'")
          args[argDefinition.name] = argDefinition.expression.toValue(@parentScope, options)

    args
