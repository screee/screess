Expression = require "./Expression"
ArrayValue = require "../values/ArrayValue"
AttributeReferenceValue = require "../values/AttributeReferenceValue"
_ = require "../utilities"
assert = require "assert"

module.exports = class SetOperatorExoression extends Expression

  constructor: (@left, @operator, @right) ->

  toMGLFilter: (scope, options) ->
    lvalue = @left.toValue(scope, options)
    rvalue = @right.toValue(scope, options)

    assert lvalue instanceof AttributeReferenceValue
    assert rvalue instanceof ArrayValue

    [@operator, lvalue.toMGLValue(options)].concat(rvalue.toMGLValue(options))


