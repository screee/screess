{ literalExpression } = require("../expressions/LiteralExpression")
Scope  = require '../scopes/Scope'
_ = require "../utilities"
assert = require "assert"

module.exports = class RuleMacro

  # TODO allow for subclasses, sublayers?

  @createFromFunction: (name, argDefinitions, parentScope, body) ->
    new RuleMacro(parentScope, name, argDefinitions, body)

  constructor: (@parentScope, @name, @argDefinitions, @body = null) ->
    ClassScope = require("../scopes/ClassScope")
    @scope = new ClassScope(@parentScope)

    if @argDefinitions
      @argLengthMin = _.count @argDefinitions, (argDefinition) -> !argDefinition.expression
      @argLengthMax = @argDefinitions.length

  toMGLScope: (argValues, options) ->
    args = @processArgs(argValues, @parentScope, options)

    scope = new Scope(@scope)
    for name, value of args
      scope.addValueMacro(name, [], [literalExpression(value)])

    _.extend(
      scope.toMGLRules(options, @scope.rules),
      @body?.call({}, argValues, options)
    )

  matches: (name, argValues) -> name == @name && @matchesArgValues(argValues)

  matchesArgValues: (argValues) ->
    if @argDefinitions == null
      true
    else
      argValues.length <= @argLengthMax && argValues.length >= @argLengthMin

  processArgs: (argValues, scope, options) ->
    assert @matchesArgValues(argValues)

    args = {}

    if !@argDefinitions
      positionalIndex = 0
      for argValue in argValues
        args[positionalIndex++] = argValue

    else
      positionaIndex = 0
      for argValue in argValues
        argDefinition = @argDefinitions[positionaIndex++]
        args[argDefinition.name] = argValue

      while positionaIndex < @argDefinitions.length
        argDefinition = @argDefinitions[positionaIndex++]
        args[argDefinition.name] = argDefinition.expression.toValue(scope, options)

    args
