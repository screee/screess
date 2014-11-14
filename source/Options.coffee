module.exports = class Options

  getGlobalScope: -> @scopeStack[0]
  getScope: -> @scopeStack[@scopeStack.length - 1]

  pushFilter: -> @filters++
  popFilter: -> --@filters
  isFilter: -> @filters > 0

  constructor: ->
    @valueMacroStack = []
    @propertyMacroStack = []
    @scopeStack = []
    @filters = 0
    @property = null
    @isMetaProperty = false
