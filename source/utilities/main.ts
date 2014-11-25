import _ = require('underscore');

export class Utilities {

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
    stack: any = {}
  ):boolean {
    return !_.some(list, iterator, stack);
  }

  count<T>(
    list: _.List<T>,
    iterator: (value:T, key:number) => boolean = _.identity,
    stack: any = {}
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