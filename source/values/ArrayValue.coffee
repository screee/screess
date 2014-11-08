Value = require "./Value"
_ = require "../utilities"

module.exports = class ArrayValue extends Value
  constructor: (@expressions) ->

  toMGLValue: (scope, options) ->
    return _.map(@expressions, (expression) -> expression.toMGLValue(scope, options))
