var Value = require("../values/value");
var Values = require("../Values");
var ValuesDefinition = require('../ValuesDefinition');
var assert = require("assert");
var LiteralExpression = require('../expressions/LiteralExpression');
var Stack = require('../Stack');
var _ = require("../utilities");
var ScopeType = require('./ScopeType');
var MapboxGLStyleSpec = require('../MapboxGLStyleSpec');
var Statement = require('../Statement');
var Globals = require('../globals');
var Scope = (function () {
    function Scope(parent, name, statements) {
        if (name === void 0) { name = null; }
        if (statements === void 0) { statements = []; }
        this.name = name;
        this.statements = statements;
        this.valueMacros = [];
        this.propertyMacros = [];
        if (parent instanceof Scope) {
            this.parent = parent;
            this.stylesheet = parent.stylesheet;
        }
        else {
            this.parent = null;
            this.stylesheet = parent;
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
        this.statements.push(new Statement.PropertyStatement(name, expressions));
    };
    // TODO rename to addClass
    Scope.prototype.addClassScope = function (name) {
        // TODO ensure class scopes are merged properly
        var scope = new Scope(this, name);
        this.statements.push(new Statement.ClassStatement(name, scope));
        return scope;
    };
    // TODO rename to addLayer
    Scope.prototype.addLayerScope = function (name) {
        // TODO check for duplicate layer scopes
        var scope = new Scope(this, name);
        this.statements.push(new Statement.LayerStatement(name, scope));
        return scope;
    };
    Scope.prototype.addLoop = function (valueIdentifier, keyIdentifier, collectionExpression) {
        var scope = new Scope(this);
        this.statements.push(new Statement.LoopStatement(scope, valueIdentifier, keyIdentifier, collectionExpression));
        return scope;
    };
    Scope.prototype.addIf = function (expression) {
        var scope = new Scope(this);
        this.statements.push(new Statement.IfStatement(expression, scope));
        return scope;
    };
    Scope.prototype.addElseIf = function (expression) {
        var scope = new Scope(this);
        this.statements.push(new Statement.ElseIfStatement(expression, scope));
        return scope;
    };
    Scope.prototype.addElse = function () {
        var scope = new Scope(this);
        this.statements.push(new Statement.ElseStatement(scope));
        return scope;
    };
    //////////////////////////////////////////////////////////////////////////////
    // Macro Construction
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
    // Properties, layers, classes
    Scope.prototype.eachStatement = function (stack, callback) {
        var statements = this.statements;
        for (var i = 0; i < statements.length; i++) {
            var statement = statements[i];
            if (statement instanceof Statement.LoopStatement) {
                var loopStatement = statement;
                var scope = loopStatement.scope;
                var collectionExpression = loopStatement.collectionExpression;
                var valueIdentifier = loopStatement.valueIdentifier;
                var keyIdentifier = loopStatement.keyIdentifier;
                var collection = collectionExpression.toValue(this, stack);
                assert(_.isArray(collection) || _.isObject(collection));
                for (var key in collection) {
                    var value = collection[key];
                    scope.addLiteralValueMacro(valueIdentifier, value);
                    if (keyIdentifier) {
                        scope.addLiteralValueMacro(keyIdentifier, key);
                    }
                    scope.eachStatement(stack, callback);
                }
            }
            else if (statement instanceof Statement.IfStatement) {
                var ifStatement = statement;
                if (ifStatement.expression.toValue(this, stack)) {
                    ifStatement.scope.eachStatement(stack, callback);
                    continue;
                }
                var flag = false;
                while (statements[i + 1] instanceof Statement.ElseIfStatement) {
                    var elseIfStatement = statements[++i];
                    if (elseIfStatement.expression.toValue(this, stack)) {
                        elseIfStatement.scope.eachStatement(stack, callback);
                        flag = true;
                        break;
                    }
                }
                if (!flag && statements[i + 1] instanceof Statement.ElseStatement) {
                    var elseStatement = statements[++i];
                    elseStatement.scope.eachStatement(stack, callback);
                }
            }
            else if (statement instanceof Statement.PropertyStatement) {
                var propertyStatement = statement;
                var values = new Values(propertyStatement.expressions, this, stack);
                var macro;
                if (macro = this.getPropertyMacro(propertyStatement.name, values, stack)) {
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
    // TODO rename
    Scope.prototype.evaluate_ = function (stack) {
        var layers = [];
        var classes = [];
        var properties = {};
        this.eachStatement(stack, function (scope, statement) {
            if (statement instanceof Statement.LayerStatement) {
                var layerStatement = statement;
                layers.push(layerStatement.scope.evaluateLayerScope(stack));
            }
            else if (statement instanceof Statement.ClassStatement) {
                var classStatement = statement;
                classes.push(classStatement.scope.evaluateClassScope(stack));
            }
            else if (statement instanceof Statement.PropertyStatement) {
                var propertyStatement = statement;
                var values = new Values(propertyStatement.expressions, scope, stack);
                if (values.length != 1 || values.positional.length != 1) {
                    throw new Error("Cannot apply " + values.length + " args to primitive property " + name);
                }
                properties[propertyStatement.name] = Value.evaluate(values.positional[0], stack);
            }
        });
        layers = _.sortBy(layers, 'z-index');
        if (layers.length == 0) {
            layers = undefined;
        }
        return { layers: layers, classes: classes, properties: properties };
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
        // TODO ensure all properties are paint properties, not layout properties
        stack.scope.push(this);
        var evaluated = this.evaluate_(stack);
        stack.scope.pop();
        return evaluated.properties;
    };
    Scope.prototype.evaluateGlobalScope = function (stack) {
        if (stack === void 0) { stack = new Stack(); }
        stack.scope.push(this);
        var evaluated = this.evaluate_(stack);
        var layers = evaluated.layers;
        var properties = evaluated.properties;
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
        // TODO should this be in this method?
        stack.scope.push(this);
        var evaluated = this.evaluate_(stack);
        var properties = evaluated.properties;
        var metaProperties = { 'z-index': 0 };
        var paintProperties = {};
        var layoutProperties = {};
        var layers = evaluated.layers;
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
        var classes = _.objectMap(evaluated.classes, function (scope) {
            return ["paint." + scope.name, scope];
        });
        // TODO ensure layer has a source and type
        // TODO remove this _.objectCompact call -- some falsey values are important.
        var output = _.objectCompact(_.extend({
            id: this.name || _.uniqueId('scope'),
            layers: layers,
            paint: paintProperties,
            layout: layoutProperties
        }, metaProperties, classes));
        stack.scope.pop();
        return output;
    };
    return Scope;
})();
module.exports = Scope;
//# sourceMappingURL=Scope.js.map