var Scope = require('../scopes/Scope');
var _ = require("../utilities");
var PropertyMacro = (function () {
    function PropertyMacro(parentScope, name, argDefinition, body) {
        if (body === void 0) { body = null; }
        this.parentScope = parentScope;
        this.name = name;
        this.argDefinition = argDefinition;
        this.body = body;
        var ClassScope = require("../scopes/ClassScope");
        this.scope = new ClassScope(this.parentScope);
        this.argLengthMin = _.count(this.argDefinition.definitions, function (argDefinition) {
            return !argDefinition.expression;
        });
        this.argLengthMax = this.argDefinition.length;
    }
    PropertyMacro.prototype.toMGLScope = function (argValues, options) {
        var args = argValues.toArguments(this.argDefinition, options);
        var scope = new Scope(this.scope);
        scope.addLiteralValueMacros(args);
        options.scopeStack.push(scope);
        var values = _.extend(scope.toMGLProperties(options, this.scope.properties), this.body ? this.body.apply({}, argValues) : null);
        options.scopeStack.pop();
        return values;
    };
    PropertyMacro.prototype.matches = function (name, argValues) {
        return name == this.name && argValues.matches(this.argDefinition);
    };
    return PropertyMacro;
})();
module.exports = PropertyMacro;
//# sourceMappingURL=PropertyMacro.js.map