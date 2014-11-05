LayerScope = require('./LayerScope')

module.exports = class GlobalScope extends require("./Scope")

  layerScopes: {}

  addLayerScope: (name, scope) ->
    @layerScopes[name] = new LayerScope(@)

  evaluate: ->
    layers: Object.map @layerScopes, (name, layer) -> layer.evaluate()
