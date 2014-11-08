Scope = require("./Scope")
ClassScope = require('./ClassScope')
_ = require('../utilities')

module.exports = class LayerScope extends Scope
  selector: null

  addMetaRule: (name, expressions) ->
    @metaRules[name] = expressions

  addClassScope: (name) ->
    @classScopes[name] = new ClassScope(@)

  setFilter: (@filterExpression) ->

  constructor: (parent) ->
    super(parent)
    @classScopes = {}
    @metaRules = {}

  toMGLLayerScope: (options) ->
    options = _.extend(scope: "layer", options)

    filterOptions = _.extend(filter: true, meta: true, rule: "filter", options)
    metaFilterRule = filter: @filterExpression?.toMGLFilter(@, filterOptions)}

    metaRules = @toMGLRules(_.extend(meta:true, options), @metaRules)
    paintRules = paint: @toMGLRules(options, @rules)
    paintClassRules = _.objectMapKeysValues(
      @classScopes,
      (name, scope) => ["paint.#{name}", scope.toMGLClassScope(options)]
    )

    _.extend(metaRules, paintRules, paintClassRules, metaFilterRule)
