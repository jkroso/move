
var Tween = require('tween/number')

module.exports = Tween.extend(function Number(from, to){
	Tween.call(this, parse(from), parse(to))
}, 'final')

function parse(px){
	return parseFloat(px, 10) || 0
}