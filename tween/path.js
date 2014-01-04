
var toString = require('serialize-svg-path')
var balance = require('balance-svg-paths')
var tween = require('string-tween')
var normalize = require('fcomp')(
  require('parse-svg-path'),
  require('abs-svg-path'),
  require('normalize-svg-path'),
  require('rel-svg-path'))

module.exports = function(from, to){
  var ends = balance(normalize(from), normalize(to))
  return tween(toString(ends[0]), toString(ends[1]))
}
