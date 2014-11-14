Expression = require "./Expression"
AttributeReferenceValue = require "../values/AttributeReferenceValue"
_ = require "../utilities"
assert = require "assert"

module.exports = class BooleanLogicExpression extends Expression

  operators: {"||": "any", "&&": "all"}

  constructor: (@operator, @expressions) ->

  toMGLFilter: (scope, options) ->
    options.pushFilter()
    filter = [@operators[@operator]].concat(
      _.map(
        @expressions,
        (expression) -> expression.toMGLFilter(scope, options)
      )
    )
    options.popFilter()
    filter
