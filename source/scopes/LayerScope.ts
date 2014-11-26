import Scope = require("./Scope")
import ClassScope = require('./ClassScope')
import Expression = require('../expressions/Expression');
import Stack = require('../Stack')
import _ = require('../utilities')
import MapboxGLStyleSpec = require('../MapboxGLStyleSpec');
import assert = require('assert');

class LayerScope extends Scope {

  public sublayerScopes:{[name:string]: LayerScope};

  addLayerScope(name:string, scope:Scope):Scope {
    if (this.sublayerScopes[name]) {
      throw new Error("Duplicate entries for layer scope " + name)
    }
    return this.sublayerScopes[name] = new LayerScope(name, this);
  }

  addMetaProperty(name:string, expressions:Expression[]):void {
    if (this.metaProperties[name]) {
      throw new Error("Duplicate entries for metaproperty '" + name + "'")
    }
    this.metaProperties[name] = expressions
  }

  addClassScope(name:string):Scope {
    if (!this.classScopes[name]) {
      this.classScopes[name] = new ClassScope(this)
    }
    return this.classScopes[name];
  }

  setFilter(filterExpression:Expression):void {
    if (this.filterExpression) {
      throw new Error("Duplicate filters")
    }
    this.filterExpression = filterExpression
  }

  setSource(source:string):void {
    if (this.source) {
      throw new Error("Duplicate sources")
    }
    this.source = source
  }

  public classScopes:{[name:string]: ClassScope};
  public metaProperties:{[name:string]: Expression[]};
  public filterExpression:Expression;
  public source:string;

  constructor(public name:string, parent:Scope) {
    super(parent)

    if (!this.name) {
      this.name = _.uniqueId("layer");
    }

    this.classScopes = {}
    this.metaProperties = {}
    this.sublayerScopes = {}
  }

  evaluateFilterProperty(stack:Stack):{} {
    if (this.filterExpression) {
      return this.filterExpression.evaluateFilter(this, stack);;
    } else {
      return null
    }
  }

  evaluateSourceProperty(stack:Stack):{} {
    var metaSourceProperty;

    if (this.source) {
      if (!this.getSource(this.source)) {
        throw new Error("Unknown source " + this.source);
      }

      return this.source;
    } else {
      return null;
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
      this.properties
    );

    var layout = {};
    var paint = {};

    _.each(properties, (value, name) => {

      if (_.contains(MapboxGLStyleSpec[type].paint, name)) {
        paint[name] = value;
      } else if (_.contains(MapboxGLStyleSpec[type].layout, name)) {
        layout[name] = value;
      } else {
        throw new Error("Unknown property name " + name + " for layer type " + type);
      }

    });

    return {layout: layout, paint: paint};
  }

  evaluateMetaProperties(stack:Stack):{} {
    return this.evaluateProperties(stack, this.metaProperties);;
  }

  evaluateLayerScope(stack:Stack):any {
    stack.scope.push(this);

    var metaProperties = this.evaluateMetaProperties(stack);

    var hasSublayers = false;
    var sublayers = _.map(this.sublayerScopes, (layer) => {
      hasSublayers = true;
      return layer.evaluateLayerScope(stack);
    });

    if (hasSublayers && metaProperties['type']) {
      assert.equal(metaProperties['type'], 'raster');
    } else if (hasSublayers) {
      metaProperties['type'] = 'raster'
    }

    // TODO ensure layer has a source and type

    var properties = _.objectCompact(_.extend(
      {
        // TODO calcualte name with _.hash
        id: this.name,
        source: this.evaluateSourceProperty(stack),
        filter: this.evaluateFilterProperty(stack),
        layers: sublayers
      },
      this.evaluatePaintProperties(metaProperties['type'], stack),
      metaProperties,
      this.evaluateClassPaintProperties(metaProperties['type'], stack)
    ));

    stack.scope.pop();

    return properties;
  }
}

export = LayerScope;