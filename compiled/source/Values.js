var assert = require('assert');
var _ = require('./utilities');
var Values = (function () {
    // TODO add types to arguments
    function Values(positional, named) {
        this.positional = positional;
        this.named = named;
        this.length = this.positional.length + _.values(this.named).length;
    }
    // TODO make all factory methods into overloaded constructors
    // TODO add types to arguments
    Values.createFromExpressions = function (args, scope, stack) {
        var positional = [];
        var named = {};
        for (var i in args) {
            var arg = args[i];
            var argValues = arg.expression.toValues(scope, stack);
            if (arg.name) {
                assert(argValues.length == 1);
                named[arg.name] = argValues[0];
            }
            else {
                positional = positional.concat(argValues);
            }
        }
        return new Values(positional, named);
    };
    Values.prototype.matches = function (argDefinition) {
        if (!argDefinition) {
            return true;
        }
        var indicies = _.times(argDefinition.length, function () {
            return false;
        });
        for (var name in this.named) {
            var value = this.named[name];
            if (!argDefinition.named[name]) {
                return false;
            }
            indicies[argDefinition.named[name].index] = true;
        }
        // Mark positional arguments
        var positionalIndex = -1;
        for (var i in this.positional) {
            var value = this.positional[i];
            while (indicies[++positionalIndex] && positionalIndex < argDefinition.definitions.length) {
            }
            if (positionalIndex >= argDefinition.definitions.length) {
                return false;
            }
            indicies[positionalIndex] = true;
        }
        for (var i in argDefinition.definitions) {
            var definition = argDefinition.definitions[i];
            if (definition.expression) {
                indicies[definition.index] = true;
            }
        }
        return _.all(indicies);
    };
    Values.prototype.evaluate = function (argDefinition, stack) {
        assert(this.matches(argDefinition));
        if (!argDefinition) {
            return _.extend(_.objectMap(this.positional, function (values, index) {
                return [index.toString(), values];
            }), this.named);
        }
        else {
            var args = {};
            for (var name in this.named) {
                var value = this.named[name];
                args[name] = value;
            }
            var positionalIndex = 0;
            for (var i in argDefinition.definitions) {
                var definition = argDefinition.definitions[i];
                if (!args[definition.name]) {
                    if (positionalIndex < this.positional.length) {
                        args[definition.name] = this.positional[positionalIndex++];
                    }
                    else {
                        args[definition.name] = definition.expression.toValue(argDefinition.scope, stack);
                    }
                }
            }
            return args;
        }
    };
    return Values;
})();
module.exports = Values;
//# sourceMappingURL=Values.js.map