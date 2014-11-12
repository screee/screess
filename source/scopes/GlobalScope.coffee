Scope = require("./Scope")
_ = require("../utilities")
LayerScope = require('./LayerScope')
Globals = require('../globals')
ValueMacro = require('../macros/ValueMacro')
RuleMacro = require('../macros/RuleMacro')

{literalValue} = require('../values/LiteralValue')

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
    else if macro = @getGlobalValueMacro(name, argValues)
      macro
    else if argValues.length == 0
      ValueMacro.createFromValue(name, @, literalValue(name))

  getRuleMacro: (name, argValues) ->
    super || @getGlobalRuleMacro(name, argValues)

  getGlobalRuleMacro: (name, argValues) ->
    # TODO

  getGlobalValueMacro: (name, argValues) ->
    if fn = Globals.valueMacros[name]
      ValueMacro.createFromFunction(name, null, @, fn)
    else
      null

  getGlobalScope: -> @

  addLayerScope: (name, scope) ->
    if @layerScopes[name] then throw new Error("Duplicate entries for layer scope '#{name}'")
    @layerScopes[name] = new LayerScope(name, @)

  toMGLGlobalScope: (options) ->
    options = _.extend(scope: "global", globalScope: @, options)

    layers = _.map @layerScopes, (layer) -> layer.toMGLLayerScope(options)
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
