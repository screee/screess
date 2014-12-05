var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Expression = require("./Expression");
var Values = require('../Values');
var ValueMacroReferenceExpression = (function (_super) {
    __extends(ValueMacroReferenceExpression, _super);
    // TODO add type to argumentExpressions
    function ValueMacroReferenceExpression(name, argumentExpressions) {
        _super.call(this);
        this.name = name;
        this.argumentExpressions = argumentExpressions;
    }
    ValueMacroReferenceExpression.prototype.evaluateToIntermediates = function (scope, stack) {
        var argValues = new Values(this.argumentExpressions, scope, stack);
        var macro = scope.getValueMacro(this.name, argValues, stack);
        if (!macro) {
            throw new Error("Could not find value macro " + this.name);
        }
        return macro.evaluateToIntermediates(argValues, stack);
    };
    return ValueMacroReferenceExpression;
})(Expression);
module.exports = ValueMacroReferenceExpression;
//# sourceMappingURL=ValueMacroReferenceExpression.js.map