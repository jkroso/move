
var prefix = require('prefix')
var Move = require('./move')

var attrs = [
  'cx', 'cy',
  'x',  'y',
  'd'
].reduce(function(attrs, key){
  attrs[key] = true
  return attrs
}, {})

module.exports = Move.extend({
  set: function(k, v){
    if (!(k in attrs)) k = prefix(k)
    this._to[k] = v
    return this
  },
  current: function(k){
    if (k in attrs) return this.el.getAttribute(k)
    return getComputedStyle(this.el)[prefix(k)]
      || this.el.getAttribute(k)
  },
  apply: function(style){
    for (var k in style) {
      if (k in attrs) this.el.setAttribute(k, style[k])
      else this.el.style[k] = style[k]
    }
  }
})
