var _ = require("../utilities");
function evaluateGlobalScope(stack, properties, layers, classes) {
    var sources = this.sources;
    var transition = {
        duration: properties["transition-delay"],
        delay: properties["transition-duration"]
    };
    delete properties["transition-delay"];
    delete properties["transition-duration"];
    stack.scope.pop();
    return _.extend(properties, {
        layers: layers,
        sources: sources,
        transition: transition
    });
}
module.exports = evaluateGlobalScope;
//# sourceMappingURL=global.js.map