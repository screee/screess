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
var _ = require("../utilities");
var SetOperatorExpression = (function (_super) {
    __extends(SetOperatorExpression, _super);
    function SetOperatorExpression(needle, operator, haystack) {
        _super.call(this);
        this.needle = needle;
        this.operator = operator;
        this.haystack = haystack;
    }
    SetOperatorExpression.prototype.evaluateToIntermediates = function (scope, stack) {
        var needle = this.needle.evaluateToIntermediate(scope, stack);
        var haystack = this.haystack.evaluateToIntermediate(scope, stack);
        var operator = this.operator;
        assert(haystack instanceof Array);
        if (needle instanceof AttributeReferenceValue) {
            return [[operator, needle.name].concat(Value.evaluate(haystack, stack))];
        }
        else {
            return [SetOperatorExpression.operators[operator](needle, haystack)];
        }
    };
    SetOperatorExpression.operators = {
        "in": function (needle, haystack) {
            return _.contains(haystack, needle);
        },
        "!in": function (needle, haystack) {
            return !_.contains(haystack, needle);
        }
    };
    return SetOperatorExpression;
})(Expression);
module.exports = SetOperatorExpression;
//# sourceMappingURL=SetOperatorExpression.js.map