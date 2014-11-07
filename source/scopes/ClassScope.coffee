Scope = require("./Scope")

module.exports = class ClassScope extends Scope
  toMGLClassScope: -> @toMGLRules()
