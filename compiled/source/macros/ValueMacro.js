var Scope = require('../Scope');
var assert = require('assert');
var _ = require("../utilities");
var ValueMacro = (function () {
    function ValueMacro(name, argDefinition, parentScope, body) {
        this.name = name;
        this.argDefinition = argDefinition;
        this.parentScope = parentScope;
        if (_.isArray(body)) {
            this.body = function (args, stack) {
                var scope = new Scope(parentScope);
                scope.addLiteralValueMacros(args);
                stack.scope.push(scope);
                var values = _.map(body, function (expression) {
                    return expression.evaluateToIntermediate(scope, stack);
                });
                stack.scope.pop();
                return values;
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
    ValueMacro.prototype.evaluateToIntermediates = function (argValues, stack) {
        var args = argValues.evaluate(this.argDefinition, stack);
        var values = this.body(args, stack);
        return values;
    };
    return ValueMacro;
})();
module.exports = ValueMacro;
//# sourceMappingURL=ValueMacro.js.map