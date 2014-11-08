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

    # TODO move this logic to the Macro classes
    for name, fn of Globals.valueMacros
      @valueMacros[name] = new ValueMacro(name, [0...fn.length - 2], fn)

    # TODO move this logic to the Macro classes
    for name, fn of Globals.ruleMacros
      @ruleMacros[name] = new RuleMacro(@, name, [0...fn.length - 2], fn)

  addLayerScope: (name, scope) ->
    if @layerScopes[name] then throw new Error("Duplicate entries for layer scope '#{name}'")
    @layerScopes[name] = new LayerScope(@)

  toMGLGlobalScope: (options) ->
    options = _.extend(scope: "global", options)

    layers = _.objectMap @layerScopes, (name, layer) -> layer.toMGLLayerScope(options)
    sources = _.objectMap @sourceScopes, (name, source) -> source.toMGLSourceScope(options)
    rules = @toMGLRules(options, @rules)

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
