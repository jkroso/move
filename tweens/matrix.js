
var Tween = require('tween/array')
var frame = Tween.prototype.frame

module.exports = Matrix

function Matrix(from, to){
	this.matrix = typeof from == 'string'
		? new WebKitCSSMatrix(from)
		: new WebKitCSSMatrix
	this._from = toArray(this.matrix)
}

Tween.extend(Matrix, 'final')

Matrix.prototype.reset = function(){
	this._to = toArray(this.matrix)
	this._curr = this._to.slice()
}

Matrix.prototype.frame = function(progress){
	return 'matrix('
		+ frame.call(this, progress).map(toInt).join(', ')
		+ ')'
}

function toInt(n){
	return n.toFixed(6)
}

Matrix.prototype.translate = function(x, y, z){
	this.matrix = this.matrix.translate(x, y, z)
}

Matrix.prototype.scale = function(x, y, z){
	this.matrix = this.matrix.scale(x, y, z)
}

Matrix.prototype.skew = function(x, y){
	var t = new WebKitCSSMatrix
	t.m11 = 1
	t.m12 = Math.tan(y)
	t.m21 = Math.tan(x)
	t.m22 = 1
	t.m41 = 0
	t.m42 = 0
	this.matrix = this.matrix.multiply(t)
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