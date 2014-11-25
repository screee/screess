var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ScopeStack = require('./ScopeStack');
var LayerScopeStack = (function (_super) {
    __extends(LayerScopeStack, _super);
    function LayerScopeStack(name, scope, parent) {
        _super.call(this, scope, parent);
        this.name = name;
    }
    return LayerScopeStack;
})(ScopeStack);
module.exports = LayerScopeStack;
//# sourceMappingURL=LayerScopeStack.js.map