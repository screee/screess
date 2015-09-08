import Stack = require('../Stack');
import Scope = require("../Scope");
import Statement = require("./Statement");
import assert = require("assert");
import ExpressionSet = require("../ExpressionSet");
import Value = require("../values/Value");
import ScopeValue = require("../values/ScopeValue");
import _ = require("../utilities");
import Macro = require('../Macro');
import ValueSet = require('../ValueSet');

class MacroReferenceStatement extends Statement {

  constructor(public name:string, public expressions:ExpressionSet) {
    super();
    assert(this.expressions instanceof ExpressionSet);
  }

  eachPrimitiveStatement(parentScope:Scope, stack:Stack, callback:(scope:Scope, statement:Statement) => void):void {
    assert(parentScope instanceof Scope);
    var values:ValueSet = this.expressions.toValueSet(parentScope, stack);

    var macro = parentScope.getMacro(this.name, values, stack);
    if (!macro) {
      throw new Error("Could not find macro " + this.name);
    }

    var scopeValue:ScopeValue = macro.evaluateToIntermediate(values, stack);
    assert(scopeValue instanceof ScopeValue);

    var scope:Scope = scopeValue.scope;
    assert(scope instanceof Scope);

    scope.addLiteralMacros(values.toObject(macro.argDefinition, stack));

    scope.eachPrimitiveStatement(stack, callback);
  }
}

export = MacroReferenceStatement
