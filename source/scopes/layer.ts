import Stack = require('../Stack');
import Scope = require('../Scope');
import getPropertyType = require('../getPropertyType');
import _ = require('../utilities');
import Value = require('../values/Value');
import PropertyType = require('../PropertyType');
import assert = require('assert');

function evaluateLayerScope(stack:Stack, properties:{}, layers:Scope[], _classes:Scope[]):any {
  var metaProperties = { 'z-index': 0 };
  var paintProperties = {};
  var layoutProperties = {};
  var source = {};

  var type = properties['type'] || 'raster';

  var version = this.getVersion();

  for (var name in properties) {
    var value = Value.evaluate(properties[name]);

    if (name == 'z-index') {
      metaProperties['z-index'] = value;

    } else if (name == "source-tile-size") {
      source["tileSize"] = value;

    } else if (_.startsWith(name, "source-") && name != "source-layer") {
      source[name.substr("source-".length)] = value;

    } else if (getPropertyType(version, name) == PropertyType.PAINT) {
      paintProperties[name] = value;

    } else if (getPropertyType(version, name) == PropertyType.LAYOUT) {
      layoutProperties[name] = value;

    } else if (getPropertyType(version, name) == PropertyType.META) {
      metaProperties[name] = value;

    } else {
      assert(false, "Property name '" + name + "' is unknown");
    }
  }

  if (!_.isEmpty(source)) {
    metaProperties["source"] = stack.getGlobalScope().addSource(source);
  }


  if (layers) {
    if (metaProperties['type']) {
      assert.equal(metaProperties['type'], 'raster');
    }
    metaProperties['type'] = 'raster'
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

export = evaluateLayerScope;
