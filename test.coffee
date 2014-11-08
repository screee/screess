parser = require("./source/parser")
util = require("util")

source = """

#test {
  $type: line
  $filter: is line
}

"""

console.log(util.inspect(parser.parse(source), depth: null, colors: true))