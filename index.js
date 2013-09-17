
var Emitter = require('emitter/light')
var style = require('computed-style')
var Tween = require('tween/tween')
var reset = Tween.prototype.reset
var tweens = require('./tweens')
var prefix = require('prefix')
var merge = require('merge')
var raf = require('raf')
var css = require('css')

module.exports = function(el){
	return new Move(el)
}

/**
 * the Move class
 *
 * @param {Element} el
 * @api public
 */

function Move(el){
	this.tweens = {}
	this.el = el
}

/**
 * mixin methods
 */

merge(Move.prototype, Emitter.prototype)
merge(Move.prototype, Tween.prototype)

/**
 * add `prop` to animation. When the animation is run
 * `prop` will be tweened from its current value to `to`
 *
 * @param {String} prop
 * @param {CSS} to
 * @return {this}
 */

Move.prototype.set = function(prop, to){
	this.tween(prop, this.current(prop), to)
	return this
}

/**
 * get tween for `prop` with force; if it doesn't
 * exist it will be created
 *
 * @param {String} prop
 * @return {Tween}
 * @api private
 */

Move.prototype.getf = function(prop){
	prop = prefix(prop)
	var tweens = this.tweens
	if (tweens[prop]) return tweens[prop]
	var curr = this.current(prop)
	this.tween(prop, curr, curr)
	return tweens[prop]
}

/**
 * increment `prop` by `n`
 *
 * @param {String} prop
 * @param {Number} to
 * @return {this}
 */

Move.prototype.add = function(prop, n){
	var curr = parseInt(this.current(prop), 10)
	this.tween(prop, curr, curr + n)
	return this
}

/**
 * decrement `prop` by `n`
 *
 * @param {String} prop
 * @param {Number} to
 * @return {this}
 */

Move.prototype.sub = function(prop, n){
	var curr = parseInt(this.current(prop), 10)
	this.tween(prop, curr, curr - n)
	return this
}

/**
 * add a tween
 *
 * @param {String} prop
 * @param {CSS} from
 * @param {CSS} to
 * @api private
 */

Move.prototype.tween = function(prop, from, to){
	this.tweens[prop] = tween(prop, from, to)
}

/**
 * get the current value of `prop`
 *
 * @param {String} prop
 * @return {CSS}
 */

Move.prototype.current = function(prop){
	return style(this.el).getPropertyValue(prop)
}

/**
 * Skew `x` and `y`.
 *
 * @param {Number} x
 * @param {Number} y
 * @return {Move} for chaining
 * @api public
 */

Move.prototype.skew = function(x, y){
	this.getf('transform').skew(
		toRadians(x),
		toRadians(y || 0))
	return this
}

/**
 * Skew x by `n`.
 *
 * @param {Number} n
 * @return {Move} for chaining
 * @api public
 */

Move.prototype.skewX = function(n){
	return this.skew(n, 0)
}

/**
 * Skew y by `n`.
 *
 * @param {Number} n
 * @return {Move} for chaining
 * @api public
 */

Move.prototype.skewY = function(n){
	return this.skew(0, n)
}

/**
 * Translate `x` and `y` axis.
 *
 * @param {Number} x
 * @param {Number} y
 * @param {Number} z
 * @return {Move} for chaining
 * @api public
 */

Move.prototype.translate = function(x, y, z){
	this.getf('transform').translate(x, y, z || 0)
	return this
}

/**
 * Translate on the x axis to `n`.
 *
 * @param {Number} n
 * @return {Move} for chaining
 * @api public
 */

Move.prototype.translateX =
Move.prototype.x = function(n){
	return this.translate(n, 0, 0)
}

/**
 * Translate on the y axis to `n`.
 *
 * @param {Number} n
 * @return {Move} for chaining
 * @api public
 */

Move.prototype.translateY =
Move.prototype.y = function(n){
	return this.translate(0, n, 0)
}

/**
 * Scale the x and y axis by `x`, or
 * individually scale `x` and `y`.
 *
 * @param {Number} x
 * @param {Number} y
 * @return {Move} for chaining
 * @api public
 */

Move.prototype.scale = function(x, y){
	this.getf('transform').scale(x, y, 1)
	return this
}

/**
 * Scale x axis by `n`.
 *
 * @param {Number} n
 * @return {Move} for chaining
 * @api public
 */

Move.prototype.scaleX = function(n){
	return this.scale(n, 1, 1)
}

/**
 * Scale y axis by `n`.
 *
 * @param {Number} n
 * @return {Move} for chaining
 * @api public
 */

Move.prototype.scaleY = function(n){
	return this.scale(1, n, 1)
}

/**
 * Rotate `n` degrees.
 *
 * @param {Number} n
 * @return {Move} for chaining
 * @api public
 */

Move.prototype.rotate = function(n){
	this.getf('transform').rotate(1, 1, n)
	return this
}

/**
 * create a frame at point `p` through the animation
 *
 * @param {Number} p
 * @return {Object}
 * @api private
 */

Move.prototype.frame = function(p){
	var tweens = this.tweens
	var curr = this._curr
	for (var k in tweens) {
		curr[k] = tweens[k].frame(p)
	}
	return curr
}

/**
 * reset the animation so it can be re-used
 *
 * @return {this}
 * @api public
 */

Move.prototype.reset = function(){
	for (var tween in this.tweens) {
		this.tweens[tween]
			.ease(this._ease)
			.reset()
	}
	reset.call(this)
	this._curr = {}
	// precomputed last frame
	this._to = copy(this.frame(1))
	return this
}

/**
 * set duration to `n`. if `n` is a string it
 * is assumed to be in seconds
 *
 * @param {Number|String} n
 * @return {this}
 */

Move.prototype.duration = function(n){
	if (typeof n == 'string') n = parseFloat(n) * 1000
	this._duration = n
	return this
}

/**
 * Defer `fn` until the animation is complete
 *
 * @param {Function} fn
 * @return {this}
 * @api public
 */

Move.prototype.then = function(fn){
	this.on('end', fn)
	return this.run()
}

/**
 * run the animation with an optional duration
 *
 * @param {Number|String} [n]
 * @return {this}
 * @api public
 */

Move.prototype.run = function(n){
	if (n != null) this.duration(n)
	if (this.running) return this
	this.running = true
	var self = this
	this.reset()
	raf(function loop(){
		css(self.el, self.next())
		if (self.done) self.emit('end')
		else raf(loop)
	})
	return this
}

/**
 * determine type of `css` value
 *
 * @param {String|Number} css
 * @return {String}
 * @api private
 */

function type(css){
	if (typeof css == 'number') return 'px'
	if (/^rgba\([^)]+\)/.test(css)) return 'rgba'
	if (/^rgb\([^)]+\)/.test(css)) return 'rgb'
	if (/^matrix/.test(css)) return 'matrix'
	if (/^\d+px/.test(css)) return 'px'
}

function tween(prop, from, to){
	var Tween = tweens[type(from)]
		|| tweens[defaultType[prop]]
	return new Tween(from).to(to)
}

/**
 * map of default types
 * @type {Object}
 */

var defaultType = {}
defaultType[prefix('transform')] = 'matrix'

function copy(obj){
	return merge({}, obj)
}

function toRadians(angle){
	return angle * (Math.PI / 180)
}