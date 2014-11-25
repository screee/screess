import Scope = require("./Scope");
import Context = require('../Context');
import _ = require("../utilities");

class ClassScope extends Scope {

  evaluateClassScope(context:Context):any {
    context.scopeStack.push(this);
    this.evaluateProperties(context, this.properties);
    context.scopeStack.pop();
  }
}

export = ClassScope;