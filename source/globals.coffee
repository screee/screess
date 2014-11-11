ColorValue = require("./values/ColorValue")
LiteralValue = require("./values/LiteralValue")
FunctionValue = require("./values/FunctionValue")
_ = require "./utilities"
assert = require "assert"

module.exports =

  valueMacros:

    source: (source, options) ->
      name = source.name?.toMGLValue(options) || _.uniq()
      delete source.name

      if source["tile-size"]
        source.tileSize = source["tile-size"]
        delete source["tile-size"]

      options.globalScope.addSource(name, source)
      [new LiteralValue(name)]

    identity: (args, options) -> _.map args, _.identity

    hsv: (args, options) ->
      [ColorValue.hsla(args['0'], args['1'], args['2'], 1)]
    hsva: (args, options) ->
      [ColorValue.hsla(args['0'], args['1'], args['2'], args['3'])]
    hsl: (args, options) ->
      [ColorValue.hsla(args['0'], args['1'], args['2'], 1)]
    hsla: (args, options) ->
      [ColorValue.hsla(args['0'], args['1'], args['2'], args['3'])]
    rgb: (args, options) ->
      [ColorValue.rgba(args['0'], args['1'], args['2'], 1)]
    rgba: (args, options) ->
      [ColorValue.rgba(args['0'], args['1'], args['2'], args['3'])]

    polygon: (args, options) ->
      [new LiteralValue("Polygon")]
    point: (args, options) ->
      [new LiteralValue("Point")]

    fill: (args, options) ->
      [new LiteralValue("fill")]
    symbol: (args, options) ->
      [new LiteralValue("symbol")]
    raster: (args, options) ->
      [new LiteralValue("raster")]
    background: (args, options) ->
      [new LiteralValue("background")]

    # Line may refer to the layer paint type or the layer geometry type
    line: (args, options) ->
      if options.rule == "type" && options.meta then new LiteralValue("LineString")
      else if options.filter then new LiteralValue("line")
      else throw new Error("The use of 'line' is ambigious in this context")

    'function': (args, options) ->
      stops = []
      for key, value of args
        if key == "base" then continue
        if (stop = parseInt(key)) != NaN then stops.push([key, value])
        else assert false
      assert stops.length > 0

      [new FunctionValue(args.base, stops)]



  ruleMacros: {}