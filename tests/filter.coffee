{parse} = require("../source/main")
assert = require("assert")

describe "filters", ->

  parseFilter = (filter) ->
    stylesheet = parse "#layer { $filter: #{filter} }"
    stylesheet.layers[0].filter

  describe "comparison operator", ->
    for operator in ["==", ">=", "<=", "<", ">", "!="]
      it "should parse the '#{operator}' operator", ->
        assert.deepEqual parseFilter("@foo #{operator} \"bar\""), [operator, "foo", "bar"]

    it "should throw an error if the lvalue isn't an attribute reference", ->
      assert.throws ->
        parseFilter("1 == 1")

  describe "set operator expression", ->

    it "should parse the 'in' operator", ->
      assert.deepEqual parseFilter("@foo in [1 2 3]"), ["in", "foo", 1, 2, 3]

    it "should parse the '!in' operator", ->
      assert.deepEqual parseFilter("@foo !in [1 2 3]"), ["!in", "foo", 1, 2, 3]

    it "should throw an error if the lvalue isn't an attribute reference", ->
      assert.throws ->
        parseFilter("1 in [1 2 3]")

    it "should throw an error if the rvalue isn't an array value", ->
      assert.throws ->
        parseFilter("@foo in 1")

  describe "boolean logic operator expression", ->

    it "should parse the '&&' operator", ->
      assert.deepEqual(
        parseFilter("@foo == 1 && @bar == 2"),
        ["all", ["==", "foo", 1], ["==", "bar", 2]]
      )

    it "should parse the '||' operator", ->
      assert.deepEqual(
        parseFilter("@foo == 1 || @bar == 2"),
        ["any", ["==", "foo", 1], ["==", "bar", 2]]
      )

    it "should parse the '!' operator", ->
      assert.deepEqual(
        parseFilter("!@foo == 1"),
        ["none", ["==", "foo", 1]]
      )
