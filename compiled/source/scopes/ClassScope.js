var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Scope = require("./Scope");
var ClassScope = (function (_super) {
    __extends(ClassScope, _super);
    function ClassScope() {
        _super.apply(this, arguments);
    }
    ClassScope.prototype.evaluateClassScope = function (stack) {
        stack.scopeStack.push(this);
        this.evaluateProperties(stack, this.properties);
        stack.scopeStack.pop();
    };
    return ClassScope;
})(Scope);
module.exports = ClassScope;
//# sourceMappingURL=ClassScope.js.map