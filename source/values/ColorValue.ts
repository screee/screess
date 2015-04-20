import Value = require("./Value");
import assert = require("assert");
import Stack = require('../Stack');
import _ = require('../utilities');

class ColorValue extends Value {

  static hex(hex:string):ColorValue {
    var rgb = _.hex2rgb(hex)
    return new ColorValue(rgb[0], rgb[1], rgb[2], 1)
  }

  static hsva(hue:number, saturation:number, value:number, alpha:number):ColorValue {
    var rgb = _.hsv2rgb(hue, saturation, value)
    return new ColorValue(rgb[0], rgb[1], rgb[2], alpha)
  }

  static hsla(hue:number, saturation:number, lightness:number, alpha:number):ColorValue {
    var rgb = _.hsl2rgb(hue, saturation, lightness)
    return new ColorValue(rgb[0], rgb[1], rgb[2], alpha)
  }

  static rgba(red:number, green:number, blue:number, alpha:number):ColorValue {
    return new ColorValue(red, green, blue, alpha)
  }

  public lightness:number;
  public value:number;
  public hue:number;
  public saturation:number;

  constructor(
      public red:number,
      public green:number,
      public blue:number,
      public alpha:number
  ) {
    super();

    var hsv = _.rgb2hsv(red, green, blue);
    var hsl = _.rgb2hsv(red, green, blue);

    this.hue = hsv[0];
    this.saturation = hsv[1];
    this.value = hsv[2];
    this.lightness =  hsl[2];
  }

  evaluate():string {
    if (this.alpha != 1) {
      return "rgba(" + this.red + ", " + this.green + ", " + this.blue + ", " + this.alpha + ")";
    } else {
      return _.rgb2hex(this.red, this.green, this.blue);
    }
  }
}

export = ColorValue