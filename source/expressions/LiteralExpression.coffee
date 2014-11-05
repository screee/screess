module.exports = class LiteralExpression extends require('./Expression')
  constructor: (@value) ->
  evaluate: (scope) -> @value

  @literal: (value) -> new LiteralExpression(value)