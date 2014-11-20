import Value = require("./Value");
var _ = require("../utilities");

class FunctionValue extends Value {
  constructor(public base, public stops) { super(); }

  toMGLValue(options) {
    var stops = _.map(this.stops, (stop) => { return [stop[0], Value.toMGLValue(stop[1], options)] });

    if (this.base) {
      return {base: Value.toMGLValue(this.base, options), stops: stops}
    } else {
      return {stops: stops}
    }
  }
}

export = FunctionValue;