module.exports = class ValueMacro
  constructor: (@name, @argNames, @body) ->

  evaluate: (parentScope, argValues) ->

    if argValues.length != @argNames.length
      throw "Expecting #{@argNames.length} arguments for macro '#{@name}', got #{argValues.length}"

    args = Object.zip(@argNames, argValues.map(makeLiteral))
    scope = new MacroScope(parentScope, args)

    @body.evaluate(scope)