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
        if (!this.name) {
            this.name = _.uniqueId("layer");
        }
        this.classScopes = {};
        this.metaProperties = {};
        this.sublayerScopes = {};
    }
    LayerScope.prototype.addLayerScope = function (name, scope) {
        if (this.sublayerScopes[name]) {
            throw new Error("Duplicate entries for layer scope " + name);
        }
        return this.sublayerScopes[name] = new LayerScope(name, this);
    };
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
    LayerScope.prototype.evaluateFilterProperty = function (stack) {
        if (this.filterExpression) {
            return this.filterExpression.evaluateFilter(this, stack);
            ;
        }
        else {
            return null;
        }
    };
    LayerScope.prototype.evaluateSourceProperty = function (stack) {
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
    LayerScope.prototype.evaluateClassPaintProperties = function (type, stack) {
        // TODO ensure all properties are paint properties, not layout properties
        return _.objectMap(this.classScopes, function (scope, name) {
            return ["paint." + name, scope.evaluateClassScope(stack)];
        });
    };
    LayerScope.prototype.evaluatePaintProperties = function (type, stack) {
        var properties = this.evaluateProperties(stack, this.properties);
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
    LayerScope.prototype.evaluateMetaProperties = function (stack) {
        return this.evaluateProperties(stack, this.metaProperties);
        ;
    };
    LayerScope.prototype.evaluateLayerScope = function (stack) {
        stack.scope.push(this);
        var metaProperties = this.evaluateMetaProperties(stack);
        var hasSublayers = false;
        var sublayers = _.map(this.sublayerScopes, function (layer) {
            hasSublayers = true;
            return layer.evaluateLayerScope(stack);
        });
        if (hasSublayers && metaProperties['type']) {
            assert.equal(metaProperties['type'], 'raster');
        }
        else if (hasSublayers) {
            metaProperties['type'] = 'raster';
        }
        // TODO ensure layer has a source and type
        var properties = _.objectCompact(_.extend({
            // TODO calcualte name with _.hash
            id: this.name,
            source: this.evaluateSourceProperty(stack),
            filter: this.evaluateFilterProperty(stack),
            layers: sublayers
        }, this.evaluatePaintProperties(metaProperties['type'], stack), metaProperties, this.evaluateClassPaintProperties(metaProperties['type'], stack)));
        stack.scope.pop();
        return properties;
    };
    return LayerScope;
})(Scope);
module.exports = LayerScope;
//# sourceMappingURL=LayerScope.js.map