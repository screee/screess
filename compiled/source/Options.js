var Stack = (function () {
    function Stack() {
        this.valueMacroStack = [];
        this.propertyMacroStack = [];
        this.scopeStack = [];
        this.filters = 0;
        this.property = null;
        this.isMetaProperty = false;
    }
    Stack.prototype.getGlobalScope = function () {
        return this.scopeStack[0];
    };
    Stack.prototype.getScope = function () {
        return this.scopeStack[this.scopeStack.length - 1];
    };
    Stack.prototype.pushFilter = function () {
        this.filters++;
    };
    Stack.prototype.popFilter = function () {
        --this.filters;
    };
    Stack.prototype.isFilter = function () {
        return this.filters > 0;
    };
    return Stack;
})();
module.exports = Stack;
//# sourceMappingURL=Stack.js.map