import Expression = require("./Expression");
import assert = require("assert");
import AttributeReferenceValue = require("../values/AttributeReferenceValue");
import Value = require('../values/Value');
import Scope = require("../scopes/Scope");
import Stack = require("../Stack");
import _ = require("../utilities");

class SetOperatorExpression extends Expression {

  constructor(public left:Expression, public operator:string, public right:Expression) { super() }

  evaluate(scope:Scope, stack:Stack):any[] {
    var lvalue = this.left.toValue(scope, stack);
    // TODO allow for multiple rvalues
    var rvalue = this.right.toValue(scope, stack);

    assert(lvalue instanceof AttributeReferenceValue);
    assert(rvalue instanceof Array);

    return [this.operator, lvalue.name].concat(Value.evaluate(rvalue, stack))
  }

}

export = SetOperatorExpression;