import Expression = require("./Expression");
import ExpressionSet = require("../ExpressionSet");
import LiteralExpression = require("./LiteralExpression");
import Scope = require("../Scope");
import Stack = require("../Stack");
import assert = require("assert");
import _ = require("../utilities");
import ScopeValue = require('../values/ScopeValue');
import SourceLocation = require("../SourceLocation");

class ScopeExpression extends Expression {

  constructor(public body:Scope, location:SourceLocation) {
    super(location);
  }

  evaluateToIntermediate(scope:Scope, stack:Stack):any {
    return new ScopeValue(this.body);
  }

}

export = ScopeExpression;
