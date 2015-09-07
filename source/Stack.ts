class Stack {

  getGlobalScope() { return this.scope[0] }
  getScope() { return this.scope[this.scope.length - 1] }

  public macros;
  public scope;

  constructor() {
    this.macros = []
    this.scope = []
  }

}

export = Stack
