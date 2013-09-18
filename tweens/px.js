
var Tween = require('tween/number')
var frame = Tween.prototype.frame

module.exports = PX

Tween.extend(PX, 'final')

function PX(from, to){
	this._from = toNumber(from)
	this._to = toNumber(to)
}

PX.prototype.frame = function(progress) {
	return frame.call(this, progress).toFixed(1) + 'px'
};

function toNumber(px){
	return parseFloat(px, 10) || 0
}