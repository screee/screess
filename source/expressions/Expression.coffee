module.exports = class Expression
  toValue: (scope, options) ->
    values = @toValues(scope, options)
    if values.length > 1
      throw new Error("Expected 1 value but found #{values.length} values")
    values[0]

  toValues: (scope, options) ->
    throw new Error("Abstract method")

  toMGLValue: (scope, options) ->
    @toValue(scope, options).toMGLValue(options)
