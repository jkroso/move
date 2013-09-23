
var Tween = require('tween/array')
var frame = Tween.prototype.frame
var rgba = require('color-parser')

module.exports = Color

function Color(from, to){
	Tween.call(this, parse(from), parse(to))
}

Tween.extend(Color, 'final')

Color.prototype.frame = function(progress){
	var rgb = frame.call(this, progress).map(toInt)
	return 'rgba(' + rgb.join(',') + ')'
}

function toInt(n){
	return n.toFixed(0)
}

function parse(color){
	color = rgba(color)
	return [
		color.r,
		color.g,
		color.b,
		color.a || 1,
	]
}