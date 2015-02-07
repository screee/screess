var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Expression = require("./Expression");
var NullCoalescingExpression = (function (_super) {
    __extends(NullCoalescingExpression, _super);
    function NullCoalescingExpression(headExpression, tailExpression) {
        _super.call(this);
        this.headExpression = headExpression;
        this.tailExpression = tailExpression;
    }
    NullCoalescingExpression.prototype.evaluateToIntermediates = function (scope, stack) {
        var headValue = this.headExpression.evaluate(scope, stack);
        if (headValue == null) {
            return this.tailExpression.evaluateToIntermediates(scope, stack);
        }
        else {
            return [headValue];
        }
    };
    return NullCoalescingExpression;
})(Expression);
module.exports = NullCoalescingExpression;
//# sourceMappingURL=NullCoalescingExpression.js.map