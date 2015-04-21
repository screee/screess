var assert = require('assert');
var ValueSet = require('./ValueSet');
var _ = require('./utilities');
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
        return ValueSet.fromExpressions(scope, stack, this.items);
    };
    ExpressionSet.ZERO = new ExpressionSet([]);
    return ExpressionSet;
})();
module.exports = ExpressionSet;
//# sourceMappingURL=ExpressionSet.js.map