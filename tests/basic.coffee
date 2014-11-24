{parse} = require("../compiled/source/main")
assert = require("assert")
_ = require('../compiled/source/utilities')

it "should mark the stylesheet as version 6", ->
  assert.deepEqual parse("").version, 6

describe "sources", ->
  it "should be respected", ->
    stylesheet = parse """
      #layer {
        $type: background
        $source: source(bar: "baz")
      }
    """
    assert.deepEqual _.values(stylesheet.sources)[0], bar: "baz"
    assert stylesheet.layers[0].source

  it "should rename tile-size to tileSize", ->
    stylesheet = parse """
      #layer {
        $type: background
        $source: source(tile-size: 17)
      }
    """
    assert.deepEqual  _.values(stylesheet.sources)[0].tileSize, 17

describe "layers", ->

  it "should be in the stylesheet", ->
    stylesheet = parse '#test {$type: background}'
    assert stylesheet.layers[0]

  it "should respect layout properties", ->
    stylesheet = parse '#test { $type: line; line-cap: square }'
    assert.equal stylesheet.layers[0].layout['line-cap'], 'square'

  it "should respect paint properties", ->
    stylesheet = parse '#test { $type: line; line-color: red }'
    assert.equal stylesheet.layers[0].paint['line-color'], 'red'

  it "should respect meta properties", ->
    stylesheet = parse '#test { $type: background; $foo: "bar" }'
    assert.equal stylesheet.layers[0].foo, "bar"

  it "should respect its filter", ->
    stylesheet = parse '#test { $type: background; $filter: @name == "foo" }'
    assert stylesheet.layers[0].filter
