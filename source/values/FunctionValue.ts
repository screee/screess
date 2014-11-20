import Value = require("./Value");
import Options = require("../Options")
var _ = require("../utilities");

class FunctionValue extends Value {
  constructor(public base:number, public stops:[number, number][]) { super(); }

  toMGLValue(options:Options):any {
    var stops = _.map(this.stops, (stop) => { return [stop[0], Value.toMGLValue(stop[1], options)] });

    if (this.base) {
      return {base: Value.toMGLValue(this.base, options), stops: stops}
    } else {
      return {stops: stops}
    }
  }
}

export = FunctionValue;