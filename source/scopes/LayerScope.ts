import Scope = require("./Scope")
import ClassScope = require('./ClassScope')
var _ = require('../utilities')

class LayerScope extends Scope {

  addMetaProperty(name, expressions) {
    if(this.metaProperties[name]) {
      throw new Error("Duplicate entries for metaproperty '#{name}'")
    }
    this.metaProperties[name] = expressions
  }

  addClassScope(name) {
    if (!this.classScopes[name]) {
      this.classScopes[name] = new ClassScope(this)
    }
    return this.classScopes[name];
  }

  setFilter(filterExpression) {
    if (this.filterExpression) {
      throw new Error("Duplicate filters")
    }
    this.filterExpression = filterExpression
  }

  setSource(source) {
    if (this.source) {
      throw new Error("Duplicate sources")
    }
    this.source = source
  }

  public classScopes;
  public metaProperties;
  public filterExpression;
  public source;

  constructor(public name, parent) {
    super(parent)
    this.classScopes = {}
    this.metaProperties = {}
  }

  toMGLLayerScope(options) {
    options.scopeStack.push(this)

    if (this.filterExpression) {
      options.pushFilter()
      options.meta = true
      options.property = "filter"

      var metaFilterProperty = this.filterExpression ? {
        filter: this.filterExpression.toMGLFilter(this, options)
      } : null;

      options.popFilter()
      options.meta = false
      options.property = null
    } else {
      metaFilterProperty = null
    }

    var metaSourceProperty;
    if (this.source) {
      if (!this.getSource(this.source)) {
        throw "Unknown source '#{this.source}'"
      }
      metaSourceProperty = { source: this.source }
    } else {
      metaSourceProperty = null
    }

    options.meta = true
    var metaProperties = this.toMGLProperties(options, this.metaProperties)
    options.meta = false

    var paintProperties = { paint: this.toMGLProperties(options, this.properties) }

    var paintClassProperties = _.objectMap(
      this.classScopes,
      (scope, name) => { ["paint.#{name}", scope.toMGLClassScope(options)] }
    )

    options.scopeStack.pop()

    return _.extend(
      {id: this.name},
      metaProperties,
      paintProperties,
      paintClassProperties,
      metaFilterProperty,
      metaSourceProperty
    )
  }
}

export = LayerScope;