_ = require "../compiled/source/utilities"
assert = require "assert"

describe 'utilities', ->

  describe 'objectMap', ->
    it 'should map arrays', ->
      input = [16]
      output = _.objectMap input, (value, key) -> [key + 1, value + 1]
      assert.deepEqual(output, "1": 17)

    it 'should map objects', ->
      lowercase = {foo: 'bar'}
      uppercase = _.objectMap lowercase, (value, key) ->
        [key.toUpperCase(), value.toUpperCase()]
      assert.deepEqual(uppercase, FOO: "BAR")

    it 'should map empty arrays', ->
      assert.deepEqual _.objectMap([], _.identity), {}

    it 'should map empty objects', ->
      assert.deepEqual _.objectMap({}, _.identity), {}

  describe 'objectMapKeys', ->
    it 'should map objects', ->
      lowercase = {foo: 'bar'}
      uppercase = _.objectMapKeys lowercase, (value, key) -> key.toUpperCase()
      assert.deepEqual(uppercase, FOO: "bar")

  describe 'objectMapValues', ->
    it 'should map objects', ->
      lowercase = {foo: 'bar'}
      uppercase = _.objectMapValues lowercase, (value, key) -> value.toUpperCase()
      assert.deepEqual(uppercase, foo: "BAR")

  describe 'objectZip', ->
    it 'zip two arrays into an object', ->
      assert.deepEqual(_.objectZip(["foo"], ["bar"]), foo: "bar")

    it 'zip two empty arrays into an empty object', ->
      assert.deepEqual(_.objectZip([], []), {})

  describe 'none', ->
    it 'should return true for an empty array', ->
      assert _.none([])

    it 'should true for an array of only falses', ->
      assert _.none([false, false, false])

    it 'should false for an array with one true', ->
      assert !_.none([false, true, false])

    it 'should respect a custom predicate', ->
      assert _.none([true, true, true], (value) -> !value)

  describe 'map method', ->

    it 'should return an empty array for an empty array', ->
      assert.deepEqual _.mapMethod([] ,"foo"), []

    it 'should run the method', ->
      assert.deepEqual _.mapMethod([{foo: => "bar"}] ,"foo"), ["bar"]

    it 'should run the method with args', ->
      assert.deepEqual _.mapMethod([{foo: (value) => value}] ,"foo", "bar"), ["bar"]

  describe 'count', ->
    it 'should return the number of trues', ->
      assert.equal _.count([true, false, true]), 2

    it 'should return 0 if there are no trues', ->
      assert.equal _.count([false, false]), 0

    it 'should return 0 for an empty array', ->
      assert.equal _.count([]), 0

    it 'should respect a custom predicate', ->
      assert.equal _.count([true, false, true], (value) -> !value), 1

