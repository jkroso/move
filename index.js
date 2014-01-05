
var query = require('query')
var Move = require('./move')
var SVG = require('./svg')

module.exports = function(el){
  if (typeof el == 'string') el = query(el)
  if (el instanceof SVGElement) return new SVG(el)
  return new Move(el)
}
