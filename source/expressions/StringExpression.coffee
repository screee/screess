Expression = require "./Expression"
LiteralValue = require "../values/LiteralValue"
{parse} = require "../parser"

module.exports = class StringValue extends Expression
  constructor: (@body) ->

  toValues: (scope, options) ->
    output = @body

    while match = (/#\{(.*)\}/).exec(output)
      value = parse(match[1], startRule: 'valueExpression').toMGLValue(scope, options)

      matchStart = match.index
      matchEnd = match.index + match[0].length

      output = output.substr(0, matchStart) + value.toString() + output.substr(matchEnd)

    [new LiteralValue output]
