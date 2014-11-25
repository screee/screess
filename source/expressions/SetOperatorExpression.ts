import Expression = require("./Expression");
import assert = require("assert");
import AttributeReferenceValue = require("../values/AttributeReferenceValue");
import Value = require('../values/Value');
import Scope = require("../scopes/Scope");
import Context = require("../Context");
import _ = require("../utilities");

class SetOperatorExpression extends Expression {

  constructor(public left:Expression, public operator:string, public right:Expression) { super() }

  evaluateFilter(scope:Scope, context:Context):any[] {
    var lvalue = this.left.toValue(scope, context);
    // TODO allow for multiple rvalues
    var rvalue = this.right.toValue(scope, context);

    assert(lvalue instanceof AttributeReferenceValue);
    assert(rvalue instanceof Array);

    return [this.operator, lvalue.name].concat(Value.evaluate(rvalue, context))
  }

}

export = SetOperatorExpression;