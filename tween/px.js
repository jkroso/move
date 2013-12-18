
var tween = require('./number')

module.exports = function(from, to){
	var frame = tween(from, to)
	return function(n){
		return frame(n).toFixed(1) + 'px'
	}
}
