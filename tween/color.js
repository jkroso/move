import parse from 'color-parser'

const round = Math.round

const tween = (from, to) => {
  from = rgba(from)
  to = rgba(to)
  const curr = to.slice()
  return n => {
    for (var i = 0; i < 3; i++) {
      curr[i] = round(from[i] + (to[i] - from[i]) * n)
    }
    // don't round alpha
    curr[3] = from[3] + (to[3] - from[3]) * n
    return 'rgba(' + curr + ')'
  }
}

const rgba = color => {
  color = parse(color)
  return color == null
    ? [255,255,255,0] // transparent
    : [color.r, color.g, color.b, (color.a == null ? 1 : color.a)]
}

export default tween
