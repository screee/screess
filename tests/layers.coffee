assert = require("assert")
_ = require('../compiled/utilities')

Parser = require("../compiled/main")
parse = (source) -> Parser.parse(source).evaluate()

describe "layers", ->

  it "should be in the stylesheet", ->
    stylesheet = parse "#test {type: 'background'}"
    assert stylesheet.layers[0]

  it "should be allowed to be anonymous", ->
    stylesheet = parse "# {type: 'background'}"
    assert.equal stylesheet.layers[0].type, "background"
    assert stylesheet.layers[0].id

  it "should respect its name", ->
    stylesheet = parse "#test {type: 'background'}"
    assert.equal stylesheet.layers[0].id, "test"

  it "should respect layout properties", ->
    stylesheet = parse "#test { type: 'line'; line-cap: 'square' }"
    assert.equal stylesheet.layers[0].layout['line-cap'], 'square'

  it "should respect paint properties", ->
    stylesheet = parse "#test { type: 'line'; line-color: 'red' }"
    assert.equal stylesheet.layers[0].paint['line-color'], 'red'

  it "should respect meta properties", ->
    stylesheet = parse "#test { type: 'background'; scree-test-meta: 'bar' }"
    assert.equal stylesheet.layers[0]['scree-test-meta'], "bar"

  it "should respect its filter", ->
    stylesheet = parse "#test { type: 'background'; filter: @name == 'foo' }"
    assert stylesheet.layers[0].filter

  describe "sublayers", ->

    it "should not have an empty layers array if no sublayers", ->
      stylesheet = parse "#test { type: 'background'; }"
      assert !stylesheet.layers[0].layers

    it "should allow sublayers", ->
      stylesheet = parse """
        #parent {

          #child {
            type: 'background'
            background-color: 'red'
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
            type: 'background'
            #child {
              type: 'background'
            }
          }
        """