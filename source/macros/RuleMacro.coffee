{ literal } = require("../expressions/LiteralExpression")
_ = require "underscore"

module.exports = class RuleMacro

  # TODO allow for subclasses, sublayers?

  constructor: (parentScope, @name, @argNames) ->
    ClassScope = require("../scopes/ClassScope")
    @scope = new ClassScope(parentScope)

  evaluate: (argValues) ->
    if argValues.length != @argNames.length
      throw "Expecting #{@argNames.length} arguments for macro '#{@name}', got #{argValues.length}"

    _.extend(
      @scope.valueMacros,
      Object.zip(@argNames, argValues.map(literal))
    )

    @scope.evaluateRules()