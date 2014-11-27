var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Expression = require("./Expression");
var assert = require('assert');
var DotNotationExpression = (function (_super) {
    __extends(DotNotationExpression, _super);
    function DotNotationExpression(baseExpression, property) {
        _super.call(this);
        this.baseExpression = baseExpression;
        this.property = property;
        assert(this.baseExpression instanceof Expression);
    }
    DotNotationExpression.prototype.toValues = function (scope, stack) {
        var base = this.baseExpression.toValues(scope, stack)[0];
        assert(base[this.property]);
        return [base[this.property]];
    };
    return DotNotationExpression;
})(Expression);
module.exports = DotNotationExpression;
//# sourceMappingURL=DotNotationExpression.js.map