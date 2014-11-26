var Value = require("../values/value");
var Values = require("../Values");
var ValuesDefinition = require('../ValuesDefinition');
var assert = require("assert");
var LiteralExpression = require('../expressions/LiteralExpression');
var _ = require("../utilities");
var Scope = (function () {
    function Scope(parent) {
        this.parent = parent;
        this.properties = {};
        this.valueMacros = [];
        this.propertyMacros = [];
    }
    Scope.prototype.getGlobalScope = function () {
        return this.parent.getGlobalScope();
    };
    Scope.prototype.getSource = function (name) {
        return this.parent.getSource(name);
    };
    Scope.prototype.addProperty = function (name, expressions) {
        if (this.properties[name]) {
            throw new Error("Duplicate entries for property " + name);
        }
        return this.properties[name] = expressions;
    };
    Scope.prototype.addLiteralValueMacros = function (values) {
        for (name in values) {
            var value = values[name];
            this.addValueMacro(name, ValuesDefinition.ZERO, [new LiteralExpression(value)]);
        }
    };
    // TODO overload function for different arg types
    Scope.prototype.addValueMacro = function (name, argDefinition, body) {
        var ValueMacro = require("../macros/ValueMacro");
        // TODO move this logic to ValueMacro
        var macro;
        if (_.isArray(body)) {
            macro = ValueMacro.createFromExpressions(name, argDefinition, this, body);
        }
        else if (_.isFunction(body)) {
            macro = ValueMacro.createFromFunction(name, argDefinition, this, body);
        }
        else {
            assert(false);
        }
        return this.valueMacros.unshift(macro);
    };
    Scope.prototype.addPropertyMacro = function (name, argDefinition, body) {
        var PropertyMacro = require("../macros/PropertyMacro");
        var macro = new PropertyMacro(this, name, argDefinition, body);
        this.propertyMacros.unshift(macro);
        return macro.scope;
    };
    Scope.prototype.getValueMacro = function (name, argValues, stack) {
        for (var i in this.valueMacros) {
            var macro = this.valueMacros[i];
            if (macro.matches(name, argValues) && !_.contains(stack.valueMacro, macro)) {
                return macro;
            }
        }
        return this.parent ? this.parent.getValueMacro(name, argValues, stack) : null;
    };
    Scope.prototype.getPropertyMacro = function (name, argValues, stack) {
        for (var i in this.propertyMacros) {
            var macro = this.propertyMacros[i];
            if (macro.matches(name, argValues) && !_.contains(stack.propertyMacro, macro)) {
                return macro;
            }
        }
        // TODO create super parent class that returns null for everything to
        // avoid this.
        return this.parent ? this.parent.getPropertyMacro(name, argValues, stack) : null;
    };
    Scope.prototype.evaluateProperties = function (stack, properties) {
        var output = {};
        for (var name in properties) {
            var expressions = properties[name];
            var argValues = Values.createFromExpressions(_.map(expressions, function (expression) {
                return { expression: expression };
            }), this, stack);
            var propertyMacro;
            if (propertyMacro = this.getPropertyMacro(name, argValues, stack)) {
                stack.propertyMacro.push(propertyMacro);
                _.extend(output, propertyMacro.evaluateScope(argValues, stack));
                stack.propertyMacro.pop();
            }
            else {
                if (argValues.length != 1 || argValues.positional.length != 1) {
                    throw new Error("Cannot apply " + argValues.length + " args to primitive property " + name);
                }
                output[name] = Value.evaluate(argValues.positional[0], stack);
            }
        }
        return output;
    };
    return Scope;
})();
module.exports = Scope;
//# sourceMappingURL=Scope.js.map