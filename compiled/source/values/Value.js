var Value = (function () {
    function Value() {
    }
    Value.evaluate = function (value, context) {
        if (value.evaluate) {
            return value.evaluate(context);
        }
        else {
            return value;
        }
    };
    Value.prototype.evaluate = function (context) {
        throw "Abstract method";
    };
    return Value;
})();
module.exports = Value;
//# sourceMappingURL=Value.js.map