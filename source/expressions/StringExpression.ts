import Expression = require("./Expression");
import Scope = require("../Scope");
import Stack = require("../Stack");
var parse = require("../parser").parse;

class StringExpression extends Expression {

  constructor(public body:string) { super() }

  evaluateToIntermediates(scope:Scope, stack:Stack):any[] {
    var output = this.body;
    var match;

    while (match = (/#\{(.*)\}/).exec(output)) {
      var expression = parse(match[1], {startRule: 'valueExpression'});
      var value = expression.evaluate(scope, stack);

      var matchStart = match.index
      var matchEnd = match.index + match[0].length

      output =
        output.substr(0, matchStart) +
        value.toString() +
        output.substr(matchEnd);
    }

    while (match = (/(@[a-zA-Z_-]+)/).exec(output)) {
      var expression = parse(match[1], {startRule: 'valueExpression'});
      var value = expression.evaluate(scope, stack);

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