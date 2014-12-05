var Value = require('../values/Value');
var Expression = (function () {
    function Expression() {
    }
    Expression.prototype.evaluateToIntermediate = function (scope, stack) {
        var values = this.evaluateToIntermediates(scope, stack);
        if (values.length > 1) {
            throw new Error("Expected 1 value but found " + values.length + " values");
        }
        return values[0];
    };
    Expression.prototype.evaluateToIntermediates = function (scope, stack) {
        throw new Error("Abstract method");
    };
    Expression.prototype.evaluate = function (scope, stack) {
        return Value.evaluate(this.evaluateToIntermediate(scope, stack), stack);
    };
    return Expression;
})();
module.exports = Expression;
//# sourceMappingURL=Expression.js.map