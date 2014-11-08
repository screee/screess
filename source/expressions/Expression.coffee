module.exports = class Expression
  toValue: (scope, options) -> throw "Abstract method"
  toMGLValue: (scope, options) -> @toValue(scope, options).toMGLValue(options)
