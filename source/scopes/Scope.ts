import Value = require("../values/value")
import MacroArgValues = require("../macros/MacroArgValues")
import MacroArgDefinitions = require('../macros/MacroArgDefinitions')
import assert = require("assert")
import LiteralExpression = require('../expressions/LiteralExpression')
import GlobalScope = require('./GlobalScope');
import Context = require('../Context')
import Expression = require('../expressions/Expression');
import ValueMacro = require('../macros/ValueMacro');
import PropertyMacro = require('../macros/PropertyMacro');
import _ = require("../utilities")

class Scope {

  public properties;
  public valueMacros;
  public propertyMacros;

  constructor(public parent:Scope) {
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
      this.addValueMacro(name, MacroArgDefinitions.ZERO, [new LiteralExpression(value)]);
    }
  }

  // TODO overload function for different arg types
  addValueMacro(name:String, argDefinition:MacroArgDefinitions, body:any) {
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

  addPropertyMacro(name:string, argDefinition:MacroArgDefinitions, body:MacroArgDefinitions):Scope {
    var PropertyMacro = require("../macros/PropertyMacro");
    var macro = new PropertyMacro(this, name, argDefinition, body)
    this.propertyMacros.unshift(macro)

    return macro.scope
  }

  getValueMacro(name:string, argValues:MacroArgValues, context:Context):ValueMacro {
    for (var i in this.valueMacros) {
      var macro = this.valueMacros[i];
      if (macro.matches(name, argValues) && !_.contains(context.valueMacroStack, macro)) {
        return macro;
      }
    }

    return this.parent ? this.parent.getValueMacro(name, argValues, context) : null;
  }

  getPropertyMacro(name:string, argValues:MacroArgValues, context:Context):PropertyMacro {
    for (var i in this.propertyMacros) {
      var macro = this.propertyMacros[i];
      if (macro.matches(name, argValues) && !_.contains(context.propertyMacroStack, macro)) {
        return macro;
      }
    }

    // TODO create super parent class that returns null for everything to
    // avoid this.
    return this.parent ? this.parent.getPropertyMacro(name, argValues, context) : null;
  }

  evaluateProperties(context:Context, properties:{[name:string]: Expression[]}):any {
    var output = {}

    for (var name in properties) {
      var expressions = properties[name];
      context.property = name

      var argValues = MacroArgValues.createFromExpressions(
        _.map(expressions, (expression) => { return { expression: expression } }),
        this,
        context
      );

      var propertyMacro;
      if (propertyMacro = this.getPropertyMacro(name, argValues, context)) {
        context.propertyMacroStack.push(propertyMacro);
        _.extend(output, propertyMacro.evaluateScope(argValues, context));
        context.propertyMacroStack.pop()
      } else {
        if (argValues.length != 1 || argValues.positionalArgs.length != 1) {
          throw new Error("Cannot apply #{argValues.length} args to primitive property '#{name}'")
        }

        output[name] = Value.evaluate(argValues.positionalArgs[0], context);
      }

      context.property = null;
    }

    return output
  }

}

export = Scope

