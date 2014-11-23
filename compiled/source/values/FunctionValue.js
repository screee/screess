var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Value = require("./Value");
var _ = require("../utilities");
var FunctionValue = (function (_super) {
    __extends(FunctionValue, _super);
    function FunctionValue(base, stops) {
        _super.call(this);
        this.base = base;
        this.stops = stops;
    }
    FunctionValue.prototype.evaluateValue = function (options) {
        var stops = _.map(this.stops, function (stop) {
            return [stop[0], Value.evaluateValue(stop[1], options)];
        });
        if (this.base) {
            return { base: Value.evaluateValue(this.base, options), stops: stops };
        }
        else {
            return { stops: stops };
        }
    };
    return FunctionValue;
})(Value);
module.exports = FunctionValue;
//# sourceMappingURL=FunctionValue.js.map