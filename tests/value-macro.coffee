{parse} = require("../source/parser")
assert = require("assert")

describe "value macro", ->

  describe "return values", ->

    it "should return one value", ->
      stylesheet = parse """
        identity(value) = value
        #layer { $bar: identity(17) }
      """
      assert.equal stylesheet.layers.layer.bar, 17

    it "should return multiple values to another value macro", ->
      stylesheet = parse """
        identity(one two) = one two
        second(one two three) = two
        #layer { $bar: second(0 identity(1 2)) }
      """
      assert.equal stylesheet.layers.layer.bar, 1

  describe "argument evaluation", ->

    it "should evaluate without arguments", ->
      stylesheet = parse """
        foo = 17
        #layer { $bar: foo }
      """
      assert.equal stylesheet.layers.layer.bar, 17

    it "should evaluate with positional arguments", ->
      stylesheet = parse """
        foo(one, two, three, four) = three
        #layer { $bar: foo(1 2 3 4) }
      """
      assert.equal stylesheet.layers.layer.bar, 3

    it "should evaluate with named arguments", ->
      stylesheet = parse """
        foo(one, two, three, four) = three
        #layer { $bar: foo(four:4 three:3 two:2 one:1) }
      """
      assert.equal stylesheet.layers.layer.bar, 3

    it "should evaluate with positional and named arguments", ->
      stylesheet = parse """
        foo(foo bar) = bar
        #layer { $bar: foo(bar:17 10) }
      """
      assert.equal stylesheet.layers.layer.bar, 17

    it "should evaluate using an optional argument", ->
      stylesheet = parse """
        foo(one, two = 17) = two
        #layer { $bar: foo(0) }
      """
      assert.equal stylesheet.layers.layer.bar, 17

    it "should override an optional argument", ->
      stylesheet = parse """
        foo(one, two = 0) = two
        #layer { $bar: foo(0, 17) }
      """
      assert.equal stylesheet.layers.layer.bar, 17

    it "should evaluate optional arguments in the macro's scope"

  describe "argument matching", ->

    it "should match by number of positional arguments", ->
      stylesheet = parse """
        foo(one) = one
        foo(one, two) = two
        foo(one, two, three) = one
        #layer { $bar: foo(0, 17) }
      """
      assert.equal stylesheet.layers.layer.bar, 17

    it "should match by names of named arguments", ->
      stylesheet = parse """
        foo(foo, bar) = one
        foo(one, two) = two
        #layer { $bar: foo(one:0, 17) }
      """
      assert.equal stylesheet.layers.layer.bar, 17

    it "should match with optional arguments", ->
      stylesheet = parse """
        foo(one, two, three=3) = two
        #layer { $bar: foo(0, 17) }
      """
      assert.equal stylesheet.layers.layer.bar, 17

  describe "scope", ->

    # it "should shadow another value macro", ->
    #   stylesheet = parse """
    #     identity(one) = identity(one)
    #     #layer { $bar: outer }
    #   """
    #   assert.equal stylesheet.layers.layer.bar, 17

    it "should apply recursively in arguments", ->
      stylesheet = parse """
        identity(value) = value
        #layer { $bar: identity(identity(17)) }
      """
      assert.equal stylesheet.layers.layer.bar, 17

    it "should apply other value macros", ->
      stylesheet = parse """
        inner = 17
        outer = inner
        #layer { $bar: outer }
      """
      assert.equal stylesheet.layers.layer.bar, 17

    it "should apply other value macros in the global scope", ->
      stylesheet = parse """
        #layer { $bar: identity(17) }
      """
      assert.equal stylesheet.layers.layer.bar, 17
