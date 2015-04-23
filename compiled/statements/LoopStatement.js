var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Statement = require("./Statement");
var assert = require("assert");
var _ = require("../utilities");
var LoopStatement = (function (_super) {
    __extends(LoopStatement, _super);
    function LoopStatement(scope, body, valueIdentifier, keyIdentifier, collectionExpression) {
        _super.call(this, scope);
        this.body = body;
        this.valueIdentifier = valueIdentifier;
        this.keyIdentifier = keyIdentifier;
        this.collectionExpression = collectionExpression;
    }
    LoopStatement.prototype.eachPrimitiveStatement = function (scope, stack, callback) {
        assert(scope == this.scope);
        var collection = this.collectionExpression.evaluateToIntermediate(this, stack);
        assert(_.isArray(collection) || _.isObject(collection));
        for (var key in collection) {
            var value = collection[key];
            this.body.addLiteralValueMacro(this.valueIdentifier, value);
            if (this.keyIdentifier) {
                this.body.addLiteralValueMacro(this.keyIdentifier, key);
            }
            this.body.eachPrimitiveStatement(stack, callback);
        }
    };
    return LoopStatement;
})(Statement);
module.exports = LoopStatement;
//# sourceMappingURL=LoopStatement.js.map