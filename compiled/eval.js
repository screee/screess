var VM = require('vm');
var _ = require('./utilities');
var ScreeSS = require("./index");
function eval(source, scope, stack) {
    var sandbox = _.extend({ scope: scope, stack: stack, console: console }, scope.getValueMacrosAsFunctions(stack), ScreeSS);
    return VM.runInNewContext(source, sandbox);
}
module.exports = eval;
//# sourceMappingURL=eval.js.map