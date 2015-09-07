var Expression = require('../expressions/Expression');
var Scope = require('../Scope');
var assert = require('assert');
var _ = require("../utilities");
var ValueMacro = (function () {
    function ValueMacro(parentScope, name, argDefinition, body) {
        this.parentScope = parentScope;
        this.name = name;
        this.argDefinition = argDefinition;
        if (body instanceof Expression) {
            this.body = function (args, stack) {
                var scope = new Scope(parentScope);
                scope.addLiteralValueMacros(args);
                stack.scope.push(scope);
                var value = body.evaluateToIntermediate(scope, stack);
                stack.scope.pop();
                return value;
            };
        }
        else if (_.isFunction(body)) {
            this.body = body;
        }
        else {
            assert(false);
        }
    }
    ValueMacro.prototype.matches = function (name, argValues) {
        return name == this.name && argValues.matches(this.argDefinition);
    };
    ValueMacro.prototype.evaluateToIntermediate = function (argValues, stack) {
        var args = argValues.toObject(this.argDefinition, stack);
        var values = this.body(args, stack);
        return values;
    };
    return ValueMacro;
})();
module.exports = ValueMacro;
//# sourceMappingURL=ValueMacro.js.map