var Stack = (function () {
    function Stack() {
        this.valueMacroStack = [];
        this.propertyMacroStack = [];
        this.scopeStack = [];
    }
    Stack.prototype.getGlobalScope = function () {
        return this.scopeStack[0];
    };
    Stack.prototype.getScope = function () {
        return this.scopeStack[this.scopeStack.length - 1];
    };
    return Stack;
})();
module.exports = Stack;
//# sourceMappingURL=Stack.js.map