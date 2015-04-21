assert = require("assert")
_ = require("../compiled/utilities")

Parser = require("../compiled/main")
parse = (source) -> Parser.parse(source).evaluate()

describe "whitespace", ->

  it "should allow for a scope on one line", ->
    stylesheet = parse "#test { type: 'background'; background-color: 'red' }"
    assert.deepEqual stylesheet.layers[0].type, 'background'
    assert.deepEqual stylesheet.layers[0].paint['background-color'], 'red'

  it "should allow for a scope on one line with a trailing semicolon", ->
    stylesheet = parse "#test { type: 'background'; background-color: 'red'; }"
    assert.deepEqual stylesheet.layers[0].type, 'background'
    assert.deepEqual stylesheet.layers[0].paint['background-color'], 'red'

  it "should allow for a scope with seperated by newlines", ->
    stylesheet = parse '''
      #test {
        type: 'background'
        background-color: 'red'
      }
    '''
    assert.deepEqual stylesheet.layers[0].type, 'background'
    assert.deepEqual stylesheet.layers[0].paint['background-color'], 'red'

  it "should allow for a scope seperated by semicolons and newlines", ->
    stylesheet = parse '''
      #test {
        type: 'background';
        background-color: 'red'
      }
    '''
    assert.deepEqual stylesheet.layers[0].type, 'background'
    assert.deepEqual stylesheet.layers[0].paint['background-color'], 'red'

  it "should allow for a scope seperated by semicolons and newlines with a trailing semicolon", ->
    stylesheet = parse '''
      #test {
        type: 'background';
        background-color: 'red';
      }
    '''
    assert.deepEqual stylesheet.layers[0].type, 'background'
    assert.deepEqual stylesheet.layers[0].paint['background-color'], 'red'

  it "should allow for a scope with empty lines", ->
    stylesheet = parse '''
      #test {
        type: 'background';
      }
    '''
    assert.deepEqual stylesheet.layers[0].type, 'background'

  it "should allow for a value macro's arguments to span multiple lines", ->
    stylesheet = parse """
      second(one two) = two
      #layer {
        type: second(
          'fill'
          'background'
        )
      }
    """
    assert.equal stylesheet.layers[0].type, 'background'

  it "should allow for an array's values to span multiple lines", ->
    stylesheet = parse """
      #layer {
        type: 'background'
        scree-test-meta: [
          1
          2
        ]
      }
    """
    assert.deepEqual stylesheet.layers[0]['scree-test-meta'], [1, 2]

  it "should allow for a property's values to span multiple lines within parenthesis", ->
    stylesheet = parse """
      type-second(one, two) = { type: two }
      #layer {
        type-second: (
          'fill'
          'background'
        )
      }
    """
    assert.deepEqual stylesheet.layers[0].type, 'background'

  describe 'comments', ->
    it "should be ignored at the end of a line", ->
      stylesheet = parse '''
        #test { // test
          type: 'background' // test
          background-color: 'red' // test
        } // test
      '''
      assert.deepEqual stylesheet.layers[0].type, 'background'
      assert.deepEqual stylesheet.layers[0].paint['background-color'], 'red'

    it "should be ignored on its own line", ->
      stylesheet = parse '''
        // test
        #test {
          // test
          type: 'background'
          // test
          background-color: 'red'
          // test
        }
        //test
      '''
      assert.deepEqual stylesheet.layers[0].type, 'background'
      assert.deepEqual stylesheet.layers[0].paint['background-color'], 'red'
