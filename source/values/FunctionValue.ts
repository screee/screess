import Value = require("./Value");
import Context = require("../Context")
import _ = require("../utilities");

class FunctionValue extends Value {
  constructor(public base:number, public stops:[number, number][]) { super(); }

  evaluate(context:Context):any {
    var stops = _.map(this.stops, (stop) => { return [stop[0], Value.evaluate(stop[1], context)] });

    if (this.base) {
      return {base: Value.evaluate(this.base, context), stops: stops}
    } else {
      return {stops: stops}
    }
  }
}

export = FunctionValue;