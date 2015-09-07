var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Statement = require("./Statement");
var MacroDefinitionStatement = (function (_super) {
    __extends(MacroDefinitionStatement, _super);
    function MacroDefinitionStatement(name, argDefinition, body) {
        _super.call(this);
        this.name = name;
        this.argDefinition = argDefinition;
        this.body = body;
    }
    MacroDefinitionStatement.prototype.evaluate = function (scope, stack, layers, classes, properties) {
    };
    return MacroDefinitionStatement;
})(Statement);
module.exports = MacroDefinitionStatement;
//# sourceMappingURL=MacroDefinitionStatement.js.map