assert = require("assert")
_ = require('../compiled/utilities')

Parser = require("../compiled/parser")
parse = (source) -> Parser.parse(source).evaluate()

describe "javascript", ->

  it "can be embedded as a statement", ->
    stylesheet = parse """
      `properties.foo = 17`
    """
    assert.equal stylesheet["foo"], 17

  it "can be embedded as a statement", ->
    stylesheet = parse """
      `properties.foo = identity(42)`
    """
    assert.equal stylesheet["foo"], 42
