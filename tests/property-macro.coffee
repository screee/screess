{parse} = require("../compiled/source/main")
assert = require("assert")

describe "property macro", ->

  describe "shadowing", ->

    it "should shadow a property macro in an enclosing scope", ->
      stylesheet = parse """
        property(value) = { background-color: value }
        #layer {
          type: 'background'
          property = { property: 17 }
          property
        }
      """
      assert.equal stylesheet.layers[0].paint['background-color'], 17

  describe "arguments", ->

    it "should apply a property macro with no arguments", ->
      stylesheet = parse """
        property = { background-color: "bar" }
        #layer { type: 'background'; property }
      """
      assert.equal stylesheet.layers[0].paint['background-color'], "bar"

    it "should accept arguments", ->
      stylesheet = parse """
        second(one, two) = { background-color: two }
        #layer { type: 'background'; second: "baz" "bar" }
      """
      assert.equal stylesheet.layers[0].paint['background-color'], "bar"

    it "should accept multiple return values from a property macro", ->
      stylesheet = parse """
        args = "baz" "bar"
        second(one, two) = { background-color: two }
        #layer { type: 'background'; second: args }
      """
      assert.equal stylesheet.layers[0].paint['background-color'], "bar"

  it "should apply value macros", ->
    stylesheet = parse """
      property(value) = { background-color: identity(value) }
      #layer { type: 'background'; property: "bar" }
    """
    assert.equal stylesheet.layers[0].paint['background-color'], "bar"

  it "should apply other property macros", ->
    stylesheet = parse """
      inner(value) = { background-color: value }
      outer(value) = { inner: value }
      #layer { type: 'background'; outer: "bar" }
    """
    assert.equal stylesheet.layers[0].paint['background-color'], "bar"

  it "should respect default arguments", ->
    stylesheet = parse """
      property(one, two=17) = { background-color: two }
      #layer {
        type: 'background'
        property: 0
      }
    """
    assert.equal stylesheet.layers[0].paint['background-color'], 17

  it "should select a property macro by the number of arguments supplied", ->
    stylesheet = parse """
      property = { background-color: 0 }
      property(value) = { background-color: value }
      #layer {
        type: 'background'
        property: 17
      }
    """
    assert.equal stylesheet.layers[0].paint['background-color'], 17

