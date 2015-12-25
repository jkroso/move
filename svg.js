import prefix from 'prefix'
import HTML from './html'

const attrs = [
  'cx', 'cy',
  'x',  'y',
  'd'
].reduce(function(attrs, key){
  attrs[key] = true
  return attrs
}, {})

export default class SVG extends HTML {
  set(k, v) {
    if (!(k in attrs)) k = prefix(k)
    this._to[k] = v
    return this
  }
  current(k) {
    if (k in attrs) return this.el.getAttribute(k)
    return getComputedStyle(this.el)[prefix(k)]
      || this.el.getAttribute(k)
  }
  render(n) {
    n = this._ease(n)
    const tweens = this.tweens
    for (var k in tweens) {
      if (k in attrs) this.el.setAttribute(k, tweens[k](n))
      else this.el.style[k] = tweens[k](n)
    }
    // HACK: force redraw because chrome has some buggy optimisations
    this.el.offsetHeight
    return this
  }
}
