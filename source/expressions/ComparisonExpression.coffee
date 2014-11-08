Expression = require("./Expression")
AttributeReferenceValue = require("./values/AttributeReferenceValue")
_ = require("../utilities")

module.exports = class ComparisonExpression extends Expression

  constructor: (@left, @operator, @rexpression) ->
    assert _.contains @valueComparisonOperators, operator

  toMGLFilter: (scope, options) ->
    options = _.extend(filter: true, options)

    lvalue = @left.toValue(scope, options)
    rvalue = @right.toValue(scope, options)

    # Only one of the values can be an AttributeReferenceValue and it must be
    # the lvalue
    if rvalue instanceof AttributeReferenceValue
      assert !(lvalue instanceof AttributeReferenceValue)
      [lvalue, rvalue] = [rvalue, lvalue]
    else if lvalue instanceof AttributeReferenceValue
      assert !(lvalue instanceof AttributeReferenceValue)

    [@operator, lvalue.toMGLValue(options), rvalue.toMGLValue(options)]
