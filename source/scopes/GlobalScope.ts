import Scope = require("./Scope");
import LayerScope = require('./LayerScope');
import ValueMacro = require('../macros/ValueMacro');
import PropertyMacro = require('../macros/PropertyMacro');
import assert = require('assert');
import Stack = require('../Stack');
import Value = require('../values/Value');
import MacroArgValues = require('../macros/MacroArgValues');
import _ = require("../utilities");
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
  addSource(source:{}):string {
    var hash = _.hash(JSON.stringify(source)).toString();
    this.sources[hash] = source;
    return hash;
  }

  // TODO create source class
  getGlobalScope():GlobalScope {
    return this
  }

  getValueMacro(name:string, argValues:MacroArgValues, stack:Stack):ValueMacro {
    var macro;
    if (macro = super.getValueMacro(name, argValues, stack)) {
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

  evaluateGlobalScope(stack:Stack = new Stack()):any {
    stack.scope.push(this)

    var layers = _.map(this.layerScopes, (layer) => {
      return layer.evaluateLayerScope(stack)
    })

    var properties = this.evaluateProperties(stack, this.properties)

    var sources = _.objectMapValues(this.sources, (source, name) => {
      return _.objectMapValues(source, (value, key) => {
        return Value.evaluate(value, stack);
      });
    });

    var transition = {
      duration: properties["transition-delay"],
      delay: properties["transition-duration"]
    }
    delete properties["transition-delay"];
    delete properties["transition-duration"];

    stack.scope.pop();

    return _.extend(properties, {
      version: 6,
      layers: layers,
      sources: sources,
      transition: transition
    })
  }
}

export = GlobalScope
