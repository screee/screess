var Value = (function () {
    function Value() {
    }
    Value.evaluateValue = function (value, options) {
        if (value.evaluateValue) {
            return value.evaluateValue(options);
        }
        else {
            return value;
        }
    };
    Value.prototype.evaluateValue = function (options) {
        throw "Abstract method";
    };
    return Value;
})();
module.exports = Value;
//# sourceMappingURL=Value.js.map