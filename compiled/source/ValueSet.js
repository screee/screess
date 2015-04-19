var assert = require('assert');
var _ = require('./utilities');
var Expression = require('./expressions/Expression');
var ValueSet = (function () {
    function ValueSet(args, scope, stack) {
        if (_.isArrayOf(args, Expression)) {
            args = _.map(args, function (expression) {
                return { expression: expression };
            });
        }
        this.positional = [];
        this.named = {};
        for (var i in args) {
            var arg = args[i];
            var argValues = arg.expression.evaluateToIntermediates(scope, stack);
            if (arg.name) {
                assert(argValues.length == 1);
                this.named[arg.name] = argValues[0];
            }
            else {
                this.positional = this.positional.concat(argValues);
            }
        }
        this.length = this.positional.length + _.values(this.named).length;
    }
    ValueSet.prototype.matches = function (argDefinition) {
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
    ValueSet.prototype.evaluate = function (argDefinition, stack) {
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
                        args[definition.name] = definition.expression.evaluateToIntermediate(argDefinition.scope, stack);
                    }
                }
            }
            return args;
        }
    };
    return ValueSet;
})();
module.exports = ValueSet;
//# sourceMappingURL=ValueSet.js.map