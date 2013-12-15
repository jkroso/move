
var Tween = require('tween/object')
var matrix = require('unmatrix')
var decompose = matrix.decompose
var parseString = matrix.parse
var frame = Tween.prototype.frame

module.exports = Matrix

function Matrix(from, to){
	Tween.call(this, parse(from), parse(to))
}

Tween.extend(Matrix, 'final')

Matrix.prototype.frame = function(p){
	return toString(frame.call(this, p))
}

function parse(m){
	return decompose(typeof m == 'string'
		? parseString(m)
		: [
				m.m11, m.m12,
				m.m21, m.m22,
				m.m41, m.m42,
			])
}

function toString(props) {
	var str = ''
	for(var k in props) {
		str += k + '(' + props[k] + unit[k] + ')'
	}
	return str
}

var unit = {
	translateX: 'px',
	translateY: 'px',
	rotate: 'deg',
	skew: 'deg',
	scaleX: '',
	scaleY: ''
}