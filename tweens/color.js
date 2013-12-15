
var Tween = require('string-tween')
var parse = require('color-parser')

module.exports = function(from, to){
	return tween(rgba(from), rgba(to))
}

function toInt(n){
	return n.toFixed(0)
}

function rgba(color){
	color = parse(color)
	return 'rgba('
		+ color.r + ','
		+ color.g + ','
		+ color.b + ','
		+ (color.a || 1) + ')'
}