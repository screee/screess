import Expression = require("./Expression");
import util = require('util');
import Scope = require("../scopes/Scope");
import MacroArgValues = require('../macros/MacroArgValues');
import Options = require("../Options");
var _ = require("../utilities");

class ValueMacroReferenceExpression extends Expression {

  // TODO add type to argumentExpressions
  constructor(public name:string, public argumentExpressions) {
    super()
  }

  toValues(scope:Scope, options:Options):any[] {
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
