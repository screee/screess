var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Scope = require("./Scope");
var _ = require("../utilities");
var LayerScope = require('./LayerScope');
var Globals = require('../globals');
var ValueMacro = require('../macros/ValueMacro');
var Options = require('../Options');
var Value = require('../values/Value');
var GlobalScope = (function (_super) {
    __extends(GlobalScope, _super);
    function GlobalScope() {
        _super.call(this, null);
        this.layerScopes = {};
        this.sources = {};
        for (var name in Globals.valueMacros) {
            var fn = Globals.valueMacros[name];
            this.addValueMacro(name, null, fn);
        }
        for (var name in Globals.propertyMacros) {
            var fn = Globals.propertyMacros[name];
            this.addPropertyMacro(name, null, fn);
        }
    }
    GlobalScope.prototype.addSource = function (name, source) {
        this.sources[name] = source;
    };
    GlobalScope.prototype.getGlobalScope = function () {
        return this;
    };
    GlobalScope.prototype.getValueMacro = function (name, argValues, options) {
        var macro;
        if (macro = _super.prototype.getValueMacro.call(this, name, argValues, options)) {
            return macro;
        }
        else if (argValues.length == 0) {
            return ValueMacro.createFromValue(name, this, name);
        }
        else {
            return null;
        }
    };
    GlobalScope.prototype.getSource = function (name) {
        return this.sources[name];
    };
    GlobalScope.prototype.addLayerScope = function (name, scope) {
        if (this.layerScopes[name]) {
            throw new Error("Duplicate entries for layer scope " + name);
        }
        return this.layerScopes[name] = new LayerScope(name, this);
    };
    GlobalScope.prototype.toMGLGlobalScope = function (options) {
        if (options === void 0) { options = new Options(); }
        options.scopeStack.push(this);
        var layers = _.map(this.layerScopes, function (layer) {
            return layer.toMGLLayerScope(options);
        });
        var properties = this.toMGLProperties(options, this.properties);
        var sources = _.objectMapValues(this.sources, function (source, name) {
            return _.objectMapValues(source, function (value, key) {
                return Value.toMGLValue(value, options);
            });
        });
        var transition = {
            duration: properties["transition-delay"],
            delay: properties["transition-duration"]
        };
        delete properties["transition-delay"];
        delete properties["transition-duration"];
        options.scopeStack.pop();
        return _.extend(properties, {
            version: 6,
            layers: layers,
            sources: sources,
            transition: transition
        });
    };
    return GlobalScope;
})(Scope);
module.exports = GlobalScope;
//# sourceMappingURL=GlobalScope.js.map