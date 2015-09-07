var Expression = require('../expressions/Expression');
var Scope = require('../Scope');
var assert = require('assert');
var _ = require("../utilities");
// TODO strongly type function args
var Macro = (function () {
    function Macro(parentScope, name, argDefinition, body) {
        this.parentScope = parentScope;
        this.name = name;
        this.argDefinition = argDefinition;
        if (body instanceof Expression) {
            this.body = function (args, stack) {
                var scope = new Scope(parentScope);
                scope.addLiteralMacros(args);
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
    Macro.prototype.matches = function (name, argValues) {
        return name == this.name && argValues.matches(this.argDefinition);
    };
    Macro.prototype.evaluateToIntermediate = function (argValues, stack) {
        var args = argValues.toObject(this.argDefinition, stack);
        var values = this.body(args, stack);
        return values;
    };
    return Macro;
})();
module.exports = Macro;
//# sourceMappingURL=Macro.js.map