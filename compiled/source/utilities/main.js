var _ = require('underscore');
var Utilities = (function () {
    function Utilities() {
    }
    Utilities.prototype.cast = function (input) {
        var intermediate = input;
        var output = intermediate;
        return output;
    };
    Utilities.prototype.objectMapValues = function (input, iterator, context) {
        return this.objectMap(input, function (value, key) {
            return [key, iterator(value, key)];
        });
    };
    Utilities.prototype.objectMapKeys = function (input, iterator, context) {
        if (context === void 0) { context = {}; }
        return this.objectMap(input, function (value, key) {
            return [iterator(value, key), value];
        }, context);
    };
    Utilities.prototype.objectMap = function (input, iterator, context) {
        if (context === void 0) { context = {}; }
        var output = {};
        _.each(input, function (inputValue, inputKey) {
            var tuple = iterator(inputValue, inputKey);
            var outputKey = tuple[0];
            var outputValue = tuple[1];
            output[outputKey] = outputValue;
        });
        return output;
    };
    Utilities.prototype.objectZip = function (keys, values) {
        var output = {};
        for (var i = 0; i < keys.length; i++) {
            output[keys[i]] = values[i];
        }
        return output;
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
    return Utilities;
})();
exports.Utilities = Utilities;
//# sourceMappingURL=main.js.map