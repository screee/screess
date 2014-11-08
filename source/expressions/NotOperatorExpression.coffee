Expression = require "./Expression"
_ = require "../utilities"
assert = require "assert"

module.exports = class SetOperatorExoression extends Expression

  constructor: (@expression) ->

  toMGLFilter: (scope, options) ->
    ["none", @expression.toMGLFilter(scope, options)]

