var Value = require('../values/Value');
var Expression = (function () {
    function Expression() {
    }
    Expression.prototype.evaluateToIntermediate = function (scope, stack) {
        throw new Error("Abstract method");
    };
    Expression.prototype.evaluate = function (scope, stack) {
        return Value.evaluate(this.evaluateToIntermediate(scope, stack));
    };
    return Expression;
})();
module.exports = Expression;
//# sourceMappingURL=Expression.js.map