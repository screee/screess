import Value = require("./Value");
import Stack = require("../Stack")
import _ = require("../utilities");
import assert = require("assert");
import Arguments = require("../Arguments");

class FunctionValue extends Value {

  static fromArguments(args:Arguments):FunctionValue {
    var stops = [];

    for (var key in args) {
      if (key == "base") continue;
      var stop = parseInt(key);
      assert(stop != NaN, "Malformed stop value");
      stops.push([stop, args[key]]);
    }

    assert(stops.length > 0, "Function has no stops");

    return new FunctionValue(args["base"], stops);
  }

  constructor(public base:number, public stops:[number, number][]) { super(); }

  evaluate():any {
    if (this.base) {
      return {base: Value.evaluate(this.base), stops: this.stops}
    } else {
      return {stops: this.stops}
    }
  }
}

export = FunctionValue;
