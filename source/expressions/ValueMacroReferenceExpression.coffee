Expression = require("./Expression")
{literal} = require("./LiteralExpression")

module.exports = class ValueMacroReferenceExpression extends Expression

  constructor: (@name, @args) ->

  evaluate: (scope) ->
    scope.getValueMacro(@name).evaluate(
      scope,
      @args.map((arg) -> arg.evaluate(scope))
    )