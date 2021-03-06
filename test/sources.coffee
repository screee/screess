assert = require("assert")
_ = require('../compiled/utilities')

Parser = require("../compiled/parser")
parse = (source) -> Parser.parse(source).evaluate()

describe "sources", ->
  it "should be respected", ->
    stylesheet = parse """
      #layer {
        type: 'background'
        source-bar: "baz"
      }
    """
    assert.deepEqual _.values(stylesheet.sources)[0], bar: "baz"
    assert stylesheet.layers[0].source
    assert _.keys(stylesheet.sources)[0] == stylesheet.layers[0].source

  it "should be omitted", ->
    stylesheet = parse """
      #layer {
        type: 'background'
      }
    """
    assert.deepEqual _.keys(stylesheet.sources).length, 0
    assert !stylesheet.layers[0].source

it "should respect source layer", ->
    stylesheet = parse """
      #layer {
        source-layer: 'bar'
        type: 'background'
      }
    """
    assert.equal stylesheet.layers[0]["source-layer"], "bar"

  it "should rename tile-size to tileSize", ->
    stylesheet = parse """
      #layer {
        type: 'background'
        source-tile-size: 17
      }
    """
    assert.deepEqual  _.values(stylesheet.sources)[0].tileSize, 17