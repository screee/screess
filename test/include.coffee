assert = require("assert")
_ = require('../compiled/utilities')

Parser = require("../compiled/parser")
parse = (source) -> Parser.parse(source).evaluate()

describe "include", ->
  it "should load properties", ->
    stylesheet = parse """
      include('test/include-fixture.screess')
    """
    assert.equal stylesheet["magic-number"], 17

  it "should load value macros", ->
    stylesheet = parse """
      include('test/include-fixture.screess')
      scree-test-meta: uppercase('baz')
    """
    assert.equal stylesheet["scree-test-meta"], "BAZ"
