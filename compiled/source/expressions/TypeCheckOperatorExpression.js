var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Expression = require("./Expression");
var AttributeReferenceValue = require("../values/AttributeReferenceValue");
var _ = require("../utilities");
var TypeCheckExpression = (function (_super) {
    __extends(TypeCheckExpression, _super);
    function TypeCheckExpression(type) {
        _super.call(this);
        this.type = type;
    }
    TypeCheckExpression.prototype.toMGLFilter = function (scope, options) {
        return ["==", "$type", this.type.toMGLValue(scope, options)];
    };
    return TypeCheckExpression;
})(Expression);
module.exports = TypeCheckExpression;
//# sourceMappingURL=TypeCheckOperatorExpression.js.map