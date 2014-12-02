{parse} = require("../compiled/source/main")
assert = require("assert")
_ = require('../compiled/source/utilities')

it "should mark the stylesheet as version 6", ->
  assert.deepEqual parse("").version, 6

describe "sources", ->
  it "should be respected", ->
    stylesheet = parse """
      #layer {
        $type: background
        $source: source(bar: "baz")
      }
    """
    assert.deepEqual _.values(stylesheet.sources)[0], bar: "baz"
    assert stylesheet.layers[0].source

  it "should rename tile-size to tileSize", ->
    stylesheet = parse """
      #layer {
        $type: background
        $source: source(tile-size: 17)
      }
    """
    assert.deepEqual  _.values(stylesheet.sources)[0].tileSize, 17

describe "z-index", ->

  it "should work on layers", ->

    stylesheet = parse """
      #second { $type: background }
      #third { $type: background }
      #first { $type: background; z-index: -1 }
    """
    assert.deepEqual  stylesheet.layers[0].id, "first"
    assert.deepEqual  stylesheet.layers[1].id, "second"
    assert.deepEqual  stylesheet.layers[2].id, "third"

  it "should work on sublayers", ->

    stylesheet = parse """
      # {
        #second { $type: background }
        #third { $type: background }
        #first { $type: background; z-index: -1 }
      }
    """
    assert.deepEqual  stylesheet.layers[0].layers[0].id, "first"
    assert.deepEqual  stylesheet.layers[0].layers[1].id, "second"
    assert.deepEqual  stylesheet.layers[0].layers[2].id, "third"

describe "loops", ->

  it "should iterate over an array's values to create layers", ->
    stylesheet = parse """
      for value in [0,1,2] {
        # { $value: value }
      }
    """
    assert.equal stylesheet.layers[0].value, 0
    assert.equal stylesheet.layers[1].value, 1
    assert.equal stylesheet.layers[2].value, 2

  it "should iterate over an object's values to create layers", ->
    stylesheet = parse """
      for value in [zero:0 , one:1, two:2] {
        # { $value: value; $key:key }
      }
    """
    assert.equal stylesheet.layers[0].value, 0
    assert.equal stylesheet.layers[1].value, 1
    assert.equal stylesheet.layers[2].value, 2

  it "should iterate over an object's keys and values to create layers", ->
    stylesheet = parse """
      for key value in [zero:0 , one:1, two:2] {
        # { $value: value; $key:key }
      }
    """
    assert.equal stylesheet.layers[0].value, 0
    assert.equal stylesheet.layers[0].key, "zero"
    assert.equal stylesheet.layers[1].value, 1
    assert.equal stylesheet.layers[1].key, "one"
    assert.equal stylesheet.layers[2].value, 2
    assert.equal stylesheet.layers[2].key, "two"

  it "should iterate over an array's keys and values to create layers", ->
    stylesheet = parse """
      for key value in [2, 4, 6] {
        # { $value: value; $key:key }
      }
    """
    assert.equal stylesheet.layers[0].value, 2
    assert.equal stylesheet.layers[0].key, 0
    assert.equal stylesheet.layers[1].value, 4
    assert.equal stylesheet.layers[1].key, 1
    assert.equal stylesheet.layers[2].value, 6
    assert.equal stylesheet.layers[2].key, 2

  it "should place sublayers in the right order", ->
    stylesheet = parse """
      # { $value: 1 }
      for value in [1] {
        # { $value: 0; z-index: -1 }
        # { $value: 2 }
        # { $value: 4; z-index: 1 }
      }
      # { $value: 3 }
    """
    assert.equal stylesheet.layers[0].value, 0
    assert.equal stylesheet.layers[1].value, 1
    assert.equal stylesheet.layers[2].value, 2
    assert.equal stylesheet.layers[3].value, 3
    assert.equal stylesheet.layers[4].value, 4

describe "layers", ->

  it "should be in the stylesheet", ->
    stylesheet = parse '#test {$type: background}'
    assert stylesheet.layers[0]

  it "should be allowed to be anonymous", ->
    stylesheet = parse '# {$type: background}'
    assert.equal stylesheet.layers[0].type, "background"
    assert stylesheet.layers[0].id

  it "should respect its name", ->
    stylesheet = parse '#test {$type: background}'
    assert.equal stylesheet.layers[0].id, "test"

  it "should respect layout properties", ->
    stylesheet = parse '#test { $type: line; line-cap: square }'
    assert.equal stylesheet.layers[0].layout['line-cap'], 'square'

  it "should respect paint properties", ->
    stylesheet = parse '#test { $type: line; line-color: red }'
    assert.equal stylesheet.layers[0].paint['line-color'], 'red'

  it "should respect meta properties", ->
    stylesheet = parse '#test { $type: background; $foo: "bar" }'
    assert.equal stylesheet.layers[0].foo, "bar"

  it "should respect its filter", ->
    stylesheet = parse '#test { $type: background; $filter: @name == "foo" }'
    assert stylesheet.layers[0].filter

describe "sublayers", ->

  it "should not have an empty layers array if no sublayers", ->
    stylesheet = parse '#test { $type: background; }'
    assert !stylesheet.layers[0].layers

  it "should allow sublayers", ->
    stylesheet = parse """
      #parent {

        #child {
          $type: background
          background-color: red
        }

        raster-opacity: 1;
      }
    """
    assert.equal stylesheet.layers[0].type, 'raster'
    assert.equal stylesheet.layers[0].paint['raster-opacity'], 1
    assert.equal stylesheet.layers[0].layers.length, 1
    assert.equal stylesheet.layers[0].layers[0].type, 'background'
    assert.equal stylesheet.layers[0].layers[0].paint['background-color'], 'red'

  it "should fail if sublayers are defined but type is not 'raster'", ->

    assert.throws ->

      stylesheet = parse """
        #parent {
          $type: background
          #child {
            $type: background
          }
        }
      """
