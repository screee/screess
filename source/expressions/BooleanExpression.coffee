Expression = require "./Expression"
AttributeReferenceValue = require "../values/AttributeReferenceValue"
_ = require "../utilities"
assert = require "assert"

module.exports = class BooleanExpression extends Expression

  operators: {"||": "any", "&&": "all"}

  constructor: (@operator, @expressions) ->

  toMGLFilter: (scope, options) ->
    options = _.extend(filter: true, options)
    [@operators[@operator]].concat(
      _.map(
        @expressions,
        (expression) -> expression.toMGLFilter(scope, options)
      )
    )
