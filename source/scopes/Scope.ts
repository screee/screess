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
import ScopeType = require('./ScopeType')
import MapboxGLStyleSpec = require('../MapboxGLStyleSpec')
var Globals = require('../globals');

interface Loop {
  scope:Scope;
  valueIdentifier:string;
  keyIdentifier:string;
  collectionExpression:Expression;
}

class Scope {

  // TODO move to a global class
  public sources:{[name:string]: any};

  public properties:{[x: string]: Expression[]};
  public valueMacros:ValueMacro[];
  public propertyMacros:PropertyMacro[];
  public loops:Loop[]

  public layerScopes:{[name:string]: Scope}
  public classScopes:{[name:string]: Scope}

  // TODO deprecate
  public filterExpression:Expression;

  constructor(public parent:Scope, public name?:string) {
    this.properties = {};
    this.valueMacros = [];
    this.propertyMacros = [];
    this.loops = [];
    this.classScopes = {};
    this.layerScopes = {};
    this.sources = {};

    if (this.parent == null) {
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

  getProperties():{} {
    return this.properties;
  }

  isGlobal():boolean {
    return !this.parent
  }

  addSource(source:{}):string {
    if (this.isGlobal()) {
      var hash = _.hash(JSON.stringify(source)).toString();
      this.sources[hash] = source;
      return hash;
    } else {
      return this.parent.addSource(source);
    }
  }

  getGlobalScope():Scope {
    return this.isGlobal() ? this : this.parent.getGlobalScope();
  }

  getSource(name:string):any {
    return this.isGlobal() ? this.getSource(name) : this.parent.getSource(name);
  }

  addProperty(name:string, expressions:Expression[]) {
    if (this.properties[name]) {
      throw new Error("Duplicate entries for property " + name)
    }

    return this.properties[name] = expressions;
  }

  addClassScope(name:string):Scope {
    if (!this.classScopes[name]) {
      this.classScopes[name] = new Scope(this, name)
    }
    return this.classScopes[name];
  }

  addLayerScope(name?:string):Scope {
    if (this.layerScopes[name]) {
      throw new Error("Duplicate entries for layer scope " + name)
    }
    return this.layerScopes[name] = new Scope(this, name);
  }

  addLiteralValueMacros(values:{[name:string]:any}):void {
    for (var identifier in values) {
      this.addLiteralValueMacro(identifier, values[identifier]);
    }
  }

  addLiteralValueMacro(identifier:string, value:any) {
    this.addValueMacro(identifier, ValuesDefinition.ZERO, [new LiteralExpression(value)]);
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

  addLoop(valueIdentifier:string, keyIdentifier:string, collectionExpression:Expression):Scope {
    var loop = {
      valueIdentifier: valueIdentifier,
      keyIdentifier: keyIdentifier,
      collectionExpression: collectionExpression,
      scope: new Scope(this)
    }
    this.loops.push(loop);
    return loop.scope;
  }

  getValueMacro(name:string, values:Values, stack:Stack):ValueMacro {
    for (var i in this.valueMacros) {
      var macro = this.valueMacros[i];
      if (macro.matches(name, values) && !_.contains(stack.valueMacro, macro)) {
        return macro;
      }
    }

    if (this.isGlobal() && values.length == 0) {
      var ValueMacro_ = require("../macros/ValueMacro");
      return new ValueMacro_(name, ValuesDefinition.ZERO, this, [new LiteralExpression(name)]);
    } else if (this.parent) {
      return this.parent.getValueMacro(name, values, stack);
    } else {
      return null;
    }
  }

  getPropertyMacro(name:string, values:Values, stack:Stack):PropertyMacro {
    for (var i in this.propertyMacros) {
      var macro = this.propertyMacros[i];
      if (macro.matches(name, values) && !_.contains(stack.propertyMacro, macro)) {
        return macro;
      }
    }

    // TODO create super parent class that returns null for everything to
    // avoid this.
    return this.parent ? this.parent.getPropertyMacro(name, values, stack) : null;
  }

  evaluateProperties(stack:Stack, properties:{[name:string]: Expression[]} = this.properties):any {
    var output = {}

    for (var name in properties) {
      var expressions = properties[name];

      // TODO refactor Values constructor to accept this
      var values = new Values(
        _.map(expressions, (expression) => { return { expression: expression } }),
        this,
        stack
      );

      var propertyMacro;
      if (propertyMacro = this.getPropertyMacro(name, values, stack)) {
        stack.propertyMacro.push(propertyMacro);
        _.extend(output, propertyMacro.evaluate(values, stack));
        stack.propertyMacro.pop()
      } else {
        if (values.length != 1 || values.positional.length != 1) {
          throw new Error("Cannot apply " + values.length + " args to primitive property " + name)
        }

        output[name] = Value.evaluate(values.positional[0], stack);
      }
    }

    return output
  }

  evaluateGlobalScope(stack:Stack = new Stack()):any {
    stack.scope.push(this)

    var layers = this.evaluateLayers(stack);

    var properties = this.evaluateProperties(stack)

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

    return _.extend(
      properties,
      {
        version: 6,
        layers: layers,
        sources: sources,
        transition: transition
      }
    )
  }

  evaluateClassScope(stack:Stack):any {
    // TODO assert there are no child layers or classes
    stack.scope.push(this);
    this.evaluateProperties(stack);
    stack.scope.pop();
  }

  // TODO deprecate
  setFilter(filterExpression:Expression):void {
    if (this.filterExpression) {
      throw new Error("Duplicate filters")
    }
    this.filterExpression = filterExpression
  }

  evaluateFilterProperty(stack:Stack):{} {
    if (this.filterExpression) {
      return this.filterExpression.evaluate(this, stack);;
    } else {
      return null
    }
  }

  evaluateClassPaintProperties(type:string, stack:Stack):{} {
    // TODO ensure all properties are paint properties, not layout properties
    return _.objectMap(
      this.classScopes,
      (scope, name) => {
        return ["paint." + name, scope.evaluateClassScope(stack)]
      }
    )
  }

  evaluatePaintProperties(type:string, stack:Stack):{} {
    var properties = this.evaluateProperties(
        stack,
        _.objectFilter(
          this.properties,
          (property, name) => { return !_.startsWith(name, "$") }
        )
      )

    var layout = {};
    var paint = {};
    var zIndex = 0;

    _.each(properties, (value:any, name:string) => {

      if (name == 'z-index') {
        zIndex = value
      } else if (_.contains(MapboxGLStyleSpec[type].paint, name)) {
        paint[name] = value;
      } else if (_.contains(MapboxGLStyleSpec[type].layout, name)) {
        layout[name] = value;
      } else {
        throw new Error("Unknown property name " + name + " for layer type " + type);
      }

    });

    return {layout: layout, paint: paint, 'z-index': zIndex};
  }

  // TODO merge this method with evaluatePaintProperties
  evaluateMetaProperties(stack:Stack):{} {
    return this.evaluateProperties(
      stack,
      _.objectMapKeys(
        _.objectFilter(
          this.properties,
          (property, name) => { return _.startsWith(name, "$") }
        ),
        (property, name) => { return name.slice(1) }
      )
    );
  }

  evaluateLayerScope(stack:Stack):any {
    stack.scope.push(this);

    var layers = this.evaluateLayers(stack);
    var metaProperties = this.evaluateMetaProperties(stack);

    if (layers) {
      if (metaProperties['type']) {
        assert.equal(metaProperties['type'], 'raster');
      }
      metaProperties['type'] = 'raster'
    }

    // TODO ensure layer has a source and type

    // TODO remove this _.objectCompact call -- some falsey values are important.
    var properties = _.objectCompact(_.extend(
      {
        id: this.name || _.uniqueId('scope'),
        filter: this.evaluateFilterProperty(stack),
        layers: layers
      },
      metaProperties,
      this.evaluatePaintProperties(metaProperties['type'], stack),
      this.evaluateClassPaintProperties(metaProperties['type'], stack)
    ));

    stack.scope.pop();

    return properties;
  }

  evaluate(type:ScopeType, stack:Stack):{} {
    if (type == ScopeType.GLOBAL) {
      return this.evaluateGlobalScope(stack)
    } else if (type == ScopeType.LAYER) {
      return this.evaluateLayerScope(stack)
    } else if (type == ScopeType.CLASS) {
      return this.evaluateClassScope(stack)
    } else {
      assert(false);
    }
  }

  eachLoopScope(stack:Stack, callback:(Scope) => void):void {
    for (var i in this.loops) {
      var scope = this.loops[i].scope;
      var collectionExpression = this.loops[i].collectionExpression;
      var valueIdentifier = this.loops[i].valueIdentifier;
      var keyIdentifier = this.loops[i].keyIdentifier;

      var collection = collectionExpression.toValue(this, stack);
      assert(_.isArray(collection) || _.isObject(collection))

      for (var key in collection) {
        var value = collection[key];
        scope.addLiteralValueMacro(valueIdentifier, value);
        if (keyIdentifier) { scope.addLiteralValueMacro(keyIdentifier, key); }
        callback(scope);
      }
    }
  }

  evaluateLayers(stack:Stack):{}[] {
    var layers = _.map(this.layerScopes, (layer) => {
      return layer.evaluateLayerScope(stack);
    });

    this.eachLoopScope(stack, (scope) => {
      layers = layers.concat(scope.evaluateLayers(stack));
    });

    // We are relying on the behavior that the original ordering is preserved
    // for layers with the same z-index
    layers = _.sortBy(layers, 'z-index')

    return layers.length ? layers : undefined;
  }

}

export = Scope
