/// <reference path="../definitions/index.d.ts" />
var Parser = require('./parser');
if (module.exports) {
    module.exports = Parser;
}
else if (window) {
    window['ScreeSS'] = Parser;
}
//# sourceMappingURL=main.js.map