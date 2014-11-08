Expression = require("./Expression")
{literal} = require("./LiteralExpression")

module.exports = class ValueMacroReferenceExpression extends Expression

  constructor: (@name, @argExpressions) ->

  toValue: (scope, options) ->
    argValues = @argExpressions.map((arg) -> arg.toValue(scope, options))
    scope.getValueMacro(@name).toValue(scope, argValues, options)
