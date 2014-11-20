{parse} = require("../compiled/source/main")
assert = require("assert")

describe "property macro", ->

  describe "shadowing", ->

    it "should shadow a property macro in an enclosing scope", ->
      stylesheet = parse """
        property(value) = { foo: value }
        #layer {
          property = { property: 17 }
          property
        }
      """
      assert.equal stylesheet.layers[0].paint.foo, 17

  describe "arguments", ->

    it "should apply a property macro with no arguments", ->
      stylesheet = parse """
        property = { foo: "bar" }
        #layer { property }
      """
      assert.equal stylesheet.layers[0].paint.foo, "bar"

    it "should accept arguments", ->
      stylesheet = parse """
        second(one, two) = { foo: two }
        #layer { second: "baz" "bar" }
      """
      assert.equal stylesheet.layers[0].paint.foo, "bar"

    it "should accept multiple return values from a property macro", ->
      stylesheet = parse """
        args = "baz" "bar"
        second(one, two) = { foo: two }
        #layer { second: args }
      """
      assert.equal stylesheet.layers[0].paint.foo, "bar"

  it "should apply value macros", ->
    stylesheet = parse """
      property(value) = { foo: identity(value) }
      #layer { property: "bar" }
    """
    assert.equal stylesheet.layers[0].paint.foo, "bar"

  it "should apply other property macros", ->
    stylesheet = parse """
      inner(value) = { foo: value }
      outer(value) = { inner: value }
      #layer { outer: "bar" }
    """
    assert.equal stylesheet.layers[0].paint.foo, "bar"

  it "should respect default arguments", ->
    stylesheet = parse """
      property(one, two=17) = { foo: two }
      #layer { property: 0 }
    """
    assert.equal stylesheet.layers[0].paint.foo, 17

  it "should select a property macro by the number of arguments supplied", ->
    stylesheet = parse """
      property = { foo: 0 }
      property(value) = { foo: value }
      #layer { property: 17 }
    """
    assert.equal stylesheet.layers[0].paint.foo, 17

