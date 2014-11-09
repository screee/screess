Value = require "./Value"

module.exports = class StringValue extends Value
  constructor: (@body) ->
  toMGLValue: (scope, options) -> @body
