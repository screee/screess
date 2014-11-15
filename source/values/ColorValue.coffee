Value = require "./Value"
_ = require '../utilities'
assert = require "assert"

module.exports = class ColorValue

  unwrap = (value) -> value.toLiteralValue()

  @hex: (hex) ->
    [red, green, blue] = _.hex2rgb(hex)
    new ColorValue(red, green, blue, 1)

  @hsva: (hue, saturation, value, alpha) ->
    [red, green, blue] = _.hsv2rgb(unwrap(hue), unwrap(saturation), unwrap(value))
    new ColorValue(red, green, blue, alpha)

  @hsla: (hue, saturation, lightness, alpha) ->
    [red, green, blue] = _.hsl2rgb(unwrap(hue), unwrap(saturation), unwrap(lightness))
    new ColorValue(red, green, blue, alpha)

  @rgba: (red, green, blue, alpha) ->
    new ColorValue(unwrap(red), unwrap(green), unwrap(blue), unwrap(alpha))

  constructor: (@red, @green, @blue, @alpha) ->

  toMGLValue: (options) ->
    assert !options.filter
    "rgba(#{@red}, #{@green}, #{@blue}, #{@alpha})"
