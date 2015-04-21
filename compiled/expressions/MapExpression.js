var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Expression = require("./Expression");
var assert = require("assert");
var _ = require("../utilities");
var MapExpression = (function (_super) {
    __extends(MapExpression, _super);
    function MapExpression(expressions) {
        _super.call(this);
        this.expressions = expressions;
        assert(expressions.isNamed());
    }
    MapExpression.prototype.evaluateToIntermediate = function (scope, stack) {
        var output = _.objectMap(this.expressions.items, function (item) {
            return [item.name, item.expression.evaluateToIntermediate(scope, stack)];
        });
        return output;
    };
    return MapExpression;
})(Expression);
module.exports = MapExpression;
//# sourceMappingURL=MapExpression.js.map