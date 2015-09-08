import Expression = require('./expressions/Expression')
import ValueSetDefinition = require('./ValueSetDefinition')
import ValueSet = require('./ValueSet')
import Scope = require('./Scope')
import LiteralExpression = require('./expressions/LiteralExpression')
import assert = require('assert')
import Stack = require('./Stack')
import _ = require("./utilities")

// TODO strongly type function args
class Macro {

  public body:Function;

  constructor(public parentScope:Scope, public name:string, public argDefinition:ValueSetDefinition, body:Expression|Function) {
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

  matches(name:string, argValues:ValueSet):boolean {
    return name == this.name && argValues.matches(this.argDefinition);
  }

  evaluateToIntermediate(argValues:ValueSet, stack:Stack) {
    var args = argValues.toObject(this.argDefinition, stack);
    var values = this.body(args, stack);
    return values;
  }

}

export = Macro
