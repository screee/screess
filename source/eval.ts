import VM = require('vm');
import Scope = require("./Scope");
import Stack = require("./Stack");
import _ = require('./utilities');
import ScreeSS = require("./index");

function _eval(source:string, scope:Scope, stack:Stack, sandbox:{} = {}): any {
  _.extend(
    sandbox,
    {scope: scope, stack: stack, console: console},
    scope.getMacrosAsFunctions(stack),
    ScreeSS
  );
  return VM.runInNewContext(source, sandbox);
}

export = _eval;
