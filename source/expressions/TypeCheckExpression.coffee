Expression = require "./Expression"
AttributeReferenceValue = require "../values/AttributeReferenceValue"
_ = require "../utilities"
assert = require "assert"

module.exports = class TypeCheckExpression extends Expression

  constructor: (@type) ->

  toMGLFilter: (scope, options) ->
    options = _.extend(filter: true, options)
    ["==", "$type", @type.toMGLValue(scope, options)]
