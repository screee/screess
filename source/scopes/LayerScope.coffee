Scope = require("./Scope")
ClassScope = require('./ClassScope')
_ = require('../utilities')

module.exports = class LayerScope extends Scope
  selector: null

  addMetaRule: (name, expressions) ->
    if @metaRules[name] then throw new Error("Duplicate entries for metarule '#{name}'")
    @metaRules[name] = expressions

  addClassScope: (name) ->
    if @classScopes[name]
      @classScopes[name]
    else
      @classScopes[name] = new ClassScope(@)

  setFilter: (filterExpression) ->
    if @filterExpression then throw new Error("Duplicate filters")
    @filterExpression = filterExpression

  setSource: (source) ->
    if @source then throw new Error("Duplicate sources")
    @source = source

  constructor: (parent) ->
    super(parent)
    @classScopes = {}
    @metaRules = {}

  toMGLLayerScope: (options) ->
    options = _.extend(scope: "layer", options)

    if @filterExpression
      filterOptions = _.extend(filter: true, meta: true, rule: "filter", options)
      metaFilterRule = {filter: @filterExpression?.toMGLFilter(@, filterOptions)}
    else
      metaFilterRule = null

    if @source
      if !@getSourceScope(@source) then throw "Unknown source '#{@source}'"
      metaSourceRule = source: @source
    else
      metaSourceRule = null

    metaRules = @toMGLRules(_.extend(meta:true, options), @metaRules)

    paintRules = paint: @toMGLRules(options, @rules)

    paintClassRules = _.objectMapKeysValues(
      @classScopes,
      (name, scope) => ["paint.#{name}", scope.toMGLClassScope(options)]
    )

    _.extend(metaRules, paintRules, paintClassRules, metaFilterRule, metaSourceRule)
