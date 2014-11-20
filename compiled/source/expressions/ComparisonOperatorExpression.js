var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Expression = require("./Expression");
var AttributeReferenceValue = require("../values/AttributeReferenceValue");
var _ = require("../utilities");
var assert = require("assert");
var Value = require('../values/Value');
var ComparisonOperatorExpression = (function (_super) {
    __extends(ComparisonOperatorExpression, _super);
    function ComparisonOperatorExpression(left, operator, right) {
        _super.call(this);
        this.left = left;
        this.operator = operator;
        this.right = right;
    }
    ComparisonOperatorExpression.prototype.toMGLFilter = function (scope, options) {
        var lvalue = this.left.toValue(scope, options);
        var rvalue = this.right.toValue(scope, options);
        // Only one of the values can be an AttributeReferenceValue and it must be
        // the lvalue
        assert(lvalue instanceof AttributeReferenceValue);
        assert(!(rvalue instanceof AttributeReferenceValue));
        return [this.operator, lvalue.name, Value.toMGLValue(rvalue, options)];
    };
    return ComparisonOperatorExpression;
})(Expression);
module.exports = ComparisonOperatorExpression;
//# sourceMappingURL=ComparisonOperatorExpression.js.map