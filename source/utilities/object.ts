import _ = require('underscore');

export class Utilities {

  objectMapValues<T, U>(
    input:_.Dictionary<T>,
    iterator:_.ObjectIterator<T, U>,
    stack?:any
  ):_.Dictionary<U>;

  objectMapValues<T, U>(
    input:_.List<T>,
    iterator:_.ListIterator<T, U>,
    stack?:any
  ):_.Dictionary<U>;

  objectMapValues(input, iterator, stack = {}):any {
    return this.objectMap(
      input,
      (value, key) => { return [key, iterator(value, key)] }
    );
  }

  objectMapKeys<T>(
    input:_.Dictionary<T>,
    iterator:_.ObjectIterator<T, string>,
    stack?:any
  ):_.Dictionary<T>;

  objectMapKeys<T>(
    input:_.List<T>,
    iterator:_.ListIterator<T, string>,
    stack?:any
  ):_.Dictionary<T>;

  objectMapKeys<T>(input, iterator, stack = {}):any {
    return this.objectMap(
      input,
      (value, key) => { return [iterator(value, key), value] },
      stack
    )
  }

  objectMap<T, U>(
    input:_.Dictionary<T>,
    iterator:_.ObjectIterator<T, [string, U]>,
    stack?:any
  ):_.Dictionary<U>;

  objectMap<T, U>(
    input:_.List<T>,
    iterator:_.ListIterator<T, [string, U]>,
    stack?:any
  ):_.Dictionary<U>;

  objectMap(input, iterator, stack = {}):any {
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

  objectFilter<T>(
    input:_.Dictionary<T>,
    iterator:(value:T, key:string) => boolean
  ):_.Dictionary<T> {
    var output:_.Dictionary<T>  = {};
    _.each(input, (value:T, key:string) => {
      if (iterator(value, key)) {
        output[key] = value;
      }
    });
    return output;
  }

  objectCompact<T>(
    input:_.Dictionary<T>
  ):_.Dictionary<T> {
    return this.objectFilter(input, (value) => { return !(value === undefined || value === null) });
  }

}