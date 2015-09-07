var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Expression = require("./Expression");
var ScopeValue = require('../values/ScopeValue');
var ScopeExpression = (function (_super) {
    __extends(ScopeExpression, _super);
    function ScopeExpression(body) {
        _super.call(this);
        this.body = body;
    }
    ScopeExpression.prototype.evaluateToIntermediate = function (scope, stack) {
        return new ScopeValue(this.body.clone(scope));
    };
    return ScopeExpression;
})(Expression);
module.exports = ScopeExpression;
//# sourceMappingURL=ScopeExpression.js.map