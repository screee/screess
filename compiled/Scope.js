var Value = require("./values/value");
var ValueSet = require("./ValueSet");
var ValueSetDefinition = require('./ValueSetDefinition');
var assert = require("assert");
var LiteralExpression = require('./expressions/LiteralExpression');
var _ = require("./utilities");
var Statement = require('./Statement');
var Globals = require('./globals');
var MBGLStyleSpec = require('mapbox-gl-style-spec');
var Scope = (function () {
    function Scope(parent, name, statements) {
        var _this = this;
        if (name === void 0) { name = null; }
        if (statements === void 0) { statements = []; }
        this.name = name;
        this.statements = statements;
        this.formatScope = {
            // GLOBAL
            0: function (stack, properties, layers, classes) {
                var sources = _this.stylesheet.sources;
                var transition = {
                    duration: properties["transition-delay"],
                    delay: properties["transition-duration"]
                };
                delete properties["transition-delay"];
                delete properties["transition-duration"];
                stack.scope.pop();
                return _.extend(properties, {
                    layers: layers,
                    sources: sources,
                    transition: transition
                });
            },
            // LAYER
            1: function (stack, properties, layers, _classes) {
                var metaProperties = { 'z-index': 0 };
                var paintProperties = {};
                var layoutProperties = {};
                var source = {};
                var type = properties['type'] || 'raster';
                // TODO actually parse the version from the global scope, don't hardcode 7
                var version = 7;
                for (var name in properties) {
                    var value = Value.evaluate(properties[name]);
                    // TODO remove scree test props
                    if (name == 'z-index') {
                        metaProperties['z-index'] = value;
                    }
                    else if (name == "source-tile-size") {
                        source["tileSize"] = value;
                    }
                    else if (_.startsWith(name, "source-")) {
                        source[name.substr("source-".length)] = value;
                    }
                    else if (getPropertyType(version, 1 /* LAYER */, name) == 0 /* PAINT */) {
                        paintProperties[name] = value;
                    }
                    else if (getPropertyType(version, 1 /* LAYER */, name) == 1 /* LAYOUT */) {
                        layoutProperties[name] = value;
                    }
                    else if (getPropertyType(version, 1 /* LAYER */, name) == 2 /* META */) {
                        metaProperties[name] = value;
                    }
                    else {
                        assert(false, "Property name '" + name + "' is unknown");
                    }
                }
                metaProperties["source"] = stack.getGlobalScope().addSource(source);
                if (layers) {
                    if (metaProperties['type']) {
                        assert.equal(metaProperties['type'], 'raster');
                    }
                    metaProperties['type'] = 'raster';
                }
                var classes = _.objectMap(_classes, function (scope) {
                    return ["paint." + scope.name, scope];
                });
                // TODO ensure layer has a source and type
                // TODO remove this _.objectCompact call -- some falsey values are important.
                return _.objectCompact(_.extend({
                    id: _this.name || _.uniqueId('scope'),
                    layers: layers,
                    paint: paintProperties,
                    layout: layoutProperties
                }, metaProperties, classes));
            },
            // CLASS
            2: function (stack, properties, layers, classes) {
                // TODO assert there are no child layers or classes
                // TODO ensure all properties are paint properties, not layout properties
                return properties;
            }
        };
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
    Scope.prototype.addSource = function (source) {
        return this.stylesheet.addSource(source);
    };
    Scope.prototype.addProperty = function (name, expressions) {
        // TODO check for duplicate properties
        assert(name != null);
        this.statements.push(new Statement.PropertyStatement(name, expressions));
    };
    Scope.prototype.addClass = function (name) {
        // TODO ensure class scopes are merged properly
        var scope = new Scope(this, name);
        this.statements.push(new Statement.ClassStatement(name, scope));
        return scope;
    };
    Scope.prototype.addLayer = function (name) {
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
    Scope.prototype.addLiteralValueMacros = function (macros) {
        for (var identifier in macros) {
            var value = macros[identifier];
            this.addLiteralValueMacro(identifier, value);
        }
    };
    Scope.prototype.addLiteralValueMacro = function (identifier, value) {
        this.addValueMacro(identifier, ValueSetDefinition.ZERO, new LiteralExpression(value));
    };
    Scope.prototype.addValueMacro = function (name, argDefinition, body) {
        var ValueMacro_ = require("./macros/ValueMacro");
        var macro = new ValueMacro_(name, argDefinition, this, body);
        return this.valueMacros.unshift(macro);
    };
    Scope.prototype.addPropertyMacro = function (name, argDefinition, body) {
        var PropertyMacro = require("./macros/PropertyMacro");
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
        if (this.parent) {
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
    // TODO refactor into statement classes?
    Scope.prototype.eachPrimitiveStatement = function (stack, callback) {
        var statements = this.statements;
        for (var i = 0; i < statements.length; i++) {
            var statement = statements[i];
            if (statement instanceof Statement.LoopStatement) {
                var loopStatement = statement;
                var scope = loopStatement.scope;
                var collectionExpression = loopStatement.collectionExpression;
                var valueIdentifier = loopStatement.valueIdentifier;
                var keyIdentifier = loopStatement.keyIdentifier;
                var collection = collectionExpression.evaluateToIntermediate(this, stack);
                assert(_.isArray(collection) || _.isObject(collection));
                for (var key in collection) {
                    var value = collection[key];
                    scope.addLiteralValueMacro(valueIdentifier, value);
                    if (keyIdentifier) {
                        scope.addLiteralValueMacro(keyIdentifier, key);
                    }
                    scope.eachPrimitiveStatement(stack, callback);
                }
            }
            else if (statement instanceof Statement.IfStatement) {
                var ifStatement = statement;
                if (ifStatement.expression.evaluateToIntermediate(this, stack)) {
                    ifStatement.scope.eachPrimitiveStatement(stack, callback);
                    continue;
                }
                var flag = false;
                while (statements[i + 1] instanceof Statement.ElseIfStatement) {
                    var elseIfStatement = statements[++i];
                    if (elseIfStatement.expression.evaluateToIntermediate(this, stack)) {
                        elseIfStatement.scope.eachPrimitiveStatement(stack, callback);
                        flag = true;
                        break;
                    }
                }
                if (!flag && statements[i + 1] instanceof Statement.ElseStatement) {
                    var elseStatement = statements[++i];
                    elseStatement.scope.eachPrimitiveStatement(stack, callback);
                }
            }
            else if (statement instanceof Statement.PropertyStatement) {
                var propertyStatement = statement;
                var values = new ValueSet(propertyStatement.expressions, this, stack);
                var macro;
                if (macro = this.getPropertyMacro(propertyStatement.name, values, stack)) {
                    stack.propertyMacro.push(macro);
                    macro.getScope(values, stack).eachPrimitiveStatement(stack, callback);
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
    //////////////////////////////////////////////////////////////////////////////
    // Evaluation
    Scope.prototype.evaluate = function (type, stack) {
        stack.scope.push(this);
        var layers = [];
        var classes = [];
        var properties = {};
        this.eachPrimitiveStatement(stack, function (scope, statement) {
            if (statement instanceof Statement.LayerStatement) {
                var layerStatement = statement;
                layers.push(layerStatement.scope.evaluate(1 /* LAYER */, stack));
            }
            else if (statement instanceof Statement.ClassStatement) {
                var classStatement = statement;
                classes.push(classStatement.scope.evaluate(2 /* CLASS */, stack));
            }
            else if (statement instanceof Statement.PropertyStatement) {
                var propertyStatement = statement;
                var values = new ValueSet(propertyStatement.expressions, scope, stack);
                if (values.length != 1 || values.positional.length != 1) {
                    throw new Error("Cannot apply " + values.length + " args to primitive property " + propertyStatement.name);
                }
                properties[propertyStatement.name] = Value.evaluate(values.positional[0]);
            }
        });
        layers = _.sortBy(layers, 'z-index');
        if (layers.length == 0) {
            layers = undefined;
        }
        var output = this.formatScope[type](stack, properties, layers, classes);
        stack.scope.pop();
        return output;
    };
    return Scope;
})();
var Scope;
(function (Scope) {
    (function (Type) {
        Type[Type["GLOBAL"] = 0] = "GLOBAL";
        Type[Type["LAYER"] = 1] = "LAYER";
        Type[Type["CLASS"] = 2] = "CLASS";
    })(Scope.Type || (Scope.Type = {}));
    var Type = Scope.Type;
})(Scope || (Scope = {}));
var PropertyType;
(function (PropertyType) {
    PropertyType[PropertyType["PAINT"] = 0] = "PAINT";
    PropertyType[PropertyType["LAYOUT"] = 1] = "LAYOUT";
    PropertyType[PropertyType["META"] = 2] = "META";
})(PropertyType || (PropertyType = {}));
function getPropertyType(version, scopeType, name) {
    assert(scopeType == 1 /* LAYER */);
    if (name == 'scree-test-paint')
        return 0 /* PAINT */;
    else if (name == 'scree-test-layout')
        return 1 /* LAYOUT */;
    else if (name == 'scree-test-meta')
        return 2 /* META */;
    else {
        var spec = MBGLStyleSpec["v" + version];
        for (var i in spec["layout"]) {
            for (var name_ in spec[spec["layout"][i]]) {
                if (name == name_)
                    return 1 /* LAYOUT */;
            }
        }
        for (var i in spec["paint"]) {
            for (var name_ in spec[spec["paint"][i]]) {
                if (name == name_)
                    return 0 /* PAINT */;
            }
        }
        assert(spec["layer"][name]);
        return 2 /* META */;
    }
}
module.exports = Scope;
//# sourceMappingURL=Scope.js.map