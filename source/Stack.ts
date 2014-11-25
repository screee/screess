class Stack {

  getGlobalScope() { return this.scopeStack[0] }
  getScope() { return this.scopeStack[this.scopeStack.length - 1] }

  // TODO drop Stack suffix
  public valueMacroStack;
  public propertyMacroStack;
  public scopeStack;

  constructor() {
    this.valueMacroStack = []
    this.propertyMacroStack = []
    this.scopeStack = []
  }

}

export = Stack