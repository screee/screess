import Scope = require("./Scope");
import LayerScope = require('./LayerScope');
import ValueMacro = require('../macros/ValueMacro');
import PropertyMacro = require('../macros/PropertyMacro');
import assert = require('assert');
import Options = require('../Options');
import Value = require('../values/Value');
import MacroArgValues = require('../macros/MacroArgValues');
var _ = require("../utilities");
var Globals = require('../globals');

class GlobalScope extends Scope {

  public layerScopes:{[name:string]: LayerScope};

  // TODO create source class
  public sources:{[name:string]: any};

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

  // TODO create source class
  addSource(name:string, source:any):void {
    this.sources[name] = source;
  }

  // TODO create source class
  getGlobalScope():GlobalScope {
    return this
  }

  getValueMacro(name:string, argValues:MacroArgValues, options:Options):ValueMacro {
    var macro;
    if (macro = super.getValueMacro(name, argValues, options)) {
      return macro;
    } else if (argValues.length == 0) {
      return ValueMacro.createFromValue(name, this, name);
    } else {
      return null;
    }
  }

  getSource(name:string):any {
    return this.sources[name];
  }

  addLayerScope(name:string, scope:Scope):Scope {
    if (this.layerScopes[name]) {
      throw new Error("Duplicate entries for layer scope " + name)
    }
    return this.layerScopes[name] = new LayerScope(name, this);
  }

  toMGLGlobalScope(options:Options = new Options()):any {
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
