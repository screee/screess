var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Expression = require("./Expression");
var assert = require('assert');
var DotNotationExpression = (function (_super) {
    __extends(DotNotationExpression, _super);
    function DotNotationExpression(baseExpression, propertyExpression) {
        _super.call(this);
        this.baseExpression = baseExpression;
        this.propertyExpression = propertyExpression;
    }
    DotNotationExpression.prototype.toValues = function (scope, stack) {
        var base = this.baseExpression.toValue(scope, stack);
        var property = this.propertyExpression.toValue(scope, stack);
        assert(_.isString(property) || _.isNumber(property));
        assert(base[property]);
        return [base[property]];
    };
    return DotNotationExpression;
})(Expression);
module.exports = DotNotationExpression;
//# sourceMappingURL=SubscriptNotationExpression.js.map