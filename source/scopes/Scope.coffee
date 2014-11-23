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

  addValueMacro: (name, args, expressions) ->
    assert _.isArray(expressions)
    ValueMacro = require "../macros/ValueMacro"
    macro = ValueMacro.createFromExpressions(name, args, @, expressions)
    @valueMacros.push(macro)

  addRuleMacro: (name, args) ->
    RuleMacro = require "../macros/RuleMacro"
    macro = new RuleMacro(@, name, args)
    @ruleMacros.push(macro)
    macro.scope

  getSourceScope: (name) ->
    @sourceScopes[name] || @parent?.getSourceScope(name)

  getValueMacro: (name, argValues, options) ->
    _.find(@valueMacros, (valueMacro) -> valueMacro.matches(name, argValues)) || @parent?.getValueMacro(name, argValues)

  getRuleMacro: (name, argValues, options) ->
    _.find(@ruleMacros, (ruleMacro) -> ruleMacro.matches(name, argValues)) || @parent?.getRuleMacro(name, argValues)

  evaluateRules: (options, rules) ->
    output = {}

    for name, expressions of rules
      values = _.flatten _.map expressions, (expression) =>
        expression.toValues(@, _.extend(rule: name, options))

      if (ruleMacro = @getRuleMacro(name, values, options))
        _.extend(output, ruleMacro.evaluateScope(values, options))
      else
        if values.length != 1
          throw new Error("Cannot apply #{values.length} args to primitive rule '#{name}'")
        output[name] = values[0].evaluateValue(_.extend(rule: name, options))

    output

