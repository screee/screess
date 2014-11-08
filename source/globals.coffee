ColorValue = require("./values/ColorValue")
StringValue = require("./values/StringValue")

module.exports =

  valueMacros:

    hsv: (h, s, v, a, scope, options) -> ColorValue.hsla(h,s,v,1)
    hsva: (h, s, v, a, scope, options) -> ColorValue.hsla(h,s,v,a)
    hsl: (h, s, l, scope, options) -> ColorValue.hsla(h,s,l,1)
    hsla: (h, s, l, a, scope, options) -> ColorValue.hsla(h,s,l,a)
    rgb: (r, g, b, scope, options) -> ColorValue.rgba(r,g,b,1)
    rgba: (r, g, b, a, scope, options) -> ColorValue.rgba(r,g,b,a)

    polygon: (scope, options) -> new StringValue("Polygon")
    point: (scope, options) -> new StringValue("Point")

    fill: (scope, options) -> new StringValue("fill")
    symbol: (scope, options) -> new StringValue("symbol")
    raster: (scope, options) -> new StringValue("raster")
    background: (scope, options) -> new StringValue("background")

    line: (scope, options) ->
      if options.rule == "type" && options.meta
        new StringValue("LineString")
      else if options.filter
        new StringValue("line")
      else
        console.log(options)



  ruleMacros: {}