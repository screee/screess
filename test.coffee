parser = require("./source/parser")
util = require("util")

source = """

#test {
  $filter: 5 in [1,2,3]
}

"""

console.log(util.inspect(parser.parse(source), depth: null, colors: true))