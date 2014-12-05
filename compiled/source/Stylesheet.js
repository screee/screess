var Scope = require('./scopes/Scope');
var _ = require('./utilities');
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
    return Stylesheet;
})();
module.exports = Stylesheet;
//# sourceMappingURL=Stylesheet.js.map