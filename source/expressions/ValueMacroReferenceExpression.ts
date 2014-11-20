import Expression = require("./Expression");
var literal = require("./LiteralExpression").literal;
var util = require('util');
var _ = require("../utilities");
var Scope = require("../scopes/Scope");
var MacroArgValues = require('../macros/MacroArgValues');

class ValueMacroReferenceExpression extends Expression {

  constructor(public name, public argumentExpressions) { super() }

  toValues(scope, options):any[] {
    var argValues = MacroArgValues.createFromExpressions(
      this.argumentExpressions,
      scope,
      options
    );

    var macro;
    if (macro = scope.getValueMacro(this.name, argValues, options)) {
      return macro.toValues(argValues, options);
    } else {
      throw new Error("Could not find value macro '#{this.name}'");
    }
  }
}

export = ValueMacroReferenceExpression;
