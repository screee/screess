var Scope = require('./Scope');
var _ = require('./utilities');
// TODO deprecate this class altogether, just have a global scope?
var Stylesheet = (function () {
    function Stylesheet() {
        this.sources = {};
        this.scope = new Scope(this, null);
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