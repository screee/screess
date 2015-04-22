var assert = require('assert');
var _ = require('./utilities');
var Expression = require('./expressions/Expression');
var ValueSet = (function () {
    function ValueSet(items) {
        this.positional = [];
        this.named = {};
        for (var i in items) {
            var item = items[i];
            if (item.name !== undefined) {
                this.named[item.name] = item.value;
            }
            else {
                this.positional.push(item.value);
            }
        }
        this.length = this.positional.length + _.values(this.named).length;
    }
    // TODO factor into ExpressionSet
    ValueSet.fromPositionalExpressions = function (scope, stack, expressions) {
        assert(scope != null && stack != null);
        return this.fromExpressions(scope, stack, _.map(expressions, function (expression) {
            return { expression: expression };
        }));
    };
    // TODO factor into ExpressionSet
    ValueSet.fromExpressions = function (scope, stack, expressions) {
        assert(scope != null && stack != null, "scope and stack");
        return this.fromValues(_.map(expressions, function (item) {
            assert(item.expression instanceof Expression);
            return {
                value: item.expression.evaluateToIntermediate(scope, stack),
                name: item.name
            };
        }));
    };
    ValueSet.fromPositionalValues = function (values) {
        return this.fromValues(_.map(values, function (value) {
            return { value: value };
        }));
    };
    ValueSet.fromValues = function (values) {
        return new ValueSet(values);
    };
    // TODO move to ValueSetDefinition class
    ValueSet.prototype.matches = function (argDefinition) {
        // TODO remove below line and replace with "assert(argDefinition);"
        if (!argDefinition)
            return true;
        if (argDefinition.isWildcard())
            return true;
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
    ValueSet.prototype.toObject = function (argDefinition, stack) {
        assert(this.matches(argDefinition));
        if (!argDefinition) {
            return _.extend(_.objectMap(this.positional, function (values, index) {
                return [index.toString(), values];
            }), this.named);
        }
        else if (argDefinition.isWildcard()) {
            return { arguments: this };
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
    ValueSet.ZERO = new ValueSet([]);
    return ValueSet;
})();
module.exports = ValueSet;
//# sourceMappingURL=ValueSet.js.map