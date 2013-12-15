
var Move = require('./move')

module.exports = MoveSVG

var attrs = ['d'].reduce(function(attrs, key){
	attrs[key] = true
	return attrs
}, {})

function MoveSVG(el){ Move.call(this, el) }

Move.extend(MoveSVG)

MoveSVG.prototype.set = function(k, v){
	if (!(k in attrs)) k = prefix(k)
	this._to[k] = v
	return this
}

MoveSVG.prototype.current = function(k){
	if (k in attrs) return this.el.getAttribute(k)
	return getComputedStyle(el)[prefix(k)]
}

MoveSVG.prototype.apply = function(style){
	for (var k in style) {
		if (k in attrs) this.el.setAttribute(k, style[k])
		else this.el.style[k] = style[k]
	}
}
