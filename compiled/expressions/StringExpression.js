var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Expression = require("./Expression");
var _ = require("../utilities");
var parse = require("../parser").parse;
var assert = require("assert");
var StringExpression = (function (_super) {
    __extends(StringExpression, _super);
    function StringExpression(body) {
        _super.call(this);
        this.body = body;
    }
    StringExpression.prototype.evaluateToIntermediate = function (scope, stack) {
        function parseExpression(input) {
            return parse(input, { startRule: 'expression' });
        }
        var input = this.body;
        var output = '';
        var skip = false;
        for (var i = 0; i < input.length; i++) {
            if (!skip && input[i] == '\\') {
                skip = true;
                continue;
            }
            else if (!skip && input[i] == '{') {
                var expression = '';
                while (input[i + 1] != '}') {
                    assert(i < input.length);
                    expression += input[++i];
                }
                output += parseExpression(expression).evaluate(scope, stack).toString();
                i++; // Skip the closing '}'
            }
            else if (!skip && input[i] == '@') {
                var expression = '@';
                while (i + 1 < input.length && !_.isWhitespace(input[i + 1])) {
                    expression += input[++i];
                }
                assert(expression.length > 1);
                output += parseExpression(expression).evaluate(scope, stack).toString();
            }
            else {
                output += input[i];
                skip = false;
            }
        }
        return output;
    };
    return StringExpression;
})(Expression);
module.exports = StringExpression;
//# sourceMappingURL=StringExpression.js.map