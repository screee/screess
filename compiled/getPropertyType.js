var MBGLStyleSpec = require('mapbox-gl-style-spec');
var PropertyType = require('./PropertyType');
var assert = require('assert');
function getPropertyType(version, name) {
    if (name == 'scree-test-paint')
        return 0 /* PAINT */;
    else if (name == 'scree-test-layout')
        return 1 /* LAYOUT */;
    else if (name == 'scree-test-meta')
        return 2 /* META */;
    else {
        var spec = MBGLStyleSpec["v" + version];
        for (var i in spec["layout"]) {
            for (var name_ in spec[spec["layout"][i]]) {
                if (name == name_)
                    return 1 /* LAYOUT */;
            }
        }
        for (var i in spec["paint"]) {
            for (var name_ in spec[spec["paint"][i]]) {
                if (name == name_)
                    return 0 /* PAINT */;
            }
        }
        assert(spec["layer"][name]);
        return 2 /* META */;
    }
}
module.exports = getPropertyType;
//# sourceMappingURL=getPropertyType.js.map