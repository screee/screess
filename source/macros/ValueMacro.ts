import Expression = require('../expressions/Expression')
import ValueSetDefinition = require('../ValueSetDefinition')
import ValueSet = require('../ValueSet')
import Scope = require('../Scope')
import LiteralExpression = require('../expressions/LiteralExpression')
import assert = require('assert')
import Stack = require('../Stack')
import _ = require("../utilities")

class ValueMacro {

  public body:Function;

  constructor(name:string, argDefinition:ValueSetDefinition, parentScope:Scope, body:Expression);
  constructor(name:string, argDefinition:ValueSetDefinition, parentScope:Scope, body:Function);

  constructor(public name:string, public argDefinition:ValueSetDefinition, public parentScope:Scope, body:any) {
    if (body instanceof Expression) {
      this.body = (args, stack) => {
        var scope = new Scope(parentScope)
        scope.addLiteralValueMacros(args)

        stack.scope.push(scope);
        var value = body.evaluateToIntermediate(scope, stack);
        stack.scope.pop();

        return value;
      }
    } else if (_.isFunction(body)) {
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

export = ValueMacro
