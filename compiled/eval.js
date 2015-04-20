var VM = require('vm');
var _ = require('./utilities');
var ScreeSS = require("./index");
function eval(source, scope, stack) {
    return VM.runInNewContext(source, _.extend({ scope: scope, stack: stack, _: _ }, ScreeSS));
}
module.exports = eval;
//# sourceMappingURL=eval.js.map