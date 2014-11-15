module.exports = class Value
  @toMGLValue: (value, options) ->
    if value.toMGLValue
      value.toMGLValue(options)
    else
      value

  toMGLValue: (options) -> throw "Abstract method"
