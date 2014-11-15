assert = require 'assert'
_ = require '../utilities'

module.exports = class MacroArgDefinition

  constructor: (@definitions, @scope) ->
    if @definitions.length > 0 then assert @scope != null

    @namedArgs = {}
    for definition, index in @definitions
      definition.index = index
      if definition.name
        @namedArgs[definition.name] = definition

    @length = @definitions.length

MacroArgDefinition.ZERO = new MacroArgDefinition([], null)