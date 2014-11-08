{parse} = require("../source/parser")
assert = require("assert")

it "should mark the stylesheet as version 6", ->
  assert.deepEqual parse("").version, 6

describe "sources", ->
  it "should put sources in the stylesheet", ->
    stylesheet = parse '&test { foo: "bar" }'
    assert.deepEqual stylesheet.sources, {test: {foo: "bar"}}

  it "should allow sources to be referenced by layers", ->
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

describe "layers", ->

  it "should put layers in the stylesheet", ->
    stylesheet = parse '#test { foo: "bar" }'
    assert.deepEqual stylesheet.layers, {test: {paint: {foo: "bar"}}}