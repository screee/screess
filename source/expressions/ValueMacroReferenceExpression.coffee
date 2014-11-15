Expression = require("./Expression")
{literal} = require("./LiteralExpression")
util = require('util')
_ = require("../utilities")
Scope = require "../scopes/Scope"
MacroArgumentValues = require '../macros/MacroArgumentValues'

module.exports = class ValueMacroReferenceExpression extends Expression

  constructor: (@name, @argumentExpressions) ->

  toValues: (scope, options) ->
    argValues = MacroArgumentValues.createFromExpressions(
      @argumentExpressions,
      scope,
      options
    )

    if macro = scope.getValueMacro(@name, argValues, options)
      macro.toValues(argValues, options)
    else
      throw new Error("Could not find value macro '#{@name}'")
