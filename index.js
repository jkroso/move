import HTML from './html'
import SVG from './svg'

export default (el, to) => {
  const move = el instanceof SVGElement ? new SVG(el) : new HTML(el)
  for (var key in to) move.set(key, to[key])
  return move
}
