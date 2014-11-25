import Scope = require("./Scope");
import Stack = require('../Stack');
import _ = require("../utilities");

class ClassScope extends Scope {

  evaluateClassScope(stack:Stack):any {
    stack.scopeStack.push(this);
    this.evaluateProperties(stack, this.properties);
    stack.scopeStack.pop();
  }
}

export = ClassScope;