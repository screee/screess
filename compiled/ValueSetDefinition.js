var assert = require('assert');
var ValueSetDefinition = (function () {
    function ValueSetDefinition(definitions, scope) {
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
    ValueSetDefinition.ZERO = new ValueSetDefinition([], null);
    return ValueSetDefinition;
})();
module.exports = ValueSetDefinition;
//# sourceMappingURL=ValueSetDefinition.js.map