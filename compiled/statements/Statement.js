var assert = require("assert");
var Statement = (function () {
    function Statement() {
    }
    Statement.prototype.eachPrimitiveStatement = function (scope, stack, callback) {
        callback(scope, this);
    };
    Statement.prototype.evaluate = function (scope, stack, layers, classes, properties) {
        assert(false, "abstract method");
    };
    return Statement;
})();
module.exports = Statement;
//# sourceMappingURL=Statement.js.map