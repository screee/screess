Value = require "../values/value"
assert = require "assert"
_ = require "../utilities"

# scopeTypes:
#   source: {}
#   layer: {}
#   global: {}
#   class: {}

module.exports = class Scope

  constructor: (@parent, @valueMacros = {}, @ruleMacros = {}) ->
    @rules = {}

  addRule: (name, expressions) ->
    if @rules[name] then throw new Error("Duplicate entries for rule '#{name}'")
    @rules[name] = expressions

  addValueMacro: (name, args, body) ->
    if @valueMacros[name] then throw new Error("Duplicate entries value macro '#{name}'")
    ValueMacro = require "../macros/ValueMacro"
    @valueMacros[name] = new ValueMacro(name, args, body)

  addRuleMacro: (name, args) ->
    if @ruleMacros[name] then throw new Error("Duplicate entries rule macro '#{name}'")
    RuleMacro = require "../macros/RuleMacro"
    macro = new RuleMacro(@, name, args)
    @ruleMacros[name] = macro
    macro.scope


  getValueMacro: (name) ->
    @valueMacros[name] || \
      @parent?.getValueMacro(name) || \
      throw new Error("Macro '#{name}' not found")

  getRuleMacro: (name) ->
    @ruleMacros[name] || @parent?.getRuleMacro(name)


  toMGLRules: (options, rules) ->
    output = {}

    for name, expressions of rules
      values = expressions.map (expression) =>
        options = _.extend(rule:name, options)
        expression.toValue(@, options).toMGLValue(options)

      if (scopeMacro = @getRuleMacro(name))
        _.extend(output, scopeMacro.toMGLScope(values))
      else
        assert values.length == 1
        output[name] = values[0]

    output

