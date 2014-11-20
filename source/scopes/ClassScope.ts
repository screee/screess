import Scope = require("./Scope");
var _ = require("../utilities");

class ClassScope extends Scope {

  toMGLClassScope(options) {
    options.scopeStack.push(this);
    this.toMGLProperties(options, this.properties);
    options.scopeStack.pop();
  }
}

export = ClassScope;