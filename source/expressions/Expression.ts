import Value = require('../values/Value');
import SourceLocation = require('../SourceLocation');
import assert = require('assert');

class Expression {

  constructor(public location:SourceLocation) {
    assert(this.location);
  }

  evaluateToIntermediate(scope, stack):any {
    throw new Error("Abstract method");
  }

  evaluate(scope, stack):any {
    return Value.evaluate(this.evaluateToIntermediate(scope, stack));
  }

}

export = Expression
