import Scope = require("./Scope")
import ClassScope = require('./ClassScope')
import Expression = require('../expressions/Expression');
import Context = require('../Context')
import _ = require('../utilities')
import MapboxGLStyleSpec = require('../MapboxGLStyleSpec');
import assert = require('assert');

class LayerScope extends Scope {

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
    this.classScopes = {}
    this.metaProperties = {}
  }

  evaluateFilterProperty(context:Context):{} {
    if (this.filterExpression) {

      // TODO move inside evaluate filter?
      context.pushFilter()
      context.isMetaProperty = true
      context.property = "filter"

      var filter = this.filterExpression.evaluateFilter(this, context);

      context.popFilter()
      context.isMetaProperty = false
      context.property = null

      return filter;
    } else {
      return null
    }
  }

  evaluateSourceProperty(context:Context):{} {
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

  evaluateClassPaintProperties(type:string, context:Context):{} {
    // TODO ensure all properties are paint properties, not layout properties
    return _.objectMap(
      this.classScopes,
      (scope, name) => {
        return ["paint.#{name}", scope.evaluateClassScope(context)]
      }
    )
  }

  evaluatePaintProperties(type:string, context:Context):{} {
    var properties = this.evaluateProperties(
      context,
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

  evaluateMetaProperties(context:Context):{} {
    context.isMetaProperty = true;
    var properties = this.evaluateProperties(context, this.metaProperties);
    context.isMetaProperty = false;

    return properties;
  }

  evaluateLayerScope(context:Context):any {
    context.scopeStack.push(this);

    // TODO ensure layer has a source and type

    var metaProperties = this.evaluateMetaProperties(context);
    var type = metaProperties['type'];
    assert(type, "Layer must have a type");

    var properties = _.objectCompact(_.extend(
      {
        // TODO calcualte name with _.hash
        id: this.name,
        source: this.evaluateSourceProperty(context),
        filter: this.evaluateFilterProperty(context)
      },
      this.evaluatePaintProperties(type, context),
      metaProperties,
      this.evaluateClassPaintProperties(type, context)
    ));

    context.scopeStack.pop();

    return properties;
  }
}

export = LayerScope;