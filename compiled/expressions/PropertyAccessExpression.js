var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Expression = require("./Expression");
var assert = require('assert');
var _ = require("underscore");
var PropertyAccessExpression = (function (_super) {
    __extends(PropertyAccessExpression, _super);
    function PropertyAccessExpression(baseExpression, propertyExpression) {
        _super.call(this);
        this.baseExpression = baseExpression;
        this.propertyExpression = propertyExpression;
        assert(this.baseExpression instanceof Expression);
        assert(this.propertyExpression instanceof Expression);
    }
    PropertyAccessExpression.prototype.evaluateToIntermediate = function (scope, stack) {
        var base = this.baseExpression.evaluateToIntermediate(scope, stack);
        var property = this.propertyExpression.evaluateToIntermediate(scope, stack);
        assert(_.isString(property) || _.isNumber(property));
        assert(base[property] !== undefined);
        return base[property];
    };
    return PropertyAccessExpression;
})(Expression);
module.exports = PropertyAccessExpression;
//# sourceMappingURL=PropertyAccessExpression.js.map