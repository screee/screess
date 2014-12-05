var Scope = require('../scopes/Scope');
var _ = require("../utilities");
var PropertyMacro = (function () {
    function PropertyMacro(parentScope, name, argDefinition, body) {
        if (body === void 0) { body = null; }
        this.parentScope = parentScope;
        this.name = name;
        this.argDefinition = argDefinition;
        this.body = body;
        var _Scope = require("../scopes/Scope");
        this.scope = new _Scope(this.parentScope);
        this.argLengthMin = _.count(this.argDefinition.definitions, function (argDefinition) {
            return !argDefinition.expression;
        });
        this.argLengthMax = this.argDefinition.length;
    }
    // TODO deprecate in favor of getScope
    // evaluate(argValues:Values, stack:Stack) {
    //   var args = argValues.evaluate(this.argDefinition, stack)
    //   var scope = new Scope(this.scope)
    //   scope.addLiteralValueMacros(args)
    //   stack.scope.push(scope)
    //   var values = _.extend(
    //     scope.evaluateProperties(stack, this.scope.statements),
    //     this.body ? this.body.apply({}, argValues) : null
    //   )
    //   stack.scope.pop()
    //   return values
    // }
    PropertyMacro.prototype.getScope = function (values, stack) {
        var scope = new Scope(this.scope, null, this.scope.statements);
        var args = values.evaluate(this.argDefinition, stack);
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