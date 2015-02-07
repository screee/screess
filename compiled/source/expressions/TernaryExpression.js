var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Expression = require("./Expression");
var TernaryExpression = (function (_super) {
    __extends(TernaryExpression, _super);
    function TernaryExpression(conditionExpression, trueExpression, falseExpression) {
        _super.call(this);
        this.conditionExpression = conditionExpression;
        this.trueExpression = trueExpression;
        this.falseExpression = falseExpression;
    }
    TernaryExpression.prototype.evaluateToIntermediates = function (scope, stack) {
        var conditionValue = this.conditionExpression.evaluate(scope, stack);
        if (conditionValue === true) {
            return this.trueExpression.evaluateToIntermediates(scope, stack);
        }
        else if (conditionValue === false) {
            return this.falseExpression.evaluateToIntermediates(scope, stack);
        }
        else {
            throw new Error("Compile-time condition could not be resolved.");
        }
    };
    return TernaryExpression;
})(Expression);
module.exports = TernaryExpression;
//# sourceMappingURL=TernaryExpression.js.map