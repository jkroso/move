
var Tween = require('tween/array')
var frame = Tween.prototype.frame

module.exports = RGB

function RGB(from, to){
	this._from = parse(from)
	this._to = parse(to)
}

Tween.extend(RGB, 'final')

RGB.prototype.frame = function(progress){
	var rgb = frame.call(this, progress).map(toInt)
	return 'rgb(' + rgb.join(',') + ')'
}

function toInt(n){
	return n.toFixed(0)
}

function parse(rgb){
	return /rgb\((\d+), *(\d+), *(\d+)\)/
		.exec(rgb)
		.slice(1)
		.map(Number)
}