var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ScopeStack = require('./ScopeStack');
var GlobalScopeStack = (function (_super) {
    __extends(GlobalScopeStack, _super);
    function GlobalScopeStack(name, scope, parent) {
        _super.call(this, scope, parent);
        this.name = name;
    }
    return GlobalScopeStack;
})(ScopeStack);
module.exports = GlobalScopeStack;
//# sourceMappingURL=GlobalScopeStack.js.map