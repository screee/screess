{parse} = require("../compiled/source/main")
assert = require("assert")

describe "value", ->

  parseValue = (value, context = {}) ->
    if context.filterLvalue
      stylesheet = parse "#layer { type: background; filter: #{value} == 1 }"
      stylesheet.layers[0].filter[1]
    else if context.filterRvalue
      stylesheet = parse "#layer { type: background; filter: @test == #{value} }"
      stylesheet.layers[0].filter[2]
    else
      stylesheet = parse "#layer { type: background; background-color: #{value} }"
      stylesheet.layers[0].paint['background-color']

  describe "array", ->

    it "should parse with comma seperators", ->
      assert.deepEqual parseValue("[1,2 , 3]"), [1,2,3]

    it "should parse with space seperators", ->
      assert.deepEqual parseValue("[1 2 3]"), [1,2,3]

    it "should allow filters to be members", ->
      assert.deepEqual parseValue("[@class == footway]"), [["==", "class", "footway"]]

    it "should allow nested arrays", ->
      assert.deepEqual parseValue("[[[[ 1 ]]]]"), [[[[1]]]]

  describe "map", ->

    it "should parse with comma seperators", ->
      assert.deepEqual parseValue("[one:1,two:2 , three:3]"), {one: 1, two: 2, three: 3}

    it "should parse with space seperators", ->
      assert.deepEqual parseValue("[one:1 two:2 three:3]"), {one: 1, two: 2, three: 3}

    it "should allow property access by dot notation", ->
      assert.deepEqual parseValue("[one:1 two:2 three:3].three"), 3

    it "should allow property access by subscript notation", ->
      assert.deepEqual parseValue('[one:1 two:2 three:3]["three"]'), 3

    it "should allow maps inside maps", ->
      assert.deepEqual parseValue("[one:[two:[three: [four: 4]]]]"), {one: {two: {three: {four: 4}}}}

    it "shoud allow recursive property accesses", ->
      assert.deepEqual parseValue('[one:[two:[three: 3]]].one["two"].three'), 3

    it "should allow filters to be members", ->
      assert.deepEqual parseValue("[filter: @class == footway]"), {filter: ["==", "class", "footway"]}

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

  describe "null", ->

    it "should parse", ->
      assert.equal parseValue("null"), null


  describe "attribute reference", ->

    it "should parse in a property", ->
      assert.equal parseValue("@foo"), "{foo}"

    it "should parse in a filter", ->
      assert.equal parseValue("@foo", filterLvalue:true), "foo"

  describe "string", ->

    # TODO allow single quoted strings

    it "should parse", ->
      assert.equal parseValue('"foo"'), "foo"

    it "should parse with literal values interpolated", ->
      assert.equal parseValue('"test #{7} test"'), "test 7 test"

    it "should parse with attribute reference values", ->
      assert.equal parseValue('"test @foo test"'), "test {foo} test"

    it "should parse with attribute reference values interpolated", ->
      assert.equal parseValue('"test #{@foo} test"'), "test {foo} test"

    it "should parse an empty string", ->
      assert.equal parseValue('""'), ""

  describe "function value", ->

    it "should apply with a base", ->
      assert.deepEqual(
        parseValue('function(base:0.5 0:100 5:50 10:25)'),
        stops: [[0, 100], [5, 50], [10, 25]], base:0.5
      )

    it "should apply without a base", ->
      assert.deepEqual(
        parseValue('function(0:100 5:50 10:25)'),
        stops: [[0, 100], [5, 50], [10, 25]]
      )

  describe "color", ->

    it "should parse hex", ->
      assert.equal parseValue('#fff'), "#ffffff"

    it "should parse a color function", ->
      assert.equal parseValue('rgba(255 255 255 1)'), "#ffffff"

    it "should parse a color function with alpha", ->
      assert.equal parseValue('rgba(255 255 255 0.5)'), "rgba(255, 255, 255, 0.5)"

describe "arithmetic operators", ->

  it "should apply '+'", ->
    stylesheet = parse """
      #test { scree-test-meta: 1 + 1; }
    """
    assert.equal stylesheet.layers[0]['scree-test-meta'], 2

  it "should apply '-'", ->
    stylesheet = parse """
      #test { scree-test-meta: 3 - 1; }
    """
    assert.equal stylesheet.layers[0]['scree-test-meta'], 2

  it "should apply '*'", ->
    stylesheet = parse """
      #test { scree-test-meta: 2 * 2; }
    """
    assert.equal stylesheet.layers[0]['scree-test-meta'], 4

  it "should apply '/'", ->
    stylesheet = parse """
      #test { scree-test-meta: 4 / 2; }
    """
    assert.equal stylesheet.layers[0]['scree-test-meta'], 2

  it "should apply to function values as rvalues", ->
    stylesheet = parse """
      #test { scree-test-meta: 1 + function(base:0.5 1:1 2:2) }
    """
    assert.deepEqual stylesheet.layers[0]['scree-test-meta'], {
      base: 0.5,
      stops: [[1, 2], [2, 3]]
    }

  it "should apply to function values as lvalues", ->
    stylesheet = parse """
      #test { scree-test-meta: function(base:0.5 1:1 2:2) + 1 }
    """
    assert.deepEqual stylesheet.layers[0]['scree-test-meta'], {
      base: 0.5,
      stops: [[1, 2], [2, 3]]
    }

  it "should support chaining", ->
    stylesheet = parse """
      #test { scree-test-meta: 1 + 1 + 1 + 1; }
    """
    assert.equal stylesheet.layers[0]['scree-test-meta'], 4

  it "should support order of operations", ->
    stylesheet = parse """
      #test { scree-test-meta: 2 * 2 + 2 * 2; }
    """
    assert.equal stylesheet.layers[0]['scree-test-meta'], 8

  it "should support parenthesis", ->
    stylesheet = parse """
      #test { scree-test-meta: 2 * (2 + 2); }
    """
    assert.equal stylesheet.layers[0]['scree-test-meta'], 8
