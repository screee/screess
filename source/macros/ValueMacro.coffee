Expression = require('../expressions/Expression')
{literal} = require('../expressions/LiteralExpression')
_ = require("../utilities")
Scope = require('../scopes/Scope')

module.exports = class ValueMacro
  constructor: (@name, @argNames, @body) ->

  toMGLFilterValue: (parentScope, argValues) ->

    if argValues.length != @argNames.length
      throw "Expecting #{@argNames.length} arguments for macro '#{@name}', got #{argValues.length}"

    if @body instanceof Function
      @body.apply({}, argValues)

    else if @body instanceof Expression
      scopeValueMacros = _.objectZip(@argNames, argValues.map(literal))
      scope = new Scope(parentScope, scopeValueMacros)
      @body.toMGLFilterValue(scope)
    else
      throw "Value macro bodies must be Expressions or JavaScript functions"

  toMGLRuleValue: (parentScope, argValues) ->

    if argValues.length != @argNames.length
      throw "Expecting #{@argNames.length} arguments for macro '#{@name}', got #{argValues.length}"

    if @body instanceof Function
      @body.apply({}, argValues)

    else if @body instanceof Expression
      scopeValueMacros = _.objectZip(@argNames, argValues.map(literal))
      scope = new Scope(parentScope, scopeValueMacros)
      @body.toMGLRuleValue(scope)
    else
      throw "Value macro bodies must be Expressions or JavaScript functions"