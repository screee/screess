Expression = require("./Expression")
{literal} = require("./LiteralExpression")
util = require('util')
_ = require("../utilities")

module.exports = class ValueMacroReferenceExpression extends Expression

  constructor: (@name, @argExpressions) ->

  toValues: (scope, options) ->
    args = @argExpressions.map (arg) ->
      _.extend(
        values: arg.expression.toValues(scope, options),
        arg
      )

    if macro = scope.getValueMacro(@name, args)
      macro.toValues(args, options)
    else
      throw new Error("Could not find value macro '#{@name}'")
