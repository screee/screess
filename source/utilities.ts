import underscore = require("underscore");
var utilitiesColor = require("./utilitiesColor");

interface UtilitiesStatic extends UnderscoreStatic {

  objectMapValues<T, U>(
    input:{[key:string]: T},
    iterator: (value:T, key:string) => U,
    context?: any
  ):{[key:string]: U};

  objectMapKeys<T>(
    input:{[key:string]: T},
    iterator: (value:T, key:string) => string,
    context?: any
  ):{[key:string]: T};

  objectMap<T, U>(
    input:{[key:string]: T},
    iterator: (value:T, key:string) => [string, U],
    context?:any
  ):{[key:string]: U};

  objectZip<T>(
    keys:string[],
    values:T[]
  ):{[key:string]: T}

  none<T>(
    list: _.List<T>,
    iterator?: (value:T, key:string) => boolean,
    context?: any
  ): boolean;

  count<T>(
    list: _.List<T>,
    iterator?: (value:T, key:string) => boolean,
    context?: any
  ):number;

  cast<T, U>(
    value:T
  ):U;

  rgb2hsl(r:number, g:number, b:number):[number, number, number];
  hsl2rgb(h:number, s:number, l:number):[number, number, number];
  rgb2hsv(r:number, g:number, b:number):[number, number, number];
  hsv2rgb(h:number, s:number, v:number):[number, number, number];
  rgb2hex(r:number, g:number, b:number):string;
  hex2rgb(hex:string):[number, number, number];
}

var intermediate:any = underscore;
var utilities:UtilitiesStatic = intermediate;

utilities.mixin(utilitiesColor);

utilities.mixin({

  cast: function<T, U>(input:T):U {
    var intermediate:any = input;
    var output = intermediate;
    return output;
  },

  objectMapValues: function(input, iterator, context = null) {
    return this.objectMap(
      input,
      (value, key) => { return [key, iterator(value, key)] }
    );
  },

  objectMapKeys: function(input, iterator, context = null) {
    return this.objectMap(
      input,
      (value, key) => { return [iterator(value, key), value] },
      context
    )
  },

  objectMap: function(input, iterator) {
    var output = {}
    this.each(input, (inputValue, inputKey) => {
      var tuple = iterator(inputValue, inputKey);
      var outputKey = tuple[0];
      var outputValue = tuple[1];
      output[outputKey] = outputValue
    })
    return output
  },

  objectZip: function(keys, values) {
    var output = {}
    for (var i=0; i<keys.length; i++) {
      output[keys[i]] = values[i];
    }
    return output
  },

  none: function(list, iterator = null, scope = null) {
    return !this.some(list, iterator, scope);
  },

  count: function(input, iterator = this.identity) {
    var count = 0;
    this.each(
      input,
      () => { if (iterator.apply(this, arguments)) { count++ } }
    )
    return count
  }
});

export = utilities;