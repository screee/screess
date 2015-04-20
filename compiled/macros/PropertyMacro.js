var Scope = require('../Scope');
var _ = require("../utilities");
var PropertyMacro = (function () {
    function PropertyMacro(parentScope, name, argDefinition, body) {
        if (body === void 0) { body = null; }
        this.parentScope = parentScope;
        this.name = name;
        this.argDefinition = argDefinition;
        this.body = body;
        var _Scope = require("../Scope");
        this.scope = new _Scope(this.parentScope);
        this.argLengthMin = _.count(this.argDefinition.definitions, function (argDefinition) {
            return !argDefinition.expression;
        });
        this.argLengthMax = this.argDefinition.length;
    }
    PropertyMacro.prototype.getScope = function (values, stack) {
        var scope = new Scope(this.scope, null, this.scope.statements);
        var args = values.toObject(this.argDefinition, stack);
        scope.addLiteralValueMacros(args);
        return scope;
    };
    PropertyMacro.prototype.matches = function (name, argValues) {
        return name == this.name && argValues.matches(this.argDefinition);
    };
    return PropertyMacro;
})();
module.exports = PropertyMacro;
//# sourceMappingURL=PropertyMacro.js.map