Expression = require('../expressions/Expression')
MacroArgDefinition = require('../macros/MacroArgDefinition')
_ = require("../utilities")
Scope = require('../scopes/Scope')
assert = require 'assert'
{literalExpression} = require('../expressions/LiteralExpression')

module.exports = class ValueMacro

  @createFromValue: (name, scope, value) ->
    @createFromExpression(name, MacroArgDefinition.ZERO, scope, literalExpression(value))

  @createFromExpression: (name, argDefinition, parentScope, expression) ->
    @createFromExpressions(name, argDefinition, parentScope, [expression])

  @createFromExpressions: (name, argDefinition, parentScope, expressions) ->
    assert _.isArray(expressions)
    @createFromFunction name, argDefinition, parentScope, (args, options) ->
      scope = new Scope(parentScope)
      scope.addLiteralValueMacros(args)

      options.scopeStack.push(scope)
      values = (expression.toValue(scope, options) for expression in expressions)
      options.scopeStack.pop()
      values

  @createFromFunction: (name, argDefinition, parentScope, body) ->
    assert _.isFunction(body)
    new ValueMacro(name, argDefinition, parentScope, body)

  constructor: (@name, @argDefinition, @parentScope, @body) ->
    assert _.is(@parentScope, Scope)
    assert _.is(@argDefinition, MacroArgDefinition) || !@argDefinition
    assert _.isFunction @body

  matches: (name, argValues) -> name == @name && argValues.matches(@argDefinition)

  toValues: (argValues, options) ->
    args = argValues.toArguments(@argDefinition, options)
    values = @body(args, options)
    assert _.isArray(values)
    values


