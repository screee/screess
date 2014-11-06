ColorValue = require("./values/ColorValue")

module.exports =

  valueMacros:
    hsv: (h,s,v,a) -> ColorValue.hsla(h,s,v,1)
    hsva: (h,s,v,a) -> ColorValue.hsla(h,s,v,a)
    hsl: (h,s,l) -> ColorValue.hsla(h,s,l,1)
    hsla: (h,s,l,a) -> ColorValue.hsla(h,s,l,a)
    rgb: (r,g,b) -> ColorValue.rgba(r,g,b,1)
    rgba: (r,g,b,a) -> ColorValue.rgba(r,g,b,a)

  ruleMacros:

    doesitwork: (a) -> itworks: a