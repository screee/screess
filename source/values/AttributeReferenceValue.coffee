Value = require "./Value"

module.exports = class AttributeReferenceValue extends Value
  constructor: (@name) ->
  toMGLValue: (options) -> if options.filter then @name else "{#{@name}}"
