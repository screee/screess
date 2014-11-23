{parse} = require("../compiled/source/main")
assert = require("assert")
_ = require('../compiled/source/utilities')

it "should mark the stylesheet as version 6", ->
  assert.deepEqual parse("").version, 6

describe "sources", ->
  it "should be respected", ->
    stylesheet = parse """
      #layer {
        $source: source(bar: "baz")
      }
    """
    assert.deepEqual _.values(stylesheet.sources)[0], bar: "baz"
    assert stylesheet.layers[0].source

  it "should rename tile-size to tileSize", ->
    stylesheet = parse """
      #layer {
        $source: source(tile-size: 17)
      }
    """
    assert.deepEqual  _.values(stylesheet.sources)[0].tileSize, 17

describe "layers", ->

  it "should be in the stylesheet", ->
    stylesheet = parse '#test {}'
    assert stylesheet.layers[0]

  it "should respect paint properties", ->
    stylesheet = parse '#test { foo: "bar" }'
    assert.equal stylesheet.layers[0].paint.foo, "bar"

  it "should respect meta properties", ->
    stylesheet = parse '#test { $foo: "bar" }'
    assert.equal stylesheet.layers[0].foo, "bar"

  it "should throw an error if an unknown source is referenced", ->
    assert.throws ->
      stylesheet = parse """
        &source { foo: "bar" }
        #layer { $source: &notsource }
      """

  it "should respect its filter", ->
    stylesheet = parse '#test { $filter: @name == "foo" }'
    assert stylesheet.layers[0].filter
