var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Expression = require("./Expression");
var Scope = require("../Scope");
var MapExpression = (function (_super) {
    __extends(MapExpression, _super);
    function MapExpression(body) {
        _super.call(this);
        this.body = body;
    }
    MapExpression.prototype.evaluateToIntermediate = function (scope, stack) {
        return this.body.evaluate(3 /* OBJECT */, stack);
    };
    return MapExpression;
})(Expression);
module.exports = MapExpression;
//# sourceMappingURL=MapExpression.js.map