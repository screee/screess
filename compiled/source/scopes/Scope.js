var Value = require("../values/value");
var Values = require("../Values");
var ValuesDefinition = require('../ValuesDefinition');
var assert = require("assert");
var LiteralExpression = require('../expressions/LiteralExpression');
var Stack = require('../Stack');
var _ = require("../utilities");
var ScopeType = require('./ScopeType');
var MapboxGLStyleSpec = require('../MapboxGLStyleSpec');
var Globals = require('../globals');
var StatementType;
(function (StatementType) {
    StatementType[StatementType["LOOP"] = 0] = "LOOP";
    StatementType[StatementType["LAYER"] = 1] = "LAYER";
    StatementType[StatementType["CLASS"] = 2] = "CLASS";
    StatementType[StatementType["PROPERTY"] = 3] = "PROPERTY";
})(StatementType || (StatementType = {}));
var Scope = (function () {
    function Scope(parent, name) {
        if (name === void 0) { name = null; }
        this.parent = parent;
        this.name = name;
        this.valueMacros = [];
        this.propertyMacros = [];
        this.sources = {};
        this.statements = [];
        if (this.parent == null) {
            for (var macroName in Globals.valueMacros) {
                var fn = Globals.valueMacros[macroName];
                this.addValueMacro(macroName, null, fn);
            }
            for (var macroName in Globals.propertyMacros) {
                var fn = Globals.propertyMacros[macroName];
                this.addPropertyMacro(macroName, null, fn);
            }
        }
    }
    Scope.prototype.isGlobal = function () {
        return !this.parent;
    };
    Scope.prototype.addSource = function (source) {
        if (this.isGlobal()) {
            var hash = _.hash(JSON.stringify(source)).toString();
            this.sources[hash] = source;
            return hash;
        }
        else {
            return this.parent.addSource(source);
        }
    };
    Scope.prototype.getGlobalScope = function () {
        return this.isGlobal() ? this : this.parent.getGlobalScope();
    };
    Scope.prototype.getSource = function (name) {
        return this.isGlobal() ? this.getSource(name) : this.parent.getSource(name);
    };
    Scope.prototype.addProperty = function (name, expressions) {
        // TODO check for duplicate properties
        assert(name != null);
        this.statements.push({
            type: 3 /* PROPERTY */,
            name: name,
            expressions: expressions
        });
    };
    Scope.prototype.addClassScope = function (name) {
        // TODO ensure class scopes are merged properly
        var scope = new Scope(this, name);
        this.statements.push({
            type: 2 /* CLASS */,
            scope: scope
        });
        return scope;
    };
    Scope.prototype.addLayerScope = function (name) {
        // TODO check for duplicate layer scopes
        var scope = new Scope(this, name);
        this.statements.push({
            type: 1 /* LAYER */,
            scope: scope
        });
        return scope;
    };
    Scope.prototype.addLoop = function (valueIdentifier, keyIdentifier, collectionExpression) {
        var loop = {
            valueIdentifier: valueIdentifier,
            keyIdentifier: keyIdentifier,
            collectionExpression: collectionExpression,
            scope: new Scope(this)
        };
        this.statements.push({
            type: 0 /* LOOP */,
            loop: loop
        });
        return loop.scope;
    };
    Scope.prototype.addLiteralValueMacros = function (values) {
        for (var identifier in values) {
            this.addLiteralValueMacro(identifier, values[identifier]);
        }
    };
    Scope.prototype.addLiteralValueMacro = function (identifier, value) {
        this.addValueMacro(identifier, ValuesDefinition.ZERO, [new LiteralExpression(value)]);
    };
    Scope.prototype.addValueMacro = function (name, argDefinition, body) {
        var ValueMacro_ = require("../macros/ValueMacro");
        var macro = new ValueMacro_(name, argDefinition, this, body);
        return this.valueMacros.unshift(macro);
    };
    Scope.prototype.addPropertyMacro = function (name, argDefinition, body) {
        var PropertyMacro = require("../macros/PropertyMacro");
        var macro = new PropertyMacro(this, name, argDefinition, body);
        this.propertyMacros.unshift(macro);
        return macro.scope;
    };
    Scope.prototype.getValueMacro = function (name, values, stack) {
        for (var i in this.valueMacros) {
            var macro = this.valueMacros[i];
            if (macro.matches(name, values) && !_.contains(stack.valueMacro, macro)) {
                return macro;
            }
        }
        if (this.isGlobal() && values.length == 0) {
            var ValueMacro_ = require("../macros/ValueMacro");
            return new ValueMacro_(name, ValuesDefinition.ZERO, this, [new LiteralExpression(name)]);
        }
        else if (this.parent) {
            return this.parent.getValueMacro(name, values, stack);
        }
        else {
            return null;
        }
    };
    Scope.prototype.getPropertyMacro = function (name, values, stack) {
        for (var i in this.propertyMacros) {
            var macro = this.propertyMacros[i];
            if (macro.matches(name, values) && !_.contains(stack.propertyMacro, macro)) {
                return macro;
            }
        }
        // TODO create super parent class that returns null for everything to
        // avoid this.
        return this.parent ? this.parent.getPropertyMacro(name, values, stack) : null;
    };
    Scope.prototype.evaluateProperties = function (stack, statements) {
        if (statements === void 0) { statements = this.statements; }
        var output = {};
        var propertyStatements = _.filter(statements, function (statement) {
            return statement.type == 3 /* PROPERTY */;
        });
        for (var i in propertyStatements) {
            var statement = propertyStatements[i];
            var name = statement.name;
            var expressions = statement.expressions;
            // TODO refactor Values constructor to accept this
            var values = new Values(_.map(expressions, function (expression) {
                return { expression: expression };
            }), this, stack);
            var propertyMacro;
            if (propertyMacro = this.getPropertyMacro(name, values, stack)) {
                stack.propertyMacro.push(propertyMacro);
                _.extend(output, propertyMacro.evaluate(values, stack));
                stack.propertyMacro.pop();
            }
            else {
                if (values.length != 1 || values.positional.length != 1) {
                    throw new Error("Cannot apply " + values.length + " args to primitive property " + name);
                }
                output[name] = Value.evaluate(values.positional[0], stack);
            }
        }
        return output;
    };
    Scope.prototype.evaluateGlobalScope = function (stack) {
        if (stack === void 0) { stack = new Stack(); }
        stack.scope.push(this);
        var layers = this.evaluateLayers(stack);
        var properties = this.evaluateProperties(stack);
        var sources = _.objectMapValues(this.sources, function (source, name) {
            return _.objectMapValues(source, function (value, key) {
                return Value.evaluate(value, stack);
            });
        });
        var transition = {
            duration: properties["transition-delay"],
            delay: properties["transition-duration"]
        };
        delete properties["transition-delay"];
        delete properties["transition-duration"];
        stack.scope.pop();
        return _.extend(properties, {
            version: 6,
            layers: layers,
            sources: sources,
            transition: transition
        });
    };
    Scope.prototype.evaluateClassScope = function (stack) {
        // TODO assert there are no child layers or classes
        stack.scope.push(this);
        this.evaluateProperties(stack);
        stack.scope.pop();
    };
    Scope.prototype.evaluateClassPaintProperties = function (type, stack) {
        // TODO ensure all properties are paint properties, not layout properties
        var classStatements = _.filter(this.statements, function (statement) {
            return statement.type == 2 /* CLASS */;
        });
        return _.objectMap(classStatements, function (statement, name) {
            return [
                "paint." + name,
                statement.scope.evaluateClassScope(stack)
            ];
        });
    };
    Scope.prototype.evaluateLayerScope = function (stack) {
        stack.scope.push(this);
        var properties = this.evaluateProperties(stack);
        var metaProperties = {};
        var paintProperties = {};
        var layoutProperties = {};
        var layers = this.evaluateLayers(stack);
        var type = properties['$type'] || 'raster';
        for (var name in properties) {
            var value = properties[name];
            if (_.startsWith(name, '$')) {
                metaProperties[name.slice(1)] = value;
            }
            else if (name == 'z-index') {
                metaProperties['z-index'] = value;
            }
            else if (_.contains(MapboxGLStyleSpec[type].paint, name)) {
                paintProperties[name] = value;
            }
            else if (_.contains(MapboxGLStyleSpec[type].layout, name)) {
                layoutProperties[name] = value;
            }
            else {
                assert(false);
            }
        }
        if (layers) {
            if (metaProperties['type']) {
                assert.equal(metaProperties['type'], 'raster');
            }
            metaProperties['type'] = 'raster';
        }
        // TODO ensure layer has a source and type
        // TODO remove this _.objectCompact call -- some falsey values are important.
        var output = _.objectCompact(_.extend({
            id: this.name || _.uniqueId('scope'),
            layers: layers,
            paint: paintProperties,
            layout: layoutProperties
        }, metaProperties, this.evaluateClassPaintProperties(type, stack)));
        stack.scope.pop();
        return output;
    };
    Scope.prototype.evaluate = function (type, stack) {
        if (type == 0 /* GLOBAL */) {
            return this.evaluateGlobalScope(stack);
        }
        else if (type == 1 /* LAYER */) {
            return this.evaluateLayerScope(stack);
        }
        else if (type == 2 /* CLASS */) {
            return this.evaluateClassScope(stack);
        }
        else {
            assert(false);
        }
    };
    Scope.prototype.eachLoopScope = function (loop, stack, callback) {
        var scope = loop.scope;
        var collectionExpression = loop.collectionExpression;
        var valueIdentifier = loop.valueIdentifier;
        var keyIdentifier = loop.keyIdentifier;
        var collection = collectionExpression.toValue(this, stack);
        assert(_.isArray(collection) || _.isObject(collection));
        for (var key in collection) {
            var value = collection[key];
            scope.addLiteralValueMacro(valueIdentifier, value);
            if (keyIdentifier) {
                scope.addLiteralValueMacro(keyIdentifier, key);
            }
            callback(scope);
        }
    };
    Scope.prototype.evaluateLayers = function (stack) {
        var layers = [];
        for (var i in this.statements) {
            var statement = this.statements[i];
            if (statement.type == 1 /* LAYER */) {
                layers.push(statement.scope.evaluateLayerScope(stack));
            }
            else if (statement.type == 0 /* LOOP */) {
                this.eachLoopScope(statement.loop, stack, function (scope) {
                    layers = layers.concat(scope.evaluateLayers(stack));
                });
            }
        }
        // We are relying on the behavior that the original ordering is preserved
        // for layers with the same z-index
        layers = _.sortBy(layers, 'z-index');
        for (var i in layers) {
            var layer = layers[i];
            delete layer['z-index'];
        }
        return layers.length ? layers : undefined;
    };
    return Scope;
})();
module.exports = Scope;
//# sourceMappingURL=Scope.js.map