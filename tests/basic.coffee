{parse} = require("../source/main")
assert = require("assert")

it "should mark the stylesheet as version 6", ->
  assert.deepEqual parse("").version, 6

describe "sources", ->
  it "should be respected", ->
    stylesheet = parse """
      #layer {
        $source: source(name: "test" bar: "baz")
      }
    """
    assert.deepEqual stylesheet.sources.test, bar: "baz"
    assert.equal stylesheet.layers[0].source, "test"

  it "should rename tile-size to tileSize", ->
    stylesheet = parse """
      #layer {
        $source: source(name: "test", tile-size: 17)
      }
    """
    assert.deepEqual stylesheet.sources.test.tileSize, 17

describe "layers", ->

  it "should be in the stylesheet", ->
    stylesheet = parse '#test {}'
    assert stylesheet.layers[0]

  it "should respect paint rules", ->
    stylesheet = parse '#test { foo: "bar" }'
    assert.equal stylesheet.layers[0].paint.foo, "bar"

  it "should respect meta rules", ->
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
