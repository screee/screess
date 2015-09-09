import Expression = require('./expressions/Expression')
import ArgumentsDefinition = require('./ArgumentsDefinition')
import Arguments = require('./Arguments')
import Scope = require('./Scope')
import LiteralExpression = require('./expressions/LiteralExpression')
import assert = require('assert')
import Stack = require('./Stack')
import _ = require("./utilities")

// TODO strongly type function args
class Macro {

  public body:Function;

  constructor(public parentScope:Scope, public name:string, public argumentsDefinition:ArgumentsDefinition, body:Expression|Function) {
    if (body instanceof Expression) {

      this.body = (args, stack) => {
        var scope = new Scope(parentScope);
        scope.addLiteralMacros(args);

        stack.scope.push(scope);
        var value = body.evaluateToIntermediate(scope, stack);
        stack.scope.pop();

        return value;
      }
    } else if (body instanceof Function) {
      this.body = body;

    } else {
      assert(false);
    }
  }

  matches(name:string, argValues:Arguments):boolean {
    return name == this.name && argValues.matches(this.argumentsDefinition);
  }

  evaluateToIntermediate(argValues:Arguments, stack:Stack) {
    var args = argValues.toObject(this.argumentsDefinition, stack);
    var values = this.body(args, stack);
    return values;
  }

}

export = Macro
