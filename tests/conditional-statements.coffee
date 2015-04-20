{parse} = require("../compiled/source/main")
assert = require("assert")
_ = require('../compiled/source/utilities')

describe "conditional statements", ->

  describe "evaluation", ->

    it "should evaluate true if expressions", ->

      stylesheet = parse """
        #test {
          if true {
            type: 'background'
          }
        }
      """

      assert.equal stylesheet.layers[0].type, 'background'

    it "should not evaluate false if expressions", ->

      stylesheet = parse """
        #test {
          type: 'background'
          if false {
            type: 'fill'
          }
        }
      """

      assert.equal stylesheet.layers[0].type, 'background'

    it "should evaluate else expressions", ->
      stylesheet = parse """
        #test {
          if false {
            type: 'fill'
          } else {
            type: 'background'
          }
        }
      """

      assert.equal stylesheet.layers[0].type, 'background'

    it "should evaluate else if expressions", ->
      stylesheet = parse """
        #test {
          if false {
            type: 'fill'
          } else if true {
            type: 'background'
          } else {
            type: line
          }
        }
      """

      assert.equal stylesheet.layers[0].type, 'background'

  it "should respect logic operators", ->

    stylesheet = parse """
      #test {
        if 1 == 1 {
          type: 'background'
        }
      }
    """
    assert.equal stylesheet.layers[0].type, 'background'
