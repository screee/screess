var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Expression = require("./Expression");
var SetOperatorExpression = (function (_super) {
    __extends(SetOperatorExpression, _super);
    function SetOperatorExpression(expression) {
        _super.call(this);
        this.expression = expression;
    }
    SetOperatorExpression.prototype.evaluateFilter = function (scope, context) {
        return ["none", this.expression.evaluateFilter(scope, context)];
    };
    return SetOperatorExpression;
})(Expression);
module.exports = SetOperatorExpression;
//# sourceMappingURL=NotOperatorExpression.js.map