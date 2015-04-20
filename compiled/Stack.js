var Stack = (function () {
    // TODO create as immutable linked list
    function Stack() {
        this.valueMacro = [];
        this.propertyMacro = [];
        this.scope = [];
    }
    Stack.prototype.getGlobalScope = function () {
        return this.scope[0];
    };
    Stack.prototype.getScope = function () {
        return this.scope[this.scope.length - 1];
    };
    return Stack;
})();
module.exports = Stack;
//# sourceMappingURL=Stack.js.map