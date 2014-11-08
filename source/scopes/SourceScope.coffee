Scope = require("./Scope")
_ = require("../utilities")

module.exports = class ClassScope extends Scope

  toMGLSourceScope: (options) ->
    options = _.extend(scope: "source", options)
    @toMGLRules(options, @rules)
