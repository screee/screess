import _ = require("../utilities");
import assert = require("assert");
import Expression = require("./Expression");
import Scope = require("../Scope");
import Stack = require("../Stack");
import eval = require("../eval");
import SourceLocation = require("../SourceLocation");

var parse = require("../parser").parse;

class JavascriptExpression extends Expression {

  constructor(public source:string, location:SourceLocation) {
    super(location)
  }

  evaluateToIntermediate(scope: Scope, stack: Stack):any {
    return eval(this.source, scope, stack);
  }

}

export = JavascriptExpression;
