ColorValue = require("./values/ColorValue")
LiteralValue = require("./values/LiteralValue")
FunctionValue = require("./values/FunctionValue")
_ = require "./utilities"
assert = require "assert"

module.exports =

  valueMacros:

    # TODO add arg definitions


    identity: (args, scope, options) -> _.map args, _.identity

    hsv: (args, scope, options) ->
      [ColorValue.hsla(args['0'], args['1'], args['2'], 1)]
    hsva: (args, scope, options) ->
      [ColorValue.hsla(args['0'], args['1'], args['2'], args['3'])]
    hsl: (args, scope, options) ->
      [ColorValue.hsla(args['0'], args['1'], args['2'], 1)]
    hsla: (args, scope, options) ->
      [ColorValue.hsla(args['0'], args['1'], args['2'], args['3'])]
    rgb: (args, scope, options) ->
      [ColorValue.rgba(args['0'], args['1'], args['2'], 1)]
    rgba: (args, scope, options) ->
      [ColorValue.rgba(args['0'], args['1'], args['2'], args['3'])]

    polygon: (args, scope, options) ->
      [new LiteralValue("Polygon")]
    point: (args, scope, options) ->
      [new LiteralValue("Point")]

    fill: (args, scope, options) ->
      [new LiteralValue("fill")]
    symbol: (args, scope, options) ->
      [new LiteralValue("symbol")]
    raster: (args, scope, options) ->
      [new LiteralValue("raster")]
    background: (args, scope, options) ->
      [new LiteralValue("background")]

    # Line may refer to the layer paint type or the layer geometry type
    line: (args, scope, options) ->
      if options.rule == "type" && options.meta
        new LiteralValue("LineString")
      else if options.filter
        new LiteralValue("line")
      else
        throw new Error("The use of 'line' is ambigious in this context")

    'function': (args, scope, options) ->
      stops = []
      for key, value of args
        if key == "base" then continue
        if (stop = parseInt(key)) != NaN then stops.push([key, value])
        else assert false
      assert stops.length > 0

      [new FunctionValue(args.base, stops)]



  ruleMacros: {}