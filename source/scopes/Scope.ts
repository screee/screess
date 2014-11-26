import Value = require("../values/value")
import Values = require("../Values")
import ValuesDefinition = require('../ValuesDefinition')
import assert = require("assert")
import LiteralExpression = require('../expressions/LiteralExpression')
import GlobalScope = require('./GlobalScope');
import Stack = require('../Stack')
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
      throw new Error("Duplicate entries for property " + name)
    }

    return this.properties[name] = expressions;
  }

  addLiteralValueMacros(values:{[name:string]:any}):void {
    for (name in values) {
      var value = values[name];
      this.addValueMacro(name, ValuesDefinition.ZERO, [new LiteralExpression(value)]);
    }
  }

  // TODO overload function for different arg types
  addValueMacro(name:String, argDefinition:ValuesDefinition, body:any) {
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

  addPropertyMacro(name:string, argDefinition:ValuesDefinition, body:ValuesDefinition):Scope {
    var PropertyMacro = require("../macros/PropertyMacro");
    var macro = new PropertyMacro(this, name, argDefinition, body)
    this.propertyMacros.unshift(macro)

    return macro.scope
  }

  getValueMacro(name:string, argValues:Values, stack:Stack):ValueMacro {
    for (var i in this.valueMacros) {
      var macro = this.valueMacros[i];
      if (macro.matches(name, argValues) && !_.contains(stack.valueMacro, macro)) {
        return macro;
      }
    }

    return this.parent ? this.parent.getValueMacro(name, argValues, stack) : null;
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

      var argValues = Values.createFromExpressions(
        _.map(expressions, (expression) => { return { expression: expression } }),
        this,
        stack
      );

      var propertyMacro;
      if (propertyMacro = this.getPropertyMacro(name, argValues, stack)) {
        stack.propertyMacro.push(propertyMacro);
        _.extend(output, propertyMacro.evaluateScope(argValues, stack));
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

}

export = Scope

