import Expression = require("./Expression");
import ExpressionSet = require("../ExpressionSet");
import util = require('util');
import Scope = require("../Scope");
import Arguments = require('../Arguments');
import Stack = require("../Stack");
import _ = require("../utilities");
import assert = require("assert");
import SourceLocation = require("../SourceLocation");

class MacroReferenceExpression extends Expression {

  constructor(public name:string, public argExpressions:ExpressionSet, location:SourceLocation) {
    super(location);
  }

  evaluateToIntermediate(argsScope:Scope, stack:Stack):any {
    assert(argsScope instanceof Scope);
    var args = this.argExpressions.toArguments(argsScope, stack);

    var macro = argsScope.getMacro(this.name, args, stack);
    if (!macro) { throw new Error("Could not find macro " + this.name); }

    return macro.evaluateToIntermediate(args, stack);
  }
}

export = MacroReferenceExpression;
