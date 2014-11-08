Scope = require("./Scope")
_ = require("../utilities")

module.exports = class ClassScope extends Scope

  toMGLClassScope: (options) ->
    options = _.extend(scope: "class", options)
    @toMGLRules(options, @rules)
