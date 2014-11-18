
var query = require('query')
var DOM = require('./move')
var SVG = require('./svg')

module.exports = function(el, to){
  if (typeof el == 'string') el = query(el)
  var move = el instanceof SVGElement ? new SVG(el) : new DOM(el)
  for (var key in to) move.set(key, to[key])
  return move
}
