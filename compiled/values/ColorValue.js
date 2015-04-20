var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Value = require("./Value");
var _ = require('../utilities');
var ColorValue = (function (_super) {
    __extends(ColorValue, _super);
    function ColorValue(red, green, blue, alpha) {
        _super.call(this);
        this.red = red;
        this.green = green;
        this.blue = blue;
        this.alpha = alpha;
        var hsv = _.rgb2hsv(red, green, blue);
        var hsl = _.rgb2hsv(red, green, blue);
        this.hue = hsv[0];
        this.saturation = hsv[1];
        this.value = hsv[2];
        this.lightness = hsl[2];
    }
    ColorValue.hex = function (hex) {
        var rgb = _.hex2rgb(hex);
        return new ColorValue(rgb[0], rgb[1], rgb[2], 1);
    };
    ColorValue.hsva = function (hue, saturation, value, alpha) {
        var rgb = _.hsv2rgb(hue, saturation, value);
        return new ColorValue(rgb[0], rgb[1], rgb[2], alpha);
    };
    ColorValue.hsla = function (hue, saturation, lightness, alpha) {
        var rgb = _.hsl2rgb(hue, saturation, lightness);
        return new ColorValue(rgb[0], rgb[1], rgb[2], alpha);
    };
    ColorValue.rgba = function (red, green, blue, alpha) {
        return new ColorValue(red, green, blue, alpha);
    };
    ColorValue.prototype.evaluate = function () {
        if (this.alpha != 1) {
            return "rgba(" + this.red + ", " + this.green + ", " + this.blue + ", " + this.alpha + ")";
        }
        else {
            return _.rgb2hex(this.red, this.green, this.blue);
        }
    };
    return ColorValue;
})(Value);
module.exports = ColorValue;
//# sourceMappingURL=ColorValue.js.map