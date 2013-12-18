
var toString = require('serialize-svg-path')
var tween = require('string-tween')
var compose = require('fcomp')
var normalize = compose(
	require('parse-svg-path'),
	require('abs-svg-path'),
	require('curve-svg-path'),
	require('rel-svg-path'))

module.exports = function(from, to){
	from = normalize(from)
	to = normalize(to)
	if (from.length != to.length) {
		throw new TypeError('incompatable paths')
	}
	return tween(toString(from), toString(to))
}
