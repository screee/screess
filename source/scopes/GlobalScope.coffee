Scope = require("./Scope")
_ = require("../utilities")
LayerScope = require('./LayerScope')
Globals = require('../globals')
ValueMacro = require('../macros/ValueMacro')
RuleMacro = require('../macros/RuleMacro')

module.exports = class GlobalScope extends Scope

  layerScopes: {}

  constructor: ->
    super()

    for name, fn of Globals.valueMacros
      @valueMacros[name] = new ValueMacro(name, [0...fn.length], fn)

    for name, fn of Globals.ruleMacros
      @ruleMacros[name] = new RuleMacro(@, name, [0...fn.length], fn)

  addLayerScope: (name, scope) ->
    @layerScopes[name] = new LayerScope(@)

  toMGLGlobalScope: ->
    layers: _.objectMap @layerScopes, (name, layer) ->
      layer.toMGLLayerScope()
