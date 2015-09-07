var Scope = require('../Scope');
var _ = require("../utilities");
var PropertyMacro = (function () {
    // TODO drop bodyFunction parameter
    function PropertyMacro(parentScope, name, argDefinition, body) {
        this.parentScope = parentScope;
        this.name = name;
        this.argDefinition = argDefinition;
        this.body = body;
        this.argLengthMin = _.count(this.argDefinition.definitions, function (argDefinition) {
            return !argDefinition.expression;
        });
        this.argLengthMax = this.argDefinition.length;
        if (body instanceof Scope) {
            this.bodyScope = body;
            this.bodyFunction = null;
        }
        else if (body) {
            this.bodyFunction = body;
            this.bodyScope = new Scope(this.parentScope);
        }
    }
    PropertyMacro.prototype.matches = function (name, argValues) {
        return name == this.name && argValues.matches(this.argDefinition);
    };
    PropertyMacro.prototype.evaluate = function (values, stack, callback) {
        stack.propertyMacro.push(this);
        var args = values.toObject(this.argDefinition, stack);
        this.bodyScope.addLiteralValueMacros(args);
        this.bodyScope.eachPrimitiveStatement(stack, callback);
        if (this.bodyFunction)
            this.bodyFunction(this, values, stack, callback);
        stack.propertyMacro.pop();
    };
    return PropertyMacro;
})();
module.exports = PropertyMacro;
//# sourceMappingURL=PropertyMacro.js.map