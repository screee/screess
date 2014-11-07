Expression = require("./Expression")
{literal} = require("./LiteralExpression")

module.exports = class ValueMacroReferenceExpression extends Expression

  constructor: (@name, @argExpressions) ->

  toMGLRuleValue: (scope) ->
    argValues = @argExpressions.map((arg) -> arg.toMGLRuleValue(scope))
    value = scope.getValueMacro(@name).toMGLRuleValue(scope, argValues)
    super(scope, value)

  toMGLFilterValue: (scope) ->
    argValues = @argExpressions.map((arg) -> arg.toMGLFilterValue(scope))
    value = scope.getValueMacro(@name).toMGLFilterValue(scope, argValues)
    super(scope, value)