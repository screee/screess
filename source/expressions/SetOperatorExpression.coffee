Expression = require "./Expression"
ArrayValue = require "../values/ArrayValue"
AttributeReferenceValue = require "../values/AttributeReferenceValue"
_ = require "../utilities"
assert = require "assert"
Value = require '../values/Value'

module.exports = class SetOperatorExoression extends Expression

  constructor: (@left, @operator, @right) ->

  toMGLFilter: (scope, options) ->
    lvalue = @left.toValue(scope, options)
    # TODO allow for multiple rvalues
    rvalue = @right.toValue(scope, options)

    assert lvalue instanceof AttributeReferenceValue
    assert rvalue instanceof ArrayValue

    [@operator, lvalue.name].concat(Value.toMGLValue(rvalue, options))


