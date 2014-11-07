{ literal } = require("../expressions/LiteralExpression")
_ = require "../utilities"

module.exports = class RuleMacro

  # TODO allow for subclasses, sublayers?

  constructor: (parentScope, @name, @argNames, @body = null) ->
    ClassScope = require("../scopes/ClassScope")
    @scope = new ClassScope(parentScope)

  toMGLScope: (argValues) ->
    if argValues.length != @argNames.length
      throw "Expecting #{@argNames.length} arguments for macro '#{@name}', got #{argValues.length}"

    _.extend(
      @scope.valueMacros,
      _.objectZip(@argNames, argValues.map(literal))
    )

    _.extend(
      @scope.evaluateRules(),
      @body?.apply({}, argValues)
    )