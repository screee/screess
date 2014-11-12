if module.exports
  module.exports = require("./parser")
else if window
  window.ScreeSS = require("./parser")