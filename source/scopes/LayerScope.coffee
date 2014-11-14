Scope = require("./Scope")
ClassScope = require('./ClassScope')
_ = require('../utilities')

module.exports = class LayerScope extends Scope
  selector: null

  addMetaRule: (name, expressions) ->
    if @metaRules[name] then throw new Error("Duplicate entries for metarule '#{name}'")
    @metaRules[name] = expressions

  addClassScope: (name) ->
    @classScopes[name] ||= new ClassScope(@)

  setFilter: (filterExpression) ->
    if @filterExpression then throw new Error("Duplicate filters")
    @filterExpression = filterExpression

  setSource: (source) ->
    if @source then throw new Error("Duplicate sources")
    @source = source

  constructor: (@name, parent) ->
    super(parent)
    @classScopes = {}
    @metaRules = {}

  toMGLLayerScope: (options) ->
    options.scopeStack.push(@)

    if @filterExpression
      options.pushFilter()
      options.meta = true
      options.rule = "filter"

      metaFilterRule = {filter: @filterExpression?.toMGLFilter(@, options)}

      options.popFilter()
      options.meta = false
      options.rule = null
    else
      metaFilterRule = null

    if @source
      if !@getSourceScope(@source) then throw "Unknown source '#{@source}'"
      metaSourceRule = source: @source
    else
      metaSourceRule = null

    options.meta = true
    metaRules = @toMGLRules(options, @metaRules)
    options.meta = false

    paintRules = paint: @toMGLRules(options, @rules)

    paintClassRules = _.objectMap(
      @classScopes,
      (scope, name) => ["paint.#{name}", scope.toMGLClassScope(options)]
    )

    options.scopeStack.pop()

    _.extend(id: @name, metaRules, paintRules, paintClassRules, metaFilterRule, metaSourceRule)
