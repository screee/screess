ColorValue = require "./values/ColorValue"
FunctionValue = require "./values/FunctionValue"
_ = require "./utilities"
assert = require "assert"
Value = require './values/Value'

module.exports =

  valueMacros:

    source: (source, options) ->
      name = source.name || _.uniq()
      delete source.name

      if source["tile-size"]
        source.tileSize = source["tile-size"]
        delete source["tile-size"]

      options.getGlobalScope().addSource(name, source)
      [name]

    identity: (args) -> _.values args

    hsv: (args) -> [ColorValue.hsla(args['0'], args['1'], args['2'], 1)]
    hsva: (args) -> [ColorValue.hsla(args['0'], args['1'], args['2'], args['3'])]
    hsl: (args) -> [ColorValue.hsla(args['0'], args['1'], args['2'], 1)]
    hsla: (args) -> [ColorValue.hsla(args['0'], args['1'], args['2'], args['3'])]
    rgb: (args) -> [ColorValue.rgba(args['0'], args['1'], args['2'], 1)]
    rgba: (args) -> [ColorValue.rgba(args['0'], args['1'], args['2'], args['3'])]

    # Object Types
    # Line may refer to the layer paint type or the layer geometry type
    polygon: -> ["Polygon"]
    point: -> ["Point"]
    line: (args, options) ->
      if options.property == "type" && options.isMetaProperty
        "LineString"
      else if options.isFilter()
        "line"
      else
        throw new Error("The use of 'line' is ambigious in this context")

    'function': (args) ->
      stops = []
      for key, value of args
        if key == "base" then continue
        if (stop = parseInt(key)) != NaN then stops.push([key, value])
        else assert false
      assert stops.length > 0
      [new FunctionValue(args.base, stops)]
