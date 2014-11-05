parser = require("./dist/parser.js")
util = require("util")

source = """

foo(test1 test2) {
  one: test1
  two: test2
}

#test {
  .test {
    foo: 1 2
  }
}

"""

console.log(util.inspect(parser.parse(source), depth: null, colors: true))