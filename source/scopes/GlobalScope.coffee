Scope = require("./Scope")
_ = require("../utilities")
LayerScope = require('./LayerScope')
Globals = require('../globals')
ValueMacro = require('../macros/ValueMacro')
RuleMacro = require('../macros/RuleMacro')
assert = require 'assert'
Options = require('../Options')

{literalValue} = require('../values/LiteralValue')


module.exports = class GlobalScope extends Scope

  constructor: ->
    super()
    @layerScopes = {}
    @sources = {}

    @addValueMacro(name, null, fn) for name, fn of Globals.valueMacros
    @addRuleMacro(name, null, fn) for name, fn of Globals.ruleMacros

  addSource: (name, source) ->
    @sources[name] = source

  getGlobalScope: -> @

  getValueMacro: (name, argValues) ->
    if macro = super
      macro
    else if argValues.length == 0
      ValueMacro.createFromValue(name, @, literalValue name)
    else
      null

  addLayerScope: (name, scope) ->
    if @layerScopes[name] then throw new Error("Duplicate entries for layer scope '#{name}'")
    @layerScopes[name] = new LayerScope(name, @)

  toMGLGlobalScope: (options = new Options()) ->
    options.scopeStack.push(@)

    layers = _.map @layerScopes, (layer) -> layer.toMGLLayerScope(options)
    rules = @toMGLRules(options, @rules)
    sources = _.objectMapValues @sources, (name, source) ->
      _.objectMapValues(source, (key, value) -> value.toMGLValue(options))

    transition =
      duration: rules["transition-delay"]
      delay: rules["transition-duration"]
    delete rules["transition-delay"]
    delete rules["transition-duration"]

    options.scopeStack.pop()

    _.extend(rules, {
      version: 6
      layers: layers
      sources: sources
      transition: transition
    })
