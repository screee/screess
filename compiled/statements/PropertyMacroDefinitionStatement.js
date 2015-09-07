var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Statement = require("./Statement");
var PropertyMacroDefinitionStatement = (function (_super) {
    __extends(PropertyMacroDefinitionStatement, _super);
    function PropertyMacroDefinitionStatement(name, argDefinition, body) {
        _super.call(this);
        this.name = name;
        this.argDefinition = argDefinition;
        this.body = body;
    }
    PropertyMacroDefinitionStatement.prototype.evaluate = function (scope, stack, layers, classes, properties) {
    };
    return PropertyMacroDefinitionStatement;
})(Statement);
module.exports = PropertyMacroDefinitionStatement;
//# sourceMappingURL=PropertyMacroDefinitionStatement.js.map