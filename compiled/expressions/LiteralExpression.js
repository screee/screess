var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Expression = require("./Expression");
var LiteralExpression = (function (_super) {
    __extends(LiteralExpression, _super);
    function LiteralExpression(value) {
        _super.call(this);
        this.value = value;
    }
    LiteralExpression.literalExpression = function (value) {
        return new LiteralExpression(value);
    };
    LiteralExpression.prototype.evaluateToIntermediate = function () {
        return this.value;
    };
    return LiteralExpression;
})(Expression);
module.exports = LiteralExpression;
//# sourceMappingURL=LiteralExpression.js.map