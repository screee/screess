var VM = require('vm');
function eval(source, scope, stack) {
    return VM.runInNewContext(source);
}
module.exports = eval;
//# sourceMappingURL=eval.js.map