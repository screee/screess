import VM = require('vm');
import Scope = require("Scope");
import Stack = require("Stack");
import _ = require('./utilities');
import ScreeSS = require("./index");

function eval(source:string, scope: Scope, stack: Stack): any {
  return VM.runInNewContext(
    source,
    _.extend({scope: scope, stack: stack, _: _}, ScreeSS)
  );
}

export = eval;