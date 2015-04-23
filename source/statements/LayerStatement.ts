import Stack = require('../Stack');
import Scope = require("../Scope");
import Statement = require("./Statement");
import assert = require("assert");
import _ = require("../utilities");

class LayerStatement extends Statement {

  constructor(public name:string, public body:Scope) {
    super();
    // TODO deprecate names on scopes in general
    this.body.name = name;
  }

  evaluate(scope:Scope, stack:Stack, layers, classes, properties) {
    layers.push(this.body.evaluate(Scope.Type.LAYER, stack));
  }
}

export = LayerStatement;