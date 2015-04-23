var assert = require("assert");
var Statement = (function () {
    function Statement(scope) {
        this.scope = scope;
    }
    Statement.prototype.eachPrimitiveStatement = function (scope, stack, callback) {
        callback(this.scope, this);
    };
    Statement.prototype.evaluate = function (scope, stack, layers, classes, properties) {
        assert(false, "abstract method");
    };
    return Statement;
})();
module.exports = Statement;
//# sourceMappingURL=Statement.js.map