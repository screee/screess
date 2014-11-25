var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ValueStack = require('./ValueStack');
var PropertyValueStack = (function (_super) {
    __extends(PropertyValueStack, _super);
    function PropertyValueStack(meta, property, parent) {
        _super.call(this, parent);
        this.meta = meta;
        this.property = property;
    }
    return PropertyValueStack;
})(ValueStack);
module.exports = PropertyValueStack;
//# sourceMappingURL=PropertyValueStack.js.map