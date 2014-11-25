var Context = (function () {
    function Context() {
        this.valueMacroStack = [];
        this.propertyMacroStack = [];
        this.scopeStack = [];
        this.filters = 0;
        this.property = null;
        this.isMetaProperty = false;
    }
    Context.prototype.getGlobalScope = function () {
        return this.scopeStack[0];
    };
    Context.prototype.getScope = function () {
        return this.scopeStack[this.scopeStack.length - 1];
    };
    Context.prototype.pushFilter = function () {
        this.filters++;
    };
    Context.prototype.popFilter = function () {
        --this.filters;
    };
    Context.prototype.isFilter = function () {
        return this.filters > 0;
    };
    return Context;
})();
module.exports = Context;
//# sourceMappingURL=Context.js.map