var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Expression = require("./Expression");
var assert = require('assert');
var _ = require("../utilities");
// TODO merge this class with DotExpression
var SubscriptExpression = (function (_super) {
    __extends(SubscriptExpression, _super);
    function SubscriptExpression(baseExpression, propertyExpression) {
        _super.call(this);
        this.baseExpression = baseExpression;
        this.propertyExpression = propertyExpression;
    }
    SubscriptExpression.prototype.evaluateToIntermediates = function (scope, stack) {
        var base = this.baseExpression.evaluateToIntermediate(scope, stack);
        var property = this.propertyExpression.evaluateToIntermediate(scope, stack);
        assert(_.isString(property) || _.isNumber(property));
        assert(base[property] !== undefined);
        return [base[property]];
    };
    return SubscriptExpression;
})(Expression);
module.exports = SubscriptExpression;
//# sourceMappingURL=SubscriptExpression.js.map