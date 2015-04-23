import Stack = require('../Stack');
import Scope = require("../Scope");
import Statement = require("./Statement");
import assert = require("assert");
import _ = require("../utilities");

class ClassStatement extends Statement {

  constructor(public name:string, public body:Scope) { super(); }

  evaluate(scope:Scope, stack:Stack, layers, classes, properties) {
    classes.push(this.body.evaluate(Scope.Type.CLASS, stack));
  }
}

export = ClassStatement;