var Value = require('../values/Value');
var Expression = (function () {
    function Expression() {
    }
    Expression.prototype.toValue = function (scope, context) {
        var values = this.toValues(scope, context);
        if (values.length > 1) {
            console.log(values);
            throw new Error("Expected 1 value but found " + values.length + " values");
        }
        return values[0];
    };
    // TODO use union types on return type
    Expression.prototype.toValues = function (scope, context) {
        throw new Error("Abstract method");
    };
    Expression.prototype.evaluate = function (scope, context) {
        return Value.evaluate(this.toValue(scope, context), context);
    };
    Expression.prototype.evaluateFilter = function (scope, context) {
        throw new Error("Abstract method");
    };
    return Expression;
})();
module.exports = Expression;
//# sourceMappingURL=Expression.js.map