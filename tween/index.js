
var parseColor = require('color-parser')
var prefix = require('prefix')

module.exports = tween

var defaultTypes = {
  fillOpacity: 'number',
  fontWeight: 'number',
  opacity: 'number',
  zIndex: 'number',
  zoom: 'number',
  transform: 'matrix',
  d: 'path'
}

defaultTypes[prefix('transform')] = 'matrix'

/**
 * create a tween function
 *
 * @param {String} prop
 * @param {Any} from
 * @param {Any} to
 * @return {Function}
 */

function tween(prop, from, to){
  var fn = typeof to == 'string' && tween[type(to)]
  if (!fn) fn = tween[defaultTypes[prop] || 'px']
  return fn(from, to)
}

tween.number = require('./number')
tween.matrix = require('./matrix')
tween.color = require('./color')
tween.path = require('./path')
tween.px = require('./px')

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
