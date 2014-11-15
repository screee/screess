Value = require "../values/value"
MacroArgumentValues = require "../macros/MacroArgumentValues"
MacroArgumentDefinition = require '../macros/MacroArgumentDefinition'
assert = require "assert"
_ = require "../utilities"
{literalExpression} = require('../expressions/LiteralExpression')

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

  addLiteralValueMacros: (values) ->
    for name, value of values
      @addValueMacro(name, MacroArgumentDefinition.ZERO, [literalExpression(value)])

  addValueMacro: (name, argDefinition, body) ->
    assert _.is(argDefinition, MacroArgumentDefinition) || !argDefinition

    ValueMacro = require "../macros/ValueMacro"
    # TODO move this logic to ValueMacro
    if _.isArray(body)
      macro = ValueMacro.createFromExpressions(name, argDefinition, @, body)
    else if _.isFunction
      macro = ValueMacro.createFromFunction(name, argDefinition, @, body)
    @valueMacros.unshift(macro)

  addPropertyMacro: (name, argDefinition, body) ->
    assert _.is(argDefinition, MacroArgumentDefinition) || !argDefinition

    PropertyMacro = require "../macros/PropertyMacro"
    macro = new PropertyMacro(@, name, argDefinition, body)
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

      argValues = MacroArgumentValues.createFromExpressions(
        expression: expression for expression in expressions,
        @,
        options
      )

      if (propertyMacro = @getPropertyMacro(name, argValues, options))
        options.propertyMacroStack.push propertyMacro
        _.extend(output, propertyMacro.toMGLScope(argValues, options))
        options.propertyMacroStack.pop()
      else
        if argValues.length != 1 || argValues.positionalArgs.length != 1
          throw new Error("Cannot apply #{argValues.length} args to primitive property '#{name}'")

        output[name] = argValues.positionalArgs[0].toMGLValue(options)

      options.property = null

    output

