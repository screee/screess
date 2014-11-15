{parse} = require("../source/main")
assert = require("assert")

describe "value macro", ->

  describe "shadowing", ->

    it "should shadow a value macro in an enclosing scope", ->
      stylesheet = parse """
        test(value) = value
        #layer {
          test = test(17)
          foo: test
        }
      """
      assert.equal stylesheet.layers[0].paint.foo, 17

  it "should turn into a literal string if undefined", ->
    stylesheet = parse """
      #layer { $bar: baz }
    """
    assert.equal stylesheet.layers[0].bar, "baz"

  describe "return values", ->

    it "should return one value", ->
      stylesheet = parse """
        identity(value) = value
        #layer { $bar: identity(17) }
      """
      assert.equal stylesheet.layers[0].bar, 17

    it "should return multiple values to another value macro", ->
      stylesheet = parse """
        identity(one two) = one two
        second(one two three) = two
        #layer { $bar: second(0 identity(1 2)) }
      """
      assert.equal stylesheet.layers[0].bar, 1

  describe "argument evaluation", ->

    it "should evaluate without arguments", ->
      stylesheet = parse """
        foo = 17
        #layer { $bar: foo }
      """
      assert.equal stylesheet.layers[0].bar, 17

    it "should evaluate with positional arguments", ->
      stylesheet = parse """
        foo(one, two, three, four) = three
        #layer { $bar: foo(1 2 3 4) }
      """
      assert.equal stylesheet.layers[0].bar, 3

    it "should evaluate with named arguments", ->
      stylesheet = parse """
        foo(one, two, three, four) = three
        #layer { $bar: foo(four:4 three:3 two:2 one:1) }
      """
      assert.equal stylesheet.layers[0].bar, 3

    it "should evaluate with positional and named arguments", ->
      stylesheet = parse """
        foo(foo bar) = bar
        #layer { $bar: foo(bar:17 10) }
      """
      assert.equal stylesheet.layers[0].bar, 17

    it "should evaluate using an optional argument", ->
      stylesheet = parse """
        foo(one, two = 17) = two
        #layer { $bar: foo(0) }
      """
      assert.equal stylesheet.layers[0].bar, 17

    it "should override an optional argument", ->
      stylesheet = parse """
        foo(one, two = 0) = two
        #layer { $bar: foo(0, 17) }
      """
      assert.equal stylesheet.layers[0].bar, 17

  describe "argument matching", ->

    it "should match by number of positional arguments", ->
      stylesheet = parse """
        foo(one) = one
        foo(one, two) = two
        foo(one, two, three) = one
        #layer { $bar: foo(0, 17) }
      """
      assert.equal stylesheet.layers[0].bar, 17

    it "should match by names of named arguments", ->
      stylesheet = parse """
        foo(foo, bar) = one
        foo(one, two) = two
        #layer { $bar: foo(two:17 0) }
      """
      assert.equal stylesheet.layers[0].bar, 17

    it "should match with optional arguments", ->
      stylesheet = parse """
        foo(one, two, three=3) = two
        #layer { $bar: foo(0, 17) }
      """
      assert.equal stylesheet.layers[0].bar, 17

  describe "scope", ->

    it "should apply recursively in arguments", ->
      stylesheet = parse """
        identity(value) = value
        #layer { $bar: identity(identity(17)) }
      """
      assert.equal stylesheet.layers[0].bar, 17

    it "should apply other value macros to optional arguments", ->
      stylesheet = parse """
        inner = 17
        outer(value=inner) = value
        #layer { $bar: outer }
      """
      assert.equal stylesheet.layers[0].bar, 17

    it "should apply other value macros", ->
      stylesheet = parse """
        inner = 17
        outer = inner
        #layer { $bar: outer }
      """
      assert.equal stylesheet.layers[0].bar, 17

    it "should apply other value macros in the global scope", ->
      stylesheet = parse """
        #layer { $bar: identity(17) }
      """
      assert.equal stylesheet.layers[0].bar, 17
