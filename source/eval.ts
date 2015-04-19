import VM = require('vm');
import Scope = require("Scope");
import Stack = require("Stack");

function eval(source:string, scope: Scope, stack: Stack): any {
    return VM.runInNewContext(source)
}

export = eval;