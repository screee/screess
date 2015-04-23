import Stack = require('../Stack');
import Scope = require("../Scope");
import Statement = require("./Statement");
import assert = require("assert");
import _ = require("../utilities");

class LayerStatement extends Statement {
  constructor(
      scope:Scope,
      public name:string,
      public body:Scope
  ) {
    super(scope);
     // TODO deprecate names on scopes in general
    this.body.name = name;
  }

  evaluate(scope:Scope, stack:Stack, layers, classes, properties) {
    assert(scope == this.scope);
    layers.push(this.body.evaluate(Scope.Type.LAYER, stack));
  }
}

export = LayerStatement;