var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Expression = require("./Expression");
var _ = require("../utilities");
var ArrayExpression = (function (_super) {
    __extends(ArrayExpression, _super);
    function ArrayExpression(expressions) {
        _super.call(this);
        this.expressions = expressions;
    }
    ArrayExpression.prototype.toValues = function (scope, stack) {
        var value = _.flatten(_.map(this.expressions, function (expression) {
            return expression.toValues(scope, stack);
        }));
        return [value];
    };
    return ArrayExpression;
})(Expression);
module.exports = ArrayExpression;
//# sourceMappingURL=ArrayExpression.js.map