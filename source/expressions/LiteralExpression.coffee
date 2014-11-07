Expression = require("./Expression")

module.exports = class LiteralExpression extends Expression

  @literal: (value) -> new LiteralExpression(value)

  constructor: (@value) ->

  toMGLRuleValue: (scope) -> super(scope, @value)
  toMGLFilterValue: (scope) -> super(scope, @value)
