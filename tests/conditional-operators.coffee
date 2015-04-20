{parse} = require("../compiled/main")
assert = require("assert")
_ = require('../compiled/utilities')

parseValue = (value, context = {}) ->
  stylesheet = parse "#layer { type: 'background'; scree-test-meta: #{value} }"
  stylesheet.layers[0]['scree-test-meta']

describe "conditional operators", ->

  it "should parse conditional assignment operator", ->
    value = parseValue "true ? 1 : 2"
    assert.equal(value, 1)

    value = parseValue "false ? 1 : 2"
    assert.equal(value, 2)

  it "should parse null coalescing operator", ->
    value = parseValue "null ?? 1 ?? 2"
    assert.equal(value, 1)


