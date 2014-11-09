{parse} = require("../source/parser")
assert = require("assert")

describe "macro", ->

  describe "value", ->

    it "should apply recursively", ->
      stylesheet = parse """
        foo(baz) = baz
        #layer { $bar: foo(foo(17)) }
      """
      assert.equal stylesheet.layers.layer.bar, 17

    describe "arguments", ->

      it "should respect a macro without arguments", ->
        stylesheet = parse """
          foo = 17
          #layer { $bar: foo }
        """
        assert.equal stylesheet.layers.layer.bar, 17

      it "should respect a macro with one argument", ->
        stylesheet = parse """
          foo(baz) = baz
          #layer { $bar: foo(17) }
        """
        assert.equal stylesheet.layers.layer.bar, 17

      it "should respect a macro with many arguments with commas", ->
        stylesheet = parse """
          foo(baz, qux) = qux
          #layer { $bar: foo(0, 17) }
        """
        assert.equal stylesheet.layers.layer.bar, 17

      it "should respect a macro with many arguments without commas", ->
        stylesheet = parse """
          foo(baz qux) = qux
          #layer { $bar: foo(0 17) }
        """
        assert.equal stylesheet.layers.layer.bar, 17

  describe "rule", ->

    it "should apply", ->
      stylesheet = parse """
        rule(one) = { foo: one }
        #layer { rule: "bar" }
      """
      assert.equal stylesheet.layers.layer.paint.foo, "bar"
