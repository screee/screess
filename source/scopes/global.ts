import Stack = require('../Stack');
import Scope = require('../Scope');
import _ = require("../utilities");

function evaluateGlobalScope(stack:Stack, properties:{}, layers:Scope[], classes:Scope[]):any {
  var sources = this.sources;

  var transition = {
    duration: properties["transition-delay"],
    delay: properties["transition-duration"]
  }
  delete properties["transition-delay"];
  delete properties["transition-duration"];

  stack.scope.pop();

  return _.extend(
    properties,
    {
      layers: layers,
      sources: sources,
      transition: transition
    }
  )
}

export = evaluateGlobalScope;
