{parse} = require("../source/parser")
assert = require("assert")

describe "value", ->

  parseValue = (value, options = {}) ->
    if options.filterLvalue
      stylesheet = parse "#layer { $filter: #{value} == 1 }"
      stylesheet.layers.layer.filter[1]
    else if options.filterRvalue
      stylesheet = parse "#layer { $filter: @test == #{value} }"
      stylesheet.layers.layer.filter[2]
    else
      stylesheet = parse "#layer { foo: #{value} }"
      stylesheet.layers.layer.paint.foo

  describe "array", ->

    it "should parse with comma seperators", ->
      assert.deepEqual parseValue("[1,2 , 3]"), [1,2,3]

    it "should parse with space seperators", ->
      assert.deepEqual parseValue("[1 2 3]"), [1,2,3]

  describe "number", ->

    it "should parse an integer", ->
      assert.equal parseValue("12340"), 12340

    it "should parse a float with a leading integer", ->
      assert.equal parseValue("12340.12340"), 12340.1234

    it "should parse a float without a leading integer", ->
      assert.equal parseValue(".12340"), 0.1234

    it "should parse a float with a leading 0", ->
      assert.equal parseValue("0.12340"), 0.1234

  describe "boolean", ->

    it "should parse true", ->
      assert.equal parseValue("true"), true

    it "should parse false", ->
      assert.equal parseValue("false"), false

  describe "boolean", ->

    it "should parse true", ->
      assert.equal parseValue("true"), true

    it "should parse false", ->
      assert.equal parseValue("false"), false

  describe "attribute reference", ->

    it "should parse in a rule", ->
      assert.equal parseValue("@foo"), "{foo}"

    it "should parse in a filter", ->
      assert.equal parseValue("@foo", filterLvalue:true), "foo"

  describe "string", ->

    it "should parse", ->
      assert.equal parseValue('"foo"'), "foo"

    it "should parse an empty string", ->
      assert.equal parseValue('""'), ""