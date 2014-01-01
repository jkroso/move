
var Move = require('./move')
var SVG = require('./svg')

module.exports = function(el){
  if (el instanceof SVGElement) return new SVG(el)
  return new Move(el)
}
