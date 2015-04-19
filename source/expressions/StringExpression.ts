import Expression = require("./Expression");
import Scope = require("../Scope");
import Stack = require("../Stack");
import _ = require("../utilities");
var parse = require("../parser").parse;
var assert = require("assert");

class StringExpression extends Expression {

  constructor(public body:string) { super() }

  evaluateToIntermediates(scope:Scope, stack:Stack):any[] {

    function parseExpression(input:string):Expression {
      return parse(input, { startRule: 'expression' });
    }

    var input = this.body;
    var output = '';
    var skip = false;

    for (var i = 0; i < input.length; i++) {

      if (!skip && input[i] == '\\') {
        skip = true;
        continue;

      } else if (!skip && input[i] == '{') {
        var expression = '';
        while (input[i + 1] != '}') {
          assert(i < input.length); // TODO throw string interpolation exception
          expression += input[++i];
        }
        output += parseExpression(expression).evaluate(scope, stack).toString();
        i++ // Skip the closing '}'

      } else if (!skip && input[i] == '@') {
          var expression = '@';
          while (i + 1 < input.length && !_.isWhitespace(input[i + 1])) {
            expression += input[++i];
          }
          assert(expression.length > 1);
          output += parseExpression(expression).evaluate(scope, stack).toString();

      } else {
          output += input[i];
          skip = false;
      }

    }

    return [output];
  }
}

export = StringExpression;