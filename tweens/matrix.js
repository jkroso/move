
var Tween = require('tween/array')
var frame = Tween.prototype.frame

module.exports = Matrix

function Matrix(from, to){
	this.matrix = new WebKitCSSMatrix
	if (from) this.matrix.setMatrixValue(from)
	this._from = toArray(this.matrix)
}

Tween.extend(Matrix, 'final')

Matrix.prototype.reset = function(){
	this._to = toArray(this.matrix)
	this._curr = this._to.slice()
}

Matrix.prototype.frame = function(p){
	return 'matrix(' + frame.call(this, p).map(clamp).join(', ') + ')'
}

Matrix.prototype.translate = function(x, y, z){
	this.matrix = this.matrix.translate(x, y, z)
}

Matrix.prototype.scale = function(x, y, z){
	this.matrix = this.matrix.scale(x, y, z)
}

Matrix.prototype.skew = function(x, y){
	x && (this.matrix = this.matrix.skewX(x))
	y && (this.matrix = this.matrix.skewY(y))
}

Matrix.prototype.rotate = function(x, y, z){
	this.matrix = this.matrix.rotate(x, y, z)
}

function toArray(matrix){
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