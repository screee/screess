import VM = require('vm');
import Scope = require("Scope");
import Stack = require("Stack");
import _ = require('./utilities');
import ScreeSS = require("./index");

function eval(source:string, scope: Scope, stack: Stack): any {
  var sandbox = _.extend(
    {scope: scope, stack: stack, console: console},
    scope.getValueMacrosAsFunctions(stack),
    ScreeSS
  );
  return VM.runInNewContext(source, sandbox);
}

export = eval;