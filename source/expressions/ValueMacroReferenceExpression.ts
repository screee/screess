import Expression = require("./Expression");
import util = require('util');
import Scope = require("../scopes/Scope");
import MacroArgValues = require('../macros/MacroArgValues');
import Options = require("../Options");
import _ = require("../utilities");

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

    var macro = scope.getValueMacro(this.name, argValues, options);
    if (!macro ) {
      throw new Error("Could not find value macro '#{this.name}'");
    }

    return macro.toValues(argValues, options);
  }
}

export = ValueMacroReferenceExpression;
