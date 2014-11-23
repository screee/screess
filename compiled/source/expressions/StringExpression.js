var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Expression = require("./Expression");
var parse = require("../parser").parse;
var StringExpression = (function (_super) {
    __extends(StringExpression, _super);
    function StringExpression(body) {
        _super.call(this);
        this.body = body;
    }
    StringExpression.prototype.toValues = function (scope, options) {
        var output = this.body;
        var match;
        while (match = (/#\{(.*)\}/).exec(output)) {
            var expression = parse(match[1], { startRule: 'valueExpression' });
            var value = expression.evaluate(scope, options);
            var matchStart = match.index;
            var matchEnd = match.index + match[0].length;
            output = output.substr(0, matchStart) + value.toString() + output.substr(matchEnd);
        }
        return [output];
    };
    return StringExpression;
})(Expression);
module.exports = StringExpression;
//# sourceMappingURL=StringExpression.js.map