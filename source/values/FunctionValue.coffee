Value = require "./Value"
_ = require "../utilities"

module.exports = class FunctionValue extends Value
  constructor: (@base, @stops) ->

  toMGLValue: (options) ->
    stops = _.map @stops, (stop) -> [stop[0], Value.toMGLValue(stop[1], options)]

    if @base
      base: Value.toMGLValue(@base, options), stops: stops
    else
      stops: stops
