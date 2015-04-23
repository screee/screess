var assert = require('assert');
var ValueSet = require('./ValueSet');
var _ = require('./utilities');
var LiteralExpression = require('./expressions/LiteralExpression');
var ExpressionSet = (function () {
    function ExpressionSet(items) {
        this.items = items;
        this.isNamed_ = true;
        this.isUnnamed_ = true;
        for (var i in items) {
            assert(items[i].expression);
            if (items[i].name)
                this.isUnnamed_ = false;
            else
                this.isNamed_ = false;
        }
    }
    ExpressionSet.fromPositionalExpressions = function (expressions) {
        return new ExpressionSet(_.map(expressions, function (expression) {
            return { expression: expression };
        }));
    };
    ExpressionSet.fromPositionalValues = function (values) {
        return new ExpressionSet(_.map(values, function (value) {
            return { expression: new LiteralExpression(value) };
        }));
    };
    ExpressionSet.prototype.isNamed = function () {
        return this.isNamed_;
    };
    ExpressionSet.prototype.isUnnamed = function () {
        return this.isUnnamed_;
    };
    ExpressionSet.prototype.toArray = function () {
        return _.pluck(this.items, 'expression');
    };
    ExpressionSet.prototype.toValueSet = function (scope, stack) {
        return new ValueSet(_.map(this.items, function (item) {
            return {
                value: item.expression.evaluateToIntermediate(scope, stack),
                name: item.name
            };
        }));
    };
    ExpressionSet.ZERO = new ExpressionSet([]);
    return ExpressionSet;
})();
module.exports = ExpressionSet;
//# sourceMappingURL=ExpressionSet.js.map