{ literalExpression } = require("../expressions/LiteralExpression")
Scope  = require '../scopes/Scope'
_ = require "../utilities"

module.exports = class RuleMacro

  # TODO allow for subclasses, sublayers?

  constructor: (parentScope, @name, @argNames, @body = null) ->
    ClassScope = require("../scopes/ClassScope")
    @scope = new ClassScope(parentScope)

  toMGLScope: (argValues, options) ->
    if argValues.length != @argNames.length
      throw new Error("Expecting #{@argNames.length} arguments for macro '#{@name}', got #{argValues.length}")

    args = _.objectZip(@argNames, argValues.map(literalExpression))

    # TODO create new scope
    scope = new Scope(@scope)
    for name, value of args
      scope.addValueMacro(name, [], [literalExpression(value)])

    _.extend(
      scope.toMGLRules(options, @scope.rules),
      @body?.apply({}, argValues)
    )

  matches: (name, argValues) ->
    name == @name