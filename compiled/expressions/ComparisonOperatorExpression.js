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
var ComparisonOperatorExpression = (function (_super) {
    __extends(ComparisonOperatorExpression, _super);
    function ComparisonOperatorExpression(left, operator, right) {
        _super.call(this);
        this.left = left;
        this.operator = operator;
        this.right = right;
    }
    ComparisonOperatorExpression.prototype.evaluateToIntermediate = function (scope, stack) {
        var left = this.left.evaluateToIntermediate(scope, stack);
        var right = this.right.evaluateToIntermediate(scope, stack);
        var operator = this.operator;
        if (right instanceof AttributeReferenceValue) {
            var temp = left;
            left = right;
            right = temp;
            operator = ComparisonOperatorExpression.operatorInverses[operator];
        }
        if (left instanceof AttributeReferenceValue) {
            assert(!(right instanceof AttributeReferenceValue));
            return [operator, left.name, Value.evaluate(right)];
        }
        else {
            return ComparisonOperatorExpression.operators[operator](left, right);
        }
    };
    ComparisonOperatorExpression.operators = {
        "==": function (left, right) {
            return left == right;
        },
        ">=": function (left, right) {
            return left >= right;
        },
        "<=": function (left, right) {
            return left <= right;
        },
        "<": function (left, right) {
            return left < right;
        },
        ">": function (left, right) {
            return left > right;
        },
        "!=": function (left, right) {
            return left != right;
        }
    };
    ComparisonOperatorExpression.operatorInverses = {
        "==": "==",
        ">=": "<=",
        "<=": ">=",
        "<": ">",
        ">": "<",
        "!=": "!="
    };
    return ComparisonOperatorExpression;
})(Expression);
module.exports = ComparisonOperatorExpression;
//# sourceMappingURL=ComparisonOperatorExpression.js.map