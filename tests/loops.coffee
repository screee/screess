assert = require("assert")
_ = require('../compiled/utilities')

Parser = require("../compiled/main")
parse = (source) -> Parser.parse(source).evaluate()

describe "loops", ->

  it "should iterate over an array's values to create layers", ->
    stylesheet = parse """
      for value in [0,1,2] {
        # { scree-test-meta: value }
      }
    """
    assert.equal stylesheet.layers[0]['scree-test-meta'], 0
    assert.equal stylesheet.layers[1]['scree-test-meta'], 1
    assert.equal stylesheet.layers[2]['scree-test-meta'], 2

  it "should iterate over an object's values to create layers", ->
    stylesheet = parse """
      for value in [ zero:0; one:1; two:2 ] {
        # { scree-test-meta: value }
      }
    """
    assert.equal stylesheet.layers[0]['scree-test-meta'], 0
    assert.equal stylesheet.layers[1]['scree-test-meta'], 1
    assert.equal stylesheet.layers[2]['scree-test-meta'], 2

  it "should iterate over an object's keys and values to create layers", ->
    stylesheet = parse """
      for key value in [zero:0; one:1; two:2] {
        # { scree-test-meta: [key, value] }
      }
    """
    assert.deepEqual stylesheet.layers[0]['scree-test-meta'], ['zero', 0]
    assert.deepEqual stylesheet.layers[1]['scree-test-meta'], ['one', 1]
    assert.deepEqual stylesheet.layers[2]['scree-test-meta'], ['two', 2]

  it "should iterate over an array's keys and values to create layers", ->
    stylesheet = parse """
      for key value in [2, 4, 6] {
        # { scree-test-meta: [key, value] }
      }
    """
    assert.deepEqual stylesheet.layers[0]['scree-test-meta'], [0, 2]
    assert.deepEqual stylesheet.layers[1]['scree-test-meta'], [1, 4]
    assert.deepEqual stylesheet.layers[2]['scree-test-meta'], [2, 6]

  it "should place sublayers in the right order", ->
    stylesheet = parse """
      # { scree-test-meta: 1 }
      for value in [1] {
        # { scree-test-meta: 0; z-index: -1 }
        # { scree-test-meta: 2 }
        # { scree-test-meta: 4; z-index: 1 }
      }
      # { scree-test-meta: 3 }
    """
    assert.equal stylesheet.layers[0]['scree-test-meta'], 0
    assert.equal stylesheet.layers[1]['scree-test-meta'], 1
    assert.equal stylesheet.layers[2]['scree-test-meta'], 2
    assert.equal stylesheet.layers[3]['scree-test-meta'], 3
    assert.equal stylesheet.layers[4]['scree-test-meta'], 4
