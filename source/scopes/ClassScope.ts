import Scope = require("./Scope");
import Options = require('../Options');
import _ = require("../utilities");

class ClassScope extends Scope {

  evaluateClassScope(options:Options):any {
    options.scopeStack.push(this);
    this.evaluateProperties(options, this.properties);
    options.scopeStack.pop();
  }
}

export = ClassScope;