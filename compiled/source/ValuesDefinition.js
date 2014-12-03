var assert = require('assert');
var ValuesDefinition = (function () {
    function ValuesDefinition(definitions, scope) {
        this.definitions = definitions;
        this.scope = scope;
        if (this.definitions.length > 0) {
            assert(this.scope != null);
        }
        this.named = {};
        for (var index in this.definitions) {
            var definition = this.definitions[index];
            definition.index = index;
            if (definition.name) {
                this.named[definition.name] = definition;
            }
        }
        this.length = this.definitions.length;
    }
    ValuesDefinition.ZERO = new ValuesDefinition([], null);
    return ValuesDefinition;
})();
module.exports = ValuesDefinition;
//# sourceMappingURL=ValuesDefinition.js.map