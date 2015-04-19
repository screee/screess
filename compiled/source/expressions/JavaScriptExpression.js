var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Expression = require("./Expression");
var eval = require("../eval");
var parse = require("../parser").parse;
var JavaScriptExpression = (function (_super) {
    __extends(JavaScriptExpression, _super);
    function JavaScriptExpression(source) {
        _super.call(this);
        this.source = source;
    }
    JavaScriptExpression.prototype.evaluateToIntermediates = function (scope, stack) {
        return [eval(this.source, scope, stack)];
    };
    return JavaScriptExpression;
})(Expression);
module.exports = JavaScriptExpression;
//# sourceMappingURL=JavaScriptExpression.js.map