import Expression = require('./expressions/Expression')
import ArgumentsDefinition = require('./ArgumentsDefinition')
import Arguments = require('./Arguments')
import Scope = require('./Scope')
import LiteralExpression = require('./expressions/LiteralExpression')
import assert = require('assert')
import Stack = require('./Stack')
import _ = require("./utilities")

class Macro {

  constructor(public scope:Scope, public name:string, public argsDefinition:ArgumentsDefinition, public body:Expression) {
    assert(this.body instanceof Expression);
  }

  matches(name:string, args:Arguments):boolean {
    return name == this.name && args.matches(this.argsDefinition);
  }

  evaluateToIntermediate(args:Arguments, stack:Stack) {
    var scope = new Scope(this.scope);
    scope.addLiteralMacros(args.toObject(this.argsDefinition, stack));

    stack.scope.push(scope);
    var evaluated = this.body.evaluateToIntermediate(scope, stack);
    stack.scope.pop();

    return evaluated;
  }

}

export = Macro
