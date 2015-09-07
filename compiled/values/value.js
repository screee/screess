var Value = (function () {
    function Value() {
    }
    Value.evaluate = function (value) {
        if (value && value.evaluate) {
            return value.evaluate();
        }
        else {
            return value;
        }
    };
    Value.prototype.evaluate = function () {
        throw "Abstract method";
    };
    return Value;
})();
module.exports = Value;
//# sourceMappingURL=Value.js.map