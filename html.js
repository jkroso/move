import Animation from '@jkroso/animation'
import unmatrix from '@jkroso/unmatrix'
import clone from '@jkroso/clone'
import lazy from 'lazy-property'
import tween from './tween'
import prefix from 'prefix'

/**
 * 'webkitTransform' || 'MozTransform' etc..
 * @type {String}
 */

const transform = prefix('transform')

/**
 * the Move class
 *
 * @param {Element} el
 * @api public
 */

export default class Move extends Animation {
  constructor(el) {
    super()
    this._to = {}
    this.el = el
  }

  /**
  * add `prop` to animation. When the animation is run
  * `prop` will be tweened from its current value to `to`
  *
  * @param {String} prop
  * @param {CSS} to
  * @return {this}
  */

  set(prop, to) {
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

  add(prop, n) {
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

  sub(prop, n) {
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

  current(prop) {
    return getComputedStyle(this.el)[prop]
  }

  /**
  * Skew by `deg`
  *
  * @param {Number} deg
  * @return {this}
  * @api public
  */

  skew(deg) {
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

  translate(x, y) {
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

  translateX(n) {
    return this.translate(n, 0)
  }

  /**
  * Translate on the y axis to `n`.
  *
  * @param {Number} n
  * @return {this}
  * @api public
  */

  translateY(n) {
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

  scale(x, y) {
    if (y == null) y = x
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

  scaleX(n) {
    return this.scale(n, 1, 1)
  }

  /**
  * Scale y axis by `n`.
  *
  * @param {Number} n
  * @return {this}
  * @api public
  */

  scaleY(n) {
    return this.scale(1, n, 1)
  }

  /**
  * Rotate `n` degrees.
  *
  * @param {Number} n
  * @return {this}
  * @api public
  */

  rotate(n) {
    this.matrix.rotate += n
    return this
  }
  /**
   * render the animation at completion level `n`
   *
   * @param {Number} n
   * @return {this}
   * @api public
   */

  render(n) {
    n = this._ease(n)
    var tweens = this.tweens
    var style = this.el.style
    for (var k in tweens) style[k] = tweens[k](n)
    return this
  }

  /**
   * Create a new Move instance which will run
   * when `this` move completes. Optionally you can
   * pass in a Move instance or Function to be run
   * on completion of `this` animation.
   *
   * @param {Move|Function} [move]
   * @return {this|DeferredMove}
   * @api public
   */

  then(move) {
    if (move) {
      var fn  = typeof move != 'function'
        ? function(){ move.run() }
        : move
      this.on('end', fn)
      this.running || this.parent || this.run()
      return this
    }
    move = defer(this)
    this.then(move)
    return move
  }

}

/**
* css transformation matrix for `this.el`
*
* @return {Object}
* @api private
*/

lazy(Move.prototype, 'matrix', function() {
  var matrix = this.current(transform)
  if (typeof matrix == 'string') matrix = unmatrix(matrix)
  this._to[transform] = matrix
  return matrix
})

/**
* generated tweening functions
*
* @return {Object}
* @api private
*/

lazy(Move.prototype, 'tweens', function() {
  const tweens = {}
  for (var key in this._to) {
    tweens[key] = tween(key, this.current(key), this._to[key])
  }
  return tweens
})

/**
 * default duration
 */

Move.prototype.duration('300ms')
Move.prototype.x = Move.prototype.translateX
Move.prototype.y = Move.prototype.translateY

/**
 * create a specialized sub-class of `Move` for use
 * in `then()`
 *
 * @param {Move} parent
 * @api private
 */

const defer = parent => {
  const child = new parent.constructor(parent.el)
  child._duration = parent._duration
  child.current = deferredCurrent
  child._ease = parent._ease
  child.parent = parent
  return child
}

function deferredCurrent(prop){
  var anim = this.parent
  do if (prop in anim._to) return clone(anim._to[prop])
  while (anim = anim.parent)
  return this.constructor.prototype.current.call(this, prop)
}
