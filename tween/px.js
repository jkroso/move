import numberTween from './number'

const pxTween = (from, to) => {
  const frame = numberTween(from, to)
  return n => frame(n).toFixed(1) + 'px'
}

export default pxTween
