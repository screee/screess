{parse} = require("../compiled/source/main")
assert = require("assert")

describe "property macros", ->

  it "should shadow property macros in enclosing scopes", ->
    stylesheet = parse """
      foo(value) = { background-color: value }
      #layer {
        foo = { foo: 17 }
        type: 'background'
        foo
      }
    """
    assert.equal stylesheet.layers[0].paint['background-color'], 17

  describe "arguments", ->

    it "should accept no arguments", ->
      stylesheet = parse """
        property = { background-color: "bar" }
        #layer { type: 'background'; property }
      """
      assert.equal stylesheet.layers[0].paint['background-color'], "bar"

    it "should accept property-style arguments", ->
      stylesheet = parse """
        foo(one, two) = { background-color: two }
        #layer { type: 'background'; foo: "baz" "bar" }
      """
      assert.equal stylesheet.layers[0].paint['background-color'], "bar"

    it "should accept function-style arguments", ->
      stylesheet = parse """
        foo(one, two) = { background-color: two }
        #layer { type: 'background'; foo("baz" "bar") }
      """
      assert.equal stylesheet.layers[0].paint['background-color'], "bar"

  it "should apply value macros", ->
    stylesheet = parse """
      foo(value) = { background-color: identity(value) }
      #layer { type: 'background'; foo: "bar" }
    """
    assert.equal stylesheet.layers[0].paint['background-color'], "bar"

  it "should apply other property macros", ->
    stylesheet = parse """
      inner(value) = { background-color: value }
      outer(value) = { inner: value }
      #layer { type: 'background'; outer: "bar" }
    """
    assert.equal stylesheet.layers[0].paint['background-color'], "bar"

  it "should respect default arguments in property-style invocation", ->
    stylesheet = parse """
      foo(one, two = #fff) = { background-color: two }
      #layer {type: 'background'; foo: 0}
    """
    assert.equal stylesheet.layers[0].paint['background-color'], '#ffffff'

  it "should respect default arguments in function-style invocation", ->
    stylesheet = parse """
      foo(one, two = #fff) = { background-color: two }
      #layer {type: 'background'; foo(0)}
    """
    assert.equal stylesheet.layers[0].paint['background-color'], '#ffffff'


  it "should select a property macro by the number of arguments supplied", ->
    stylesheet = parse """
      foo = { background-color: 0 }
      foo(value) = { background-color: value }
      #layer { type: 'background'; foo: 17 }
    """
    assert.equal stylesheet.layers[0].paint['background-color'], 17
