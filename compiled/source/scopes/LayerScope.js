var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Scope = require("./Scope");
var ClassScope = require('./ClassScope');
var _ = require('../utilities');
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
    LayerScope.prototype.toMGLLayerScope = function (options) {
        options.scopeStack.push(this);
        if (this.filterExpression) {
            options.pushFilter();
            options.meta = true;
            options.property = "filter";
            var metaFilterProperty = this.filterExpression ? {
                filter: this.filterExpression.toMGLFilter(this, options)
            } : null;
            options.popFilter();
            options.meta = false;
            options.property = null;
        }
        else {
            metaFilterProperty = null;
        }
        var metaSourceProperty;
        if (this.source) {
            if (!this.getSource(this.source)) {
                throw "Unknown source '#{this.source}'";
            }
            metaSourceProperty = { source: this.source };
        }
        else {
            metaSourceProperty = null;
        }
        options.meta = true;
        var metaProperties = this.toMGLProperties(options, this.metaProperties);
        options.meta = false;
        var paintProperties = { paint: this.toMGLProperties(options, this.properties) };
        var paintClassProperties = _.objectMap(this.classScopes, function (scope, name) {
            ["paint.#{name}", scope.toMGLClassScope(options)];
        });
        options.scopeStack.pop();
        return _.extend({ id: this.name }, metaProperties, paintProperties, paintClassProperties, metaFilterProperty, metaSourceProperty);
    };
    return LayerScope;
})(Scope);
module.exports = LayerScope;
//# sourceMappingURL=LayerScope.js.map