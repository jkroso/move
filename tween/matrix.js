import unmatrix from '@jkroso/unmatrix'
import tween from 'string-tween'

const keys = Object.keys
const unit = {
  translateX: 'px',
  translateY: 'px',
  rotate: 'deg',
  skew: 'deg',
  scaleX: '',
  scaleY: ''
}

const matrixTween = (from, to) => tween(normalize(from), normalize(to))

const normalize = m => {
  if (typeof m == 'string') m = unmatrix(m)
  return keys(unit).reduce((str, key) => {
    return str + key + '(' + m[key] + unit[key] + ')'
  }, '')
}

export default matrixTween
