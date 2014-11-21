var assert = require('assert');
var MacroArgDefinition = (function () {
    // TODO create type for definitions
    function MacroArgDefinition(definitions, scope) {
        this.definitions = definitions;
        this.scope = scope;
        if (this.definitions.length > 0) {
            assert(this.scope != null);
        }
        this.namedArgs = {};
        for (var index in this.definitions) {
            var definition = this.definitions[index];
            definition.index = index;
            if (definition.name) {
                this.namedArgs[definition.name] = definition;
            }
        }
        this.length = this.definitions.length;
    }
    MacroArgDefinition.ZERO = new MacroArgDefinition([], null);
    return MacroArgDefinition;
})();
module.exports = MacroArgDefinition;
//# sourceMappingURL=MacroArgDefinition.js.map