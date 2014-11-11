Value = require "./Value"
_ = require "../utilities"

module.exports = class FunctionValue extends Value
  constructor: (base, stops) ->
    @stops = _.map stops, (stop) -> [stop[0], stop[1].toMGLValue()]
    @base = base?.toMGLValue()
  toMGLValue: (options) ->
    if @base then base: @base, stops: @stops
    else stops: @stops
