var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Expression = require("./Expression");
var Scope = require("../Scope");
var assert = require("assert");
var ValueMacroReferenceExpression = (function (_super) {
    __extends(ValueMacroReferenceExpression, _super);
    function ValueMacroReferenceExpression(name, expressions) {
        _super.call(this);
        this.name = name;
        this.expressions = expressions;
    }
    ValueMacroReferenceExpression.prototype.evaluateToIntermediate = function (scope, stack) {
        assert(scope instanceof Scope);
        var values = this.expressions.toValueSet(scope, stack);
        var macro = scope.getValueMacro(this.name, values, stack);
        if (!macro) {
            throw new Error("Could not find value macro " + this.name);
        }
        return macro.evaluateToIntermediate(values, stack);
    };
    return ValueMacroReferenceExpression;
})(Expression);
module.exports = ValueMacroReferenceExpression;
//# sourceMappingURL=ValueMacroReferenceExpression.js.map