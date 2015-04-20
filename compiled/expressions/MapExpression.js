var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Expression = require("./Expression");
var _ = require("../utilities");
var MapExpression = (function (_super) {
    __extends(MapExpression, _super);
    function MapExpression(entries) {
        _super.call(this);
        this.entries = entries;
    }
    MapExpression.prototype.evaluateToIntermediate = function (scope, stack) {
        var value = _.objectMap(this.entries, function (entry) {
            return [entry.name, entry.expression.evaluateToIntermediate(scope, stack)];
        });
        return value;
    };
    return MapExpression;
})(Expression);
module.exports = MapExpression;
//# sourceMappingURL=MapExpression.js.map