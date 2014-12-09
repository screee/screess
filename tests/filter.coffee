{parse} = require("../compiled/source/main")
assert = require("assert")

describe "filters", ->

  parseFilter = (filter) ->
    stylesheet = parse "#layer { type: background; filter: #{filter} }"
    stylesheet.layers[0].filter

  describe "typecheck operator", ->
    it "should parse the 'is' operator", ->
        assert.deepEqual parseFilter("is LineString"), ["==", "$type", "LineString"]

  describe "comparison operator", ->
    for operator in ["==", ">=", "<=", "<", ">", "!="]
      it "should parse the '#{operator}' operator with attribute references", ->
        assert.deepEqual parseFilter("@foo #{operator} \"bar\""), [operator, "foo", "bar"]

    it "should parse the '==' operator with literals", ->
      assert.equal parseFilter("1 == 1"), true
      assert.equal parseFilter("1 == 2"), false

    it "should parse the '>' operator with literals", ->
      assert.deepEqual parseFilter("1 > 0"), true
      assert.deepEqual parseFilter("0 > 0"), false

  describe "set operator expression", ->

    it "should parse the 'in' operator with an attribute reference", ->
      assert.deepEqual parseFilter("@foo in [1 2 3]"), ["in", "foo", 1, 2, 3]

    it "should parse the '!in' operator with an attribute reference", ->
      assert.deepEqual parseFilter("@foo !in [1 2 3]"), ["!in", "foo", 1, 2, 3]

    it "should parse the 'in' operator with a literal value", ->
      assert.equal parseFilter("1 in [1 2 3]"), true
      assert.equal parseFilter("0 in [1 2 3]"), false

    it "should parse the '!in' operator with a literal value", ->
      assert.equal parseFilter("0 !in [1 2 3]"), true
      assert.equal parseFilter("1 !in [1 2 3]"), false

    it "should throw an error if the rvalue isn't an array value", ->
      assert.throws ->
        parseFilter("@foo in 1")

  describe "boolean logic operator expression", ->

    it "should parse the '&&' operator with attribute references", ->
      assert.deepEqual(
        parseFilter("@foo == 1 && @bar == 2"),
        ["all", ["==", "foo", 1], ["==", "bar", 2]]
      )

    it "should parse the '||' operator with attribute references", ->
      assert.deepEqual(
        parseFilter("@foo == 1 || @bar == 2"),
        ["any", ["==", "foo", 1], ["==", "bar", 2]]
      )

    it "should parse the '!' operator with attribute references", ->
      assert.deepEqual(
        parseFilter("!@foo == 1"),
        ["none", ["==", "foo", 1]]
      )

    it "should parse the '&&' operator with literals", ->
      assert.equal(parseFilter("1 == 1 && 2 == 2"), true)
      assert.equal(parseFilter("1 == 1 && 1 == 2"), false)

    it "should parse the '||' operator with literals", ->
      assert.equal(parseFilter("1 == 2 || 2 == 2"), true)
      assert.equal(parseFilter("1 == 2 || 1 == 2"), false)

    it "should parse the '&&' operator with literals and attribute references", ->
      assert.deepEqual(
        parseFilter("1 == 1 && @foo == 1 && @bar == 2"),
        ["all", ["==", "foo", 1], ["==", "bar", 2]]
      )
      assert.deepEqual(parseFilter("1 == 1 && @foo == 1"), ["==", "foo", 1])
      assert.equal(parseFilter("1 == 2 && @foo == 1"), false)
