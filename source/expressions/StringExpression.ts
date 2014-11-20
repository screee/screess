import Expression = require("./Expression");
var parse = require("../parser").parse;

class StringExpression extends Expression {

  constructor(public body) { super() }

  toValues(scope, options) {
    var output = this.body;
    var match;
    while (match = (/#\{(.*)\}/).exec(output)) {
      var value = parse(match[1], {startRule: 'valueExpression'}).toMGLValue(scope, options)

      var matchStart = match.index
      var matchEnd = match.index + match[0].length

      output = output.substr(0, matchStart) + value.toString() + output.substr(matchEnd)
    }
    return [output];
  }

}

export = StringExpression;