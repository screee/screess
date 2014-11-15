Expression = require "./Expression"
AttributeReferenceValue = require "../values/AttributeReferenceValue"
_ = require "../utilities"
assert = require "assert"

module.exports = class ComparisonOperatorExpression extends Expression

  constructor: (@left, @operator, @right) ->

  toMGLFilter: (scope, options) ->
    lvalue = @left.toValue(scope, options)
    rvalue = @right.toValue(scope, options)

    # Only one of the values can be an AttributeReferenceValue and it must be
    # the lvalue
    assert lvalue instanceof AttributeReferenceValue
    assert !(rvalue instanceof AttributeReferenceValue)

    [@operator, lvalue.name, rvalue.toMGLValue(options)]
