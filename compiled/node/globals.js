// Generated by CoffeeScript 1.8.0
(function() {
  var ColorValue, FunctionValue, LiteralValue, assert, _;

  ColorValue = require("./values/ColorValue");

  LiteralValue = require("./values/LiteralValue");

  FunctionValue = require("./values/FunctionValue");

  _ = require("./utilities");

  assert = require("assert");

  module.exports = {
    valueMacros: {
      source: function(source, options) {
        var name, _ref;
        name = ((_ref = source.name) != null ? _ref.toMGLValue(options) : void 0) || _.uniq();
        delete source.name;
        if (source["tile-size"]) {
          source.tileSize = source["tile-size"];
          delete source["tile-size"];
        }
        options.globalScope.addSource(name, source);
        return [new LiteralValue(name)];
      },
      identity: function(args, options) {
        return _.map(args, _.identity);
      },
      hsv: function(args, options) {
        return [ColorValue.hsla(args['0'], args['1'], args['2'], 1)];
      },
      hsva: function(args, options) {
        return [ColorValue.hsla(args['0'], args['1'], args['2'], args['3'])];
      },
      hsl: function(args, options) {
        return [ColorValue.hsla(args['0'], args['1'], args['2'], 1)];
      },
      hsla: function(args, options) {
        return [ColorValue.hsla(args['0'], args['1'], args['2'], args['3'])];
      },
      rgb: function(args, options) {
        return [ColorValue.rgba(args['0'], args['1'], args['2'], 1)];
      },
      rgba: function(args, options) {
        return [ColorValue.rgba(args['0'], args['1'], args['2'], args['3'])];
      },
      polygon: function(args, options) {
        return [new LiteralValue("Polygon")];
      },
      point: function(args, options) {
        return [new LiteralValue("Point")];
      },
      fill: function(args, options) {
        return [new LiteralValue("fill")];
      },
      symbol: function(args, options) {
        return [new LiteralValue("symbol")];
      },
      raster: function(args, options) {
        return [new LiteralValue("raster")];
      },
      background: function(args, options) {
        return [new LiteralValue("background")];
      },
      line: function(args, options) {
        if (options.rule === "type" && options.meta) {
          return new LiteralValue("LineString");
        } else if (options.filter) {
          return new LiteralValue("line");
        } else {
          throw new Error("The use of 'line' is ambigious in this context");
        }
      },
      'function': function(args, options) {
        var key, stop, stops, value;
        stops = [];
        for (key in args) {
          value = args[key];
          if (key === "base") {
            continue;
          }
          if ((stop = parseInt(key)) !== NaN) {
            stops.push([key, value]);
          } else {
            assert(false);
          }
        }
        assert(stops.length > 0);
        return [new FunctionValue(args.base, stops)];
      }
    },
    ruleMacros: {}
  };

}).call(this);