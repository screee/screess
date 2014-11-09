{parse} = require("../source/parser")
assert = require("assert")

it "should mark the stylesheet as version 6", ->
  assert.deepEqual parse("").version, 6

describe "sources", ->
  it "should be in the stylesheet", ->
    stylesheet = parse '&test { }'
    assert stylesheet.sources.test

  it "should respect rules", ->
    stylesheet = parse '&test { foo: "bar" }'
    assert.equal stylesheet.sources.test.foo, "bar"

describe "layers", ->

  it "should be in the stylesheet", ->
    stylesheet = parse '#test {}'
    assert stylesheet.layers.test

  it "should respect paint rules", ->
    stylesheet = parse '#test { foo: "bar" }'
    assert.equal stylesheet.layers.test.paint.foo, "bar"

  it "should respect meta rules", ->
    stylesheet = parse '#test { $foo: "bar" }'
    assert.equal stylesheet.layers.test.foo, "bar"

    it "should respect its source", ->
    stylesheet = parse """
      &source { foo: "bar" }
      #layer { $source: &source }
    """
    assert.equal stylesheet.layers.layer.source, "source"

  it "should throw an error if an unknown source is referenced", ->
    assert.throws ->
      stylesheet = parse """
        &source { foo: "bar" }
        #layer { $source: &notsource }
      """

  it "should respect its filter", ->
    stylesheet = parse '#test { $filter: @name == "foo" }'
    assert stylesheet.layers.test.filter
