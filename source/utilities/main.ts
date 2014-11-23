import _ = require('underscore');

export class Utilities {

  objectMapValues<T, U>(
    input:_.Dictionary<T>,
    iterator:_.ObjectIterator<T, U>,
    context?:any
  ):_.Dictionary<U>;

  objectMapValues<T, U>(
    input:_.List<T>,
    iterator:_.ListIterator<T, U>,
    context?:any
  ):_.Dictionary<U>;

  objectMapValues(input, iterator, context = {}):any {
    return this.objectMap(
      input,
      (value, key) => { return [key, iterator(value, key)] }
    );
  }

  objectMapKeys<T>(
    input:_.Dictionary<T>,
    iterator:_.ObjectIterator<T, string>,
    context?:any
  ):_.Dictionary<T>;

  objectMapKeys<T>(
    input:_.List<T>,
    iterator:_.ListIterator<T, string>,
    context?:any
  ):_.Dictionary<T>;

  objectMapKeys<T>(input, iterator, context = {}):any {
    return this.objectMap(
      input,
      (value, key) => { return [iterator(value, key), value] },
      context
    )
  }

  objectMap<T, U>(
    input:_.Dictionary<T>,
    iterator:_.ObjectIterator<T, [string, U]>,
    context?:any
  ):_.Dictionary<U>;

  objectMap<T, U>(
    input:_.List<T>,
    iterator:_.ListIterator<T, [string, U]>,
    context?:any
  ):_.Dictionary<U>;

  objectMap(input, iterator, context = {}):any {
    var output = {}
    _.each(input, (inputValue, inputKey) => {
      var tuple = iterator(inputValue, inputKey);
      var outputKey = tuple[0];
      var outputValue = tuple[1];
      output[outputKey] = outputValue;
    })
    return output;
  }

  objectZip<T>(
    keys:string[],
    values:T[]
  ):{[key:string]: T} {
    var output:{[key:string]: T} = {}
    for (var i=0; i<keys.length; i++) {
      output[keys[i]] = values[i];
    }
    return output
  }

  mapMethod<T, U>(
    list:_.List<T>,
    method:string,
    ...args:any[]
  ):_.List<U> {
    return _.map(
      list,
      (value) => value[method].apply(value, args)
    )
  }

  none<T>(
    list: _.List<T>,
    iterator: (value:T, key:number) => boolean = _.identity,
    context: any = {}
  ):boolean {
    return !_.some(list, iterator, context);
  }

  count<T>(
    list: _.List<T>,
    iterator: (value:T, key:number) => boolean = _.identity,
    context: any = {}
  ):number {
    var count:number = 0;
    _.each(
      list,
      (value, key) => { if (iterator(value, key)) { count++ } }
    )
    return count
  }

  hash(value:string):number {
    var hash = 0, i, chr, len;
    if (value.length == 0) return hash;
    for (i = 0, len = value.length; i < len; i++) {
      chr   = value.charCodeAt(i);
      hash  = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  }
}