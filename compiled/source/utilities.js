var underscore = require("underscore");
var color = require("./utilities/color");
var colorAny = new color.Utilities();
underscore.mixin(colorAny);
var main = require('./utilities/main');
var mainAny = new main.Utilities();
underscore.mixin(mainAny);
var object = require('./utilities/object');
var objectAny = new object.Utilities();
underscore.mixin(objectAny);
var underscoreAny = underscore;
var utilities = underscoreAny;
module.exports = utilities;
//# sourceMappingURL=utilities.js.map