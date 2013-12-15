
var tween = require('string-tween')
var unmatrix = require('unmatrix')
var keys = Object.keys

module.exports = function(from, to){
	from = normalize(from)
	to = normalize(to)
	return tween(from, to)
}

function normalize(m){
	if (typeof m == 'string') m = unmatrix(m)
	return keys(m).sort().reduce(function(str, key){
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