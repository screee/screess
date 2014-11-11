Scope = require("./Scope")
_ = require("../utilities")
LayerScope = require('./LayerScope')
Globals = require('../globals')
ValueMacro = require('../macros/ValueMacro')
RuleMacro = require('../macros/RuleMacro')

module.exports = class GlobalScope extends Scope

  constructor: ->
    super()
    @layerScopes = {}
    @sources = {}

  addSource: (name, source) ->
    @sources[name] = source

  getValueMacro: (name, argValues) ->
    if macro = super
      macro
    else if fn = Globals.valueMacros[name]
      ValueMacro.createFromFunction(name, null, @, fn)
    else
      null

  getRuleMacro: (name, argValues) ->
    super
    # # TODO move this logic to the Macro classes
    # for name, fn of Globals.ruleMacros
    #   @ruleMacros.push new RuleMacro(@, name, [0...fn.length - 2], fn)

  getGlobalScope: -> @

  addLayerScope: (name, scope) ->
    if @layerScopes[name] then throw new Error("Duplicate entries for layer scope '#{name}'")
    @layerScopes[name] = new LayerScope(@)

  toMGLGlobalScope: (options) ->
    options = _.extend(scope: "global", globalScope: @, options)

    layers = _.objectMapValues @layerScopes, (name, layer) -> layer.toMGLLayerScope(options)
    rules = @toMGLRules(options, @rules)
    sources = _.objectMapValues @sources, (name, source) ->
      _.objectMapValues(source, (key, value) -> value.toMGLValue(options))

    transition =
      duration: rules["transition-delay"]
      delay: rules["transition-duration"]

    delete rules["transition-delay"]
    delete rules["transition-duration"]

    _.extend(rules, {
      version: 6
      layers: layers
      sources: sources
      transition: transition
    })
