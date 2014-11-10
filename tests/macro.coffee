{parse} = require("../source/parser")
assert = require("assert")

describe "macro", ->

  describe "value", ->

    # it "should apply recursively", ->
    #   stylesheet = parse """
    #     foo(baz) = baz
    #     #layer { $bar: foo(foo(17)) }
    #   """
    #   assert.equal stylesheet.layers.layer.bar, 17

    # it "should respect a macro without arguments", ->
    #   stylesheet = parse """
    #     foo = 17
    #     #layer { $bar: foo }
    #   """
    #   assert.equal stylesheet.layers.layer.bar, 17

    it "should respect a macro with a positional argument", ->
      stylesheet = parse """
        foo(baz) = baz
        #layer { $bar: foo(17) }
      """
      assert.equal stylesheet.layers.layer.bar, 17

  # describe "rule", ->

  #   it "should apply with one argument", ->
  #     stylesheet = parse """
  #       rule(one) = { foo: one }
  #       #layer { rule: "bar" }
  #     """
  #     assert.equal stylesheet.layers.layer.paint.foo, "bar"

  #   it "should apply with many arguments", ->
  #     stylesheet = parse """
  #       rule(one, two) = { foo: two }
  #       #layer { rule: "baz" "bar" }
  #     """
  #     assert.equal stylesheet.layers.layer.paint.foo, "bar"
