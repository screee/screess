Value = require "./Value"

module.exports = class AttributeReferenceValue extends Value
  constructor: (@name) ->
  toMGLValue: (options) -> "{#{@name}}"
