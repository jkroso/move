(function(modules, aliases){

/**
 * init each module
 */

for (var file in modules) {
	modules[file].loaded = false
	modules[file].exports = {}
	modules[file].functor = modules[file]
}

/**
 * add aliases
 */

for (var alias in aliases) {
	if (!(alias in modules)) modules[alias] = modules[aliases[alias]]
}

/**
 * Require the given path.
 *
 * @param {String} path
 * @param {String} parent
 * @return {Any} module.exports
 */

function require(path, parent){
	var fullpath = resolve(parent, path)
	if (!fullpath) throw Error('failed to require '+path+' from '+parent)
	if (fullpath in aliases) fullpath = aliases[fullpath]
	var module = modules[fullpath]

	if (!module.loaded) {
		module.loaded = true
		var base = dirname(fullpath)
		module.call(module.exports, module, module.exports, function(path){
			if (path[0] == '.') path = join(base, path)
			return require(path, base)
		})
	}
	return module.exports
}

/**
 * Figure out what the full path to the module is
 *
 * @param {String} base, the current directory
 * @param {String} path, what was inside the call to require
 * @return {String}
 * @api private
 */

function resolve(base, path){
	// absolute
	if (/^\/|(?:\w+:\/\/)/.test(path)) {
		return complete(path)
	} else if (/^\./.test(path)) {
		// todo: fix join for urls
		return complete(join(base, path))
	}

	// walk up looking in node_modules
	while (true) {
		var res = complete(join(base, 'node_modules', path))
		if (res) return res
		if (base == '/' || base == '.') break
		base = dirname(base)
	}
}

/**
 * get the parent directory path
 *
 * @param {String} path
 * @return {String}
 */

function dirname(path){
	var i = path.lastIndexOf('/')
	if (i < 0) return '.'
	return path.slice(0, i) || '/'
}

/**
 * Clean up a messy path
 *
 *   normalize('/foo//baz/quux/..') // => '/foo/baz'
 *
 * @param {String} path
 * @return {String}
 */

function normalize(path){
  var segs = path.split('/')
  if (segs.length <= 1) return path
  var res = []
  var up = 0

  for (var i = 0, len = segs.length; i < len; i++) {
    var seg = segs[i]
    if (seg === '' || seg === '.') continue
    if (seg === '..') up++, res.pop()
    else up--, res.push(seg)
  }

  if (up > 0) {
    if (path[0] == '/') return '/'
    res = '..'
    while (--up) res += '/..'
    return res
  }
  return path[0] == '/'
    ? '/' + res.join('/')
    : res.join('/') || '.'
}

/**
 * Concatenate a sequence of path segments to generate one flat path
 * 
 * @param {String} [...]
 * @return {String}
 */

function join(path){
	for (var i = 1, len = arguments.length; i < len; i++) {
		path += '/' + arguments[i]
	}
  return normalize(path)
}

/**
 * Produce an ordered list of paths to try
 * 
 * @param {String} path
 * @return {Array} of path
 * @private
 */

function completions(path){
	// A directory
	if (path.match(/\/$/)) {
		return [
			path+'index.js',
			path+'index.json',
			path+'package.json'
		]
	}
	// could be a directory or a file
	return [
		path,
		path+'.js',
		path+'.json',
		path+'/index.js',
		path+'/index.json',
		path+'/package.json'
	]
}

/**
 * find the first matching path completion
 *
 * @param {String} path
 * @return {String} full path of the module
 */

function complete(path){
	return completions(path).filter(function (path) {
		return path in modules
	})[0]
}

return function(path){
	return require(path, '/')
}
})({
"/node_modules/css-install.js": function(module,exports,require){
module.exports = function (text) {
	var style = document.createElement('style')
	style.appendChild(document.createTextNode(text))
	document.getElementsByTagName('head')[0].appendChild(style)
}
},"/node_modules/jade-runtime.js": function(module,exports,require){

/*!
 * Jade - runtime
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Lame Array.isArray() polyfill for now.
 */

if (!Array.isArray) {
  Array.isArray = function(arr){
    return '[object Array]' == Object.prototype.toString.call(arr);
  };
}

/**
 * Lame Object.keys() polyfill for now.
 */

if (!Object.keys) {
  Object.keys = function(obj){
    var arr = [];
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        arr.push(key);
      }
    }
    return arr;
  }
}

/**
 * Merge two attribute objects giving precedence
 * to values in object `b`. Classes are special-cased
 * allowing for arrays and merging/joining appropriately
 * resulting in a string.
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Object} a
 * @api private
 */

exports.merge = function merge(a, b) {
  var ac = a['class'];
  var bc = b['class'];

  if (ac || bc) {
    ac = ac || [];
    bc = bc || [];
    if (!Array.isArray(ac)) ac = [ac];
    if (!Array.isArray(bc)) bc = [bc];
    a['class'] = ac.concat(bc).filter(nulls);
  }

  for (var key in b) {
    if (key != 'class') {
      a[key] = b[key];
    }
  }

  return a;
};

/**
 * Filter null `val`s.
 *
 * @param {*} val
 * @return {Boolean}
 * @api private
 */

function nulls(val) {
  return val != null && val !== '';
}

/**
 * join array as classes.
 *
 * @param {*} val
 * @return {String}
 * @api private
 */

function joinClasses(val) {
  return Array.isArray(val) ? val.map(joinClasses).filter(nulls).join(' ') : val;
}

/**
 * Render the given attributes object.
 *
 * @param {Object} obj
 * @param {Object} escaped
 * @return {String}
 * @api private
 */

exports.attrs = function attrs(obj, escaped){
  var buf = []
    , terse = obj.terse;

  delete obj.terse;
  var keys = Object.keys(obj)
    , len = keys.length;

  if (len) {
    buf.push('');
    for (var i = 0; i < len; ++i) {
      var key = keys[i]
        , val = obj[key];

      if ('boolean' == typeof val || null == val) {
        if (val) {
          terse
            ? buf.push(key)
            : buf.push(key + '="' + key + '"');
        }
      } else if (0 == key.indexOf('data') && 'string' != typeof val) {
        buf.push(key + "='" + JSON.stringify(val) + "'");
      } else if ('class' == key) {
        if (escaped && escaped[key]){
          if (val = exports.escape(joinClasses(val))) {
            buf.push(key + '="' + val + '"');
          }
        } else {
          if (val = joinClasses(val)) {
            buf.push(key + '="' + val + '"');
          }
        }
      } else if (escaped && escaped[key]) {
        buf.push(key + '="' + exports.escape(val) + '"');
      } else {
        buf.push(key + '="' + val + '"');
      }
    }
  }

  return buf.join(' ');
};

/**
 * Escape the given string of `html`.
 *
 * @param {String} html
 * @return {String}
 * @api private
 */

exports.escape = function escape(html){
  return String(html)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};

/**
 * Re-throw the given `err` in context to the
 * the jade in `filename` at the given `lineno`.
 *
 * @param {Error} err
 * @param {String} filename
 * @param {String} lineno
 * @api private
 */

exports.rethrow = function rethrow(err, filename, lineno, str){
  if (!(err instanceof Error)) throw err;
  if ((typeof window != 'undefined' || !filename) && !str) {
    err.message += ' on line ' + lineno;
    throw err;
  }
  try {
    str =  str || require('fs').readFileSync(filename, 'utf8')
  } catch (ex) {
    rethrow(err, null, lineno)
  }
  var context = 3
    , lines = str.split('\n')
    , start = Math.max(lineno - context, 0)
    , end = Math.min(lines.length, lineno + context);

  // Error context
  var context = lines.slice(start, end).map(function(line, i){
    var curr = i + start + 1;
    return (curr == lineno ? '  > ' : '    ')
      + curr
      + '| '
      + line;
  }).join('\n');

  // Alter exception message
  err.path = filename;
  err.message = (filename || 'Jade') + ':' + lineno
    + '\n' + context + '\n\n' + err.message;
  throw err;
};

},"/node_modules/css-install.js": function(module,exports,require){
module.exports = function (text) {
	var style = document.createElement('style')
	style.appendChild(document.createTextNode(text))
	document.getElementsByTagName('head')[0].appendChild(style)
}
},"/Users/jkroso/Dev/js/move/examples.original.js": function(module,exports,require){

var style = require('computed-style')
var move = require('move')
var dom = require('dom')
var css = require('css')

dom('.example').each(function(el){
	el.find('button.play').on('mousedown', function(){
		var boxs = el.find('.box.small')
		var boxs = [].slice.call(boxs.els)
		var box = boxs[0]
		eval(el.find('.source').text())
	})

	el.find('.box').each(function(box){
		box = box.get(0)
		box._css = {}
		var computed = style(box)
		for (var i = 0, len = computed.length; i < len; i++) {
			var key = computed[i]
			if (computed[key]) box._css[key] = computed[key]
		}
	})

	el.find('h3')
		.append('<button class="reset">↻</button>')
		.on('mousedown', function(e){
			el.find('.box').each(function(box){
				box = box.get(0)
				css(box, box._css)
			})
		})
})
},"/Users/jkroso/.packin/-/github.com/jkroso/computed-style/tarball/0.1.0/index.js": function(module,exports,require){

/**
 * Get the computed style of a DOM element
 * 
 *   style(document.body) // => {width:'500px', ...}
 * 
 * @param {Element} element
 * @return {Object}
 */

// Accessing via window for jsDOM support
module.exports = window.getComputedStyle

// Fallback to elem.currentStyle for IE < 9
if (!module.exports) {
	module.exports = function (elem) {
		return elem.currentStyle
	}
}

},"/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/master/index.js": function(module,exports,require){

var parseColor = require('color-parser')
var Emitter = require('emitter/light')
var style = require('computed-style')
var Tween = require('tween/tween')
var reset = Tween.prototype.reset
var tweens = require('./tweens')
var CSSMatrix = WebKitCSSMatrix
var prefix = require('prefix')
var merge = require('merge')
var raf = require('raf')
var css = require('css')

module.exports = function(el){
	return new Move(el)
}

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
  transform: 'matrix'
}
defaultTypes[transform] = 'matrix'

function defaultType(key){
	return defaultTypes[key] || 'px'
}

/**
 * the Move class
 *
 * @param {Element} el
 * @api public
 */

function Move(el){
	this._to = {}
	this._curr = {}
	this.el = el
}

/**
 * mixin methods
 */

merge(Move.prototype, Emitter.prototype)
merge(Move.prototype, Tween.prototype)
merge(Move, Tween)

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
 * Skew `x` and `y` degrees.
 *
 * @param {Number} x
 * @param {Number} y
 * @return {Move} for chaining
 * @api public
 */

Move.prototype.skew = function(x, y){
	x && this.skewX(x)
	y && this.skewY(y)
	return this
}

/**
 * Skew x by `n` degrees.
 *
 * @param {Number} n
 * @return {Move} for chaining
 * @api public
 */

Move.prototype.skewX = function(n){
	this._to[transform] = this.matrix().skewX(n)
	return this
}

/**
 * Skew y by `n` degrees.
 *
 * @param {Number} n
 * @return {Move} for chaining
 * @api public
 */

Move.prototype.skewY = function(n){
	this._to[transform] = this.matrix().skewY(n)
	return this
}

/**
 * Translate `x` and `y` axis.
 *
 * @param {Number} x
 * @param {Number} y
 * @param {Number} z
 * @return {Move} for chaining
 * @api public
 */

Move.prototype.translate = function(x, y, z){
	this._to[transform] = this.matrix().translate(x, y, z || 0)
	return this
}


/**
 * Translate on the x axis to `n`.
 *
 * @param {Number} n
 * @return {Move} for chaining
 * @api public
 */

Move.prototype.translateX =
Move.prototype.x = function(n){
	return this.translate(n, 0, 0)
}

/**
 * Translate on the y axis to `n`.
 *
 * @param {Number} n
 * @return {Move} for chaining
 * @api public
 */

Move.prototype.translateY =
Move.prototype.y = function(n){
	return this.translate(0, n, 0)
}

/**
 * Scale the x and y axis by `x`, or
 * individually scale `x` and `y`.
 *
 * @param {Number} x
 * @param {Number} y
 * @return {Move} for chaining
 * @api public
 */

Move.prototype.scale = function(x, y){
	this._to[transform] = this.matrix().scale(x, y, 1)
	return this
}

/**
 * Scale x axis by `n`.
 *
 * @param {Number} n
 * @return {Move} for chaining
 * @api public
 */

Move.prototype.scaleX = function(n){
	return this.scale(n, 1, 1)
}

/**
 * Scale y axis by `n`.
 *
 * @param {Number} n
 * @return {Move} for chaining
 * @api public
 */

Move.prototype.scaleY = function(n){
	return this.scale(1, n, 1)
}

/**
 * Rotate `n` degrees.
 *
 * @param {Number} n
 * @return {Move} for chaining
 * @api public
 */

Move.prototype.rotate = function(n){
	this._to[transform] = this.matrix().rotate(n)
	return this
}

/**
 * get the transformation matrix
 *
 * @return {CSSMatrix}
 * @api private
 */

Move.prototype.matrix = function(){
	if (transform in this._to) return this._to[transform]
	var matrix = this.current(transform)
	if (typeof matrix == 'string') matrix = new CSSMatrix(matrix)
	return this._to[transform] = matrix
}

/**
 * create a frame at point `p` through the animation
 *
 * @param {Number} p
 * @return {Object}
 * @api private
 */

Move.prototype.frame = function(p){
	var tweens = this.tweens()
	var curr = this._curr
	for (var k in tweens) {
		curr[k] = tweens[k].frame(p)
	}
	return curr
}

/**
 * Generate tweens. This should be called
 * as late as possible
 *
 * @return {Object}
 * @api private
 */

Move.prototype.tweens = function(){
	if (this._tweens) return this._tweens
	var tweens = this._tweens = {}
	for (var key in this._to) {
		var from = this.current(key)
		var to = this._to[key]
		tweens[key] = tween(key, from, to)
	}
	return tweens
}

function tween(prop, from, to){
	var Tween = typeof from == 'string' && tweens[type(from)]
	if (!Tween) Tween = tweens[defaultType(prop)]
	return new Tween(from, to)
}

/**
 * determine type of `css` value
 *
 * @param {String|Number} css
 * @return {String}
 * @api private
 */

function type(css){
	if (/^matrix(3d)?\([^)]*\)$/.test(css)) return 'matrix'
	if (/^[-.\d]+px/.test(css)) return 'px'
	if (parseColor(css)) return 'color'
}

/**
 * reset the animation so it can be re-used
 *
 * @return {this}
 * @api public
 */

Move.prototype.reset = function(){
	var tweens = this.tweens()
	for (var tween in tweens) {
		tweens[tween].reset().ease(this._ease)
	}
	reset.call(this)
	this._curr = {}
	return this
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
		if (prop in parent._to) return parent._to[prop]
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
		css(self.el, self.next())
		if (self.done) self.emit('end')
		else raf(loop)
	})
	this.running = true
	reset.call(this)
	return this
}

Move.prototype.on('end', function(){
	this.running = false
})
},"/Users/jkroso/.packin/-/github.com/component/dom/tarball/0.9.0/index.js": function(module,exports,require){
/**
 * Module dependencies.
 */

var matches = require('matches-selector');
var delegate = require('delegate');
var classes = require('classes');
var traverse = require('traverse');
var indexof = require('indexof');
var domify = require('domify');
var events = require('event');
var value = require('value');
var query = require('query');
var type = require('type');
var css = require('css');

/**
 * Attributes supported.
 */

var attrs = [
  'id',
  'src',
  'rel',
  'cols',
  'rows',
  'type',
  'name',
  'href',
  'title',
  'style',
  'width',
  'height',
  'action',
  'method',
  'tabindex',
  'placeholder'
];

/**
 * Expose `dom()`.
 */

exports = module.exports = dom;

/**
 * Expose supported attrs.
 */

exports.attrs = attrs;

/**
 * Return a dom `List` for the given
 * `html`, selector, or element.
 *
 * @param {String|Element|List}
 * @return {List}
 * @api public
 */

function dom(selector, context) {
  // array
  if (Array.isArray(selector)) {
    return new List(selector);
  }

  // List
  if (selector instanceof List) {
    return selector;
  }

  // node
  if (selector.nodeName) {
    return new List([selector]);
  }

  if ('string' != typeof selector) {
    throw new TypeError('invalid selector');
  }

  // html
  if ('<' == selector.charAt(0)) {
    return new List([domify(selector)], selector);
  }

  // selector
  var ctx = context
    ? (context.els ? context.els[0] : context)
    : document;

  return new List(query.all(selector, ctx), selector);
}

/**
 * Expose `List` constructor.
 */

exports.List = List;

/**
 * Initialize a new `List` with the
 * given array-ish of `els` and `selector`
 * string.
 *
 * @param {Mixed} els
 * @param {String} selector
 * @api private
 */

function List(els, selector) {
  this.els = els || [];
  this.selector = selector;
}

/**
 * Enumerable iterator.
 */

List.prototype.__iterate__ = function(){
  var self = this;
  return {
    length: function(){ return self.els.length },
    get: function(i){ return new List([self.els[i]]) }
  }
};

/**
 * Remove elements from the DOM.
 *
 * @api public
 */

List.prototype.remove = function(){
  for (var i = 0; i < this.els.length; i++) {
    var el = this.els[i];
    var parent = el.parentNode;
    if (parent) parent.removeChild(el);
  }
};

/**
 * Set attribute `name` to `val`, or get attr `name`.
 *
 * @param {String} name
 * @param {String} [val]
 * @return {String|List} self
 * @api public
 */

List.prototype.attr = function(name, val){
  // get
  if (1 == arguments.length) {
    return this.els[0] && this.els[0].getAttribute(name);
  }

  // remove
  if (null == val) {
    return this.removeAttr(name);
  }

  // set
  return this.forEach(function(el){
    el.setAttribute(name, val);
  });
};

/**
 * Remove attribute `name`.
 *
 * @param {String} name
 * @return {List} self
 * @api public
 */

List.prototype.removeAttr = function(name){
  return this.forEach(function(el){
    el.removeAttribute(name);
  });
};

/**
 * Set property `name` to `val`, or get property `name`.
 *
 * @param {String} name
 * @param {String} [val]
 * @return {Object|List} self
 * @api public
 */

List.prototype.prop = function(name, val){
  if (1 == arguments.length) {
    return this.els[0] && this.els[0][name];
  }

  return this.forEach(function(el){
    el[name] = val;
  });
};

/**
 * Get the first element's value or set selected
 * element values to `val`.
 *
 * @param {Mixed} [val]
 * @return {Mixed}
 * @api public
 */

List.prototype.val =
List.prototype.value = function(val){
  if (0 == arguments.length) {
    return this.els[0]
      ? value(this.els[0])
      : undefined;
  }

  return this.forEach(function(el){
    value(el, val);
  });
};

/**
 * Return a cloned `List` with all elements cloned.
 *
 * @return {List}
 * @api public
 */

List.prototype.clone = function(){
  var arr = [];
  for (var i = 0, len = this.els.length; i < len; ++i) {
    arr.push(this.els[i].cloneNode(true));
  }
  return new List(arr);
};

/**
 * Prepend `val`.
 *
 * @param {String|Element|List} val
 * @return {List} new list
 * @api public
 */

List.prototype.prepend = function(val){
  var el = this.els[0];
  if (!el) return this;
  val = dom(val);
  for (var i = 0; i < val.els.length; ++i) {
    if (el.children.length) {
      el.insertBefore(val.els[i], el.firstChild);
    } else {
      el.appendChild(val.els[i]);
    }
  }
  return val;
};

/**
 * Append `val`.
 *
 * @param {String|Element|List} val
 * @return {List} new list
 * @api public
 */

List.prototype.append = function(val){
  var el = this.els[0];
  if (!el) return this;
  val = dom(val);
  for (var i = 0; i < val.els.length; ++i) {
    el.appendChild(val.els[i]);
  }
  return val;
};

/**
 * Append self's `el` to `val`
 *
 * @param {String|Element|List} val
 * @return {List} self
 * @api public
 */

List.prototype.appendTo = function(val){
  dom(val).append(this);
  return this;
};

/**
 * Insert self's `els` after `val`
 *
 * @param {String|Element|List} val
 * @return {List} self
 * @api public
 */

List.prototype.insertAfter = function(val){
  val = dom(val).els[0];
  if (!val || !val.parentNode) return this;
  this.els.forEach(function(el){
    val.parentNode.insertBefore(el, val.nextSibling);
  });
  return this;
};

/**
 * Return a `List` containing the element at `i`.
 *
 * @param {Number} i
 * @return {List}
 * @api public
 */

List.prototype.at = function(i){
  return new List([this.els[i]], this.selector);
};

/**
 * Return a `List` containing the first element.
 *
 * @param {Number} i
 * @return {List}
 * @api public
 */

List.prototype.first = function(){
  return new List([this.els[0]], this.selector);
};

/**
 * Return a `List` containing the last element.
 *
 * @param {Number} i
 * @return {List}
 * @api public
 */

List.prototype.last = function(){
  return new List([this.els[this.els.length - 1]], this.selector);
};

/**
 * Return an `Element` at `i`.
 *
 * @param {Number} i
 * @return {Element}
 * @api public
 */

List.prototype.get = function(i){
  return this.els[i || 0];
};

/**
 * Return list length.
 *
 * @return {Number}
 * @api public
 */

List.prototype.length = function(){
  return this.els.length;
};

/**
 * Return element text.
 *
 * @param {String} str
 * @return {String|List}
 * @api public
 */

List.prototype.text = function(str){
  // TODO: real impl
  if (1 == arguments.length) {
    this.forEach(function(el){
      el.textContent = str;
    });
    return this;
  }

  var str = '';
  for (var i = 0; i < this.els.length; ++i) {
    str += this.els[i].textContent;
  }
  return str;
};

/**
 * Return element html.
 *
 * @return {String} html
 * @api public
 */

List.prototype.html = function(html){
  if (1 == arguments.length) {
    this.forEach(function(el){
      el.innerHTML = html;
    });
  }
  // TODO: real impl
  return this.els[0] && this.els[0].innerHTML;
};

/**
 * Bind to `event` and invoke `fn(e)`. When
 * a `selector` is given then events are delegated.
 *
 * @param {String} event
 * @param {String} [selector]
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {List}
 * @api public
 */

List.prototype.on = function(event, selector, fn, capture){
  if ('string' == typeof selector) {
    for (var i = 0; i < this.els.length; ++i) {
      fn._delegate = delegate.bind(this.els[i], selector, event, fn, capture);
    }
    return this;
  }

  capture = fn;
  fn = selector;

  for (var i = 0; i < this.els.length; ++i) {
    events.bind(this.els[i], event, fn, capture);
  }

  return this;
};

/**
 * Unbind to `event` and invoke `fn(e)`. When
 * a `selector` is given then delegated event
 * handlers are unbound.
 *
 * @param {String} event
 * @param {String} [selector]
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {List}
 * @api public
 */

List.prototype.off = function(event, selector, fn, capture){
  if ('string' == typeof selector) {
    for (var i = 0; i < this.els.length; ++i) {
      // TODO: add selector support back
      delegate.unbind(this.els[i], event, fn._delegate, capture);
    }
    return this;
  }

  capture = fn;
  fn = selector;

  for (var i = 0; i < this.els.length; ++i) {
    events.unbind(this.els[i], event, fn, capture);
  }
  return this;
};

/**
 * Iterate elements and invoke `fn(list, i)`.
 *
 * @param {Function} fn
 * @return {List} self
 * @api public
 */

List.prototype.each = function(fn){
  for (var i = 0; i < this.els.length; ++i) {
    fn(new List([this.els[i]], this.selector), i);
  }
  return this;
};

/**
 * Iterate elements and invoke `fn(el, i)`.
 *
 * @param {Function} fn
 * @return {List} self
 * @api public
 */

List.prototype.forEach = function(fn){
  for (var i = 0; i < this.els.length; ++i) {
    fn(this.els[i], i);
  }
  return this;
};

/**
 * Map elements invoking `fn(list, i)`.
 *
 * @param {Function} fn
 * @return {Array}
 * @api public
 */

List.prototype.map = function(fn){
  var arr = [];
  for (var i = 0; i < this.els.length; ++i) {
    arr.push(fn(new List([this.els[i]], this.selector), i));
  }
  return arr;
};

/**
 * Filter elements invoking `fn(list, i)`, returning
 * a new `List` of elements when a truthy value is returned.
 *
 * @param {Function} fn
 * @return {List}
 * @api public
 */

List.prototype.select =
List.prototype.filter = function(fn){
  var el;
  var list = new List([], this.selector);
  for (var i = 0; i < this.els.length; ++i) {
    el = this.els[i];
    if (fn(new List([el], this.selector), i)) list.els.push(el);
  }
  return list;
};

/**
 * Filter elements invoking `fn(list, i)`, returning
 * a new `List` of elements when a falsey value is returned.
 *
 * @param {Function} fn
 * @return {List}
 * @api public
 */

List.prototype.reject = function(fn){
  var el;
  var list = new List([], this.selector);
  for (var i = 0; i < this.els.length; ++i) {
    el = this.els[i];
    if (!fn(new List([el], this.selector), i)) list.els.push(el);
  }
  return list;
};

/**
 * Add the given class `name`.
 *
 * @param {String} name
 * @return {List} self
 * @api public
 */

List.prototype.addClass = function(name){
  var el;
  for (var i = 0; i < this.els.length; ++i) {
    el = this.els[i];
    el._classes = el._classes || classes(el);
    el._classes.add(name);
  }
  return this;
};

/**
 * Remove the given class `name`.
 *
 * @param {String|RegExp} name
 * @return {List} self
 * @api public
 */

List.prototype.removeClass = function(name){
  var el;

  if ('regexp' == type(name)) {
    for (var i = 0; i < this.els.length; ++i) {
      el = this.els[i];
      el._classes = el._classes || classes(el);
      var arr = el._classes.array();
      for (var j = 0; j < arr.length; j++) {
        if (name.test(arr[j])) {
          el._classes.remove(arr[j]);
        }
      }
    }
    return this;
  }

  for (var i = 0; i < this.els.length; ++i) {
    el = this.els[i];
    el._classes = el._classes || classes(el);
    el._classes.remove(name);
  }

  return this;
};

/**
 * Toggle the given class `name`,
 * optionally a `bool` may be given
 * to indicate that the class should
 * be added when truthy.
 *
 * @param {String} name
 * @param {Boolean} bool
 * @return {List} self
 * @api public
 */

List.prototype.toggleClass = function(name, bool){
  var el;
  var fn = 'toggle';

  // toggle with boolean
  if (2 == arguments.length) {
    fn = bool ? 'add' : 'remove';
  }

  for (var i = 0; i < this.els.length; ++i) {
    el = this.els[i];
    el._classes = el._classes || classes(el);
    el._classes[fn](name);
  }

  return this;
};

/**
 * Check if the given class `name` is present.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

List.prototype.hasClass = function(name){
  var el;
  for (var i = 0; i < this.els.length; ++i) {
    el = this.els[i];
    el._classes = el._classes || classes(el);
    if (el._classes.has(name)) return true;
  }
  return false;
};

/**
 * Set CSS `prop` to `val` or get `prop` value.
 * Also accepts an object (`prop`: `val`)
 *
 * @param {String} prop
 * @param {Mixed} val
 * @return {List|String}
 * @api public
 */

List.prototype.css = function(prop, val){
  if (2 == arguments.length) {
    var obj = {};
    obj[prop] = val;
    return this.setStyle(obj);
  }

  if ('object' == type(prop)) {
    return this.setStyle(prop);
  }

  return this.getStyle(prop);
};

/**
 * Set CSS `props`.
 *
 * @param {Object} props
 * @return {List} self
 * @api private
 */

List.prototype.setStyle = function(props){
  for (var i = 0; i < this.els.length; ++i) {
    css(this.els[i], props);
  }
  return this;
};

/**
 * Get CSS `prop` value.
 *
 * @param {String} prop
 * @return {String}
 * @api private
 */

List.prototype.getStyle = function(prop){
  var el = this.els[0];
  if (el) return el.style[prop];
};

/**
 * Find children matching the given `selector`.
 *
 * @param {String} selector
 * @return {List}
 * @api public
 */

List.prototype.find = function(selector){
  return dom(selector, this);
};

/**
 * Empty the dom list
 *
 * @return self
 * @api public
 */

List.prototype.empty = function(){
  var elem, el;

  for (var i = 0; i < this.els.length; ++i) {
    el = this.els[i];
    while (el.firstChild) {
      el.removeChild(el.firstChild);
    }
  }

  return this;
}

/**
 * Check if the first element matches `selector`.
 *
 * @param {String} selector
 * @return {Boolean}
 * @api public
 */

List.prototype.is = function(selector){
  return matches(this.get(0), selector);
};

/**
 * Get parent(s) with optional `selector` and `limit`
 *
 * @param {String} selector
 * @param {Number} limit
 * @return {List}
 * @api public
 */

List.prototype.parent = function(selector, limit){
  return new List(traverse('parentNode',
    this.get(0),
    selector,
    limit
    || 1));
};

/**
 * Get next element(s) with optional `selector` and `limit`.
 *
 * @param {String} selector
 * @param {Number} limit
 * @retrun {List}
 * @api public
 */

List.prototype.next = function(selector, limit){
  return new List(traverse('nextSibling',
    this.get(0),
    selector,
    limit
    || 1));
};

/**
 * Get previous element(s) with optional `selector` and `limit`.
 *
 * @param {String} selector
 * @param {Number} limit
 * @return {List}
 * @api public
 */

List.prototype.prev =
List.prototype.previous = function(selector, limit){
  return new List(traverse('previousSibling',
    this.get(0),
    selector,
    limit
    || 1));
};

/**
 * Attribute accessors.
 */

attrs.forEach(function(name){
  List.prototype[name] = function(val){
    if (0 == arguments.length) return this.attr(name);
    return this.attr(name, val);
  };
});


},"/Users/jkroso/.packin/-/github.com/component/css/tarball/0.0.2/index.js": function(module,exports,require){

/**
 * Properties to ignore appending "px".
 */

var ignore = {
  columnCount: true,
  fillOpacity: true,
  fontWeight: true,
  lineHeight: true,
  opacity: true,
  orphans: true,
  widows: true,
  zIndex: true,
  zoom: true
};

/**
 * Set `el` css values.
 *
 * @param {Element} el
 * @param {Object} obj
 * @return {Element}
 * @api public
 */

module.exports = function(el, obj){
  for (var key in obj) {
    var val = obj[key];
    if ('number' == typeof val && !ignore[key]) val += 'px';
    el.style[key] = val;
  }
  return el;
};

},"/Users/jkroso/.packin/-/github.com/jkroso/emitter/tarball/0.9.0/light.js": function(module,exports,require){

/**
 * A highly optimised emitter implementation. Optimised to 
 * minimize both memory and CPU consumption. Its good for 
 * implementing simple but hot things like streams. 
 */

var mixin = require('merge')
var own = {}.hasOwnProperty
var call = Function.call

module.exports = Emitter

function Emitter(obj){
	if (obj) return mixin(obj, Emitter.prototype)
}

Emitter.prototype.emit = function(topic){
	var sub = this._events
	if (!(sub && (sub = sub[topic]))) return this
	// single subsription case
	if (typeof sub == 'function') {
		// avoid using .apply() for speed
		switch (arguments.length) {
			case 1: sub.call(this);break
			case 2: sub.call(this, arguments[1]);break
			case 3: sub.call(this, arguments[1], arguments[2]);break
			case 4: sub.call(this, arguments[1], arguments[2], arguments[3]);break
			default:
				// `arguments` is magic :)
				topic = this
				call.apply(sub, arguments)
		}
	} else {
		var ƒ
		var i = 0
		var l = sub.length
		switch (arguments.length) {
			case 1: while (i < l) sub[i++].call(this);break
			case 2: while (i < l) sub[i++].call(this, arguments[1]);break
			case 3: while (i < l) sub[i++].call(this, arguments[1], arguments[2]);break
			case 4: while (i < l) sub[i++].call(this, arguments[1], arguments[2], arguments[3]);break
			default:
				topic = this
				while (i < l) call.apply(sub[i++], arguments)
		}
	}
	return this
}

Emitter.prototype.on = function(topic, fn){
	if (!own.call(this, '_events')) {
		this._events = clone(this._events)
	}
	var events = this._events
	if (typeof events[topic] == 'function') {
		events[topic] = [events[topic], fn]
	} else if (events[topic]) {
		events[topic].push(fn)
	} else {
		events[topic] = fn
	}
	return this
}

function clone(o){
	var c = {}
	for (var k in o) {
		c[k] = typeof o[k] == 'object'
			? o[k].slice()
			: o[k]
	}
	return c
}

Emitter.prototype.off = function(topic, fn){
	if (!this._events) return this
	if (!own.call(this, '_events')) {
		this._events = clone(this._events)
	}
	var events = this._events

	if (topic == null) {
		for (var i in events) delete events[i]
	} else if (fn == null) {
		delete events[topic]
	} else {
		var subs = events[topic]
		if (!subs) return this
		if (typeof subs == 'function') {
			if (subs === fn) delete events[topic]
		} else {
			subs = events[topic] = subs.filter(function(ƒ){
				return ƒ !== fn
			})
			// tidy
			if (subs.length == 1) events[topic] = subs[0]
			else if (!subs.length) delete events[topic]
		}
	}
	return this
}

Emitter.prototype.once = function(topic, fn){
	var self = this
	return this.on(topic, function once() {
		self.off(topic, once)
		fn.apply(this, arguments)
	})
}

Emitter.hasSubscription = function(emitter, topic, fn){
	var fns = Emitter.subscriptions(emitter, topic)
	if (fn == null) return Boolean(fns.length)
	return fns.indexOf(fn) >= 0
}

Emitter.subscriptions = function(emitter, topic){
	var fns = emitter._events
	if (!fns || !(fns = fns[topic])) return []
	if (typeof fns == 'function') return [fns]
	return fns.slice()
}
},"/Users/jkroso/.packin/-/github.com/jkroso/tween/tarball/0.3.2/tween.js": function(module,exports,require){

var extensible = require('extensible')
var ease = require('ease')
var now = require('now')

module.exports = Tween

/**
 * Tweening base class
 *
 * @param {Any} from
 * @param {Any} to
 * @api public
 */

function Tween(from, to){
	this._from = from
	this._to = to
}

/**
 * add extend method
 */

extensible(Tween)

/**
 * default settings
 */

Tween.prototype._ease = ease.linear
Tween.prototype._duration = 500
Tween.prototype.done = false

/**
 * Reset the tweens timer and state. Call this before
 * calling `.next()` for the first time
 *
 *   this.reset()
 *   while (!this.done) this.next()
 *
 * @api public
 */

Tween.prototype.reset = function(){
	this._start = now()
	this.done = false
	return this
}

/**
 * retarget the tween towards `val`. `this.from`
 * will be set to the tweens current value unless
 * `this._to` is currently `null`. Calls `reset()`
 * internally
 *
 *   tween.to({ x: 50, y: 100 })
 *
 * @param {Any} val
 * @return {this}
 * @api public
 */

Tween.prototype.to = function(val){
	if (this._to != null) {
		this._from = this.done === false
			? this.next()
			: this._to
	}
	this._to = val
	this.reset()
	return this
}

/**
 * set the base value to `val`
 *
 * @param {Any} val
 * @return {this}
 * @api public
 */

Tween.prototype.from = function(val){
	this._from = val
	return this
}

/**
 * Set duration to `ms` [500].
 *
 * @param {Number} ms
 * @return {this}
 * @api public
 */

Tween.prototype.duration = function(ms){
	this._duration = ms
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

Tween.prototype.ease = function(fn){
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

Tween.prototype.next = function(){
	var progress = (now() - this._start) / this._duration

	if (progress >= 1) {
		this.done = true
		return this._to
	}

	return this.frame(this._ease(progress))
}

/**
 * generate a tween frame at point `p` between
 * `this._from` and `this._to`. To be defined in
 * sub-classes
 *
 *   tween(1, 3).frame(.5) // => 2
 *
 * @param {Number} percent
 * @return {Any}
 * @api public
 */

Tween.prototype.frame
},"/Users/jkroso/.packin/-/github.com/jkroso/prefix/tarball/0.1.0/index.js": function(module,exports,require){

var style = document.createElement('p').style
var prefixes = 'O ms Moz webkit'.split(' ')

var memo = {}

/**
 * memoized `prefix`
 *
 * @param {String} key
 * @return {String}
 * @api public
 */

module.exports = exports = function(key){
	return key in memo
		? memo[key]
		: memo[key] = prefix(key)
}

exports.prefix = prefix

/**
 * prefix `key`
 *
 *   prefix('transform') // => webkitTransform
 *
 * @param {String} key
 * @return {String}
 * @api public
 */

function prefix(key){
	// without prefix
	if (style[key] !== undefined) return key

	// with prefix
	var Key = capitalize(key)
	var i = prefixes.length
	while (i--) {
		var name = prefixes[i] + Key
		if (style[name] !== undefined) return name
	}

	throw new Error('unable to prefix ' + key)
}

function capitalize(str){
	return str.charAt(0).toUpperCase() + str.slice(1)
}
},"/Users/jkroso/.packin/-/github.com/component/matches-selector/tarball/master/index.js": function(module,exports,require){
/**
 * Module dependencies.
 */

var query = require('query');

/**
 * Element prototype.
 */

var proto = Element.prototype;

/**
 * Vendor function.
 */

var vendor = proto.matchesSelector
  || proto.webkitMatchesSelector
  || proto.mozMatchesSelector
  || proto.msMatchesSelector
  || proto.oMatchesSelector;

/**
 * Expose `match()`.
 */

module.exports = match;

/**
 * Match `el` to `selector`.
 *
 * @param {Element} el
 * @param {String} selector
 * @return {Boolean}
 * @api public
 */

function match(el, selector) {
  if (vendor) return vendor.call(el, selector);
  var nodes = query.all(selector, el.parentNode);
  for (var i = 0; i < nodes.length; ++i) {
    if (nodes[i] == el) return true;
  }
  return false;
}

},"/Users/jkroso/.packin/-/github.com/component/delegate/tarball/0.1.0/index.js": function(module,exports,require){

/**
 * Module dependencies.
 */

var matches = require('matches-selector')
  , event = require('event');

/**
 * Delegate event `type` to `selector`
 * and invoke `fn(e)`. A callback function
 * is returned which may be passed to `.unbind()`.
 *
 * @param {Element} el
 * @param {String} selector
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.bind = function(el, selector, type, fn, capture){
  return event.bind(el, type, function(e){
    if (matches(e.target, selector)) fn(e);
  }, capture);
  return callback;
};

/**
 * Unbind event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @api public
 */

exports.unbind = function(el, type, fn, capture){
  event.unbind(el, type, fn, capture);
};

},"/Users/jkroso/.packin/-/github.com/component/classes/tarball/1.1.2/index.js": function(module,exports,require){

/**
 * Module dependencies.
 */

var index = require('indexof');

/**
 * Whitespace regexp.
 */

var re = /\s+/;

/**
 * toString reference.
 */

var toString = Object.prototype.toString;

/**
 * Wrap `el` in a `ClassList`.
 *
 * @param {Element} el
 * @return {ClassList}
 * @api public
 */

module.exports = function(el){
  return new ClassList(el);
};

/**
 * Initialize a new ClassList for `el`.
 *
 * @param {Element} el
 * @api private
 */

function ClassList(el) {
  this.el = el;
  this.list = el.classList;
}

/**
 * Add class `name` if not already present.
 *
 * @param {String} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.add = function(name){
  // classList
  if (this.list) {
    this.list.add(name);
    return this;
  }

  // fallback
  var arr = this.array();
  var i = index(arr, name);
  if (!~i) arr.push(name);
  this.el.className = arr.join(' ');
  return this;
};

/**
 * Remove class `name` when present, or
 * pass a regular expression to remove
 * any which match.
 *
 * @param {String|RegExp} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.remove = function(name){
  if ('[object RegExp]' == toString.call(name)) {
    return this.removeMatching(name);
  }

  // classList
  if (this.list) {
    this.list.remove(name);
    return this;
  }

  // fallback
  var arr = this.array();
  var i = index(arr, name);
  if (~i) arr.splice(i, 1);
  this.el.className = arr.join(' ');
  return this;
};

/**
 * Remove all classes matching `re`.
 *
 * @param {RegExp} re
 * @return {ClassList}
 * @api private
 */

ClassList.prototype.removeMatching = function(re){
  var arr = this.array();
  for (var i = 0; i < arr.length; i++) {
    if (re.test(arr[i])) {
      this.remove(arr[i]);
    }
  }
  return this;
};

/**
 * Toggle class `name`.
 *
 * @param {String} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.toggle = function(name){
  // classList
  if (this.list) {
    this.list.toggle(name);
    return this;
  }

  // fallback
  if (this.has(name)) {
    this.remove(name);
  } else {
    this.add(name);
  }
  return this;
};

/**
 * Return an array of classes.
 *
 * @return {Array}
 * @api public
 */

ClassList.prototype.array = function(){
  var str = this.el.className.replace(/^\s+|\s+$/g, '');
  var arr = str.split(re);
  if ('' === arr[0]) arr.shift();
  return arr;
};

/**
 * Check if class `name` is present.
 *
 * @param {String} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.has =
ClassList.prototype.contains = function(name){
  return this.list
    ? this.list.contains(name)
    : !! ~index(this.array(), name);
};

},"/Users/jkroso/.packin/-/github.com/component/indexof/tarball/0.0.1/index.js": function(module,exports,require){

var indexOf = [].indexOf;

module.exports = function(arr, obj){
  if (indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
},"/Users/jkroso/.packin/-/github.com/component/domify/tarball/1.0.0/index.js": function(module,exports,require){

/**
 * Expose `parse`.
 */

module.exports = parse;

/**
 * Wrap map from jquery.
 */

var map = {
  option: [1, '<select multiple="multiple">', '</select>'],
  optgroup: [1, '<select multiple="multiple">', '</select>'],
  legend: [1, '<fieldset>', '</fieldset>'],
  thead: [1, '<table>', '</table>'],
  tbody: [1, '<table>', '</table>'],
  tfoot: [1, '<table>', '</table>'],
  colgroup: [1, '<table>', '</table>'],
  caption: [1, '<table>', '</table>'],
  tr: [2, '<table><tbody>', '</tbody></table>'],
  td: [3, '<table><tbody><tr>', '</tr></tbody></table>'],
  th: [3, '<table><tbody><tr>', '</tr></tbody></table>'],
  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],
  _default: [0, '', '']
};

/**
 * Parse `html` and return the children.
 *
 * @param {String} html
 * @return {Array}
 * @api private
 */

function parse(html) {
  if ('string' != typeof html) throw new TypeError('String expected');

  // tag name
  var m = /<([\w:]+)/.exec(html);
  if (!m) throw new Error('No elements were generated.');
  var tag = m[1];

  // body support
  if (tag == 'body') {
    var el = document.createElement('html');
    el.innerHTML = html;
    return el.removeChild(el.lastChild);
  }

  // wrap map
  var wrap = map[tag] || map._default;
  var depth = wrap[0];
  var prefix = wrap[1];
  var suffix = wrap[2];
  var el = document.createElement('div');
  el.innerHTML = prefix + html + suffix;
  while (depth--) el = el.lastChild;

  var els = el.children;
  if (1 == els.length) {
    return el.removeChild(els[0]);
  }

  var fragment = document.createDocumentFragment();
  while (els.length) {
    fragment.appendChild(el.removeChild(els[0]));
  }

  return fragment;
}

},"/Users/jkroso/.packin/-/github.com/component/event/tarball/0.1.0/index.js": function(module,exports,require){

/**
 * Bind `el` event `type` to `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.bind = function(el, type, fn, capture){
  if (el.addEventListener) {
    el.addEventListener(type, fn, capture);
  } else {
    el.attachEvent('on' + type, fn);
  }
  return fn;
};

/**
 * Unbind `el` event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.unbind = function(el, type, fn, capture){
  if (el.removeEventListener) {
    el.removeEventListener(type, fn, capture);
  } else {
    el.detachEvent('on' + type, fn);
  }
  return fn;
};

},"/Users/jkroso/.packin/-/github.com/component/value/tarball/1.1.0/index.js": function(module,exports,require){

/**
 * Module dependencies.
 */

var typeOf = require('type');

/**
 * Set or get `el`'s' value.
 *
 * @param {Element} el
 * @param {Mixed} val
 * @return {Mixed}
 * @api public
 */

module.exports = function(el, val){
  if (2 == arguments.length) return set(el, val);
  return get(el);
};

/**
 * Get `el`'s value.
 */

function get(el) {
  switch (type(el)) {
    case 'checkbox':
    case 'radio':
      if (el.checked) {
        var attr = el.getAttribute('value');
        return null == attr ? true : attr;
      } else {
        return false;
      }
    case 'radiogroup':
      for (var i = 0, radio; radio = el[i]; i++) {
        if (radio.checked) return radio.value;
      }
      break;
    case 'select':
      for (var i = 0, option; option = el.options[i]; i++) {
        if (option.selected) return option.value;
      }
      break;
    default:
      return el.value;
  }
}

/**
 * Set `el`'s value.
 */

function set(el, val) {
  switch (type(el)) {
    case 'checkbox':
    case 'radio':
      if (val) {
        el.checked = true;
      } else {
        el.checked = false;
      }
      break;
    case 'radiogroup':
      for (var i = 0, radio; radio = el[i]; i++) {
        radio.checked = radio.value === val;
      }
      break;
    case 'select':
      for (var i = 0, option; option = el.options[i]; i++) {
        option.selected = option.value === val;
      }
      break;
    default:
      el.value = val;
  }
}

/**
 * Element type.
 */

function type(el) {
  var group = 'array' == typeOf(el) || 'object' == typeOf(el);
  if (group) el = el[0];
  var name = el.nodeName.toLowerCase();
  var type = el.getAttribute('type');

  if (group && type && 'radio' == type.toLowerCase()) return 'radiogroup';
  if ('input' == name && type && 'checkbox' == type.toLowerCase()) return 'checkbox';
  if ('input' == name && type && 'radio' == type.toLowerCase()) return 'radio';
  if ('select' == name) return 'select';
  return name;
}

},"/Users/jkroso/.packin/-/github.com/component/query/tarball/0.0.1/index.js": function(module,exports,require){

function one(selector, el) {
  return el.querySelector(selector);
}

exports = module.exports = function(selector, el){
  el = el || document;
  return one(selector, el);
};

exports.all = function(selector, el){
  el = el || document;
  return el.querySelectorAll(selector);
};

exports.engine = function(obj){
  if (!obj.one) throw new Error('.one callback required');
  if (!obj.all) throw new Error('.all callback required');
  one = obj.one;
  exports.all = obj.all;
};

},"/Users/jkroso/.packin/-/github.com/component/type/tarball/1.0.0/index.js": function(module,exports,require){

/**
 * toString ref.
 */

var toString = Object.prototype.toString;

/**
 * Return the type of `val`.
 *
 * @param {Mixed} val
 * @return {String}
 * @api public
 */

module.exports = function(val){
  switch (toString.call(val)) {
    case '[object Function]': return 'function';
    case '[object Date]': return 'date';
    case '[object RegExp]': return 'regexp';
    case '[object Arguments]': return 'arguments';
    case '[object Array]': return 'array';
    case '[object String]': return 'string';
  }

  if (val === null) return 'null';
  if (val === undefined) return 'undefined';
  if (val && val.nodeType === 1) return 'element';
  if (val === Object(val)) return 'object';

  return typeof val;
};

},"/Users/jkroso/.packin/-/github.com/component/color-parser/tarball/0.1.0/index.js": function(module,exports,require){

/**
 * Module dependencies.
 */

var colors = require('./colors');

/**
 * Expose `parse`.
 */

module.exports = parse;

/**
 * Parse `str`.
 *
 * @param {String} str
 * @return {Object}
 * @api public
 */

function parse(str) {
  return named(str)
    || hex3(str)
    || hex6(str)
    || rgb(str)
    || rgba(str);
}

/**
 * Parse named css color `str`.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function named(str) {
  var c = colors[str.toLowerCase()];
  if (!c) return;
  return {
    r: c[0],
    g: c[1],
    b: c[2]
  }
}

/**
 * Parse rgb(n, n, n)
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function rgb(str) {
  if (0 == str.indexOf('rgb(')) {
    str = str.match(/rgb\(([^)]+)\)/)[1];
    var parts = str.split(/ *, */).map(Number);
    return {
      r: parts[0],
      g: parts[1],
      b: parts[2],
      a: 1
    }
  }
}

/**
 * Parse rgba(n, n, n, n)
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function rgba(str) {
  if (0 == str.indexOf('rgba(')) {
    str = str.match(/rgba\(([^)]+)\)/)[1];
    var parts = str.split(/ *, */).map(Number);
    return {
      r: parts[0],
      g: parts[1],
      b: parts[2],
      a: parts[3]
    }
  }
}

/**
 * Parse #nnnnnn
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function hex6(str) {
  if ('#' == str[0] && 7 == str.length) {
    return {
      r: parseInt(str.slice(1, 3), 16),
      g: parseInt(str.slice(3, 5), 16),
      b: parseInt(str.slice(5, 7), 16),
      a: 1
    }
  }
}

/**
 * Parse #nnn
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function hex3(str) {
  if ('#' == str[0] && 4 == str.length) {
    return {
      r: parseInt(str[1] + str[1], 16),
      g: parseInt(str[2] + str[2], 16),
      b: parseInt(str[3] + str[3], 16),
      a: 1
    }
  }
}


},"/Users/jkroso/.packin/-/github.com/yields/merge/tarball/1.0.0/index.js": function(module,exports,require){

/**
 * merge `b`'s properties with `a`'s.
 *
 * example:
 *
 *        var user = {};
 *        merge(user, console);
 *        // > { log: fn, dir: fn ..}
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Object}
 */

module.exports = function (a, b) {
  for (var k in b) a[k] = b[k];
  return a;
};

},"/Users/jkroso/.packin/-/github.com/component/raf/tarball/1.1.1/index.js": function(module,exports,require){

/**
 * Expose `requestAnimationFrame()`.
 */

exports = module.exports = window.requestAnimationFrame
  || window.webkitRequestAnimationFrame
  || window.mozRequestAnimationFrame
  || window.oRequestAnimationFrame
  || window.msRequestAnimationFrame
  || fallback;

/**
 * Fallback implementation.
 */

var prev = new Date().getTime();
function fallback(fn) {
  var curr = new Date().getTime();
  var ms = Math.max(0, 16 - (curr - prev));
  setTimeout(fn, ms);
  prev = curr;
}

/**
 * Cancel.
 */

var cancel = window.cancelAnimationFrame
  || window.webkitCancelAnimationFrame
  || window.mozCancelAnimationFrame
  || window.oCancelAnimationFrame
  || window.msCancelAnimationFrame;

exports.cancel = function(id){
  cancel.call(window, id);
};

},"/Users/jkroso/.packin/-/github.com/yields/traverse/tarball/master/index.js": function(module,exports,require){

/**
 * dependencies
 */

var matches = require('matches-selector');

/**
 * Traverse with the given `el`, `selector` and `len`.
 *
 * @param {String} type
 * @param {Element} el
 * @param {String} selector
 * @param {Number} len
 * @return {Array}
 * @api public
 */

module.exports = function(type, el, selector, len){
  var el = el[type]
    , n = len || 1
    , ret = [];

  if (!el) return ret;

  do {
    if (n == ret.length) break;
    if (1 != el.nodeType) continue;
    if (matches(el, selector)) ret.push(el);
    if (!selector) ret.push(el);
  } while (el = el[type]);

  return ret;
}

},"/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/master/tweens/index.js": function(module,exports,require){
exports.number = require('./number')
exports.matrix = require('./matrix')
exports.color = require('./color')
exports.px = require('./px')
},"/Users/jkroso/.packin/-/github.com/jkroso/now/tarball/0.1.1/index.js": function(module,exports,require){

var global = function(){return this}()
var performance = global.performance

/**
 * Get a timestamp
 * 
 * @return {Number}
 * @api public
 */

module.exports = function(){
  return performance.now()
}

// fallback

if (!performance || typeof performance.now != 'function') {
	module.exports = Date.now || function(){ return +(new Date) }
}

},"/Users/jkroso/.packin/-/github.com/yields/extensible/tarball/0.1.0/index.js": function(module,exports,require){

/**
 * dependencies
 */

var inherit = require('inherit');

/**
 * Export `extensible`
 */

module.exports = extensible;

/**
 * Make the given `A` extensible.
 *
 * @param {Function} A
 * @return {A}
 */

function extensible(A){
  A.extend = extend;
  return A;
};

/**
 * make `B` inherit from `this`. Unless `final`,
 * `B` will also be made extensible.
 *
 * @param {Function} B
 * @param {Boolean} [final]
 * @return {B}
 */

function extend(B, final){
  !final && extensible(B);
  inherit(B, this);
  return B
};
},"/Users/jkroso/.packin/-/github.com/component/ease/tarball/1.0.0/index.js": function(module,exports,require){

exports.linear = function(n){
  return n;
};

exports.inQuad = function(n){
  return n * n;
};

exports.outQuad = function(n){
  return n * (2 - n);
};

exports.inOutQuad = function(n){
  n *= 2;
  if (n < 1) return 0.5 * n * n;
  return - 0.5 * (--n * (n - 2) - 1);
};

exports.inCube = function(n){
  return n * n * n;
};

exports.outCube = function(n){
  return --n * n * n + 1;
};

exports.inOutCube = function(n){
  n *= 2;
  if (n < 1) return 0.5 * n * n * n;
  return 0.5 * ((n -= 2 ) * n * n + 2);
};

exports.inQuart = function(n){
  return n * n * n * n;
};

exports.outQuart = function(n){
  return 1 - (--n * n * n * n);
};

exports.inOutQuart = function(n){
  n *= 2;
  if (n < 1) return 0.5 * n * n * n * n;
  return -0.5 * ((n -= 2) * n * n * n - 2);
};

exports.inQuint = function(n){
  return n * n * n * n * n;
}

exports.outQuint = function(n){
  return --n * n * n * n * n + 1;
}

exports.inOutQuint = function(n){
  n *= 2;
  if (n < 1) return 0.5 * n * n * n * n * n;
  return 0.5 * ((n -= 2) * n * n * n * n + 2);
};

exports.inSine = function(n){
  return 1 - Math.cos(n * Math.PI / 2 );
};

exports.outSine = function(n){
  return Math.sin(n * Math.PI / 2);
};

exports.inOutSine = function(n){
  return .5 * (1 - Math.cos(Math.PI * n));
};

exports.inExpo = function(n){
  return 0 == n ? 0 : Math.pow(1024, n - 1);
};

exports.outExpo = function(n){
  return 1 == n ? n : 1 - Math.pow(2, -10 * n);
};

exports.inOutExpo = function(n){
  if (0 == n) return 0;
  if (1 == n) return 1;
  if ((n *= 2) < 1) return .5 * Math.pow(1024, n - 1);
  return .5 * (-Math.pow(2, -10 * (n - 1)) + 2);
};

exports.inCirc = function(n){
  return 1 - Math.sqrt(1 - n * n);
};

exports.outCirc = function(n){
  return Math.sqrt(1 - (--n * n));
};

exports.inOutCirc = function(n){
  n *= 2
  if (n < 1) return -0.5 * (Math.sqrt(1 - n * n) - 1);
  return 0.5 * (Math.sqrt(1 - (n -= 2) * n) + 1);
};

exports.inBack = function(n){
  var s = 1.70158;
  return n * n * (( s + 1 ) * n - s);
};

exports.outBack = function(n){
  var s = 1.70158;
  return --n * n * ((s + 1) * n + s) + 1;
};

exports.inOutBack = function(n){
  var s = 1.70158 * 1.525;
  if ( ( n *= 2 ) < 1 ) return 0.5 * ( n * n * ( ( s + 1 ) * n - s ) );
  return 0.5 * ( ( n -= 2 ) * n * ( ( s + 1 ) * n + s ) + 2 );
};

exports.inBounce = function(n){
  return 1 - exports.outBounce(1 - n);
};

exports.outBounce = function(n){
  if ( n < ( 1 / 2.75 ) ) {
    return 7.5625 * n * n;
  } else if ( n < ( 2 / 2.75 ) ) {
    return 7.5625 * ( n -= ( 1.5 / 2.75 ) ) * n + 0.75;
  } else if ( n < ( 2.5 / 2.75 ) ) {
    return 7.5625 * ( n -= ( 2.25 / 2.75 ) ) * n + 0.9375;
  } else {
    return 7.5625 * ( n -= ( 2.625 / 2.75 ) ) * n + 0.984375;
  }
};

exports.inOutBounce = function(n){
  if (n < .5) return exports.inBounce(n * 2) * .5;
  return exports.outBounce(n * 2 - 1) * .5 + .5;
};

// aliases

exports['in-quad'] = exports.inQuad;
exports['out-quad'] = exports.outQuad;
exports['in-out-quad'] = exports.inOutQuad;
exports['in-cube'] = exports.inCube;
exports['out-cube'] = exports.outCube;
exports['in-out-cube'] = exports.inOutCube;
exports['in-quart'] = exports.inQuart;
exports['out-quart'] = exports.outQuart;
exports['in-out-quart'] = exports.inOutQuart;
exports['in-quint'] = exports.inQuint;
exports['out-quint'] = exports.outQuint;
exports['in-out-quint'] = exports.inOutQuint;
exports['in-sine'] = exports.inSine;
exports['out-sine'] = exports.outSine;
exports['in-out-sine'] = exports.inOutSine;
exports['in-expo'] = exports.inExpo;
exports['out-expo'] = exports.outExpo;
exports['in-out-expo'] = exports.inOutExpo;
exports['in-circ'] = exports.inCirc;
exports['out-circ'] = exports.outCirc;
exports['in-out-circ'] = exports.inOutCirc;
exports['in-back'] = exports.inBack;
exports['out-back'] = exports.outBack;
exports['in-out-back'] = exports.inOutBack;
exports['in-bounce'] = exports.inBounce;
exports['out-bounce'] = exports.outBounce;
exports['in-out-bounce'] = exports.inOutBounce;

},"/Users/jkroso/.packin/-/github.com/component/color-parser/tarball/0.1.0/colors.js": function(module,exports,require){

module.exports = {
    aliceblue: [240, 248, 255]
  , antiquewhite: [250, 235, 215]
  , aqua: [0, 255, 255]
  , aquamarine: [127, 255, 212]
  , azure: [240, 255, 255]
  , beige: [245, 245, 220]
  , bisque: [255, 228, 196]
  , black: [0, 0, 0]
  , blanchedalmond: [255, 235, 205]
  , blue: [0, 0, 255]
  , blueviolet: [138, 43, 226]
  , brown: [165, 42, 42]
  , burlywood: [222, 184, 135]
  , cadetblue: [95, 158, 160]
  , chartreuse: [127, 255, 0]
  , chocolate: [210, 105, 30]
  , coral: [255, 127, 80]
  , cornflowerblue: [100, 149, 237]
  , cornsilk: [255, 248, 220]
  , crimson: [220, 20, 60]
  , cyan: [0, 255, 255]
  , darkblue: [0, 0, 139]
  , darkcyan: [0, 139, 139]
  , darkgoldenrod: [184, 132, 11]
  , darkgray: [169, 169, 169]
  , darkgreen: [0, 100, 0]
  , darkgrey: [169, 169, 169]
  , darkkhaki: [189, 183, 107]
  , darkmagenta: [139, 0, 139]
  , darkolivegreen: [85, 107, 47]
  , darkorange: [255, 140, 0]
  , darkorchid: [153, 50, 204]
  , darkred: [139, 0, 0]
  , darksalmon: [233, 150, 122]
  , darkseagreen: [143, 188, 143]
  , darkslateblue: [72, 61, 139]
  , darkslategray: [47, 79, 79]
  , darkslategrey: [47, 79, 79]
  , darkturquoise: [0, 206, 209]
  , darkviolet: [148, 0, 211]
  , deeppink: [255, 20, 147]
  , deepskyblue: [0, 191, 255]
  , dimgray: [105, 105, 105]
  , dimgrey: [105, 105, 105]
  , dodgerblue: [30, 144, 255]
  , firebrick: [178, 34, 34]
  , floralwhite: [255, 255, 240]
  , forestgreen: [34, 139, 34]
  , fuchsia: [255, 0, 255]
  , gainsboro: [220, 220, 220]
  , ghostwhite: [248, 248, 255]
  , gold: [255, 215, 0]
  , goldenrod: [218, 165, 32]
  , gray: [128, 128, 128]
  , green: [0, 128, 0]
  , greenyellow: [173, 255, 47]
  , grey: [128, 128, 128]
  , honeydew: [240, 255, 240]
  , hotpink: [255, 105, 180]
  , indianred: [205, 92, 92]
  , indigo: [75, 0, 130]
  , ivory: [255, 255, 240]
  , khaki: [240, 230, 140]
  , lavender: [230, 230, 250]
  , lavenderblush: [255, 240, 245]
  , lawngreen: [124, 252, 0]
  , lemonchiffon: [255, 250, 205]
  , lightblue: [173, 216, 230]
  , lightcoral: [240, 128, 128]
  , lightcyan: [224, 255, 255]
  , lightgoldenrodyellow: [250, 250, 210]
  , lightgray: [211, 211, 211]
  , lightgreen: [144, 238, 144]
  , lightgrey: [211, 211, 211]
  , lightpink: [255, 182, 193]
  , lightsalmon: [255, 160, 122]
  , lightseagreen: [32, 178, 170]
  , lightskyblue: [135, 206, 250]
  , lightslategray: [119, 136, 153]
  , lightslategrey: [119, 136, 153]
  , lightsteelblue: [176, 196, 222]
  , lightyellow: [255, 255, 224]
  , lime: [0, 255, 0]
  , limegreen: [50, 205, 50]
  , linen: [250, 240, 230]
  , magenta: [255, 0, 255]
  , maroon: [128, 0, 0]
  , mediumaquamarine: [102, 205, 170]
  , mediumblue: [0, 0, 205]
  , mediumorchid: [186, 85, 211]
  , mediumpurple: [147, 112, 219]
  , mediumseagreen: [60, 179, 113]
  , mediumslateblue: [123, 104, 238]
  , mediumspringgreen: [0, 250, 154]
  , mediumturquoise: [72, 209, 204]
  , mediumvioletred: [199, 21, 133]
  , midnightblue: [25, 25, 112]
  , mintcream: [245, 255, 250]
  , mistyrose: [255, 228, 225]
  , moccasin: [255, 228, 181]
  , navajowhite: [255, 222, 173]
  , navy: [0, 0, 128]
  , oldlace: [253, 245, 230]
  , olive: [128, 128, 0]
  , olivedrab: [107, 142, 35]
  , orange: [255, 165, 0]
  , orangered: [255, 69, 0]
  , orchid: [218, 112, 214]
  , palegoldenrod: [238, 232, 170]
  , palegreen: [152, 251, 152]
  , paleturquoise: [175, 238, 238]
  , palevioletred: [219, 112, 147]
  , papayawhip: [255, 239, 213]
  , peachpuff: [255, 218, 185]
  , peru: [205, 133, 63]
  , pink: [255, 192, 203]
  , plum: [221, 160, 203]
  , powderblue: [176, 224, 230]
  , purple: [128, 0, 128]
  , red: [255, 0, 0]
  , rosybrown: [188, 143, 143]
  , royalblue: [65, 105, 225]
  , saddlebrown: [139, 69, 19]
  , salmon: [250, 128, 114]
  , sandybrown: [244, 164, 96]
  , seagreen: [46, 139, 87]
  , seashell: [255, 245, 238]
  , sienna: [160, 82, 45]
  , silver: [192, 192, 192]
  , skyblue: [135, 206, 235]
  , slateblue: [106, 90, 205]
  , slategray: [119, 128, 144]
  , slategrey: [119, 128, 144]
  , snow: [255, 255, 250]
  , springgreen: [0, 255, 127]
  , steelblue: [70, 130, 180]
  , tan: [210, 180, 140]
  , teal: [0, 128, 128]
  , thistle: [216, 191, 216]
  , tomato: [255, 99, 71]
  , turquoise: [64, 224, 208]
  , violet: [238, 130, 238]
  , wheat: [245, 222, 179]
  , white: [255, 255, 255]
  , whitesmoke: [245, 245, 245]
  , yellow: [255, 255, 0]
  , yellowgreen: [154, 205, 5]
};
},"/Users/jkroso/.packin/-/github.com/component/query/tarball/master/index.js": function(module,exports,require){

function one(selector, el) {
  return el.querySelector(selector);
}

exports = module.exports = function(selector, el){
  el = el || document;
  return one(selector, el);
};

exports.all = function(selector, el){
  el = el || document;
  return el.querySelectorAll(selector);
};

exports.engine = function(obj){
  if (!obj.one) throw new Error('.one callback required');
  if (!obj.all) throw new Error('.all callback required');
  one = obj.one;
  exports.all = obj.all;
};

},"/Users/jkroso/.packin/-/github.com/component/event/tarball/master/index.js": function(module,exports,require){

/**
 * Bind `el` event `type` to `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.bind = function(el, type, fn, capture){
  if (el.addEventListener) {
    el.addEventListener(type, fn, capture || false);
  } else {
    el.attachEvent('on' + type, fn);
  }
  return fn;
};

/**
 * Unbind `el` event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.unbind = function(el, type, fn, capture){
  if (el.removeEventListener) {
    el.removeEventListener(type, fn, capture || false);
  } else {
    el.detachEvent('on' + type, fn);
  }
  return fn;
};

},"/Users/jkroso/.packin/-/github.com/component/indexof/tarball/master/index.js": function(module,exports,require){
module.exports = function(arr, obj){
  if (arr.indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
},"/Users/jkroso/.packin/-/github.com/component/type/tarball/master/index.js": function(module,exports,require){

/**
 * toString ref.
 */

var toString = Object.prototype.toString;

/**
 * Return the type of `val`.
 *
 * @param {Mixed} val
 * @return {String}
 * @api public
 */

module.exports = function(val){
  switch (toString.call(val)) {
    case '[object Function]': return 'function';
    case '[object Date]': return 'date';
    case '[object RegExp]': return 'regexp';
    case '[object Arguments]': return 'arguments';
    case '[object Array]': return 'array';
    case '[object String]': return 'string';
  }

  if (val === null) return 'null';
  if (val === undefined) return 'undefined';
  if (val && val.nodeType === 1) return 'element';
  if (val === Object(val)) return 'object';

  return typeof val;
};

},"/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/master/tweens/matrix.js": function(module,exports,require){

var Tween = require('tween/array')
var frame = Tween.prototype.frame
var CSSMatrix = WebKitCSSMatrix

module.exports = Matrix

function Matrix(from, to){
	Tween.call(this, parse(from), parse(to))
}

Tween.extend(Matrix, 'final')

Matrix.prototype.frame = function(p){
	return 'matrix(' + frame.call(this, p).map(clamp).join(', ') + ')'
}

function parse(matrix){
	if (typeof matrix == 'string') matrix = new CSSMatrix(matrix)
	return [
		matrix.m11,
		matrix.m12,
		matrix.m21,
		matrix.m22,
		matrix.m41,
		matrix.m42,
	]
}

function clamp(n){
	return n.toFixed(6)
}
},"/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/master/tweens/number.js": function(module,exports,require){

var Tween = require('tween/number')

module.exports = Tween.extend(function Number(from, to){
	Tween.call(this, parse(from), parse(to))
}, 'final')

function parse(px){
	return parseFloat(px, 10) || 0
}
},"/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/master/tweens/color.js": function(module,exports,require){

var Tween = require('tween/array')
var frame = Tween.prototype.frame
var rgba = require('color-parser')

module.exports = Color

function Color(from, to){
	Tween.call(this, parse(from), parse(to))
}

Tween.extend(Color, 'final')

Color.prototype.frame = function(progress){
	var rgb = frame.call(this, progress).map(toInt)
	return 'rgba(' + rgb.join(',') + ')'
}

function toInt(n){
	return n.toFixed(0)
}

function parse(color){
	color = rgba(color)
	return [
		color.r,
		color.g,
		color.b,
		color.a || 1,
	]
}
},"/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/master/tweens/px.js": function(module,exports,require){

var Tween = require('tween/number')
var frame = Tween.prototype.frame

module.exports = PX

Tween.extend(PX, 'final')

function PX(from, to){
	Tween.call(this, parse(from), parse(to))
}

PX.prototype.frame = function(progress) {
	return frame.call(this, progress).toFixed(1) + 'px'
};

function parse(px){
	return parseFloat(px, 10) || 0
}
},"/Users/jkroso/.packin/-/github.com/nathan7/inherit/tarball/f1a75b4844/index.js": function(module,exports,require){

module.exports = function(a, b){
  var fn = function(){};
  fn.prototype = b.prototype;
  a.prototype = new fn;
  a.prototype.constructor = a;
};
},"/Users/jkroso/.packin/-/github.com/jkroso/tween/tarball/0.3.2/array.js": function(module,exports,require){

var Tween = require('./tween')

module.exports = ArrayTween

function ArrayTween(from, to){
	this._from = from
	this._curr = from.slice()
	this._to = to
}

Tween.extend(ArrayTween)

ArrayTween.prototype.frame = function(p){
	var from = this._from
	var curr = this._curr
	var to = this._to
	var i = to.length
	while (i--) {
		curr[i] = from[i] + (to[i] - from[i]) * p
	}
	return curr
}

ArrayTween.prototype.reset = function(){
	Tween.prototype.reset.call(this)
	this._curr = [] // prevent mutation
	return this
}
},"/Users/jkroso/.packin/-/github.com/jkroso/tween/tarball/0.3.2/number.js": function(module,exports,require){

var Tween = require('./tween')

module.exports = NumberTween

function NumberTween(from, to){
	this._diff = to - from
	this._from = from
	this._to = to
}

Tween.extend(NumberTween)

NumberTween.prototype.frame = function(p){
	return this._from + (this._diff * p)
}

NumberTween.prototype.reset = function(){
	Tween.prototype.reset.call(this)
	this._diff = this._to - this._from
	return this
}
}},{
  "/Users/jkroso/Dev/js/move/examples.js": "/Users/jkroso/Dev/js/move/examples.original.js",
  "/Users/jkroso/Dev/js/move/node_modules/computed-style/index.js": "/Users/jkroso/.packin/-/github.com/jkroso/computed-style/tarball/0.1.0/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/master/node_modules/computed-style/index.js": "/Users/jkroso/.packin/-/github.com/jkroso/computed-style/tarball/0.1.0/index.js",
  "/Users/jkroso/Dev/js/move/node_modules/move/index.js": "/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/master/index.js",
  "/Users/jkroso/Dev/js/move/node_modules/dom/index.js": "/Users/jkroso/.packin/-/github.com/component/dom/tarball/0.9.0/index.js",
  "/Users/jkroso/Dev/js/move/node_modules/css/index.js": "/Users/jkroso/.packin/-/github.com/component/css/tarball/0.0.2/index.js",
  "/Users/jkroso/.packin/-/github.com/component/dom/tarball/0.9.0/node_modules/css/index.js": "/Users/jkroso/.packin/-/github.com/component/css/tarball/0.0.2/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/master/node_modules/css/index.js": "/Users/jkroso/.packin/-/github.com/component/css/tarball/0.0.2/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/master/node_modules/emitter/light.js": "/Users/jkroso/.packin/-/github.com/jkroso/emitter/tarball/0.9.0/light.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/master/node_modules/tween/tween.js": "/Users/jkroso/.packin/-/github.com/jkroso/tween/tarball/0.3.2/tween.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/master/node_modules/prefix/index.js": "/Users/jkroso/.packin/-/github.com/jkroso/prefix/tarball/0.1.0/index.js",
  "/Users/jkroso/.packin/-/github.com/component/dom/tarball/0.9.0/node_modules/matches-selector/index.js": "/Users/jkroso/.packin/-/github.com/component/matches-selector/tarball/master/index.js",
  "/Users/jkroso/.packin/-/github.com/component/delegate/tarball/0.1.0/node_modules/matches-selector/index.js": "/Users/jkroso/.packin/-/github.com/component/matches-selector/tarball/master/index.js",
  "/Users/jkroso/.packin/-/github.com/yields/traverse/tarball/master/node_modules/matches-selector/index.js": "/Users/jkroso/.packin/-/github.com/component/matches-selector/tarball/master/index.js",
  "/Users/jkroso/.packin/-/github.com/component/dom/tarball/0.9.0/node_modules/delegate/index.js": "/Users/jkroso/.packin/-/github.com/component/delegate/tarball/0.1.0/index.js",
  "/Users/jkroso/.packin/-/github.com/component/dom/tarball/0.9.0/node_modules/classes/index.js": "/Users/jkroso/.packin/-/github.com/component/classes/tarball/1.1.2/index.js",
  "/Users/jkroso/.packin/-/github.com/component/dom/tarball/0.9.0/node_modules/indexof/index.js": "/Users/jkroso/.packin/-/github.com/component/indexof/tarball/0.0.1/index.js",
  "/Users/jkroso/.packin/-/github.com/component/dom/tarball/0.9.0/node_modules/domify/index.js": "/Users/jkroso/.packin/-/github.com/component/domify/tarball/1.0.0/index.js",
  "/Users/jkroso/.packin/-/github.com/component/dom/tarball/0.9.0/node_modules/event/index.js": "/Users/jkroso/.packin/-/github.com/component/event/tarball/0.1.0/index.js",
  "/Users/jkroso/.packin/-/github.com/component/dom/tarball/0.9.0/node_modules/value/index.js": "/Users/jkroso/.packin/-/github.com/component/value/tarball/1.1.0/index.js",
  "/Users/jkroso/.packin/-/github.com/component/dom/tarball/0.9.0/node_modules/query/index.js": "/Users/jkroso/.packin/-/github.com/component/query/tarball/0.0.1/index.js",
  "/Users/jkroso/.packin/-/github.com/component/dom/tarball/0.9.0/node_modules/type/index.js": "/Users/jkroso/.packin/-/github.com/component/type/tarball/1.0.0/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/master/node_modules/color-parser/index.js": "/Users/jkroso/.packin/-/github.com/component/color-parser/tarball/0.1.0/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/master/node_modules/merge/index.js": "/Users/jkroso/.packin/-/github.com/yields/merge/tarball/1.0.0/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/emitter/tarball/0.9.0/node_modules/merge/index.js": "/Users/jkroso/.packin/-/github.com/yields/merge/tarball/1.0.0/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/master/node_modules/raf/index.js": "/Users/jkroso/.packin/-/github.com/component/raf/tarball/1.1.1/index.js",
  "/Users/jkroso/.packin/-/github.com/component/dom/tarball/0.9.0/node_modules/traverse/index.js": "/Users/jkroso/.packin/-/github.com/yields/traverse/tarball/master/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/tween/tarball/0.3.2/node_modules/now/index.js": "/Users/jkroso/.packin/-/github.com/jkroso/now/tarball/0.1.1/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/tween/tarball/0.3.2/node_modules/extensible/index.js": "/Users/jkroso/.packin/-/github.com/yields/extensible/tarball/0.1.0/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/tween/tarball/0.3.2/node_modules/ease/index.js": "/Users/jkroso/.packin/-/github.com/component/ease/tarball/1.0.0/index.js",
  "/Users/jkroso/.packin/-/github.com/component/matches-selector/tarball/master/node_modules/query/index.js": "/Users/jkroso/.packin/-/github.com/component/query/tarball/master/index.js",
  "/Users/jkroso/.packin/-/github.com/component/delegate/tarball/0.1.0/node_modules/event/index.js": "/Users/jkroso/.packin/-/github.com/component/event/tarball/master/index.js",
  "/Users/jkroso/.packin/-/github.com/component/classes/tarball/1.1.2/node_modules/indexof/index.js": "/Users/jkroso/.packin/-/github.com/component/indexof/tarball/master/index.js",
  "/Users/jkroso/.packin/-/github.com/component/value/tarball/1.1.0/node_modules/type/index.js": "/Users/jkroso/.packin/-/github.com/component/type/tarball/master/index.js",
  "/Users/jkroso/.packin/-/github.com/yields/extensible/tarball/0.1.0/node_modules/inherit/index.js": "/Users/jkroso/.packin/-/github.com/nathan7/inherit/tarball/f1a75b4844/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/master/node_modules/tween/array.js": "/Users/jkroso/.packin/-/github.com/jkroso/tween/tarball/0.3.2/array.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/master/node_modules/tween/number.js": "/Users/jkroso/.packin/-/github.com/jkroso/tween/tarball/0.3.2/number.js"
})("/Users/jkroso/Dev/js/move/examples.original.js")
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL1VzZXJzL2prcm9zby9EZXYvanMvbW92ZS9leGFtcGxlcy5vcmlnaW5hbC5qcyIsInNvdXJjZXMiOlsiL25vZGVfbW9kdWxlcy9jc3MtaW5zdGFsbC5qcyIsIi9ub2RlX21vZHVsZXMvamFkZS1ydW50aW1lLmpzIiwiL1VzZXJzL2prcm9zby9EZXYvanMvbW92ZS9leGFtcGxlcy5vcmlnaW5hbC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vamtyb3NvL2NvbXB1dGVkLXN0eWxlL3RhcmJhbGwvMC4xLjAvaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2prcm9zby9tb3ZlL3RhcmJhbGwvbWFzdGVyL2luZGV4LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9jb21wb25lbnQvZG9tL3RhcmJhbGwvMC45LjAvaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2NvbXBvbmVudC9jc3MvdGFyYmFsbC8wLjAuMi9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vamtyb3NvL2VtaXR0ZXIvdGFyYmFsbC8wLjkuMC9saWdodC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vamtyb3NvL3R3ZWVuL3RhcmJhbGwvMC4zLjIvdHdlZW4uanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2prcm9zby9wcmVmaXgvdGFyYmFsbC8wLjEuMC9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vY29tcG9uZW50L21hdGNoZXMtc2VsZWN0b3IvdGFyYmFsbC9tYXN0ZXIvaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2NvbXBvbmVudC9kZWxlZ2F0ZS90YXJiYWxsLzAuMS4wL2luZGV4LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9jb21wb25lbnQvY2xhc3Nlcy90YXJiYWxsLzEuMS4yL2luZGV4LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9jb21wb25lbnQvaW5kZXhvZi90YXJiYWxsLzAuMC4xL2luZGV4LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9jb21wb25lbnQvZG9taWZ5L3RhcmJhbGwvMS4wLjAvaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2NvbXBvbmVudC9ldmVudC90YXJiYWxsLzAuMS4wL2luZGV4LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9jb21wb25lbnQvdmFsdWUvdGFyYmFsbC8xLjEuMC9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vY29tcG9uZW50L3F1ZXJ5L3RhcmJhbGwvMC4wLjEvaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2NvbXBvbmVudC90eXBlL3RhcmJhbGwvMS4wLjAvaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2NvbXBvbmVudC9jb2xvci1wYXJzZXIvdGFyYmFsbC8wLjEuMC9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20veWllbGRzL21lcmdlL3RhcmJhbGwvMS4wLjAvaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2NvbXBvbmVudC9yYWYvdGFyYmFsbC8xLjEuMS9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20veWllbGRzL3RyYXZlcnNlL3RhcmJhbGwvbWFzdGVyL2luZGV4LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9qa3Jvc28vbW92ZS90YXJiYWxsL21hc3Rlci90d2VlbnMvaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2prcm9zby9ub3cvdGFyYmFsbC8wLjEuMS9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20veWllbGRzL2V4dGVuc2libGUvdGFyYmFsbC8wLjEuMC9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vY29tcG9uZW50L2Vhc2UvdGFyYmFsbC8xLjAuMC9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vY29tcG9uZW50L2NvbG9yLXBhcnNlci90YXJiYWxsLzAuMS4wL2NvbG9ycy5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vY29tcG9uZW50L3F1ZXJ5L3RhcmJhbGwvbWFzdGVyL2luZGV4LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9jb21wb25lbnQvZXZlbnQvdGFyYmFsbC9tYXN0ZXIvaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2NvbXBvbmVudC9pbmRleG9mL3RhcmJhbGwvbWFzdGVyL2luZGV4LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9jb21wb25lbnQvdHlwZS90YXJiYWxsL21hc3Rlci9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vamtyb3NvL21vdmUvdGFyYmFsbC9tYXN0ZXIvdHdlZW5zL21hdHJpeC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vamtyb3NvL21vdmUvdGFyYmFsbC9tYXN0ZXIvdHdlZW5zL251bWJlci5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vamtyb3NvL21vdmUvdGFyYmFsbC9tYXN0ZXIvdHdlZW5zL2NvbG9yLmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9qa3Jvc28vbW92ZS90YXJiYWxsL21hc3Rlci90d2VlbnMvcHguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL25hdGhhbjcvaW5oZXJpdC90YXJiYWxsL2YxYTc1YjQ4NDQvaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2prcm9zby90d2Vlbi90YXJiYWxsLzAuMy4yL2FycmF5LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9qa3Jvc28vdHdlZW4vdGFyYmFsbC8wLjMuMi9udW1iZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUR2TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUVKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xjQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzN5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAodGV4dCkge1xuXHR2YXIgc3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpXG5cdHN0eWxlLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRleHQpKVxuXHRkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdLmFwcGVuZENoaWxkKHN0eWxlKVxufSIsIlxyXG4vKiFcclxuICogSmFkZSAtIHJ1bnRpbWVcclxuICogQ29weXJpZ2h0KGMpIDIwMTAgVEogSG9sb3dheWNodWsgPHRqQHZpc2lvbi1tZWRpYS5jYT5cclxuICogTUlUIExpY2Vuc2VkXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIExhbWUgQXJyYXkuaXNBcnJheSgpIHBvbHlmaWxsIGZvciBub3cuXHJcbiAqL1xyXG5cclxuaWYgKCFBcnJheS5pc0FycmF5KSB7XHJcbiAgQXJyYXkuaXNBcnJheSA9IGZ1bmN0aW9uKGFycil7XHJcbiAgICByZXR1cm4gJ1tvYmplY3QgQXJyYXldJyA9PSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYXJyKTtcclxuICB9O1xyXG59XHJcblxyXG4vKipcclxuICogTGFtZSBPYmplY3Qua2V5cygpIHBvbHlmaWxsIGZvciBub3cuXHJcbiAqL1xyXG5cclxuaWYgKCFPYmplY3Qua2V5cykge1xyXG4gIE9iamVjdC5rZXlzID0gZnVuY3Rpb24ob2JqKXtcclxuICAgIHZhciBhcnIgPSBbXTtcclxuICAgIGZvciAodmFyIGtleSBpbiBvYmopIHtcclxuICAgICAgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XHJcbiAgICAgICAgYXJyLnB1c2goa2V5KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGFycjtcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBNZXJnZSB0d28gYXR0cmlidXRlIG9iamVjdHMgZ2l2aW5nIHByZWNlZGVuY2VcclxuICogdG8gdmFsdWVzIGluIG9iamVjdCBgYmAuIENsYXNzZXMgYXJlIHNwZWNpYWwtY2FzZWRcclxuICogYWxsb3dpbmcgZm9yIGFycmF5cyBhbmQgbWVyZ2luZy9qb2luaW5nIGFwcHJvcHJpYXRlbHlcclxuICogcmVzdWx0aW5nIGluIGEgc3RyaW5nLlxyXG4gKlxyXG4gKiBAcGFyYW0ge09iamVjdH0gYVxyXG4gKiBAcGFyYW0ge09iamVjdH0gYlxyXG4gKiBAcmV0dXJuIHtPYmplY3R9IGFcclxuICogQGFwaSBwcml2YXRlXHJcbiAqL1xyXG5cclxuZXhwb3J0cy5tZXJnZSA9IGZ1bmN0aW9uIG1lcmdlKGEsIGIpIHtcclxuICB2YXIgYWMgPSBhWydjbGFzcyddO1xyXG4gIHZhciBiYyA9IGJbJ2NsYXNzJ107XHJcblxyXG4gIGlmIChhYyB8fCBiYykge1xyXG4gICAgYWMgPSBhYyB8fCBbXTtcclxuICAgIGJjID0gYmMgfHwgW107XHJcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoYWMpKSBhYyA9IFthY107XHJcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoYmMpKSBiYyA9IFtiY107XHJcbiAgICBhWydjbGFzcyddID0gYWMuY29uY2F0KGJjKS5maWx0ZXIobnVsbHMpO1xyXG4gIH1cclxuXHJcbiAgZm9yICh2YXIga2V5IGluIGIpIHtcclxuICAgIGlmIChrZXkgIT0gJ2NsYXNzJykge1xyXG4gICAgICBhW2tleV0gPSBiW2tleV07XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4gYTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBGaWx0ZXIgbnVsbCBgdmFsYHMuXHJcbiAqXHJcbiAqIEBwYXJhbSB7Kn0gdmFsXHJcbiAqIEByZXR1cm4ge0Jvb2xlYW59XHJcbiAqIEBhcGkgcHJpdmF0ZVxyXG4gKi9cclxuXHJcbmZ1bmN0aW9uIG51bGxzKHZhbCkge1xyXG4gIHJldHVybiB2YWwgIT0gbnVsbCAmJiB2YWwgIT09ICcnO1xyXG59XHJcblxyXG4vKipcclxuICogam9pbiBhcnJheSBhcyBjbGFzc2VzLlxyXG4gKlxyXG4gKiBAcGFyYW0geyp9IHZhbFxyXG4gKiBAcmV0dXJuIHtTdHJpbmd9XHJcbiAqIEBhcGkgcHJpdmF0ZVxyXG4gKi9cclxuXHJcbmZ1bmN0aW9uIGpvaW5DbGFzc2VzKHZhbCkge1xyXG4gIHJldHVybiBBcnJheS5pc0FycmF5KHZhbCkgPyB2YWwubWFwKGpvaW5DbGFzc2VzKS5maWx0ZXIobnVsbHMpLmpvaW4oJyAnKSA6IHZhbDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJlbmRlciB0aGUgZ2l2ZW4gYXR0cmlidXRlcyBvYmplY3QuXHJcbiAqXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcclxuICogQHBhcmFtIHtPYmplY3R9IGVzY2FwZWRcclxuICogQHJldHVybiB7U3RyaW5nfVxyXG4gKiBAYXBpIHByaXZhdGVcclxuICovXHJcblxyXG5leHBvcnRzLmF0dHJzID0gZnVuY3Rpb24gYXR0cnMob2JqLCBlc2NhcGVkKXtcclxuICB2YXIgYnVmID0gW11cclxuICAgICwgdGVyc2UgPSBvYmoudGVyc2U7XHJcblxyXG4gIGRlbGV0ZSBvYmoudGVyc2U7XHJcbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhvYmopXHJcbiAgICAsIGxlbiA9IGtleXMubGVuZ3RoO1xyXG5cclxuICBpZiAobGVuKSB7XHJcbiAgICBidWYucHVzaCgnJyk7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgKytpKSB7XHJcbiAgICAgIHZhciBrZXkgPSBrZXlzW2ldXHJcbiAgICAgICAgLCB2YWwgPSBvYmpba2V5XTtcclxuXHJcbiAgICAgIGlmICgnYm9vbGVhbicgPT0gdHlwZW9mIHZhbCB8fCBudWxsID09IHZhbCkge1xyXG4gICAgICAgIGlmICh2YWwpIHtcclxuICAgICAgICAgIHRlcnNlXHJcbiAgICAgICAgICAgID8gYnVmLnB1c2goa2V5KVxyXG4gICAgICAgICAgICA6IGJ1Zi5wdXNoKGtleSArICc9XCInICsga2V5ICsgJ1wiJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2UgaWYgKDAgPT0ga2V5LmluZGV4T2YoJ2RhdGEnKSAmJiAnc3RyaW5nJyAhPSB0eXBlb2YgdmFsKSB7XHJcbiAgICAgICAgYnVmLnB1c2goa2V5ICsgXCI9J1wiICsgSlNPTi5zdHJpbmdpZnkodmFsKSArIFwiJ1wiKTtcclxuICAgICAgfSBlbHNlIGlmICgnY2xhc3MnID09IGtleSkge1xyXG4gICAgICAgIGlmIChlc2NhcGVkICYmIGVzY2FwZWRba2V5XSl7XHJcbiAgICAgICAgICBpZiAodmFsID0gZXhwb3J0cy5lc2NhcGUoam9pbkNsYXNzZXModmFsKSkpIHtcclxuICAgICAgICAgICAgYnVmLnB1c2goa2V5ICsgJz1cIicgKyB2YWwgKyAnXCInKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgaWYgKHZhbCA9IGpvaW5DbGFzc2VzKHZhbCkpIHtcclxuICAgICAgICAgICAgYnVmLnB1c2goa2V5ICsgJz1cIicgKyB2YWwgKyAnXCInKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSBpZiAoZXNjYXBlZCAmJiBlc2NhcGVkW2tleV0pIHtcclxuICAgICAgICBidWYucHVzaChrZXkgKyAnPVwiJyArIGV4cG9ydHMuZXNjYXBlKHZhbCkgKyAnXCInKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBidWYucHVzaChrZXkgKyAnPVwiJyArIHZhbCArICdcIicpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4gYnVmLmpvaW4oJyAnKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBFc2NhcGUgdGhlIGdpdmVuIHN0cmluZyBvZiBgaHRtbGAuXHJcbiAqXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBodG1sXHJcbiAqIEByZXR1cm4ge1N0cmluZ31cclxuICogQGFwaSBwcml2YXRlXHJcbiAqL1xyXG5cclxuZXhwb3J0cy5lc2NhcGUgPSBmdW5jdGlvbiBlc2NhcGUoaHRtbCl7XHJcbiAgcmV0dXJuIFN0cmluZyhodG1sKVxyXG4gICAgLnJlcGxhY2UoLyYvZywgJyZhbXA7JylcclxuICAgIC5yZXBsYWNlKC88L2csICcmbHQ7JylcclxuICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcclxuICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7Jyk7XHJcbn07XHJcblxyXG4vKipcclxuICogUmUtdGhyb3cgdGhlIGdpdmVuIGBlcnJgIGluIGNvbnRleHQgdG8gdGhlXHJcbiAqIHRoZSBqYWRlIGluIGBmaWxlbmFtZWAgYXQgdGhlIGdpdmVuIGBsaW5lbm9gLlxyXG4gKlxyXG4gKiBAcGFyYW0ge0Vycm9yfSBlcnJcclxuICogQHBhcmFtIHtTdHJpbmd9IGZpbGVuYW1lXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBsaW5lbm9cclxuICogQGFwaSBwcml2YXRlXHJcbiAqL1xyXG5cclxuZXhwb3J0cy5yZXRocm93ID0gZnVuY3Rpb24gcmV0aHJvdyhlcnIsIGZpbGVuYW1lLCBsaW5lbm8sIHN0cil7XHJcbiAgaWYgKCEoZXJyIGluc3RhbmNlb2YgRXJyb3IpKSB0aHJvdyBlcnI7XHJcbiAgaWYgKCh0eXBlb2Ygd2luZG93ICE9ICd1bmRlZmluZWQnIHx8ICFmaWxlbmFtZSkgJiYgIXN0cikge1xyXG4gICAgZXJyLm1lc3NhZ2UgKz0gJyBvbiBsaW5lICcgKyBsaW5lbm87XHJcbiAgICB0aHJvdyBlcnI7XHJcbiAgfVxyXG4gIHRyeSB7XHJcbiAgICBzdHIgPSAgc3RyIHx8IHJlcXVpcmUoJ2ZzJykucmVhZEZpbGVTeW5jKGZpbGVuYW1lLCAndXRmOCcpXHJcbiAgfSBjYXRjaCAoZXgpIHtcclxuICAgIHJldGhyb3coZXJyLCBudWxsLCBsaW5lbm8pXHJcbiAgfVxyXG4gIHZhciBjb250ZXh0ID0gM1xyXG4gICAgLCBsaW5lcyA9IHN0ci5zcGxpdCgnXFxuJylcclxuICAgICwgc3RhcnQgPSBNYXRoLm1heChsaW5lbm8gLSBjb250ZXh0LCAwKVxyXG4gICAgLCBlbmQgPSBNYXRoLm1pbihsaW5lcy5sZW5ndGgsIGxpbmVubyArIGNvbnRleHQpO1xyXG5cclxuICAvLyBFcnJvciBjb250ZXh0XHJcbiAgdmFyIGNvbnRleHQgPSBsaW5lcy5zbGljZShzdGFydCwgZW5kKS5tYXAoZnVuY3Rpb24obGluZSwgaSl7XHJcbiAgICB2YXIgY3VyciA9IGkgKyBzdGFydCArIDE7XHJcbiAgICByZXR1cm4gKGN1cnIgPT0gbGluZW5vID8gJyAgPiAnIDogJyAgICAnKVxyXG4gICAgICArIGN1cnJcclxuICAgICAgKyAnfCAnXHJcbiAgICAgICsgbGluZTtcclxuICB9KS5qb2luKCdcXG4nKTtcclxuXHJcbiAgLy8gQWx0ZXIgZXhjZXB0aW9uIG1lc3NhZ2VcclxuICBlcnIucGF0aCA9IGZpbGVuYW1lO1xyXG4gIGVyci5tZXNzYWdlID0gKGZpbGVuYW1lIHx8ICdKYWRlJykgKyAnOicgKyBsaW5lbm9cclxuICAgICsgJ1xcbicgKyBjb250ZXh0ICsgJ1xcblxcbicgKyBlcnIubWVzc2FnZTtcclxuICB0aHJvdyBlcnI7XHJcbn07XHJcbiIsIlxudmFyIHN0eWxlID0gcmVxdWlyZSgnY29tcHV0ZWQtc3R5bGUnKVxudmFyIG1vdmUgPSByZXF1aXJlKCdtb3ZlJylcbnZhciBkb20gPSByZXF1aXJlKCdkb20nKVxudmFyIGNzcyA9IHJlcXVpcmUoJ2NzcycpXG5cbmRvbSgnLmV4YW1wbGUnKS5lYWNoKGZ1bmN0aW9uKGVsKXtcblx0ZWwuZmluZCgnYnV0dG9uLnBsYXknKS5vbignbW91c2Vkb3duJywgZnVuY3Rpb24oKXtcblx0XHR2YXIgYm94cyA9IGVsLmZpbmQoJy5ib3guc21hbGwnKVxuXHRcdHZhciBib3hzID0gW10uc2xpY2UuY2FsbChib3hzLmVscylcblx0XHR2YXIgYm94ID0gYm94c1swXVxuXHRcdGV2YWwoZWwuZmluZCgnLnNvdXJjZScpLnRleHQoKSlcblx0fSlcblxuXHRlbC5maW5kKCcuYm94JykuZWFjaChmdW5jdGlvbihib3gpe1xuXHRcdGJveCA9IGJveC5nZXQoMClcblx0XHRib3guX2NzcyA9IHt9XG5cdFx0dmFyIGNvbXB1dGVkID0gc3R5bGUoYm94KVxuXHRcdGZvciAodmFyIGkgPSAwLCBsZW4gPSBjb21wdXRlZC5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuXHRcdFx0dmFyIGtleSA9IGNvbXB1dGVkW2ldXG5cdFx0XHRpZiAoY29tcHV0ZWRba2V5XSkgYm94Ll9jc3Nba2V5XSA9IGNvbXB1dGVkW2tleV1cblx0XHR9XG5cdH0pXG5cblx0ZWwuZmluZCgnaDMnKVxuXHRcdC5hcHBlbmQoJzxidXR0b24gY2xhc3M9XCJyZXNldFwiPuKGuzwvYnV0dG9uPicpXG5cdFx0Lm9uKCdtb3VzZWRvd24nLCBmdW5jdGlvbihlKXtcblx0XHRcdGVsLmZpbmQoJy5ib3gnKS5lYWNoKGZ1bmN0aW9uKGJveCl7XG5cdFx0XHRcdGJveCA9IGJveC5nZXQoMClcblx0XHRcdFx0Y3NzKGJveCwgYm94Ll9jc3MpXG5cdFx0XHR9KVxuXHRcdH0pXG59KSIsIlxuLyoqXG4gKiBHZXQgdGhlIGNvbXB1dGVkIHN0eWxlIG9mIGEgRE9NIGVsZW1lbnRcbiAqIFxuICogICBzdHlsZShkb2N1bWVudC5ib2R5KSAvLyA9PiB7d2lkdGg6JzUwMHB4JywgLi4ufVxuICogXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsZW1lbnRcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xuXG4vLyBBY2Nlc3NpbmcgdmlhIHdpbmRvdyBmb3IganNET00gc3VwcG9ydFxubW9kdWxlLmV4cG9ydHMgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZVxuXG4vLyBGYWxsYmFjayB0byBlbGVtLmN1cnJlbnRTdHlsZSBmb3IgSUUgPCA5XG5pZiAoIW1vZHVsZS5leHBvcnRzKSB7XG5cdG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGVsZW0pIHtcblx0XHRyZXR1cm4gZWxlbS5jdXJyZW50U3R5bGVcblx0fVxufVxuIiwiXG52YXIgcGFyc2VDb2xvciA9IHJlcXVpcmUoJ2NvbG9yLXBhcnNlcicpXG52YXIgRW1pdHRlciA9IHJlcXVpcmUoJ2VtaXR0ZXIvbGlnaHQnKVxudmFyIHN0eWxlID0gcmVxdWlyZSgnY29tcHV0ZWQtc3R5bGUnKVxudmFyIFR3ZWVuID0gcmVxdWlyZSgndHdlZW4vdHdlZW4nKVxudmFyIHJlc2V0ID0gVHdlZW4ucHJvdG90eXBlLnJlc2V0XG52YXIgdHdlZW5zID0gcmVxdWlyZSgnLi90d2VlbnMnKVxudmFyIENTU01hdHJpeCA9IFdlYktpdENTU01hdHJpeFxudmFyIHByZWZpeCA9IHJlcXVpcmUoJ3ByZWZpeCcpXG52YXIgbWVyZ2UgPSByZXF1aXJlKCdtZXJnZScpXG52YXIgcmFmID0gcmVxdWlyZSgncmFmJylcbnZhciBjc3MgPSByZXF1aXJlKCdjc3MnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGVsKXtcblx0cmV0dXJuIG5ldyBNb3ZlKGVsKVxufVxuXG4vKipcbiAqICd3ZWJraXRUcmFuc2Zvcm0nIHx8ICdNb3pUcmFuc2Zvcm0nIGV0Yy4uXG4gKiBAdHlwZSB7U3RyaW5nfVxuICovXG5cbnZhciB0cmFuc2Zvcm0gPSBwcmVmaXgoJ3RyYW5zZm9ybScpXG5cbi8qKlxuICogbWFwIG9mIGRlZmF1bHQgdHlwZXNcbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cblxudmFyIGRlZmF1bHRUeXBlcyA9IHtcbiAgZmlsbE9wYWNpdHk6ICdudW1iZXInLFxuICBmb250V2VpZ2h0OiAnbnVtYmVyJyxcbiAgb3BhY2l0eTogJ251bWJlcicsXG4gIHpJbmRleDogJ251bWJlcicsXG4gIHpvb206ICdudW1iZXInLFxuICB0cmFuc2Zvcm06ICdtYXRyaXgnXG59XG5kZWZhdWx0VHlwZXNbdHJhbnNmb3JtXSA9ICdtYXRyaXgnXG5cbmZ1bmN0aW9uIGRlZmF1bHRUeXBlKGtleSl7XG5cdHJldHVybiBkZWZhdWx0VHlwZXNba2V5XSB8fCAncHgnXG59XG5cbi8qKlxuICogdGhlIE1vdmUgY2xhc3NcbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIE1vdmUoZWwpe1xuXHR0aGlzLl90byA9IHt9XG5cdHRoaXMuX2N1cnIgPSB7fVxuXHR0aGlzLmVsID0gZWxcbn1cblxuLyoqXG4gKiBtaXhpbiBtZXRob2RzXG4gKi9cblxubWVyZ2UoTW92ZS5wcm90b3R5cGUsIEVtaXR0ZXIucHJvdG90eXBlKVxubWVyZ2UoTW92ZS5wcm90b3R5cGUsIFR3ZWVuLnByb3RvdHlwZSlcbm1lcmdlKE1vdmUsIFR3ZWVuKVxuXG4vKipcbiAqIGFkZCBgcHJvcGAgdG8gYW5pbWF0aW9uLiBXaGVuIHRoZSBhbmltYXRpb24gaXMgcnVuXG4gKiBgcHJvcGAgd2lsbCBiZSB0d2VlbmVkIGZyb20gaXRzIGN1cnJlbnQgdmFsdWUgdG8gYHRvYFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBwcm9wXG4gKiBAcGFyYW0ge0NTU30gdG9cbiAqIEByZXR1cm4ge3RoaXN9XG4gKi9cblxuTW92ZS5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24ocHJvcCwgdG8pe1xuXHR0aGlzLl90b1twcmVmaXgocHJvcCldID0gdG9cblx0cmV0dXJuIHRoaXNcbn1cblxuLyoqXG4gKiBpbmNyZW1lbnQgYHByb3BgIGJ5IGBuYFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBwcm9wXG4gKiBAcGFyYW0ge051bWJlcn0gdG9cbiAqIEByZXR1cm4ge3RoaXN9XG4gKi9cblxuTW92ZS5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24ocHJvcCwgbil7XG5cdHByb3AgPSBwcmVmaXgocHJvcClcblx0dmFyIGN1cnIgPSBwYXJzZUludCh0aGlzLmN1cnJlbnQocHJvcCksIDEwKVxuXHRyZXR1cm4gdGhpcy5zZXQocHJvcCwgY3VyciArIG4pXG59XG5cbi8qKlxuICogZGVjcmVtZW50IGBwcm9wYCBieSBgbmBcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gcHJvcFxuICogQHBhcmFtIHtOdW1iZXJ9IHRvXG4gKiBAcmV0dXJuIHt0aGlzfVxuICovXG5cbk1vdmUucHJvdG90eXBlLnN1YiA9IGZ1bmN0aW9uKHByb3AsIG4pe1xuXHRwcm9wID0gcHJlZml4KHByb3ApXG5cdHZhciBjdXJyID0gcGFyc2VJbnQodGhpcy5jdXJyZW50KHByb3ApLCAxMClcblx0cmV0dXJuIHRoaXMuc2V0KHByb3AsIGN1cnIgLSBuKVxufVxuXG4vKipcbiAqIGdldCB0aGUgY3VycmVudCB2YWx1ZSBvZiBgcHJvcGBcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gcHJvcFxuICogQHJldHVybiB7Q1NTfVxuICovXG5cbk1vdmUucHJvdG90eXBlLmN1cnJlbnQgPSBmdW5jdGlvbihwcm9wKXtcblx0cmV0dXJuIHN0eWxlKHRoaXMuZWwpW3Byb3BdXG59XG5cbi8qKlxuICogU2tldyBgeGAgYW5kIGB5YCBkZWdyZWVzLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSB4XG4gKiBAcGFyYW0ge051bWJlcn0geVxuICogQHJldHVybiB7TW92ZX0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbk1vdmUucHJvdG90eXBlLnNrZXcgPSBmdW5jdGlvbih4LCB5KXtcblx0eCAmJiB0aGlzLnNrZXdYKHgpXG5cdHkgJiYgdGhpcy5za2V3WSh5KVxuXHRyZXR1cm4gdGhpc1xufVxuXG4vKipcbiAqIFNrZXcgeCBieSBgbmAgZGVncmVlcy5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gblxuICogQHJldHVybiB7TW92ZX0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbk1vdmUucHJvdG90eXBlLnNrZXdYID0gZnVuY3Rpb24obil7XG5cdHRoaXMuX3RvW3RyYW5zZm9ybV0gPSB0aGlzLm1hdHJpeCgpLnNrZXdYKG4pXG5cdHJldHVybiB0aGlzXG59XG5cbi8qKlxuICogU2tldyB5IGJ5IGBuYCBkZWdyZWVzLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBuXG4gKiBAcmV0dXJuIHtNb3ZlfSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuTW92ZS5wcm90b3R5cGUuc2tld1kgPSBmdW5jdGlvbihuKXtcblx0dGhpcy5fdG9bdHJhbnNmb3JtXSA9IHRoaXMubWF0cml4KCkuc2tld1kobilcblx0cmV0dXJuIHRoaXNcbn1cblxuLyoqXG4gKiBUcmFuc2xhdGUgYHhgIGFuZCBgeWAgYXhpcy5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0geFxuICogQHBhcmFtIHtOdW1iZXJ9IHlcbiAqIEBwYXJhbSB7TnVtYmVyfSB6XG4gKiBAcmV0dXJuIHtNb3ZlfSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuTW92ZS5wcm90b3R5cGUudHJhbnNsYXRlID0gZnVuY3Rpb24oeCwgeSwgeil7XG5cdHRoaXMuX3RvW3RyYW5zZm9ybV0gPSB0aGlzLm1hdHJpeCgpLnRyYW5zbGF0ZSh4LCB5LCB6IHx8IDApXG5cdHJldHVybiB0aGlzXG59XG5cblxuLyoqXG4gKiBUcmFuc2xhdGUgb24gdGhlIHggYXhpcyB0byBgbmAuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IG5cbiAqIEByZXR1cm4ge01vdmV9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5Nb3ZlLnByb3RvdHlwZS50cmFuc2xhdGVYID1cbk1vdmUucHJvdG90eXBlLnggPSBmdW5jdGlvbihuKXtcblx0cmV0dXJuIHRoaXMudHJhbnNsYXRlKG4sIDAsIDApXG59XG5cbi8qKlxuICogVHJhbnNsYXRlIG9uIHRoZSB5IGF4aXMgdG8gYG5gLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBuXG4gKiBAcmV0dXJuIHtNb3ZlfSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuTW92ZS5wcm90b3R5cGUudHJhbnNsYXRlWSA9XG5Nb3ZlLnByb3RvdHlwZS55ID0gZnVuY3Rpb24obil7XG5cdHJldHVybiB0aGlzLnRyYW5zbGF0ZSgwLCBuLCAwKVxufVxuXG4vKipcbiAqIFNjYWxlIHRoZSB4IGFuZCB5IGF4aXMgYnkgYHhgLCBvclxuICogaW5kaXZpZHVhbGx5IHNjYWxlIGB4YCBhbmQgYHlgLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSB4XG4gKiBAcGFyYW0ge051bWJlcn0geVxuICogQHJldHVybiB7TW92ZX0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbk1vdmUucHJvdG90eXBlLnNjYWxlID0gZnVuY3Rpb24oeCwgeSl7XG5cdHRoaXMuX3RvW3RyYW5zZm9ybV0gPSB0aGlzLm1hdHJpeCgpLnNjYWxlKHgsIHksIDEpXG5cdHJldHVybiB0aGlzXG59XG5cbi8qKlxuICogU2NhbGUgeCBheGlzIGJ5IGBuYC5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gblxuICogQHJldHVybiB7TW92ZX0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbk1vdmUucHJvdG90eXBlLnNjYWxlWCA9IGZ1bmN0aW9uKG4pe1xuXHRyZXR1cm4gdGhpcy5zY2FsZShuLCAxLCAxKVxufVxuXG4vKipcbiAqIFNjYWxlIHkgYXhpcyBieSBgbmAuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IG5cbiAqIEByZXR1cm4ge01vdmV9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5Nb3ZlLnByb3RvdHlwZS5zY2FsZVkgPSBmdW5jdGlvbihuKXtcblx0cmV0dXJuIHRoaXMuc2NhbGUoMSwgbiwgMSlcbn1cblxuLyoqXG4gKiBSb3RhdGUgYG5gIGRlZ3JlZXMuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IG5cbiAqIEByZXR1cm4ge01vdmV9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5Nb3ZlLnByb3RvdHlwZS5yb3RhdGUgPSBmdW5jdGlvbihuKXtcblx0dGhpcy5fdG9bdHJhbnNmb3JtXSA9IHRoaXMubWF0cml4KCkucm90YXRlKG4pXG5cdHJldHVybiB0aGlzXG59XG5cbi8qKlxuICogZ2V0IHRoZSB0cmFuc2Zvcm1hdGlvbiBtYXRyaXhcbiAqXG4gKiBAcmV0dXJuIHtDU1NNYXRyaXh9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5Nb3ZlLnByb3RvdHlwZS5tYXRyaXggPSBmdW5jdGlvbigpe1xuXHRpZiAodHJhbnNmb3JtIGluIHRoaXMuX3RvKSByZXR1cm4gdGhpcy5fdG9bdHJhbnNmb3JtXVxuXHR2YXIgbWF0cml4ID0gdGhpcy5jdXJyZW50KHRyYW5zZm9ybSlcblx0aWYgKHR5cGVvZiBtYXRyaXggPT0gJ3N0cmluZycpIG1hdHJpeCA9IG5ldyBDU1NNYXRyaXgobWF0cml4KVxuXHRyZXR1cm4gdGhpcy5fdG9bdHJhbnNmb3JtXSA9IG1hdHJpeFxufVxuXG4vKipcbiAqIGNyZWF0ZSBhIGZyYW1lIGF0IHBvaW50IGBwYCB0aHJvdWdoIHRoZSBhbmltYXRpb25cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gcFxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuTW92ZS5wcm90b3R5cGUuZnJhbWUgPSBmdW5jdGlvbihwKXtcblx0dmFyIHR3ZWVucyA9IHRoaXMudHdlZW5zKClcblx0dmFyIGN1cnIgPSB0aGlzLl9jdXJyXG5cdGZvciAodmFyIGsgaW4gdHdlZW5zKSB7XG5cdFx0Y3VycltrXSA9IHR3ZWVuc1trXS5mcmFtZShwKVxuXHR9XG5cdHJldHVybiBjdXJyXG59XG5cbi8qKlxuICogR2VuZXJhdGUgdHdlZW5zLiBUaGlzIHNob3VsZCBiZSBjYWxsZWRcbiAqIGFzIGxhdGUgYXMgcG9zc2libGVcbiAqXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5Nb3ZlLnByb3RvdHlwZS50d2VlbnMgPSBmdW5jdGlvbigpe1xuXHRpZiAodGhpcy5fdHdlZW5zKSByZXR1cm4gdGhpcy5fdHdlZW5zXG5cdHZhciB0d2VlbnMgPSB0aGlzLl90d2VlbnMgPSB7fVxuXHRmb3IgKHZhciBrZXkgaW4gdGhpcy5fdG8pIHtcblx0XHR2YXIgZnJvbSA9IHRoaXMuY3VycmVudChrZXkpXG5cdFx0dmFyIHRvID0gdGhpcy5fdG9ba2V5XVxuXHRcdHR3ZWVuc1trZXldID0gdHdlZW4oa2V5LCBmcm9tLCB0bylcblx0fVxuXHRyZXR1cm4gdHdlZW5zXG59XG5cbmZ1bmN0aW9uIHR3ZWVuKHByb3AsIGZyb20sIHRvKXtcblx0dmFyIFR3ZWVuID0gdHlwZW9mIGZyb20gPT0gJ3N0cmluZycgJiYgdHdlZW5zW3R5cGUoZnJvbSldXG5cdGlmICghVHdlZW4pIFR3ZWVuID0gdHdlZW5zW2RlZmF1bHRUeXBlKHByb3ApXVxuXHRyZXR1cm4gbmV3IFR3ZWVuKGZyb20sIHRvKVxufVxuXG4vKipcbiAqIGRldGVybWluZSB0eXBlIG9mIGBjc3NgIHZhbHVlXG4gKlxuICogQHBhcmFtIHtTdHJpbmd8TnVtYmVyfSBjc3NcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHR5cGUoY3NzKXtcblx0aWYgKC9ebWF0cml4KDNkKT9cXChbXildKlxcKSQvLnRlc3QoY3NzKSkgcmV0dXJuICdtYXRyaXgnXG5cdGlmICgvXlstLlxcZF0rcHgvLnRlc3QoY3NzKSkgcmV0dXJuICdweCdcblx0aWYgKHBhcnNlQ29sb3IoY3NzKSkgcmV0dXJuICdjb2xvcidcbn1cblxuLyoqXG4gKiByZXNldCB0aGUgYW5pbWF0aW9uIHNvIGl0IGNhbiBiZSByZS11c2VkXG4gKlxuICogQHJldHVybiB7dGhpc31cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuTW92ZS5wcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbigpe1xuXHR2YXIgdHdlZW5zID0gdGhpcy50d2VlbnMoKVxuXHRmb3IgKHZhciB0d2VlbiBpbiB0d2VlbnMpIHtcblx0XHR0d2VlbnNbdHdlZW5dLnJlc2V0KCkuZWFzZSh0aGlzLl9lYXNlKVxuXHR9XG5cdHJlc2V0LmNhbGwodGhpcylcblx0dGhpcy5fY3VyciA9IHt9XG5cdHJldHVybiB0aGlzXG59XG5cbi8qKlxuICogc2V0IGR1cmF0aW9uIHRvIGBuYC4gaWYgYG5gIGlzIGEgc3RyaW5nIGl0XG4gKiBpcyBhc3N1bWVkIHRvIGJlIGluIHNlY29uZHNcbiAqXG4gKiBAcGFyYW0ge051bWJlcnxTdHJpbmd9IG5cbiAqIEByZXR1cm4ge3RoaXN9XG4gKi9cblxuTW92ZS5wcm90b3R5cGUuZHVyYXRpb24gPSBmdW5jdGlvbihuKXtcblx0aWYgKHR5cGVvZiBuID09ICdzdHJpbmcnKSBuID0gcGFyc2VGbG9hdChuKSAqIDEwMDBcblx0dGhpcy5fZHVyYXRpb24gPSBuXG5cdHJldHVybiB0aGlzXG59XG5cbi8qKlxuICogQ3JlYXRlIGEgYERlZmVycmVkTW92ZWAgaW5zdGFuY2Ugd2hpY2ggd2lsbCBydW5cbiAqIHdoZW4gYHRoaXNgIG1vdmUgY29tcGxldGVzLiBPcHRpb25hbGx5IHlvdSBjYW5cbiAqIHBhc3MgaW4gYSBNb3ZlIGluc3RhbmNlIGluIHdoaWNoIGNhc2UgaXQgd2lsbCBiZVxuICogYmUgcnVuIG9uIGNvbXBsZXRpb24gb2YgYHRoaXNgIGFuaW1hdGlvbi5cbiAqXG4gKiBAcGFyYW0ge01vdmV9IFttb3ZlXVxuICogQHJldHVybiB7dGhpc3xEZWZlcnJlZE1vdmV9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbk1vdmUucHJvdG90eXBlLnRoZW4gPSBmdW5jdGlvbihtb3ZlKXtcblx0aWYgKG1vdmUpIHtcblx0XHR0aGlzLm9uKCdlbmQnLCBmdW5jdGlvbigpe1xuXHRcdFx0bW92ZS5ydW4oKVxuXHRcdH0pXG5cdFx0aWYgKCF0aGlzLnJ1bm5pbmcpIHRoaXMucnVuKClcblx0XHRyZXR1cm4gdGhpc1xuXHR9XG5cdG1vdmUgPSBuZXcgRGVmZXJyZWRNb3ZlKHRoaXMpXG5cdHRoaXMudGhlbihtb3ZlKVxuXHRyZXR1cm4gbW92ZVxufVxuXG4vKipcbiAqIGNyZWF0ZSBhIHNwZWNpYWxpemVkIHN1Yi1jbGFzcyBvZiBgTW92ZWAgZm9yIHVzZVxuICogaW4gYHRoZW4oKWBcbiAqXG4gKiBAcGFyYW0ge01vdmV9IHBhcmVudFxuICogQGFwaSBwcml2YXRlXG4gKi9cblxudmFyIERlZmVycmVkTW92ZSA9IE1vdmUuZXh0ZW5kKGZ1bmN0aW9uKHBhcmVudCl7XG5cdE1vdmUuY2FsbCh0aGlzLCBwYXJlbnQuZWwpXG5cdHRoaXMuX2R1cmF0aW9uID0gcGFyZW50Ll9kdXJhdGlvblxuXHR0aGlzLl9lYXNlID0gcGFyZW50Ll9lYXNlXG5cdHRoaXMucGFyZW50ID0gcGFyZW50XG5cdHRoaXMucnVubmluZyA9IHRydWVcbn0sICdmaW5hbCcpXG5cbi8qKlxuICogY2hlY2sgcGFyZW50IHR3ZWVuIGluY2FzZSBgcHJvcGAgaXMgY3VycmVudGx5IGJlaW5nXG4gKiBhbmltYXRlZC4gSWYgaXQgaXMgZ2V0IHRoZSBmaW5hbCBmcmFtZVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBwcm9wXG4gKiBAcmV0dXJuIHtDU1N9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5EZWZlcnJlZE1vdmUucHJvdG90eXBlLmN1cnJlbnQgPSBmdW5jdGlvbihwcm9wKXtcblx0dmFyIHBhcmVudCA9IHRoaXMucGFyZW50XG5cdHdoaWxlIChwYXJlbnQpIHtcblx0XHRpZiAocHJvcCBpbiBwYXJlbnQuX3RvKSByZXR1cm4gcGFyZW50Ll90b1twcm9wXVxuXHRcdHBhcmVudCA9IHBhcmVudC5wYXJlbnRcblx0fVxuXHRyZXR1cm4gc3R5bGUodGhpcy5lbClbcHJvcF1cbn1cblxuLyoqXG4gKiBzdWdhciBmb3IgYHRoaXMucGFyZW50YC4gU29tZXRpbWVzIGxvb2tzIG5pY2VyIGluXG4gKiBsb25nIGNoYWluc1xuICpcbiAqIEByZXR1cm4ge01vdmV9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkRlZmVycmVkTW92ZS5wcm90b3R5cGUucG9wID0gZnVuY3Rpb24oKXtcblx0cmV0dXJuIHRoaXMucGFyZW50XG59XG5cbi8qKlxuICogcnVuIHRoZSBhbmltYXRpb24gd2l0aCBhbiBvcHRpb25hbCBjYWxsYmFjayBvciBkdXJhdGlvblxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfFN0cmluZ3xGdW5jdGlvbn0gW25dXG4gKiBAcmV0dXJuIHt0aGlzfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5Nb3ZlLnByb3RvdHlwZS5lbmQgPVxuTW92ZS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24obil7XG5cdGlmIChuICE9IG51bGwpIHtcblx0XHRpZiAodHlwZW9mIG4gPT0gJ2Z1bmN0aW9uJykgdGhpcy5vbignZW5kJywgbilcblx0XHRlbHNlIHRoaXMuZHVyYXRpb24obilcblx0fVxuXHR2YXIgc2VsZiA9IHRoaXNcblx0cmFmKGZ1bmN0aW9uIGxvb3AoKXtcblx0XHRjc3Moc2VsZi5lbCwgc2VsZi5uZXh0KCkpXG5cdFx0aWYgKHNlbGYuZG9uZSkgc2VsZi5lbWl0KCdlbmQnKVxuXHRcdGVsc2UgcmFmKGxvb3ApXG5cdH0pXG5cdHRoaXMucnVubmluZyA9IHRydWVcblx0cmVzZXQuY2FsbCh0aGlzKVxuXHRyZXR1cm4gdGhpc1xufVxuXG5Nb3ZlLnByb3RvdHlwZS5vbignZW5kJywgZnVuY3Rpb24oKXtcblx0dGhpcy5ydW5uaW5nID0gZmFsc2Vcbn0pIiwiLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICovXG5cbnZhciBtYXRjaGVzID0gcmVxdWlyZSgnbWF0Y2hlcy1zZWxlY3RvcicpO1xudmFyIGRlbGVnYXRlID0gcmVxdWlyZSgnZGVsZWdhdGUnKTtcbnZhciBjbGFzc2VzID0gcmVxdWlyZSgnY2xhc3NlcycpO1xudmFyIHRyYXZlcnNlID0gcmVxdWlyZSgndHJhdmVyc2UnKTtcbnZhciBpbmRleG9mID0gcmVxdWlyZSgnaW5kZXhvZicpO1xudmFyIGRvbWlmeSA9IHJlcXVpcmUoJ2RvbWlmeScpO1xudmFyIGV2ZW50cyA9IHJlcXVpcmUoJ2V2ZW50Jyk7XG52YXIgdmFsdWUgPSByZXF1aXJlKCd2YWx1ZScpO1xudmFyIHF1ZXJ5ID0gcmVxdWlyZSgncXVlcnknKTtcbnZhciB0eXBlID0gcmVxdWlyZSgndHlwZScpO1xudmFyIGNzcyA9IHJlcXVpcmUoJ2NzcycpO1xuXG4vKipcbiAqIEF0dHJpYnV0ZXMgc3VwcG9ydGVkLlxuICovXG5cbnZhciBhdHRycyA9IFtcbiAgJ2lkJyxcbiAgJ3NyYycsXG4gICdyZWwnLFxuICAnY29scycsXG4gICdyb3dzJyxcbiAgJ3R5cGUnLFxuICAnbmFtZScsXG4gICdocmVmJyxcbiAgJ3RpdGxlJyxcbiAgJ3N0eWxlJyxcbiAgJ3dpZHRoJyxcbiAgJ2hlaWdodCcsXG4gICdhY3Rpb24nLFxuICAnbWV0aG9kJyxcbiAgJ3RhYmluZGV4JyxcbiAgJ3BsYWNlaG9sZGVyJ1xuXTtcblxuLyoqXG4gKiBFeHBvc2UgYGRvbSgpYC5cbiAqL1xuXG5leHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBkb207XG5cbi8qKlxuICogRXhwb3NlIHN1cHBvcnRlZCBhdHRycy5cbiAqL1xuXG5leHBvcnRzLmF0dHJzID0gYXR0cnM7XG5cbi8qKlxuICogUmV0dXJuIGEgZG9tIGBMaXN0YCBmb3IgdGhlIGdpdmVuXG4gKiBgaHRtbGAsIHNlbGVjdG9yLCBvciBlbGVtZW50LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfEVsZW1lbnR8TGlzdH1cbiAqIEByZXR1cm4ge0xpc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIGRvbShzZWxlY3RvciwgY29udGV4dCkge1xuICAvLyBhcnJheVxuICBpZiAoQXJyYXkuaXNBcnJheShzZWxlY3RvcikpIHtcbiAgICByZXR1cm4gbmV3IExpc3Qoc2VsZWN0b3IpO1xuICB9XG5cbiAgLy8gTGlzdFxuICBpZiAoc2VsZWN0b3IgaW5zdGFuY2VvZiBMaXN0KSB7XG4gICAgcmV0dXJuIHNlbGVjdG9yO1xuICB9XG5cbiAgLy8gbm9kZVxuICBpZiAoc2VsZWN0b3Iubm9kZU5hbWUpIHtcbiAgICByZXR1cm4gbmV3IExpc3QoW3NlbGVjdG9yXSk7XG4gIH1cblxuICBpZiAoJ3N0cmluZycgIT0gdHlwZW9mIHNlbGVjdG9yKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignaW52YWxpZCBzZWxlY3RvcicpO1xuICB9XG5cbiAgLy8gaHRtbFxuICBpZiAoJzwnID09IHNlbGVjdG9yLmNoYXJBdCgwKSkge1xuICAgIHJldHVybiBuZXcgTGlzdChbZG9taWZ5KHNlbGVjdG9yKV0sIHNlbGVjdG9yKTtcbiAgfVxuXG4gIC8vIHNlbGVjdG9yXG4gIHZhciBjdHggPSBjb250ZXh0XG4gICAgPyAoY29udGV4dC5lbHMgPyBjb250ZXh0LmVsc1swXSA6IGNvbnRleHQpXG4gICAgOiBkb2N1bWVudDtcblxuICByZXR1cm4gbmV3IExpc3QocXVlcnkuYWxsKHNlbGVjdG9yLCBjdHgpLCBzZWxlY3Rvcik7XG59XG5cbi8qKlxuICogRXhwb3NlIGBMaXN0YCBjb25zdHJ1Y3Rvci5cbiAqL1xuXG5leHBvcnRzLkxpc3QgPSBMaXN0O1xuXG4vKipcbiAqIEluaXRpYWxpemUgYSBuZXcgYExpc3RgIHdpdGggdGhlXG4gKiBnaXZlbiBhcnJheS1pc2ggb2YgYGVsc2AgYW5kIGBzZWxlY3RvcmBcbiAqIHN0cmluZy5cbiAqXG4gKiBAcGFyYW0ge01peGVkfSBlbHNcbiAqIEBwYXJhbSB7U3RyaW5nfSBzZWxlY3RvclxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gTGlzdChlbHMsIHNlbGVjdG9yKSB7XG4gIHRoaXMuZWxzID0gZWxzIHx8IFtdO1xuICB0aGlzLnNlbGVjdG9yID0gc2VsZWN0b3I7XG59XG5cbi8qKlxuICogRW51bWVyYWJsZSBpdGVyYXRvci5cbiAqL1xuXG5MaXN0LnByb3RvdHlwZS5fX2l0ZXJhdGVfXyA9IGZ1bmN0aW9uKCl7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgcmV0dXJuIHtcbiAgICBsZW5ndGg6IGZ1bmN0aW9uKCl7IHJldHVybiBzZWxmLmVscy5sZW5ndGggfSxcbiAgICBnZXQ6IGZ1bmN0aW9uKGkpeyByZXR1cm4gbmV3IExpc3QoW3NlbGYuZWxzW2ldXSkgfVxuICB9XG59O1xuXG4vKipcbiAqIFJlbW92ZSBlbGVtZW50cyBmcm9tIHRoZSBET00uXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5MaXN0LnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbigpe1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZWxzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGVsID0gdGhpcy5lbHNbaV07XG4gICAgdmFyIHBhcmVudCA9IGVsLnBhcmVudE5vZGU7XG4gICAgaWYgKHBhcmVudCkgcGFyZW50LnJlbW92ZUNoaWxkKGVsKTtcbiAgfVxufTtcblxuLyoqXG4gKiBTZXQgYXR0cmlidXRlIGBuYW1lYCB0byBgdmFsYCwgb3IgZ2V0IGF0dHIgYG5hbWVgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gKiBAcGFyYW0ge1N0cmluZ30gW3ZhbF1cbiAqIEByZXR1cm4ge1N0cmluZ3xMaXN0fSBzZWxmXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkxpc3QucHJvdG90eXBlLmF0dHIgPSBmdW5jdGlvbihuYW1lLCB2YWwpe1xuICAvLyBnZXRcbiAgaWYgKDEgPT0gYXJndW1lbnRzLmxlbmd0aCkge1xuICAgIHJldHVybiB0aGlzLmVsc1swXSAmJiB0aGlzLmVsc1swXS5nZXRBdHRyaWJ1dGUobmFtZSk7XG4gIH1cblxuICAvLyByZW1vdmVcbiAgaWYgKG51bGwgPT0gdmFsKSB7XG4gICAgcmV0dXJuIHRoaXMucmVtb3ZlQXR0cihuYW1lKTtcbiAgfVxuXG4gIC8vIHNldFxuICByZXR1cm4gdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKGVsKXtcbiAgICBlbC5zZXRBdHRyaWJ1dGUobmFtZSwgdmFsKTtcbiAgfSk7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBhdHRyaWJ1dGUgYG5hbWVgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gKiBAcmV0dXJuIHtMaXN0fSBzZWxmXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkxpc3QucHJvdG90eXBlLnJlbW92ZUF0dHIgPSBmdW5jdGlvbihuYW1lKXtcbiAgcmV0dXJuIHRoaXMuZm9yRWFjaChmdW5jdGlvbihlbCl7XG4gICAgZWwucmVtb3ZlQXR0cmlidXRlKG5hbWUpO1xuICB9KTtcbn07XG5cbi8qKlxuICogU2V0IHByb3BlcnR5IGBuYW1lYCB0byBgdmFsYCwgb3IgZ2V0IHByb3BlcnR5IGBuYW1lYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICogQHBhcmFtIHtTdHJpbmd9IFt2YWxdXG4gKiBAcmV0dXJuIHtPYmplY3R8TGlzdH0gc2VsZlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5MaXN0LnByb3RvdHlwZS5wcm9wID0gZnVuY3Rpb24obmFtZSwgdmFsKXtcbiAgaWYgKDEgPT0gYXJndW1lbnRzLmxlbmd0aCkge1xuICAgIHJldHVybiB0aGlzLmVsc1swXSAmJiB0aGlzLmVsc1swXVtuYW1lXTtcbiAgfVxuXG4gIHJldHVybiB0aGlzLmZvckVhY2goZnVuY3Rpb24oZWwpe1xuICAgIGVsW25hbWVdID0gdmFsO1xuICB9KTtcbn07XG5cbi8qKlxuICogR2V0IHRoZSBmaXJzdCBlbGVtZW50J3MgdmFsdWUgb3Igc2V0IHNlbGVjdGVkXG4gKiBlbGVtZW50IHZhbHVlcyB0byBgdmFsYC5cbiAqXG4gKiBAcGFyYW0ge01peGVkfSBbdmFsXVxuICogQHJldHVybiB7TWl4ZWR9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkxpc3QucHJvdG90eXBlLnZhbCA9XG5MaXN0LnByb3RvdHlwZS52YWx1ZSA9IGZ1bmN0aW9uKHZhbCl7XG4gIGlmICgwID09IGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICByZXR1cm4gdGhpcy5lbHNbMF1cbiAgICAgID8gdmFsdWUodGhpcy5lbHNbMF0pXG4gICAgICA6IHVuZGVmaW5lZDtcbiAgfVxuXG4gIHJldHVybiB0aGlzLmZvckVhY2goZnVuY3Rpb24oZWwpe1xuICAgIHZhbHVlKGVsLCB2YWwpO1xuICB9KTtcbn07XG5cbi8qKlxuICogUmV0dXJuIGEgY2xvbmVkIGBMaXN0YCB3aXRoIGFsbCBlbGVtZW50cyBjbG9uZWQuXG4gKlxuICogQHJldHVybiB7TGlzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuTGlzdC5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbigpe1xuICB2YXIgYXJyID0gW107XG4gIGZvciAodmFyIGkgPSAwLCBsZW4gPSB0aGlzLmVscy5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xuICAgIGFyci5wdXNoKHRoaXMuZWxzW2ldLmNsb25lTm9kZSh0cnVlKSk7XG4gIH1cbiAgcmV0dXJuIG5ldyBMaXN0KGFycik7XG59O1xuXG4vKipcbiAqIFByZXBlbmQgYHZhbGAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd8RWxlbWVudHxMaXN0fSB2YWxcbiAqIEByZXR1cm4ge0xpc3R9IG5ldyBsaXN0XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkxpc3QucHJvdG90eXBlLnByZXBlbmQgPSBmdW5jdGlvbih2YWwpe1xuICB2YXIgZWwgPSB0aGlzLmVsc1swXTtcbiAgaWYgKCFlbCkgcmV0dXJuIHRoaXM7XG4gIHZhbCA9IGRvbSh2YWwpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHZhbC5lbHMubGVuZ3RoOyArK2kpIHtcbiAgICBpZiAoZWwuY2hpbGRyZW4ubGVuZ3RoKSB7XG4gICAgICBlbC5pbnNlcnRCZWZvcmUodmFsLmVsc1tpXSwgZWwuZmlyc3RDaGlsZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVsLmFwcGVuZENoaWxkKHZhbC5lbHNbaV0pO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdmFsO1xufTtcblxuLyoqXG4gKiBBcHBlbmQgYHZhbGAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd8RWxlbWVudHxMaXN0fSB2YWxcbiAqIEByZXR1cm4ge0xpc3R9IG5ldyBsaXN0XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkxpc3QucHJvdG90eXBlLmFwcGVuZCA9IGZ1bmN0aW9uKHZhbCl7XG4gIHZhciBlbCA9IHRoaXMuZWxzWzBdO1xuICBpZiAoIWVsKSByZXR1cm4gdGhpcztcbiAgdmFsID0gZG9tKHZhbCk7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdmFsLmVscy5sZW5ndGg7ICsraSkge1xuICAgIGVsLmFwcGVuZENoaWxkKHZhbC5lbHNbaV0pO1xuICB9XG4gIHJldHVybiB2YWw7XG59O1xuXG4vKipcbiAqIEFwcGVuZCBzZWxmJ3MgYGVsYCB0byBgdmFsYFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfEVsZW1lbnR8TGlzdH0gdmFsXG4gKiBAcmV0dXJuIHtMaXN0fSBzZWxmXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkxpc3QucHJvdG90eXBlLmFwcGVuZFRvID0gZnVuY3Rpb24odmFsKXtcbiAgZG9tKHZhbCkuYXBwZW5kKHRoaXMpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogSW5zZXJ0IHNlbGYncyBgZWxzYCBhZnRlciBgdmFsYFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfEVsZW1lbnR8TGlzdH0gdmFsXG4gKiBAcmV0dXJuIHtMaXN0fSBzZWxmXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkxpc3QucHJvdG90eXBlLmluc2VydEFmdGVyID0gZnVuY3Rpb24odmFsKXtcbiAgdmFsID0gZG9tKHZhbCkuZWxzWzBdO1xuICBpZiAoIXZhbCB8fCAhdmFsLnBhcmVudE5vZGUpIHJldHVybiB0aGlzO1xuICB0aGlzLmVscy5mb3JFYWNoKGZ1bmN0aW9uKGVsKXtcbiAgICB2YWwucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoZWwsIHZhbC5uZXh0U2libGluZyk7XG4gIH0pO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmV0dXJuIGEgYExpc3RgIGNvbnRhaW5pbmcgdGhlIGVsZW1lbnQgYXQgYGlgLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBpXG4gKiBAcmV0dXJuIHtMaXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5MaXN0LnByb3RvdHlwZS5hdCA9IGZ1bmN0aW9uKGkpe1xuICByZXR1cm4gbmV3IExpc3QoW3RoaXMuZWxzW2ldXSwgdGhpcy5zZWxlY3Rvcik7XG59O1xuXG4vKipcbiAqIFJldHVybiBhIGBMaXN0YCBjb250YWluaW5nIHRoZSBmaXJzdCBlbGVtZW50LlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBpXG4gKiBAcmV0dXJuIHtMaXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5MaXN0LnByb3RvdHlwZS5maXJzdCA9IGZ1bmN0aW9uKCl7XG4gIHJldHVybiBuZXcgTGlzdChbdGhpcy5lbHNbMF1dLCB0aGlzLnNlbGVjdG9yKTtcbn07XG5cbi8qKlxuICogUmV0dXJuIGEgYExpc3RgIGNvbnRhaW5pbmcgdGhlIGxhc3QgZWxlbWVudC5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gaVxuICogQHJldHVybiB7TGlzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuTGlzdC5wcm90b3R5cGUubGFzdCA9IGZ1bmN0aW9uKCl7XG4gIHJldHVybiBuZXcgTGlzdChbdGhpcy5lbHNbdGhpcy5lbHMubGVuZ3RoIC0gMV1dLCB0aGlzLnNlbGVjdG9yKTtcbn07XG5cbi8qKlxuICogUmV0dXJuIGFuIGBFbGVtZW50YCBhdCBgaWAuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IGlcbiAqIEByZXR1cm4ge0VsZW1lbnR9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkxpc3QucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKGkpe1xuICByZXR1cm4gdGhpcy5lbHNbaSB8fCAwXTtcbn07XG5cbi8qKlxuICogUmV0dXJuIGxpc3QgbGVuZ3RoLlxuICpcbiAqIEByZXR1cm4ge051bWJlcn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuTGlzdC5wcm90b3R5cGUubGVuZ3RoID0gZnVuY3Rpb24oKXtcbiAgcmV0dXJuIHRoaXMuZWxzLmxlbmd0aDtcbn07XG5cbi8qKlxuICogUmV0dXJuIGVsZW1lbnQgdGV4dC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtTdHJpbmd8TGlzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuTGlzdC5wcm90b3R5cGUudGV4dCA9IGZ1bmN0aW9uKHN0cil7XG4gIC8vIFRPRE86IHJlYWwgaW1wbFxuICBpZiAoMSA9PSBhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKGVsKXtcbiAgICAgIGVsLnRleHRDb250ZW50ID0gc3RyO1xuICAgIH0pO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgdmFyIHN0ciA9ICcnO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZWxzLmxlbmd0aDsgKytpKSB7XG4gICAgc3RyICs9IHRoaXMuZWxzW2ldLnRleHRDb250ZW50O1xuICB9XG4gIHJldHVybiBzdHI7XG59O1xuXG4vKipcbiAqIFJldHVybiBlbGVtZW50IGh0bWwuXG4gKlxuICogQHJldHVybiB7U3RyaW5nfSBodG1sXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkxpc3QucHJvdG90eXBlLmh0bWwgPSBmdW5jdGlvbihodG1sKXtcbiAgaWYgKDEgPT0gYXJndW1lbnRzLmxlbmd0aCkge1xuICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbihlbCl7XG4gICAgICBlbC5pbm5lckhUTUwgPSBodG1sO1xuICAgIH0pO1xuICB9XG4gIC8vIFRPRE86IHJlYWwgaW1wbFxuICByZXR1cm4gdGhpcy5lbHNbMF0gJiYgdGhpcy5lbHNbMF0uaW5uZXJIVE1MO1xufTtcblxuLyoqXG4gKiBCaW5kIHRvIGBldmVudGAgYW5kIGludm9rZSBgZm4oZSlgLiBXaGVuXG4gKiBhIGBzZWxlY3RvcmAgaXMgZ2l2ZW4gdGhlbiBldmVudHMgYXJlIGRlbGVnYXRlZC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEBwYXJhbSB7U3RyaW5nfSBbc2VsZWN0b3JdXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHBhcmFtIHtCb29sZWFufSBjYXB0dXJlXG4gKiBAcmV0dXJuIHtMaXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5MaXN0LnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uKGV2ZW50LCBzZWxlY3RvciwgZm4sIGNhcHR1cmUpe1xuICBpZiAoJ3N0cmluZycgPT0gdHlwZW9mIHNlbGVjdG9yKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmVscy5sZW5ndGg7ICsraSkge1xuICAgICAgZm4uX2RlbGVnYXRlID0gZGVsZWdhdGUuYmluZCh0aGlzLmVsc1tpXSwgc2VsZWN0b3IsIGV2ZW50LCBmbiwgY2FwdHVyZSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgY2FwdHVyZSA9IGZuO1xuICBmbiA9IHNlbGVjdG9yO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5lbHMubGVuZ3RoOyArK2kpIHtcbiAgICBldmVudHMuYmluZCh0aGlzLmVsc1tpXSwgZXZlbnQsIGZuLCBjYXB0dXJlKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBVbmJpbmQgdG8gYGV2ZW50YCBhbmQgaW52b2tlIGBmbihlKWAuIFdoZW5cbiAqIGEgYHNlbGVjdG9yYCBpcyBnaXZlbiB0aGVuIGRlbGVnYXRlZCBldmVudFxuICogaGFuZGxlcnMgYXJlIHVuYm91bmQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge1N0cmluZ30gW3NlbGVjdG9yXVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gY2FwdHVyZVxuICogQHJldHVybiB7TGlzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuTGlzdC5wcm90b3R5cGUub2ZmID0gZnVuY3Rpb24oZXZlbnQsIHNlbGVjdG9yLCBmbiwgY2FwdHVyZSl7XG4gIGlmICgnc3RyaW5nJyA9PSB0eXBlb2Ygc2VsZWN0b3IpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZWxzLmxlbmd0aDsgKytpKSB7XG4gICAgICAvLyBUT0RPOiBhZGQgc2VsZWN0b3Igc3VwcG9ydCBiYWNrXG4gICAgICBkZWxlZ2F0ZS51bmJpbmQodGhpcy5lbHNbaV0sIGV2ZW50LCBmbi5fZGVsZWdhdGUsIGNhcHR1cmUpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGNhcHR1cmUgPSBmbjtcbiAgZm4gPSBzZWxlY3RvcjtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZWxzLmxlbmd0aDsgKytpKSB7XG4gICAgZXZlbnRzLnVuYmluZCh0aGlzLmVsc1tpXSwgZXZlbnQsIGZuLCBjYXB0dXJlKTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogSXRlcmF0ZSBlbGVtZW50cyBhbmQgaW52b2tlIGBmbihsaXN0LCBpKWAuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge0xpc3R9IHNlbGZcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuTGlzdC5wcm90b3R5cGUuZWFjaCA9IGZ1bmN0aW9uKGZuKXtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmVscy5sZW5ndGg7ICsraSkge1xuICAgIGZuKG5ldyBMaXN0KFt0aGlzLmVsc1tpXV0sIHRoaXMuc2VsZWN0b3IpLCBpKTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogSXRlcmF0ZSBlbGVtZW50cyBhbmQgaW52b2tlIGBmbihlbCwgaSlgLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtMaXN0fSBzZWxmXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkxpc3QucHJvdG90eXBlLmZvckVhY2ggPSBmdW5jdGlvbihmbil7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5lbHMubGVuZ3RoOyArK2kpIHtcbiAgICBmbih0aGlzLmVsc1tpXSwgaSk7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIE1hcCBlbGVtZW50cyBpbnZva2luZyBgZm4obGlzdCwgaSlgLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuTGlzdC5wcm90b3R5cGUubWFwID0gZnVuY3Rpb24oZm4pe1xuICB2YXIgYXJyID0gW107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5lbHMubGVuZ3RoOyArK2kpIHtcbiAgICBhcnIucHVzaChmbihuZXcgTGlzdChbdGhpcy5lbHNbaV1dLCB0aGlzLnNlbGVjdG9yKSwgaSkpO1xuICB9XG4gIHJldHVybiBhcnI7XG59O1xuXG4vKipcbiAqIEZpbHRlciBlbGVtZW50cyBpbnZva2luZyBgZm4obGlzdCwgaSlgLCByZXR1cm5pbmdcbiAqIGEgbmV3IGBMaXN0YCBvZiBlbGVtZW50cyB3aGVuIGEgdHJ1dGh5IHZhbHVlIGlzIHJldHVybmVkLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtMaXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5MaXN0LnByb3RvdHlwZS5zZWxlY3QgPVxuTGlzdC5wcm90b3R5cGUuZmlsdGVyID0gZnVuY3Rpb24oZm4pe1xuICB2YXIgZWw7XG4gIHZhciBsaXN0ID0gbmV3IExpc3QoW10sIHRoaXMuc2VsZWN0b3IpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZWxzLmxlbmd0aDsgKytpKSB7XG4gICAgZWwgPSB0aGlzLmVsc1tpXTtcbiAgICBpZiAoZm4obmV3IExpc3QoW2VsXSwgdGhpcy5zZWxlY3RvciksIGkpKSBsaXN0LmVscy5wdXNoKGVsKTtcbiAgfVxuICByZXR1cm4gbGlzdDtcbn07XG5cbi8qKlxuICogRmlsdGVyIGVsZW1lbnRzIGludm9raW5nIGBmbihsaXN0LCBpKWAsIHJldHVybmluZ1xuICogYSBuZXcgYExpc3RgIG9mIGVsZW1lbnRzIHdoZW4gYSBmYWxzZXkgdmFsdWUgaXMgcmV0dXJuZWQuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge0xpc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkxpc3QucHJvdG90eXBlLnJlamVjdCA9IGZ1bmN0aW9uKGZuKXtcbiAgdmFyIGVsO1xuICB2YXIgbGlzdCA9IG5ldyBMaXN0KFtdLCB0aGlzLnNlbGVjdG9yKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmVscy5sZW5ndGg7ICsraSkge1xuICAgIGVsID0gdGhpcy5lbHNbaV07XG4gICAgaWYgKCFmbihuZXcgTGlzdChbZWxdLCB0aGlzLnNlbGVjdG9yKSwgaSkpIGxpc3QuZWxzLnB1c2goZWwpO1xuICB9XG4gIHJldHVybiBsaXN0O1xufTtcblxuLyoqXG4gKiBBZGQgdGhlIGdpdmVuIGNsYXNzIGBuYW1lYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICogQHJldHVybiB7TGlzdH0gc2VsZlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5MaXN0LnByb3RvdHlwZS5hZGRDbGFzcyA9IGZ1bmN0aW9uKG5hbWUpe1xuICB2YXIgZWw7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5lbHMubGVuZ3RoOyArK2kpIHtcbiAgICBlbCA9IHRoaXMuZWxzW2ldO1xuICAgIGVsLl9jbGFzc2VzID0gZWwuX2NsYXNzZXMgfHwgY2xhc3NlcyhlbCk7XG4gICAgZWwuX2NsYXNzZXMuYWRkKG5hbWUpO1xuICB9XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgdGhlIGdpdmVuIGNsYXNzIGBuYW1lYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xSZWdFeHB9IG5hbWVcbiAqIEByZXR1cm4ge0xpc3R9IHNlbGZcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuTGlzdC5wcm90b3R5cGUucmVtb3ZlQ2xhc3MgPSBmdW5jdGlvbihuYW1lKXtcbiAgdmFyIGVsO1xuXG4gIGlmICgncmVnZXhwJyA9PSB0eXBlKG5hbWUpKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmVscy5sZW5ndGg7ICsraSkge1xuICAgICAgZWwgPSB0aGlzLmVsc1tpXTtcbiAgICAgIGVsLl9jbGFzc2VzID0gZWwuX2NsYXNzZXMgfHwgY2xhc3NlcyhlbCk7XG4gICAgICB2YXIgYXJyID0gZWwuX2NsYXNzZXMuYXJyYXkoKTtcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgYXJyLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIGlmIChuYW1lLnRlc3QoYXJyW2pdKSkge1xuICAgICAgICAgIGVsLl9jbGFzc2VzLnJlbW92ZShhcnJbal0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmVscy5sZW5ndGg7ICsraSkge1xuICAgIGVsID0gdGhpcy5lbHNbaV07XG4gICAgZWwuX2NsYXNzZXMgPSBlbC5fY2xhc3NlcyB8fCBjbGFzc2VzKGVsKTtcbiAgICBlbC5fY2xhc3Nlcy5yZW1vdmUobmFtZSk7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogVG9nZ2xlIHRoZSBnaXZlbiBjbGFzcyBgbmFtZWAsXG4gKiBvcHRpb25hbGx5IGEgYGJvb2xgIG1heSBiZSBnaXZlblxuICogdG8gaW5kaWNhdGUgdGhhdCB0aGUgY2xhc3Mgc2hvdWxkXG4gKiBiZSBhZGRlZCB3aGVuIHRydXRoeS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICogQHBhcmFtIHtCb29sZWFufSBib29sXG4gKiBAcmV0dXJuIHtMaXN0fSBzZWxmXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkxpc3QucHJvdG90eXBlLnRvZ2dsZUNsYXNzID0gZnVuY3Rpb24obmFtZSwgYm9vbCl7XG4gIHZhciBlbDtcbiAgdmFyIGZuID0gJ3RvZ2dsZSc7XG5cbiAgLy8gdG9nZ2xlIHdpdGggYm9vbGVhblxuICBpZiAoMiA9PSBhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgZm4gPSBib29sID8gJ2FkZCcgOiAncmVtb3ZlJztcbiAgfVxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5lbHMubGVuZ3RoOyArK2kpIHtcbiAgICBlbCA9IHRoaXMuZWxzW2ldO1xuICAgIGVsLl9jbGFzc2VzID0gZWwuX2NsYXNzZXMgfHwgY2xhc3NlcyhlbCk7XG4gICAgZWwuX2NsYXNzZXNbZm5dKG5hbWUpO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIENoZWNrIGlmIHRoZSBnaXZlbiBjbGFzcyBgbmFtZWAgaXMgcHJlc2VudC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuTGlzdC5wcm90b3R5cGUuaGFzQ2xhc3MgPSBmdW5jdGlvbihuYW1lKXtcbiAgdmFyIGVsO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZWxzLmxlbmd0aDsgKytpKSB7XG4gICAgZWwgPSB0aGlzLmVsc1tpXTtcbiAgICBlbC5fY2xhc3NlcyA9IGVsLl9jbGFzc2VzIHx8IGNsYXNzZXMoZWwpO1xuICAgIGlmIChlbC5fY2xhc3Nlcy5oYXMobmFtZSkpIHJldHVybiB0cnVlO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn07XG5cbi8qKlxuICogU2V0IENTUyBgcHJvcGAgdG8gYHZhbGAgb3IgZ2V0IGBwcm9wYCB2YWx1ZS5cbiAqIEFsc28gYWNjZXB0cyBhbiBvYmplY3QgKGBwcm9wYDogYHZhbGApXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHByb3BcbiAqIEBwYXJhbSB7TWl4ZWR9IHZhbFxuICogQHJldHVybiB7TGlzdHxTdHJpbmd9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkxpc3QucHJvdG90eXBlLmNzcyA9IGZ1bmN0aW9uKHByb3AsIHZhbCl7XG4gIGlmICgyID09IGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICB2YXIgb2JqID0ge307XG4gICAgb2JqW3Byb3BdID0gdmFsO1xuICAgIHJldHVybiB0aGlzLnNldFN0eWxlKG9iaik7XG4gIH1cblxuICBpZiAoJ29iamVjdCcgPT0gdHlwZShwcm9wKSkge1xuICAgIHJldHVybiB0aGlzLnNldFN0eWxlKHByb3ApO1xuICB9XG5cbiAgcmV0dXJuIHRoaXMuZ2V0U3R5bGUocHJvcCk7XG59O1xuXG4vKipcbiAqIFNldCBDU1MgYHByb3BzYC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gcHJvcHNcbiAqIEByZXR1cm4ge0xpc3R9IHNlbGZcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbkxpc3QucHJvdG90eXBlLnNldFN0eWxlID0gZnVuY3Rpb24ocHJvcHMpe1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZWxzLmxlbmd0aDsgKytpKSB7XG4gICAgY3NzKHRoaXMuZWxzW2ldLCBwcm9wcyk7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEdldCBDU1MgYHByb3BgIHZhbHVlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBwcm9wXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5MaXN0LnByb3RvdHlwZS5nZXRTdHlsZSA9IGZ1bmN0aW9uKHByb3Ape1xuICB2YXIgZWwgPSB0aGlzLmVsc1swXTtcbiAgaWYgKGVsKSByZXR1cm4gZWwuc3R5bGVbcHJvcF07XG59O1xuXG4vKipcbiAqIEZpbmQgY2hpbGRyZW4gbWF0Y2hpbmcgdGhlIGdpdmVuIGBzZWxlY3RvcmAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHNlbGVjdG9yXG4gKiBAcmV0dXJuIHtMaXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5MaXN0LnByb3RvdHlwZS5maW5kID0gZnVuY3Rpb24oc2VsZWN0b3Ipe1xuICByZXR1cm4gZG9tKHNlbGVjdG9yLCB0aGlzKTtcbn07XG5cbi8qKlxuICogRW1wdHkgdGhlIGRvbSBsaXN0XG4gKlxuICogQHJldHVybiBzZWxmXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkxpc3QucHJvdG90eXBlLmVtcHR5ID0gZnVuY3Rpb24oKXtcbiAgdmFyIGVsZW0sIGVsO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5lbHMubGVuZ3RoOyArK2kpIHtcbiAgICBlbCA9IHRoaXMuZWxzW2ldO1xuICAgIHdoaWxlIChlbC5maXJzdENoaWxkKSB7XG4gICAgICBlbC5yZW1vdmVDaGlsZChlbC5maXJzdENoaWxkKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn1cblxuLyoqXG4gKiBDaGVjayBpZiB0aGUgZmlyc3QgZWxlbWVudCBtYXRjaGVzIGBzZWxlY3RvcmAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHNlbGVjdG9yXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5MaXN0LnByb3RvdHlwZS5pcyA9IGZ1bmN0aW9uKHNlbGVjdG9yKXtcbiAgcmV0dXJuIG1hdGNoZXModGhpcy5nZXQoMCksIHNlbGVjdG9yKTtcbn07XG5cbi8qKlxuICogR2V0IHBhcmVudChzKSB3aXRoIG9wdGlvbmFsIGBzZWxlY3RvcmAgYW5kIGBsaW1pdGBcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc2VsZWN0b3JcbiAqIEBwYXJhbSB7TnVtYmVyfSBsaW1pdFxuICogQHJldHVybiB7TGlzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuTGlzdC5wcm90b3R5cGUucGFyZW50ID0gZnVuY3Rpb24oc2VsZWN0b3IsIGxpbWl0KXtcbiAgcmV0dXJuIG5ldyBMaXN0KHRyYXZlcnNlKCdwYXJlbnROb2RlJyxcbiAgICB0aGlzLmdldCgwKSxcbiAgICBzZWxlY3RvcixcbiAgICBsaW1pdFxuICAgIHx8IDEpKTtcbn07XG5cbi8qKlxuICogR2V0IG5leHQgZWxlbWVudChzKSB3aXRoIG9wdGlvbmFsIGBzZWxlY3RvcmAgYW5kIGBsaW1pdGAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHNlbGVjdG9yXG4gKiBAcGFyYW0ge051bWJlcn0gbGltaXRcbiAqIEByZXRydW4ge0xpc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkxpc3QucHJvdG90eXBlLm5leHQgPSBmdW5jdGlvbihzZWxlY3RvciwgbGltaXQpe1xuICByZXR1cm4gbmV3IExpc3QodHJhdmVyc2UoJ25leHRTaWJsaW5nJyxcbiAgICB0aGlzLmdldCgwKSxcbiAgICBzZWxlY3RvcixcbiAgICBsaW1pdFxuICAgIHx8IDEpKTtcbn07XG5cbi8qKlxuICogR2V0IHByZXZpb3VzIGVsZW1lbnQocykgd2l0aCBvcHRpb25hbCBgc2VsZWN0b3JgIGFuZCBgbGltaXRgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzZWxlY3RvclxuICogQHBhcmFtIHtOdW1iZXJ9IGxpbWl0XG4gKiBAcmV0dXJuIHtMaXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5MaXN0LnByb3RvdHlwZS5wcmV2ID1cbkxpc3QucHJvdG90eXBlLnByZXZpb3VzID0gZnVuY3Rpb24oc2VsZWN0b3IsIGxpbWl0KXtcbiAgcmV0dXJuIG5ldyBMaXN0KHRyYXZlcnNlKCdwcmV2aW91c1NpYmxpbmcnLFxuICAgIHRoaXMuZ2V0KDApLFxuICAgIHNlbGVjdG9yLFxuICAgIGxpbWl0XG4gICAgfHwgMSkpO1xufTtcblxuLyoqXG4gKiBBdHRyaWJ1dGUgYWNjZXNzb3JzLlxuICovXG5cbmF0dHJzLmZvckVhY2goZnVuY3Rpb24obmFtZSl7XG4gIExpc3QucHJvdG90eXBlW25hbWVdID0gZnVuY3Rpb24odmFsKXtcbiAgICBpZiAoMCA9PSBhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gdGhpcy5hdHRyKG5hbWUpO1xuICAgIHJldHVybiB0aGlzLmF0dHIobmFtZSwgdmFsKTtcbiAgfTtcbn0pO1xuXG4iLCJcbi8qKlxuICogUHJvcGVydGllcyB0byBpZ25vcmUgYXBwZW5kaW5nIFwicHhcIi5cbiAqL1xuXG52YXIgaWdub3JlID0ge1xuICBjb2x1bW5Db3VudDogdHJ1ZSxcbiAgZmlsbE9wYWNpdHk6IHRydWUsXG4gIGZvbnRXZWlnaHQ6IHRydWUsXG4gIGxpbmVIZWlnaHQ6IHRydWUsXG4gIG9wYWNpdHk6IHRydWUsXG4gIG9ycGhhbnM6IHRydWUsXG4gIHdpZG93czogdHJ1ZSxcbiAgekluZGV4OiB0cnVlLFxuICB6b29tOiB0cnVlXG59O1xuXG4vKipcbiAqIFNldCBgZWxgIGNzcyB2YWx1ZXMuXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbFxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHJldHVybiB7RWxlbWVudH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihlbCwgb2JqKXtcbiAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgIHZhciB2YWwgPSBvYmpba2V5XTtcbiAgICBpZiAoJ251bWJlcicgPT0gdHlwZW9mIHZhbCAmJiAhaWdub3JlW2tleV0pIHZhbCArPSAncHgnO1xuICAgIGVsLnN0eWxlW2tleV0gPSB2YWw7XG4gIH1cbiAgcmV0dXJuIGVsO1xufTtcbiIsIlxuLyoqXG4gKiBBIGhpZ2hseSBvcHRpbWlzZWQgZW1pdHRlciBpbXBsZW1lbnRhdGlvbi4gT3B0aW1pc2VkIHRvIFxuICogbWluaW1pemUgYm90aCBtZW1vcnkgYW5kIENQVSBjb25zdW1wdGlvbi4gSXRzIGdvb2QgZm9yIFxuICogaW1wbGVtZW50aW5nIHNpbXBsZSBidXQgaG90IHRoaW5ncyBsaWtlIHN0cmVhbXMuIFxuICovXG5cbnZhciBtaXhpbiA9IHJlcXVpcmUoJ21lcmdlJylcbnZhciBvd24gPSB7fS5oYXNPd25Qcm9wZXJ0eVxudmFyIGNhbGwgPSBGdW5jdGlvbi5jYWxsXG5cbm1vZHVsZS5leHBvcnRzID0gRW1pdHRlclxuXG5mdW5jdGlvbiBFbWl0dGVyKG9iail7XG5cdGlmIChvYmopIHJldHVybiBtaXhpbihvYmosIEVtaXR0ZXIucHJvdG90eXBlKVxufVxuXG5FbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24odG9waWMpe1xuXHR2YXIgc3ViID0gdGhpcy5fZXZlbnRzXG5cdGlmICghKHN1YiAmJiAoc3ViID0gc3ViW3RvcGljXSkpKSByZXR1cm4gdGhpc1xuXHQvLyBzaW5nbGUgc3Vic3JpcHRpb24gY2FzZVxuXHRpZiAodHlwZW9mIHN1YiA9PSAnZnVuY3Rpb24nKSB7XG5cdFx0Ly8gYXZvaWQgdXNpbmcgLmFwcGx5KCkgZm9yIHNwZWVkXG5cdFx0c3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG5cdFx0XHRjYXNlIDE6IHN1Yi5jYWxsKHRoaXMpO2JyZWFrXG5cdFx0XHRjYXNlIDI6IHN1Yi5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSk7YnJlYWtcblx0XHRcdGNhc2UgMzogc3ViLmNhbGwodGhpcywgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0pO2JyZWFrXG5cdFx0XHRjYXNlIDQ6IHN1Yi5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdLCBhcmd1bWVudHNbM10pO2JyZWFrXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHQvLyBgYXJndW1lbnRzYCBpcyBtYWdpYyA6KVxuXHRcdFx0XHR0b3BpYyA9IHRoaXNcblx0XHRcdFx0Y2FsbC5hcHBseShzdWIsIGFyZ3VtZW50cylcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0dmFyIMaSXG5cdFx0dmFyIGkgPSAwXG5cdFx0dmFyIGwgPSBzdWIubGVuZ3RoXG5cdFx0c3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG5cdFx0XHRjYXNlIDE6IHdoaWxlIChpIDwgbCkgc3ViW2krK10uY2FsbCh0aGlzKTticmVha1xuXHRcdFx0Y2FzZSAyOiB3aGlsZSAoaSA8IGwpIHN1YltpKytdLmNhbGwodGhpcywgYXJndW1lbnRzWzFdKTticmVha1xuXHRcdFx0Y2FzZSAzOiB3aGlsZSAoaSA8IGwpIHN1YltpKytdLmNhbGwodGhpcywgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0pO2JyZWFrXG5cdFx0XHRjYXNlIDQ6IHdoaWxlIChpIDwgbCkgc3ViW2krK10uY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSwgYXJndW1lbnRzWzNdKTticmVha1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0dG9waWMgPSB0aGlzXG5cdFx0XHRcdHdoaWxlIChpIDwgbCkgY2FsbC5hcHBseShzdWJbaSsrXSwgYXJndW1lbnRzKVxuXHRcdH1cblx0fVxuXHRyZXR1cm4gdGhpc1xufVxuXG5FbWl0dGVyLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uKHRvcGljLCBmbil7XG5cdGlmICghb3duLmNhbGwodGhpcywgJ19ldmVudHMnKSkge1xuXHRcdHRoaXMuX2V2ZW50cyA9IGNsb25lKHRoaXMuX2V2ZW50cylcblx0fVxuXHR2YXIgZXZlbnRzID0gdGhpcy5fZXZlbnRzXG5cdGlmICh0eXBlb2YgZXZlbnRzW3RvcGljXSA9PSAnZnVuY3Rpb24nKSB7XG5cdFx0ZXZlbnRzW3RvcGljXSA9IFtldmVudHNbdG9waWNdLCBmbl1cblx0fSBlbHNlIGlmIChldmVudHNbdG9waWNdKSB7XG5cdFx0ZXZlbnRzW3RvcGljXS5wdXNoKGZuKVxuXHR9IGVsc2Uge1xuXHRcdGV2ZW50c1t0b3BpY10gPSBmblxuXHR9XG5cdHJldHVybiB0aGlzXG59XG5cbmZ1bmN0aW9uIGNsb25lKG8pe1xuXHR2YXIgYyA9IHt9XG5cdGZvciAodmFyIGsgaW4gbykge1xuXHRcdGNba10gPSB0eXBlb2Ygb1trXSA9PSAnb2JqZWN0J1xuXHRcdFx0PyBvW2tdLnNsaWNlKClcblx0XHRcdDogb1trXVxuXHR9XG5cdHJldHVybiBjXG59XG5cbkVtaXR0ZXIucHJvdG90eXBlLm9mZiA9IGZ1bmN0aW9uKHRvcGljLCBmbil7XG5cdGlmICghdGhpcy5fZXZlbnRzKSByZXR1cm4gdGhpc1xuXHRpZiAoIW93bi5jYWxsKHRoaXMsICdfZXZlbnRzJykpIHtcblx0XHR0aGlzLl9ldmVudHMgPSBjbG9uZSh0aGlzLl9ldmVudHMpXG5cdH1cblx0dmFyIGV2ZW50cyA9IHRoaXMuX2V2ZW50c1xuXG5cdGlmICh0b3BpYyA9PSBudWxsKSB7XG5cdFx0Zm9yICh2YXIgaSBpbiBldmVudHMpIGRlbGV0ZSBldmVudHNbaV1cblx0fSBlbHNlIGlmIChmbiA9PSBudWxsKSB7XG5cdFx0ZGVsZXRlIGV2ZW50c1t0b3BpY11cblx0fSBlbHNlIHtcblx0XHR2YXIgc3VicyA9IGV2ZW50c1t0b3BpY11cblx0XHRpZiAoIXN1YnMpIHJldHVybiB0aGlzXG5cdFx0aWYgKHR5cGVvZiBzdWJzID09ICdmdW5jdGlvbicpIHtcblx0XHRcdGlmIChzdWJzID09PSBmbikgZGVsZXRlIGV2ZW50c1t0b3BpY11cblx0XHR9IGVsc2Uge1xuXHRcdFx0c3VicyA9IGV2ZW50c1t0b3BpY10gPSBzdWJzLmZpbHRlcihmdW5jdGlvbijGkil7XG5cdFx0XHRcdHJldHVybiDGkiAhPT0gZm5cblx0XHRcdH0pXG5cdFx0XHQvLyB0aWR5XG5cdFx0XHRpZiAoc3Vicy5sZW5ndGggPT0gMSkgZXZlbnRzW3RvcGljXSA9IHN1YnNbMF1cblx0XHRcdGVsc2UgaWYgKCFzdWJzLmxlbmd0aCkgZGVsZXRlIGV2ZW50c1t0b3BpY11cblx0XHR9XG5cdH1cblx0cmV0dXJuIHRoaXNcbn1cblxuRW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uKHRvcGljLCBmbil7XG5cdHZhciBzZWxmID0gdGhpc1xuXHRyZXR1cm4gdGhpcy5vbih0b3BpYywgZnVuY3Rpb24gb25jZSgpIHtcblx0XHRzZWxmLm9mZih0b3BpYywgb25jZSlcblx0XHRmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG5cdH0pXG59XG5cbkVtaXR0ZXIuaGFzU3Vic2NyaXB0aW9uID0gZnVuY3Rpb24oZW1pdHRlciwgdG9waWMsIGZuKXtcblx0dmFyIGZucyA9IEVtaXR0ZXIuc3Vic2NyaXB0aW9ucyhlbWl0dGVyLCB0b3BpYylcblx0aWYgKGZuID09IG51bGwpIHJldHVybiBCb29sZWFuKGZucy5sZW5ndGgpXG5cdHJldHVybiBmbnMuaW5kZXhPZihmbikgPj0gMFxufVxuXG5FbWl0dGVyLnN1YnNjcmlwdGlvbnMgPSBmdW5jdGlvbihlbWl0dGVyLCB0b3BpYyl7XG5cdHZhciBmbnMgPSBlbWl0dGVyLl9ldmVudHNcblx0aWYgKCFmbnMgfHwgIShmbnMgPSBmbnNbdG9waWNdKSkgcmV0dXJuIFtdXG5cdGlmICh0eXBlb2YgZm5zID09ICdmdW5jdGlvbicpIHJldHVybiBbZm5zXVxuXHRyZXR1cm4gZm5zLnNsaWNlKClcbn0iLCJcbnZhciBleHRlbnNpYmxlID0gcmVxdWlyZSgnZXh0ZW5zaWJsZScpXG52YXIgZWFzZSA9IHJlcXVpcmUoJ2Vhc2UnKVxudmFyIG5vdyA9IHJlcXVpcmUoJ25vdycpXG5cbm1vZHVsZS5leHBvcnRzID0gVHdlZW5cblxuLyoqXG4gKiBUd2VlbmluZyBiYXNlIGNsYXNzXG4gKlxuICogQHBhcmFtIHtBbnl9IGZyb21cbiAqIEBwYXJhbSB7QW55fSB0b1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBUd2Vlbihmcm9tLCB0byl7XG5cdHRoaXMuX2Zyb20gPSBmcm9tXG5cdHRoaXMuX3RvID0gdG9cbn1cblxuLyoqXG4gKiBhZGQgZXh0ZW5kIG1ldGhvZFxuICovXG5cbmV4dGVuc2libGUoVHdlZW4pXG5cbi8qKlxuICogZGVmYXVsdCBzZXR0aW5nc1xuICovXG5cblR3ZWVuLnByb3RvdHlwZS5fZWFzZSA9IGVhc2UubGluZWFyXG5Ud2Vlbi5wcm90b3R5cGUuX2R1cmF0aW9uID0gNTAwXG5Ud2Vlbi5wcm90b3R5cGUuZG9uZSA9IGZhbHNlXG5cbi8qKlxuICogUmVzZXQgdGhlIHR3ZWVucyB0aW1lciBhbmQgc3RhdGUuIENhbGwgdGhpcyBiZWZvcmVcbiAqIGNhbGxpbmcgYC5uZXh0KClgIGZvciB0aGUgZmlyc3QgdGltZVxuICpcbiAqICAgdGhpcy5yZXNldCgpXG4gKiAgIHdoaWxlICghdGhpcy5kb25lKSB0aGlzLm5leHQoKVxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuVHdlZW4ucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24oKXtcblx0dGhpcy5fc3RhcnQgPSBub3coKVxuXHR0aGlzLmRvbmUgPSBmYWxzZVxuXHRyZXR1cm4gdGhpc1xufVxuXG4vKipcbiAqIHJldGFyZ2V0IHRoZSB0d2VlbiB0b3dhcmRzIGB2YWxgLiBgdGhpcy5mcm9tYFxuICogd2lsbCBiZSBzZXQgdG8gdGhlIHR3ZWVucyBjdXJyZW50IHZhbHVlIHVubGVzc1xuICogYHRoaXMuX3RvYCBpcyBjdXJyZW50bHkgYG51bGxgLiBDYWxscyBgcmVzZXQoKWBcbiAqIGludGVybmFsbHlcbiAqXG4gKiAgIHR3ZWVuLnRvKHsgeDogNTAsIHk6IDEwMCB9KVxuICpcbiAqIEBwYXJhbSB7QW55fSB2YWxcbiAqIEByZXR1cm4ge3RoaXN9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblR3ZWVuLnByb3RvdHlwZS50byA9IGZ1bmN0aW9uKHZhbCl7XG5cdGlmICh0aGlzLl90byAhPSBudWxsKSB7XG5cdFx0dGhpcy5fZnJvbSA9IHRoaXMuZG9uZSA9PT0gZmFsc2Vcblx0XHRcdD8gdGhpcy5uZXh0KClcblx0XHRcdDogdGhpcy5fdG9cblx0fVxuXHR0aGlzLl90byA9IHZhbFxuXHR0aGlzLnJlc2V0KClcblx0cmV0dXJuIHRoaXNcbn1cblxuLyoqXG4gKiBzZXQgdGhlIGJhc2UgdmFsdWUgdG8gYHZhbGBcbiAqXG4gKiBAcGFyYW0ge0FueX0gdmFsXG4gKiBAcmV0dXJuIHt0aGlzfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5Ud2Vlbi5wcm90b3R5cGUuZnJvbSA9IGZ1bmN0aW9uKHZhbCl7XG5cdHRoaXMuX2Zyb20gPSB2YWxcblx0cmV0dXJuIHRoaXNcbn1cblxuLyoqXG4gKiBTZXQgZHVyYXRpb24gdG8gYG1zYCBbNTAwXS5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gbXNcbiAqIEByZXR1cm4ge3RoaXN9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblR3ZWVuLnByb3RvdHlwZS5kdXJhdGlvbiA9IGZ1bmN0aW9uKG1zKXtcblx0dGhpcy5fZHVyYXRpb24gPSBtc1xuXHRyZXR1cm4gdGhpc1xufVxuXG4vKipcbiAqIFNldCBlYXNpbmcgZnVuY3Rpb24gdG8gYGZuYC5cbiAqXG4gKiAgIHR3ZWVuLmVhc2UoJ2luLW91dC1zaW5lJylcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge3RoaXN9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblR3ZWVuLnByb3RvdHlwZS5lYXNlID0gZnVuY3Rpb24oZm4pe1xuXHRpZiAodHlwZW9mIGZuID09ICdzdHJpbmcnKSBmbiA9IGVhc2VbZm5dXG5cdGlmICghZm4pIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBlYXNpbmcgZnVuY3Rpb24nKVxuXHR0aGlzLl9lYXNlID0gZm5cblx0cmV0dXJuIHRoaXNcbn1cblxuLyoqXG4gKiBnZW5lcmF0ZSB0aGUgbmV4dCBmcmFtZVxuICpcbiAqIEByZXR1cm4ge0FueX1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuVHdlZW4ucHJvdG90eXBlLm5leHQgPSBmdW5jdGlvbigpe1xuXHR2YXIgcHJvZ3Jlc3MgPSAobm93KCkgLSB0aGlzLl9zdGFydCkgLyB0aGlzLl9kdXJhdGlvblxuXG5cdGlmIChwcm9ncmVzcyA+PSAxKSB7XG5cdFx0dGhpcy5kb25lID0gdHJ1ZVxuXHRcdHJldHVybiB0aGlzLl90b1xuXHR9XG5cblx0cmV0dXJuIHRoaXMuZnJhbWUodGhpcy5fZWFzZShwcm9ncmVzcykpXG59XG5cbi8qKlxuICogZ2VuZXJhdGUgYSB0d2VlbiBmcmFtZSBhdCBwb2ludCBgcGAgYmV0d2VlblxuICogYHRoaXMuX2Zyb21gIGFuZCBgdGhpcy5fdG9gLiBUbyBiZSBkZWZpbmVkIGluXG4gKiBzdWItY2xhc3Nlc1xuICpcbiAqICAgdHdlZW4oMSwgMykuZnJhbWUoLjUpIC8vID0+IDJcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gcGVyY2VudFxuICogQHJldHVybiB7QW55fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5Ud2Vlbi5wcm90b3R5cGUuZnJhbWUiLCJcbnZhciBzdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKS5zdHlsZVxudmFyIHByZWZpeGVzID0gJ08gbXMgTW96IHdlYmtpdCcuc3BsaXQoJyAnKVxuXG52YXIgbWVtbyA9IHt9XG5cbi8qKlxuICogbWVtb2l6ZWQgYHByZWZpeGBcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IGZ1bmN0aW9uKGtleSl7XG5cdHJldHVybiBrZXkgaW4gbWVtb1xuXHRcdD8gbWVtb1trZXldXG5cdFx0OiBtZW1vW2tleV0gPSBwcmVmaXgoa2V5KVxufVxuXG5leHBvcnRzLnByZWZpeCA9IHByZWZpeFxuXG4vKipcbiAqIHByZWZpeCBga2V5YFxuICpcbiAqICAgcHJlZml4KCd0cmFuc2Zvcm0nKSAvLyA9PiB3ZWJraXRUcmFuc2Zvcm1cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIHByZWZpeChrZXkpe1xuXHQvLyB3aXRob3V0IHByZWZpeFxuXHRpZiAoc3R5bGVba2V5XSAhPT0gdW5kZWZpbmVkKSByZXR1cm4ga2V5XG5cblx0Ly8gd2l0aCBwcmVmaXhcblx0dmFyIEtleSA9IGNhcGl0YWxpemUoa2V5KVxuXHR2YXIgaSA9IHByZWZpeGVzLmxlbmd0aFxuXHR3aGlsZSAoaS0tKSB7XG5cdFx0dmFyIG5hbWUgPSBwcmVmaXhlc1tpXSArIEtleVxuXHRcdGlmIChzdHlsZVtuYW1lXSAhPT0gdW5kZWZpbmVkKSByZXR1cm4gbmFtZVxuXHR9XG5cblx0dGhyb3cgbmV3IEVycm9yKCd1bmFibGUgdG8gcHJlZml4ICcgKyBrZXkpXG59XG5cbmZ1bmN0aW9uIGNhcGl0YWxpemUoc3RyKXtcblx0cmV0dXJuIHN0ci5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHN0ci5zbGljZSgxKVxufSIsIi8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL1xuXG52YXIgcXVlcnkgPSByZXF1aXJlKCdxdWVyeScpO1xuXG4vKipcbiAqIEVsZW1lbnQgcHJvdG90eXBlLlxuICovXG5cbnZhciBwcm90byA9IEVsZW1lbnQucHJvdG90eXBlO1xuXG4vKipcbiAqIFZlbmRvciBmdW5jdGlvbi5cbiAqL1xuXG52YXIgdmVuZG9yID0gcHJvdG8ubWF0Y2hlc1NlbGVjdG9yXG4gIHx8IHByb3RvLndlYmtpdE1hdGNoZXNTZWxlY3RvclxuICB8fCBwcm90by5tb3pNYXRjaGVzU2VsZWN0b3JcbiAgfHwgcHJvdG8ubXNNYXRjaGVzU2VsZWN0b3JcbiAgfHwgcHJvdG8ub01hdGNoZXNTZWxlY3RvcjtcblxuLyoqXG4gKiBFeHBvc2UgYG1hdGNoKClgLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gbWF0Y2g7XG5cbi8qKlxuICogTWF0Y2ggYGVsYCB0byBgc2VsZWN0b3JgLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7U3RyaW5nfSBzZWxlY3RvclxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gbWF0Y2goZWwsIHNlbGVjdG9yKSB7XG4gIGlmICh2ZW5kb3IpIHJldHVybiB2ZW5kb3IuY2FsbChlbCwgc2VsZWN0b3IpO1xuICB2YXIgbm9kZXMgPSBxdWVyeS5hbGwoc2VsZWN0b3IsIGVsLnBhcmVudE5vZGUpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgKytpKSB7XG4gICAgaWYgKG5vZGVzW2ldID09IGVsKSByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG4iLCJcbi8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL1xuXG52YXIgbWF0Y2hlcyA9IHJlcXVpcmUoJ21hdGNoZXMtc2VsZWN0b3InKVxuICAsIGV2ZW50ID0gcmVxdWlyZSgnZXZlbnQnKTtcblxuLyoqXG4gKiBEZWxlZ2F0ZSBldmVudCBgdHlwZWAgdG8gYHNlbGVjdG9yYFxuICogYW5kIGludm9rZSBgZm4oZSlgLiBBIGNhbGxiYWNrIGZ1bmN0aW9uXG4gKiBpcyByZXR1cm5lZCB3aGljaCBtYXkgYmUgcGFzc2VkIHRvIGAudW5iaW5kKClgLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7U3RyaW5nfSBzZWxlY3RvclxuICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGNhcHR1cmVcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5leHBvcnRzLmJpbmQgPSBmdW5jdGlvbihlbCwgc2VsZWN0b3IsIHR5cGUsIGZuLCBjYXB0dXJlKXtcbiAgcmV0dXJuIGV2ZW50LmJpbmQoZWwsIHR5cGUsIGZ1bmN0aW9uKGUpe1xuICAgIGlmIChtYXRjaGVzKGUudGFyZ2V0LCBzZWxlY3RvcikpIGZuKGUpO1xuICB9LCBjYXB0dXJlKTtcbiAgcmV0dXJuIGNhbGxiYWNrO1xufTtcblxuLyoqXG4gKiBVbmJpbmQgZXZlbnQgYHR5cGVgJ3MgY2FsbGJhY2sgYGZuYC5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gY2FwdHVyZVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5leHBvcnRzLnVuYmluZCA9IGZ1bmN0aW9uKGVsLCB0eXBlLCBmbiwgY2FwdHVyZSl7XG4gIGV2ZW50LnVuYmluZChlbCwgdHlwZSwgZm4sIGNhcHR1cmUpO1xufTtcbiIsIlxuLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICovXG5cbnZhciBpbmRleCA9IHJlcXVpcmUoJ2luZGV4b2YnKTtcblxuLyoqXG4gKiBXaGl0ZXNwYWNlIHJlZ2V4cC5cbiAqL1xuXG52YXIgcmUgPSAvXFxzKy87XG5cbi8qKlxuICogdG9TdHJpbmcgcmVmZXJlbmNlLlxuICovXG5cbnZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbi8qKlxuICogV3JhcCBgZWxgIGluIGEgYENsYXNzTGlzdGAuXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbFxuICogQHJldHVybiB7Q2xhc3NMaXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGVsKXtcbiAgcmV0dXJuIG5ldyBDbGFzc0xpc3QoZWwpO1xufTtcblxuLyoqXG4gKiBJbml0aWFsaXplIGEgbmV3IENsYXNzTGlzdCBmb3IgYGVsYC5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBDbGFzc0xpc3QoZWwpIHtcbiAgdGhpcy5lbCA9IGVsO1xuICB0aGlzLmxpc3QgPSBlbC5jbGFzc0xpc3Q7XG59XG5cbi8qKlxuICogQWRkIGNsYXNzIGBuYW1lYCBpZiBub3QgYWxyZWFkeSBwcmVzZW50LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gKiBAcmV0dXJuIHtDbGFzc0xpc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkNsYXNzTGlzdC5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24obmFtZSl7XG4gIC8vIGNsYXNzTGlzdFxuICBpZiAodGhpcy5saXN0KSB7XG4gICAgdGhpcy5saXN0LmFkZChuYW1lKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIGZhbGxiYWNrXG4gIHZhciBhcnIgPSB0aGlzLmFycmF5KCk7XG4gIHZhciBpID0gaW5kZXgoYXJyLCBuYW1lKTtcbiAgaWYgKCF+aSkgYXJyLnB1c2gobmFtZSk7XG4gIHRoaXMuZWwuY2xhc3NOYW1lID0gYXJyLmpvaW4oJyAnKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBjbGFzcyBgbmFtZWAgd2hlbiBwcmVzZW50LCBvclxuICogcGFzcyBhIHJlZ3VsYXIgZXhwcmVzc2lvbiB0byByZW1vdmVcbiAqIGFueSB3aGljaCBtYXRjaC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xSZWdFeHB9IG5hbWVcbiAqIEByZXR1cm4ge0NsYXNzTGlzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuQ2xhc3NMaXN0LnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbihuYW1lKXtcbiAgaWYgKCdbb2JqZWN0IFJlZ0V4cF0nID09IHRvU3RyaW5nLmNhbGwobmFtZSkpIHtcbiAgICByZXR1cm4gdGhpcy5yZW1vdmVNYXRjaGluZyhuYW1lKTtcbiAgfVxuXG4gIC8vIGNsYXNzTGlzdFxuICBpZiAodGhpcy5saXN0KSB7XG4gICAgdGhpcy5saXN0LnJlbW92ZShuYW1lKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIGZhbGxiYWNrXG4gIHZhciBhcnIgPSB0aGlzLmFycmF5KCk7XG4gIHZhciBpID0gaW5kZXgoYXJyLCBuYW1lKTtcbiAgaWYgKH5pKSBhcnIuc3BsaWNlKGksIDEpO1xuICB0aGlzLmVsLmNsYXNzTmFtZSA9IGFyci5qb2luKCcgJyk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgYWxsIGNsYXNzZXMgbWF0Y2hpbmcgYHJlYC5cbiAqXG4gKiBAcGFyYW0ge1JlZ0V4cH0gcmVcbiAqIEByZXR1cm4ge0NsYXNzTGlzdH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbkNsYXNzTGlzdC5wcm90b3R5cGUucmVtb3ZlTWF0Y2hpbmcgPSBmdW5jdGlvbihyZSl7XG4gIHZhciBhcnIgPSB0aGlzLmFycmF5KCk7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKHJlLnRlc3QoYXJyW2ldKSkge1xuICAgICAgdGhpcy5yZW1vdmUoYXJyW2ldKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFRvZ2dsZSBjbGFzcyBgbmFtZWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAqIEByZXR1cm4ge0NsYXNzTGlzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuQ2xhc3NMaXN0LnByb3RvdHlwZS50b2dnbGUgPSBmdW5jdGlvbihuYW1lKXtcbiAgLy8gY2xhc3NMaXN0XG4gIGlmICh0aGlzLmxpc3QpIHtcbiAgICB0aGlzLmxpc3QudG9nZ2xlKG5hbWUpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gZmFsbGJhY2tcbiAgaWYgKHRoaXMuaGFzKG5hbWUpKSB7XG4gICAgdGhpcy5yZW1vdmUobmFtZSk7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5hZGQobmFtZSk7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJldHVybiBhbiBhcnJheSBvZiBjbGFzc2VzLlxuICpcbiAqIEByZXR1cm4ge0FycmF5fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5DbGFzc0xpc3QucHJvdG90eXBlLmFycmF5ID0gZnVuY3Rpb24oKXtcbiAgdmFyIHN0ciA9IHRoaXMuZWwuY2xhc3NOYW1lLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKTtcbiAgdmFyIGFyciA9IHN0ci5zcGxpdChyZSk7XG4gIGlmICgnJyA9PT0gYXJyWzBdKSBhcnIuc2hpZnQoKTtcbiAgcmV0dXJuIGFycjtcbn07XG5cbi8qKlxuICogQ2hlY2sgaWYgY2xhc3MgYG5hbWVgIGlzIHByZXNlbnQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAqIEByZXR1cm4ge0NsYXNzTGlzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuQ2xhc3NMaXN0LnByb3RvdHlwZS5oYXMgPVxuQ2xhc3NMaXN0LnByb3RvdHlwZS5jb250YWlucyA9IGZ1bmN0aW9uKG5hbWUpe1xuICByZXR1cm4gdGhpcy5saXN0XG4gICAgPyB0aGlzLmxpc3QuY29udGFpbnMobmFtZSlcbiAgICA6ICEhIH5pbmRleCh0aGlzLmFycmF5KCksIG5hbWUpO1xufTtcbiIsIlxudmFyIGluZGV4T2YgPSBbXS5pbmRleE9mO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGFyciwgb2JqKXtcbiAgaWYgKGluZGV4T2YpIHJldHVybiBhcnIuaW5kZXhPZihvYmopO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7ICsraSkge1xuICAgIGlmIChhcnJbaV0gPT09IG9iaikgcmV0dXJuIGk7XG4gIH1cbiAgcmV0dXJuIC0xO1xufTsiLCJcbi8qKlxuICogRXhwb3NlIGBwYXJzZWAuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBwYXJzZTtcblxuLyoqXG4gKiBXcmFwIG1hcCBmcm9tIGpxdWVyeS5cbiAqL1xuXG52YXIgbWFwID0ge1xuICBvcHRpb246IFsxLCAnPHNlbGVjdCBtdWx0aXBsZT1cIm11bHRpcGxlXCI+JywgJzwvc2VsZWN0PiddLFxuICBvcHRncm91cDogWzEsICc8c2VsZWN0IG11bHRpcGxlPVwibXVsdGlwbGVcIj4nLCAnPC9zZWxlY3Q+J10sXG4gIGxlZ2VuZDogWzEsICc8ZmllbGRzZXQ+JywgJzwvZmllbGRzZXQ+J10sXG4gIHRoZWFkOiBbMSwgJzx0YWJsZT4nLCAnPC90YWJsZT4nXSxcbiAgdGJvZHk6IFsxLCAnPHRhYmxlPicsICc8L3RhYmxlPiddLFxuICB0Zm9vdDogWzEsICc8dGFibGU+JywgJzwvdGFibGU+J10sXG4gIGNvbGdyb3VwOiBbMSwgJzx0YWJsZT4nLCAnPC90YWJsZT4nXSxcbiAgY2FwdGlvbjogWzEsICc8dGFibGU+JywgJzwvdGFibGU+J10sXG4gIHRyOiBbMiwgJzx0YWJsZT48dGJvZHk+JywgJzwvdGJvZHk+PC90YWJsZT4nXSxcbiAgdGQ6IFszLCAnPHRhYmxlPjx0Ym9keT48dHI+JywgJzwvdHI+PC90Ym9keT48L3RhYmxlPiddLFxuICB0aDogWzMsICc8dGFibGU+PHRib2R5Pjx0cj4nLCAnPC90cj48L3Rib2R5PjwvdGFibGU+J10sXG4gIGNvbDogWzIsICc8dGFibGU+PHRib2R5PjwvdGJvZHk+PGNvbGdyb3VwPicsICc8L2NvbGdyb3VwPjwvdGFibGU+J10sXG4gIF9kZWZhdWx0OiBbMCwgJycsICcnXVxufTtcblxuLyoqXG4gKiBQYXJzZSBgaHRtbGAgYW5kIHJldHVybiB0aGUgY2hpbGRyZW4uXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGh0bWxcbiAqIEByZXR1cm4ge0FycmF5fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gcGFyc2UoaHRtbCkge1xuICBpZiAoJ3N0cmluZycgIT0gdHlwZW9mIGh0bWwpIHRocm93IG5ldyBUeXBlRXJyb3IoJ1N0cmluZyBleHBlY3RlZCcpO1xuXG4gIC8vIHRhZyBuYW1lXG4gIHZhciBtID0gLzwoW1xcdzpdKykvLmV4ZWMoaHRtbCk7XG4gIGlmICghbSkgdGhyb3cgbmV3IEVycm9yKCdObyBlbGVtZW50cyB3ZXJlIGdlbmVyYXRlZC4nKTtcbiAgdmFyIHRhZyA9IG1bMV07XG5cbiAgLy8gYm9keSBzdXBwb3J0XG4gIGlmICh0YWcgPT0gJ2JvZHknKSB7XG4gICAgdmFyIGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaHRtbCcpO1xuICAgIGVsLmlubmVySFRNTCA9IGh0bWw7XG4gICAgcmV0dXJuIGVsLnJlbW92ZUNoaWxkKGVsLmxhc3RDaGlsZCk7XG4gIH1cblxuICAvLyB3cmFwIG1hcFxuICB2YXIgd3JhcCA9IG1hcFt0YWddIHx8IG1hcC5fZGVmYXVsdDtcbiAgdmFyIGRlcHRoID0gd3JhcFswXTtcbiAgdmFyIHByZWZpeCA9IHdyYXBbMV07XG4gIHZhciBzdWZmaXggPSB3cmFwWzJdO1xuICB2YXIgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgZWwuaW5uZXJIVE1MID0gcHJlZml4ICsgaHRtbCArIHN1ZmZpeDtcbiAgd2hpbGUgKGRlcHRoLS0pIGVsID0gZWwubGFzdENoaWxkO1xuXG4gIHZhciBlbHMgPSBlbC5jaGlsZHJlbjtcbiAgaWYgKDEgPT0gZWxzLmxlbmd0aCkge1xuICAgIHJldHVybiBlbC5yZW1vdmVDaGlsZChlbHNbMF0pO1xuICB9XG5cbiAgdmFyIGZyYWdtZW50ID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuICB3aGlsZSAoZWxzLmxlbmd0aCkge1xuICAgIGZyYWdtZW50LmFwcGVuZENoaWxkKGVsLnJlbW92ZUNoaWxkKGVsc1swXSkpO1xuICB9XG5cbiAgcmV0dXJuIGZyYWdtZW50O1xufVxuIiwiXG4vKipcbiAqIEJpbmQgYGVsYCBldmVudCBgdHlwZWAgdG8gYGZuYC5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gY2FwdHVyZVxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMuYmluZCA9IGZ1bmN0aW9uKGVsLCB0eXBlLCBmbiwgY2FwdHVyZSl7XG4gIGlmIChlbC5hZGRFdmVudExpc3RlbmVyKSB7XG4gICAgZWwuYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBmbiwgY2FwdHVyZSk7XG4gIH0gZWxzZSB7XG4gICAgZWwuYXR0YWNoRXZlbnQoJ29uJyArIHR5cGUsIGZuKTtcbiAgfVxuICByZXR1cm4gZm47XG59O1xuXG4vKipcbiAqIFVuYmluZCBgZWxgIGV2ZW50IGB0eXBlYCdzIGNhbGxiYWNrIGBmbmAuXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbFxuICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGNhcHR1cmVcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5leHBvcnRzLnVuYmluZCA9IGZ1bmN0aW9uKGVsLCB0eXBlLCBmbiwgY2FwdHVyZSl7XG4gIGlmIChlbC5yZW1vdmVFdmVudExpc3RlbmVyKSB7XG4gICAgZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBmbiwgY2FwdHVyZSk7XG4gIH0gZWxzZSB7XG4gICAgZWwuZGV0YWNoRXZlbnQoJ29uJyArIHR5cGUsIGZuKTtcbiAgfVxuICByZXR1cm4gZm47XG59O1xuIiwiXG4vKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxudmFyIHR5cGVPZiA9IHJlcXVpcmUoJ3R5cGUnKTtcblxuLyoqXG4gKiBTZXQgb3IgZ2V0IGBlbGAncycgdmFsdWUuXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbFxuICogQHBhcmFtIHtNaXhlZH0gdmFsXG4gKiBAcmV0dXJuIHtNaXhlZH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihlbCwgdmFsKXtcbiAgaWYgKDIgPT0gYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHNldChlbCwgdmFsKTtcbiAgcmV0dXJuIGdldChlbCk7XG59O1xuXG4vKipcbiAqIEdldCBgZWxgJ3MgdmFsdWUuXG4gKi9cblxuZnVuY3Rpb24gZ2V0KGVsKSB7XG4gIHN3aXRjaCAodHlwZShlbCkpIHtcbiAgICBjYXNlICdjaGVja2JveCc6XG4gICAgY2FzZSAncmFkaW8nOlxuICAgICAgaWYgKGVsLmNoZWNrZWQpIHtcbiAgICAgICAgdmFyIGF0dHIgPSBlbC5nZXRBdHRyaWJ1dGUoJ3ZhbHVlJyk7XG4gICAgICAgIHJldHVybiBudWxsID09IGF0dHIgPyB0cnVlIDogYXR0cjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICBjYXNlICdyYWRpb2dyb3VwJzpcbiAgICAgIGZvciAodmFyIGkgPSAwLCByYWRpbzsgcmFkaW8gPSBlbFtpXTsgaSsrKSB7XG4gICAgICAgIGlmIChyYWRpby5jaGVja2VkKSByZXR1cm4gcmFkaW8udmFsdWU7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdzZWxlY3QnOlxuICAgICAgZm9yICh2YXIgaSA9IDAsIG9wdGlvbjsgb3B0aW9uID0gZWwub3B0aW9uc1tpXTsgaSsrKSB7XG4gICAgICAgIGlmIChvcHRpb24uc2VsZWN0ZWQpIHJldHVybiBvcHRpb24udmFsdWU7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGVsLnZhbHVlO1xuICB9XG59XG5cbi8qKlxuICogU2V0IGBlbGAncyB2YWx1ZS5cbiAqL1xuXG5mdW5jdGlvbiBzZXQoZWwsIHZhbCkge1xuICBzd2l0Y2ggKHR5cGUoZWwpKSB7XG4gICAgY2FzZSAnY2hlY2tib3gnOlxuICAgIGNhc2UgJ3JhZGlvJzpcbiAgICAgIGlmICh2YWwpIHtcbiAgICAgICAgZWwuY2hlY2tlZCA9IHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlbC5jaGVja2VkID0gZmFsc2U7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdyYWRpb2dyb3VwJzpcbiAgICAgIGZvciAodmFyIGkgPSAwLCByYWRpbzsgcmFkaW8gPSBlbFtpXTsgaSsrKSB7XG4gICAgICAgIHJhZGlvLmNoZWNrZWQgPSByYWRpby52YWx1ZSA9PT0gdmFsO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnc2VsZWN0JzpcbiAgICAgIGZvciAodmFyIGkgPSAwLCBvcHRpb247IG9wdGlvbiA9IGVsLm9wdGlvbnNbaV07IGkrKykge1xuICAgICAgICBvcHRpb24uc2VsZWN0ZWQgPSBvcHRpb24udmFsdWUgPT09IHZhbDtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICBlbC52YWx1ZSA9IHZhbDtcbiAgfVxufVxuXG4vKipcbiAqIEVsZW1lbnQgdHlwZS5cbiAqL1xuXG5mdW5jdGlvbiB0eXBlKGVsKSB7XG4gIHZhciBncm91cCA9ICdhcnJheScgPT0gdHlwZU9mKGVsKSB8fCAnb2JqZWN0JyA9PSB0eXBlT2YoZWwpO1xuICBpZiAoZ3JvdXApIGVsID0gZWxbMF07XG4gIHZhciBuYW1lID0gZWwubm9kZU5hbWUudG9Mb3dlckNhc2UoKTtcbiAgdmFyIHR5cGUgPSBlbC5nZXRBdHRyaWJ1dGUoJ3R5cGUnKTtcblxuICBpZiAoZ3JvdXAgJiYgdHlwZSAmJiAncmFkaW8nID09IHR5cGUudG9Mb3dlckNhc2UoKSkgcmV0dXJuICdyYWRpb2dyb3VwJztcbiAgaWYgKCdpbnB1dCcgPT0gbmFtZSAmJiB0eXBlICYmICdjaGVja2JveCcgPT0gdHlwZS50b0xvd2VyQ2FzZSgpKSByZXR1cm4gJ2NoZWNrYm94JztcbiAgaWYgKCdpbnB1dCcgPT0gbmFtZSAmJiB0eXBlICYmICdyYWRpbycgPT0gdHlwZS50b0xvd2VyQ2FzZSgpKSByZXR1cm4gJ3JhZGlvJztcbiAgaWYgKCdzZWxlY3QnID09IG5hbWUpIHJldHVybiAnc2VsZWN0JztcbiAgcmV0dXJuIG5hbWU7XG59XG4iLCJcbmZ1bmN0aW9uIG9uZShzZWxlY3RvciwgZWwpIHtcbiAgcmV0dXJuIGVsLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xufVxuXG5leHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzZWxlY3RvciwgZWwpe1xuICBlbCA9IGVsIHx8IGRvY3VtZW50O1xuICByZXR1cm4gb25lKHNlbGVjdG9yLCBlbCk7XG59O1xuXG5leHBvcnRzLmFsbCA9IGZ1bmN0aW9uKHNlbGVjdG9yLCBlbCl7XG4gIGVsID0gZWwgfHwgZG9jdW1lbnQ7XG4gIHJldHVybiBlbC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcbn07XG5cbmV4cG9ydHMuZW5naW5lID0gZnVuY3Rpb24ob2JqKXtcbiAgaWYgKCFvYmoub25lKSB0aHJvdyBuZXcgRXJyb3IoJy5vbmUgY2FsbGJhY2sgcmVxdWlyZWQnKTtcbiAgaWYgKCFvYmouYWxsKSB0aHJvdyBuZXcgRXJyb3IoJy5hbGwgY2FsbGJhY2sgcmVxdWlyZWQnKTtcbiAgb25lID0gb2JqLm9uZTtcbiAgZXhwb3J0cy5hbGwgPSBvYmouYWxsO1xufTtcbiIsIlxuLyoqXG4gKiB0b1N0cmluZyByZWYuXG4gKi9cblxudmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuLyoqXG4gKiBSZXR1cm4gdGhlIHR5cGUgb2YgYHZhbGAuXG4gKlxuICogQHBhcmFtIHtNaXhlZH0gdmFsXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24odmFsKXtcbiAgc3dpdGNoICh0b1N0cmluZy5jYWxsKHZhbCkpIHtcbiAgICBjYXNlICdbb2JqZWN0IEZ1bmN0aW9uXSc6IHJldHVybiAnZnVuY3Rpb24nO1xuICAgIGNhc2UgJ1tvYmplY3QgRGF0ZV0nOiByZXR1cm4gJ2RhdGUnO1xuICAgIGNhc2UgJ1tvYmplY3QgUmVnRXhwXSc6IHJldHVybiAncmVnZXhwJztcbiAgICBjYXNlICdbb2JqZWN0IEFyZ3VtZW50c10nOiByZXR1cm4gJ2FyZ3VtZW50cyc7XG4gICAgY2FzZSAnW29iamVjdCBBcnJheV0nOiByZXR1cm4gJ2FycmF5JztcbiAgICBjYXNlICdbb2JqZWN0IFN0cmluZ10nOiByZXR1cm4gJ3N0cmluZyc7XG4gIH1cblxuICBpZiAodmFsID09PSBudWxsKSByZXR1cm4gJ251bGwnO1xuICBpZiAodmFsID09PSB1bmRlZmluZWQpIHJldHVybiAndW5kZWZpbmVkJztcbiAgaWYgKHZhbCAmJiB2YWwubm9kZVR5cGUgPT09IDEpIHJldHVybiAnZWxlbWVudCc7XG4gIGlmICh2YWwgPT09IE9iamVjdCh2YWwpKSByZXR1cm4gJ29iamVjdCc7XG5cbiAgcmV0dXJuIHR5cGVvZiB2YWw7XG59O1xuIiwiXG4vKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxudmFyIGNvbG9ycyA9IHJlcXVpcmUoJy4vY29sb3JzJyk7XG5cbi8qKlxuICogRXhwb3NlIGBwYXJzZWAuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBwYXJzZTtcblxuLyoqXG4gKiBQYXJzZSBgc3RyYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIHBhcnNlKHN0cikge1xuICByZXR1cm4gbmFtZWQoc3RyKVxuICAgIHx8IGhleDMoc3RyKVxuICAgIHx8IGhleDYoc3RyKVxuICAgIHx8IHJnYihzdHIpXG4gICAgfHwgcmdiYShzdHIpO1xufVxuXG4vKipcbiAqIFBhcnNlIG5hbWVkIGNzcyBjb2xvciBgc3RyYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBuYW1lZChzdHIpIHtcbiAgdmFyIGMgPSBjb2xvcnNbc3RyLnRvTG93ZXJDYXNlKCldO1xuICBpZiAoIWMpIHJldHVybjtcbiAgcmV0dXJuIHtcbiAgICByOiBjWzBdLFxuICAgIGc6IGNbMV0sXG4gICAgYjogY1syXVxuICB9XG59XG5cbi8qKlxuICogUGFyc2UgcmdiKG4sIG4sIG4pXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gcmdiKHN0cikge1xuICBpZiAoMCA9PSBzdHIuaW5kZXhPZigncmdiKCcpKSB7XG4gICAgc3RyID0gc3RyLm1hdGNoKC9yZ2JcXCgoW14pXSspXFwpLylbMV07XG4gICAgdmFyIHBhcnRzID0gc3RyLnNwbGl0KC8gKiwgKi8pLm1hcChOdW1iZXIpO1xuICAgIHJldHVybiB7XG4gICAgICByOiBwYXJ0c1swXSxcbiAgICAgIGc6IHBhcnRzWzFdLFxuICAgICAgYjogcGFydHNbMl0sXG4gICAgICBhOiAxXG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogUGFyc2UgcmdiYShuLCBuLCBuLCBuKVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHJnYmEoc3RyKSB7XG4gIGlmICgwID09IHN0ci5pbmRleE9mKCdyZ2JhKCcpKSB7XG4gICAgc3RyID0gc3RyLm1hdGNoKC9yZ2JhXFwoKFteKV0rKVxcKS8pWzFdO1xuICAgIHZhciBwYXJ0cyA9IHN0ci5zcGxpdCgvICosICovKS5tYXAoTnVtYmVyKTtcbiAgICByZXR1cm4ge1xuICAgICAgcjogcGFydHNbMF0sXG4gICAgICBnOiBwYXJ0c1sxXSxcbiAgICAgIGI6IHBhcnRzWzJdLFxuICAgICAgYTogcGFydHNbM11cbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBQYXJzZSAjbm5ubm5uXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gaGV4NihzdHIpIHtcbiAgaWYgKCcjJyA9PSBzdHJbMF0gJiYgNyA9PSBzdHIubGVuZ3RoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHI6IHBhcnNlSW50KHN0ci5zbGljZSgxLCAzKSwgMTYpLFxuICAgICAgZzogcGFyc2VJbnQoc3RyLnNsaWNlKDMsIDUpLCAxNiksXG4gICAgICBiOiBwYXJzZUludChzdHIuc2xpY2UoNSwgNyksIDE2KSxcbiAgICAgIGE6IDFcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBQYXJzZSAjbm5uXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gaGV4MyhzdHIpIHtcbiAgaWYgKCcjJyA9PSBzdHJbMF0gJiYgNCA9PSBzdHIubGVuZ3RoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHI6IHBhcnNlSW50KHN0clsxXSArIHN0clsxXSwgMTYpLFxuICAgICAgZzogcGFyc2VJbnQoc3RyWzJdICsgc3RyWzJdLCAxNiksXG4gICAgICBiOiBwYXJzZUludChzdHJbM10gKyBzdHJbM10sIDE2KSxcbiAgICAgIGE6IDFcbiAgICB9XG4gIH1cbn1cblxuIiwiXG4vKipcbiAqIG1lcmdlIGBiYCdzIHByb3BlcnRpZXMgd2l0aCBgYWAncy5cbiAqXG4gKiBleGFtcGxlOlxuICpcbiAqICAgICAgICB2YXIgdXNlciA9IHt9O1xuICogICAgICAgIG1lcmdlKHVzZXIsIGNvbnNvbGUpO1xuICogICAgICAgIC8vID4geyBsb2c6IGZuLCBkaXI6IGZuIC4ufVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBhXG4gKiBAcGFyYW0ge09iamVjdH0gYlxuICogQHJldHVybiB7T2JqZWN0fVxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGEsIGIpIHtcbiAgZm9yICh2YXIgayBpbiBiKSBhW2tdID0gYltrXTtcbiAgcmV0dXJuIGE7XG59O1xuIiwiXG4vKipcbiAqIEV4cG9zZSBgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKClgLlxuICovXG5cbmV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWVcbiAgfHwgd2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZVxuICB8fCB3aW5kb3cubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lXG4gIHx8IHdpbmRvdy5vUmVxdWVzdEFuaW1hdGlvbkZyYW1lXG4gIHx8IHdpbmRvdy5tc1JlcXVlc3RBbmltYXRpb25GcmFtZVxuICB8fCBmYWxsYmFjaztcblxuLyoqXG4gKiBGYWxsYmFjayBpbXBsZW1lbnRhdGlvbi5cbiAqL1xuXG52YXIgcHJldiA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuZnVuY3Rpb24gZmFsbGJhY2soZm4pIHtcbiAgdmFyIGN1cnIgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgdmFyIG1zID0gTWF0aC5tYXgoMCwgMTYgLSAoY3VyciAtIHByZXYpKTtcbiAgc2V0VGltZW91dChmbiwgbXMpO1xuICBwcmV2ID0gY3Vycjtcbn1cblxuLyoqXG4gKiBDYW5jZWwuXG4gKi9cblxudmFyIGNhbmNlbCA9IHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZVxuICB8fCB3aW5kb3cud2Via2l0Q2FuY2VsQW5pbWF0aW9uRnJhbWVcbiAgfHwgd2luZG93Lm1vekNhbmNlbEFuaW1hdGlvbkZyYW1lXG4gIHx8IHdpbmRvdy5vQ2FuY2VsQW5pbWF0aW9uRnJhbWVcbiAgfHwgd2luZG93Lm1zQ2FuY2VsQW5pbWF0aW9uRnJhbWU7XG5cbmV4cG9ydHMuY2FuY2VsID0gZnVuY3Rpb24oaWQpe1xuICBjYW5jZWwuY2FsbCh3aW5kb3csIGlkKTtcbn07XG4iLCJcbi8qKlxuICogZGVwZW5kZW5jaWVzXG4gKi9cblxudmFyIG1hdGNoZXMgPSByZXF1aXJlKCdtYXRjaGVzLXNlbGVjdG9yJyk7XG5cbi8qKlxuICogVHJhdmVyc2Ugd2l0aCB0aGUgZ2l2ZW4gYGVsYCwgYHNlbGVjdG9yYCBhbmQgYGxlbmAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7U3RyaW5nfSBzZWxlY3RvclxuICogQHBhcmFtIHtOdW1iZXJ9IGxlblxuICogQHJldHVybiB7QXJyYXl9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24odHlwZSwgZWwsIHNlbGVjdG9yLCBsZW4pe1xuICB2YXIgZWwgPSBlbFt0eXBlXVxuICAgICwgbiA9IGxlbiB8fCAxXG4gICAgLCByZXQgPSBbXTtcblxuICBpZiAoIWVsKSByZXR1cm4gcmV0O1xuXG4gIGRvIHtcbiAgICBpZiAobiA9PSByZXQubGVuZ3RoKSBicmVhaztcbiAgICBpZiAoMSAhPSBlbC5ub2RlVHlwZSkgY29udGludWU7XG4gICAgaWYgKG1hdGNoZXMoZWwsIHNlbGVjdG9yKSkgcmV0LnB1c2goZWwpO1xuICAgIGlmICghc2VsZWN0b3IpIHJldC5wdXNoKGVsKTtcbiAgfSB3aGlsZSAoZWwgPSBlbFt0eXBlXSk7XG5cbiAgcmV0dXJuIHJldDtcbn1cbiIsImV4cG9ydHMubnVtYmVyID0gcmVxdWlyZSgnLi9udW1iZXInKVxuZXhwb3J0cy5tYXRyaXggPSByZXF1aXJlKCcuL21hdHJpeCcpXG5leHBvcnRzLmNvbG9yID0gcmVxdWlyZSgnLi9jb2xvcicpXG5leHBvcnRzLnB4ID0gcmVxdWlyZSgnLi9weCcpIiwiXG52YXIgZ2xvYmFsID0gZnVuY3Rpb24oKXtyZXR1cm4gdGhpc30oKVxudmFyIHBlcmZvcm1hbmNlID0gZ2xvYmFsLnBlcmZvcm1hbmNlXG5cbi8qKlxuICogR2V0IGEgdGltZXN0YW1wXG4gKiBcbiAqIEByZXR1cm4ge051bWJlcn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpe1xuICByZXR1cm4gcGVyZm9ybWFuY2Uubm93KClcbn1cblxuLy8gZmFsbGJhY2tcblxuaWYgKCFwZXJmb3JtYW5jZSB8fCB0eXBlb2YgcGVyZm9ybWFuY2Uubm93ICE9ICdmdW5jdGlvbicpIHtcblx0bW9kdWxlLmV4cG9ydHMgPSBEYXRlLm5vdyB8fCBmdW5jdGlvbigpeyByZXR1cm4gKyhuZXcgRGF0ZSkgfVxufVxuIiwiXG4vKipcbiAqIGRlcGVuZGVuY2llc1xuICovXG5cbnZhciBpbmhlcml0ID0gcmVxdWlyZSgnaW5oZXJpdCcpO1xuXG4vKipcbiAqIEV4cG9ydCBgZXh0ZW5zaWJsZWBcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4dGVuc2libGU7XG5cbi8qKlxuICogTWFrZSB0aGUgZ2l2ZW4gYEFgIGV4dGVuc2libGUuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gQVxuICogQHJldHVybiB7QX1cbiAqL1xuXG5mdW5jdGlvbiBleHRlbnNpYmxlKEEpe1xuICBBLmV4dGVuZCA9IGV4dGVuZDtcbiAgcmV0dXJuIEE7XG59O1xuXG4vKipcbiAqIG1ha2UgYEJgIGluaGVyaXQgZnJvbSBgdGhpc2AuIFVubGVzcyBgZmluYWxgLFxuICogYEJgIHdpbGwgYWxzbyBiZSBtYWRlIGV4dGVuc2libGUuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gQlxuICogQHBhcmFtIHtCb29sZWFufSBbZmluYWxdXG4gKiBAcmV0dXJuIHtCfVxuICovXG5cbmZ1bmN0aW9uIGV4dGVuZChCLCBmaW5hbCl7XG4gICFmaW5hbCAmJiBleHRlbnNpYmxlKEIpO1xuICBpbmhlcml0KEIsIHRoaXMpO1xuICByZXR1cm4gQlxufTsiLCJcbmV4cG9ydHMubGluZWFyID0gZnVuY3Rpb24obil7XG4gIHJldHVybiBuO1xufTtcblxuZXhwb3J0cy5pblF1YWQgPSBmdW5jdGlvbihuKXtcbiAgcmV0dXJuIG4gKiBuO1xufTtcblxuZXhwb3J0cy5vdXRRdWFkID0gZnVuY3Rpb24obil7XG4gIHJldHVybiBuICogKDIgLSBuKTtcbn07XG5cbmV4cG9ydHMuaW5PdXRRdWFkID0gZnVuY3Rpb24obil7XG4gIG4gKj0gMjtcbiAgaWYgKG4gPCAxKSByZXR1cm4gMC41ICogbiAqIG47XG4gIHJldHVybiAtIDAuNSAqICgtLW4gKiAobiAtIDIpIC0gMSk7XG59O1xuXG5leHBvcnRzLmluQ3ViZSA9IGZ1bmN0aW9uKG4pe1xuICByZXR1cm4gbiAqIG4gKiBuO1xufTtcblxuZXhwb3J0cy5vdXRDdWJlID0gZnVuY3Rpb24obil7XG4gIHJldHVybiAtLW4gKiBuICogbiArIDE7XG59O1xuXG5leHBvcnRzLmluT3V0Q3ViZSA9IGZ1bmN0aW9uKG4pe1xuICBuICo9IDI7XG4gIGlmIChuIDwgMSkgcmV0dXJuIDAuNSAqIG4gKiBuICogbjtcbiAgcmV0dXJuIDAuNSAqICgobiAtPSAyICkgKiBuICogbiArIDIpO1xufTtcblxuZXhwb3J0cy5pblF1YXJ0ID0gZnVuY3Rpb24obil7XG4gIHJldHVybiBuICogbiAqIG4gKiBuO1xufTtcblxuZXhwb3J0cy5vdXRRdWFydCA9IGZ1bmN0aW9uKG4pe1xuICByZXR1cm4gMSAtICgtLW4gKiBuICogbiAqIG4pO1xufTtcblxuZXhwb3J0cy5pbk91dFF1YXJ0ID0gZnVuY3Rpb24obil7XG4gIG4gKj0gMjtcbiAgaWYgKG4gPCAxKSByZXR1cm4gMC41ICogbiAqIG4gKiBuICogbjtcbiAgcmV0dXJuIC0wLjUgKiAoKG4gLT0gMikgKiBuICogbiAqIG4gLSAyKTtcbn07XG5cbmV4cG9ydHMuaW5RdWludCA9IGZ1bmN0aW9uKG4pe1xuICByZXR1cm4gbiAqIG4gKiBuICogbiAqIG47XG59XG5cbmV4cG9ydHMub3V0UXVpbnQgPSBmdW5jdGlvbihuKXtcbiAgcmV0dXJuIC0tbiAqIG4gKiBuICogbiAqIG4gKyAxO1xufVxuXG5leHBvcnRzLmluT3V0UXVpbnQgPSBmdW5jdGlvbihuKXtcbiAgbiAqPSAyO1xuICBpZiAobiA8IDEpIHJldHVybiAwLjUgKiBuICogbiAqIG4gKiBuICogbjtcbiAgcmV0dXJuIDAuNSAqICgobiAtPSAyKSAqIG4gKiBuICogbiAqIG4gKyAyKTtcbn07XG5cbmV4cG9ydHMuaW5TaW5lID0gZnVuY3Rpb24obil7XG4gIHJldHVybiAxIC0gTWF0aC5jb3MobiAqIE1hdGguUEkgLyAyICk7XG59O1xuXG5leHBvcnRzLm91dFNpbmUgPSBmdW5jdGlvbihuKXtcbiAgcmV0dXJuIE1hdGguc2luKG4gKiBNYXRoLlBJIC8gMik7XG59O1xuXG5leHBvcnRzLmluT3V0U2luZSA9IGZ1bmN0aW9uKG4pe1xuICByZXR1cm4gLjUgKiAoMSAtIE1hdGguY29zKE1hdGguUEkgKiBuKSk7XG59O1xuXG5leHBvcnRzLmluRXhwbyA9IGZ1bmN0aW9uKG4pe1xuICByZXR1cm4gMCA9PSBuID8gMCA6IE1hdGgucG93KDEwMjQsIG4gLSAxKTtcbn07XG5cbmV4cG9ydHMub3V0RXhwbyA9IGZ1bmN0aW9uKG4pe1xuICByZXR1cm4gMSA9PSBuID8gbiA6IDEgLSBNYXRoLnBvdygyLCAtMTAgKiBuKTtcbn07XG5cbmV4cG9ydHMuaW5PdXRFeHBvID0gZnVuY3Rpb24obil7XG4gIGlmICgwID09IG4pIHJldHVybiAwO1xuICBpZiAoMSA9PSBuKSByZXR1cm4gMTtcbiAgaWYgKChuICo9IDIpIDwgMSkgcmV0dXJuIC41ICogTWF0aC5wb3coMTAyNCwgbiAtIDEpO1xuICByZXR1cm4gLjUgKiAoLU1hdGgucG93KDIsIC0xMCAqIChuIC0gMSkpICsgMik7XG59O1xuXG5leHBvcnRzLmluQ2lyYyA9IGZ1bmN0aW9uKG4pe1xuICByZXR1cm4gMSAtIE1hdGguc3FydCgxIC0gbiAqIG4pO1xufTtcblxuZXhwb3J0cy5vdXRDaXJjID0gZnVuY3Rpb24obil7XG4gIHJldHVybiBNYXRoLnNxcnQoMSAtICgtLW4gKiBuKSk7XG59O1xuXG5leHBvcnRzLmluT3V0Q2lyYyA9IGZ1bmN0aW9uKG4pe1xuICBuICo9IDJcbiAgaWYgKG4gPCAxKSByZXR1cm4gLTAuNSAqIChNYXRoLnNxcnQoMSAtIG4gKiBuKSAtIDEpO1xuICByZXR1cm4gMC41ICogKE1hdGguc3FydCgxIC0gKG4gLT0gMikgKiBuKSArIDEpO1xufTtcblxuZXhwb3J0cy5pbkJhY2sgPSBmdW5jdGlvbihuKXtcbiAgdmFyIHMgPSAxLjcwMTU4O1xuICByZXR1cm4gbiAqIG4gKiAoKCBzICsgMSApICogbiAtIHMpO1xufTtcblxuZXhwb3J0cy5vdXRCYWNrID0gZnVuY3Rpb24obil7XG4gIHZhciBzID0gMS43MDE1ODtcbiAgcmV0dXJuIC0tbiAqIG4gKiAoKHMgKyAxKSAqIG4gKyBzKSArIDE7XG59O1xuXG5leHBvcnRzLmluT3V0QmFjayA9IGZ1bmN0aW9uKG4pe1xuICB2YXIgcyA9IDEuNzAxNTggKiAxLjUyNTtcbiAgaWYgKCAoIG4gKj0gMiApIDwgMSApIHJldHVybiAwLjUgKiAoIG4gKiBuICogKCAoIHMgKyAxICkgKiBuIC0gcyApICk7XG4gIHJldHVybiAwLjUgKiAoICggbiAtPSAyICkgKiBuICogKCAoIHMgKyAxICkgKiBuICsgcyApICsgMiApO1xufTtcblxuZXhwb3J0cy5pbkJvdW5jZSA9IGZ1bmN0aW9uKG4pe1xuICByZXR1cm4gMSAtIGV4cG9ydHMub3V0Qm91bmNlKDEgLSBuKTtcbn07XG5cbmV4cG9ydHMub3V0Qm91bmNlID0gZnVuY3Rpb24obil7XG4gIGlmICggbiA8ICggMSAvIDIuNzUgKSApIHtcbiAgICByZXR1cm4gNy41NjI1ICogbiAqIG47XG4gIH0gZWxzZSBpZiAoIG4gPCAoIDIgLyAyLjc1ICkgKSB7XG4gICAgcmV0dXJuIDcuNTYyNSAqICggbiAtPSAoIDEuNSAvIDIuNzUgKSApICogbiArIDAuNzU7XG4gIH0gZWxzZSBpZiAoIG4gPCAoIDIuNSAvIDIuNzUgKSApIHtcbiAgICByZXR1cm4gNy41NjI1ICogKCBuIC09ICggMi4yNSAvIDIuNzUgKSApICogbiArIDAuOTM3NTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gNy41NjI1ICogKCBuIC09ICggMi42MjUgLyAyLjc1ICkgKSAqIG4gKyAwLjk4NDM3NTtcbiAgfVxufTtcblxuZXhwb3J0cy5pbk91dEJvdW5jZSA9IGZ1bmN0aW9uKG4pe1xuICBpZiAobiA8IC41KSByZXR1cm4gZXhwb3J0cy5pbkJvdW5jZShuICogMikgKiAuNTtcbiAgcmV0dXJuIGV4cG9ydHMub3V0Qm91bmNlKG4gKiAyIC0gMSkgKiAuNSArIC41O1xufTtcblxuLy8gYWxpYXNlc1xuXG5leHBvcnRzWydpbi1xdWFkJ10gPSBleHBvcnRzLmluUXVhZDtcbmV4cG9ydHNbJ291dC1xdWFkJ10gPSBleHBvcnRzLm91dFF1YWQ7XG5leHBvcnRzWydpbi1vdXQtcXVhZCddID0gZXhwb3J0cy5pbk91dFF1YWQ7XG5leHBvcnRzWydpbi1jdWJlJ10gPSBleHBvcnRzLmluQ3ViZTtcbmV4cG9ydHNbJ291dC1jdWJlJ10gPSBleHBvcnRzLm91dEN1YmU7XG5leHBvcnRzWydpbi1vdXQtY3ViZSddID0gZXhwb3J0cy5pbk91dEN1YmU7XG5leHBvcnRzWydpbi1xdWFydCddID0gZXhwb3J0cy5pblF1YXJ0O1xuZXhwb3J0c1snb3V0LXF1YXJ0J10gPSBleHBvcnRzLm91dFF1YXJ0O1xuZXhwb3J0c1snaW4tb3V0LXF1YXJ0J10gPSBleHBvcnRzLmluT3V0UXVhcnQ7XG5leHBvcnRzWydpbi1xdWludCddID0gZXhwb3J0cy5pblF1aW50O1xuZXhwb3J0c1snb3V0LXF1aW50J10gPSBleHBvcnRzLm91dFF1aW50O1xuZXhwb3J0c1snaW4tb3V0LXF1aW50J10gPSBleHBvcnRzLmluT3V0UXVpbnQ7XG5leHBvcnRzWydpbi1zaW5lJ10gPSBleHBvcnRzLmluU2luZTtcbmV4cG9ydHNbJ291dC1zaW5lJ10gPSBleHBvcnRzLm91dFNpbmU7XG5leHBvcnRzWydpbi1vdXQtc2luZSddID0gZXhwb3J0cy5pbk91dFNpbmU7XG5leHBvcnRzWydpbi1leHBvJ10gPSBleHBvcnRzLmluRXhwbztcbmV4cG9ydHNbJ291dC1leHBvJ10gPSBleHBvcnRzLm91dEV4cG87XG5leHBvcnRzWydpbi1vdXQtZXhwbyddID0gZXhwb3J0cy5pbk91dEV4cG87XG5leHBvcnRzWydpbi1jaXJjJ10gPSBleHBvcnRzLmluQ2lyYztcbmV4cG9ydHNbJ291dC1jaXJjJ10gPSBleHBvcnRzLm91dENpcmM7XG5leHBvcnRzWydpbi1vdXQtY2lyYyddID0gZXhwb3J0cy5pbk91dENpcmM7XG5leHBvcnRzWydpbi1iYWNrJ10gPSBleHBvcnRzLmluQmFjaztcbmV4cG9ydHNbJ291dC1iYWNrJ10gPSBleHBvcnRzLm91dEJhY2s7XG5leHBvcnRzWydpbi1vdXQtYmFjayddID0gZXhwb3J0cy5pbk91dEJhY2s7XG5leHBvcnRzWydpbi1ib3VuY2UnXSA9IGV4cG9ydHMuaW5Cb3VuY2U7XG5leHBvcnRzWydvdXQtYm91bmNlJ10gPSBleHBvcnRzLm91dEJvdW5jZTtcbmV4cG9ydHNbJ2luLW91dC1ib3VuY2UnXSA9IGV4cG9ydHMuaW5PdXRCb3VuY2U7XG4iLCJcbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGFsaWNlYmx1ZTogWzI0MCwgMjQ4LCAyNTVdXG4gICwgYW50aXF1ZXdoaXRlOiBbMjUwLCAyMzUsIDIxNV1cbiAgLCBhcXVhOiBbMCwgMjU1LCAyNTVdXG4gICwgYXF1YW1hcmluZTogWzEyNywgMjU1LCAyMTJdXG4gICwgYXp1cmU6IFsyNDAsIDI1NSwgMjU1XVxuICAsIGJlaWdlOiBbMjQ1LCAyNDUsIDIyMF1cbiAgLCBiaXNxdWU6IFsyNTUsIDIyOCwgMTk2XVxuICAsIGJsYWNrOiBbMCwgMCwgMF1cbiAgLCBibGFuY2hlZGFsbW9uZDogWzI1NSwgMjM1LCAyMDVdXG4gICwgYmx1ZTogWzAsIDAsIDI1NV1cbiAgLCBibHVldmlvbGV0OiBbMTM4LCA0MywgMjI2XVxuICAsIGJyb3duOiBbMTY1LCA0MiwgNDJdXG4gICwgYnVybHl3b29kOiBbMjIyLCAxODQsIDEzNV1cbiAgLCBjYWRldGJsdWU6IFs5NSwgMTU4LCAxNjBdXG4gICwgY2hhcnRyZXVzZTogWzEyNywgMjU1LCAwXVxuICAsIGNob2NvbGF0ZTogWzIxMCwgMTA1LCAzMF1cbiAgLCBjb3JhbDogWzI1NSwgMTI3LCA4MF1cbiAgLCBjb3JuZmxvd2VyYmx1ZTogWzEwMCwgMTQ5LCAyMzddXG4gICwgY29ybnNpbGs6IFsyNTUsIDI0OCwgMjIwXVxuICAsIGNyaW1zb246IFsyMjAsIDIwLCA2MF1cbiAgLCBjeWFuOiBbMCwgMjU1LCAyNTVdXG4gICwgZGFya2JsdWU6IFswLCAwLCAxMzldXG4gICwgZGFya2N5YW46IFswLCAxMzksIDEzOV1cbiAgLCBkYXJrZ29sZGVucm9kOiBbMTg0LCAxMzIsIDExXVxuICAsIGRhcmtncmF5OiBbMTY5LCAxNjksIDE2OV1cbiAgLCBkYXJrZ3JlZW46IFswLCAxMDAsIDBdXG4gICwgZGFya2dyZXk6IFsxNjksIDE2OSwgMTY5XVxuICAsIGRhcmtraGFraTogWzE4OSwgMTgzLCAxMDddXG4gICwgZGFya21hZ2VudGE6IFsxMzksIDAsIDEzOV1cbiAgLCBkYXJrb2xpdmVncmVlbjogWzg1LCAxMDcsIDQ3XVxuICAsIGRhcmtvcmFuZ2U6IFsyNTUsIDE0MCwgMF1cbiAgLCBkYXJrb3JjaGlkOiBbMTUzLCA1MCwgMjA0XVxuICAsIGRhcmtyZWQ6IFsxMzksIDAsIDBdXG4gICwgZGFya3NhbG1vbjogWzIzMywgMTUwLCAxMjJdXG4gICwgZGFya3NlYWdyZWVuOiBbMTQzLCAxODgsIDE0M11cbiAgLCBkYXJrc2xhdGVibHVlOiBbNzIsIDYxLCAxMzldXG4gICwgZGFya3NsYXRlZ3JheTogWzQ3LCA3OSwgNzldXG4gICwgZGFya3NsYXRlZ3JleTogWzQ3LCA3OSwgNzldXG4gICwgZGFya3R1cnF1b2lzZTogWzAsIDIwNiwgMjA5XVxuICAsIGRhcmt2aW9sZXQ6IFsxNDgsIDAsIDIxMV1cbiAgLCBkZWVwcGluazogWzI1NSwgMjAsIDE0N11cbiAgLCBkZWVwc2t5Ymx1ZTogWzAsIDE5MSwgMjU1XVxuICAsIGRpbWdyYXk6IFsxMDUsIDEwNSwgMTA1XVxuICAsIGRpbWdyZXk6IFsxMDUsIDEwNSwgMTA1XVxuICAsIGRvZGdlcmJsdWU6IFszMCwgMTQ0LCAyNTVdXG4gICwgZmlyZWJyaWNrOiBbMTc4LCAzNCwgMzRdXG4gICwgZmxvcmFsd2hpdGU6IFsyNTUsIDI1NSwgMjQwXVxuICAsIGZvcmVzdGdyZWVuOiBbMzQsIDEzOSwgMzRdXG4gICwgZnVjaHNpYTogWzI1NSwgMCwgMjU1XVxuICAsIGdhaW5zYm9ybzogWzIyMCwgMjIwLCAyMjBdXG4gICwgZ2hvc3R3aGl0ZTogWzI0OCwgMjQ4LCAyNTVdXG4gICwgZ29sZDogWzI1NSwgMjE1LCAwXVxuICAsIGdvbGRlbnJvZDogWzIxOCwgMTY1LCAzMl1cbiAgLCBncmF5OiBbMTI4LCAxMjgsIDEyOF1cbiAgLCBncmVlbjogWzAsIDEyOCwgMF1cbiAgLCBncmVlbnllbGxvdzogWzE3MywgMjU1LCA0N11cbiAgLCBncmV5OiBbMTI4LCAxMjgsIDEyOF1cbiAgLCBob25leWRldzogWzI0MCwgMjU1LCAyNDBdXG4gICwgaG90cGluazogWzI1NSwgMTA1LCAxODBdXG4gICwgaW5kaWFucmVkOiBbMjA1LCA5MiwgOTJdXG4gICwgaW5kaWdvOiBbNzUsIDAsIDEzMF1cbiAgLCBpdm9yeTogWzI1NSwgMjU1LCAyNDBdXG4gICwga2hha2k6IFsyNDAsIDIzMCwgMTQwXVxuICAsIGxhdmVuZGVyOiBbMjMwLCAyMzAsIDI1MF1cbiAgLCBsYXZlbmRlcmJsdXNoOiBbMjU1LCAyNDAsIDI0NV1cbiAgLCBsYXduZ3JlZW46IFsxMjQsIDI1MiwgMF1cbiAgLCBsZW1vbmNoaWZmb246IFsyNTUsIDI1MCwgMjA1XVxuICAsIGxpZ2h0Ymx1ZTogWzE3MywgMjE2LCAyMzBdXG4gICwgbGlnaHRjb3JhbDogWzI0MCwgMTI4LCAxMjhdXG4gICwgbGlnaHRjeWFuOiBbMjI0LCAyNTUsIDI1NV1cbiAgLCBsaWdodGdvbGRlbnJvZHllbGxvdzogWzI1MCwgMjUwLCAyMTBdXG4gICwgbGlnaHRncmF5OiBbMjExLCAyMTEsIDIxMV1cbiAgLCBsaWdodGdyZWVuOiBbMTQ0LCAyMzgsIDE0NF1cbiAgLCBsaWdodGdyZXk6IFsyMTEsIDIxMSwgMjExXVxuICAsIGxpZ2h0cGluazogWzI1NSwgMTgyLCAxOTNdXG4gICwgbGlnaHRzYWxtb246IFsyNTUsIDE2MCwgMTIyXVxuICAsIGxpZ2h0c2VhZ3JlZW46IFszMiwgMTc4LCAxNzBdXG4gICwgbGlnaHRza3libHVlOiBbMTM1LCAyMDYsIDI1MF1cbiAgLCBsaWdodHNsYXRlZ3JheTogWzExOSwgMTM2LCAxNTNdXG4gICwgbGlnaHRzbGF0ZWdyZXk6IFsxMTksIDEzNiwgMTUzXVxuICAsIGxpZ2h0c3RlZWxibHVlOiBbMTc2LCAxOTYsIDIyMl1cbiAgLCBsaWdodHllbGxvdzogWzI1NSwgMjU1LCAyMjRdXG4gICwgbGltZTogWzAsIDI1NSwgMF1cbiAgLCBsaW1lZ3JlZW46IFs1MCwgMjA1LCA1MF1cbiAgLCBsaW5lbjogWzI1MCwgMjQwLCAyMzBdXG4gICwgbWFnZW50YTogWzI1NSwgMCwgMjU1XVxuICAsIG1hcm9vbjogWzEyOCwgMCwgMF1cbiAgLCBtZWRpdW1hcXVhbWFyaW5lOiBbMTAyLCAyMDUsIDE3MF1cbiAgLCBtZWRpdW1ibHVlOiBbMCwgMCwgMjA1XVxuICAsIG1lZGl1bW9yY2hpZDogWzE4NiwgODUsIDIxMV1cbiAgLCBtZWRpdW1wdXJwbGU6IFsxNDcsIDExMiwgMjE5XVxuICAsIG1lZGl1bXNlYWdyZWVuOiBbNjAsIDE3OSwgMTEzXVxuICAsIG1lZGl1bXNsYXRlYmx1ZTogWzEyMywgMTA0LCAyMzhdXG4gICwgbWVkaXVtc3ByaW5nZ3JlZW46IFswLCAyNTAsIDE1NF1cbiAgLCBtZWRpdW10dXJxdW9pc2U6IFs3MiwgMjA5LCAyMDRdXG4gICwgbWVkaXVtdmlvbGV0cmVkOiBbMTk5LCAyMSwgMTMzXVxuICAsIG1pZG5pZ2h0Ymx1ZTogWzI1LCAyNSwgMTEyXVxuICAsIG1pbnRjcmVhbTogWzI0NSwgMjU1LCAyNTBdXG4gICwgbWlzdHlyb3NlOiBbMjU1LCAyMjgsIDIyNV1cbiAgLCBtb2NjYXNpbjogWzI1NSwgMjI4LCAxODFdXG4gICwgbmF2YWpvd2hpdGU6IFsyNTUsIDIyMiwgMTczXVxuICAsIG5hdnk6IFswLCAwLCAxMjhdXG4gICwgb2xkbGFjZTogWzI1MywgMjQ1LCAyMzBdXG4gICwgb2xpdmU6IFsxMjgsIDEyOCwgMF1cbiAgLCBvbGl2ZWRyYWI6IFsxMDcsIDE0MiwgMzVdXG4gICwgb3JhbmdlOiBbMjU1LCAxNjUsIDBdXG4gICwgb3JhbmdlcmVkOiBbMjU1LCA2OSwgMF1cbiAgLCBvcmNoaWQ6IFsyMTgsIDExMiwgMjE0XVxuICAsIHBhbGVnb2xkZW5yb2Q6IFsyMzgsIDIzMiwgMTcwXVxuICAsIHBhbGVncmVlbjogWzE1MiwgMjUxLCAxNTJdXG4gICwgcGFsZXR1cnF1b2lzZTogWzE3NSwgMjM4LCAyMzhdXG4gICwgcGFsZXZpb2xldHJlZDogWzIxOSwgMTEyLCAxNDddXG4gICwgcGFwYXlhd2hpcDogWzI1NSwgMjM5LCAyMTNdXG4gICwgcGVhY2hwdWZmOiBbMjU1LCAyMTgsIDE4NV1cbiAgLCBwZXJ1OiBbMjA1LCAxMzMsIDYzXVxuICAsIHBpbms6IFsyNTUsIDE5MiwgMjAzXVxuICAsIHBsdW06IFsyMjEsIDE2MCwgMjAzXVxuICAsIHBvd2RlcmJsdWU6IFsxNzYsIDIyNCwgMjMwXVxuICAsIHB1cnBsZTogWzEyOCwgMCwgMTI4XVxuICAsIHJlZDogWzI1NSwgMCwgMF1cbiAgLCByb3N5YnJvd246IFsxODgsIDE0MywgMTQzXVxuICAsIHJveWFsYmx1ZTogWzY1LCAxMDUsIDIyNV1cbiAgLCBzYWRkbGVicm93bjogWzEzOSwgNjksIDE5XVxuICAsIHNhbG1vbjogWzI1MCwgMTI4LCAxMTRdXG4gICwgc2FuZHlicm93bjogWzI0NCwgMTY0LCA5Nl1cbiAgLCBzZWFncmVlbjogWzQ2LCAxMzksIDg3XVxuICAsIHNlYXNoZWxsOiBbMjU1LCAyNDUsIDIzOF1cbiAgLCBzaWVubmE6IFsxNjAsIDgyLCA0NV1cbiAgLCBzaWx2ZXI6IFsxOTIsIDE5MiwgMTkyXVxuICAsIHNreWJsdWU6IFsxMzUsIDIwNiwgMjM1XVxuICAsIHNsYXRlYmx1ZTogWzEwNiwgOTAsIDIwNV1cbiAgLCBzbGF0ZWdyYXk6IFsxMTksIDEyOCwgMTQ0XVxuICAsIHNsYXRlZ3JleTogWzExOSwgMTI4LCAxNDRdXG4gICwgc25vdzogWzI1NSwgMjU1LCAyNTBdXG4gICwgc3ByaW5nZ3JlZW46IFswLCAyNTUsIDEyN11cbiAgLCBzdGVlbGJsdWU6IFs3MCwgMTMwLCAxODBdXG4gICwgdGFuOiBbMjEwLCAxODAsIDE0MF1cbiAgLCB0ZWFsOiBbMCwgMTI4LCAxMjhdXG4gICwgdGhpc3RsZTogWzIxNiwgMTkxLCAyMTZdXG4gICwgdG9tYXRvOiBbMjU1LCA5OSwgNzFdXG4gICwgdHVycXVvaXNlOiBbNjQsIDIyNCwgMjA4XVxuICAsIHZpb2xldDogWzIzOCwgMTMwLCAyMzhdXG4gICwgd2hlYXQ6IFsyNDUsIDIyMiwgMTc5XVxuICAsIHdoaXRlOiBbMjU1LCAyNTUsIDI1NV1cbiAgLCB3aGl0ZXNtb2tlOiBbMjQ1LCAyNDUsIDI0NV1cbiAgLCB5ZWxsb3c6IFsyNTUsIDI1NSwgMF1cbiAgLCB5ZWxsb3dncmVlbjogWzE1NCwgMjA1LCA1XVxufTsiLCJcbmZ1bmN0aW9uIG9uZShzZWxlY3RvciwgZWwpIHtcbiAgcmV0dXJuIGVsLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xufVxuXG5leHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzZWxlY3RvciwgZWwpe1xuICBlbCA9IGVsIHx8IGRvY3VtZW50O1xuICByZXR1cm4gb25lKHNlbGVjdG9yLCBlbCk7XG59O1xuXG5leHBvcnRzLmFsbCA9IGZ1bmN0aW9uKHNlbGVjdG9yLCBlbCl7XG4gIGVsID0gZWwgfHwgZG9jdW1lbnQ7XG4gIHJldHVybiBlbC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcbn07XG5cbmV4cG9ydHMuZW5naW5lID0gZnVuY3Rpb24ob2JqKXtcbiAgaWYgKCFvYmoub25lKSB0aHJvdyBuZXcgRXJyb3IoJy5vbmUgY2FsbGJhY2sgcmVxdWlyZWQnKTtcbiAgaWYgKCFvYmouYWxsKSB0aHJvdyBuZXcgRXJyb3IoJy5hbGwgY2FsbGJhY2sgcmVxdWlyZWQnKTtcbiAgb25lID0gb2JqLm9uZTtcbiAgZXhwb3J0cy5hbGwgPSBvYmouYWxsO1xufTtcbiIsIlxuLyoqXG4gKiBCaW5kIGBlbGAgZXZlbnQgYHR5cGVgIHRvIGBmbmAuXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbFxuICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGNhcHR1cmVcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5leHBvcnRzLmJpbmQgPSBmdW5jdGlvbihlbCwgdHlwZSwgZm4sIGNhcHR1cmUpe1xuICBpZiAoZWwuYWRkRXZlbnRMaXN0ZW5lcikge1xuICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgZm4sIGNhcHR1cmUgfHwgZmFsc2UpO1xuICB9IGVsc2Uge1xuICAgIGVsLmF0dGFjaEV2ZW50KCdvbicgKyB0eXBlLCBmbik7XG4gIH1cbiAgcmV0dXJuIGZuO1xufTtcblxuLyoqXG4gKiBVbmJpbmQgYGVsYCBldmVudCBgdHlwZWAncyBjYWxsYmFjayBgZm5gLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHBhcmFtIHtCb29sZWFufSBjYXB0dXJlXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy51bmJpbmQgPSBmdW5jdGlvbihlbCwgdHlwZSwgZm4sIGNhcHR1cmUpe1xuICBpZiAoZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcikge1xuICAgIGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgZm4sIGNhcHR1cmUgfHwgZmFsc2UpO1xuICB9IGVsc2Uge1xuICAgIGVsLmRldGFjaEV2ZW50KCdvbicgKyB0eXBlLCBmbik7XG4gIH1cbiAgcmV0dXJuIGZuO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oYXJyLCBvYmope1xuICBpZiAoYXJyLmluZGV4T2YpIHJldHVybiBhcnIuaW5kZXhPZihvYmopO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7ICsraSkge1xuICAgIGlmIChhcnJbaV0gPT09IG9iaikgcmV0dXJuIGk7XG4gIH1cbiAgcmV0dXJuIC0xO1xufTsiLCJcbi8qKlxuICogdG9TdHJpbmcgcmVmLlxuICovXG5cbnZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbi8qKlxuICogUmV0dXJuIHRoZSB0eXBlIG9mIGB2YWxgLlxuICpcbiAqIEBwYXJhbSB7TWl4ZWR9IHZhbFxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHZhbCl7XG4gIHN3aXRjaCAodG9TdHJpbmcuY2FsbCh2YWwpKSB7XG4gICAgY2FzZSAnW29iamVjdCBGdW5jdGlvbl0nOiByZXR1cm4gJ2Z1bmN0aW9uJztcbiAgICBjYXNlICdbb2JqZWN0IERhdGVdJzogcmV0dXJuICdkYXRlJztcbiAgICBjYXNlICdbb2JqZWN0IFJlZ0V4cF0nOiByZXR1cm4gJ3JlZ2V4cCc7XG4gICAgY2FzZSAnW29iamVjdCBBcmd1bWVudHNdJzogcmV0dXJuICdhcmd1bWVudHMnO1xuICAgIGNhc2UgJ1tvYmplY3QgQXJyYXldJzogcmV0dXJuICdhcnJheSc7XG4gICAgY2FzZSAnW29iamVjdCBTdHJpbmddJzogcmV0dXJuICdzdHJpbmcnO1xuICB9XG5cbiAgaWYgKHZhbCA9PT0gbnVsbCkgcmV0dXJuICdudWxsJztcbiAgaWYgKHZhbCA9PT0gdW5kZWZpbmVkKSByZXR1cm4gJ3VuZGVmaW5lZCc7XG4gIGlmICh2YWwgJiYgdmFsLm5vZGVUeXBlID09PSAxKSByZXR1cm4gJ2VsZW1lbnQnO1xuICBpZiAodmFsID09PSBPYmplY3QodmFsKSkgcmV0dXJuICdvYmplY3QnO1xuXG4gIHJldHVybiB0eXBlb2YgdmFsO1xufTtcbiIsIlxudmFyIFR3ZWVuID0gcmVxdWlyZSgndHdlZW4vYXJyYXknKVxudmFyIGZyYW1lID0gVHdlZW4ucHJvdG90eXBlLmZyYW1lXG52YXIgQ1NTTWF0cml4ID0gV2ViS2l0Q1NTTWF0cml4XG5cbm1vZHVsZS5leHBvcnRzID0gTWF0cml4XG5cbmZ1bmN0aW9uIE1hdHJpeChmcm9tLCB0byl7XG5cdFR3ZWVuLmNhbGwodGhpcywgcGFyc2UoZnJvbSksIHBhcnNlKHRvKSlcbn1cblxuVHdlZW4uZXh0ZW5kKE1hdHJpeCwgJ2ZpbmFsJylcblxuTWF0cml4LnByb3RvdHlwZS5mcmFtZSA9IGZ1bmN0aW9uKHApe1xuXHRyZXR1cm4gJ21hdHJpeCgnICsgZnJhbWUuY2FsbCh0aGlzLCBwKS5tYXAoY2xhbXApLmpvaW4oJywgJykgKyAnKSdcbn1cblxuZnVuY3Rpb24gcGFyc2UobWF0cml4KXtcblx0aWYgKHR5cGVvZiBtYXRyaXggPT0gJ3N0cmluZycpIG1hdHJpeCA9IG5ldyBDU1NNYXRyaXgobWF0cml4KVxuXHRyZXR1cm4gW1xuXHRcdG1hdHJpeC5tMTEsXG5cdFx0bWF0cml4Lm0xMixcblx0XHRtYXRyaXgubTIxLFxuXHRcdG1hdHJpeC5tMjIsXG5cdFx0bWF0cml4Lm00MSxcblx0XHRtYXRyaXgubTQyLFxuXHRdXG59XG5cbmZ1bmN0aW9uIGNsYW1wKG4pe1xuXHRyZXR1cm4gbi50b0ZpeGVkKDYpXG59IiwiXG52YXIgVHdlZW4gPSByZXF1aXJlKCd0d2Vlbi9udW1iZXInKVxuXG5tb2R1bGUuZXhwb3J0cyA9IFR3ZWVuLmV4dGVuZChmdW5jdGlvbiBOdW1iZXIoZnJvbSwgdG8pe1xuXHRUd2Vlbi5jYWxsKHRoaXMsIHBhcnNlKGZyb20pLCBwYXJzZSh0bykpXG59LCAnZmluYWwnKVxuXG5mdW5jdGlvbiBwYXJzZShweCl7XG5cdHJldHVybiBwYXJzZUZsb2F0KHB4LCAxMCkgfHwgMFxufSIsIlxudmFyIFR3ZWVuID0gcmVxdWlyZSgndHdlZW4vYXJyYXknKVxudmFyIGZyYW1lID0gVHdlZW4ucHJvdG90eXBlLmZyYW1lXG52YXIgcmdiYSA9IHJlcXVpcmUoJ2NvbG9yLXBhcnNlcicpXG5cbm1vZHVsZS5leHBvcnRzID0gQ29sb3JcblxuZnVuY3Rpb24gQ29sb3IoZnJvbSwgdG8pe1xuXHRUd2Vlbi5jYWxsKHRoaXMsIHBhcnNlKGZyb20pLCBwYXJzZSh0bykpXG59XG5cblR3ZWVuLmV4dGVuZChDb2xvciwgJ2ZpbmFsJylcblxuQ29sb3IucHJvdG90eXBlLmZyYW1lID0gZnVuY3Rpb24ocHJvZ3Jlc3Mpe1xuXHR2YXIgcmdiID0gZnJhbWUuY2FsbCh0aGlzLCBwcm9ncmVzcykubWFwKHRvSW50KVxuXHRyZXR1cm4gJ3JnYmEoJyArIHJnYi5qb2luKCcsJykgKyAnKSdcbn1cblxuZnVuY3Rpb24gdG9JbnQobil7XG5cdHJldHVybiBuLnRvRml4ZWQoMClcbn1cblxuZnVuY3Rpb24gcGFyc2UoY29sb3Ipe1xuXHRjb2xvciA9IHJnYmEoY29sb3IpXG5cdHJldHVybiBbXG5cdFx0Y29sb3Iucixcblx0XHRjb2xvci5nLFxuXHRcdGNvbG9yLmIsXG5cdFx0Y29sb3IuYSB8fCAxLFxuXHRdXG59IiwiXG52YXIgVHdlZW4gPSByZXF1aXJlKCd0d2Vlbi9udW1iZXInKVxudmFyIGZyYW1lID0gVHdlZW4ucHJvdG90eXBlLmZyYW1lXG5cbm1vZHVsZS5leHBvcnRzID0gUFhcblxuVHdlZW4uZXh0ZW5kKFBYLCAnZmluYWwnKVxuXG5mdW5jdGlvbiBQWChmcm9tLCB0byl7XG5cdFR3ZWVuLmNhbGwodGhpcywgcGFyc2UoZnJvbSksIHBhcnNlKHRvKSlcbn1cblxuUFgucHJvdG90eXBlLmZyYW1lID0gZnVuY3Rpb24ocHJvZ3Jlc3MpIHtcblx0cmV0dXJuIGZyYW1lLmNhbGwodGhpcywgcHJvZ3Jlc3MpLnRvRml4ZWQoMSkgKyAncHgnXG59O1xuXG5mdW5jdGlvbiBwYXJzZShweCl7XG5cdHJldHVybiBwYXJzZUZsb2F0KHB4LCAxMCkgfHwgMFxufSIsIlxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihhLCBiKXtcbiAgdmFyIGZuID0gZnVuY3Rpb24oKXt9O1xuICBmbi5wcm90b3R5cGUgPSBiLnByb3RvdHlwZTtcbiAgYS5wcm90b3R5cGUgPSBuZXcgZm47XG4gIGEucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gYTtcbn07IiwiXG52YXIgVHdlZW4gPSByZXF1aXJlKCcuL3R3ZWVuJylcblxubW9kdWxlLmV4cG9ydHMgPSBBcnJheVR3ZWVuXG5cbmZ1bmN0aW9uIEFycmF5VHdlZW4oZnJvbSwgdG8pe1xuXHR0aGlzLl9mcm9tID0gZnJvbVxuXHR0aGlzLl9jdXJyID0gZnJvbS5zbGljZSgpXG5cdHRoaXMuX3RvID0gdG9cbn1cblxuVHdlZW4uZXh0ZW5kKEFycmF5VHdlZW4pXG5cbkFycmF5VHdlZW4ucHJvdG90eXBlLmZyYW1lID0gZnVuY3Rpb24ocCl7XG5cdHZhciBmcm9tID0gdGhpcy5fZnJvbVxuXHR2YXIgY3VyciA9IHRoaXMuX2N1cnJcblx0dmFyIHRvID0gdGhpcy5fdG9cblx0dmFyIGkgPSB0by5sZW5ndGhcblx0d2hpbGUgKGktLSkge1xuXHRcdGN1cnJbaV0gPSBmcm9tW2ldICsgKHRvW2ldIC0gZnJvbVtpXSkgKiBwXG5cdH1cblx0cmV0dXJuIGN1cnJcbn1cblxuQXJyYXlUd2Vlbi5wcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbigpe1xuXHRUd2Vlbi5wcm90b3R5cGUucmVzZXQuY2FsbCh0aGlzKVxuXHR0aGlzLl9jdXJyID0gW10gLy8gcHJldmVudCBtdXRhdGlvblxuXHRyZXR1cm4gdGhpc1xufSIsIlxudmFyIFR3ZWVuID0gcmVxdWlyZSgnLi90d2VlbicpXG5cbm1vZHVsZS5leHBvcnRzID0gTnVtYmVyVHdlZW5cblxuZnVuY3Rpb24gTnVtYmVyVHdlZW4oZnJvbSwgdG8pe1xuXHR0aGlzLl9kaWZmID0gdG8gLSBmcm9tXG5cdHRoaXMuX2Zyb20gPSBmcm9tXG5cdHRoaXMuX3RvID0gdG9cbn1cblxuVHdlZW4uZXh0ZW5kKE51bWJlclR3ZWVuKVxuXG5OdW1iZXJUd2Vlbi5wcm90b3R5cGUuZnJhbWUgPSBmdW5jdGlvbihwKXtcblx0cmV0dXJuIHRoaXMuX2Zyb20gKyAodGhpcy5fZGlmZiAqIHApXG59XG5cbk51bWJlclR3ZWVuLnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uKCl7XG5cdFR3ZWVuLnByb3RvdHlwZS5yZXNldC5jYWxsKHRoaXMpXG5cdHRoaXMuX2RpZmYgPSB0aGlzLl90byAtIHRoaXMuX2Zyb21cblx0cmV0dXJuIHRoaXNcbn0iXX0=