import Scope = require("./Scope");
import Options = require('../Options');
var _ = require("../utilities");

class ClassScope extends Scope {

  toMGLClassScope(options:Options):any {
    options.scopeStack.push(this);
    this.toMGLProperties(options, this.properties);
    options.scopeStack.pop();
  }
}

export = ClassScope;