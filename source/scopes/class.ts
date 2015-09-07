import Stack = require('../Stack');
import Scope = require('../Scope');
import assert = require('assert');

function evaluateClassScope(stack:Stack, properties:{}, layers:Scope[], classes:Scope[]):any {
  assert(layers.length == 0);
  assert(classes.length == 0);

  return properties;
}

export = evaluateClassScope;
