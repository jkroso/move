
var parse = require('color-parser')
var round = Math.round

module.exports = function(from, to){
  from = rgba(from)
  to = rgba(to)
  var curr = to.slice()
  return function frame(n){
    for (var i = 0; i < 3; i++) {
      curr[i] = round(from[i] + (to[i] - from[i]) * n)
    }
    // don't round alpha
    curr[3] = from[i] + (to[i] - from[i]) * n
    return 'rgba(' + curr + ')'
  }
}

function rgba(color){
  color = parse(color)
  if (!color) return [255,255,255,0] // transparent
  return [
    color.r,
    color.g,
    color.b,
    (color.a == null ? 1 : color.a)
  ]
}
