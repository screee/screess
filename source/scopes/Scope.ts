import Value = require("../values/value")
import MacroArgValues = require("../macros/MacroArgValues")
import MacroArgDefinition = require('../macros/MacroArgDefinition')
import assert = require("assert")
import LiteralExpression = require('../expressions/LiteralExpression')
import GlobalScope = require('./GlobalScope');
import Options = require('../Options')
import Expression = require('../expressions/Expression');
import ValueMacro = require('../macros/ValueMacro');
import PropertyMacro = require('../macros/PropertyMacro');
var _ = require("../utilities")

class Scope {

  public properties;
  public valueMacros;
  public propertyMacros;

  constructor(public parent) {
    assert(!this.parent || _.is(this.parent, Scope));
    this.properties = {};
    this.valueMacros = [];
    this.propertyMacros = [];
  }

  getGlobalScope():GlobalScope {
    return this.parent.getGlobalScope()
  }

  getSource(name:string):any {
    return this.parent.getSource(name);
  }

  addProperty(name:string, expressions:Expression[]) {
    if (this.properties[name]) {
      throw new Error("Duplicate entries for property '#{name}'")
    }

    return this.properties[name] = expressions;
  }

  addLiteralValueMacros(values:{[name:string]:any}):void {
    for (name in values) {
      var value = values[name];
      this.addValueMacro(name, MacroArgDefinition.ZERO, [new LiteralExpression(value)]);
    }
  }

  // TODO overload function for different arg types
  addValueMacro(name:String, argDefinition:MacroArgDefinition, body:any) {
    assert(_.is(argDefinition, MacroArgDefinition) || !argDefinition);

    var ValueMacro = require("../macros/ValueMacro");
    // TODO move this logic to ValueMacro
    var macro;
    if (_.isArray(body)) {
      macro = ValueMacro.createFromExpressions(name, argDefinition, this, body);
    } else if (_.isFunction(body)) {
      macro = ValueMacro.createFromFunction(name, argDefinition, this, body);
    } else {
      assert(false);
    }

    return this.valueMacros.unshift(macro);
  }

  addPropertyMacro(name:string, argDefinition:MacroArgDefinition, body:MacroArgDefinition):Scope {
    var PropertyMacro = require("../macros/PropertyMacro");
    var macro = new PropertyMacro(this, name, argDefinition, body)
    this.propertyMacros.unshift(macro)

    return macro.scope
  }

  getValueMacro(name:string, argValues:MacroArgValues, options:Options):ValueMacro {
    for (var i in this.valueMacros) {
      var macro = this.valueMacros[i];
      if (macro.matches(name, argValues) && !_.contains(options.valueMacroStack, macro)) {
        return macro;
      }
    }

    return this.parent ? this.parent.getValueMacro(name, argValues, options) : null;
  }

  getPropertyMacro(name:string, argValues:MacroArgValues, options:Options):PropertyMacro {
    for (var i in this.propertyMacros) {
      var macro = this.propertyMacros[i];
      if (macro.matches(name, argValues) && !_.contains(options.propertyMacroStack, macro)) {
        return macro;
      }
    }

    // TODO create super parent class that returns null for everything to
    // avoid this.
    return this.parent ? this.parent.getPropertyMacro(name, argValues, options) : null;
  }

  toMGLProperties(options:Options, properties:{[name:string]: Expression[]}):any {
    var output = {}

    for (var name in properties) {
      var expressions = properties[name];
      options.property = name

      var argValues = MacroArgValues.createFromExpressions(
        _.map(expressions, (expression) => { return { expression: expression } }),
        this,
        options
      );

      var propertyMacro;
      if (propertyMacro = this.getPropertyMacro(name, argValues, options)) {
        options.propertyMacroStack.push(propertyMacro);
        _.extend(output, propertyMacro.toMGLScope(argValues, options));
        options.propertyMacroStack.pop()
      } else {
        if (argValues.length != 1 || argValues.positionalArgs.length != 1) {
          throw new Error("Cannot apply #{argValues.length} args to primitive property '#{name}'")
        }

        output[name] = Value.toMGLValue(argValues.positionalArgs[0], options);
      }

      options.property = null;
    }

    return output
  }

}

export = Scope

