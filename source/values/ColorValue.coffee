Color = require "../utilities/color"
Value = require "./Value"
assert = require "assert"

module.exports = class ColorValue extends Value

  @hex: (hex) ->
    [r, g, b] = Color.hex2rgb(hex)
    @rgba(r, g, b, 1)

  @hsva: (h, s, v, a) ->
    [r, g, b] = Color.hsv2rgb(h, s, v)
    @rgba(r, g, b, a)

  @hsla: (h, s, l, a) ->
    [r, g, b] = Color.hsl2rgb(h, s, l)
    @rgba(r, g, b, a)

  @rgba: (red, green, blue, alpha) ->
    new ColorValue("PRIVATE", red, green, blue, alpha)

  constructor: (flag, @red, @green, @blue, @alpha) ->
    assert(flag = "PRIVATE")

  evaluate: -> "rgba(#{@red}, #{@green}, #{@blue}, #{@alpha})"
