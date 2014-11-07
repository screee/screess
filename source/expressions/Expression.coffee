module.exports = class Expression

  toMGLRuleValue: (scope, value) ->
    if value.toMGLRuleValue
      value.toMGLRuleValue()
    else
      value

  toMGLFilterValue: (scope, value) ->
    if value.toMGLFilterValue
      value.toMGLRuleValue()
    else
      value