var LayerStack = (function () {
    function LayerStack() {
        this.propertyMacroStack = [];
        this.scopeStack = [];
    }
    LayerStack.prototype.getGlobalScope = function () {
        return this.scopeStack[0];
    };
    LayerStack.prototype.getScope = function () {
        return this.scopeStack[this.scopeStack.length - 1];
    };
    return LayerStack;
})();
//# sourceMappingURL=LayerStack.js.map