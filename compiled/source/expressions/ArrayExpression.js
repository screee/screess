var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Expression = require("./Expression");
var ArrayExpression = (function (_super) {
    __extends(ArrayExpression, _super);
    function ArrayExpression(expressions) {
        _super.call(this);
        this.expressions = expressions;
    }
    ArrayExpression.prototype.toValues = function (scope, stack) {
        var values = [];
        for (var i in this.expressions) {
            var expression = this.expressions[i];
            var expressionValues = expression.toValues(scope, stack);
            values = values.concat(expressionValues);
        }
        return [values];
    };
    return ArrayExpression;
})(Expression);
module.exports = ArrayExpression;
//# sourceMappingURL=ArrayExpression.js.map