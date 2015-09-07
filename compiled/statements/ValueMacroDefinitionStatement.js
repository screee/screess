var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Statement = require("./Statement");
var ValueMacroDefinitionStatement = (function (_super) {
    __extends(ValueMacroDefinitionStatement, _super);
    function ValueMacroDefinitionStatement(name, argDefinition, body) {
        _super.call(this);
        this.name = name;
        this.argDefinition = argDefinition;
        this.body = body;
    }
    ValueMacroDefinitionStatement.prototype.evaluate = function (scope, stack, layers, classes, properties) {
    };
    return ValueMacroDefinitionStatement;
})(Statement);
module.exports = ValueMacroDefinitionStatement;
//# sourceMappingURL=ValueMacroDefinitionStatement.js.map