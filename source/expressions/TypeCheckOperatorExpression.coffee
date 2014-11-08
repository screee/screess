Expression = require "./Expression"
AttributeReferenceValue = require "../values/AttributeReferenceValue"
_ = require "../utilities"
assert = require "assert"

module.exports = class TypeCheckExpression extends Expression

  constructor: (@type) ->

  toMGLFilter: (scope, options) ->
    ["==", "$type", @type.toMGLValue(scope, options)]
