var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ScopeStack = require('./ScopeStack');
var ClassScopeStack = (function (_super) {
    __extends(ClassScopeStack, _super);
    function ClassScopeStack(name, scope, parent) {
        _super.call(this, scope, parent);
        this.name = name;
    }
    return ClassScopeStack;
})(ScopeStack);
module.exports = ClassScopeStack;
//# sourceMappingURL=ClassScopeStack.js.map