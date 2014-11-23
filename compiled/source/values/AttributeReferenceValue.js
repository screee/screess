var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Value = require("./Value");
var AttributeReferenceValue = (function (_super) {
    __extends(AttributeReferenceValue, _super);
    function AttributeReferenceValue(name) {
        _super.call(this);
        this.name = name;
    }
    AttributeReferenceValue.prototype.evaluate = function (options) {
        return "{" + this.name + "}";
    };
    return AttributeReferenceValue;
})(Value);
module.exports = AttributeReferenceValue;
//# sourceMappingURL=AttributeReferenceValue.js.map