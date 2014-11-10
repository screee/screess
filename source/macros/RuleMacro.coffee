{ literalExpression } = require("../expressions/LiteralExpression")
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
    _.extend(@scope.valueMacros, args)

    _.extend(
      @scope.toMGLRules(options, @scope.rules),
      @body?.apply({}, argValues)
    )