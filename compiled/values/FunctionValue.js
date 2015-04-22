var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Value = require("./Value");
var assert = require("assert");
var FunctionValue = (function (_super) {
    __extends(FunctionValue, _super);
    function FunctionValue(base, stops) {
        _super.call(this);
        this.base = base;
        this.stops = stops;
    }
    FunctionValue.fromValueSet = function (values) {
        var stops = [];
        for (var key in values.named) {
            if (key == "base")
                continue;
            var stop = parseInt(key);
            assert(stop != NaN, "Malformed stop value");
            stops.push([stop, values.named[key]]);
        }
        assert(stops.length > 0, "Function has no stops");
        return new FunctionValue(values.named["base"], stops);
    };
    FunctionValue.prototype.evaluate = function () {
        if (this.base) {
            return { base: Value.evaluate(this.base), stops: this.stops };
        }
        else {
            return { stops: this.stops };
        }
    };
    return FunctionValue;
})(Value);
module.exports = FunctionValue;
//# sourceMappingURL=FunctionValue.js.map