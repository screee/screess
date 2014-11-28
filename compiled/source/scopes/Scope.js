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
var Scope = (function () {
    function Scope(parent, name) {
        this.parent = parent;
        this.name = name;
        this.properties = {};
        this.valueMacros = [];
        this.propertyMacros = [];
        this.loops = [];
        this.classScopes = {};
        this.layerScopes = {};
        this.sources = {};
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
    Scope.prototype.getProperties = function () {
        return this.properties;
    };
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
        if (this.properties[name]) {
            throw new Error("Duplicate entries for property " + name);
        }
        return this.properties[name] = expressions;
    };
    Scope.prototype.addClassScope = function (name) {
        if (!this.classScopes[name]) {
            this.classScopes[name] = new Scope(this, name);
        }
        return this.classScopes[name];
    };
    Scope.prototype.addLayerScope = function (name) {
        if (this.layerScopes[name]) {
            throw new Error("Duplicate entries for layer scope " + name);
        }
        return this.layerScopes[name] = new Scope(this, name);
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
        var macro;
        if (_.isArray(body)) {
            macro = new ValueMacro_(name, argDefinition, this, body);
        }
        else if (_.isFunction(body)) {
            macro = new ValueMacro_(name, argDefinition, this, body);
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
    Scope.prototype.addLoop = function (valueIdentifier, keyIdentifier, collectionExpression) {
        var loop = {
            valueIdentifier: valueIdentifier,
            keyIdentifier: keyIdentifier,
            collectionExpression: collectionExpression,
            scope: new Scope(this)
        };
        this.loops.push(loop);
        return loop.scope;
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
    Scope.prototype.evaluateProperties = function (stack, properties) {
        if (properties === void 0) { properties = this.properties; }
        var output = {};
        for (var name in properties) {
            var expressions = properties[name];
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
    // TODO deprecate
    Scope.prototype.setFilter = function (filterExpression) {
        if (this.filterExpression) {
            throw new Error("Duplicate filters");
        }
        this.filterExpression = filterExpression;
    };
    Scope.prototype.evaluateFilterProperty = function (stack) {
        if (this.filterExpression) {
            return this.filterExpression.evaluate(this, stack);
            ;
        }
        else {
            return null;
        }
    };
    Scope.prototype.evaluateClassPaintProperties = function (type, stack) {
        // TODO ensure all properties are paint properties, not layout properties
        return _.objectMap(this.classScopes, function (scope, name) {
            return ["paint." + name, scope.evaluateClassScope(stack)];
        });
    };
    Scope.prototype.evaluatePaintProperties = function (type, stack) {
        var properties = this.evaluateProperties(stack, _.objectFilter(this.properties, function (property, name) {
            return !_.startsWith(name, "$");
        }));
        var layout = {};
        var paint = {};
        var zIndex = 0;
        _.each(properties, function (value, name) {
            if (name == 'z-index') {
                zIndex = value;
            }
            else if (_.contains(MapboxGLStyleSpec[type].paint, name)) {
                paint[name] = value;
            }
            else if (_.contains(MapboxGLStyleSpec[type].layout, name)) {
                layout[name] = value;
            }
            else {
                throw new Error("Unknown property name " + name + " for layer type " + type);
            }
        });
        return { layout: layout, paint: paint, 'z-index': zIndex };
    };
    // TODO merge this method with evaluatePaintProperties
    Scope.prototype.evaluateMetaProperties = function (stack) {
        return this.evaluateProperties(stack, _.objectMapKeys(_.objectFilter(this.properties, function (property, name) {
            return _.startsWith(name, "$");
        }), function (property, name) {
            return name.slice(1);
        }));
    };
    Scope.prototype.evaluateLayerScope = function (stack) {
        stack.scope.push(this);
        var layers = this.evaluateLayers(stack);
        var metaProperties = this.evaluateMetaProperties(stack);
        if (layers) {
            if (metaProperties['type']) {
                assert.equal(metaProperties['type'], 'raster');
            }
            metaProperties['type'] = 'raster';
        }
        // TODO ensure layer has a source and type
        // TODO remove this _.objectCompact call -- some falsey values are important.
        var properties = _.objectCompact(_.extend({
            id: this.name || _.uniqueId('scope'),
            filter: this.evaluateFilterProperty(stack),
            layers: layers
        }, metaProperties, this.evaluatePaintProperties(metaProperties['type'], stack), this.evaluateClassPaintProperties(metaProperties['type'], stack)));
        stack.scope.pop();
        return properties;
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
    Scope.prototype.eachLoopScope = function (stack, callback) {
        for (var i in this.loops) {
            var scope = this.loops[i].scope;
            var collectionExpression = this.loops[i].collectionExpression;
            var valueIdentifier = this.loops[i].valueIdentifier;
            var keyIdentifier = this.loops[i].keyIdentifier;
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
        }
    };
    Scope.prototype.evaluateLayers = function (stack) {
        var layers = _.map(this.layerScopes, function (layer) {
            return layer.evaluateLayerScope(stack);
        });
        this.eachLoopScope(stack, function (scope) {
            layers = layers.concat(scope.evaluateLayers(stack));
        });
        // We are relying on the behavior that the original ordering is preserved
        // for layers with the same z-index
        layers = _.sortBy(layers, 'z-index');
        return layers.length ? layers : undefined;
    };
    return Scope;
})();
module.exports = Scope;
//# sourceMappingURL=Scope.js.map