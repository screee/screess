import Value = require("./Value");
import Options = require("../Options")
import _ = require("../utilities");

class FunctionValue extends Value {
  constructor(public base:number, public stops:[number, number][]) { super(); }

  evaluateValue(options:Options):any {
    var stops = _.map(this.stops, (stop) => { return [stop[0], Value.evaluateValue(stop[1], options)] });

    if (this.base) {
      return {base: Value.evaluateValue(this.base, options), stops: stops}
    } else {
      return {stops: stops}
    }
  }
}

export = FunctionValue;