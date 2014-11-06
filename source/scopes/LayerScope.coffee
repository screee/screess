ClassScope = require('./ClassScope')
_ = require('../utilities')

module.exports = class LayerScope extends require("./Scope")
  selector: null

  addMetaRule: (name, expressions) ->
    @metaRules[name] = expressions

  addClassScope: (name) ->
    @classScopes[name] = new ClassScope(@)

  constructor: (parent) ->
    super(parent)
    @classScopes = {}
    @metaRules = {}

  evaluate: ->
    console.log @metaRules
    console.log @evaluateRules(@metaRules)

    _.extend(
      @evaluateRules(@metaRules)
      paint: @evaluateRules()
      _.objectMapKeys(
        _.objectMap(@classScopes, (name, scope) => scope.evaluate(@)),
        (name, evaluated) -> "paint.#{name}"
      ))
