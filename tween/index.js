import parseColor from 'color-parser'
import prefix from 'prefix'
import number from './number'
import matrix from './matrix'
import color from './color'
import path from './path'
import px from './px'

const defaultTypes = {
  fillOpacity: 'number',
  fontWeight: 'number',
  transform: 'matrix',
  opacity: 'number',
  zIndex: 'number',
  zoom: 'number',
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

const tween = (prop, from, to) => {
  var fn = typeof to == 'string' && tween[type(to)]
  if (!fn) fn = tween[defaultTypes[prop] || 'px']
  return fn(from, to)
}

tween.number = number
tween.matrix = matrix
tween.color = color
tween.path = path
tween.px = px

/**
 * determine type of `css` value
 *
 * @param {String} css
 * @return {String}
 * @api private
 */

const type = css => {
  if (/^matrix(3d)?\([^)]*\)$/.test(css)) return 'matrix'
  if (/^[-.\d]+px/.test(css)) return 'px'
  if (parseColor(css)) return 'color'
}

export default tween
