var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Statement = require("./Statement");
var assert = require("assert");
var Value = require("../values/Value");
var PropertyStatement = (function (_super) {
    __extends(PropertyStatement, _super);
    function PropertyStatement(scope, name, expressions) {
        _super.call(this, scope);
        this.name = name;
        this.expressions = expressions;
    }
    PropertyStatement.prototype.evaluate = function (scope, stack, layers, classes, properties) {
        assert(scope == this.scope);
        var values = this.expressions.toValueSet(scope, stack);
        if (values.length != 1 || values.positional.length != 1) {
            throw new Error("Cannot apply " + values.length + " args to primitive property " + this.name);
        }
        properties[this.name] = Value.evaluate(values.positional[0]);
    };
    PropertyStatement.prototype.eachPrimitiveStatement = function (scope, stack, callback) {
        var values = this.expressions.toValueSet(scope, stack);
        assert(scope == this.scope);
        var macro;
        if (macro = scope.getPropertyMacro(this.name, values, stack)) {
            macro.evaluate(values, stack, callback);
        }
        else {
            callback(scope, this);
        }
    };
    return PropertyStatement;
})(Statement);
module.exports = PropertyStatement;
//# sourceMappingURL=PropertyStatement.js.map