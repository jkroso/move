
var parse = require('color-parser')

module.exports = function(from, to){
	from = rgba(from)
	to = rgba(to)
	var curr = to.slice()
	return function frame(n){
		for (var i = 0; i < 4; i++) {
			curr[i] = (from[i] + (to[i] - from[i]) * n).toFixed(0)
		}
		return 'rgba(' + curr + ')'
	}
}

function rgba(color){
	color = parse(color)
	return [
		color.r,
		color.g,
		color.b,
		(color.a == null ? 1 : color.a)
	]
}
