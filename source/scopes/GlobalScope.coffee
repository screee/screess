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

    # TODO move this logic to the Macro classes
    for name, fn of Globals.valueMacros
      @valueMacros[name] = new ValueMacro(name, [0...fn.length - 2], fn)

    # TODO move this logic to the Macro classes
    for name, fn of Globals.ruleMacros
      @ruleMacros[name] = new RuleMacro(@, name, [0...fn.length - 2], fn)

  addLayerScope: (name, scope) ->
    @layerScopes[name] = new LayerScope(@)

  toMGLGlobalScope: (options) ->
    options = _.extend(scope: "global", options)

    layers = layers: _.objectMap @layerScopes, (name, layer) -> layer.toMGLLayerScope(options)
    globals = @toMGLRules(options, @rules)

    _.extend(layers, globals)
