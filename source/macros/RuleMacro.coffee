{ literal } = require("../expressions/LiteralExpression")
_ = require "../utilities"

module.exports = class RuleMacro

  # TODO allow for subclasses, sublayers?

  constructor: (parentScope, @name, @argNames, @body = null) ->
    ClassScope = require("../scopes/ClassScope")
    @scope = new ClassScope(parentScope)

  evaluate: (argValues) ->
    if argValues.length != @argNames.length
      throw "Expecting #{@argNames.length} arguments for macro '#{@name}', got #{argValues.length}"

    _.extend(
      @scope.valueMacros,
      _.objectZip(@argNames, argValues.map(literal))
    )

    rules = {}

    _.extend(
      rules,
      @scope.evaluateRules(),
      @body?.apply({}, argValues)
    )

    rules