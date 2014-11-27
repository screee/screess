import Scope = require("./Scope")
import ClassScope = require('./ClassScope')
import Expression = require('../expressions/Expression');
import Stack = require('../Stack')
import _ = require('../utilities')
import MapboxGLStyleSpec = require('../MapboxGLStyleSpec');
import assert = require('assert');
import ScopeType = require('./ScopeType');

class LayerScope extends Scope {

  // TODO deprecate
  addMetaProperty(name:string, expressions:Expression[]):void {
    if (this.metaProperties[name]) {
      throw new Error("Duplicate entries for metaproperty '" + name + "'")
    }
    this.metaProperties[name] = expressions
  }

  // TODO deprecate
  setFilter(filterExpression:Expression):void {
    if (this.filterExpression) {
      throw new Error("Duplicate filters")
    }
    this.filterExpression = filterExpression
  }

  // TODO deprecate
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
    super(ScopeType.LAYER, parent)

    if (!this.name) {
      this.name = _.uniqueId("layer");
    }

    this.metaProperties = {}
  }

  evaluateProperty(stack:Stack):{} {
    if (this.filterExpression) {
      return this.filterExpression.evaluate(this, stack);;
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
    var sublayers = _.map(this.layerScopes, (layer) => {
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
        filter: this.evaluateProperty(stack),
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