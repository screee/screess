var MBGLStyleSpec = require('mapbox-gl-style-spec');
import PropertyType = require('./PropertyType');
import assert = require('assert');

function getPropertyType(version: number, name: string): PropertyType {
  if (name == 'scree-test-paint') return PropertyType.PAINT;
  else if (name == 'scree-test-layout') return PropertyType.LAYOUT;
  else if (name == 'scree-test-meta') return PropertyType.META;
  else {
    var spec = MBGLStyleSpec["v" + version];

    for (var i in spec["layout"]) {
      for (var name_ in spec[spec["layout"][i]]) {
        if (name == name_) return PropertyType.LAYOUT;
      }
    }

    for (var i in spec["paint"]) {
      for (var name_ in spec[spec["paint"][i]]) {
        if (name == name_) return PropertyType.PAINT;
      }
    }

    assert(spec["layer"][name]);
    return PropertyType.META;
  }
}

export = getPropertyType