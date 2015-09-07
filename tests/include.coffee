assert = require("assert")
_ = require('../compiled/utilities')

Parser = require("../compiled/main")
parse = (source) -> Parser.parse(source).evaluate()

# TODO restore
# describe "include", ->
#   it "should load properties", ->
#     stylesheet = parse """
#       include('tests/include-fixture.screess')
#     """
#     assert.equal stylesheet["magic-number"], 17
#
#   it "should load value macros", ->
#     stylesheet = parse """
#       include('tests/include-fixture.screess')
#       scree-test-meta: uppercase('baz')
#     """
#     assert.equal stylesheet["scree-test-meta"], "BAZ"
