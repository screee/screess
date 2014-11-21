var underscore = require("underscore");
var utilitiesColor = require("./utilitiesColor");
var intermediate = underscore;
var utilities = intermediate;
utilities.mixin(utilitiesColor);
utilities.mixin({
    cast: function (input) {
        var intermediate = input;
        var output = intermediate;
        return output;
    },
    objectMapValues: function (input, iterator, context) {
        if (context === void 0) { context = null; }
        return this.objectMap(input, function (value, key) {
            return [key, iterator(value, key)];
        });
    },
    objectMapKeys: function (input, iterator, context) {
        if (context === void 0) { context = null; }
        return this.objectMap(input, function (value, key) {
            return [iterator(value, key), value];
        }, context);
    },
    objectMap: function (input, iterator) {
        var output = {};
        this.each(input, function (inputValue, inputKey) {
            var tuple = iterator(inputValue, inputKey);
            var outputKey = tuple[0];
            var outputValue = tuple[1];
            output[outputKey] = outputValue;
        });
        return output;
    },
    objectZip: function (keys, values) {
        var output = {};
        for (var i = 0; i < keys.length; i++) {
            output[keys[i]] = values[i];
        }
        return output;
    },
    none: function (list, iterator, scope) {
        if (iterator === void 0) { iterator = null; }
        if (scope === void 0) { scope = null; }
        return !this.some(list, iterator, scope);
    },
    count: function (input, iterator) {
        var _this = this;
        if (iterator === void 0) { iterator = this.identity; }
        var count = 0;
        this.each(input, function () {
            if (iterator.apply(_this, arguments)) {
                count++;
            }
        });
        return count;
    }
});
module.exports = utilities;
//# sourceMappingURL=utilities.js.map