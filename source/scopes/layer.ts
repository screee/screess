import Stack = require('../Stack');
import Scope = require('../Scope');
import _ = require('../utilities');
import Value = require('../values/Value');
import assert = require('assert');
var MBGLStyleSpec = require('mapbox-gl-style-spec');

function evaluateLayerScope(stack:Stack, properties:{}, layers:Scope[], _classes:Scope[]):any {
  var metaProperties = { 'z-index': 0 };
  var paintProperties = {};
  var layoutProperties = {};
  var source = {};

  var type = properties['type'] || 'raster';

  for (var name in properties) {
    var value = Value.evaluate(properties[name]);

    if (name == 'z-index') {
      metaProperties['z-index'] = value;

    } else if (name == "source-tile-size") {
      source["tileSize"] = value;

    } else if (_.startsWith(name, "source-") && name != "source-layer") {
      source[name.substr("source-".length)] = value;

    } else if (getPropertyType(name) == PropertyType.PAINT) {
      paintProperties[name] = value;

    } else if (getPropertyType(name) == PropertyType.LAYOUT) {
      layoutProperties[name] = value;

    } else if (getPropertyType(name) == PropertyType.META) {
      metaProperties[name] = value;

    } else {
      assert(false, "Property name '" + name + "' is unknown");
    }
  }

  if (!_.isEmpty(source)) {
    metaProperties["source"] = stack.getGlobalScope().addSource(source);
  }

  if (layers.length) {
    if (metaProperties['type']) {
      assert.equal(metaProperties['type'], 'raster');
    } else {
      metaProperties['type'] = 'raster';
    }
  } else {
    layers = undefined;
  }

  var classes = _.objectMap(_classes, (scope) => {
    return ["paint." + scope.name, scope]
  });

  return _.extend(
    {
      id: this.name || _.uniqueId('scope'),
      layers: layers,
      paint: paintProperties,
      layout: layoutProperties
    },
    metaProperties,
    classes
  );
}

enum PropertyType { PAINT, LAYOUT, META }

function getPropertyType(name: string): PropertyType {
  if (name == 'scree-test-paint') return PropertyType.PAINT;
  else if (name == 'scree-test-layout') return PropertyType.LAYOUT;
  else if (name == 'scree-test-meta') return PropertyType.META;
  else {
    var spec = MBGLStyleSpec.latest;

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


export = evaluateLayerScope;
