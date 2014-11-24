var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Scope = require("./Scope");
var ClassScope = require('./ClassScope');
var _ = require('../utilities');
var MapboxGLStyleSpec = require('../MapboxGLStyleSpec');
var assert = require('assert');
var LayerScope = (function (_super) {
    __extends(LayerScope, _super);
    function LayerScope(name, parent) {
        _super.call(this, parent);
        this.name = name;
        this.classScopes = {};
        this.metaProperties = {};
    }
    LayerScope.prototype.addMetaProperty = function (name, expressions) {
        if (this.metaProperties[name]) {
            throw new Error("Duplicate entries for metaproperty '" + name + "'");
        }
        this.metaProperties[name] = expressions;
    };
    LayerScope.prototype.addClassScope = function (name) {
        if (!this.classScopes[name]) {
            this.classScopes[name] = new ClassScope(this);
        }
        return this.classScopes[name];
    };
    LayerScope.prototype.setFilter = function (filterExpression) {
        if (this.filterExpression) {
            throw new Error("Duplicate filters");
        }
        this.filterExpression = filterExpression;
    };
    LayerScope.prototype.setSource = function (source) {
        if (this.source) {
            throw new Error("Duplicate sources");
        }
        this.source = source;
    };
    LayerScope.prototype.evaluateFilterProperty = function (options) {
        if (this.filterExpression) {
            // TODO move inside evaluate filter?
            options.pushFilter();
            options.isMetaProperty = true;
            options.property = "filter";
            var filter = this.filterExpression.evaluateFilter(this, options);
            options.popFilter();
            options.isMetaProperty = false;
            options.property = null;
            return filter;
        }
        else {
            return null;
        }
    };
    LayerScope.prototype.evaluateSourceProperty = function (options) {
        var metaSourceProperty;
        if (this.source) {
            if (!this.getSource(this.source)) {
                throw new Error("Unknown source " + this.source);
            }
            return this.source;
        }
        else {
            return null;
        }
    };
    LayerScope.prototype.evaluateClassPaintProperties = function (type, options) {
        // TODO ensure all properties are paint properties, not layout properties
        return _.objectMap(this.classScopes, function (scope, name) {
            return ["paint.#{name}", scope.evaluateClassScope(options)];
        });
    };
    LayerScope.prototype.evaluatePaintProperties = function (type, options) {
        var properties = this.evaluateProperties(options, this.properties);
        var layout = {};
        var paint = {};
        _.each(properties, function (value, name) {
            if (_.contains(MapboxGLStyleSpec[type].paint, name)) {
                paint[name] = value;
            }
            else if (_.contains(MapboxGLStyleSpec[type].layout, name)) {
                layout[name] = value;
            }
            else {
                throw new Error("Unknown property name " + name + " for layer type " + type);
            }
        });
        return { layout: layout, paint: paint };
    };
    LayerScope.prototype.evaluateMetaProperties = function (options) {
        options.isMetaProperty = true;
        var properties = this.evaluateProperties(options, this.metaProperties);
        options.isMetaProperty = false;
        return properties;
    };
    LayerScope.prototype.evaluateLayerScope = function (options) {
        options.scopeStack.push(this);
        // TODO ensure layer has a source and type
        var metaProperties = this.evaluateMetaProperties(options);
        var type = metaProperties['type'];
        assert(type, "Layer must have a type");
        var properties = _.objectCompact(_.extend({
            // TODO calcualte name with _.hash
            id: this.name,
            source: this.evaluateSourceProperty(options),
            filter: this.evaluateFilterProperty(options)
        }, this.evaluatePaintProperties(type, options), metaProperties, this.evaluateClassPaintProperties(type, options)));
        options.scopeStack.pop();
        return properties;
    };
    return LayerScope;
})(Scope);
module.exports = LayerScope;
//# sourceMappingURL=LayerScope.js.map