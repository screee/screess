var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Expression = require("./Expression");
var TypeCheckExpression = (function (_super) {
    __extends(TypeCheckExpression, _super);
    function TypeCheckExpression(type) {
        _super.call(this);
        this.type = type;
    }
    TypeCheckExpression.prototype.evaluateToIntermediate = function (scope, stack) {
        return ["==", "$type", this.type.evaluate(scope, stack)];
    };
    return TypeCheckExpression;
})(Expression);
module.exports = TypeCheckExpression;
//# sourceMappingURL=TypeCheckOperatorExpression.js.map