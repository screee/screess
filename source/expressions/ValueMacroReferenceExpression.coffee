Expression = require("./Expression")
{literal} = require("./LiteralExpression")
util = require('util')
_ = require("../utilities")

module.exports = class ValueMacroReferenceExpression extends Expression

  constructor: (@name, @args) ->

  toValue: (scope, options) ->
    args = @args.map (arg) ->
      _.extend(value: arg.expression.toValue(scope, options), arg)

    scope.getValueMacro(@name, args).toValue(scope, args, options)
