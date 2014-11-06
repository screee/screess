Expression = require('./Expression')

module.exports = class LiteralExpression extends Expression
  constructor: (@value) ->
  evaluate: (scope) -> @value

  @literal: (value) -> new LiteralExpression(value)