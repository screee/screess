var Value = require("./values/value");
var ValueSet = require("./ValueSet");
var ValueSetDefinition = require('./ValueSetDefinition');
var assert = require("assert");
var LiteralExpression = require('./expressions/LiteralExpression');
var Stack = require('./Stack');
var _ = require("./utilities");
var FS = require("fs");
var Parser = require("./parser");
var MBGLStyleSpec = require('mapbox-gl-style-spec');
var Scope = (function () {
    function Scope(parent, name, statements) {
        var _this = this;
        if (parent === void 0) { parent = null; }
        if (name === void 0) { name = null; }
        if (statements === void 0) { statements = []; }
        this.parent = parent;
        this.name = name;
        this.statements = statements;
        this.formatScope = {
            // GLOBAL
            0: function (stack, properties, layers, classes) {
                var sources = _this.sources;
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
                var version = _this.getVersion();
                for (var name in properties) {
                    var value = Value.evaluate(properties[name]);
                    if (name == 'z-index') {
                        metaProperties['z-index'] = value;
                    }
                    else if (name == "source-tile-size") {
                        source["tileSize"] = value;
                    }
                    else if (_.startsWith(name, "source-")) {
                        source[name.substr("source-".length)] = value;
                    }
                    else if (getPropertyType(version, name) == 0 /* PAINT */) {
                        paintProperties[name] = value;
                    }
                    else if (getPropertyType(version, name) == 1 /* LAYOUT */) {
                        layoutProperties[name] = value;
                    }
                    else if (getPropertyType(version, name) == 2 /* META */) {
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
                return _.extend({
                    id: _this.name || _.uniqueId('scope'),
                    layers: layers,
                    paint: paintProperties,
                    layout: layoutProperties
                }, metaProperties, classes);
            },
            // CLASS
            2: function (stack, properties, layers, classes) {
                assert(layers.length == 0);
                assert(classes.length == 0);
                return properties;
            }
        };
        this.valueMacros = [];
        this.propertyMacros = [];
        this.sources = {};
    }
    Scope.getCoreLibrary = function () {
        if (!this.coreLibrary) {
            this.coreLibrary = Parser.parse(FS.readFileSync("core.sss", "utf8"));
        }
        return this.coreLibrary;
    };
    Scope.createGlobal = function () {
        var scope = new Scope();
        scope.addPropertyMacro("include", ValueSetDefinition.WILDCARD, null, function (macro, values, stack, callback) {
            macro.parentScope.includeFile(values.positional[0], stack, callback);
        });
        return scope;
    };
    Scope.prototype.isGlobal = function () {
        return !this.parent;
    };
    Scope.prototype.getGlobalScope = function () {
        return this.isGlobal() ? this : this.parent.getGlobalScope();
    };
    Scope.prototype.includeFile = function (filename, stack, callback) {
        this.includeScope(Parser.parse(FS.readFileSync(filename, "utf8")), stack, callback);
    };
    Scope.prototype.includeScope = function (scope, stack, callback) {
        scope.eachPrimitiveStatement(stack, callback);
        this.valueMacros = scope.valueMacros.concat(this.valueMacros);
        this.propertyMacros = scope.propertyMacros.concat(this.propertyMacros);
    };
    //////////////////////////////////////////////////////////////////////////////
    // Construction
    Scope.prototype.addSource = function (source) {
        var hash = _.hash(JSON.stringify(source)).toString();
        this.getGlobalScope().sources[hash] = source;
        return hash;
    };
    Scope.prototype.addStatement = function (statement) {
        this.statements.push(statement);
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
        this.valueMacros.unshift(macro);
    };
    Scope.prototype.addPropertyMacro = function (name, argDefinition, bodyScope, bodyFunction) {
        if (bodyScope === void 0) { bodyScope = null; }
        if (bodyFunction === void 0) { bodyFunction = null; }
        var PropertyMacro = require("./macros/PropertyMacro");
        var macro = new PropertyMacro(this, name, argDefinition, bodyScope, bodyFunction);
        this.propertyMacros.unshift(macro);
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
    Scope.prototype.eachValueMacro = function (callback) {
        for (var i in this.valueMacros) {
            callback(this.valueMacros[i]);
        }
        if (this.parent)
            this.parent.eachValueMacro(callback);
    };
    Scope.prototype.getValueMacrosAsFunctions = function (stack) {
        var _this = this;
        var names = [];
        this.eachValueMacro(function (macro) {
            names.push(macro.name);
        });
        names = _.uniq(names);
        return _.objectMap(names, function (name) {
            var that = _this;
            return [name, function () {
                var args = ValueSet.fromPositionalValues(_.toArray(arguments));
                var macro = that.getValueMacro(name, args, stack);
                if (!macro)
                    return null;
                else
                    return macro.evaluateToIntermediate(args, stack);
            }];
        });
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
    Scope.prototype.eachPrimitiveStatement = function (stack, callback) {
        var statements = this.statements;
        assert(stack != null);
        for (var i = 0; i < statements.length; i++) {
            statements[i].eachPrimitiveStatement(this, stack, callback);
        }
    };
    Scope.prototype.getVersion = function () {
        return this.getGlobalScope().version || 7;
    };
    //////////////////////////////////////////////////////////////////////////////
    // Evaluation
    // Move these into individual files
    Scope.prototype.evaluate = function (type, stack) {
        if (type === void 0) { type = 0 /* GLOBAL */; }
        if (stack === void 0) { stack = new Stack(); }
        stack.scope.push(this);
        var layers = [];
        var classes = [];
        var properties = {};
        if (type == 0 /* GLOBAL */) {
            this.version = parseInt(properties["version"], 10) || 7;
            this.includeScope(Scope.getCoreLibrary(), stack, function (scope, statement) {
                statement.evaluate(scope, stack, layers, classes, properties);
            });
        }
        this.eachPrimitiveStatement(stack, function (scope, statement) {
            statement.evaluate(scope, stack, layers, classes, properties);
        });
        layers = _.sortBy(layers, 'z-index');
        if (layers.length == 0) {
            layers = undefined;
        }
        var output = this.formatScope[type](stack, properties, layers, classes);
        stack.scope.pop();
        return output;
    };
    Scope.coreLibrary = null;
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
function getPropertyType(version, name) {
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