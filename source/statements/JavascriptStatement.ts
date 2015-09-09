import Stack = require('../Stack');
import Scope = require("../Scope");
import Statement = require("./Statement");
import assert = require("assert");
import _ = require("../utilities");
import eval = require("../eval");

class PropertyStatement extends Statement {

  constructor(public source:string) {
    super();
  }

  evaluate(scope:Scope, stack:Stack, layers, classes, properties) {
    return eval(this.source, scope, stack, {
      scope: scope,
      stack: stack,
      layers: layers,
      classes: classes,
      properties: properties
    });
  }

  eachPrimitiveStatement(scope:Scope, stack:Stack, callback:(scope:Scope, statement:Statement) => void):void {
    callback(scope, this);
  }
}

export = PropertyStatement
