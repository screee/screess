var Value = (function () {
    function Value() {
    }
    Value.toMGLValue = function (value, options) {
        if (value.toMGLValue) {
            return value.toMGLValue(options);
        }
        else {
            return value;
        }
    };
    Value.prototype.toMGLValue = function (options) {
        throw "Abstract method";
    };
    return Value;
})();
module.exports = Value;
//# sourceMappingURL=Value.js.map