import Expression = require('../expressions/Expression')
import MacroArgDefinition = require('../macros/MacroArgDefinition')
import Scope = require('../scopes/Scope')
import LiteralExpression = require('../expressions/LiteralExpression')
import assert = require('assert')
var _ = require("../utilities")

class ValueMacro {

  // TODO make overloaded constructors
  static createFromValue(name, scope, value) {
    return this.createFromExpression(name, MacroArgDefinition.ZERO, scope, new LiteralExpression(value))
  }

  static createFromExpression(name, argDefinition, parentScope, expression) {
    return this.createFromExpressions(name, argDefinition, parentScope, [expression])
  }

  static createFromExpressions(name, argDefinition, parentScope, expressions) {
    assert(_.isArray(expressions));

    return this.createFromFunction(name, argDefinition, parentScope, (args, options) => {
      var scope = new Scope(parentScope)
      scope.addLiteralValueMacros(args)

      options.scopeStack.push(scope);
      var values = _.map(expressions, (expression) => { return expression.toValue(scope, options) } )
      options.scopeStack.pop();
      return values;
    });
  }

  static createFromFunction(name, argDefinition, parentScope, body) {
    assert(_.isFunction(body));
    return new ValueMacro(name, argDefinition, parentScope, body);
  }

  constructor(public name, public argDefinition, public parentScope, public body) {
    assert(_.is(this.parentScope, Scope));
    assert(_.is(this.argDefinition, MacroArgDefinition) || !this.argDefinition);
    assert(_.isFunction(this.body));
  }

  matches(name, argValues) {
    return name == this.name && argValues.matches(this.argDefinition);
  }

  toValues(argValues, options) {
    var args = argValues.toArguments(this.argDefinition, options);
    var values = this.body(args, options);
    assert(_.isArray(values));
    return values;
  }

}

export = ValueMacro
