import Value = require("../values/value")
import Values = require("../Values")
import ValuesDefinition = require('../ValuesDefinition')
import assert = require("assert")
import LiteralExpression = require('../expressions/LiteralExpression')
import Stack = require('../Stack')
import Expression = require('../expressions/Expression');
import ValueMacro = require('../macros/ValueMacro');
import PropertyMacro = require('../macros/PropertyMacro');
import _ = require("../utilities")
import LayerScope = require('./LayerScope')
import ClassScope = require('./ClassScope')
import ScopeType = require('./ScopeType')
var Globals = require('../globals');

interface Loop {
  scope:Scope;
  valueIdentifier:string;
  collection:Expression;
}

class Scope {

  public properties:{[x: string]: Expression[]};
  public valueMacros:ValueMacro[];
  public propertyMacros:PropertyMacro[];
  public loops:Loop[]
  public layerScopes:{[name:string]: LayerScope}
  public classScopes:{[name:string]: ClassScope}
  public sources:{[name:string]: any};
  public isGlobal:boolean;

  constructor(public parent:Scope) {
    this.properties = {};
    this.valueMacros = [];
    this.propertyMacros = [];
    this.loops = [];
    this.classScopes = {};
    this.layerScopes = {};
    this.sources = {};
    this.isGlobal = !this.parent;

    if (this.parent == null) {
      for (var name in Globals.valueMacros) {
        var fn = Globals.valueMacros[name];
        this.addValueMacro(name, null, fn);
      }

      for (var name in Globals.propertyMacros) {
        var fn = Globals.propertyMacros[name];
        this.addPropertyMacro(name, null, fn);
      }
    }
  }

  addSource(source:{}):string {
    if (this.isGlobal) {
      var hash = _.hash(JSON.stringify(source)).toString();
      this.sources[hash] = source;
      return hash;
    } else {
      return this.parent.addSource(source);
    }
  }

  getGlobalScope():Scope {
    return this.isGlobal ? this : this.parent.getGlobalScope();
  }

  getSource(name:string):any {
    return this.isGlobal ? this.getSource(name) : this.parent.getSource(name);
  }

  addProperty(name:string, expressions:Expression[]) {
    if (this.properties[name]) {
      throw new Error("Duplicate entries for property " + name)
    }

    return this.properties[name] = expressions;
  }

  addClassScope(name:string):Scope {
    if (!this.classScopes[name]) {
      var _ClassScope = require('./ClassScope')
      this.classScopes[name] = new _ClassScope(this)
    }
    return this.classScopes[name];
  }

  addLayerScope(name:string, scope:Scope):Scope {
    if (this.layerScopes[name]) {
      throw new Error("Duplicate entries for layer scope " + name)
    }
    var _LayerScope = require('./LayerScope')
    return this.layerScopes[name] = new _LayerScope(name, this);
  }

  addLiteralValueMacros(values:{[name:string]:any}):void {
    for (name in values) {
      var value = values[name];
      this.addValueMacro(name, ValuesDefinition.ZERO, [new LiteralExpression(value)]);
    }
  }

  addValueMacro(name:String, argDefinition:ValuesDefinition, body:Function);
  addValueMacro(name:String, argDefinition:ValuesDefinition, body:Expression[]);
  addValueMacro(name:String, argDefinition:ValuesDefinition, body:any) {
    var ValueMacro_ = require("../macros/ValueMacro");
    var macro;
    if (_.isArray(body)) {
      macro = new ValueMacro_(name, argDefinition, this, body);
    } else if (_.isFunction(body)) {
      macro = new ValueMacro_(name, argDefinition, this, body);
    } else {
      assert(false);
    }

    return this.valueMacros.unshift(macro);
  }

  addPropertyMacro(name:string, argDefinition:ValuesDefinition, body:ValuesDefinition):Scope {
    var PropertyMacro = require("../macros/PropertyMacro");
    var macro = new PropertyMacro(this, name, argDefinition, body)
    this.propertyMacros.unshift(macro)

    return macro.scope
  }

  addLoop(valueIdentifier, collection):Scope {
    var loop = {
      valueIdentifier: valueIdentifier,
      collection: collection,
      scope: new Scope(this)
    }
    this.loops.push(loop);
    return loop.scope;
  }

  getValueMacro(name:string, argValues:Values, stack:Stack):ValueMacro {
    for (var i in this.valueMacros) {
      var macro = this.valueMacros[i];
      if (macro.matches(name, argValues) && !_.contains(stack.valueMacro, macro)) {
        return macro;
      }
    }

    if (this.isGlobal && argValues.length == 0) {
      var ValueMacro_ = require("../macros/ValueMacro");
      return new ValueMacro_(name, ValuesDefinition.ZERO, this, [new LiteralExpression(name)]);
    } else if (this.parent) {
      return this.parent.getValueMacro(name, argValues, stack);
    } else {
      return null;
    }
  }

  getPropertyMacro(name:string, argValues:Values, stack:Stack):PropertyMacro {
    for (var i in this.propertyMacros) {
      var macro = this.propertyMacros[i];
      if (macro.matches(name, argValues) && !_.contains(stack.propertyMacro, macro)) {
        return macro;
      }
    }

    // TODO create super parent class that returns null for everything to
    // avoid this.
    return this.parent ? this.parent.getPropertyMacro(name, argValues, stack) : null;
  }

  evaluateProperties(stack:Stack, properties:{[name:string]: Expression[]}):any {
    var output = {}

    for (var name in properties) {
      var expressions = properties[name];

      // TODO refactor Values constructor to accept this
      var argValues = new Values(
        _.map(expressions, (expression) => { return { expression: expression } }),
        this,
        stack
      );

      var propertyMacro;
      if (propertyMacro = this.getPropertyMacro(name, argValues, stack)) {
        stack.propertyMacro.push(propertyMacro);
        _.extend(output, propertyMacro.evaluate(argValues, stack));
        stack.propertyMacro.pop()
      } else {
        if (argValues.length != 1 || argValues.positional.length != 1) {
          throw new Error("Cannot apply " + argValues.length + " args to primitive property " + name)
        }

        output[name] = Value.evaluate(argValues.positional[0], stack);
      }
    }

    return output
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

export = Scope

