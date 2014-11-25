var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ScopeStack = require('./ScopeStack');
var PropertyMacroStack = (function (_super) {
    __extends(PropertyMacroStack, _super);
    function PropertyMacroStack(macro, parent) {
        _super.call(this, macro.scope, parent);
        this.macro = macro;
        this.parent = parent;
        this.parentPropertyMacro = null;
        if (parent instanceof PropertyMacroStack) {
            this.parentPropertyMacro = parent;
        }
    }
    PropertyMacroStack.prototype.contains = function (macro) {
        if (macro == this.macro) {
            return true;
        }
        else if (this.parentPropertyMacro) {
            return this.parentPropertyMacro.contains(macro);
        }
        else {
            return false;
        }
    };
    return PropertyMacroStack;
})(ScopeStack);
module.exports = PropertyMacroStack;
//# sourceMappingURL=PropertyMacroScopeStack.js.map