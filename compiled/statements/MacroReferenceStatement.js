var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Scope = require("../Scope");
var Statement = require("./Statement");
var assert = require("assert");
var ExpressionSet = require("../ExpressionSet");
var ScopeValue = require("../values/ScopeValue");
var MacroReferenceStatement = (function (_super) {
    __extends(MacroReferenceStatement, _super);
    function MacroReferenceStatement(name, expressions) {
        _super.call(this);
        this.name = name;
        this.expressions = expressions;
        assert(this.expressions instanceof ExpressionSet);
    }
    MacroReferenceStatement.prototype.eachPrimitiveStatement = function (parentScope, stack, callback) {
        assert(parentScope instanceof Scope);
        var values = this.expressions.toValueSet(parentScope, stack);
        var macro = parentScope.getMacro(this.name, values, stack);
        if (!macro) {
            throw new Error("Could not find macro " + this.name);
        }
        var scopeValue = macro.evaluateToIntermediate(values, stack);
        assert(scopeValue instanceof ScopeValue);
        var scope = scopeValue.scope;
        assert(scope instanceof Scope);
        scope.eachPrimitiveStatement(stack, callback);
    };
    return MacroReferenceStatement;
})(Statement);
module.exports = MacroReferenceStatement;
//# sourceMappingURL=MacroReferenceStatement.js.map