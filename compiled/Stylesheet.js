var Scope = require('./Scope');
var _ = require('./utilities');
// TODO don't return this from the parser?
var Stylesheet = (function () {
    function Stylesheet() {
        this.sources = {};
        this.scope = Scope.createGlobal();
    }
    // TODO make Source class
    Stylesheet.prototype.addSource = function (source) {
        var hash = _.hash(JSON.stringify(source)).toString();
        this.sources[hash] = source;
        return hash;
    };
    Stylesheet.prototype.evaluate = function () {
        return this.scope.evaluate(0 /* GLOBAL */);
    };
    return Stylesheet;
})();
module.exports = Stylesheet;
//# sourceMappingURL=Stylesheet.js.map