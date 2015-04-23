var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Statement = require("./Statement");
var ConditionalStatement = (function (_super) {
    __extends(ConditionalStatement, _super);
    // TODO only accept a condition, true statement, and false statement; chain for "else if"
    function ConditionalStatement(items) {
        _super.call(this);
        this.items = items;
    }
    ConditionalStatement.prototype.eachPrimitiveStatement = function (scope, stack, callback) {
        for (var i in this.items) {
            var item = this.items[i];
            if (item.condition.evaluateToIntermediate(scope, stack)) {
                item.scope.eachPrimitiveStatement(stack, callback);
                break;
            }
        }
    };
    return ConditionalStatement;
})(Statement);
module.exports = ConditionalStatement;
//# sourceMappingURL=ConditionalStatement.js.map