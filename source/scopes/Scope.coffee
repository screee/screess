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
    @rules = {}
    @valueMacros = {}
    @ruleMacros = {}
    @sourceScopes = {}

  addSourceScope: (name, scope) ->
    SourceScope = require('./SourceScope')
    if @sourceScopes[name] then throw new Error("Duplicate entries for source scope '#{name}'")
    @sourceScopes[name] = new SourceScope(@)

  addRule: (name, expressions) ->
    if @rules[name] then throw new Error("Duplicate entries for rule '#{name}'")
    @rules[name] = expressions

  addValueMacro: (name, args, expressions) ->
    if @valueMacros[name] then throw new Error("Duplicate entries value macro '#{name}'")
    ValueMacro = require "../macros/ValueMacro"
    @valueMacros[name] = ValueMacro.createFromExpressions(name, args, expressions)

  addRuleMacro: (name, args) ->
    if @ruleMacros[name] then throw new Error("Duplicate entries rule macro '#{name}'")
    RuleMacro = require "../macros/RuleMacro"
    macro = new RuleMacro(@, name, args)
    @ruleMacros[name] = macro
    macro.scope

  getSourceScope: (name) ->
    @sourceScopes[name] || @parent?.getSourceScope(name)

  getValueMacro: (name, argValues) ->
    _.find(@valueMacros, (valueMacro) -> valueMacro.matches(name, argValues)) || \
      @parent?.getValueMacro(name, argValues) || \
      throw new Error("Macro '#{name}' not found")

  getRuleMacro: (name) ->
    @ruleMacros[name] || @parent?.getRuleMacro(name)


  toMGLRules: (options, rules) ->
    output = {}

    for name, expressions of rules
      values = expressions.map (expression) =>
        expression.toValue(@, _.extend(rule: name, options))

      if (scopeMacro = @getRuleMacro(name))
        _.extend(output, scopeMacro.toMGLScope(values, options))
      else
        assert values.length == 1
        output[name] = values[0].toMGLValue(_.extend(rule: name, options))

    output

