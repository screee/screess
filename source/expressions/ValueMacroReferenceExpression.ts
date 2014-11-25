import Expression = require("./Expression");
import util = require('util');
import Scope = require("../scopes/Scope");
import MacroArgValues = require('../macros/MacroArgValues');
import Context = require("../Context");
import _ = require("../utilities");

class ValueMacroReferenceExpression extends Expression {

  // TODO add type to argumentExpressions
  constructor(public name:string, public argumentExpressions) {
    super()
  }

  toValues(scope:Scope, context:Context):any[] {
    var argValues = MacroArgValues.createFromExpressions(
      this.argumentExpressions,
      scope,
      context
    );

    var macro = scope.getValueMacro(this.name, argValues, context);
    if (!macro ) {
      throw new Error("Could not find value macro '#{this.name}'");
    }

    return macro.toValues(argValues, context);
  }
}

export = ValueMacroReferenceExpression;
