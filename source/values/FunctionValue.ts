import Value = require("./Value");
import Stack = require("../Stack")
import _ = require("../utilities");

class FunctionValue extends Value {
  constructor(public base:number, public stops:[number, number][]) { super(); }

  evaluate(stack:Stack):any {
    var stops = _.map(this.stops, (stop:[number, number]) => {
      return [stop[0], Value.evaluate(stop[1], stack)]
    });

    if (this.base) {
      return {base: Value.evaluate(this.base, stack), stops: stops}
    } else {
      return {stops: stops}
    }
  }
}

export = FunctionValue;