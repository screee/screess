module.exports = class Value
  @toMGLValue: (value) ->
    if value.toMGLValue
      value.toMGLValue
    else
      value

  toMGLValue: (options) -> throw "Abstract method"
