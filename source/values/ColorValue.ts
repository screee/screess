import Value = require("./Value");
var _ = require('../utilities');
import assert = require("assert");

class ColorValue extends Value {

  static hex(hex) {
    var rgb = _.hex2rgb(hex)
    return new ColorValue(rgb[0], rgb[1], rgb[2], 1)
  }

  static hsva(hue, saturation, value, alpha) {
    var rgb = _.hsv2rgb(hue, saturation, value)
    return new ColorValue(rgb[0], rgb[1], rgb[2], alpha)
  }

  static hsla(hue, saturation, lightness, alpha) {
    var rgb = _.hsl2rgb(hue, saturation, lightness)
    return new ColorValue(rgb[0], rgb[1], rgb[2], alpha)
  }

  static rgba(red, green, blue, alpha) {
    return new ColorValue(red, green, blue, alpha)
  }

  constructor(public red, public green, public blue, public alpha) { super(); }

  toMGLValue(options) {
    return "rgba(" + this.red + ", " + this.green + ", " + this.blue + ", " + this.alpha + ")";
  }
}

export = ColorValue