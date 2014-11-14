Value = require "./Value"

module.exports = class AttributeReferenceValue extends Value
  constructor: (@name) ->
  toMGLValue: (options) ->
    # TODO move the filter logic into the Expression classes
    if options.isFilter() then @name else "{#{@name}}"
