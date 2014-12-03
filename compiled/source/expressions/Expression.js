var Value = require('../values/Value');
var Expression = (function () {
    function Expression() {
    }
    Expression.prototype.toValue = function (scope, stack) {
        var values = this.toValues(scope, stack);
        if (values.length > 1) {
            throw new Error("Expected 1 value but found " + values.length + " values");
        }
        return values[0];
    };
    Expression.prototype.toValues = function (scope, stack) {
        throw new Error("Abstract method");
    };
    Expression.prototype.evaluate = function (scope, stack) {
        return Value.evaluate(this.toValue(scope, stack), stack);
    };
    return Expression;
})();
module.exports = Expression;
//# sourceMappingURL=Expression.js.map