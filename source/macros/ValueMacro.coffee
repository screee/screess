Expression = require('../expressions/Expression')
{literalExpression} = require('../expressions/LiteralExpression')
{literalValue} = require('../values/LiteralValue')
_ = require("../utilities")
Scope = require('../scopes/Scope')

module.exports = class ValueMacro
  constructor: (@name, @argNames, @body) ->

  toValue: (parentScope, argValues, options) ->
    if argValues.length != @argNames.length
      throw new Error("Expecting #{@argNames.length} arguments for macro '#{@name}', got #{argValues.length}")

    if @body instanceof Function
      @body.apply({}, argValues.concat([scope, options]))
    else if @body instanceof Expression
      scopeValueMacros = _.objectZip(@argNames, argValues.map(literalExpression))
      scope = new Scope(parentScope, scopeValueMacros)
      @body.toValue(scope, options)
    else
      throw new Error("Value macro bodies must be an Expression or a JavaScript functions")