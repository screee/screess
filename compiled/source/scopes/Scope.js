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
    StatementType[StatementType["IF"] = 4] = "IF";
    StatementType[StatementType["ELSE"] = 5] = "ELSE";
    StatementType[StatementType["ELSE_IF"] = 6] = "ELSE_IF";
})(StatementType || (StatementType = {}));
var Scope = (function () {
    // TODO remove "name"
    function Scope(stylesheet, parent, name, statements) {
        if (name === void 0) { name = null; }
        if (statements === void 0) { statements = []; }
        this.stylesheet = stylesheet;
        this.parent = parent;
        this.name = name;
        this.statements = statements;
        this.valueMacros = [];
        this.propertyMacros = [];
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
    Scope.prototype.getGlobalScope = function () {
        return this.isGlobal() ? this : this.parent.getGlobalScope();
    };
    //////////////////////////////////////////////////////////////////////////////
    // Construction
    // TODO make Source class
    Scope.prototype.addSource = function (source) {
        return this.stylesheet.addSource(source);
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
        var scope = new Scope(this.stylesheet, this, name);
        this.statements.push({
            type: 2 /* CLASS */,
            scope: scope
        });
        return scope;
    };
    Scope.prototype.addLayerScope = function (name) {
        // TODO check for duplicate layer scopes
        var scope = new Scope(this.stylesheet, this, name);
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
            scope: new Scope(this.stylesheet, this)
        };
        this.statements.push({
            type: 0 /* LOOP */,
            loop: loop
        });
        return loop.scope;
    };
    Scope.prototype.addIf = function (expression) {
        var scope = new Scope(this.stylesheet, this);
        this.statements.push({
            type: 4 /* IF */,
            expressions: [expression],
            scope: scope
        });
        return scope;
    };
    Scope.prototype.addElseIf = function (expression) {
        var scope = new Scope(this.stylesheet, this);
        this.statements.push({
            type: 6 /* ELSE_IF */,
            expressions: [expression],
            scope: scope
        });
        return scope;
    };
    Scope.prototype.addElse = function () {
        var scope = new Scope(this.stylesheet, this);
        this.statements.push({
            type: 5 /* ELSE */,
            scope: scope
        });
        return scope;
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
    //////////////////////////////////////////////////////////////////////////////
    // Evaluation Helpers
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
        return this.parent ? this.parent.getPropertyMacro(name, values, stack) : null;
    };
    Scope.prototype.evaluateProperties = function (stack, statements) {
        if (statements === void 0) { statements = this.statements; }
        var output = {};
        this.eachStatement(stack, function (scope, statement) {
            if (statement.type == 3 /* PROPERTY */) {
                // TODO refactor Values to accept this as a constructor
                var values = new Values(_.map(statement.expressions, function (expression) {
                    return { expression: expression };
                }), scope, stack);
                if (values.length != 1 || values.positional.length != 1) {
                    throw new Error("Cannot apply " + values.length + " args to primitive property " + name);
                }
                output[statement.name] = Value.evaluate(values.positional[0], stack);
            }
        });
        return output;
    };
    Scope.prototype.eachLoopSubscope = function (loop, stack, callback) {
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
    // Properties, layers, classes
    Scope.prototype.eachStatement = function (stack, callback) {
        var statements = this.statements;
        for (var i = 0; i < statements.length; i++) {
            var statement = statements[i];
            if (statement.type == 0 /* LOOP */) {
                this.eachLoopSubscope(statement.loop, stack, function (scope) {
                    scope.eachStatement(stack, callback);
                });
            }
            else if (statement.type == 4 /* IF */) {
                if (statement.expressions[0].toValue(this, stack)) {
                    statement.scope.eachStatement(stack, callback);
                    continue;
                }
                var flag = false;
                while (statements[i + 1] && statements[i + 1].type == 6 /* ELSE_IF */) {
                    if (statements[++i].expressions[0].toValue(this, stack)) {
                        statements[i].scope.eachStatement(stack, callback);
                        flag = true;
                        break;
                    }
                }
                if (!flag && statements[i + 1] && statements[i + 1].type == 5 /* ELSE */) {
                    statement = statements[++i];
                    statement.scope.eachStatement(stack, callback);
                }
            }
            else if (statement.type == 3 /* PROPERTY */) {
                // TODO refactor Values to accept this as a constructor
                var values = new Values(_.map(statement.expressions, function (expression) {
                    return { expression: expression };
                }), this, stack);
                var macro;
                if (macro = this.getPropertyMacro(statement.name, values, stack)) {
                    stack.propertyMacro.push(macro);
                    macro.getScope(values, stack).eachStatement(stack, callback);
                    stack.propertyMacro.pop();
                }
                else {
                    callback(this, statement);
                }
            }
            else {
                callback(this, statement);
            }
        }
    };
    Scope.prototype.evaluateLayers = function (stack) {
        var layers = [];
        this.eachStatement(stack, function (scope, statement) {
            if (statement.type == 1 /* LAYER */) {
                layers.push(statement.scope.evaluateLayerScope(stack));
            }
        });
        layers = _.sortBy(layers, 'z-index');
        return layers.length ? layers : undefined;
    };
    //////////////////////////////////////////////////////////////////////////////
    // Evaluation
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
    Scope.prototype.evaluateClassScope = function (stack) {
        // TODO assert there are no child layers or classes
        stack.scope.push(this);
        this.evaluateProperties(stack);
        stack.scope.pop();
    };
    Scope.prototype.evaluateGlobalScope = function (stack) {
        if (stack === void 0) { stack = new Stack(); }
        stack.scope.push(this);
        var layers = this.evaluateLayers(stack);
        var properties = this.evaluateProperties(stack);
        var sources = _.objectMapValues(this.stylesheet.sources, function (source, name) {
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
    Scope.prototype.evaluateLayerScope = function (stack) {
        var _this = this;
        var evaluateClassPaintProperties = function (type, stack) {
            // TODO ensure all properties are paint properties, not layout properties
            var classStatements = _.filter(_this.statements, function (statement) {
                return statement.type == 2 /* CLASS */;
            });
            return _.objectMap(classStatements, function (statement, name) {
                return [
                    "paint." + name,
                    statement.scope.evaluateClassScope(stack)
                ];
            });
        };
        // TODO should this be in this method?
        stack.scope.push(this);
        var properties = this.evaluateProperties(stack);
        var metaProperties = { 'z-index': 0 };
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
        }, metaProperties, evaluateClassPaintProperties(type, stack)));
        stack.scope.pop();
        return output;
    };
    return Scope;
})();
module.exports = Scope;
//# sourceMappingURL=Scope.js.map