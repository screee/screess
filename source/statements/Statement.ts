// TODO put each statement class in its own file
// TODO always pass a scope at statment construction time, don't pass into methods after that

import Stack = require('../Stack');
import Scope = require("../Scope");
import assert = require("assert");
import _ = require("../utilities");

class Statement {

  constructor(public scope:Scope) {}

  eachPrimitiveStatement(scope:Scope, stack:Stack, callback:(scope:Scope, statement:Statement) => void):void {
    callback(this.scope, this);
  }

  evaluate(scope:Scope, stack:Stack, layers, classes, properties) {
    assert(false, "abstract method");
  }

}

export = Statement;