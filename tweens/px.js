
var Tween = require('tween/number')
var frame = Tween.prototype.frame

module.exports = PX

Tween.extend(PX, 'final')

function PX(from, to){
	Tween.call(this, parse(from), parse(to))
}

PX.prototype.frame = function(progress) {
	return frame.call(this, progress).toFixed(1) + 'px'
};

function parse(px){
	return parseFloat(px, 10) || 0
}