var ValuesDefinition = require('../ValuesDefinition');
var Scope = require('../scopes/Scope');
var LiteralExpression = require('../expressions/LiteralExpression');
var assert = require('assert');
var _ = require("../utilities");
var ValueMacro = (function () {
    function ValueMacro(name, argDefinition, parentScope, body) {
        this.name = name;
        this.argDefinition = argDefinition;
        this.parentScope = parentScope;
        this.body = body;
    }
    // TODO make overloaded constructors
    ValueMacro.createFromValue = function (name, scope, value) {
        return this.createFromExpression(name, ValuesDefinition.ZERO, scope, new LiteralExpression(value));
    };
    // TODO make overloaded constructors
    ValueMacro.createFromExpression = function (name, argDefinition, parentScope, expression) {
        return this.createFromExpressions(name, argDefinition, parentScope, [expression]);
    };
    // TODO make overloaded constructors
    ValueMacro.createFromExpressions = function (name, argDefinition, parentScope, expressions) {
        assert(_.isArray(expressions));
        return this.createFromFunction(name, argDefinition, parentScope, function (args, stack) {
            var scope = new Scope(null, parentScope);
            scope.addLiteralValueMacros(args);
            stack.scope.push(scope);
            var values = _.map(expressions, function (expression) {
                return expression.toValue(scope, stack);
            });
            stack.scope.pop();
            return values;
        });
    };
    // TODO make overloaded constructors
    ValueMacro.createFromFunction = function (name, argDefinition, parentScope, body) {
        assert(_.isFunction(body));
        return new ValueMacro(name, argDefinition, parentScope, body);
    };
    ValueMacro.prototype.matches = function (name, argValues) {
        return name == this.name && argValues.matches(this.argDefinition);
    };
    ValueMacro.prototype.toValues = function (argValues, stack) {
        var args = argValues.evaluate(this.argDefinition, stack);
        var values = this.body(args, stack);
        return values;
    };
    return ValueMacro;
})();
module.exports = ValueMacro;
//# sourceMappingURL=ValueMacro.js.map