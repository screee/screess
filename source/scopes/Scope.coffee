Value = require "../values/value"
assert = require "assert"
_ = require "../utilities"

module.exports = class Scope

  constructor: (@parent, @valueMacros = {}, @ruleMacros = {}) ->
    @rules = {}

  addRule: (name, expressions) ->
    @rules[name] = expressions

  addValueMacro: (name, args, body) ->
    ValueMacro = require "../macros/ValueMacro"
    @valueMacros[name] = new ValueMacro(name, args, body)

  addRuleMacro: (name, args) ->
    RuleMacro = require "../macros/RuleMacro"
    macro = new RuleMacro(@, name, args)
    @ruleMacros[name] = macro
    macro.scope

  getValueMacro: (name) ->
    @valueMacros[name] || \
      @parent?.getValueMacro(name) || \
      throw "Macro '#{name}' not found"

  getRuleMacro: (name) ->
    @ruleMacros[name] || @parent?.getRuleMacro(name)

  toMGLRules: (options, rules) ->
    output = {}

    for name, expressions of rules
      values = expressions.map (expression) =>
        expression.toValue(@, options).toMGLValue(options)

      if (scopeMacro = @getRuleMacro(name))
        _.extend(output, scopeMacro.toMGLScope(values))
      else
        assert values.length == 1
        output[name] = values[0]

    output

