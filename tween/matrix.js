
var tween = require('string-tween')
var unmatrix = require('unmatrix')
var keys = Object.keys

module.exports = function(from, to){
  return tween(normalize(from), normalize(to))
}

function normalize(m){
  if (typeof m == 'string') m = unmatrix(m)
  return keys(unit).reduce(function(str, key){
    return str + key + '(' + m[key] + unit[key] + ')'
  }, '')
}

var unit = {
  translateX: 'px',
  translateY: 'px',
  rotate: 'deg',
  skew: 'deg',
  scaleX: '',
  scaleY: ''
}