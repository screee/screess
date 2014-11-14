Value = require "../values/value"
assert = require "assert"
_ = require "../utilities"

# scopeTypes:
#   source: {}
#   layer: {}
#   global: {}
#   class: {}

module.exports = class Scope

  constructor: (@parent) ->
    assert !@parent || _.is(@parent, Scope)
    @properties = {}
    @valueMacros = []
    @propertyMacros = []

  getGlobalScope: -> @parent.getGlobalScope()

  addProperty: (name, expressions) ->
    if @properties[name] then throw new Error("Duplicate entries for property '#{name}'")
    @properties[name] = expressions

  addValueMacro: (name, args, body) ->
    ValueMacro = require "../macros/ValueMacro"
    # TODO move this logic to ValueMacro
    if _.isArray(body)
      macro = ValueMacro.createFromExpressions(name, args, @, body)
    else if _.isFunction
      macro = ValueMacro.createFromFunction(name, args, @, body)
    @valueMacros.unshift(macro)

  addPropertyMacro: (name, args, body) ->
    PropertyMacro = require "../macros/PropertyMacro"
    macro = new PropertyMacro(@, name, args, body)
    @propertyMacros.unshift(macro)
    macro.scope

  getSourceScope: (name) ->
    @sourceScopes[name] || @parent?.getSourceScope(name)

  getValueMacro: (name, argValues, options) ->
    for macro in @valueMacros
      if macro.matches(name, argValues) && !_.contains(options.valueMacroStack, macro)
        return macro

    @parent?.getValueMacro(name, argValues, options)

  getPropertyMacro: (name, argValues, options) ->
    for macro in @propertyMacros
      if macro.matches(name, argValues) && !_.contains(options.propertyMacroStack, macro)
        return macro

    @parent?.getPropertyMacro(name, argValues, options)

  toMGLProperties: (options, properties) ->
    output = {}

    for name, expressions of properties
      options.property = name
      values = _.flatten _.map expressions, (expression) =>
        expression.toValues(@, options)

      if (propertyMacro = @getPropertyMacro(name, values, options))
        options.propertyMacroStack.push propertyMacro
        _.extend(output, propertyMacro.toMGLScope(values, options))
        options.propertyMacroStack.pop()
      else
        if values.length != 1
          throw new Error("Cannot apply #{values.length} args to primitive property '#{name}'")
        output[name] = values[0].toMGLValue(options)

      options.property = null

    output

