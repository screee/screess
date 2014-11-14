Scope = require("./Scope")
_ = require("../utilities")

module.exports = class ClassScope extends Scope

  toMGLClassScope: (options) ->
    options.scopeStack.push(@)
    @toMGLProperties(options, @properties)
    options.scopeStack.pop()
