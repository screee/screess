import Expression = require('../expressions/Expression')
import ValuesDefinition = require('../ValuesDefinition')
import Values = require('../Values')
import Scope = require('../scopes/Scope')
import LiteralExpression = require('../expressions/LiteralExpression')
import assert = require('assert')
import Stack = require('../Stack')
import _ = require("../utilities")

class ValueMacro {

  // TODO make overloaded constructors
  static createFromValue(name, scope, value) {
    return this.createFromExpression(name, ValuesDefinition.ZERO, scope, new LiteralExpression(value))
  }

  // TODO make overloaded constructors
  static createFromExpression(name, argDefinition, parentScope, expression) {
    return this.createFromExpressions(name, argDefinition, parentScope, [expression])
  }

  // TODO make overloaded constructors
  static createFromExpressions(name, argDefinition, parentScope, expressions:Expression[]) {
    assert(_.isArray(expressions));

    return this.createFromFunction(name, argDefinition, parentScope, (args, stack) => {
      var scope = new Scope(null, parentScope)
      scope.addLiteralValueMacros(args)

      stack.scope.push(scope);
      var values = _.map(expressions, (expression) => { return expression.toValue(scope, stack) } )
      stack.scope.pop();
      return values;
    });
  }

  // TODO make overloaded constructors
  static createFromFunction(name, argDefinition, parentScope, body) {
    assert(_.isFunction(body));
    return new ValueMacro(name, argDefinition, parentScope, body);
  }

  constructor(public name:string, public argDefinition:ValuesDefinition, public parentScope:Scope, public body:Function) {}

  matches(name:string, argValues:Values):boolean {
    return name == this.name && argValues.matches(this.argDefinition);
  }

  toValues(argValues:Values, stack:Stack) {
    var args = argValues.evaluate(this.argDefinition, stack);
    var values = this.body(args, stack);
    return values;
  }

}

export = ValueMacro
