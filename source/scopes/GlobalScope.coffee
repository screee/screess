Scope = require("./Scope")
_ = require("../utilities")
LayerScope = require('./LayerScope')
SourceScope = require('./SourceScope')
Globals = require('../globals')
ValueMacro = require('../macros/ValueMacro')
RuleMacro = require('../macros/RuleMacro')

module.exports = class GlobalScope extends Scope

  constructor: ->
    super()

    @layerScopes = {}
    @sourceScopes = {}

    # TODO move this logic to the Macro classes
    for name, fn of Globals.valueMacros
      @valueMacros[name] = new ValueMacro(name, [0...fn.length - 2], fn)

    # TODO move this logic to the Macro classes
    for name, fn of Globals.ruleMacros
      @ruleMacros[name] = new RuleMacro(@, name, [0...fn.length - 2], fn)

  addLayerScope: (name, scope) ->
    if @layerScopes[name] then throw new Error("Duplicate entries for layer scope '#{name}'")
    @layerScopes[name] = new LayerScope(@)

  addSourceScope: (name, scope) ->
    if @sourceScopes[name] then throw new Error("Duplicate entries for source scope '#{name}'")
    @sourceScopes[name] = new SourceScope(@)

  toMGLGlobalScope: (options) ->
    options = _.extend(scope: "global", options)

    layers = _.objectMap @layerScopes, (name, layer) -> layer.toMGLLayerScope(options)
    sources = _.objectMap @sourceScopes, (name, source) -> source.toMGLSourceScope(options)
    rules = @toMGLRules(options, @rules)

    transition =
      duration: rules["transition-delay"]
      delay: rules["transition-duration"]

    _.extend(rules, {
      version: 6
      layers: layers
      sources: sources
      transition: transition
    })
