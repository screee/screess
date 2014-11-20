var Value = require('../values/Value');
var Expression = (function () {
    function Expression() {
    }
    Expression.prototype.toValue = function (scope, options) {
        var values = this.toValues(scope, options);
        if (values.length > 1) {
            throw new Error("Expected 1 value but found #{values.length} values");
        }
        return values[0];
    };
    Expression.prototype.toValues = function (scope, options) {
        throw new Error("Abstract method");
    };
    Expression.prototype.toMGLValue = function (scope, options) {
        return Value.toMGLValue(this.toValue(scope, options), options);
    };
    return Expression;
})();
module.exports = Expression;
//# sourceMappingURL=Expression.js.map