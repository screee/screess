var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Scope = require("../Scope");
var Statement = require("./Statement");
var ClassStatement = (function (_super) {
    __extends(ClassStatement, _super);
    function ClassStatement(name, body) {
        _super.call(this);
        this.name = name;
        this.body = body;
    }
    ClassStatement.prototype.evaluate = function (scope, stack, layers, classes, properties) {
        classes.push(this.body.evaluate(2 /* CLASS */, stack));
    };
    return ClassStatement;
})(Statement);
module.exports = ClassStatement;
//# sourceMappingURL=ClassStatement.js.map