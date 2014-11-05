RuleMacro = require "../macros/RuleMacro"
ValueMacro = require "../macros/ValueMacro"
assert = require "assert"
_ = require "underscore"

module.exports = class Scope

  constructor: (@parent) ->
    @valueMacros = {}
    @ruleMacros = {}
    @rules = {}

  addRule: (name, expressions) ->
    @rules[name] = expressions

  addValueMacro: (name, args, body) ->
    @valueMacros[name] = new ValueMacro(name, args, body)

  addRuleMacro: (name, args) ->
    macro = new RuleMacro(@, name, args)
    @ruleMacros[name] = macro
    macro.scope

  getValueMacro: (name) ->
    @valueMacros[name] || \
      @parent?.getValueMacro(name) || \
      throw "Macro '#{name}' not found"

  getRuleMacro: (name) ->
    @ruleMacros[name] || @parent?.getRuleMacro(name)

  evaluateRules: ->
    output = {}
    for name, expressions of @rules
      values = expressions.map (expression) => expression.evaluate(@)

      if (scopeMacro = @getRuleMacro(name))
        scopeMacroRules = scopeMacro.evaluate(values)
        _.extend(output, scopeMacroRules)
      else
        assert values.length == 1
        output[name] = values[0]

    output