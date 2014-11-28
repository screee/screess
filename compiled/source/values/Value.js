var Value = (function () {
    function Value() {
    }
    Value.evaluate = function (value, stack) {
        if (value && value.evaluate) {
            return value.evaluate(stack);
        }
        else {
            return value;
        }
    };
    Value.prototype.evaluate = function (stack) {
        throw "Abstract method";
    };
    return Value;
})();
module.exports = Value;
//# sourceMappingURL=value.js.map