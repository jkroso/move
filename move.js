
var parseColor = require('color-parser')
var extensible = require('extensible')
var style = require('computed-style')
var lazy = require('lazy-property')
var unmatrix = require('unmatrix')
var Emitter = require('emitter')
var tween = require('./tweens')
var prefix = require('prefix')
var merge = require('merge')
var clone = require('clone')
var ease = require('ease')
var now = require('now')
var raf = require('raf')
var css = require('css')

module.exports = Move

/**
 * 'webkitTransform' || 'MozTransform' etc..
 * @type {String}
 */

var transform = prefix('transform')

/**
 * map of default types
 * @type {Object}
 */

var defaultTypes = {
  fillOpacity: 'number',
  fontWeight: 'number',
  opacity: 'number',
  zIndex: 'number',
  zoom: 'number',
  transform: 'matrix',
  d: 'path'
}
defaultTypes[transform] = 'matrix'

/**
 * the Move class
 *
 * @param {Element} el
 * @api public
 */

function Move(el){
	this._curr = {}
	this._to = {}
	this.el = el
}

/**
 * mixin methods
 */

merge(Move.prototype, Emitter.prototype)
extensible(Move)

/**
 * add `prop` to animation. When the animation is run
 * `prop` will be tweened from its current value to `to`
 *
 * @param {String} prop
 * @param {CSS} to
 * @return {this}
 */

Move.prototype.set = function(prop, to){
	this._to[prefix(prop)] = to
	return this
}

/**
 * increment `prop` by `n`
 *
 * @param {String} prop
 * @param {Number} to
 * @return {this}
 */

Move.prototype.add = function(prop, n){
	prop = prefix(prop)
	var curr = parseInt(this.current(prop), 10)
	return this.set(prop, curr + n)
}

/**
 * decrement `prop` by `n`
 *
 * @param {String} prop
 * @param {Number} to
 * @return {this}
 */

Move.prototype.sub = function(prop, n){
	prop = prefix(prop)
	var curr = parseInt(this.current(prop), 10)
	return this.set(prop, curr - n)
}

/**
 * get the current value of `prop`
 *
 * @param {String} prop
 * @return {CSS}
 */

Move.prototype.current = function(prop){
	return style(this.el)[prop]
}

/**
 * Skew by `deg`
 *
 * @param {Number} deg
 * @return {this}
 * @api public
 */

Move.prototype.skew = function(deg){
	this.matrix.skew += deg
	return this
}

/**
 * Translate `x` and `y` axis.
 *
 * @param {Number} x
 * @param {Number} y
 * @param {Number} z
 * @return {this}
 * @api public
 */

Move.prototype.translate = function(x, y){
	this.matrix.translateX += x
	this.matrix.translateY += y
	return this
}

/**
 * Translate on the x axis to `n`.
 *
 * @param {Number} n
 * @return {this}
 * @api public
 */

Move.prototype.translateX =
Move.prototype.x = function(n){
	return this.translate(n, 0)
}

/**
 * Translate on the y axis to `n`.
 *
 * @param {Number} n
 * @return {this}
 * @api public
 */

Move.prototype.translateY =
Move.prototype.y = function(n){
	return this.translate(0, n)
}

/**
 * Scale the x and y axis by `x`, or
 * individually scale `x` and `y`.
 *
 * @param {Number} x
 * @param {Number} y
 * @return {this}
 * @api public
 */

Move.prototype.scale = function(x, y){
	this.matrix.scaleX *= x
	this.matrix.scaleY *= y
	return this
}

/**
 * Scale x axis by `n`.
 *
 * @param {Number} n
 * @return {this}
 * @api public
 */

Move.prototype.scaleX = function(n){
	return this.scale(n, 1, 1)
}

/**
 * Scale y axis by `n`.
 *
 * @param {Number} n
 * @return {this}
 * @api public
 */

Move.prototype.scaleY = function(n){
	return this.scale(1, n, 1)
}

/**
 * Rotate `n` degrees.
 *
 * @param {Number} n
 * @return {this}
 * @api public
 */

Move.prototype.rotate = function(n){
	this.matrix.rotate += n
	return this
}

/**
 * get the transformation matrix
 *
 * @return {CSSMatrix}
 * @api private
 */

lazy(Move.prototype, 'matrix', function(){
	var matrix = this.current(transform)
	if (typeof matrix == 'string') matrix = unmatrix(matrix)
	return this._to[transform] = matrix
})

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
	for (var k in tweens) curr[k] = tweens[k](p)
	return curr
}

lazy(Move.prototype, 'tweens', function(){
	var tweens = {}
	for (var key in this._to) {
		var from = this.current(key)
		var to = this._to[key]
		var fn = typeof from == 'string' && tween[type(from)]
		if (!fn) fn = tween[defaultTypes[key] || 'px']
		tweens[key] = fn(from, to)
	}
	return tweens
})

/**
 * determine type of `css` value
 *
 * @param {String} css
 * @return {String}
 * @api private
 */

function type(css){
	if (/^matrix(3d)?\([^)]*\)$/.test(css)) return 'matrix'
	if (/^[-.\d]+px/.test(css)) return 'px'
	if (parseColor(css)) return 'color'
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
 * Set easing function to `fn`.
 *
 *   tween.ease('in-out-sine')
 *
 * @param {String|Function} fn
 * @return {this}
 * @api public
 */

Move.prototype.ease = function(fn){
	if (typeof fn == 'string') fn = ease[fn]
	if (!fn) throw new Error('invalid easing function')
	this._ease = fn
	return this
}

/**
 * generate the next frame
 *
 * @return {Any}
 * @api public
 */

Move.prototype.next = function(){
	var progress = (now() - this.start) / this._duration

	if (progress >= 1) {
		this.done = true
		progress = 1
	}

	return this.frame(this._ease(progress))
}

/**
 * run the animation with an optional callback or duration
 *
 * @param {Number|String|Function} [n]
 * @return {this}
 * @api public
 */

Move.prototype.end =
Move.prototype.run = function(n){
	if (n != null) {
		if (typeof n == 'function') this.on('end', n)
		else this.duration(n)
	}
	var self = this
	raf(function loop(){
		self.apply(self.next())
		if (self.done) self.emit('end')
		else raf(loop)
	})
	this.running = true
	return this
}

Move.prototype.on('end', function(){
	this.running = false
})

Move.prototype.apply = function(style){
	css(this.el, style)
}

/**
 * Create a `DeferredMove` instance which will run
 * when `this` move completes. Optionally you can
 * pass in a Move instance in which case it will be
 * be run on completion of `this` animation.
 *
 * @param {Move} [move]
 * @return {this|DeferredMove}
 * @api public
 */

Move.prototype.then = function(move){
	if (move) {
		this.on('end', function(){
			move.run()
		})
		if (!this.running) this.run()
		return this
	}
	move = new DeferredMove(this)
	this.then(move)
	return move
}

/**
 * create a specialized sub-class of `Move` for use
 * in `then()`
 *
 * @param {Move} parent
 * @api private
 */

var DeferredMove = Move.extend(function(parent){
	Move.call(this, parent.el)
	this._duration = parent._duration
	this._ease = parent._ease
	this.parent = parent
	this.running = true
}, 'final')

/**
 * check parent tween incase `prop` is currently being
 * animated. If it is get the final frame
 *
 * @param {String} prop
 * @return {CSS}
 * @api private
 */

DeferredMove.prototype.current = function(prop){
	var parent = this.parent
	while (parent) {
		if (prop in parent._to) return clone(parent._to[prop])
		parent = parent.parent
	}
	return style(this.el)[prop]
}

/**
 * sugar for `this.parent`. Sometimes looks nicer in
 * long chains
 *
 * @return {Move}
 * @api public
 */

DeferredMove.prototype.pop = function(){
	return this.parent
}

/**
 * defaults
 */

lazy(Move.prototype, 'start', now)
Move.prototype.running = false
Move.prototype.done = false
Move.prototype.ease('linear')
