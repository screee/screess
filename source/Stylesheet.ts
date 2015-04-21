import Scope = require('./Scope');
import _ = require('./utilities');

// TODO deprecate this class altogether, just have a global scope?
class Stylesheet {

  public sources:{[name:string]: any};
  public scope:Scope;

  constructor() {
    this.sources = {};
    this.scope = new Scope(this, null);
  }

  // TODO make Source class
  addSource(source:{}):string {
    var hash = _.hash(JSON.stringify(source)).toString();
    this.sources[hash] = source;
    return hash;
  }

  evaluate():any {
    return this.scope.evaluate(Scope.Type.GLOBAL)
  }

}

export = Stylesheet