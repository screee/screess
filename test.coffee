parser = require("./source/parser")
util = require("util")

source = """

#test {
  test: [1 2]
}

"""

console.log(util.inspect(parser.parse(source), depth: null, colors: true))