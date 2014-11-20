var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Expression = require("./Expression");
var MacroArgValues = require('../macros/MacroArgValues');
var _ = require("../utilities");
var ValueMacroReferenceExpression = (function (_super) {
    __extends(ValueMacroReferenceExpression, _super);
    function ValueMacroReferenceExpression(name, argumentExpressions) {
        _super.call(this);
        this.name = name;
        this.argumentExpressions = argumentExpressions;
    }
    ValueMacroReferenceExpression.prototype.toValues = function (scope, options) {
        var argValues = MacroArgValues.createFromExpressions(this.argumentExpressions, scope, options);
        var macro;
        if (macro = scope.getValueMacro(this.name, argValues, options)) {
            return macro.toValues(argValues, options);
        }
        else {
            throw new Error("Could not find value macro '#{this.name}'");
        }
    };
    return ValueMacroReferenceExpression;
})(Expression);
module.exports = ValueMacroReferenceExpression;
//# sourceMappingURL=ValueMacroReferenceExpression.js.map