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
    @rules = {}
    @valueMacros = []
    @ruleMacros = []

  getGlobalScope: -> @parent.getGlobalScope()

  addRule: (name, expressions) ->
    if @rules[name] then throw new Error("Duplicate entries for rule '#{name}'")
    @rules[name] = expressions

  addValueMacro: (name, args, body) ->
    ValueMacro = require "../macros/ValueMacro"
    # TODO move this logic to ValueMacro
    if _.isArray(body)
      macro = ValueMacro.createFromExpressions(name, args, @, body)
    else if _.isFunction
      macro = ValueMacro.createFromFunction(name, args, @, body)
    @valueMacros.unshift(macro)

  addRuleMacro: (name, args, body) ->
    RuleMacro = require "../macros/RuleMacro"
    macro = new RuleMacro(@, name, args, body)
    @ruleMacros.unshift(macro)
    macro.scope

  getSourceScope: (name) ->
    @sourceScopes[name] || @parent?.getSourceScope(name)

  getValueMacro: (name, argValues, options) ->
    for macro in @valueMacros
      if macro.matches(name, argValues) && !_.contains(options.valueMacroStack, macro)
        return macro

    @parent?.getValueMacro(name, argValues, options)

  getRuleMacro: (name, argValues, options) ->
    for macro in @ruleMacros
      if macro.matches(name, argValues) && !_.contains(options.ruleMacroStack, macro)
        return macro

    @parent?.getRuleMacro(name, argValues, options)

  toMGLRules: (options, rules) ->
    output = {}

    for name, expressions of rules
      options.rule = name
      values = _.flatten _.map expressions, (expression) =>
        expression.toValues(@, options)

      if (ruleMacro = @getRuleMacro(name, values, options))
        options.ruleMacroStack.push ruleMacro
        _.extend(output, ruleMacro.toMGLScope(values, options))
        options.ruleMacroStack.pop()
      else
        if values.length != 1
          throw new Error("Cannot apply #{values.length} args to primitive rule '#{name}'")
        output[name] = values[0].toMGLValue(options)

      options.rule = null

    output

