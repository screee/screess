parser = require("./source/parser")
util = require("util")

source = """

&foo {
  bar: 6
}

#test {
  $type: line
  $filter: is line
  $source: &foo

  line-width: 5

  .night {
    color: "red"
  }
}

transition-duration: 5
transition-delay: 6

"""

console.log(util.inspect(parser.parse(source), depth: null, colors: true))