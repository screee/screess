var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Expression = require("./Expression");
var Scope = require("../Scope");
var assert = require("assert");
var MacroReferenceExpression = (function (_super) {
    __extends(MacroReferenceExpression, _super);
    function MacroReferenceExpression(name, expressions) {
        _super.call(this);
        this.name = name;
        this.expressions = expressions;
    }
    MacroReferenceExpression.prototype.evaluateToIntermediate = function (scope, stack) {
        assert(scope instanceof Scope);
        var values = this.expressions.toValueSet(scope, stack);
        var macro = scope.getMacro(this.name, values, stack);
        if (!macro) {
            throw new Error("Could not find macro " + this.name);
        }
        return macro.evaluateToIntermediate(values, stack);
    };
    return MacroReferenceExpression;
})(Expression);
module.exports = MacroReferenceExpression;
//# sourceMappingURL=MacroReferenceExpression.js.map