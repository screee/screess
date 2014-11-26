import Scope = require("./Scope");
import Stack = require('../Stack');
import _ = require("../utilities");

class ClassScope extends Scope {

  evaluateClassScope(stack:Stack):any {
    stack.scope.push(this);
    this.evaluateProperties(stack, this.properties);
    stack.scope.pop();
  }
}

export = ClassScope;