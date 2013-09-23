
var Tween = require('tween/array')
var frame = Tween.prototype.frame
var CSSMatrix = WebKitCSSMatrix

module.exports = Matrix

function Matrix(from, to){
	Tween.call(this, parse(from), parse(to))
}

Tween.extend(Matrix, 'final')

Matrix.prototype.frame = function(p){
	return 'matrix(' + frame.call(this, p).map(clamp).join(', ') + ')'
}

function parse(matrix){
	if (typeof matrix == 'string') matrix = new CSSMatrix(matrix)
	return [
		matrix.m11,
		matrix.m12,
		matrix.m21,
		matrix.m22,
		matrix.m41,
		matrix.m42,
	]
}

function clamp(n){
	return n.toFixed(6)
}