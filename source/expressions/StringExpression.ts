import Expression = require("./Expression");
import Scope = require("../scopes/Scope");
import Context = require("../Context");
var parse = require("../parser").parse;

class StringExpression extends Expression {

  constructor(public body:string) { super() }

  toValues(scope:Scope, context:Context):any[] {
    var output = this.body;
    var match;

    while (match = (/#\{(.*)\}/).exec(output)) {
      var expression = parse(match[1], {startRule: 'valueExpression'});
      var value = expression.evaluate(scope, context);

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