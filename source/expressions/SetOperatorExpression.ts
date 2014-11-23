import Expression = require("./Expression");
import assert = require("assert");
import AttributeReferenceValue = require("../values/AttributeReferenceValue");
import Value = require('../values/Value');
import Scope = require("../scopes/Scope");
import Options = require("../Options");
import _ = require("../utilities");

class SetOperatorExpression extends Expression {

  constructor(public left:Expression, public operator:string, public right:Expression) { super() }

  evaluateFilter(scope:Scope, options:Options):any[] {
    var lvalue = this.left.toValue(scope, options);
    // TODO allow for multiple rvalues
    var rvalue = this.right.toValue(scope, options);

    assert(lvalue instanceof AttributeReferenceValue);
    assert(rvalue instanceof Array);

    return [this.operator, lvalue.name].concat(Value.evaluate(rvalue, options))
  }

}

export = SetOperatorExpression;