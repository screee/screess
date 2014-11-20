var Options = (function () {
    function Options() {
        this.valueMacroStack = [];
        this.propertyMacroStack = [];
        this.scopeStack = [];
        this.filters = 0;
        this.property = null;
        this.isMetaProperty = false;
    }
    Options.prototype.getGlobalScope = function () {
        return this.scopeStack[0];
    };
    Options.prototype.getScope = function () {
        return this.scopeStack[this.scopeStack.length - 1];
    };
    Options.prototype.pushFilter = function () {
        this.filters++;
    };
    Options.prototype.popFilter = function () {
        --this.filters;
    };
    Options.prototype.isFilter = function () {
        return this.filters > 0;
    };
    return Options;
})();
module.exports = Options;
//# sourceMappingURL=Options.js.map