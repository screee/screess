Scope = require("./Scope")
ClassScope = require('./ClassScope')
_ = require('../utilities')

module.exports = class LayerScope extends Scope
  selector: null

  addMetaProperty: (name, expressions) ->
    if @metaProperties[name] then throw new Error("Duplicate entries for metaproperty '#{name}'")
    @metaProperties[name] = expressions

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
    @metaProperties = {}

  toMGLLayerScope: (options) ->
    options.scopeStack.push(@)

    if @filterExpression
      options.pushFilter()
      options.meta = true
      options.property = "filter"

      metaFilterProperty = {filter: @filterExpression?.toMGLFilter(@, options)}

      options.popFilter()
      options.meta = false
      options.property = null
    else
      metaFilterProperty = null

    if @source
      if !@getSourceScope(@source) then throw "Unknown source '#{@source}'"
      metaSourceProperty = source: @source
    else
      metaSourceProperty = null

    options.meta = true
    metaProperties = @toMGLProperties(options, @metaProperties)
    options.meta = false

    paintProperties = paint: @toMGLProperties(options, @properties)

    paintClassProperties = _.objectMap(
      @classScopes,
      (scope, name) => ["paint.#{name}", scope.toMGLClassScope(options)]
    )

    options.scopeStack.pop()

    _.extend(id: @name, metaProperties, paintProperties, paintClassProperties, metaFilterProperty, metaSourceProperty)
