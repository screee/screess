import Expression = require('../expressions/Expression')
import MacroArgDefinitions = require('../macros/MacroArgDefinitions')
import MacroArgValues = require('../macros/MacroArgValues')
import Scope = require('../scopes/Scope')
import LiteralExpression = require('../expressions/LiteralExpression')
import assert = require('assert')
import Stack = require('../Stack')
import _ = require("../utilities")

class ValueMacro {

  // TODO make overloaded constructors
  static createFromValue(name, scope, value) {
    return this.createFromExpression(name, MacroArgDefinitions.ZERO, scope, new LiteralExpression(value))
  }

  // TODO make overloaded constructors
  static createFromExpression(name, argDefinition, parentScope, expression) {
    return this.createFromExpressions(name, argDefinition, parentScope, [expression])
  }

  // TODO make overloaded constructors
  static createFromExpressions(name, argDefinition, parentScope, expressions:Expression[]) {
    assert(_.isArray(expressions));

    return this.createFromFunction(name, argDefinition, parentScope, (args, stack) => {
      var scope = new Scope(parentScope)
      scope.addLiteralValueMacros(args)

      stack.scopeStack.push(scope);
      var values = _.map(expressions, (expression) => { return expression.toValue(scope, stack) } )
      stack.scopeStack.pop();
      return values;
    });
  }

  // TODO make overloaded constructors
  static createFromFunction(name, argDefinition, parentScope, body) {
    assert(_.isFunction(body));
    return new ValueMacro(name, argDefinition, parentScope, body);
  }

  constructor(public name:string, public argDefinition:MacroArgDefinitions, public parentScope:Scope, public body:Function) {}

  matches(name:string, argValues:MacroArgValues):boolean {
    return name == this.name && argValues.matches(this.argDefinition);
  }

  toValues(argValues:MacroArgValues, stack:Stack) {
    var args = argValues.toArguments(this.argDefinition, stack);
    var values = this.body(args, stack);
    return values;
  }

}

export = ValueMacro
