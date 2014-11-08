{parse} = require("../source/parser")
assert = require("assert")

it "should be version 6", ->
  assert.deepEqual parse("").version, 6
