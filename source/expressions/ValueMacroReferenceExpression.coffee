module.exports = class ValueMacroReferenceExpression extends require('./Expression')
  constructor: (@name, @args) ->
  evaluate: (scope) ->
    scope.getValueMacro(@name).evaluate(
      scope,
      @args.map((argument) -> makeLiteral argument.evaluate(scope))
    )