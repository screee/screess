var _ = require('underscore');
var Utilities = (function () {
    function Utilities() {
    }
    Utilities.prototype.mapMethod = function (list, method) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        return _.map(list, function (value) { return value[method].apply(value, args); });
    };
    Utilities.prototype.none = function (list, iterator, context) {
        if (iterator === void 0) { iterator = _.identity; }
        if (context === void 0) { context = {}; }
        return !_.some(list, iterator, context);
    };
    Utilities.prototype.count = function (list, iterator, context) {
        if (iterator === void 0) { iterator = _.identity; }
        if (context === void 0) { context = {}; }
        var count = 0;
        _.each(list, function (value, key) {
            if (iterator(value, key)) {
                count++;
            }
        });
        return count;
    };
    Utilities.prototype.hash = function (value) {
        var hash = 0, i, chr, len;
        if (value.length == 0)
            return hash;
        for (i = 0, len = value.length; i < len; i++) {
            chr = value.charCodeAt(i);
            hash = ((hash << 5) - hash) + chr;
            hash |= 0; // Convert to 32bit integer
        }
        return hash;
    };
    return Utilities;
})();
exports.Utilities = Utilities;
//# sourceMappingURL=main.js.map