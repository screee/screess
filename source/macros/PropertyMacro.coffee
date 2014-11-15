{ literalExpression } = require("../expressions/LiteralExpression")
Scope  = require '../scopes/Scope'
_ = require "../utilities"
assert = require "assert"
MacroArgumentValues = require "./MacroArgumentValues"
Options = require "../Options"

module.exports = class PropertyMacro

  # TODO allow for subclasses, sublayers?

  constructor: (@parentScope, @name, @argDefinition, @body = null) ->
    ClassScope = require("../scopes/ClassScope")
    @scope = new ClassScope(@parentScope)

    @argLengthMin = _.count(
      @argDefinition.definitions,
      (argDefinition) -> !argDefinition.expression
    )
    @argLengthMax = @argDefinition.length

  toMGLScope: (argValues, options) ->
    assert _.is(argValues, MacroArgumentValues)
    assert _.is(options, Options)

    args = argValues.toArguments(@argDefinition, options)

    scope = new Scope(@scope)
    scope.addLiteralValueMacros(args)

    options.scopeStack.push(scope)
    values = _.extend(
      scope.toMGLProperties(options, @scope.properties),
      @body?.apply({}, argValues)
    )
    options.scopeStack.pop()
    values

  matches: (name, argValues) -> name == @name && argValues.matches(@argDefinition)

