var VM = require('vm');
function eval(source, scope, stack) {
    return VM.runInNewContext(source, { scope: scope, stack: stack });
}
module.exports = eval;
//# sourceMappingURL=eval.js.map