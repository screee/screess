parser = require("./source/parser")
util = require("util")

source = """

foo(test1 test2) = {
  one: test1
  two: test2
}

yellow(test) = test

#test[@length = 4 && @length < 2] {
  .test {
    doesitwork: yellow(21)
  }
}

"""

console.log(util.inspect(parser.parse(source), depth: null, colors: true))