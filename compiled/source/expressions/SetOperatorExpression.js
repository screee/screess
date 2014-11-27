var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Expression = require("./Expression");
var assert = require("assert");
var AttributeReferenceValue = require("../values/AttributeReferenceValue");
var Value = require('../values/Value');
var SetOperatorExpression = (function (_super) {
    __extends(SetOperatorExpression, _super);
    function SetOperatorExpression(left, operator, right) {
        _super.call(this);
        this.left = left;
        this.operator = operator;
        this.right = right;
    }
    SetOperatorExpression.prototype.evaluate = function (scope, stack) {
        var lvalue = this.left.toValue(scope, stack);
        // TODO allow for multiple rvalues
        var rvalue = this.right.toValue(scope, stack);
        assert(lvalue instanceof AttributeReferenceValue);
        assert(rvalue instanceof Array);
        return [this.operator, lvalue.name].concat(Value.evaluate(rvalue, stack));
    };
    return SetOperatorExpression;
})(Expression);
module.exports = SetOperatorExpression;
//# sourceMappingURL=SetOperatorExpression.js.map