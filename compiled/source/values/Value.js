var Value = (function () {
    function Value() {
    }
    Value.evaluate = function (value, options) {
        if (value.evaluate) {
            return value.evaluate(options);
        }
        else {
            return value;
        }
    };
    Value.prototype.evaluate = function (options) {
        throw "Abstract method";
    };
    return Value;
})();
module.exports = Value;
//# sourceMappingURL=Value.js.map