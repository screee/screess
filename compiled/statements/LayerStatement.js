var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Scope = require("../Scope");
var Statement = require("./Statement");
var LayerStatement = (function (_super) {
    __extends(LayerStatement, _super);
    function LayerStatement(name, body) {
        _super.call(this);
        this.name = name;
        this.body = body;
        this.body.name = name;
    }
    LayerStatement.prototype.evaluate = function (scope, stack, layers, classes, properties) {
        layers.push(this.body.evaluate(1 /* LAYER */, stack));
    };
    return LayerStatement;
})(Statement);
module.exports = LayerStatement;
//# sourceMappingURL=LayerStatement.js.map