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
    Utilities.prototype.none = function (list, iterator, stack) {
        if (iterator === void 0) { iterator = _.identity; }
        if (stack === void 0) { stack = {}; }
        return !_.some(list, iterator, stack);
    };
    Utilities.prototype.count = function (list, iterator, stack) {
        if (iterator === void 0) { iterator = _.identity; }
        if (stack === void 0) { stack = {}; }
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
    Utilities.prototype.startsWith = function (value, prefix) {
        return value.slice(0, prefix.length) == prefix;
    };
    Utilities.prototype.isCollection = function (value) {
        return _.isArray(value) || _.isObject(value);
    };
    Utilities.prototype.deepExtend = function (target, source) {
        for (var prop in source)
            if (prop in target && _.isObject(target[prop]) && _.isObject(source[prop])) {
                this.deepExtend(target[prop], source[prop]);
            }
            else if (prop in target && _.isArray(target[prop]) && _.isArray(source[prop])) {
                target[prop] = target[prop].concat(source[prop]);
            }
            else {
                target[prop] = source[prop];
            }
        return target;
    };
    return Utilities;
})();
exports.Utilities = Utilities;
//# sourceMappingURL=main.js.map