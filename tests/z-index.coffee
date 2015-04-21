assert = require("assert")
_ = require('../compiled/utilities')

Parser = require("../compiled/main")
parse = (source) -> Parser.parse(source).evaluate()

describe "z-index", ->

  it "should work on layers", ->

    stylesheet = parse """
      #second { type: 'background' }
      #third { type: 'background' }
      #first { type: 'background'; z-index: -1 }
    """
    assert.deepEqual  stylesheet.layers[0].id, "first"
    assert.deepEqual  stylesheet.layers[1].id, "second"
    assert.deepEqual  stylesheet.layers[2].id, "third"

  it "should work on sublayers", ->

    stylesheet = parse """
      # {
        #second { type: 'background' }
        #third { type: 'background' }
        #first { type: 'background'; z-index: -1 }
      }
    """
    assert.deepEqual  stylesheet.layers[0].layers[0].id, "first"
    assert.deepEqual  stylesheet.layers[0].layers[1].id, "second"
    assert.deepEqual  stylesheet.layers[0].layers[2].id, "third"