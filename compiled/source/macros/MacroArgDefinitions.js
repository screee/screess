var assert = require('assert');
var MacroArgDefinitions = (function () {
    // TODO create type for definitions
    function MacroArgDefinitions(definitions, scope) {
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
    MacroArgDefinitions.ZERO = new MacroArgDefinitions([], null);
    return MacroArgDefinitions;
})();
module.exports = MacroArgDefinitions;
//# sourceMappingURL=MacroArgDefinitions.js.map