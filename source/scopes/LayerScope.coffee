ClassScope = require('./ClassScope')
_ = require('underscore')

module.exports = class LayerScope extends require("./Scope")
  selector: null

  addClassScope: (name) ->
    @classScopes[name] = new ClassScope(@)

  constructor: (parent) ->
    super(parent)
    @classScopes = {}

  evaluate: ->
    output = paint: @evaluateRules()

    _.extend(output, Object.mapKeys(
      Object.map(@classScopes, (name, scope) => scope.evaluate(@)),
      (name, evaluated) -> "paint.#{name}"
    ))

    output
