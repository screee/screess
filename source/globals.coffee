ColorValue = require("./values/ColorValue")
StringValue = require("./values/StringValue")

module.exports =

  valueMacros:

    # TODO retrofit to new args system

    hsv: (args, scope, options) -> ColorValue.hsla(args[0], args[1], args[2], 1)
    hsva: (args, scope, options) -> ColorValue.hsla(args[0], args[1], args[2], args[3])
    hsl: (args, scope, options) -> ColorValue.hsla(args[0], args[1], args[2], 1)
    hsla: (args, scope, options) -> ColorValue.hsla(args[0], args[1], args[2], args[3])
    rgb: (args, scope, options) -> ColorValue.rgba(args[0], args[1], args[2], 1)
    rgba: (args, scope, options) -> ColorValue.rgba(args[0], args[1], args[2], args[3])

    polygon: (args, scope, options) -> new StringValue("Polygon")
    point: (args, scope, options) -> new StringValue("Point")

    fill: (args, scope, options) -> new StringValue("fill")
    symbol: (args, scope, options) -> new StringValue("symbol")
    raster: (args, scope, options) -> new StringValue("raster")
    background: (args, scope, options) -> new StringValue("background")

    # Line may refer to the layer paint type or the layer geometry type
    line: (args, scope, options) ->
      if options.rule == "type" && options.meta
        new StringValue("LineString")
      else if options.filter
        new StringValue("line")
      else
        throw new Error("The use of 'line' is ambigious in this context")

  ruleMacros: {}