Value = require "./Value"

module.exports = class LiteralValue extends Value
  @literalValue: (value) -> new LiteralValue(value)

  constructor: (@value) ->
  toMGLValue: -> @value
