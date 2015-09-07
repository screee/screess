var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Value = require("./Value");
var Scope = require("../Scope");
var Stack = require("../Stack");
var PropertyStatement = require("../statements/PropertyStatement");
var ScopeValue = (function (_super) {
    __extends(ScopeValue, _super);
    function ScopeValue(scope) {
        _super.call(this);
        this.scope = scope;
    }
    ScopeValue.prototype.evaluate = function () {
        return this.scope.evaluate(3 /* OBJECT */);
    };
    // TODO this is ugly
    ScopeValue.prototype.toObject = function (stack) {
        if (stack === void 0) { stack = new Stack(); }
        stack.scope.push(this.scope);
        var output = {};
        this.scope.eachPrimitiveStatement(stack, function (scope, statement) {
            if (statement instanceof PropertyStatement) {
                output[statement.name] = statement.evaluateValueToIntermediate(scope, stack);
            }
        });
        stack.scope.pop();
        return output;
    };
    return ScopeValue;
})(Value);
module.exports = ScopeValue;
//# sourceMappingURL=ScopeValue.js.map