{parse} = require("../source/parser")
assert = require("assert")

describe "rule macro", ->

  describe "arguments", ->

    it "should accept arguments", ->
      stylesheet = parse """
        second(one, two) = { foo: two }
        #layer { second: "baz" "bar" }
      """
      assert.equal stylesheet.layers.layer.paint.foo, "bar"

    it "should accept multiple return values from a rule macro", ->
      stylesheet = parse """
        args = "baz" "bar"
        second(one, two) = { foo: two }
        #layer { second: args }
      """
      assert.equal stylesheet.layers.layer.paint.foo, "bar"

  it "should apply value macros", ->
    stylesheet = parse """
      rule(value) = { foo: identity(value) }
      #layer { rule: "bar" }
    """
    assert.equal stylesheet.layers.layer.paint.foo, "bar"

  it "should apply other rule macros", ->
    stylesheet = parse """
      inner(value) = { foo: value }
      outer(value) = { inner: value }
      #layer { outer: "bar" }
    """
    assert.equal stylesheet.layers.layer.paint.foo, "bar"

  it "should respect default arguments", ->
    stylesheet = parse """
      rule(one, two=17) = { foo: two }
      #layer { rule: 0 }
    """
    assert.equal stylesheet.layers.layer.paint.foo, 17

  it "should evaluate optional arguments in the macro's scope"
