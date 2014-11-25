var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Stack = require('./Stack');
var ValueMacroStack = (function (_super) {
    __extends(ValueMacroStack, _super);
    function ValueMacroStack(macro, parent) {
        _super.call(this, parent);
        this.macro = macro;
        this.parentValueMacro = null;
        if (parent instanceof ValueMacroStack) {
            this.parentValueMacro = parent;
        }
    }
    ValueMacroStack.prototype.contains = function (macro) {
        if (macro == this.macro) {
            return true;
        }
        else if (this.parentValueMacro) {
            return this.parentValueMacro.contains(macro);
        }
        else {
            return false;
        }
    };
    ValueMacroStack.prototype.createValueMacroStack = function (macro) {
        return new ValueMacroStack(macro, this);
    };
    return ValueMacroStack;
})(Stack);
module.exports = ValueMacroStack;
//# sourceMappingURL=ValueMacroStack.js.map