Expression = require('../expressions/Expression')
{literal} = require('../expressions/LiteralExpression')

Scope = require('../scopes/Scope')

module.exports = class ValueMacro
  constructor: (@name, @argNames, @body) ->

  evaluate: (parentScope, argValues) ->

    if argValues.length != @argNames.length
      throw "Expecting #{@argNames.length} arguments for macro '#{@name}', got #{argValues.length}"

    if @body instanceof Function
      @body.apply({}, argValues)

    else if @body instanceof Expression
      scopeValueMacros = Object.zip(@argNames, argValues.map(literal))
      scope = new Scope(parentScope, scopeValueMacros)
      @body.evaluate(scope)
    else
      throw "Value macro bodies must be Expressions or JavaScript functions"