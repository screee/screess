assert = require 'assert'
_ = require '../utilities'

module.exports = class MacroArgumentDefinition

  constructor: (@definitions, @scope) ->
    if @definitions.length > 0 then assert @scope != null

    @namedArgs = {}
    for definition, index in @definitions
      definition.index = index
      if definition.name
        @namedArgs[definition.name] = definition

    @length = @definitions.length

MacroArgumentDefinition.ZERO = new MacroArgumentDefinition([], null)