class Options {

  getGlobalScope() { return this.scopeStack[0] }
  getScope() { return this.scopeStack[this.scopeStack.length - 1] }

  pushFilter() { this.filters++ }
  popFilter() { --this.filters }
  isFilter() { return this.filters > 0 }

  public valueMacroStack;
  public propertyMacroStack;
  public scopeStack;
  public filters;
  public property;
  public isMetaProperty;

  constructor() {
    this.valueMacroStack = []
    this.propertyMacroStack = []
    this.scopeStack = []
    this.filters = 0
    this.property = null
    this.isMetaProperty = false
  }

}

export = Options