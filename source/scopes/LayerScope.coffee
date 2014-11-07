Scope = require("./Scope")
ClassScope = require('./ClassScope')
_ = require('../utilities')

module.exports = class LayerScope extends Scope
  selector: null

  addMetaRule: (name, expressions) ->
    @metaRules[name] = expressions

  addClassScope: (name) ->
    @classScopes[name] = new ClassScope(@)

  setFilter: (@filter) ->

  constructor: (parent) ->
    super(parent)
    @classScopes = {}
    @metaRules = {}

  toMGLLayerScope: ->
    metaRules = @toMGLRules(@metaRules)

    paintRules = paint: @toMGLRules()

    paintClassRules = _.objectMapKeysValues @classScopes, (name, scope) =>
      ["paint.#{name}", scope.toMGLClassScope()]

    _.extend(metaRules, paintRules, paintClassRules)
