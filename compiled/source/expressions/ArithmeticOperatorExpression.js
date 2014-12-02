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
    ArithmeticOperatorExpression.prototype.toValues = function (scope, stack) {
        var _this = this;
        var left = this.left.toValue(scope, stack);
        var right = this.right.toValue(scope, stack);
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
            return [apply(left, this.operator, right)];
        }
        else if (_.isNumber(left) && right instanceof FunctionValue) {
            var base = right.base;
            var stops = _.map(right.stops, function (value) {
                return [value[0], apply(left, _this.operator, value[1])];
            });
            return [new FunctionValue(base, stops)];
        }
        else if (left instanceof FunctionValue && _.isNumber(right)) {
            var base = left.base;
            var stops = _.map(left.stops, function (value) {
                return [value[0], apply(value[1], _this.operator, right)];
            });
            return [new FunctionValue(base, stops)];
        }
        else {
            assert(false);
        }
    };
    return ArithmeticOperatorExpression;
})(Expression);
module.exports = ArithmeticOperatorExpression;
//# sourceMappingURL=ArithmeticOperatorExpression.js.map