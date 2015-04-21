assert = require("assert")
_ = require('../compiled/utilities')

Parser = require("../compiled/main")
parse = (source) -> Parser.parse(source).evaluate()

describe "include", ->
  it "should load properties", ->
    stylesheet = parse """
      include('tests/include-fixture.screess')
    """
    assert.equal stylesheet["magic-number"], 17
