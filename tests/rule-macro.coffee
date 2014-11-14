{parse} = require("../source/main")
assert = require("assert")

describe "rule macro", ->

  describe "shadowing", ->

    it "should shadow a rule macro in an enclosing scope", ->
      stylesheet = parse """
        rule(value) = { foo: value }
        #layer {
          rule = { rule: 17 }
          rule
        }
      """
      assert.equal stylesheet.layers[0].paint.foo, 17

  describe "arguments", ->

    it "should apply a rule macro with no arguments", ->
      stylesheet = parse """
        rule = { foo: "bar" }
        #layer { rule }
      """
      assert.equal stylesheet.layers[0].paint.foo, "bar"

    it "should accept arguments", ->
      stylesheet = parse """
        second(one, two) = { foo: two }
        #layer { second: "baz" "bar" }
      """
      assert.equal stylesheet.layers[0].paint.foo, "bar"

    it "should accept multiple return values from a rule macro", ->
      stylesheet = parse """
        args = "baz" "bar"
        second(one, two) = { foo: two }
        #layer { second: args }
      """
      assert.equal stylesheet.layers[0].paint.foo, "bar"

  it "should apply value macros", ->
    stylesheet = parse """
      rule(value) = { foo: identity(value) }
      #layer { rule: "bar" }
    """
    assert.equal stylesheet.layers[0].paint.foo, "bar"

  it "should apply other rule macros", ->
    stylesheet = parse """
      inner(value) = { foo: value }
      outer(value) = { inner: value }
      #layer { outer: "bar" }
    """
    assert.equal stylesheet.layers[0].paint.foo, "bar"

  it "should respect default arguments", ->
    stylesheet = parse """
      rule(one, two=17) = { foo: two }
      #layer { rule: 0 }
    """
    assert.equal stylesheet.layers[0].paint.foo, 17

  it "should select a rule macro by the number of arguments supplied", ->
    stylesheet = parse """
      rule = { foo: 0 }
      rule(value) = { foo: value }
      #layer { rule: 17 }
    """
    assert.equal stylesheet.layers[0].paint.foo, 17

