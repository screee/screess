import Expression = require("./Expression");
import Scope = require("../scopes/Scope");
import Options = require("../Options");
var parse = require("../parser").parse;

class StringExpression extends Expression {

  constructor(public body:string) { super() }

  toValues(scope:Scope, options:Options):any[] {
    var output = this.body;
    var match;

    while (match = (/#\{(.*)\}/).exec(output)) {
      var expression = parse(match[1], {startRule: 'valueExpression'});
      var value = expression.evaluate(scope, options);

      var matchStart = match.index
      var matchEnd = match.index + match[0].length

      output =
        output.substr(0, matchStart) +
        value.toString() +
        output.substr(matchEnd);
    }

    return [output];
  }
}

export = StringExpression;