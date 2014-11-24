var _ = require('underscore');
var Utilities = (function () {
    function Utilities() {
    }
    Utilities.prototype.objectMapValues = function (input, iterator, context) {
        if (context === void 0) { context = {}; }
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
    Utilities.prototype.objectFilter = function (input, iterator) {
        var output = {};
        _.each(input, function (value, key) {
            if (iterator(value, key)) {
                output[key] = value;
            }
        });
        return output;
    };
    Utilities.prototype.objectCompact = function (input) {
        return this.objectFilter(input, function (value) {
            return !!value;
        });
    };
    return Utilities;
})();
exports.Utilities = Utilities;
//# sourceMappingURL=object.js.map