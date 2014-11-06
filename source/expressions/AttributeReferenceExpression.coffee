Expression = require('./Expression')

module.exports = class AttributeReferenceExpression extends Expression
  constructor: (@name) ->
  evaluate: (scope) -> "{#{@name}}"
