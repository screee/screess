var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var assert = require("assert");
var Expression = require("./Expression");
var _ = require("../utilities");
var ArithmeticOperatorExpression = (function (_super) {
    __extends(ArithmeticOperatorExpression, _super);
    function ArithmeticOperatorExpression(left, operator, right) {
        _super.call(this);
        this.left = left;
        this.operator = operator;
        this.right = right;
    }
    ArithmeticOperatorExpression.prototype.toValues = function (scope, stack) {
        var left = this.left.toValue(scope, stack);
        var right = this.right.toValue(scope, stack);
        assert(_.isNumber(left));
        assert(_.isNumber(right));
        var output;
        if (this.operator == '+') {
            output = left + right;
        }
        else if (this.operator == '-') {
            output = left - right;
        }
        else if (this.operator == '*') {
            output = left * right;
        }
        else if (this.operator == '/') {
            output = left / right;
        }
        else if (this.operator == '^') {
            output = Math.pow(left, right);
        }
        return [output];
    };
    return ArithmeticOperatorExpression;
})(Expression);
module.exports = ArithmeticOperatorExpression;
//# sourceMappingURL=ArithmeticOperatorExpression.js.map