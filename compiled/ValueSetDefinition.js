var assert = require('assert');
var ValueSetDefinition = (function () {
    // TODO remove scope argument
    function ValueSetDefinition(definitions, scope, isWildcard_) {
        if (isWildcard_ === void 0) { isWildcard_ = false; }
        this.definitions = definitions;
        this.scope = scope;
        this.isWildcard_ = isWildcard_;
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
    ValueSetDefinition.prototype.isWildcard = function () {
        return this.isWildcard_;
    };
    ValueSetDefinition.ZERO = new ValueSetDefinition([], null);
    ValueSetDefinition.WILDCARD = new ValueSetDefinition([], null, true);
    return ValueSetDefinition;
})();
module.exports = ValueSetDefinition;
//# sourceMappingURL=ValueSetDefinition.js.map