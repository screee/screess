Value = require "./Value"
_ = require '../utilities'
assert = require "assert"

module.exports = class ColorValue

  unwrap = (value) -> value.toLiteralValue()

  @hex: (hex) ->
    [r, g, b] = _.hex2rgb(hex)
    new ColorValue(r, g, b, 1)

  @hsva: (h, s, v, a) ->
    [r, g, b] = _.hsv2rgb(unwrap(h), unwrap(s), unwrap(v))
    new ColorValue(r, g, b, a)

  @hsla: (h, s, l, a) ->
    [r, g, b] = _.hsl2rgb(unwrap(h), unwrap(s), unwrap(l))
    new ColorValue(r, g, b, a)

  @rgba: (red, green, blue, alpha) ->
    new ColorValue(unwrap(red), unwrap(green), unwrap(blue), unwrap(alpha))

  constructor: (@red, @green, @blue, @alpha) ->

  toMGLValue: (options) ->
    assert !options.filter
    "rgba(#{@red}, #{@green}, #{@blue}, #{@alpha})"
