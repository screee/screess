import Stack = require('../Stack');
import Scope = require("../Scope");
import Statement = require("./Statement");
import assert = require("assert");
import _ = require("../utilities");

class ClassStatement extends Statement {
  constructor(
      scope:Scope,
      public name:string,
      public body:Scope
  ) { super(scope) }

  evaluate(scope:Scope, stack:Stack, layers, classes, properties) {
    assert(scope == this.scope);
    classes.push(this.body.evaluate(Scope.Type.CLASS, stack));
  }
}

export = ClassStatement;