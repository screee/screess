{parse} = require("../compiled/main")
assert = require("assert")

describe "value macro", ->

  describe "shadowing", ->

    it "should shadow a value macro in an enclosing scope", ->
      stylesheet = parse """
        test(value) = value
        #layer {
          type: 'background';
          test = test(17)
          scree-test-meta: test
        }
      """
      assert.equal stylesheet.layers[0]['scree-test-meta'], 17

  it "should not turn into a literal string if undefined", ->
    assert.throws ->
      stylesheet = parse """
        #layer {
          type: 'background'
          scree-test-meta: baz
        }
      """

  it "should return values", ->
    stylesheet = parse """
      identity(value) = value
      #layer {
        type: 'background'
        scree-test-meta: identity(17)
      }
    """
    assert.equal stylesheet.layers[0]['scree-test-meta'], 17

  describe "argument evaluation", ->

    it "should evaluate without arguments", ->
      stylesheet = parse """
        foo = 17
        #layer {
          type: 'background'
          scree-test-meta: foo
        }
      """
      assert.equal stylesheet.layers[0]['scree-test-meta'], 17

    it "should evaluate with positional arguments", ->
      stylesheet = parse """
        foo(one, two, three, four) = three
        #layer {
          type: 'background'
          scree-test-meta: foo(1 2 3 4)
        }
      """
      assert.equal stylesheet.layers[0]['scree-test-meta'], 3

    it "should evaluate with named arguments", ->
      stylesheet = parse """
        foo(one, two, three, four) = three
        #layer {
          type: 'background'
          scree-test-meta: foo(four:4 three:3 two:2 one:1)
        }
      """
      assert.equal stylesheet.layers[0]['scree-test-meta'], 3

    it "should evaluate with positional and named arguments", ->
      stylesheet = parse """
        foo(foo bar) = bar
        #layer {
          type: 'background'
          scree-test-meta: foo(bar:17 10)
        }
      """
      assert.equal stylesheet.layers[0]['scree-test-meta'], 17

    it "should evaluate using an optional argument", ->
      stylesheet = parse """
        foo(one, two = 17) = two
        #layer {
          type: 'background'
          scree-test-meta: foo(0)
        }
      """
      assert.equal stylesheet.layers[0]['scree-test-meta'], 17

    it "should override an optional argument", ->
      stylesheet = parse """
        foo(one, two = 0) = two
        #layer {
          type: 'background'
          scree-test-meta: foo(0, 17)
        }
      """
      assert.equal stylesheet.layers[0]['scree-test-meta'], 17

  describe "argument matching", ->

    it "should match by number of positional arguments", ->
      stylesheet = parse """
        foo(one) = one
        foo(one, two) = two
        foo(one, two, three) = one
        #layer {
          type: 'background'
          scree-test-meta: foo(0, 17)
        }
      """
      assert.equal stylesheet.layers[0]['scree-test-meta'], 17

    it "should match by names of named arguments", ->
      stylesheet = parse """
        foo(foo, bar) = one
        foo(one, two) = two
        #layer {
          type: 'background'
          scree-test-meta: foo(two:17 0)
        }
      """
      assert.equal stylesheet.layers[0]['scree-test-meta'], 17

    it "should match with optional arguments", ->
      stylesheet = parse """
        foo(one, two, three=3) = two
        #layer {
          type: 'background'
          scree-test-meta: foo(0, 17)
        }
      """
      assert.equal stylesheet.layers[0]['scree-test-meta'], 17

    it "should match with wildcard arguments", ->
      stylesheet = parse """
        length(*) = `arguments().length`
        #layer {
          scree-test-meta: length(0, 1, 2, 3)
        }
      """
      assert.equal stylesheet.layers[0]['scree-test-meta'], 4

  describe "scope", ->

    it "should apply recursively in arguments", ->
      stylesheet = parse """
        identity(value) = value
        #layer {
          type: 'background'
          scree-test-meta: identity(identity(17))
        }
      """
      assert.equal stylesheet.layers[0]['scree-test-meta'], 17

    it "should apply other value macros to optional arguments", ->
      stylesheet = parse """
        inner = 17
        outer(value=inner) = value
        #layer {
          type: 'background'
          scree-test-meta: outer
        }
      """
      assert.equal stylesheet.layers[0]['scree-test-meta'], 17

    it "should apply other value macros", ->
      stylesheet = parse """
        inner = 17
        outer = inner
        #layer {
          type: 'background'
          scree-test-meta: outer
        }
      """
      assert.equal stylesheet.layers[0]['scree-test-meta'], 17

    it "should apply other value macros in the global scope", ->
      stylesheet = parse """
        #layer {
          type: 'background'
          scree-test-meta: identity(17)
        }
      """
      assert.equal stylesheet.layers[0]['scree-test-meta'], 17
