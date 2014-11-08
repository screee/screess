module.exports = class Expression
  toValue: (scope, options) -> throw new Error("Abstract method")
  toMGLValue: (scope, options) -> @toValue(scope, options).toMGLValue(options)
