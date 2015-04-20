import Expression = require("./Expression");
import util = require('util');
import Scope = require("../Scope");
import ValueSet = require('../ValueSet');
import Stack = require("../Stack");
import _ = require("../utilities");

interface ArgumentExpression {
  name?: string;
  expression: Expression;
}

class ValueMacroReferenceExpression extends Expression {

  // TODO add type to argumentExpressions
  constructor(public name:string, public argumentExpressions:ArgumentExpression[]) {
    super()
  }

  evaluateToIntermediate(scope:Scope, stack:Stack):any {
    var argValues = new ValueSet(this.argumentExpressions, scope, stack);

    var macro = scope.getValueMacro(this.name, argValues, stack);
    if (!macro) {
      throw new Error("Could not find value macro " + this.name);
    }

    return macro.evaluateToIntermediate(argValues, stack);
  }
}

export = ValueMacroReferenceExpression;
