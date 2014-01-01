
var balance = require('balance-svg-paths')
var tween = require('string-tween')

module.exports = function(from, to){
  return tween.apply(null, balance(from, to))
}
