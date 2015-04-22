/// <reference path="../definitions/index.d.ts" />

import Scope = require('./Scope');
import _ = require('./utilities');

// TODO don't return this from the parser?
class Stylesheet {

  public sources:{[name:string]: any};
  public scope:Scope;

  constructor() {
    this.sources = {};
    this.scope = Scope.createGlobal();
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