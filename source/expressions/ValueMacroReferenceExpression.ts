import Expression = require("./Expression");
import util = require('util');
import Scope = require("../scopes/Scope");
import MacroArgValues = require('../macros/MacroArgValues');
import Stack = require("../Stack");
import _ = require("../utilities");

class ValueMacroReferenceExpression extends Expression {

  // TODO add type to argumentExpressions
  constructor(public name:string, public argumentExpressions) {
    super()
  }

  toValues(scope:Scope, stack:Stack):any[] {
    var argValues = MacroArgValues.createFromExpressions(
      this.argumentExpressions,
      scope,
      stack
    );

    var macro = scope.getValueMacro(this.name, argValues, stack);
    if (!macro ) {
      throw new Error("Could not find value macro '#{this.name}'");
    }

    return macro.toValues(argValues, stack);
  }
}

export = ValueMacroReferenceExpression;
