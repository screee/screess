import _ = require('underscore');

export class Utilities {

  cast<T, U>(input:T):U {
    var intermediate:any = input;
    var output = intermediate;
    return output;
  }

  objectMapValues<T, U>(
    input:{[key:string]: T},
    iterator: (value:T, key:string) => U,
    context?: any
  ):{[key:string]: U} {
    return this.objectMap(
      input,
      (value, key) => { return [key, iterator(value, key)] }
    );
  }

  objectMapKeys<T>(
    input:{[key:string]: T},
    iterator:(value:T, key:string) => string,
    context:any = {}
  ):{[key:string]: T} {
    return this.objectMap(
      input,
      (value, key) => { return [iterator(value, key), value] },
      context
    )
  }

  objectMap<T, U>(
    input:{[key:string]: T},
    iterator: (value:T, key:string) => [string, U],
    context:any = {}
  ):{[key:string]: U} {
    var output:{[key:string]: U} = {}
    _.each(input, (inputValue, inputKey) => {
      var tuple = iterator(inputValue, inputKey);
      var outputKey = tuple[0];
      var outputValue = tuple[1];
      output[outputKey] = outputValue
    })
    return output
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

  none<T>(
    list: _.Dictionary<T>,
    iterator: (value:T, key:string) => boolean = _.identity,
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

}