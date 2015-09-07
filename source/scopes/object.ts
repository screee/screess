import Stack = require('../Stack');
import Scope = require('../Scope');
import assert = require('assert');

function evaluateObjectScope(stack:Stack, properties:{}, layers:Scope[], classes:Scope[]):any {
  assert(layers.length == 0);
  assert(classes.length == 0);

  return properties;
}

export = evaluateObjectScope;
