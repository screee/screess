var Value = require("../values/value");
var MacroArgValues = require("../macros/MacroArgValues");
var MacroArgDefinition = require('../macros/MacroArgDefinition');
var assert = require("assert");
var LiteralExpression = require('../expressions/LiteralExpression');
var _ = require("../utilities");
var Scope = (function () {
    function Scope(parent) {
        this.parent = parent;
        assert(!this.parent || _.is(this.parent, Scope));
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
            throw new Error("Duplicate entries for property '#{name}'");
        }
        return this.properties[name] = expressions;
    };
    Scope.prototype.addLiteralValueMacros = function (values) {
        for (name in values) {
            var value = values[name];
            this.addValueMacro(name, MacroArgDefinition.ZERO, [new LiteralExpression(value)]);
        }
    };
    Scope.prototype.addValueMacro = function (name, argDefinition, body) {
        assert(_.is(argDefinition, MacroArgDefinition) || !argDefinition);
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
        assert(_.is(argDefinition, MacroArgDefinition) || !argDefinition);
        var PropertyMacro = require("../macros/PropertyMacro");
        var macro = new PropertyMacro(this, name, argDefinition, body);
        this.propertyMacros.unshift(macro);
        return macro.scope;
    };
    Scope.prototype.getValueMacro = function (name, argValues, options) {
        for (var i in this.valueMacros) {
            var macro = this.valueMacros[i];
            if (macro.matches(name, argValues) && !_.contains(options.valueMacroStack, macro)) {
                return macro;
            }
        }
        return this.parent ? this.parent.getValueMacro(name, argValues, options) : null;
    };
    Scope.prototype.getPropertyMacro = function (name, argValues, options) {
        for (var i in this.propertyMacros) {
            var macro = this.propertyMacros[i];
            if (macro.matches(name, argValues) && !_.contains(options.propertyMacroStack, macro)) {
                return macro;
            }
        }
        // TODO create super parent class that returns null for everything to
        // avoid this.
        return this.parent ? this.parent.getPropertyMacro(name, argValues, options) : null;
    };
    Scope.prototype.toMGLProperties = function (options, properties) {
        var output = {};
        for (var name in properties) {
            var expressions = properties[name];
            options.property = name;
            var argValues = MacroArgValues.createFromExpressions(_.map(expressions, function (expression) {
                return { expression: expression };
            }), this, options);
            var propertyMacro;
            if (propertyMacro = this.getPropertyMacro(name, argValues, options)) {
                options.propertyMacroStack.push(propertyMacro);
                _.extend(output, propertyMacro.toMGLScope(argValues, options));
                options.propertyMacroStack.pop();
            }
            else {
                if (argValues.length != 1 || argValues.positionalArgs.length != 1) {
                    throw new Error("Cannot apply #{argValues.length} args to primitive property '#{name}'");
                }
                output[name] = Value.toMGLValue(argValues.positionalArgs[0], options);
            }
            options.property = null;
        }
        return output;
    };
    return Scope;
})();
module.exports = Scope;
//# sourceMappingURL=Scope.js.map