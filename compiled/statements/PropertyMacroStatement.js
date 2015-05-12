var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Statement = require("./Statement");
var assert = require("assert");
var ExpressionSet = require("../ExpressionSet");
var Value = require("../values/Value");
var PropertyMacroStatement = (function (_super) {
    __extends(PropertyMacroStatement, _super);
    function PropertyMacroStatement(name, expressions) {
        _super.call(this);
        this.name = name;
        this.expressions = expressions;
        assert(expressions instanceof ExpressionSet);
    }
    PropertyMacroStatement.prototype.evaluate = function (scope, stack, layers, classes, properties) {
        var values = this.expressions.toValueSet(scope, stack);
        if (values.length != 1 || values.positional.length != 1) {
            throw new Error("Cannot apply " + values.length + " args to primitive property " + this.name);
        }
        properties[this.name] = Value.evaluate(values.positional[0]);
    };
    PropertyMacroStatement.prototype.eachPrimitiveStatement = function (scope, stack, callback) {
        var values = this.expressions.toValueSet(scope, stack);
        var macro = scope.getPropertyMacro(this.name, values, stack);
        macro.evaluate(values, stack, callback);
    };
    return PropertyMacroStatement;
})(Statement);
module.exports = PropertyMacroStatement;
//# sourceMappingURL=PropertyMacroStatement.js.map