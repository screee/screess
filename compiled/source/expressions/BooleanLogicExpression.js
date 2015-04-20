var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var assert = require("assert");
var Expression = require("./Expression");
var _ = require("../utilities");
function isFalse(value) {
    return value === false;
}
function isTrue(value) {
    return value === true;
}
var BooleanLogicExpression = (function (_super) {
    __extends(BooleanLogicExpression, _super);
    function BooleanLogicExpression(operator, expressions) {
        _super.call(this);
        this.operator = operator;
        this.expressions = expressions;
    }
    BooleanLogicExpression.prototype.evaluateToIntermediate = function (scope, stack) {
        var operator = BooleanLogicExpression.operators[this.operator];
        var values = _.map(this.expressions, function (expression) {
            return expression.evaluate(scope, stack);
        });
        if (operator == "any") {
            if (_.all(values, isFalse)) {
                return false;
            }
            values = _.reject(values, isFalse);
            if (values.length === 0) {
                return true;
            }
            else if (values.length === 1) {
                return values[0];
            }
            else if (_.any(values, isTrue)) {
                return true;
            }
        }
        else if (operator == "all") {
            if (_.all(values, isTrue)) {
                return true;
            }
            values = _.reject(values, isTrue);
            if (values.length === 0) {
                return true;
            }
            else if (values.length === 1) {
                return values[0];
            }
            else if (_.any(values, isFalse)) {
                return false;
            }
        }
        else {
            assert(false);
        }
        return [operator].concat(values);
    };
    BooleanLogicExpression.operators = {
        "||": "any",
        "&&": "all"
    };
    return BooleanLogicExpression;
})(Expression);
module.exports = BooleanLogicExpression;
//# sourceMappingURL=BooleanLogicExpression.js.map