ClassScope = require('./ClassScope')
_ = require('../utilities')

module.exports = class LayerScope extends require("./Scope")
  selector: null

  addClassScope: (name) ->
    @classScopes[name] = new ClassScope(@)

  constructor: (parent) ->
    super(parent)
    @classScopes = {}

  evaluate: ->
    output = paint: @evaluateRules()

    _.extend(output, _.objectMapKeys(
      _.objectMap(@classScopes, (name, scope) => scope.evaluate(@)),
      (name, evaluated) -> "paint.#{name}"
    ))

    output
