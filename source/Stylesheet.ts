import Scope = require('./Scope');
import _ = require('./utilities');

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

}

export = Stylesheet