var Value = require("../values/value")
import MacroArgValues = require("../macros/MacroArgValues")
import MacroArgDefinition = require('../macros/MacroArgDefinition')
import assert = require("assert")
var _ = require("../utilities")
var literalExpression = require('../expressions/LiteralExpression').literalExpression
var Value = require('../values/Value')

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

  getGlobalScope () {
    return this.parent.getGlobalScope()
  }

  addProperty(name, expressions) {
    if (this.properties[name]) {
      throw new Error("Duplicate entries for property '#{name}'")
    }

    return this.properties[name] = expressions;
  }

  addLiteralValueMacros(values) {
    for (name in values) {
      var value = values[name];
      this.addValueMacro(name, MacroArgDefinition.ZERO, [literalExpression(value)]);
    }
  }

  addValueMacro(name, argDefinition, body) {
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

  addPropertyMacro(name, argDefinition, body) {
    assert(_.is(argDefinition, MacroArgDefinition) || !argDefinition);

    var PropertyMacro = require("../macros/PropertyMacro");
    var macro = new PropertyMacro(this, name, argDefinition, body)
    this.propertyMacros.unshift(macro)

    return macro.scope
  }

  getValueMacro(name, argValues, options) {
    for (var i in this.valueMacros) {
      var macro = this.valueMacros[i];
      if (macro.matches(name, argValues) && !_.contains(options.valueMacroStack, macro)) {
        return macro;
      }
    }

    return this.parent ? this.parent.getValueMacro(name, argValues, options) : null;
  }

  getPropertyMacro(name, argValues, options) {
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

  toMGLProperties(options, properties) {
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

