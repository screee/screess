import underscore = require("underscore");

import color = require("./utilities/color");
var colorAny:any = new color.Utilities()
underscore.mixin(colorAny);

import main = require('./utilities/main');
var mainAny:any = new main.Utilities()
underscore.mixin(mainAny);

import object = require('./utilities/object');
var objectAny:any = new object.Utilities()
underscore.mixin(objectAny);

interface Utilities extends
  UnderscoreStatic,
  color.Utilities,
  main.Utilities,
  object.Utilities {}

var underscoreAny:any = underscore;
var utilities:Utilities = underscoreAny;
export = utilities;