assert = require("assert")

Parser = require("../compiled/parser")
parse = (source) -> Parser.parse(source).evaluate()

describe "property macros", ->

  it "should shadow property macros in enclosing scopes", ->
    stylesheet = parse """
      foo(value) = { scree-test-meta: value }
      #layer {
        foo = { foo(17) }
        type: 'background'
        foo()
      }
    """
    assert.equal stylesheet.layers[0]['scree-test-meta'], 17

  describe "arguments", ->

    it "should accept no arguments with parenthesis", ->
      stylesheet = parse """
        property = { scree-test-meta: "bar" }
        #layer { type: 'background'; property() }
      """
      assert.equal stylesheet.layers[0]['scree-test-meta'], "bar"


    it "should accept property-style arguments", ->
      stylesheet = parse """
        foo(one, two) = { scree-test-meta: two }
        #layer { type: 'background'; foo("baz" "bar") }
      """
      assert.equal stylesheet.layers[0]['scree-test-meta'], "bar"

  it "should apply value macros", ->
    stylesheet = parse """
      foo(value) = { scree-test-meta: identity(value) }
      #layer { type: 'background'; foo("bar") }
    """
    assert.equal stylesheet.layers[0]['scree-test-meta'], "bar"

  it "should apply other property macros", ->
    stylesheet = parse """
      inner(value) = { scree-test-meta: value }
      outer(value) = { inner(value) }
      #layer { type: 'background'; outer("bar") }
    """
    assert.equal stylesheet.layers[0]['scree-test-meta'], "bar"

  it "should respect default arguments", ->
    stylesheet = parse """
      foo(one, two = #fff) = { scree-test-meta: two }
      #layer {type: 'background'; foo(0)}
    """
    assert.equal stylesheet.layers[0]['scree-test-meta'], '#ffffff'


  it "should select a property macro by the number of arguments supplied", ->
    stylesheet = parse """
      foo = { scree-test-meta: 0 }
      foo(value) = { scree-test-meta: value }
      #layer { type: 'background'; foo(17) }
    """
    assert.equal stylesheet.layers[0]['scree-test-meta'], 17
