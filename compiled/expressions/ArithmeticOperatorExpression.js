var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var assert = require("assert");
var Expression = require("./Expression");
var FunctionValue = require("../values/FunctionValue");
var _ = require("../utilities");
var ArithmeticOperatorExpression = (function (_super) {
    __extends(ArithmeticOperatorExpression, _super);
    function ArithmeticOperatorExpression(left, operator, right) {
        _super.call(this);
        this.left = left;
        this.operator = operator;
        this.right = right;
    }
    ArithmeticOperatorExpression.prototype.evaluateToIntermediate = function (scope, stack) {
        var _this = this;
        var left = this.left.evaluateToIntermediate(scope, stack);
        var right = this.right.evaluateToIntermediate(scope, stack);
        function apply(left, operator, right) {
            if (operator == '+') {
                return left + right;
            }
            else if (operator == '-') {
                return left - right;
            }
            else if (operator == '*') {
                return left * right;
            }
            else if (operator == '/') {
                return left / right;
            }
        }
        if (_.isNumber(left) && _.isNumber(right)) {
            return apply(left, this.operator, right);
        }
        else if (_.isNumber(left) && right instanceof FunctionValue) {
            return new FunctionValue(right.base, _.map(right.stops, function (value) {
                return [value[0], apply(left, _this.operator, value[1])];
            }));
        }
        else if (left instanceof FunctionValue && _.isNumber(right)) {
            return new FunctionValue(left.base, _.map(left.stops, function (value) {
                return [value[0], apply(value[1], _this.operator, right)];
            }));
        }
        else {
            assert(false, "" + left + " " + right);
        }
    };
    return ArithmeticOperatorExpression;
})(Expression);
module.exports = ArithmeticOperatorExpression;
//# sourceMappingURL=ArithmeticOperatorExpression.js.map