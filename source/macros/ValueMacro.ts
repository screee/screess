import Expression = require('../expressions/Expression')
import ValuesDefinition = require('../ValuesDefinition')
import Values = require('../Values')
import Scope = require('../Scope')
import LiteralExpression = require('../expressions/LiteralExpression')
import assert = require('assert')
import Stack = require('../Stack')
import _ = require("../utilities")

class ValueMacro {

  public body:Function;

  constructor(name:string, argDefinition:ValuesDefinition, parentScope:Scope, body:Expression[]);
  constructor(name:string, argDefinition:ValuesDefinition, parentScope:Scope, body:Function);
  constructor(public name:string, public argDefinition:ValuesDefinition, public parentScope:Scope, body:any) {
    if (_.isArray(body)) {
      this.body = (args, stack) => {
        var scope = new Scope(parentScope)
        scope.addLiteralValueMacros(args)

        stack.scope.push(scope);
        var values = _.map(body, (expression:Expression) => {
          return expression.evaluateToIntermediate(scope, stack)
        })
        stack.scope.pop();
        return values;
      }
    } else if (_.isFunction(body)) {
      this.body = body;
    } else {
      assert(false);
    }
  }

  matches(name:string, argValues:Values):boolean {
    return name == this.name && argValues.matches(this.argDefinition);
  }

  evaluateToIntermediates(argValues:Values, stack:Stack) {
    var args = argValues.evaluate(this.argDefinition, stack);
    var values = this.body(args, stack);
    return values;
  }

}

export = ValueMacro
