import Scope = require("./Scope")
import ClassScope = require('./ClassScope')
import Expression = require('../expressions/Expression');
import Options = require('../Options')
var _ = require('../utilities')

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

  toMGLLayerScope(options:Options):any {
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