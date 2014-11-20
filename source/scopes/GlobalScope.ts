import Scope = require("./Scope");
var _ = require("../utilities");
var LayerScope = require('./LayerScope');
var Globals = require('../globals');
import ValueMacro = require('../macros/ValueMacro');
import PropertyMacro = require('../macros/PropertyMacro');
import assert = require('assert');
var Options = require('../Options');
var Value = require('../values/Value');

class GlobalScope extends Scope {

  public layerScopes;
  public sources;

  constructor() {
    super(null)
    this.layerScopes = {}
    this.sources = {}

    for (var name in Globals.valueMacros) {
      var fn = Globals.valueMacros[name];
      this.addValueMacro(name, null, fn);
    }

    for (var name in Globals.propertyMacros) {
      var fn = Globals.propertyMacros[name];
      this.addPropertyMacro(name, null, fn);
    }

  }

  addSource(name, source) {
    this.sources[name] = source;
  }

  getGlobalScope() {
    return this
  }

  getValueMacro(name, argValues, options) {
    var macro;
    if (macro = super.getValueMacro(name, argValues, options)) {
      return macro;
    } else if (argValues.length == 0) {
      return ValueMacro.createFromValue(name, this, name);
    } else {
      return null;
    }
  }

  getSource(name) {
    return this.sources[name];
  }

  addLayerScope(name, scope) {
    if (this.layerScopes[name]) {
      throw new Error("Duplicate entries for layer scope " + name)
    }
    return this.layerScopes[name] = new LayerScope(name, this);
  }

  toMGLGlobalScope(options = new Options()) {
    options.scopeStack.push(this)

    var layers = _.map(this.layerScopes, (layer) => {
      return layer.toMGLLayerScope(options)
    })

    var properties = this.toMGLProperties(options, this.properties)

    var sources = _.objectMapValues(this.sources, (source, name) => {
      return _.objectMapValues(source, (value, key) => {
        return Value.toMGLValue(value, options);
      });
    });

    var transition = {
      duration: properties["transition-delay"],
      delay: properties["transition-duration"]
    }
    delete properties["transition-delay"];
    delete properties["transition-duration"];

    options.scopeStack.pop();

    return _.extend(properties, {
      version: 6,
      layers: layers,
      sources: sources,
      transition: transition
    })
  }
}

export = GlobalScope
