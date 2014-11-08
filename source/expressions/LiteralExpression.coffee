Expression = require("./Expression")

module.exports = class LiteralExpression extends Expression
  @literalExpression: (value) -> new LiteralExpression(value)

  constructor: (@value) ->
  toValue: -> @value
