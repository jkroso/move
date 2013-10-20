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
	this._to[transform] = this.matrix().rotate(0, 0, n)
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

},"/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/master/tweens/number.js": function(module,exports,require){

var Tween = require('tween/number')

module.exports = Tween.extend(function Number(from, to){
	Tween.call(this, parse(from), parse(to))
}, 'final')

function parse(px){
	return parseFloat(px, 10) || 0
}
},"/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/master/tweens/matrix.js": function(module,exports,require){

var Tween = require('tween/object')
var matrix = require('unmatrix')
var decompose = matrix.decompose
var parseString = matrix.parse
var frame = Tween.prototype.frame

module.exports = Matrix

function Matrix(from, to){
	Tween.call(this, parse(from), parse(to))
}

Tween.extend(Matrix, 'final')

Matrix.prototype.frame = function(p){
	return toString(frame.call(this, p))
}

function parse(m){
	if (m == 'none') return identity
	return decompose(typeof m == 'string'
		? parseString(m)
		: [
				m.m11, m.m12,
				m.m21, m.m22,
				m.m41, m.m42,
			])
}

var identity = {
	translateX: 0,
	translateY: 0,
	rotate: 0,
	skew: 0,
	scaleX: 1,
	scaleY: 1
}

function toString(props) {
	var str = ''
	for(var k in props) {
			str += k + '(' + props[k] + unit[k] + ') '
	}
	return str
}

var unit = {
	translateX: 'px',
	translateY: 'px',
	rotate: 'deg',
	skew: 'deg',
	scaleX: '',
	scaleY: ''
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
},"/Users/jkroso/.packin/-/github.com/jkroso/tween/tarball/0.3.2/object.js": function(module,exports,require){

var Tween = require('./tween')

module.exports = ObjectTween

function ObjectTween(from, to){
	this._from = from
	this._curr = {}
	this._to = to
}

Tween.extend(ObjectTween)

ObjectTween.prototype.frame = function(p){
	var from = this._from
	var curr = this._curr
	var to = this._to
	for (var k in to) {
		curr[k] = from[k] + ((to[k] - from[k]) * p)
	}
	return curr
}

ObjectTween.prototype.reset = function(){
	Tween.prototype.reset.call(this)
	this._curr = {} // prevent mutation
	return this
}
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
},"/Users/jkroso/.packin/-/github.com/jkroso/unmatrix/tarball/0.0.1/index.js": function(module,exports,require){
/**
 * Module dependencies
 */

var style = require('computed-style');
var prefix = require('prefix');

/**
 * Expose `unmatrix` and helpers
 */

module.exports = exports = unmatrix;
exports.decompose = decompose;
exports.parse = parse;

/**
 * Unmatrix
 *
 * @param {Element} el
 * @return {Object}
 */

function unmatrix(el) {
  var prop = style(el)[prefix('transform')];
  var matrix = parse(prop);
  return decompose(matrix);
}

/**
 * Unmatrix: parse the values of the matrix
 *
 * Algorithm from:
 *
 * - http://hg.mozilla.org/mozilla-central/file/7cb3e9795d04/layout/style/nsStyleAnimation.cpp
 *
 * @param {Array} m (matrix)
 * @return {Object}
 * @api private
 */

function decompose(m) {
  var A = m[0];
  var B = m[1];
  var C = m[2];
  var D = m[3];
  var determinant = A * D - B * C;

  // step(1)
  if (!determinant) throw new Error('transform#unmatrix: matrix is singular');

  // step (3)
  var scaleX = Math.sqrt(A * A + B * B);
  A /= scaleX;
  B /= scaleX;

  // step (4)
  var skew = A * C + B * D;
  C -= A * skew;
  D -= B * skew;

  // step (5)
  var scaleY = Math.sqrt(C * C + D * D);
  C /= scaleY;
  D /= scaleY;
  skew /= scaleY;

  // step (6)
  if (determinant < 0) {
    A = -A;
    B = -B;
    skew = -skew;
    scaleX = -scaleX;
  }

  return {
    translateX: m[4],
    translateY: m[5],
    rotate: rtod(Math.atan2(B, A)),
    skew: rtod(Math.atan(skew)),
    scaleX: round(scaleX),
    scaleY: round(scaleY)
  };
}

/**
 * String to matrix
 *
 * @param {String} style
 * @return {Array}
 * @api private
 */

function parse(str) {
  var m = str.slice(7).match(/[\d\.\-]+/g);
  if (!m) return [1, 0, 0, 1, 0, 0]
  return m.length == 6
    ? m.map(Number)
    : [
        +m[0] , +m[1],
        +m[4] , +m[5],
        +m[12], +m[13]
      ];
}

/**
 * Radians to degrees
 *
 * @param {Number} radians
 * @return {Number} degrees
 * @api private
 */

function rtod(radians) {
  var deg = radians * 180 / Math.PI;
  return round(deg);
}

/**
 * Round to the nearest hundredth
 *
 * @param {Number} n
 * @return {Number}
 * @api private
 */

function round(n) {
  return Math.round(n * 100) / 100;
}

}},{
  "/Users/jkroso/Dev/js/move/examples.js": "/Users/jkroso/Dev/js/move/examples.original.js",
  "/Users/jkroso/Dev/js/move/node_modules/computed-style/index.js": "/Users/jkroso/.packin/-/github.com/jkroso/computed-style/tarball/0.1.0/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/master/node_modules/computed-style/index.js": "/Users/jkroso/.packin/-/github.com/jkroso/computed-style/tarball/0.1.0/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/unmatrix/tarball/0.0.1/node_modules/computed-style/index.js": "/Users/jkroso/.packin/-/github.com/jkroso/computed-style/tarball/0.1.0/index.js",
  "/Users/jkroso/Dev/js/move/node_modules/move/index.js": "/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/master/index.js",
  "/Users/jkroso/Dev/js/move/node_modules/dom/index.js": "/Users/jkroso/.packin/-/github.com/component/dom/tarball/0.9.0/index.js",
  "/Users/jkroso/Dev/js/move/node_modules/css/index.js": "/Users/jkroso/.packin/-/github.com/component/css/tarball/0.0.2/index.js",
  "/Users/jkroso/.packin/-/github.com/component/dom/tarball/0.9.0/node_modules/css/index.js": "/Users/jkroso/.packin/-/github.com/component/css/tarball/0.0.2/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/master/node_modules/css/index.js": "/Users/jkroso/.packin/-/github.com/component/css/tarball/0.0.2/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/master/node_modules/emitter/light.js": "/Users/jkroso/.packin/-/github.com/jkroso/emitter/tarball/0.9.0/light.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/master/node_modules/tween/tween.js": "/Users/jkroso/.packin/-/github.com/jkroso/tween/tarball/0.3.2/tween.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/master/node_modules/prefix/index.js": "/Users/jkroso/.packin/-/github.com/jkroso/prefix/tarball/0.1.0/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/unmatrix/tarball/0.0.1/node_modules/prefix/index.js": "/Users/jkroso/.packin/-/github.com/jkroso/prefix/tarball/0.1.0/index.js",
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
  "/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/master/node_modules/tween/number.js": "/Users/jkroso/.packin/-/github.com/jkroso/tween/tarball/0.3.2/number.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/master/node_modules/tween/object.js": "/Users/jkroso/.packin/-/github.com/jkroso/tween/tarball/0.3.2/object.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/master/node_modules/tween/array.js": "/Users/jkroso/.packin/-/github.com/jkroso/tween/tarball/0.3.2/array.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/master/node_modules/unmatrix/index.js": "/Users/jkroso/.packin/-/github.com/jkroso/unmatrix/tarball/0.0.1/index.js"
})("/Users/jkroso/Dev/js/move/examples.original.js")
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL1VzZXJzL2prcm9zby9EZXYvanMvbW92ZS9leGFtcGxlcy5vcmlnaW5hbC5qcyIsInNvdXJjZXMiOlsiL25vZGVfbW9kdWxlcy9jc3MtaW5zdGFsbC5qcyIsIi9ub2RlX21vZHVsZXMvamFkZS1ydW50aW1lLmpzIiwiL1VzZXJzL2prcm9zby9EZXYvanMvbW92ZS9leGFtcGxlcy5vcmlnaW5hbC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vamtyb3NvL2NvbXB1dGVkLXN0eWxlL3RhcmJhbGwvMC4xLjAvaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2prcm9zby9tb3ZlL3RhcmJhbGwvbWFzdGVyL2luZGV4LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9jb21wb25lbnQvZG9tL3RhcmJhbGwvMC45LjAvaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2NvbXBvbmVudC9jc3MvdGFyYmFsbC8wLjAuMi9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vamtyb3NvL2VtaXR0ZXIvdGFyYmFsbC8wLjkuMC9saWdodC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vamtyb3NvL3R3ZWVuL3RhcmJhbGwvMC4zLjIvdHdlZW4uanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2prcm9zby9wcmVmaXgvdGFyYmFsbC8wLjEuMC9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vY29tcG9uZW50L21hdGNoZXMtc2VsZWN0b3IvdGFyYmFsbC9tYXN0ZXIvaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2NvbXBvbmVudC9kZWxlZ2F0ZS90YXJiYWxsLzAuMS4wL2luZGV4LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9jb21wb25lbnQvY2xhc3Nlcy90YXJiYWxsLzEuMS4yL2luZGV4LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9jb21wb25lbnQvaW5kZXhvZi90YXJiYWxsLzAuMC4xL2luZGV4LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9jb21wb25lbnQvZG9taWZ5L3RhcmJhbGwvMS4wLjAvaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2NvbXBvbmVudC9ldmVudC90YXJiYWxsLzAuMS4wL2luZGV4LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9jb21wb25lbnQvdmFsdWUvdGFyYmFsbC8xLjEuMC9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vY29tcG9uZW50L3F1ZXJ5L3RhcmJhbGwvMC4wLjEvaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2NvbXBvbmVudC90eXBlL3RhcmJhbGwvMS4wLjAvaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2NvbXBvbmVudC9jb2xvci1wYXJzZXIvdGFyYmFsbC8wLjEuMC9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20veWllbGRzL21lcmdlL3RhcmJhbGwvMS4wLjAvaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2NvbXBvbmVudC9yYWYvdGFyYmFsbC8xLjEuMS9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20veWllbGRzL3RyYXZlcnNlL3RhcmJhbGwvbWFzdGVyL2luZGV4LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9qa3Jvc28vbW92ZS90YXJiYWxsL21hc3Rlci90d2VlbnMvaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2prcm9zby9ub3cvdGFyYmFsbC8wLjEuMS9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20veWllbGRzL2V4dGVuc2libGUvdGFyYmFsbC8wLjEuMC9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vY29tcG9uZW50L2Vhc2UvdGFyYmFsbC8xLjAuMC9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vY29tcG9uZW50L2NvbG9yLXBhcnNlci90YXJiYWxsLzAuMS4wL2NvbG9ycy5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vY29tcG9uZW50L3F1ZXJ5L3RhcmJhbGwvbWFzdGVyL2luZGV4LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9jb21wb25lbnQvZXZlbnQvdGFyYmFsbC9tYXN0ZXIvaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2NvbXBvbmVudC9pbmRleG9mL3RhcmJhbGwvbWFzdGVyL2luZGV4LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9jb21wb25lbnQvdHlwZS90YXJiYWxsL21hc3Rlci9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vamtyb3NvL21vdmUvdGFyYmFsbC9tYXN0ZXIvdHdlZW5zL251bWJlci5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vamtyb3NvL21vdmUvdGFyYmFsbC9tYXN0ZXIvdHdlZW5zL21hdHJpeC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vamtyb3NvL21vdmUvdGFyYmFsbC9tYXN0ZXIvdHdlZW5zL2NvbG9yLmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9qa3Jvc28vbW92ZS90YXJiYWxsL21hc3Rlci90d2VlbnMvcHguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL25hdGhhbjcvaW5oZXJpdC90YXJiYWxsL2YxYTc1YjQ4NDQvaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2prcm9zby90d2Vlbi90YXJiYWxsLzAuMy4yL251bWJlci5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vamtyb3NvL3R3ZWVuL3RhcmJhbGwvMC4zLjIvb2JqZWN0LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9qa3Jvc28vdHdlZW4vdGFyYmFsbC8wLjMuMi9hcnJheS5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vamtyb3NvL3VubWF0cml4L3RhcmJhbGwvMC4wLjEvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUR2TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUVKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xjQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzN5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHRleHQpIHtcblx0dmFyIHN0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKVxuXHRzdHlsZS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh0ZXh0KSlcblx0ZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXS5hcHBlbmRDaGlsZChzdHlsZSlcbn0iLCJcclxuLyohXHJcbiAqIEphZGUgLSBydW50aW1lXHJcbiAqIENvcHlyaWdodChjKSAyMDEwIFRKIEhvbG93YXljaHVrIDx0akB2aXNpb24tbWVkaWEuY2E+XHJcbiAqIE1JVCBMaWNlbnNlZFxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBMYW1lIEFycmF5LmlzQXJyYXkoKSBwb2x5ZmlsbCBmb3Igbm93LlxyXG4gKi9cclxuXHJcbmlmICghQXJyYXkuaXNBcnJheSkge1xyXG4gIEFycmF5LmlzQXJyYXkgPSBmdW5jdGlvbihhcnIpe1xyXG4gICAgcmV0dXJuICdbb2JqZWN0IEFycmF5XScgPT0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGFycik7XHJcbiAgfTtcclxufVxyXG5cclxuLyoqXHJcbiAqIExhbWUgT2JqZWN0LmtleXMoKSBwb2x5ZmlsbCBmb3Igbm93LlxyXG4gKi9cclxuXHJcbmlmICghT2JqZWN0LmtleXMpIHtcclxuICBPYmplY3Qua2V5cyA9IGZ1bmN0aW9uKG9iail7XHJcbiAgICB2YXIgYXJyID0gW107XHJcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XHJcbiAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkoa2V5KSkge1xyXG4gICAgICAgIGFyci5wdXNoKGtleSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBhcnI7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogTWVyZ2UgdHdvIGF0dHJpYnV0ZSBvYmplY3RzIGdpdmluZyBwcmVjZWRlbmNlXHJcbiAqIHRvIHZhbHVlcyBpbiBvYmplY3QgYGJgLiBDbGFzc2VzIGFyZSBzcGVjaWFsLWNhc2VkXHJcbiAqIGFsbG93aW5nIGZvciBhcnJheXMgYW5kIG1lcmdpbmcvam9pbmluZyBhcHByb3ByaWF0ZWx5XHJcbiAqIHJlc3VsdGluZyBpbiBhIHN0cmluZy5cclxuICpcclxuICogQHBhcmFtIHtPYmplY3R9IGFcclxuICogQHBhcmFtIHtPYmplY3R9IGJcclxuICogQHJldHVybiB7T2JqZWN0fSBhXHJcbiAqIEBhcGkgcHJpdmF0ZVxyXG4gKi9cclxuXHJcbmV4cG9ydHMubWVyZ2UgPSBmdW5jdGlvbiBtZXJnZShhLCBiKSB7XHJcbiAgdmFyIGFjID0gYVsnY2xhc3MnXTtcclxuICB2YXIgYmMgPSBiWydjbGFzcyddO1xyXG5cclxuICBpZiAoYWMgfHwgYmMpIHtcclxuICAgIGFjID0gYWMgfHwgW107XHJcbiAgICBiYyA9IGJjIHx8IFtdO1xyXG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGFjKSkgYWMgPSBbYWNdO1xyXG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGJjKSkgYmMgPSBbYmNdO1xyXG4gICAgYVsnY2xhc3MnXSA9IGFjLmNvbmNhdChiYykuZmlsdGVyKG51bGxzKTtcclxuICB9XHJcblxyXG4gIGZvciAodmFyIGtleSBpbiBiKSB7XHJcbiAgICBpZiAoa2V5ICE9ICdjbGFzcycpIHtcclxuICAgICAgYVtrZXldID0gYltrZXldO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGE7XHJcbn07XHJcblxyXG4vKipcclxuICogRmlsdGVyIG51bGwgYHZhbGBzLlxyXG4gKlxyXG4gKiBAcGFyYW0geyp9IHZhbFxyXG4gKiBAcmV0dXJuIHtCb29sZWFufVxyXG4gKiBAYXBpIHByaXZhdGVcclxuICovXHJcblxyXG5mdW5jdGlvbiBudWxscyh2YWwpIHtcclxuICByZXR1cm4gdmFsICE9IG51bGwgJiYgdmFsICE9PSAnJztcclxufVxyXG5cclxuLyoqXHJcbiAqIGpvaW4gYXJyYXkgYXMgY2xhc3Nlcy5cclxuICpcclxuICogQHBhcmFtIHsqfSB2YWxcclxuICogQHJldHVybiB7U3RyaW5nfVxyXG4gKiBAYXBpIHByaXZhdGVcclxuICovXHJcblxyXG5mdW5jdGlvbiBqb2luQ2xhc3Nlcyh2YWwpIHtcclxuICByZXR1cm4gQXJyYXkuaXNBcnJheSh2YWwpID8gdmFsLm1hcChqb2luQ2xhc3NlcykuZmlsdGVyKG51bGxzKS5qb2luKCcgJykgOiB2YWw7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZW5kZXIgdGhlIGdpdmVuIGF0dHJpYnV0ZXMgb2JqZWN0LlxyXG4gKlxyXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBlc2NhcGVkXHJcbiAqIEByZXR1cm4ge1N0cmluZ31cclxuICogQGFwaSBwcml2YXRlXHJcbiAqL1xyXG5cclxuZXhwb3J0cy5hdHRycyA9IGZ1bmN0aW9uIGF0dHJzKG9iaiwgZXNjYXBlZCl7XHJcbiAgdmFyIGJ1ZiA9IFtdXHJcbiAgICAsIHRlcnNlID0gb2JqLnRlcnNlO1xyXG5cclxuICBkZWxldGUgb2JqLnRlcnNlO1xyXG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXMob2JqKVxyXG4gICAgLCBsZW4gPSBrZXlzLmxlbmd0aDtcclxuXHJcbiAgaWYgKGxlbikge1xyXG4gICAgYnVmLnB1c2goJycpO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47ICsraSkge1xyXG4gICAgICB2YXIga2V5ID0ga2V5c1tpXVxyXG4gICAgICAgICwgdmFsID0gb2JqW2tleV07XHJcblxyXG4gICAgICBpZiAoJ2Jvb2xlYW4nID09IHR5cGVvZiB2YWwgfHwgbnVsbCA9PSB2YWwpIHtcclxuICAgICAgICBpZiAodmFsKSB7XHJcbiAgICAgICAgICB0ZXJzZVxyXG4gICAgICAgICAgICA/IGJ1Zi5wdXNoKGtleSlcclxuICAgICAgICAgICAgOiBidWYucHVzaChrZXkgKyAnPVwiJyArIGtleSArICdcIicpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIGlmICgwID09IGtleS5pbmRleE9mKCdkYXRhJykgJiYgJ3N0cmluZycgIT0gdHlwZW9mIHZhbCkge1xyXG4gICAgICAgIGJ1Zi5wdXNoKGtleSArIFwiPSdcIiArIEpTT04uc3RyaW5naWZ5KHZhbCkgKyBcIidcIik7XHJcbiAgICAgIH0gZWxzZSBpZiAoJ2NsYXNzJyA9PSBrZXkpIHtcclxuICAgICAgICBpZiAoZXNjYXBlZCAmJiBlc2NhcGVkW2tleV0pe1xyXG4gICAgICAgICAgaWYgKHZhbCA9IGV4cG9ydHMuZXNjYXBlKGpvaW5DbGFzc2VzKHZhbCkpKSB7XHJcbiAgICAgICAgICAgIGJ1Zi5wdXNoKGtleSArICc9XCInICsgdmFsICsgJ1wiJyk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGlmICh2YWwgPSBqb2luQ2xhc3Nlcyh2YWwpKSB7XHJcbiAgICAgICAgICAgIGJ1Zi5wdXNoKGtleSArICc9XCInICsgdmFsICsgJ1wiJyk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2UgaWYgKGVzY2FwZWQgJiYgZXNjYXBlZFtrZXldKSB7XHJcbiAgICAgICAgYnVmLnB1c2goa2V5ICsgJz1cIicgKyBleHBvcnRzLmVzY2FwZSh2YWwpICsgJ1wiJyk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgYnVmLnB1c2goa2V5ICsgJz1cIicgKyB2YWwgKyAnXCInKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGJ1Zi5qb2luKCcgJyk7XHJcbn07XHJcblxyXG4vKipcclxuICogRXNjYXBlIHRoZSBnaXZlbiBzdHJpbmcgb2YgYGh0bWxgLlxyXG4gKlxyXG4gKiBAcGFyYW0ge1N0cmluZ30gaHRtbFxyXG4gKiBAcmV0dXJuIHtTdHJpbmd9XHJcbiAqIEBhcGkgcHJpdmF0ZVxyXG4gKi9cclxuXHJcbmV4cG9ydHMuZXNjYXBlID0gZnVuY3Rpb24gZXNjYXBlKGh0bWwpe1xyXG4gIHJldHVybiBTdHJpbmcoaHRtbClcclxuICAgIC5yZXBsYWNlKC8mL2csICcmYW1wOycpXHJcbiAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXHJcbiAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpXHJcbiAgICAucmVwbGFjZSgvXCIvZywgJyZxdW90OycpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFJlLXRocm93IHRoZSBnaXZlbiBgZXJyYCBpbiBjb250ZXh0IHRvIHRoZVxyXG4gKiB0aGUgamFkZSBpbiBgZmlsZW5hbWVgIGF0IHRoZSBnaXZlbiBgbGluZW5vYC5cclxuICpcclxuICogQHBhcmFtIHtFcnJvcn0gZXJyXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWxlbmFtZVxyXG4gKiBAcGFyYW0ge1N0cmluZ30gbGluZW5vXHJcbiAqIEBhcGkgcHJpdmF0ZVxyXG4gKi9cclxuXHJcbmV4cG9ydHMucmV0aHJvdyA9IGZ1bmN0aW9uIHJldGhyb3coZXJyLCBmaWxlbmFtZSwgbGluZW5vLCBzdHIpe1xyXG4gIGlmICghKGVyciBpbnN0YW5jZW9mIEVycm9yKSkgdGhyb3cgZXJyO1xyXG4gIGlmICgodHlwZW9mIHdpbmRvdyAhPSAndW5kZWZpbmVkJyB8fCAhZmlsZW5hbWUpICYmICFzdHIpIHtcclxuICAgIGVyci5tZXNzYWdlICs9ICcgb24gbGluZSAnICsgbGluZW5vO1xyXG4gICAgdGhyb3cgZXJyO1xyXG4gIH1cclxuICB0cnkge1xyXG4gICAgc3RyID0gIHN0ciB8fCByZXF1aXJlKCdmcycpLnJlYWRGaWxlU3luYyhmaWxlbmFtZSwgJ3V0ZjgnKVxyXG4gIH0gY2F0Y2ggKGV4KSB7XHJcbiAgICByZXRocm93KGVyciwgbnVsbCwgbGluZW5vKVxyXG4gIH1cclxuICB2YXIgY29udGV4dCA9IDNcclxuICAgICwgbGluZXMgPSBzdHIuc3BsaXQoJ1xcbicpXHJcbiAgICAsIHN0YXJ0ID0gTWF0aC5tYXgobGluZW5vIC0gY29udGV4dCwgMClcclxuICAgICwgZW5kID0gTWF0aC5taW4obGluZXMubGVuZ3RoLCBsaW5lbm8gKyBjb250ZXh0KTtcclxuXHJcbiAgLy8gRXJyb3IgY29udGV4dFxyXG4gIHZhciBjb250ZXh0ID0gbGluZXMuc2xpY2Uoc3RhcnQsIGVuZCkubWFwKGZ1bmN0aW9uKGxpbmUsIGkpe1xyXG4gICAgdmFyIGN1cnIgPSBpICsgc3RhcnQgKyAxO1xyXG4gICAgcmV0dXJuIChjdXJyID09IGxpbmVubyA/ICcgID4gJyA6ICcgICAgJylcclxuICAgICAgKyBjdXJyXHJcbiAgICAgICsgJ3wgJ1xyXG4gICAgICArIGxpbmU7XHJcbiAgfSkuam9pbignXFxuJyk7XHJcblxyXG4gIC8vIEFsdGVyIGV4Y2VwdGlvbiBtZXNzYWdlXHJcbiAgZXJyLnBhdGggPSBmaWxlbmFtZTtcclxuICBlcnIubWVzc2FnZSA9IChmaWxlbmFtZSB8fCAnSmFkZScpICsgJzonICsgbGluZW5vXHJcbiAgICArICdcXG4nICsgY29udGV4dCArICdcXG5cXG4nICsgZXJyLm1lc3NhZ2U7XHJcbiAgdGhyb3cgZXJyO1xyXG59O1xyXG4iLCJcbnZhciBzdHlsZSA9IHJlcXVpcmUoJ2NvbXB1dGVkLXN0eWxlJylcbnZhciBtb3ZlID0gcmVxdWlyZSgnbW92ZScpXG52YXIgZG9tID0gcmVxdWlyZSgnZG9tJylcbnZhciBjc3MgPSByZXF1aXJlKCdjc3MnKVxuXG5kb20oJy5leGFtcGxlJykuZWFjaChmdW5jdGlvbihlbCl7XG5cdGVsLmZpbmQoJ2J1dHRvbi5wbGF5Jykub24oJ21vdXNlZG93bicsIGZ1bmN0aW9uKCl7XG5cdFx0dmFyIGJveHMgPSBlbC5maW5kKCcuYm94LnNtYWxsJylcblx0XHR2YXIgYm94cyA9IFtdLnNsaWNlLmNhbGwoYm94cy5lbHMpXG5cdFx0dmFyIGJveCA9IGJveHNbMF1cblx0XHRldmFsKGVsLmZpbmQoJy5zb3VyY2UnKS50ZXh0KCkpXG5cdH0pXG5cblx0ZWwuZmluZCgnLmJveCcpLmVhY2goZnVuY3Rpb24oYm94KXtcblx0XHRib3ggPSBib3guZ2V0KDApXG5cdFx0Ym94Ll9jc3MgPSB7fVxuXHRcdHZhciBjb21wdXRlZCA9IHN0eWxlKGJveClcblx0XHRmb3IgKHZhciBpID0gMCwgbGVuID0gY29tcHV0ZWQubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcblx0XHRcdHZhciBrZXkgPSBjb21wdXRlZFtpXVxuXHRcdFx0aWYgKGNvbXB1dGVkW2tleV0pIGJveC5fY3NzW2tleV0gPSBjb21wdXRlZFtrZXldXG5cdFx0fVxuXHR9KVxuXG5cdGVsLmZpbmQoJ2gzJylcblx0XHQuYXBwZW5kKCc8YnV0dG9uIGNsYXNzPVwicmVzZXRcIj7ihrs8L2J1dHRvbj4nKVxuXHRcdC5vbignbW91c2Vkb3duJywgZnVuY3Rpb24oZSl7XG5cdFx0XHRlbC5maW5kKCcuYm94JykuZWFjaChmdW5jdGlvbihib3gpe1xuXHRcdFx0XHRib3ggPSBib3guZ2V0KDApXG5cdFx0XHRcdGNzcyhib3gsIGJveC5fY3NzKVxuXHRcdFx0fSlcblx0XHR9KVxufSkiLCJcbi8qKlxuICogR2V0IHRoZSBjb21wdXRlZCBzdHlsZSBvZiBhIERPTSBlbGVtZW50XG4gKiBcbiAqICAgc3R5bGUoZG9jdW1lbnQuYm9keSkgLy8gPT4ge3dpZHRoOic1MDBweCcsIC4uLn1cbiAqIFxuICogQHBhcmFtIHtFbGVtZW50fSBlbGVtZW50XG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cblxuLy8gQWNjZXNzaW5nIHZpYSB3aW5kb3cgZm9yIGpzRE9NIHN1cHBvcnRcbm1vZHVsZS5leHBvcnRzID0gd2luZG93LmdldENvbXB1dGVkU3R5bGVcblxuLy8gRmFsbGJhY2sgdG8gZWxlbS5jdXJyZW50U3R5bGUgZm9yIElFIDwgOVxuaWYgKCFtb2R1bGUuZXhwb3J0cykge1xuXHRtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChlbGVtKSB7XG5cdFx0cmV0dXJuIGVsZW0uY3VycmVudFN0eWxlXG5cdH1cbn1cbiIsIlxudmFyIHBhcnNlQ29sb3IgPSByZXF1aXJlKCdjb2xvci1wYXJzZXInKVxudmFyIEVtaXR0ZXIgPSByZXF1aXJlKCdlbWl0dGVyL2xpZ2h0JylcbnZhciBzdHlsZSA9IHJlcXVpcmUoJ2NvbXB1dGVkLXN0eWxlJylcbnZhciBUd2VlbiA9IHJlcXVpcmUoJ3R3ZWVuL3R3ZWVuJylcbnZhciByZXNldCA9IFR3ZWVuLnByb3RvdHlwZS5yZXNldFxudmFyIHR3ZWVucyA9IHJlcXVpcmUoJy4vdHdlZW5zJylcbnZhciBDU1NNYXRyaXggPSBXZWJLaXRDU1NNYXRyaXhcbnZhciBwcmVmaXggPSByZXF1aXJlKCdwcmVmaXgnKVxudmFyIG1lcmdlID0gcmVxdWlyZSgnbWVyZ2UnKVxudmFyIHJhZiA9IHJlcXVpcmUoJ3JhZicpXG52YXIgY3NzID0gcmVxdWlyZSgnY3NzJylcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihlbCl7XG5cdHJldHVybiBuZXcgTW92ZShlbClcbn1cblxuLyoqXG4gKiAnd2Via2l0VHJhbnNmb3JtJyB8fCAnTW96VHJhbnNmb3JtJyBldGMuLlxuICogQHR5cGUge1N0cmluZ31cbiAqL1xuXG52YXIgdHJhbnNmb3JtID0gcHJlZml4KCd0cmFuc2Zvcm0nKVxuXG4vKipcbiAqIG1hcCBvZiBkZWZhdWx0IHR5cGVzXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5cbnZhciBkZWZhdWx0VHlwZXMgPSB7XG4gIGZpbGxPcGFjaXR5OiAnbnVtYmVyJyxcbiAgZm9udFdlaWdodDogJ251bWJlcicsXG4gIG9wYWNpdHk6ICdudW1iZXInLFxuICB6SW5kZXg6ICdudW1iZXInLFxuICB6b29tOiAnbnVtYmVyJyxcbiAgdHJhbnNmb3JtOiAnbWF0cml4J1xufVxuZGVmYXVsdFR5cGVzW3RyYW5zZm9ybV0gPSAnbWF0cml4J1xuXG5mdW5jdGlvbiBkZWZhdWx0VHlwZShrZXkpe1xuXHRyZXR1cm4gZGVmYXVsdFR5cGVzW2tleV0gfHwgJ3B4J1xufVxuXG4vKipcbiAqIHRoZSBNb3ZlIGNsYXNzXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbFxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBNb3ZlKGVsKXtcblx0dGhpcy5fdG8gPSB7fVxuXHR0aGlzLl9jdXJyID0ge31cblx0dGhpcy5lbCA9IGVsXG59XG5cbi8qKlxuICogbWl4aW4gbWV0aG9kc1xuICovXG5cbm1lcmdlKE1vdmUucHJvdG90eXBlLCBFbWl0dGVyLnByb3RvdHlwZSlcbm1lcmdlKE1vdmUucHJvdG90eXBlLCBUd2Vlbi5wcm90b3R5cGUpXG5tZXJnZShNb3ZlLCBUd2VlbilcblxuLyoqXG4gKiBhZGQgYHByb3BgIHRvIGFuaW1hdGlvbi4gV2hlbiB0aGUgYW5pbWF0aW9uIGlzIHJ1blxuICogYHByb3BgIHdpbGwgYmUgdHdlZW5lZCBmcm9tIGl0cyBjdXJyZW50IHZhbHVlIHRvIGB0b2BcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gcHJvcFxuICogQHBhcmFtIHtDU1N9IHRvXG4gKiBAcmV0dXJuIHt0aGlzfVxuICovXG5cbk1vdmUucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uKHByb3AsIHRvKXtcblx0dGhpcy5fdG9bcHJlZml4KHByb3ApXSA9IHRvXG5cdHJldHVybiB0aGlzXG59XG5cbi8qKlxuICogaW5jcmVtZW50IGBwcm9wYCBieSBgbmBcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gcHJvcFxuICogQHBhcmFtIHtOdW1iZXJ9IHRvXG4gKiBAcmV0dXJuIHt0aGlzfVxuICovXG5cbk1vdmUucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uKHByb3AsIG4pe1xuXHRwcm9wID0gcHJlZml4KHByb3ApXG5cdHZhciBjdXJyID0gcGFyc2VJbnQodGhpcy5jdXJyZW50KHByb3ApLCAxMClcblx0cmV0dXJuIHRoaXMuc2V0KHByb3AsIGN1cnIgKyBuKVxufVxuXG4vKipcbiAqIGRlY3JlbWVudCBgcHJvcGAgYnkgYG5gXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHByb3BcbiAqIEBwYXJhbSB7TnVtYmVyfSB0b1xuICogQHJldHVybiB7dGhpc31cbiAqL1xuXG5Nb3ZlLnByb3RvdHlwZS5zdWIgPSBmdW5jdGlvbihwcm9wLCBuKXtcblx0cHJvcCA9IHByZWZpeChwcm9wKVxuXHR2YXIgY3VyciA9IHBhcnNlSW50KHRoaXMuY3VycmVudChwcm9wKSwgMTApXG5cdHJldHVybiB0aGlzLnNldChwcm9wLCBjdXJyIC0gbilcbn1cblxuLyoqXG4gKiBnZXQgdGhlIGN1cnJlbnQgdmFsdWUgb2YgYHByb3BgXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHByb3BcbiAqIEByZXR1cm4ge0NTU31cbiAqL1xuXG5Nb3ZlLnByb3RvdHlwZS5jdXJyZW50ID0gZnVuY3Rpb24ocHJvcCl7XG5cdHJldHVybiBzdHlsZSh0aGlzLmVsKVtwcm9wXVxufVxuXG4vKipcbiAqIFNrZXcgYHhgIGFuZCBgeWAgZGVncmVlcy5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0geFxuICogQHBhcmFtIHtOdW1iZXJ9IHlcbiAqIEByZXR1cm4ge01vdmV9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5Nb3ZlLnByb3RvdHlwZS5za2V3ID0gZnVuY3Rpb24oeCwgeSl7XG5cdHggJiYgdGhpcy5za2V3WCh4KVxuXHR5ICYmIHRoaXMuc2tld1koeSlcblx0cmV0dXJuIHRoaXNcbn1cblxuLyoqXG4gKiBTa2V3IHggYnkgYG5gIGRlZ3JlZXMuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IG5cbiAqIEByZXR1cm4ge01vdmV9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5Nb3ZlLnByb3RvdHlwZS5za2V3WCA9IGZ1bmN0aW9uKG4pe1xuXHR0aGlzLl90b1t0cmFuc2Zvcm1dID0gdGhpcy5tYXRyaXgoKS5za2V3WChuKVxuXHRyZXR1cm4gdGhpc1xufVxuXG4vKipcbiAqIFNrZXcgeSBieSBgbmAgZGVncmVlcy5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gblxuICogQHJldHVybiB7TW92ZX0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbk1vdmUucHJvdG90eXBlLnNrZXdZID0gZnVuY3Rpb24obil7XG5cdHRoaXMuX3RvW3RyYW5zZm9ybV0gPSB0aGlzLm1hdHJpeCgpLnNrZXdZKG4pXG5cdHJldHVybiB0aGlzXG59XG5cbi8qKlxuICogVHJhbnNsYXRlIGB4YCBhbmQgYHlgIGF4aXMuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IHhcbiAqIEBwYXJhbSB7TnVtYmVyfSB5XG4gKiBAcGFyYW0ge051bWJlcn0gelxuICogQHJldHVybiB7TW92ZX0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbk1vdmUucHJvdG90eXBlLnRyYW5zbGF0ZSA9IGZ1bmN0aW9uKHgsIHksIHope1xuXHR0aGlzLl90b1t0cmFuc2Zvcm1dID0gdGhpcy5tYXRyaXgoKS50cmFuc2xhdGUoeCwgeSwgeiB8fCAwKVxuXHRyZXR1cm4gdGhpc1xufVxuXG5cbi8qKlxuICogVHJhbnNsYXRlIG9uIHRoZSB4IGF4aXMgdG8gYG5gLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBuXG4gKiBAcmV0dXJuIHtNb3ZlfSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuTW92ZS5wcm90b3R5cGUudHJhbnNsYXRlWCA9XG5Nb3ZlLnByb3RvdHlwZS54ID0gZnVuY3Rpb24obil7XG5cdHJldHVybiB0aGlzLnRyYW5zbGF0ZShuLCAwLCAwKVxufVxuXG4vKipcbiAqIFRyYW5zbGF0ZSBvbiB0aGUgeSBheGlzIHRvIGBuYC5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gblxuICogQHJldHVybiB7TW92ZX0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbk1vdmUucHJvdG90eXBlLnRyYW5zbGF0ZVkgPVxuTW92ZS5wcm90b3R5cGUueSA9IGZ1bmN0aW9uKG4pe1xuXHRyZXR1cm4gdGhpcy50cmFuc2xhdGUoMCwgbiwgMClcbn1cblxuLyoqXG4gKiBTY2FsZSB0aGUgeCBhbmQgeSBheGlzIGJ5IGB4YCwgb3JcbiAqIGluZGl2aWR1YWxseSBzY2FsZSBgeGAgYW5kIGB5YC5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0geFxuICogQHBhcmFtIHtOdW1iZXJ9IHlcbiAqIEByZXR1cm4ge01vdmV9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5Nb3ZlLnByb3RvdHlwZS5zY2FsZSA9IGZ1bmN0aW9uKHgsIHkpe1xuXHR0aGlzLl90b1t0cmFuc2Zvcm1dID0gdGhpcy5tYXRyaXgoKS5zY2FsZSh4LCB5LCAxKVxuXHRyZXR1cm4gdGhpc1xufVxuXG4vKipcbiAqIFNjYWxlIHggYXhpcyBieSBgbmAuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IG5cbiAqIEByZXR1cm4ge01vdmV9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5Nb3ZlLnByb3RvdHlwZS5zY2FsZVggPSBmdW5jdGlvbihuKXtcblx0cmV0dXJuIHRoaXMuc2NhbGUobiwgMSwgMSlcbn1cblxuLyoqXG4gKiBTY2FsZSB5IGF4aXMgYnkgYG5gLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBuXG4gKiBAcmV0dXJuIHtNb3ZlfSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuTW92ZS5wcm90b3R5cGUuc2NhbGVZID0gZnVuY3Rpb24obil7XG5cdHJldHVybiB0aGlzLnNjYWxlKDEsIG4sIDEpXG59XG5cbi8qKlxuICogUm90YXRlIGBuYCBkZWdyZWVzLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBuXG4gKiBAcmV0dXJuIHtNb3ZlfSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuTW92ZS5wcm90b3R5cGUucm90YXRlID0gZnVuY3Rpb24obil7XG5cdHRoaXMuX3RvW3RyYW5zZm9ybV0gPSB0aGlzLm1hdHJpeCgpLnJvdGF0ZSgwLCAwLCBuKVxuXHRyZXR1cm4gdGhpc1xufVxuXG4vKipcbiAqIGdldCB0aGUgdHJhbnNmb3JtYXRpb24gbWF0cml4XG4gKlxuICogQHJldHVybiB7Q1NTTWF0cml4fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuTW92ZS5wcm90b3R5cGUubWF0cml4ID0gZnVuY3Rpb24oKXtcblx0aWYgKHRyYW5zZm9ybSBpbiB0aGlzLl90bykgcmV0dXJuIHRoaXMuX3RvW3RyYW5zZm9ybV1cblx0dmFyIG1hdHJpeCA9IHRoaXMuY3VycmVudCh0cmFuc2Zvcm0pXG5cdGlmICh0eXBlb2YgbWF0cml4ID09ICdzdHJpbmcnKSBtYXRyaXggPSBuZXcgQ1NTTWF0cml4KG1hdHJpeClcblx0cmV0dXJuIHRoaXMuX3RvW3RyYW5zZm9ybV0gPSBtYXRyaXhcbn1cblxuLyoqXG4gKiBjcmVhdGUgYSBmcmFtZSBhdCBwb2ludCBgcGAgdGhyb3VnaCB0aGUgYW5pbWF0aW9uXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IHBcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbk1vdmUucHJvdG90eXBlLmZyYW1lID0gZnVuY3Rpb24ocCl7XG5cdHZhciB0d2VlbnMgPSB0aGlzLnR3ZWVucygpXG5cdHZhciBjdXJyID0gdGhpcy5fY3VyclxuXHRmb3IgKHZhciBrIGluIHR3ZWVucykge1xuXHRcdGN1cnJba10gPSB0d2VlbnNba10uZnJhbWUocClcblx0fVxuXHRyZXR1cm4gY3VyclxufVxuXG4vKipcbiAqIEdlbmVyYXRlIHR3ZWVucy4gVGhpcyBzaG91bGQgYmUgY2FsbGVkXG4gKiBhcyBsYXRlIGFzIHBvc3NpYmxlXG4gKlxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuTW92ZS5wcm90b3R5cGUudHdlZW5zID0gZnVuY3Rpb24oKXtcblx0aWYgKHRoaXMuX3R3ZWVucykgcmV0dXJuIHRoaXMuX3R3ZWVuc1xuXHR2YXIgdHdlZW5zID0gdGhpcy5fdHdlZW5zID0ge31cblx0Zm9yICh2YXIga2V5IGluIHRoaXMuX3RvKSB7XG5cdFx0dmFyIGZyb20gPSB0aGlzLmN1cnJlbnQoa2V5KVxuXHRcdHZhciB0byA9IHRoaXMuX3RvW2tleV1cblx0XHR0d2VlbnNba2V5XSA9IHR3ZWVuKGtleSwgZnJvbSwgdG8pXG5cdH1cblx0cmV0dXJuIHR3ZWVuc1xufVxuXG5mdW5jdGlvbiB0d2Vlbihwcm9wLCBmcm9tLCB0byl7XG5cdHZhciBUd2VlbiA9IHR5cGVvZiBmcm9tID09ICdzdHJpbmcnICYmIHR3ZWVuc1t0eXBlKGZyb20pXVxuXHRpZiAoIVR3ZWVuKSBUd2VlbiA9IHR3ZWVuc1tkZWZhdWx0VHlwZShwcm9wKV1cblx0cmV0dXJuIG5ldyBUd2Vlbihmcm9tLCB0bylcbn1cblxuLyoqXG4gKiBkZXRlcm1pbmUgdHlwZSBvZiBgY3NzYCB2YWx1ZVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfE51bWJlcn0gY3NzXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiB0eXBlKGNzcyl7XG5cdGlmICgvXm1hdHJpeCgzZCk/XFwoW14pXSpcXCkkLy50ZXN0KGNzcykpIHJldHVybiAnbWF0cml4J1xuXHRpZiAoL15bLS5cXGRdK3B4Ly50ZXN0KGNzcykpIHJldHVybiAncHgnXG5cdGlmIChwYXJzZUNvbG9yKGNzcykpIHJldHVybiAnY29sb3InXG59XG5cbi8qKlxuICogcmVzZXQgdGhlIGFuaW1hdGlvbiBzbyBpdCBjYW4gYmUgcmUtdXNlZFxuICpcbiAqIEByZXR1cm4ge3RoaXN9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbk1vdmUucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24oKXtcblx0dmFyIHR3ZWVucyA9IHRoaXMudHdlZW5zKClcblx0Zm9yICh2YXIgdHdlZW4gaW4gdHdlZW5zKSB7XG5cdFx0dHdlZW5zW3R3ZWVuXS5yZXNldCgpLmVhc2UodGhpcy5fZWFzZSlcblx0fVxuXHRyZXNldC5jYWxsKHRoaXMpXG5cdHRoaXMuX2N1cnIgPSB7fVxuXHRyZXR1cm4gdGhpc1xufVxuXG4vKipcbiAqIHNldCBkdXJhdGlvbiB0byBgbmAuIGlmIGBuYCBpcyBhIHN0cmluZyBpdFxuICogaXMgYXNzdW1lZCB0byBiZSBpbiBzZWNvbmRzXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ8U3RyaW5nfSBuXG4gKiBAcmV0dXJuIHt0aGlzfVxuICovXG5cbk1vdmUucHJvdG90eXBlLmR1cmF0aW9uID0gZnVuY3Rpb24obil7XG5cdGlmICh0eXBlb2YgbiA9PSAnc3RyaW5nJykgbiA9IHBhcnNlRmxvYXQobikgKiAxMDAwXG5cdHRoaXMuX2R1cmF0aW9uID0gblxuXHRyZXR1cm4gdGhpc1xufVxuXG4vKipcbiAqIENyZWF0ZSBhIGBEZWZlcnJlZE1vdmVgIGluc3RhbmNlIHdoaWNoIHdpbGwgcnVuXG4gKiB3aGVuIGB0aGlzYCBtb3ZlIGNvbXBsZXRlcy4gT3B0aW9uYWxseSB5b3UgY2FuXG4gKiBwYXNzIGluIGEgTW92ZSBpbnN0YW5jZSBpbiB3aGljaCBjYXNlIGl0IHdpbGwgYmVcbiAqIGJlIHJ1biBvbiBjb21wbGV0aW9uIG9mIGB0aGlzYCBhbmltYXRpb24uXG4gKlxuICogQHBhcmFtIHtNb3ZlfSBbbW92ZV1cbiAqIEByZXR1cm4ge3RoaXN8RGVmZXJyZWRNb3ZlfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5Nb3ZlLnByb3RvdHlwZS50aGVuID0gZnVuY3Rpb24obW92ZSl7XG5cdGlmIChtb3ZlKSB7XG5cdFx0dGhpcy5vbignZW5kJywgZnVuY3Rpb24oKXtcblx0XHRcdG1vdmUucnVuKClcblx0XHR9KVxuXHRcdGlmICghdGhpcy5ydW5uaW5nKSB0aGlzLnJ1bigpXG5cdFx0cmV0dXJuIHRoaXNcblx0fVxuXHRtb3ZlID0gbmV3IERlZmVycmVkTW92ZSh0aGlzKVxuXHR0aGlzLnRoZW4obW92ZSlcblx0cmV0dXJuIG1vdmVcbn1cblxuLyoqXG4gKiBjcmVhdGUgYSBzcGVjaWFsaXplZCBzdWItY2xhc3Mgb2YgYE1vdmVgIGZvciB1c2VcbiAqIGluIGB0aGVuKClgXG4gKlxuICogQHBhcmFtIHtNb3ZlfSBwYXJlbnRcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbnZhciBEZWZlcnJlZE1vdmUgPSBNb3ZlLmV4dGVuZChmdW5jdGlvbihwYXJlbnQpe1xuXHRNb3ZlLmNhbGwodGhpcywgcGFyZW50LmVsKVxuXHR0aGlzLl9kdXJhdGlvbiA9IHBhcmVudC5fZHVyYXRpb25cblx0dGhpcy5fZWFzZSA9IHBhcmVudC5fZWFzZVxuXHR0aGlzLnBhcmVudCA9IHBhcmVudFxuXHR0aGlzLnJ1bm5pbmcgPSB0cnVlXG59LCAnZmluYWwnKVxuXG4vKipcbiAqIGNoZWNrIHBhcmVudCB0d2VlbiBpbmNhc2UgYHByb3BgIGlzIGN1cnJlbnRseSBiZWluZ1xuICogYW5pbWF0ZWQuIElmIGl0IGlzIGdldCB0aGUgZmluYWwgZnJhbWVcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gcHJvcFxuICogQHJldHVybiB7Q1NTfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuRGVmZXJyZWRNb3ZlLnByb3RvdHlwZS5jdXJyZW50ID0gZnVuY3Rpb24ocHJvcCl7XG5cdHZhciBwYXJlbnQgPSB0aGlzLnBhcmVudFxuXHR3aGlsZSAocGFyZW50KSB7XG5cdFx0aWYgKHByb3AgaW4gcGFyZW50Ll90bykgcmV0dXJuIHBhcmVudC5fdG9bcHJvcF1cblx0XHRwYXJlbnQgPSBwYXJlbnQucGFyZW50XG5cdH1cblx0cmV0dXJuIHN0eWxlKHRoaXMuZWwpW3Byb3BdXG59XG5cbi8qKlxuICogc3VnYXIgZm9yIGB0aGlzLnBhcmVudGAuIFNvbWV0aW1lcyBsb29rcyBuaWNlciBpblxuICogbG9uZyBjaGFpbnNcbiAqXG4gKiBAcmV0dXJuIHtNb3ZlfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5EZWZlcnJlZE1vdmUucHJvdG90eXBlLnBvcCA9IGZ1bmN0aW9uKCl7XG5cdHJldHVybiB0aGlzLnBhcmVudFxufVxuXG4vKipcbiAqIHJ1biB0aGUgYW5pbWF0aW9uIHdpdGggYW4gb3B0aW9uYWwgY2FsbGJhY2sgb3IgZHVyYXRpb25cbiAqXG4gKiBAcGFyYW0ge051bWJlcnxTdHJpbmd8RnVuY3Rpb259IFtuXVxuICogQHJldHVybiB7dGhpc31cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuTW92ZS5wcm90b3R5cGUuZW5kID1cbk1vdmUucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uKG4pe1xuXHRpZiAobiAhPSBudWxsKSB7XG5cdFx0aWYgKHR5cGVvZiBuID09ICdmdW5jdGlvbicpIHRoaXMub24oJ2VuZCcsIG4pXG5cdFx0ZWxzZSB0aGlzLmR1cmF0aW9uKG4pXG5cdH1cblx0dmFyIHNlbGYgPSB0aGlzXG5cdHJhZihmdW5jdGlvbiBsb29wKCl7XG5cdFx0Y3NzKHNlbGYuZWwsIHNlbGYubmV4dCgpKVxuXHRcdGlmIChzZWxmLmRvbmUpIHNlbGYuZW1pdCgnZW5kJylcblx0XHRlbHNlIHJhZihsb29wKVxuXHR9KVxuXHR0aGlzLnJ1bm5pbmcgPSB0cnVlXG5cdHJlc2V0LmNhbGwodGhpcylcblx0cmV0dXJuIHRoaXNcbn1cblxuTW92ZS5wcm90b3R5cGUub24oJ2VuZCcsIGZ1bmN0aW9uKCl7XG5cdHRoaXMucnVubmluZyA9IGZhbHNlXG59KSIsIi8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL1xuXG52YXIgbWF0Y2hlcyA9IHJlcXVpcmUoJ21hdGNoZXMtc2VsZWN0b3InKTtcbnZhciBkZWxlZ2F0ZSA9IHJlcXVpcmUoJ2RlbGVnYXRlJyk7XG52YXIgY2xhc3NlcyA9IHJlcXVpcmUoJ2NsYXNzZXMnKTtcbnZhciB0cmF2ZXJzZSA9IHJlcXVpcmUoJ3RyYXZlcnNlJyk7XG52YXIgaW5kZXhvZiA9IHJlcXVpcmUoJ2luZGV4b2YnKTtcbnZhciBkb21pZnkgPSByZXF1aXJlKCdkb21pZnknKTtcbnZhciBldmVudHMgPSByZXF1aXJlKCdldmVudCcpO1xudmFyIHZhbHVlID0gcmVxdWlyZSgndmFsdWUnKTtcbnZhciBxdWVyeSA9IHJlcXVpcmUoJ3F1ZXJ5Jyk7XG52YXIgdHlwZSA9IHJlcXVpcmUoJ3R5cGUnKTtcbnZhciBjc3MgPSByZXF1aXJlKCdjc3MnKTtcblxuLyoqXG4gKiBBdHRyaWJ1dGVzIHN1cHBvcnRlZC5cbiAqL1xuXG52YXIgYXR0cnMgPSBbXG4gICdpZCcsXG4gICdzcmMnLFxuICAncmVsJyxcbiAgJ2NvbHMnLFxuICAncm93cycsXG4gICd0eXBlJyxcbiAgJ25hbWUnLFxuICAnaHJlZicsXG4gICd0aXRsZScsXG4gICdzdHlsZScsXG4gICd3aWR0aCcsXG4gICdoZWlnaHQnLFxuICAnYWN0aW9uJyxcbiAgJ21ldGhvZCcsXG4gICd0YWJpbmRleCcsXG4gICdwbGFjZWhvbGRlcidcbl07XG5cbi8qKlxuICogRXhwb3NlIGBkb20oKWAuXG4gKi9cblxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gZG9tO1xuXG4vKipcbiAqIEV4cG9zZSBzdXBwb3J0ZWQgYXR0cnMuXG4gKi9cblxuZXhwb3J0cy5hdHRycyA9IGF0dHJzO1xuXG4vKipcbiAqIFJldHVybiBhIGRvbSBgTGlzdGAgZm9yIHRoZSBnaXZlblxuICogYGh0bWxgLCBzZWxlY3Rvciwgb3IgZWxlbWVudC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xFbGVtZW50fExpc3R9XG4gKiBAcmV0dXJuIHtMaXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBkb20oc2VsZWN0b3IsIGNvbnRleHQpIHtcbiAgLy8gYXJyYXlcbiAgaWYgKEFycmF5LmlzQXJyYXkoc2VsZWN0b3IpKSB7XG4gICAgcmV0dXJuIG5ldyBMaXN0KHNlbGVjdG9yKTtcbiAgfVxuXG4gIC8vIExpc3RcbiAgaWYgKHNlbGVjdG9yIGluc3RhbmNlb2YgTGlzdCkge1xuICAgIHJldHVybiBzZWxlY3RvcjtcbiAgfVxuXG4gIC8vIG5vZGVcbiAgaWYgKHNlbGVjdG9yLm5vZGVOYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBMaXN0KFtzZWxlY3Rvcl0pO1xuICB9XG5cbiAgaWYgKCdzdHJpbmcnICE9IHR5cGVvZiBzZWxlY3Rvcikge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2ludmFsaWQgc2VsZWN0b3InKTtcbiAgfVxuXG4gIC8vIGh0bWxcbiAgaWYgKCc8JyA9PSBzZWxlY3Rvci5jaGFyQXQoMCkpIHtcbiAgICByZXR1cm4gbmV3IExpc3QoW2RvbWlmeShzZWxlY3RvcildLCBzZWxlY3Rvcik7XG4gIH1cblxuICAvLyBzZWxlY3RvclxuICB2YXIgY3R4ID0gY29udGV4dFxuICAgID8gKGNvbnRleHQuZWxzID8gY29udGV4dC5lbHNbMF0gOiBjb250ZXh0KVxuICAgIDogZG9jdW1lbnQ7XG5cbiAgcmV0dXJuIG5ldyBMaXN0KHF1ZXJ5LmFsbChzZWxlY3RvciwgY3R4KSwgc2VsZWN0b3IpO1xufVxuXG4vKipcbiAqIEV4cG9zZSBgTGlzdGAgY29uc3RydWN0b3IuXG4gKi9cblxuZXhwb3J0cy5MaXN0ID0gTGlzdDtcblxuLyoqXG4gKiBJbml0aWFsaXplIGEgbmV3IGBMaXN0YCB3aXRoIHRoZVxuICogZ2l2ZW4gYXJyYXktaXNoIG9mIGBlbHNgIGFuZCBgc2VsZWN0b3JgXG4gKiBzdHJpbmcuXG4gKlxuICogQHBhcmFtIHtNaXhlZH0gZWxzXG4gKiBAcGFyYW0ge1N0cmluZ30gc2VsZWN0b3JcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIExpc3QoZWxzLCBzZWxlY3Rvcikge1xuICB0aGlzLmVscyA9IGVscyB8fCBbXTtcbiAgdGhpcy5zZWxlY3RvciA9IHNlbGVjdG9yO1xufVxuXG4vKipcbiAqIEVudW1lcmFibGUgaXRlcmF0b3IuXG4gKi9cblxuTGlzdC5wcm90b3R5cGUuX19pdGVyYXRlX18gPSBmdW5jdGlvbigpe1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHJldHVybiB7XG4gICAgbGVuZ3RoOiBmdW5jdGlvbigpeyByZXR1cm4gc2VsZi5lbHMubGVuZ3RoIH0sXG4gICAgZ2V0OiBmdW5jdGlvbihpKXsgcmV0dXJuIG5ldyBMaXN0KFtzZWxmLmVsc1tpXV0pIH1cbiAgfVxufTtcblxuLyoqXG4gKiBSZW1vdmUgZWxlbWVudHMgZnJvbSB0aGUgRE9NLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuTGlzdC5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24oKXtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmVscy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBlbCA9IHRoaXMuZWxzW2ldO1xuICAgIHZhciBwYXJlbnQgPSBlbC5wYXJlbnROb2RlO1xuICAgIGlmIChwYXJlbnQpIHBhcmVudC5yZW1vdmVDaGlsZChlbCk7XG4gIH1cbn07XG5cbi8qKlxuICogU2V0IGF0dHJpYnV0ZSBgbmFtZWAgdG8gYHZhbGAsIG9yIGdldCBhdHRyIGBuYW1lYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICogQHBhcmFtIHtTdHJpbmd9IFt2YWxdXG4gKiBAcmV0dXJuIHtTdHJpbmd8TGlzdH0gc2VsZlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5MaXN0LnByb3RvdHlwZS5hdHRyID0gZnVuY3Rpb24obmFtZSwgdmFsKXtcbiAgLy8gZ2V0XG4gIGlmICgxID09IGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICByZXR1cm4gdGhpcy5lbHNbMF0gJiYgdGhpcy5lbHNbMF0uZ2V0QXR0cmlidXRlKG5hbWUpO1xuICB9XG5cbiAgLy8gcmVtb3ZlXG4gIGlmIChudWxsID09IHZhbCkge1xuICAgIHJldHVybiB0aGlzLnJlbW92ZUF0dHIobmFtZSk7XG4gIH1cblxuICAvLyBzZXRcbiAgcmV0dXJuIHRoaXMuZm9yRWFjaChmdW5jdGlvbihlbCl7XG4gICAgZWwuc2V0QXR0cmlidXRlKG5hbWUsIHZhbCk7XG4gIH0pO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgYXR0cmlidXRlIGBuYW1lYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICogQHJldHVybiB7TGlzdH0gc2VsZlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5MaXN0LnByb3RvdHlwZS5yZW1vdmVBdHRyID0gZnVuY3Rpb24obmFtZSl7XG4gIHJldHVybiB0aGlzLmZvckVhY2goZnVuY3Rpb24oZWwpe1xuICAgIGVsLnJlbW92ZUF0dHJpYnV0ZShuYW1lKTtcbiAgfSk7XG59O1xuXG4vKipcbiAqIFNldCBwcm9wZXJ0eSBgbmFtZWAgdG8gYHZhbGAsIG9yIGdldCBwcm9wZXJ0eSBgbmFtZWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAqIEBwYXJhbSB7U3RyaW5nfSBbdmFsXVxuICogQHJldHVybiB7T2JqZWN0fExpc3R9IHNlbGZcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuTGlzdC5wcm90b3R5cGUucHJvcCA9IGZ1bmN0aW9uKG5hbWUsIHZhbCl7XG4gIGlmICgxID09IGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICByZXR1cm4gdGhpcy5lbHNbMF0gJiYgdGhpcy5lbHNbMF1bbmFtZV07XG4gIH1cblxuICByZXR1cm4gdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKGVsKXtcbiAgICBlbFtuYW1lXSA9IHZhbDtcbiAgfSk7XG59O1xuXG4vKipcbiAqIEdldCB0aGUgZmlyc3QgZWxlbWVudCdzIHZhbHVlIG9yIHNldCBzZWxlY3RlZFxuICogZWxlbWVudCB2YWx1ZXMgdG8gYHZhbGAuXG4gKlxuICogQHBhcmFtIHtNaXhlZH0gW3ZhbF1cbiAqIEByZXR1cm4ge01peGVkfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5MaXN0LnByb3RvdHlwZS52YWwgPVxuTGlzdC5wcm90b3R5cGUudmFsdWUgPSBmdW5jdGlvbih2YWwpe1xuICBpZiAoMCA9PSBhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIHRoaXMuZWxzWzBdXG4gICAgICA/IHZhbHVlKHRoaXMuZWxzWzBdKVxuICAgICAgOiB1bmRlZmluZWQ7XG4gIH1cblxuICByZXR1cm4gdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKGVsKXtcbiAgICB2YWx1ZShlbCwgdmFsKTtcbiAgfSk7XG59O1xuXG4vKipcbiAqIFJldHVybiBhIGNsb25lZCBgTGlzdGAgd2l0aCBhbGwgZWxlbWVudHMgY2xvbmVkLlxuICpcbiAqIEByZXR1cm4ge0xpc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkxpc3QucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24oKXtcbiAgdmFyIGFyciA9IFtdO1xuICBmb3IgKHZhciBpID0gMCwgbGVuID0gdGhpcy5lbHMubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcbiAgICBhcnIucHVzaCh0aGlzLmVsc1tpXS5jbG9uZU5vZGUodHJ1ZSkpO1xuICB9XG4gIHJldHVybiBuZXcgTGlzdChhcnIpO1xufTtcblxuLyoqXG4gKiBQcmVwZW5kIGB2YWxgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfEVsZW1lbnR8TGlzdH0gdmFsXG4gKiBAcmV0dXJuIHtMaXN0fSBuZXcgbGlzdFxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5MaXN0LnByb3RvdHlwZS5wcmVwZW5kID0gZnVuY3Rpb24odmFsKXtcbiAgdmFyIGVsID0gdGhpcy5lbHNbMF07XG4gIGlmICghZWwpIHJldHVybiB0aGlzO1xuICB2YWwgPSBkb20odmFsKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB2YWwuZWxzLmxlbmd0aDsgKytpKSB7XG4gICAgaWYgKGVsLmNoaWxkcmVuLmxlbmd0aCkge1xuICAgICAgZWwuaW5zZXJ0QmVmb3JlKHZhbC5lbHNbaV0sIGVsLmZpcnN0Q2hpbGQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBlbC5hcHBlbmRDaGlsZCh2YWwuZWxzW2ldKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHZhbDtcbn07XG5cbi8qKlxuICogQXBwZW5kIGB2YWxgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfEVsZW1lbnR8TGlzdH0gdmFsXG4gKiBAcmV0dXJuIHtMaXN0fSBuZXcgbGlzdFxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5MaXN0LnByb3RvdHlwZS5hcHBlbmQgPSBmdW5jdGlvbih2YWwpe1xuICB2YXIgZWwgPSB0aGlzLmVsc1swXTtcbiAgaWYgKCFlbCkgcmV0dXJuIHRoaXM7XG4gIHZhbCA9IGRvbSh2YWwpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHZhbC5lbHMubGVuZ3RoOyArK2kpIHtcbiAgICBlbC5hcHBlbmRDaGlsZCh2YWwuZWxzW2ldKTtcbiAgfVxuICByZXR1cm4gdmFsO1xufTtcblxuLyoqXG4gKiBBcHBlbmQgc2VsZidzIGBlbGAgdG8gYHZhbGBcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xFbGVtZW50fExpc3R9IHZhbFxuICogQHJldHVybiB7TGlzdH0gc2VsZlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5MaXN0LnByb3RvdHlwZS5hcHBlbmRUbyA9IGZ1bmN0aW9uKHZhbCl7XG4gIGRvbSh2YWwpLmFwcGVuZCh0aGlzKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEluc2VydCBzZWxmJ3MgYGVsc2AgYWZ0ZXIgYHZhbGBcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xFbGVtZW50fExpc3R9IHZhbFxuICogQHJldHVybiB7TGlzdH0gc2VsZlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5MaXN0LnByb3RvdHlwZS5pbnNlcnRBZnRlciA9IGZ1bmN0aW9uKHZhbCl7XG4gIHZhbCA9IGRvbSh2YWwpLmVsc1swXTtcbiAgaWYgKCF2YWwgfHwgIXZhbC5wYXJlbnROb2RlKSByZXR1cm4gdGhpcztcbiAgdGhpcy5lbHMuZm9yRWFjaChmdW5jdGlvbihlbCl7XG4gICAgdmFsLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGVsLCB2YWwubmV4dFNpYmxpbmcpO1xuICB9KTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJldHVybiBhIGBMaXN0YCBjb250YWluaW5nIHRoZSBlbGVtZW50IGF0IGBpYC5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gaVxuICogQHJldHVybiB7TGlzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuTGlzdC5wcm90b3R5cGUuYXQgPSBmdW5jdGlvbihpKXtcbiAgcmV0dXJuIG5ldyBMaXN0KFt0aGlzLmVsc1tpXV0sIHRoaXMuc2VsZWN0b3IpO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gYSBgTGlzdGAgY29udGFpbmluZyB0aGUgZmlyc3QgZWxlbWVudC5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gaVxuICogQHJldHVybiB7TGlzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuTGlzdC5wcm90b3R5cGUuZmlyc3QgPSBmdW5jdGlvbigpe1xuICByZXR1cm4gbmV3IExpc3QoW3RoaXMuZWxzWzBdXSwgdGhpcy5zZWxlY3Rvcik7XG59O1xuXG4vKipcbiAqIFJldHVybiBhIGBMaXN0YCBjb250YWluaW5nIHRoZSBsYXN0IGVsZW1lbnQuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IGlcbiAqIEByZXR1cm4ge0xpc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkxpc3QucHJvdG90eXBlLmxhc3QgPSBmdW5jdGlvbigpe1xuICByZXR1cm4gbmV3IExpc3QoW3RoaXMuZWxzW3RoaXMuZWxzLmxlbmd0aCAtIDFdXSwgdGhpcy5zZWxlY3Rvcik7XG59O1xuXG4vKipcbiAqIFJldHVybiBhbiBgRWxlbWVudGAgYXQgYGlgLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBpXG4gKiBAcmV0dXJuIHtFbGVtZW50fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5MaXN0LnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbihpKXtcbiAgcmV0dXJuIHRoaXMuZWxzW2kgfHwgMF07XG59O1xuXG4vKipcbiAqIFJldHVybiBsaXN0IGxlbmd0aC5cbiAqXG4gKiBAcmV0dXJuIHtOdW1iZXJ9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkxpc3QucHJvdG90eXBlLmxlbmd0aCA9IGZ1bmN0aW9uKCl7XG4gIHJldHVybiB0aGlzLmVscy5sZW5ndGg7XG59O1xuXG4vKipcbiAqIFJldHVybiBlbGVtZW50IHRleHQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7U3RyaW5nfExpc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkxpc3QucHJvdG90eXBlLnRleHQgPSBmdW5jdGlvbihzdHIpe1xuICAvLyBUT0RPOiByZWFsIGltcGxcbiAgaWYgKDEgPT0gYXJndW1lbnRzLmxlbmd0aCkge1xuICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbihlbCl7XG4gICAgICBlbC50ZXh0Q29udGVudCA9IHN0cjtcbiAgICB9KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHZhciBzdHIgPSAnJztcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmVscy5sZW5ndGg7ICsraSkge1xuICAgIHN0ciArPSB0aGlzLmVsc1tpXS50ZXh0Q29udGVudDtcbiAgfVxuICByZXR1cm4gc3RyO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gZWxlbWVudCBodG1sLlxuICpcbiAqIEByZXR1cm4ge1N0cmluZ30gaHRtbFxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5MaXN0LnByb3RvdHlwZS5odG1sID0gZnVuY3Rpb24oaHRtbCl7XG4gIGlmICgxID09IGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24oZWwpe1xuICAgICAgZWwuaW5uZXJIVE1MID0gaHRtbDtcbiAgICB9KTtcbiAgfVxuICAvLyBUT0RPOiByZWFsIGltcGxcbiAgcmV0dXJuIHRoaXMuZWxzWzBdICYmIHRoaXMuZWxzWzBdLmlubmVySFRNTDtcbn07XG5cbi8qKlxuICogQmluZCB0byBgZXZlbnRgIGFuZCBpbnZva2UgYGZuKGUpYC4gV2hlblxuICogYSBgc2VsZWN0b3JgIGlzIGdpdmVuIHRoZW4gZXZlbnRzIGFyZSBkZWxlZ2F0ZWQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge1N0cmluZ30gW3NlbGVjdG9yXVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gY2FwdHVyZVxuICogQHJldHVybiB7TGlzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuTGlzdC5wcm90b3R5cGUub24gPSBmdW5jdGlvbihldmVudCwgc2VsZWN0b3IsIGZuLCBjYXB0dXJlKXtcbiAgaWYgKCdzdHJpbmcnID09IHR5cGVvZiBzZWxlY3Rvcikge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5lbHMubGVuZ3RoOyArK2kpIHtcbiAgICAgIGZuLl9kZWxlZ2F0ZSA9IGRlbGVnYXRlLmJpbmQodGhpcy5lbHNbaV0sIHNlbGVjdG9yLCBldmVudCwgZm4sIGNhcHR1cmUpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGNhcHR1cmUgPSBmbjtcbiAgZm4gPSBzZWxlY3RvcjtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZWxzLmxlbmd0aDsgKytpKSB7XG4gICAgZXZlbnRzLmJpbmQodGhpcy5lbHNbaV0sIGV2ZW50LCBmbiwgY2FwdHVyZSk7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogVW5iaW5kIHRvIGBldmVudGAgYW5kIGludm9rZSBgZm4oZSlgLiBXaGVuXG4gKiBhIGBzZWxlY3RvcmAgaXMgZ2l2ZW4gdGhlbiBkZWxlZ2F0ZWQgZXZlbnRcbiAqIGhhbmRsZXJzIGFyZSB1bmJvdW5kLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHBhcmFtIHtTdHJpbmd9IFtzZWxlY3Rvcl1cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGNhcHR1cmVcbiAqIEByZXR1cm4ge0xpc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkxpc3QucHJvdG90eXBlLm9mZiA9IGZ1bmN0aW9uKGV2ZW50LCBzZWxlY3RvciwgZm4sIGNhcHR1cmUpe1xuICBpZiAoJ3N0cmluZycgPT0gdHlwZW9mIHNlbGVjdG9yKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmVscy5sZW5ndGg7ICsraSkge1xuICAgICAgLy8gVE9ETzogYWRkIHNlbGVjdG9yIHN1cHBvcnQgYmFja1xuICAgICAgZGVsZWdhdGUudW5iaW5kKHRoaXMuZWxzW2ldLCBldmVudCwgZm4uX2RlbGVnYXRlLCBjYXB0dXJlKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBjYXB0dXJlID0gZm47XG4gIGZuID0gc2VsZWN0b3I7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmVscy5sZW5ndGg7ICsraSkge1xuICAgIGV2ZW50cy51bmJpbmQodGhpcy5lbHNbaV0sIGV2ZW50LCBmbiwgY2FwdHVyZSk7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEl0ZXJhdGUgZWxlbWVudHMgYW5kIGludm9rZSBgZm4obGlzdCwgaSlgLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtMaXN0fSBzZWxmXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkxpc3QucHJvdG90eXBlLmVhY2ggPSBmdW5jdGlvbihmbil7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5lbHMubGVuZ3RoOyArK2kpIHtcbiAgICBmbihuZXcgTGlzdChbdGhpcy5lbHNbaV1dLCB0aGlzLnNlbGVjdG9yKSwgaSk7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEl0ZXJhdGUgZWxlbWVudHMgYW5kIGludm9rZSBgZm4oZWwsIGkpYC5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7TGlzdH0gc2VsZlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5MaXN0LnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24oZm4pe1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZWxzLmxlbmd0aDsgKytpKSB7XG4gICAgZm4odGhpcy5lbHNbaV0sIGkpO1xuICB9XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBNYXAgZWxlbWVudHMgaW52b2tpbmcgYGZuKGxpc3QsIGkpYC5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7QXJyYXl9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkxpc3QucHJvdG90eXBlLm1hcCA9IGZ1bmN0aW9uKGZuKXtcbiAgdmFyIGFyciA9IFtdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZWxzLmxlbmd0aDsgKytpKSB7XG4gICAgYXJyLnB1c2goZm4obmV3IExpc3QoW3RoaXMuZWxzW2ldXSwgdGhpcy5zZWxlY3RvciksIGkpKTtcbiAgfVxuICByZXR1cm4gYXJyO1xufTtcblxuLyoqXG4gKiBGaWx0ZXIgZWxlbWVudHMgaW52b2tpbmcgYGZuKGxpc3QsIGkpYCwgcmV0dXJuaW5nXG4gKiBhIG5ldyBgTGlzdGAgb2YgZWxlbWVudHMgd2hlbiBhIHRydXRoeSB2YWx1ZSBpcyByZXR1cm5lZC5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7TGlzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuTGlzdC5wcm90b3R5cGUuc2VsZWN0ID1cbkxpc3QucHJvdG90eXBlLmZpbHRlciA9IGZ1bmN0aW9uKGZuKXtcbiAgdmFyIGVsO1xuICB2YXIgbGlzdCA9IG5ldyBMaXN0KFtdLCB0aGlzLnNlbGVjdG9yKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmVscy5sZW5ndGg7ICsraSkge1xuICAgIGVsID0gdGhpcy5lbHNbaV07XG4gICAgaWYgKGZuKG5ldyBMaXN0KFtlbF0sIHRoaXMuc2VsZWN0b3IpLCBpKSkgbGlzdC5lbHMucHVzaChlbCk7XG4gIH1cbiAgcmV0dXJuIGxpc3Q7XG59O1xuXG4vKipcbiAqIEZpbHRlciBlbGVtZW50cyBpbnZva2luZyBgZm4obGlzdCwgaSlgLCByZXR1cm5pbmdcbiAqIGEgbmV3IGBMaXN0YCBvZiBlbGVtZW50cyB3aGVuIGEgZmFsc2V5IHZhbHVlIGlzIHJldHVybmVkLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtMaXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5MaXN0LnByb3RvdHlwZS5yZWplY3QgPSBmdW5jdGlvbihmbil7XG4gIHZhciBlbDtcbiAgdmFyIGxpc3QgPSBuZXcgTGlzdChbXSwgdGhpcy5zZWxlY3Rvcik7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5lbHMubGVuZ3RoOyArK2kpIHtcbiAgICBlbCA9IHRoaXMuZWxzW2ldO1xuICAgIGlmICghZm4obmV3IExpc3QoW2VsXSwgdGhpcy5zZWxlY3RvciksIGkpKSBsaXN0LmVscy5wdXNoKGVsKTtcbiAgfVxuICByZXR1cm4gbGlzdDtcbn07XG5cbi8qKlxuICogQWRkIHRoZSBnaXZlbiBjbGFzcyBgbmFtZWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAqIEByZXR1cm4ge0xpc3R9IHNlbGZcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuTGlzdC5wcm90b3R5cGUuYWRkQ2xhc3MgPSBmdW5jdGlvbihuYW1lKXtcbiAgdmFyIGVsO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZWxzLmxlbmd0aDsgKytpKSB7XG4gICAgZWwgPSB0aGlzLmVsc1tpXTtcbiAgICBlbC5fY2xhc3NlcyA9IGVsLl9jbGFzc2VzIHx8IGNsYXNzZXMoZWwpO1xuICAgIGVsLl9jbGFzc2VzLmFkZChuYW1lKTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmVtb3ZlIHRoZSBnaXZlbiBjbGFzcyBgbmFtZWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd8UmVnRXhwfSBuYW1lXG4gKiBAcmV0dXJuIHtMaXN0fSBzZWxmXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkxpc3QucHJvdG90eXBlLnJlbW92ZUNsYXNzID0gZnVuY3Rpb24obmFtZSl7XG4gIHZhciBlbDtcblxuICBpZiAoJ3JlZ2V4cCcgPT0gdHlwZShuYW1lKSkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5lbHMubGVuZ3RoOyArK2kpIHtcbiAgICAgIGVsID0gdGhpcy5lbHNbaV07XG4gICAgICBlbC5fY2xhc3NlcyA9IGVsLl9jbGFzc2VzIHx8IGNsYXNzZXMoZWwpO1xuICAgICAgdmFyIGFyciA9IGVsLl9jbGFzc2VzLmFycmF5KCk7XG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGFyci5sZW5ndGg7IGorKykge1xuICAgICAgICBpZiAobmFtZS50ZXN0KGFycltqXSkpIHtcbiAgICAgICAgICBlbC5fY2xhc3Nlcy5yZW1vdmUoYXJyW2pdKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5lbHMubGVuZ3RoOyArK2kpIHtcbiAgICBlbCA9IHRoaXMuZWxzW2ldO1xuICAgIGVsLl9jbGFzc2VzID0gZWwuX2NsYXNzZXMgfHwgY2xhc3NlcyhlbCk7XG4gICAgZWwuX2NsYXNzZXMucmVtb3ZlKG5hbWUpO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFRvZ2dsZSB0aGUgZ2l2ZW4gY2xhc3MgYG5hbWVgLFxuICogb3B0aW9uYWxseSBhIGBib29sYCBtYXkgYmUgZ2l2ZW5cbiAqIHRvIGluZGljYXRlIHRoYXQgdGhlIGNsYXNzIHNob3VsZFxuICogYmUgYWRkZWQgd2hlbiB0cnV0aHkuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gYm9vbFxuICogQHJldHVybiB7TGlzdH0gc2VsZlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5MaXN0LnByb3RvdHlwZS50b2dnbGVDbGFzcyA9IGZ1bmN0aW9uKG5hbWUsIGJvb2wpe1xuICB2YXIgZWw7XG4gIHZhciBmbiA9ICd0b2dnbGUnO1xuXG4gIC8vIHRvZ2dsZSB3aXRoIGJvb2xlYW5cbiAgaWYgKDIgPT0gYXJndW1lbnRzLmxlbmd0aCkge1xuICAgIGZuID0gYm9vbCA/ICdhZGQnIDogJ3JlbW92ZSc7XG4gIH1cblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZWxzLmxlbmd0aDsgKytpKSB7XG4gICAgZWwgPSB0aGlzLmVsc1tpXTtcbiAgICBlbC5fY2xhc3NlcyA9IGVsLl9jbGFzc2VzIHx8IGNsYXNzZXMoZWwpO1xuICAgIGVsLl9jbGFzc2VzW2ZuXShuYW1lKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBDaGVjayBpZiB0aGUgZ2l2ZW4gY2xhc3MgYG5hbWVgIGlzIHByZXNlbnQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkxpc3QucHJvdG90eXBlLmhhc0NsYXNzID0gZnVuY3Rpb24obmFtZSl7XG4gIHZhciBlbDtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmVscy5sZW5ndGg7ICsraSkge1xuICAgIGVsID0gdGhpcy5lbHNbaV07XG4gICAgZWwuX2NsYXNzZXMgPSBlbC5fY2xhc3NlcyB8fCBjbGFzc2VzKGVsKTtcbiAgICBpZiAoZWwuX2NsYXNzZXMuaGFzKG5hbWUpKSByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59O1xuXG4vKipcbiAqIFNldCBDU1MgYHByb3BgIHRvIGB2YWxgIG9yIGdldCBgcHJvcGAgdmFsdWUuXG4gKiBBbHNvIGFjY2VwdHMgYW4gb2JqZWN0IChgcHJvcGA6IGB2YWxgKVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBwcm9wXG4gKiBAcGFyYW0ge01peGVkfSB2YWxcbiAqIEByZXR1cm4ge0xpc3R8U3RyaW5nfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5MaXN0LnByb3RvdHlwZS5jc3MgPSBmdW5jdGlvbihwcm9wLCB2YWwpe1xuICBpZiAoMiA9PSBhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgdmFyIG9iaiA9IHt9O1xuICAgIG9ialtwcm9wXSA9IHZhbDtcbiAgICByZXR1cm4gdGhpcy5zZXRTdHlsZShvYmopO1xuICB9XG5cbiAgaWYgKCdvYmplY3QnID09IHR5cGUocHJvcCkpIHtcbiAgICByZXR1cm4gdGhpcy5zZXRTdHlsZShwcm9wKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzLmdldFN0eWxlKHByb3ApO1xufTtcblxuLyoqXG4gKiBTZXQgQ1NTIGBwcm9wc2AuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHByb3BzXG4gKiBAcmV0dXJuIHtMaXN0fSBzZWxmXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5MaXN0LnByb3RvdHlwZS5zZXRTdHlsZSA9IGZ1bmN0aW9uKHByb3BzKXtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmVscy5sZW5ndGg7ICsraSkge1xuICAgIGNzcyh0aGlzLmVsc1tpXSwgcHJvcHMpO1xuICB9XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBHZXQgQ1NTIGBwcm9wYCB2YWx1ZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gcHJvcFxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuTGlzdC5wcm90b3R5cGUuZ2V0U3R5bGUgPSBmdW5jdGlvbihwcm9wKXtcbiAgdmFyIGVsID0gdGhpcy5lbHNbMF07XG4gIGlmIChlbCkgcmV0dXJuIGVsLnN0eWxlW3Byb3BdO1xufTtcblxuLyoqXG4gKiBGaW5kIGNoaWxkcmVuIG1hdGNoaW5nIHRoZSBnaXZlbiBgc2VsZWN0b3JgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzZWxlY3RvclxuICogQHJldHVybiB7TGlzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuTGlzdC5wcm90b3R5cGUuZmluZCA9IGZ1bmN0aW9uKHNlbGVjdG9yKXtcbiAgcmV0dXJuIGRvbShzZWxlY3RvciwgdGhpcyk7XG59O1xuXG4vKipcbiAqIEVtcHR5IHRoZSBkb20gbGlzdFxuICpcbiAqIEByZXR1cm4gc2VsZlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5MaXN0LnByb3RvdHlwZS5lbXB0eSA9IGZ1bmN0aW9uKCl7XG4gIHZhciBlbGVtLCBlbDtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZWxzLmxlbmd0aDsgKytpKSB7XG4gICAgZWwgPSB0aGlzLmVsc1tpXTtcbiAgICB3aGlsZSAoZWwuZmlyc3RDaGlsZCkge1xuICAgICAgZWwucmVtb3ZlQ2hpbGQoZWwuZmlyc3RDaGlsZCk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59XG5cbi8qKlxuICogQ2hlY2sgaWYgdGhlIGZpcnN0IGVsZW1lbnQgbWF0Y2hlcyBgc2VsZWN0b3JgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzZWxlY3RvclxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuTGlzdC5wcm90b3R5cGUuaXMgPSBmdW5jdGlvbihzZWxlY3Rvcil7XG4gIHJldHVybiBtYXRjaGVzKHRoaXMuZ2V0KDApLCBzZWxlY3Rvcik7XG59O1xuXG4vKipcbiAqIEdldCBwYXJlbnQocykgd2l0aCBvcHRpb25hbCBgc2VsZWN0b3JgIGFuZCBgbGltaXRgXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHNlbGVjdG9yXG4gKiBAcGFyYW0ge051bWJlcn0gbGltaXRcbiAqIEByZXR1cm4ge0xpc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkxpc3QucHJvdG90eXBlLnBhcmVudCA9IGZ1bmN0aW9uKHNlbGVjdG9yLCBsaW1pdCl7XG4gIHJldHVybiBuZXcgTGlzdCh0cmF2ZXJzZSgncGFyZW50Tm9kZScsXG4gICAgdGhpcy5nZXQoMCksXG4gICAgc2VsZWN0b3IsXG4gICAgbGltaXRcbiAgICB8fCAxKSk7XG59O1xuXG4vKipcbiAqIEdldCBuZXh0IGVsZW1lbnQocykgd2l0aCBvcHRpb25hbCBgc2VsZWN0b3JgIGFuZCBgbGltaXRgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzZWxlY3RvclxuICogQHBhcmFtIHtOdW1iZXJ9IGxpbWl0XG4gKiBAcmV0cnVuIHtMaXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5MaXN0LnByb3RvdHlwZS5uZXh0ID0gZnVuY3Rpb24oc2VsZWN0b3IsIGxpbWl0KXtcbiAgcmV0dXJuIG5ldyBMaXN0KHRyYXZlcnNlKCduZXh0U2libGluZycsXG4gICAgdGhpcy5nZXQoMCksXG4gICAgc2VsZWN0b3IsXG4gICAgbGltaXRcbiAgICB8fCAxKSk7XG59O1xuXG4vKipcbiAqIEdldCBwcmV2aW91cyBlbGVtZW50KHMpIHdpdGggb3B0aW9uYWwgYHNlbGVjdG9yYCBhbmQgYGxpbWl0YC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc2VsZWN0b3JcbiAqIEBwYXJhbSB7TnVtYmVyfSBsaW1pdFxuICogQHJldHVybiB7TGlzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuTGlzdC5wcm90b3R5cGUucHJldiA9XG5MaXN0LnByb3RvdHlwZS5wcmV2aW91cyA9IGZ1bmN0aW9uKHNlbGVjdG9yLCBsaW1pdCl7XG4gIHJldHVybiBuZXcgTGlzdCh0cmF2ZXJzZSgncHJldmlvdXNTaWJsaW5nJyxcbiAgICB0aGlzLmdldCgwKSxcbiAgICBzZWxlY3RvcixcbiAgICBsaW1pdFxuICAgIHx8IDEpKTtcbn07XG5cbi8qKlxuICogQXR0cmlidXRlIGFjY2Vzc29ycy5cbiAqL1xuXG5hdHRycy5mb3JFYWNoKGZ1bmN0aW9uKG5hbWUpe1xuICBMaXN0LnByb3RvdHlwZVtuYW1lXSA9IGZ1bmN0aW9uKHZhbCl7XG4gICAgaWYgKDAgPT0gYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHRoaXMuYXR0cihuYW1lKTtcbiAgICByZXR1cm4gdGhpcy5hdHRyKG5hbWUsIHZhbCk7XG4gIH07XG59KTtcblxuIiwiXG4vKipcbiAqIFByb3BlcnRpZXMgdG8gaWdub3JlIGFwcGVuZGluZyBcInB4XCIuXG4gKi9cblxudmFyIGlnbm9yZSA9IHtcbiAgY29sdW1uQ291bnQ6IHRydWUsXG4gIGZpbGxPcGFjaXR5OiB0cnVlLFxuICBmb250V2VpZ2h0OiB0cnVlLFxuICBsaW5lSGVpZ2h0OiB0cnVlLFxuICBvcGFjaXR5OiB0cnVlLFxuICBvcnBoYW5zOiB0cnVlLFxuICB3aWRvd3M6IHRydWUsXG4gIHpJbmRleDogdHJ1ZSxcbiAgem9vbTogdHJ1ZVxufTtcblxuLyoqXG4gKiBTZXQgYGVsYCBjc3MgdmFsdWVzLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEByZXR1cm4ge0VsZW1lbnR9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZWwsIG9iail7XG4gIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICB2YXIgdmFsID0gb2JqW2tleV07XG4gICAgaWYgKCdudW1iZXInID09IHR5cGVvZiB2YWwgJiYgIWlnbm9yZVtrZXldKSB2YWwgKz0gJ3B4JztcbiAgICBlbC5zdHlsZVtrZXldID0gdmFsO1xuICB9XG4gIHJldHVybiBlbDtcbn07XG4iLCJcbi8qKlxuICogQSBoaWdobHkgb3B0aW1pc2VkIGVtaXR0ZXIgaW1wbGVtZW50YXRpb24uIE9wdGltaXNlZCB0byBcbiAqIG1pbmltaXplIGJvdGggbWVtb3J5IGFuZCBDUFUgY29uc3VtcHRpb24uIEl0cyBnb29kIGZvciBcbiAqIGltcGxlbWVudGluZyBzaW1wbGUgYnV0IGhvdCB0aGluZ3MgbGlrZSBzdHJlYW1zLiBcbiAqL1xuXG52YXIgbWl4aW4gPSByZXF1aXJlKCdtZXJnZScpXG52YXIgb3duID0ge30uaGFzT3duUHJvcGVydHlcbnZhciBjYWxsID0gRnVuY3Rpb24uY2FsbFxuXG5tb2R1bGUuZXhwb3J0cyA9IEVtaXR0ZXJcblxuZnVuY3Rpb24gRW1pdHRlcihvYmope1xuXHRpZiAob2JqKSByZXR1cm4gbWl4aW4ob2JqLCBFbWl0dGVyLnByb3RvdHlwZSlcbn1cblxuRW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKHRvcGljKXtcblx0dmFyIHN1YiA9IHRoaXMuX2V2ZW50c1xuXHRpZiAoIShzdWIgJiYgKHN1YiA9IHN1Ylt0b3BpY10pKSkgcmV0dXJuIHRoaXNcblx0Ly8gc2luZ2xlIHN1YnNyaXB0aW9uIGNhc2Vcblx0aWYgKHR5cGVvZiBzdWIgPT0gJ2Z1bmN0aW9uJykge1xuXHRcdC8vIGF2b2lkIHVzaW5nIC5hcHBseSgpIGZvciBzcGVlZFxuXHRcdHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuXHRcdFx0Y2FzZSAxOiBzdWIuY2FsbCh0aGlzKTticmVha1xuXHRcdFx0Y2FzZSAyOiBzdWIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0pO2JyZWFrXG5cdFx0XHRjYXNlIDM6IHN1Yi5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdKTticmVha1xuXHRcdFx0Y2FzZSA0OiBzdWIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSwgYXJndW1lbnRzWzNdKTticmVha1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0Ly8gYGFyZ3VtZW50c2AgaXMgbWFnaWMgOilcblx0XHRcdFx0dG9waWMgPSB0aGlzXG5cdFx0XHRcdGNhbGwuYXBwbHkoc3ViLCBhcmd1bWVudHMpXG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdHZhciDGklxuXHRcdHZhciBpID0gMFxuXHRcdHZhciBsID0gc3ViLmxlbmd0aFxuXHRcdHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuXHRcdFx0Y2FzZSAxOiB3aGlsZSAoaSA8IGwpIHN1YltpKytdLmNhbGwodGhpcyk7YnJlYWtcblx0XHRcdGNhc2UgMjogd2hpbGUgKGkgPCBsKSBzdWJbaSsrXS5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSk7YnJlYWtcblx0XHRcdGNhc2UgMzogd2hpbGUgKGkgPCBsKSBzdWJbaSsrXS5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdKTticmVha1xuXHRcdFx0Y2FzZSA0OiB3aGlsZSAoaSA8IGwpIHN1YltpKytdLmNhbGwodGhpcywgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0sIGFyZ3VtZW50c1szXSk7YnJlYWtcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHRvcGljID0gdGhpc1xuXHRcdFx0XHR3aGlsZSAoaSA8IGwpIGNhbGwuYXBwbHkoc3ViW2krK10sIGFyZ3VtZW50cylcblx0XHR9XG5cdH1cblx0cmV0dXJuIHRoaXNcbn1cblxuRW1pdHRlci5wcm90b3R5cGUub24gPSBmdW5jdGlvbih0b3BpYywgZm4pe1xuXHRpZiAoIW93bi5jYWxsKHRoaXMsICdfZXZlbnRzJykpIHtcblx0XHR0aGlzLl9ldmVudHMgPSBjbG9uZSh0aGlzLl9ldmVudHMpXG5cdH1cblx0dmFyIGV2ZW50cyA9IHRoaXMuX2V2ZW50c1xuXHRpZiAodHlwZW9mIGV2ZW50c1t0b3BpY10gPT0gJ2Z1bmN0aW9uJykge1xuXHRcdGV2ZW50c1t0b3BpY10gPSBbZXZlbnRzW3RvcGljXSwgZm5dXG5cdH0gZWxzZSBpZiAoZXZlbnRzW3RvcGljXSkge1xuXHRcdGV2ZW50c1t0b3BpY10ucHVzaChmbilcblx0fSBlbHNlIHtcblx0XHRldmVudHNbdG9waWNdID0gZm5cblx0fVxuXHRyZXR1cm4gdGhpc1xufVxuXG5mdW5jdGlvbiBjbG9uZShvKXtcblx0dmFyIGMgPSB7fVxuXHRmb3IgKHZhciBrIGluIG8pIHtcblx0XHRjW2tdID0gdHlwZW9mIG9ba10gPT0gJ29iamVjdCdcblx0XHRcdD8gb1trXS5zbGljZSgpXG5cdFx0XHQ6IG9ba11cblx0fVxuXHRyZXR1cm4gY1xufVxuXG5FbWl0dGVyLnByb3RvdHlwZS5vZmYgPSBmdW5jdGlvbih0b3BpYywgZm4pe1xuXHRpZiAoIXRoaXMuX2V2ZW50cykgcmV0dXJuIHRoaXNcblx0aWYgKCFvd24uY2FsbCh0aGlzLCAnX2V2ZW50cycpKSB7XG5cdFx0dGhpcy5fZXZlbnRzID0gY2xvbmUodGhpcy5fZXZlbnRzKVxuXHR9XG5cdHZhciBldmVudHMgPSB0aGlzLl9ldmVudHNcblxuXHRpZiAodG9waWMgPT0gbnVsbCkge1xuXHRcdGZvciAodmFyIGkgaW4gZXZlbnRzKSBkZWxldGUgZXZlbnRzW2ldXG5cdH0gZWxzZSBpZiAoZm4gPT0gbnVsbCkge1xuXHRcdGRlbGV0ZSBldmVudHNbdG9waWNdXG5cdH0gZWxzZSB7XG5cdFx0dmFyIHN1YnMgPSBldmVudHNbdG9waWNdXG5cdFx0aWYgKCFzdWJzKSByZXR1cm4gdGhpc1xuXHRcdGlmICh0eXBlb2Ygc3VicyA9PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRpZiAoc3VicyA9PT0gZm4pIGRlbGV0ZSBldmVudHNbdG9waWNdXG5cdFx0fSBlbHNlIHtcblx0XHRcdHN1YnMgPSBldmVudHNbdG9waWNdID0gc3Vicy5maWx0ZXIoZnVuY3Rpb24oxpIpe1xuXHRcdFx0XHRyZXR1cm4gxpIgIT09IGZuXG5cdFx0XHR9KVxuXHRcdFx0Ly8gdGlkeVxuXHRcdFx0aWYgKHN1YnMubGVuZ3RoID09IDEpIGV2ZW50c1t0b3BpY10gPSBzdWJzWzBdXG5cdFx0XHRlbHNlIGlmICghc3Vicy5sZW5ndGgpIGRlbGV0ZSBldmVudHNbdG9waWNdXG5cdFx0fVxuXHR9XG5cdHJldHVybiB0aGlzXG59XG5cbkVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbih0b3BpYywgZm4pe1xuXHR2YXIgc2VsZiA9IHRoaXNcblx0cmV0dXJuIHRoaXMub24odG9waWMsIGZ1bmN0aW9uIG9uY2UoKSB7XG5cdFx0c2VsZi5vZmYodG9waWMsIG9uY2UpXG5cdFx0Zm4uYXBwbHkodGhpcywgYXJndW1lbnRzKVxuXHR9KVxufVxuXG5FbWl0dGVyLmhhc1N1YnNjcmlwdGlvbiA9IGZ1bmN0aW9uKGVtaXR0ZXIsIHRvcGljLCBmbil7XG5cdHZhciBmbnMgPSBFbWl0dGVyLnN1YnNjcmlwdGlvbnMoZW1pdHRlciwgdG9waWMpXG5cdGlmIChmbiA9PSBudWxsKSByZXR1cm4gQm9vbGVhbihmbnMubGVuZ3RoKVxuXHRyZXR1cm4gZm5zLmluZGV4T2YoZm4pID49IDBcbn1cblxuRW1pdHRlci5zdWJzY3JpcHRpb25zID0gZnVuY3Rpb24oZW1pdHRlciwgdG9waWMpe1xuXHR2YXIgZm5zID0gZW1pdHRlci5fZXZlbnRzXG5cdGlmICghZm5zIHx8ICEoZm5zID0gZm5zW3RvcGljXSkpIHJldHVybiBbXVxuXHRpZiAodHlwZW9mIGZucyA9PSAnZnVuY3Rpb24nKSByZXR1cm4gW2Zuc11cblx0cmV0dXJuIGZucy5zbGljZSgpXG59IiwiXG52YXIgZXh0ZW5zaWJsZSA9IHJlcXVpcmUoJ2V4dGVuc2libGUnKVxudmFyIGVhc2UgPSByZXF1aXJlKCdlYXNlJylcbnZhciBub3cgPSByZXF1aXJlKCdub3cnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IFR3ZWVuXG5cbi8qKlxuICogVHdlZW5pbmcgYmFzZSBjbGFzc1xuICpcbiAqIEBwYXJhbSB7QW55fSBmcm9tXG4gKiBAcGFyYW0ge0FueX0gdG9cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gVHdlZW4oZnJvbSwgdG8pe1xuXHR0aGlzLl9mcm9tID0gZnJvbVxuXHR0aGlzLl90byA9IHRvXG59XG5cbi8qKlxuICogYWRkIGV4dGVuZCBtZXRob2RcbiAqL1xuXG5leHRlbnNpYmxlKFR3ZWVuKVxuXG4vKipcbiAqIGRlZmF1bHQgc2V0dGluZ3NcbiAqL1xuXG5Ud2Vlbi5wcm90b3R5cGUuX2Vhc2UgPSBlYXNlLmxpbmVhclxuVHdlZW4ucHJvdG90eXBlLl9kdXJhdGlvbiA9IDUwMFxuVHdlZW4ucHJvdG90eXBlLmRvbmUgPSBmYWxzZVxuXG4vKipcbiAqIFJlc2V0IHRoZSB0d2VlbnMgdGltZXIgYW5kIHN0YXRlLiBDYWxsIHRoaXMgYmVmb3JlXG4gKiBjYWxsaW5nIGAubmV4dCgpYCBmb3IgdGhlIGZpcnN0IHRpbWVcbiAqXG4gKiAgIHRoaXMucmVzZXQoKVxuICogICB3aGlsZSAoIXRoaXMuZG9uZSkgdGhpcy5uZXh0KClcbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblR3ZWVuLnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uKCl7XG5cdHRoaXMuX3N0YXJ0ID0gbm93KClcblx0dGhpcy5kb25lID0gZmFsc2Vcblx0cmV0dXJuIHRoaXNcbn1cblxuLyoqXG4gKiByZXRhcmdldCB0aGUgdHdlZW4gdG93YXJkcyBgdmFsYC4gYHRoaXMuZnJvbWBcbiAqIHdpbGwgYmUgc2V0IHRvIHRoZSB0d2VlbnMgY3VycmVudCB2YWx1ZSB1bmxlc3NcbiAqIGB0aGlzLl90b2AgaXMgY3VycmVudGx5IGBudWxsYC4gQ2FsbHMgYHJlc2V0KClgXG4gKiBpbnRlcm5hbGx5XG4gKlxuICogICB0d2Vlbi50byh7IHg6IDUwLCB5OiAxMDAgfSlcbiAqXG4gKiBAcGFyYW0ge0FueX0gdmFsXG4gKiBAcmV0dXJuIHt0aGlzfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5Ud2Vlbi5wcm90b3R5cGUudG8gPSBmdW5jdGlvbih2YWwpe1xuXHRpZiAodGhpcy5fdG8gIT0gbnVsbCkge1xuXHRcdHRoaXMuX2Zyb20gPSB0aGlzLmRvbmUgPT09IGZhbHNlXG5cdFx0XHQ/IHRoaXMubmV4dCgpXG5cdFx0XHQ6IHRoaXMuX3RvXG5cdH1cblx0dGhpcy5fdG8gPSB2YWxcblx0dGhpcy5yZXNldCgpXG5cdHJldHVybiB0aGlzXG59XG5cbi8qKlxuICogc2V0IHRoZSBiYXNlIHZhbHVlIHRvIGB2YWxgXG4gKlxuICogQHBhcmFtIHtBbnl9IHZhbFxuICogQHJldHVybiB7dGhpc31cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuVHdlZW4ucHJvdG90eXBlLmZyb20gPSBmdW5jdGlvbih2YWwpe1xuXHR0aGlzLl9mcm9tID0gdmFsXG5cdHJldHVybiB0aGlzXG59XG5cbi8qKlxuICogU2V0IGR1cmF0aW9uIHRvIGBtc2AgWzUwMF0uXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IG1zXG4gKiBAcmV0dXJuIHt0aGlzfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5Ud2Vlbi5wcm90b3R5cGUuZHVyYXRpb24gPSBmdW5jdGlvbihtcyl7XG5cdHRoaXMuX2R1cmF0aW9uID0gbXNcblx0cmV0dXJuIHRoaXNcbn1cblxuLyoqXG4gKiBTZXQgZWFzaW5nIGZ1bmN0aW9uIHRvIGBmbmAuXG4gKlxuICogICB0d2Vlbi5lYXNlKCdpbi1vdXQtc2luZScpXG4gKlxuICogQHBhcmFtIHtTdHJpbmd8RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHt0aGlzfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5Ud2Vlbi5wcm90b3R5cGUuZWFzZSA9IGZ1bmN0aW9uKGZuKXtcblx0aWYgKHR5cGVvZiBmbiA9PSAnc3RyaW5nJykgZm4gPSBlYXNlW2ZuXVxuXHRpZiAoIWZuKSB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgZWFzaW5nIGZ1bmN0aW9uJylcblx0dGhpcy5fZWFzZSA9IGZuXG5cdHJldHVybiB0aGlzXG59XG5cbi8qKlxuICogZ2VuZXJhdGUgdGhlIG5leHQgZnJhbWVcbiAqXG4gKiBAcmV0dXJuIHtBbnl9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblR3ZWVuLnByb3RvdHlwZS5uZXh0ID0gZnVuY3Rpb24oKXtcblx0dmFyIHByb2dyZXNzID0gKG5vdygpIC0gdGhpcy5fc3RhcnQpIC8gdGhpcy5fZHVyYXRpb25cblxuXHRpZiAocHJvZ3Jlc3MgPj0gMSkge1xuXHRcdHRoaXMuZG9uZSA9IHRydWVcblx0XHRyZXR1cm4gdGhpcy5fdG9cblx0fVxuXG5cdHJldHVybiB0aGlzLmZyYW1lKHRoaXMuX2Vhc2UocHJvZ3Jlc3MpKVxufVxuXG4vKipcbiAqIGdlbmVyYXRlIGEgdHdlZW4gZnJhbWUgYXQgcG9pbnQgYHBgIGJldHdlZW5cbiAqIGB0aGlzLl9mcm9tYCBhbmQgYHRoaXMuX3RvYC4gVG8gYmUgZGVmaW5lZCBpblxuICogc3ViLWNsYXNzZXNcbiAqXG4gKiAgIHR3ZWVuKDEsIDMpLmZyYW1lKC41KSAvLyA9PiAyXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IHBlcmNlbnRcbiAqIEByZXR1cm4ge0FueX1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuVHdlZW4ucHJvdG90eXBlLmZyYW1lIiwiXG52YXIgc3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJykuc3R5bGVcbnZhciBwcmVmaXhlcyA9ICdPIG1zIE1veiB3ZWJraXQnLnNwbGl0KCcgJylcblxudmFyIG1lbW8gPSB7fVxuXG4vKipcbiAqIG1lbW9pemVkIGBwcmVmaXhgXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBmdW5jdGlvbihrZXkpe1xuXHRyZXR1cm4ga2V5IGluIG1lbW9cblx0XHQ/IG1lbW9ba2V5XVxuXHRcdDogbWVtb1trZXldID0gcHJlZml4KGtleSlcbn1cblxuZXhwb3J0cy5wcmVmaXggPSBwcmVmaXhcblxuLyoqXG4gKiBwcmVmaXggYGtleWBcbiAqXG4gKiAgIHByZWZpeCgndHJhbnNmb3JtJykgLy8gPT4gd2Via2l0VHJhbnNmb3JtXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBwcmVmaXgoa2V5KXtcblx0Ly8gd2l0aG91dCBwcmVmaXhcblx0aWYgKHN0eWxlW2tleV0gIT09IHVuZGVmaW5lZCkgcmV0dXJuIGtleVxuXG5cdC8vIHdpdGggcHJlZml4XG5cdHZhciBLZXkgPSBjYXBpdGFsaXplKGtleSlcblx0dmFyIGkgPSBwcmVmaXhlcy5sZW5ndGhcblx0d2hpbGUgKGktLSkge1xuXHRcdHZhciBuYW1lID0gcHJlZml4ZXNbaV0gKyBLZXlcblx0XHRpZiAoc3R5bGVbbmFtZV0gIT09IHVuZGVmaW5lZCkgcmV0dXJuIG5hbWVcblx0fVxuXG5cdHRocm93IG5ldyBFcnJvcigndW5hYmxlIHRvIHByZWZpeCAnICsga2V5KVxufVxuXG5mdW5jdGlvbiBjYXBpdGFsaXplKHN0cil7XG5cdHJldHVybiBzdHIuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzdHIuc2xpY2UoMSlcbn0iLCIvKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxudmFyIHF1ZXJ5ID0gcmVxdWlyZSgncXVlcnknKTtcblxuLyoqXG4gKiBFbGVtZW50IHByb3RvdHlwZS5cbiAqL1xuXG52YXIgcHJvdG8gPSBFbGVtZW50LnByb3RvdHlwZTtcblxuLyoqXG4gKiBWZW5kb3IgZnVuY3Rpb24uXG4gKi9cblxudmFyIHZlbmRvciA9IHByb3RvLm1hdGNoZXNTZWxlY3RvclxuICB8fCBwcm90by53ZWJraXRNYXRjaGVzU2VsZWN0b3JcbiAgfHwgcHJvdG8ubW96TWF0Y2hlc1NlbGVjdG9yXG4gIHx8IHByb3RvLm1zTWF0Y2hlc1NlbGVjdG9yXG4gIHx8IHByb3RvLm9NYXRjaGVzU2VsZWN0b3I7XG5cbi8qKlxuICogRXhwb3NlIGBtYXRjaCgpYC5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IG1hdGNoO1xuXG4vKipcbiAqIE1hdGNoIGBlbGAgdG8gYHNlbGVjdG9yYC5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gKiBAcGFyYW0ge1N0cmluZ30gc2VsZWN0b3JcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIG1hdGNoKGVsLCBzZWxlY3Rvcikge1xuICBpZiAodmVuZG9yKSByZXR1cm4gdmVuZG9yLmNhbGwoZWwsIHNlbGVjdG9yKTtcbiAgdmFyIG5vZGVzID0gcXVlcnkuYWxsKHNlbGVjdG9yLCBlbC5wYXJlbnROb2RlKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBub2Rlcy5sZW5ndGg7ICsraSkge1xuICAgIGlmIChub2Rlc1tpXSA9PSBlbCkgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuIiwiXG4vKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxudmFyIG1hdGNoZXMgPSByZXF1aXJlKCdtYXRjaGVzLXNlbGVjdG9yJylcbiAgLCBldmVudCA9IHJlcXVpcmUoJ2V2ZW50Jyk7XG5cbi8qKlxuICogRGVsZWdhdGUgZXZlbnQgYHR5cGVgIHRvIGBzZWxlY3RvcmBcbiAqIGFuZCBpbnZva2UgYGZuKGUpYC4gQSBjYWxsYmFjayBmdW5jdGlvblxuICogaXMgcmV0dXJuZWQgd2hpY2ggbWF5IGJlIHBhc3NlZCB0byBgLnVuYmluZCgpYC5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gKiBAcGFyYW0ge1N0cmluZ30gc2VsZWN0b3JcbiAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHBhcmFtIHtCb29sZWFufSBjYXB0dXJlXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy5iaW5kID0gZnVuY3Rpb24oZWwsIHNlbGVjdG9yLCB0eXBlLCBmbiwgY2FwdHVyZSl7XG4gIHJldHVybiBldmVudC5iaW5kKGVsLCB0eXBlLCBmdW5jdGlvbihlKXtcbiAgICBpZiAobWF0Y2hlcyhlLnRhcmdldCwgc2VsZWN0b3IpKSBmbihlKTtcbiAgfSwgY2FwdHVyZSk7XG4gIHJldHVybiBjYWxsYmFjaztcbn07XG5cbi8qKlxuICogVW5iaW5kIGV2ZW50IGB0eXBlYCdzIGNhbGxiYWNrIGBmbmAuXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbFxuICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGNhcHR1cmVcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy51bmJpbmQgPSBmdW5jdGlvbihlbCwgdHlwZSwgZm4sIGNhcHR1cmUpe1xuICBldmVudC51bmJpbmQoZWwsIHR5cGUsIGZuLCBjYXB0dXJlKTtcbn07XG4iLCJcbi8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL1xuXG52YXIgaW5kZXggPSByZXF1aXJlKCdpbmRleG9mJyk7XG5cbi8qKlxuICogV2hpdGVzcGFjZSByZWdleHAuXG4gKi9cblxudmFyIHJlID0gL1xccysvO1xuXG4vKipcbiAqIHRvU3RyaW5nIHJlZmVyZW5jZS5cbiAqL1xuXG52YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG4vKipcbiAqIFdyYXAgYGVsYCBpbiBhIGBDbGFzc0xpc3RgLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEByZXR1cm4ge0NsYXNzTGlzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihlbCl7XG4gIHJldHVybiBuZXcgQ2xhc3NMaXN0KGVsKTtcbn07XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBhIG5ldyBDbGFzc0xpc3QgZm9yIGBlbGAuXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbFxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gQ2xhc3NMaXN0KGVsKSB7XG4gIHRoaXMuZWwgPSBlbDtcbiAgdGhpcy5saXN0ID0gZWwuY2xhc3NMaXN0O1xufVxuXG4vKipcbiAqIEFkZCBjbGFzcyBgbmFtZWAgaWYgbm90IGFscmVhZHkgcHJlc2VudC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICogQHJldHVybiB7Q2xhc3NMaXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5DbGFzc0xpc3QucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uKG5hbWUpe1xuICAvLyBjbGFzc0xpc3RcbiAgaWYgKHRoaXMubGlzdCkge1xuICAgIHRoaXMubGlzdC5hZGQobmFtZSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyBmYWxsYmFja1xuICB2YXIgYXJyID0gdGhpcy5hcnJheSgpO1xuICB2YXIgaSA9IGluZGV4KGFyciwgbmFtZSk7XG4gIGlmICghfmkpIGFyci5wdXNoKG5hbWUpO1xuICB0aGlzLmVsLmNsYXNzTmFtZSA9IGFyci5qb2luKCcgJyk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgY2xhc3MgYG5hbWVgIHdoZW4gcHJlc2VudCwgb3JcbiAqIHBhc3MgYSByZWd1bGFyIGV4cHJlc3Npb24gdG8gcmVtb3ZlXG4gKiBhbnkgd2hpY2ggbWF0Y2guXG4gKlxuICogQHBhcmFtIHtTdHJpbmd8UmVnRXhwfSBuYW1lXG4gKiBAcmV0dXJuIHtDbGFzc0xpc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkNsYXNzTGlzdC5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24obmFtZSl7XG4gIGlmICgnW29iamVjdCBSZWdFeHBdJyA9PSB0b1N0cmluZy5jYWxsKG5hbWUpKSB7XG4gICAgcmV0dXJuIHRoaXMucmVtb3ZlTWF0Y2hpbmcobmFtZSk7XG4gIH1cblxuICAvLyBjbGFzc0xpc3RcbiAgaWYgKHRoaXMubGlzdCkge1xuICAgIHRoaXMubGlzdC5yZW1vdmUobmFtZSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyBmYWxsYmFja1xuICB2YXIgYXJyID0gdGhpcy5hcnJheSgpO1xuICB2YXIgaSA9IGluZGV4KGFyciwgbmFtZSk7XG4gIGlmICh+aSkgYXJyLnNwbGljZShpLCAxKTtcbiAgdGhpcy5lbC5jbGFzc05hbWUgPSBhcnIuam9pbignICcpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmVtb3ZlIGFsbCBjbGFzc2VzIG1hdGNoaW5nIGByZWAuXG4gKlxuICogQHBhcmFtIHtSZWdFeHB9IHJlXG4gKiBAcmV0dXJuIHtDbGFzc0xpc3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5DbGFzc0xpc3QucHJvdG90eXBlLnJlbW92ZU1hdGNoaW5nID0gZnVuY3Rpb24ocmUpe1xuICB2YXIgYXJyID0gdGhpcy5hcnJheSgpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xuICAgIGlmIChyZS50ZXN0KGFycltpXSkpIHtcbiAgICAgIHRoaXMucmVtb3ZlKGFycltpXSk7XG4gICAgfVxuICB9XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBUb2dnbGUgY2xhc3MgYG5hbWVgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gKiBAcmV0dXJuIHtDbGFzc0xpc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkNsYXNzTGlzdC5wcm90b3R5cGUudG9nZ2xlID0gZnVuY3Rpb24obmFtZSl7XG4gIC8vIGNsYXNzTGlzdFxuICBpZiAodGhpcy5saXN0KSB7XG4gICAgdGhpcy5saXN0LnRvZ2dsZShuYW1lKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIGZhbGxiYWNrXG4gIGlmICh0aGlzLmhhcyhuYW1lKSkge1xuICAgIHRoaXMucmVtb3ZlKG5hbWUpO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuYWRkKG5hbWUpO1xuICB9XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gYW4gYXJyYXkgb2YgY2xhc3Nlcy5cbiAqXG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuQ2xhc3NMaXN0LnByb3RvdHlwZS5hcnJheSA9IGZ1bmN0aW9uKCl7XG4gIHZhciBzdHIgPSB0aGlzLmVsLmNsYXNzTmFtZS5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJyk7XG4gIHZhciBhcnIgPSBzdHIuc3BsaXQocmUpO1xuICBpZiAoJycgPT09IGFyclswXSkgYXJyLnNoaWZ0KCk7XG4gIHJldHVybiBhcnI7XG59O1xuXG4vKipcbiAqIENoZWNrIGlmIGNsYXNzIGBuYW1lYCBpcyBwcmVzZW50LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gKiBAcmV0dXJuIHtDbGFzc0xpc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkNsYXNzTGlzdC5wcm90b3R5cGUuaGFzID1cbkNsYXNzTGlzdC5wcm90b3R5cGUuY29udGFpbnMgPSBmdW5jdGlvbihuYW1lKXtcbiAgcmV0dXJuIHRoaXMubGlzdFxuICAgID8gdGhpcy5saXN0LmNvbnRhaW5zKG5hbWUpXG4gICAgOiAhISB+aW5kZXgodGhpcy5hcnJheSgpLCBuYW1lKTtcbn07XG4iLCJcbnZhciBpbmRleE9mID0gW10uaW5kZXhPZjtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihhcnIsIG9iail7XG4gIGlmIChpbmRleE9mKSByZXR1cm4gYXJyLmluZGV4T2Yob2JqKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyArK2kpIHtcbiAgICBpZiAoYXJyW2ldID09PSBvYmopIHJldHVybiBpO1xuICB9XG4gIHJldHVybiAtMTtcbn07IiwiXG4vKipcbiAqIEV4cG9zZSBgcGFyc2VgLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gcGFyc2U7XG5cbi8qKlxuICogV3JhcCBtYXAgZnJvbSBqcXVlcnkuXG4gKi9cblxudmFyIG1hcCA9IHtcbiAgb3B0aW9uOiBbMSwgJzxzZWxlY3QgbXVsdGlwbGU9XCJtdWx0aXBsZVwiPicsICc8L3NlbGVjdD4nXSxcbiAgb3B0Z3JvdXA6IFsxLCAnPHNlbGVjdCBtdWx0aXBsZT1cIm11bHRpcGxlXCI+JywgJzwvc2VsZWN0PiddLFxuICBsZWdlbmQ6IFsxLCAnPGZpZWxkc2V0PicsICc8L2ZpZWxkc2V0PiddLFxuICB0aGVhZDogWzEsICc8dGFibGU+JywgJzwvdGFibGU+J10sXG4gIHRib2R5OiBbMSwgJzx0YWJsZT4nLCAnPC90YWJsZT4nXSxcbiAgdGZvb3Q6IFsxLCAnPHRhYmxlPicsICc8L3RhYmxlPiddLFxuICBjb2xncm91cDogWzEsICc8dGFibGU+JywgJzwvdGFibGU+J10sXG4gIGNhcHRpb246IFsxLCAnPHRhYmxlPicsICc8L3RhYmxlPiddLFxuICB0cjogWzIsICc8dGFibGU+PHRib2R5PicsICc8L3Rib2R5PjwvdGFibGU+J10sXG4gIHRkOiBbMywgJzx0YWJsZT48dGJvZHk+PHRyPicsICc8L3RyPjwvdGJvZHk+PC90YWJsZT4nXSxcbiAgdGg6IFszLCAnPHRhYmxlPjx0Ym9keT48dHI+JywgJzwvdHI+PC90Ym9keT48L3RhYmxlPiddLFxuICBjb2w6IFsyLCAnPHRhYmxlPjx0Ym9keT48L3Rib2R5Pjxjb2xncm91cD4nLCAnPC9jb2xncm91cD48L3RhYmxlPiddLFxuICBfZGVmYXVsdDogWzAsICcnLCAnJ11cbn07XG5cbi8qKlxuICogUGFyc2UgYGh0bWxgIGFuZCByZXR1cm4gdGhlIGNoaWxkcmVuLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBodG1sXG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHBhcnNlKGh0bWwpIHtcbiAgaWYgKCdzdHJpbmcnICE9IHR5cGVvZiBodG1sKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdTdHJpbmcgZXhwZWN0ZWQnKTtcblxuICAvLyB0YWcgbmFtZVxuICB2YXIgbSA9IC88KFtcXHc6XSspLy5leGVjKGh0bWwpO1xuICBpZiAoIW0pIHRocm93IG5ldyBFcnJvcignTm8gZWxlbWVudHMgd2VyZSBnZW5lcmF0ZWQuJyk7XG4gIHZhciB0YWcgPSBtWzFdO1xuXG4gIC8vIGJvZHkgc3VwcG9ydFxuICBpZiAodGFnID09ICdib2R5Jykge1xuICAgIHZhciBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2h0bWwnKTtcbiAgICBlbC5pbm5lckhUTUwgPSBodG1sO1xuICAgIHJldHVybiBlbC5yZW1vdmVDaGlsZChlbC5sYXN0Q2hpbGQpO1xuICB9XG5cbiAgLy8gd3JhcCBtYXBcbiAgdmFyIHdyYXAgPSBtYXBbdGFnXSB8fCBtYXAuX2RlZmF1bHQ7XG4gIHZhciBkZXB0aCA9IHdyYXBbMF07XG4gIHZhciBwcmVmaXggPSB3cmFwWzFdO1xuICB2YXIgc3VmZml4ID0gd3JhcFsyXTtcbiAgdmFyIGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIGVsLmlubmVySFRNTCA9IHByZWZpeCArIGh0bWwgKyBzdWZmaXg7XG4gIHdoaWxlIChkZXB0aC0tKSBlbCA9IGVsLmxhc3RDaGlsZDtcblxuICB2YXIgZWxzID0gZWwuY2hpbGRyZW47XG4gIGlmICgxID09IGVscy5sZW5ndGgpIHtcbiAgICByZXR1cm4gZWwucmVtb3ZlQ2hpbGQoZWxzWzBdKTtcbiAgfVxuXG4gIHZhciBmcmFnbWVudCA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgd2hpbGUgKGVscy5sZW5ndGgpIHtcbiAgICBmcmFnbWVudC5hcHBlbmRDaGlsZChlbC5yZW1vdmVDaGlsZChlbHNbMF0pKTtcbiAgfVxuXG4gIHJldHVybiBmcmFnbWVudDtcbn1cbiIsIlxuLyoqXG4gKiBCaW5kIGBlbGAgZXZlbnQgYHR5cGVgIHRvIGBmbmAuXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbFxuICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGNhcHR1cmVcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5leHBvcnRzLmJpbmQgPSBmdW5jdGlvbihlbCwgdHlwZSwgZm4sIGNhcHR1cmUpe1xuICBpZiAoZWwuYWRkRXZlbnRMaXN0ZW5lcikge1xuICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgZm4sIGNhcHR1cmUpO1xuICB9IGVsc2Uge1xuICAgIGVsLmF0dGFjaEV2ZW50KCdvbicgKyB0eXBlLCBmbik7XG4gIH1cbiAgcmV0dXJuIGZuO1xufTtcblxuLyoqXG4gKiBVbmJpbmQgYGVsYCBldmVudCBgdHlwZWAncyBjYWxsYmFjayBgZm5gLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHBhcmFtIHtCb29sZWFufSBjYXB0dXJlXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy51bmJpbmQgPSBmdW5jdGlvbihlbCwgdHlwZSwgZm4sIGNhcHR1cmUpe1xuICBpZiAoZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcikge1xuICAgIGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgZm4sIGNhcHR1cmUpO1xuICB9IGVsc2Uge1xuICAgIGVsLmRldGFjaEV2ZW50KCdvbicgKyB0eXBlLCBmbik7XG4gIH1cbiAgcmV0dXJuIGZuO1xufTtcbiIsIlxuLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICovXG5cbnZhciB0eXBlT2YgPSByZXF1aXJlKCd0eXBlJyk7XG5cbi8qKlxuICogU2V0IG9yIGdldCBgZWxgJ3MnIHZhbHVlLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7TWl4ZWR9IHZhbFxuICogQHJldHVybiB7TWl4ZWR9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZWwsIHZhbCl7XG4gIGlmICgyID09IGFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBzZXQoZWwsIHZhbCk7XG4gIHJldHVybiBnZXQoZWwpO1xufTtcblxuLyoqXG4gKiBHZXQgYGVsYCdzIHZhbHVlLlxuICovXG5cbmZ1bmN0aW9uIGdldChlbCkge1xuICBzd2l0Y2ggKHR5cGUoZWwpKSB7XG4gICAgY2FzZSAnY2hlY2tib3gnOlxuICAgIGNhc2UgJ3JhZGlvJzpcbiAgICAgIGlmIChlbC5jaGVja2VkKSB7XG4gICAgICAgIHZhciBhdHRyID0gZWwuZ2V0QXR0cmlidXRlKCd2YWx1ZScpO1xuICAgICAgICByZXR1cm4gbnVsbCA9PSBhdHRyID8gdHJ1ZSA6IGF0dHI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgY2FzZSAncmFkaW9ncm91cCc6XG4gICAgICBmb3IgKHZhciBpID0gMCwgcmFkaW87IHJhZGlvID0gZWxbaV07IGkrKykge1xuICAgICAgICBpZiAocmFkaW8uY2hlY2tlZCkgcmV0dXJuIHJhZGlvLnZhbHVlO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnc2VsZWN0JzpcbiAgICAgIGZvciAodmFyIGkgPSAwLCBvcHRpb247IG9wdGlvbiA9IGVsLm9wdGlvbnNbaV07IGkrKykge1xuICAgICAgICBpZiAob3B0aW9uLnNlbGVjdGVkKSByZXR1cm4gb3B0aW9uLnZhbHVlO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBlbC52YWx1ZTtcbiAgfVxufVxuXG4vKipcbiAqIFNldCBgZWxgJ3MgdmFsdWUuXG4gKi9cblxuZnVuY3Rpb24gc2V0KGVsLCB2YWwpIHtcbiAgc3dpdGNoICh0eXBlKGVsKSkge1xuICAgIGNhc2UgJ2NoZWNrYm94JzpcbiAgICBjYXNlICdyYWRpbyc6XG4gICAgICBpZiAodmFsKSB7XG4gICAgICAgIGVsLmNoZWNrZWQgPSB0cnVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZWwuY2hlY2tlZCA9IGZhbHNlO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAncmFkaW9ncm91cCc6XG4gICAgICBmb3IgKHZhciBpID0gMCwgcmFkaW87IHJhZGlvID0gZWxbaV07IGkrKykge1xuICAgICAgICByYWRpby5jaGVja2VkID0gcmFkaW8udmFsdWUgPT09IHZhbDtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3NlbGVjdCc6XG4gICAgICBmb3IgKHZhciBpID0gMCwgb3B0aW9uOyBvcHRpb24gPSBlbC5vcHRpb25zW2ldOyBpKyspIHtcbiAgICAgICAgb3B0aW9uLnNlbGVjdGVkID0gb3B0aW9uLnZhbHVlID09PSB2YWw7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgZWwudmFsdWUgPSB2YWw7XG4gIH1cbn1cblxuLyoqXG4gKiBFbGVtZW50IHR5cGUuXG4gKi9cblxuZnVuY3Rpb24gdHlwZShlbCkge1xuICB2YXIgZ3JvdXAgPSAnYXJyYXknID09IHR5cGVPZihlbCkgfHwgJ29iamVjdCcgPT0gdHlwZU9mKGVsKTtcbiAgaWYgKGdyb3VwKSBlbCA9IGVsWzBdO1xuICB2YXIgbmFtZSA9IGVsLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCk7XG4gIHZhciB0eXBlID0gZWwuZ2V0QXR0cmlidXRlKCd0eXBlJyk7XG5cbiAgaWYgKGdyb3VwICYmIHR5cGUgJiYgJ3JhZGlvJyA9PSB0eXBlLnRvTG93ZXJDYXNlKCkpIHJldHVybiAncmFkaW9ncm91cCc7XG4gIGlmICgnaW5wdXQnID09IG5hbWUgJiYgdHlwZSAmJiAnY2hlY2tib3gnID09IHR5cGUudG9Mb3dlckNhc2UoKSkgcmV0dXJuICdjaGVja2JveCc7XG4gIGlmICgnaW5wdXQnID09IG5hbWUgJiYgdHlwZSAmJiAncmFkaW8nID09IHR5cGUudG9Mb3dlckNhc2UoKSkgcmV0dXJuICdyYWRpbyc7XG4gIGlmICgnc2VsZWN0JyA9PSBuYW1lKSByZXR1cm4gJ3NlbGVjdCc7XG4gIHJldHVybiBuYW1lO1xufVxuIiwiXG5mdW5jdGlvbiBvbmUoc2VsZWN0b3IsIGVsKSB7XG4gIHJldHVybiBlbC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbn1cblxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc2VsZWN0b3IsIGVsKXtcbiAgZWwgPSBlbCB8fCBkb2N1bWVudDtcbiAgcmV0dXJuIG9uZShzZWxlY3RvciwgZWwpO1xufTtcblxuZXhwb3J0cy5hbGwgPSBmdW5jdGlvbihzZWxlY3RvciwgZWwpe1xuICBlbCA9IGVsIHx8IGRvY3VtZW50O1xuICByZXR1cm4gZWwucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG59O1xuXG5leHBvcnRzLmVuZ2luZSA9IGZ1bmN0aW9uKG9iail7XG4gIGlmICghb2JqLm9uZSkgdGhyb3cgbmV3IEVycm9yKCcub25lIGNhbGxiYWNrIHJlcXVpcmVkJyk7XG4gIGlmICghb2JqLmFsbCkgdGhyb3cgbmV3IEVycm9yKCcuYWxsIGNhbGxiYWNrIHJlcXVpcmVkJyk7XG4gIG9uZSA9IG9iai5vbmU7XG4gIGV4cG9ydHMuYWxsID0gb2JqLmFsbDtcbn07XG4iLCJcbi8qKlxuICogdG9TdHJpbmcgcmVmLlxuICovXG5cbnZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbi8qKlxuICogUmV0dXJuIHRoZSB0eXBlIG9mIGB2YWxgLlxuICpcbiAqIEBwYXJhbSB7TWl4ZWR9IHZhbFxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHZhbCl7XG4gIHN3aXRjaCAodG9TdHJpbmcuY2FsbCh2YWwpKSB7XG4gICAgY2FzZSAnW29iamVjdCBGdW5jdGlvbl0nOiByZXR1cm4gJ2Z1bmN0aW9uJztcbiAgICBjYXNlICdbb2JqZWN0IERhdGVdJzogcmV0dXJuICdkYXRlJztcbiAgICBjYXNlICdbb2JqZWN0IFJlZ0V4cF0nOiByZXR1cm4gJ3JlZ2V4cCc7XG4gICAgY2FzZSAnW29iamVjdCBBcmd1bWVudHNdJzogcmV0dXJuICdhcmd1bWVudHMnO1xuICAgIGNhc2UgJ1tvYmplY3QgQXJyYXldJzogcmV0dXJuICdhcnJheSc7XG4gICAgY2FzZSAnW29iamVjdCBTdHJpbmddJzogcmV0dXJuICdzdHJpbmcnO1xuICB9XG5cbiAgaWYgKHZhbCA9PT0gbnVsbCkgcmV0dXJuICdudWxsJztcbiAgaWYgKHZhbCA9PT0gdW5kZWZpbmVkKSByZXR1cm4gJ3VuZGVmaW5lZCc7XG4gIGlmICh2YWwgJiYgdmFsLm5vZGVUeXBlID09PSAxKSByZXR1cm4gJ2VsZW1lbnQnO1xuICBpZiAodmFsID09PSBPYmplY3QodmFsKSkgcmV0dXJuICdvYmplY3QnO1xuXG4gIHJldHVybiB0eXBlb2YgdmFsO1xufTtcbiIsIlxuLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICovXG5cbnZhciBjb2xvcnMgPSByZXF1aXJlKCcuL2NvbG9ycycpO1xuXG4vKipcbiAqIEV4cG9zZSBgcGFyc2VgLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gcGFyc2U7XG5cbi8qKlxuICogUGFyc2UgYHN0cmAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBwYXJzZShzdHIpIHtcbiAgcmV0dXJuIG5hbWVkKHN0cilcbiAgICB8fCBoZXgzKHN0cilcbiAgICB8fCBoZXg2KHN0cilcbiAgICB8fCByZ2Ioc3RyKVxuICAgIHx8IHJnYmEoc3RyKTtcbn1cblxuLyoqXG4gKiBQYXJzZSBuYW1lZCBjc3MgY29sb3IgYHN0cmAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gbmFtZWQoc3RyKSB7XG4gIHZhciBjID0gY29sb3JzW3N0ci50b0xvd2VyQ2FzZSgpXTtcbiAgaWYgKCFjKSByZXR1cm47XG4gIHJldHVybiB7XG4gICAgcjogY1swXSxcbiAgICBnOiBjWzFdLFxuICAgIGI6IGNbMl1cbiAgfVxufVxuXG4vKipcbiAqIFBhcnNlIHJnYihuLCBuLCBuKVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHJnYihzdHIpIHtcbiAgaWYgKDAgPT0gc3RyLmluZGV4T2YoJ3JnYignKSkge1xuICAgIHN0ciA9IHN0ci5tYXRjaCgvcmdiXFwoKFteKV0rKVxcKS8pWzFdO1xuICAgIHZhciBwYXJ0cyA9IHN0ci5zcGxpdCgvICosICovKS5tYXAoTnVtYmVyKTtcbiAgICByZXR1cm4ge1xuICAgICAgcjogcGFydHNbMF0sXG4gICAgICBnOiBwYXJ0c1sxXSxcbiAgICAgIGI6IHBhcnRzWzJdLFxuICAgICAgYTogMVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIFBhcnNlIHJnYmEobiwgbiwgbiwgbilcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiByZ2JhKHN0cikge1xuICBpZiAoMCA9PSBzdHIuaW5kZXhPZigncmdiYSgnKSkge1xuICAgIHN0ciA9IHN0ci5tYXRjaCgvcmdiYVxcKChbXildKylcXCkvKVsxXTtcbiAgICB2YXIgcGFydHMgPSBzdHIuc3BsaXQoLyAqLCAqLykubWFwKE51bWJlcik7XG4gICAgcmV0dXJuIHtcbiAgICAgIHI6IHBhcnRzWzBdLFxuICAgICAgZzogcGFydHNbMV0sXG4gICAgICBiOiBwYXJ0c1syXSxcbiAgICAgIGE6IHBhcnRzWzNdXG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogUGFyc2UgI25ubm5ublxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGhleDYoc3RyKSB7XG4gIGlmICgnIycgPT0gc3RyWzBdICYmIDcgPT0gc3RyLmxlbmd0aCkge1xuICAgIHJldHVybiB7XG4gICAgICByOiBwYXJzZUludChzdHIuc2xpY2UoMSwgMyksIDE2KSxcbiAgICAgIGc6IHBhcnNlSW50KHN0ci5zbGljZSgzLCA1KSwgMTYpLFxuICAgICAgYjogcGFyc2VJbnQoc3RyLnNsaWNlKDUsIDcpLCAxNiksXG4gICAgICBhOiAxXG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogUGFyc2UgI25ublxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGhleDMoc3RyKSB7XG4gIGlmICgnIycgPT0gc3RyWzBdICYmIDQgPT0gc3RyLmxlbmd0aCkge1xuICAgIHJldHVybiB7XG4gICAgICByOiBwYXJzZUludChzdHJbMV0gKyBzdHJbMV0sIDE2KSxcbiAgICAgIGc6IHBhcnNlSW50KHN0clsyXSArIHN0clsyXSwgMTYpLFxuICAgICAgYjogcGFyc2VJbnQoc3RyWzNdICsgc3RyWzNdLCAxNiksXG4gICAgICBhOiAxXG4gICAgfVxuICB9XG59XG5cbiIsIlxuLyoqXG4gKiBtZXJnZSBgYmAncyBwcm9wZXJ0aWVzIHdpdGggYGFgJ3MuXG4gKlxuICogZXhhbXBsZTpcbiAqXG4gKiAgICAgICAgdmFyIHVzZXIgPSB7fTtcbiAqICAgICAgICBtZXJnZSh1c2VyLCBjb25zb2xlKTtcbiAqICAgICAgICAvLyA+IHsgbG9nOiBmbiwgZGlyOiBmbiAuLn1cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gYVxuICogQHBhcmFtIHtPYmplY3R9IGJcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChhLCBiKSB7XG4gIGZvciAodmFyIGsgaW4gYikgYVtrXSA9IGJba107XG4gIHJldHVybiBhO1xufTtcbiIsIlxuLyoqXG4gKiBFeHBvc2UgYHJlcXVlc3RBbmltYXRpb25GcmFtZSgpYC5cbiAqL1xuXG5leHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lXG4gIHx8IHdpbmRvdy53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWVcbiAgfHwgd2luZG93Lm1velJlcXVlc3RBbmltYXRpb25GcmFtZVxuICB8fCB3aW5kb3cub1JlcXVlc3RBbmltYXRpb25GcmFtZVxuICB8fCB3aW5kb3cubXNSZXF1ZXN0QW5pbWF0aW9uRnJhbWVcbiAgfHwgZmFsbGJhY2s7XG5cbi8qKlxuICogRmFsbGJhY2sgaW1wbGVtZW50YXRpb24uXG4gKi9cblxudmFyIHByZXYgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbmZ1bmN0aW9uIGZhbGxiYWNrKGZuKSB7XG4gIHZhciBjdXJyID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gIHZhciBtcyA9IE1hdGgubWF4KDAsIDE2IC0gKGN1cnIgLSBwcmV2KSk7XG4gIHNldFRpbWVvdXQoZm4sIG1zKTtcbiAgcHJldiA9IGN1cnI7XG59XG5cbi8qKlxuICogQ2FuY2VsLlxuICovXG5cbnZhciBjYW5jZWwgPSB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWVcbiAgfHwgd2luZG93LndlYmtpdENhbmNlbEFuaW1hdGlvbkZyYW1lXG4gIHx8IHdpbmRvdy5tb3pDYW5jZWxBbmltYXRpb25GcmFtZVxuICB8fCB3aW5kb3cub0NhbmNlbEFuaW1hdGlvbkZyYW1lXG4gIHx8IHdpbmRvdy5tc0NhbmNlbEFuaW1hdGlvbkZyYW1lO1xuXG5leHBvcnRzLmNhbmNlbCA9IGZ1bmN0aW9uKGlkKXtcbiAgY2FuY2VsLmNhbGwod2luZG93LCBpZCk7XG59O1xuIiwiXG4vKipcbiAqIGRlcGVuZGVuY2llc1xuICovXG5cbnZhciBtYXRjaGVzID0gcmVxdWlyZSgnbWF0Y2hlcy1zZWxlY3RvcicpO1xuXG4vKipcbiAqIFRyYXZlcnNlIHdpdGggdGhlIGdpdmVuIGBlbGAsIGBzZWxlY3RvcmAgYW5kIGBsZW5gLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gKiBAcGFyYW0ge1N0cmluZ30gc2VsZWN0b3JcbiAqIEBwYXJhbSB7TnVtYmVyfSBsZW5cbiAqIEByZXR1cm4ge0FycmF5fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHR5cGUsIGVsLCBzZWxlY3RvciwgbGVuKXtcbiAgdmFyIGVsID0gZWxbdHlwZV1cbiAgICAsIG4gPSBsZW4gfHwgMVxuICAgICwgcmV0ID0gW107XG5cbiAgaWYgKCFlbCkgcmV0dXJuIHJldDtcblxuICBkbyB7XG4gICAgaWYgKG4gPT0gcmV0Lmxlbmd0aCkgYnJlYWs7XG4gICAgaWYgKDEgIT0gZWwubm9kZVR5cGUpIGNvbnRpbnVlO1xuICAgIGlmIChtYXRjaGVzKGVsLCBzZWxlY3RvcikpIHJldC5wdXNoKGVsKTtcbiAgICBpZiAoIXNlbGVjdG9yKSByZXQucHVzaChlbCk7XG4gIH0gd2hpbGUgKGVsID0gZWxbdHlwZV0pO1xuXG4gIHJldHVybiByZXQ7XG59XG4iLCJleHBvcnRzLm51bWJlciA9IHJlcXVpcmUoJy4vbnVtYmVyJylcbmV4cG9ydHMubWF0cml4ID0gcmVxdWlyZSgnLi9tYXRyaXgnKVxuZXhwb3J0cy5jb2xvciA9IHJlcXVpcmUoJy4vY29sb3InKVxuZXhwb3J0cy5weCA9IHJlcXVpcmUoJy4vcHgnKSIsIlxudmFyIGdsb2JhbCA9IGZ1bmN0aW9uKCl7cmV0dXJuIHRoaXN9KClcbnZhciBwZXJmb3JtYW5jZSA9IGdsb2JhbC5wZXJmb3JtYW5jZVxuXG4vKipcbiAqIEdldCBhIHRpbWVzdGFtcFxuICogXG4gKiBAcmV0dXJuIHtOdW1iZXJ9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKXtcbiAgcmV0dXJuIHBlcmZvcm1hbmNlLm5vdygpXG59XG5cbi8vIGZhbGxiYWNrXG5cbmlmICghcGVyZm9ybWFuY2UgfHwgdHlwZW9mIHBlcmZvcm1hbmNlLm5vdyAhPSAnZnVuY3Rpb24nKSB7XG5cdG1vZHVsZS5leHBvcnRzID0gRGF0ZS5ub3cgfHwgZnVuY3Rpb24oKXsgcmV0dXJuICsobmV3IERhdGUpIH1cbn1cbiIsIlxuLyoqXG4gKiBkZXBlbmRlbmNpZXNcbiAqL1xuXG52YXIgaW5oZXJpdCA9IHJlcXVpcmUoJ2luaGVyaXQnKTtcblxuLyoqXG4gKiBFeHBvcnQgYGV4dGVuc2libGVgXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBleHRlbnNpYmxlO1xuXG4vKipcbiAqIE1ha2UgdGhlIGdpdmVuIGBBYCBleHRlbnNpYmxlLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IEFcbiAqIEByZXR1cm4ge0F9XG4gKi9cblxuZnVuY3Rpb24gZXh0ZW5zaWJsZShBKXtcbiAgQS5leHRlbmQgPSBleHRlbmQ7XG4gIHJldHVybiBBO1xufTtcblxuLyoqXG4gKiBtYWtlIGBCYCBpbmhlcml0IGZyb20gYHRoaXNgLiBVbmxlc3MgYGZpbmFsYCxcbiAqIGBCYCB3aWxsIGFsc28gYmUgbWFkZSBleHRlbnNpYmxlLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IEJcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gW2ZpbmFsXVxuICogQHJldHVybiB7Qn1cbiAqL1xuXG5mdW5jdGlvbiBleHRlbmQoQiwgZmluYWwpe1xuICAhZmluYWwgJiYgZXh0ZW5zaWJsZShCKTtcbiAgaW5oZXJpdChCLCB0aGlzKTtcbiAgcmV0dXJuIEJcbn07IiwiXG5leHBvcnRzLmxpbmVhciA9IGZ1bmN0aW9uKG4pe1xuICByZXR1cm4gbjtcbn07XG5cbmV4cG9ydHMuaW5RdWFkID0gZnVuY3Rpb24obil7XG4gIHJldHVybiBuICogbjtcbn07XG5cbmV4cG9ydHMub3V0UXVhZCA9IGZ1bmN0aW9uKG4pe1xuICByZXR1cm4gbiAqICgyIC0gbik7XG59O1xuXG5leHBvcnRzLmluT3V0UXVhZCA9IGZ1bmN0aW9uKG4pe1xuICBuICo9IDI7XG4gIGlmIChuIDwgMSkgcmV0dXJuIDAuNSAqIG4gKiBuO1xuICByZXR1cm4gLSAwLjUgKiAoLS1uICogKG4gLSAyKSAtIDEpO1xufTtcblxuZXhwb3J0cy5pbkN1YmUgPSBmdW5jdGlvbihuKXtcbiAgcmV0dXJuIG4gKiBuICogbjtcbn07XG5cbmV4cG9ydHMub3V0Q3ViZSA9IGZ1bmN0aW9uKG4pe1xuICByZXR1cm4gLS1uICogbiAqIG4gKyAxO1xufTtcblxuZXhwb3J0cy5pbk91dEN1YmUgPSBmdW5jdGlvbihuKXtcbiAgbiAqPSAyO1xuICBpZiAobiA8IDEpIHJldHVybiAwLjUgKiBuICogbiAqIG47XG4gIHJldHVybiAwLjUgKiAoKG4gLT0gMiApICogbiAqIG4gKyAyKTtcbn07XG5cbmV4cG9ydHMuaW5RdWFydCA9IGZ1bmN0aW9uKG4pe1xuICByZXR1cm4gbiAqIG4gKiBuICogbjtcbn07XG5cbmV4cG9ydHMub3V0UXVhcnQgPSBmdW5jdGlvbihuKXtcbiAgcmV0dXJuIDEgLSAoLS1uICogbiAqIG4gKiBuKTtcbn07XG5cbmV4cG9ydHMuaW5PdXRRdWFydCA9IGZ1bmN0aW9uKG4pe1xuICBuICo9IDI7XG4gIGlmIChuIDwgMSkgcmV0dXJuIDAuNSAqIG4gKiBuICogbiAqIG47XG4gIHJldHVybiAtMC41ICogKChuIC09IDIpICogbiAqIG4gKiBuIC0gMik7XG59O1xuXG5leHBvcnRzLmluUXVpbnQgPSBmdW5jdGlvbihuKXtcbiAgcmV0dXJuIG4gKiBuICogbiAqIG4gKiBuO1xufVxuXG5leHBvcnRzLm91dFF1aW50ID0gZnVuY3Rpb24obil7XG4gIHJldHVybiAtLW4gKiBuICogbiAqIG4gKiBuICsgMTtcbn1cblxuZXhwb3J0cy5pbk91dFF1aW50ID0gZnVuY3Rpb24obil7XG4gIG4gKj0gMjtcbiAgaWYgKG4gPCAxKSByZXR1cm4gMC41ICogbiAqIG4gKiBuICogbiAqIG47XG4gIHJldHVybiAwLjUgKiAoKG4gLT0gMikgKiBuICogbiAqIG4gKiBuICsgMik7XG59O1xuXG5leHBvcnRzLmluU2luZSA9IGZ1bmN0aW9uKG4pe1xuICByZXR1cm4gMSAtIE1hdGguY29zKG4gKiBNYXRoLlBJIC8gMiApO1xufTtcblxuZXhwb3J0cy5vdXRTaW5lID0gZnVuY3Rpb24obil7XG4gIHJldHVybiBNYXRoLnNpbihuICogTWF0aC5QSSAvIDIpO1xufTtcblxuZXhwb3J0cy5pbk91dFNpbmUgPSBmdW5jdGlvbihuKXtcbiAgcmV0dXJuIC41ICogKDEgLSBNYXRoLmNvcyhNYXRoLlBJICogbikpO1xufTtcblxuZXhwb3J0cy5pbkV4cG8gPSBmdW5jdGlvbihuKXtcbiAgcmV0dXJuIDAgPT0gbiA/IDAgOiBNYXRoLnBvdygxMDI0LCBuIC0gMSk7XG59O1xuXG5leHBvcnRzLm91dEV4cG8gPSBmdW5jdGlvbihuKXtcbiAgcmV0dXJuIDEgPT0gbiA/IG4gOiAxIC0gTWF0aC5wb3coMiwgLTEwICogbik7XG59O1xuXG5leHBvcnRzLmluT3V0RXhwbyA9IGZ1bmN0aW9uKG4pe1xuICBpZiAoMCA9PSBuKSByZXR1cm4gMDtcbiAgaWYgKDEgPT0gbikgcmV0dXJuIDE7XG4gIGlmICgobiAqPSAyKSA8IDEpIHJldHVybiAuNSAqIE1hdGgucG93KDEwMjQsIG4gLSAxKTtcbiAgcmV0dXJuIC41ICogKC1NYXRoLnBvdygyLCAtMTAgKiAobiAtIDEpKSArIDIpO1xufTtcblxuZXhwb3J0cy5pbkNpcmMgPSBmdW5jdGlvbihuKXtcbiAgcmV0dXJuIDEgLSBNYXRoLnNxcnQoMSAtIG4gKiBuKTtcbn07XG5cbmV4cG9ydHMub3V0Q2lyYyA9IGZ1bmN0aW9uKG4pe1xuICByZXR1cm4gTWF0aC5zcXJ0KDEgLSAoLS1uICogbikpO1xufTtcblxuZXhwb3J0cy5pbk91dENpcmMgPSBmdW5jdGlvbihuKXtcbiAgbiAqPSAyXG4gIGlmIChuIDwgMSkgcmV0dXJuIC0wLjUgKiAoTWF0aC5zcXJ0KDEgLSBuICogbikgLSAxKTtcbiAgcmV0dXJuIDAuNSAqIChNYXRoLnNxcnQoMSAtIChuIC09IDIpICogbikgKyAxKTtcbn07XG5cbmV4cG9ydHMuaW5CYWNrID0gZnVuY3Rpb24obil7XG4gIHZhciBzID0gMS43MDE1ODtcbiAgcmV0dXJuIG4gKiBuICogKCggcyArIDEgKSAqIG4gLSBzKTtcbn07XG5cbmV4cG9ydHMub3V0QmFjayA9IGZ1bmN0aW9uKG4pe1xuICB2YXIgcyA9IDEuNzAxNTg7XG4gIHJldHVybiAtLW4gKiBuICogKChzICsgMSkgKiBuICsgcykgKyAxO1xufTtcblxuZXhwb3J0cy5pbk91dEJhY2sgPSBmdW5jdGlvbihuKXtcbiAgdmFyIHMgPSAxLjcwMTU4ICogMS41MjU7XG4gIGlmICggKCBuICo9IDIgKSA8IDEgKSByZXR1cm4gMC41ICogKCBuICogbiAqICggKCBzICsgMSApICogbiAtIHMgKSApO1xuICByZXR1cm4gMC41ICogKCAoIG4gLT0gMiApICogbiAqICggKCBzICsgMSApICogbiArIHMgKSArIDIgKTtcbn07XG5cbmV4cG9ydHMuaW5Cb3VuY2UgPSBmdW5jdGlvbihuKXtcbiAgcmV0dXJuIDEgLSBleHBvcnRzLm91dEJvdW5jZSgxIC0gbik7XG59O1xuXG5leHBvcnRzLm91dEJvdW5jZSA9IGZ1bmN0aW9uKG4pe1xuICBpZiAoIG4gPCAoIDEgLyAyLjc1ICkgKSB7XG4gICAgcmV0dXJuIDcuNTYyNSAqIG4gKiBuO1xuICB9IGVsc2UgaWYgKCBuIDwgKCAyIC8gMi43NSApICkge1xuICAgIHJldHVybiA3LjU2MjUgKiAoIG4gLT0gKCAxLjUgLyAyLjc1ICkgKSAqIG4gKyAwLjc1O1xuICB9IGVsc2UgaWYgKCBuIDwgKCAyLjUgLyAyLjc1ICkgKSB7XG4gICAgcmV0dXJuIDcuNTYyNSAqICggbiAtPSAoIDIuMjUgLyAyLjc1ICkgKSAqIG4gKyAwLjkzNzU7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIDcuNTYyNSAqICggbiAtPSAoIDIuNjI1IC8gMi43NSApICkgKiBuICsgMC45ODQzNzU7XG4gIH1cbn07XG5cbmV4cG9ydHMuaW5PdXRCb3VuY2UgPSBmdW5jdGlvbihuKXtcbiAgaWYgKG4gPCAuNSkgcmV0dXJuIGV4cG9ydHMuaW5Cb3VuY2UobiAqIDIpICogLjU7XG4gIHJldHVybiBleHBvcnRzLm91dEJvdW5jZShuICogMiAtIDEpICogLjUgKyAuNTtcbn07XG5cbi8vIGFsaWFzZXNcblxuZXhwb3J0c1snaW4tcXVhZCddID0gZXhwb3J0cy5pblF1YWQ7XG5leHBvcnRzWydvdXQtcXVhZCddID0gZXhwb3J0cy5vdXRRdWFkO1xuZXhwb3J0c1snaW4tb3V0LXF1YWQnXSA9IGV4cG9ydHMuaW5PdXRRdWFkO1xuZXhwb3J0c1snaW4tY3ViZSddID0gZXhwb3J0cy5pbkN1YmU7XG5leHBvcnRzWydvdXQtY3ViZSddID0gZXhwb3J0cy5vdXRDdWJlO1xuZXhwb3J0c1snaW4tb3V0LWN1YmUnXSA9IGV4cG9ydHMuaW5PdXRDdWJlO1xuZXhwb3J0c1snaW4tcXVhcnQnXSA9IGV4cG9ydHMuaW5RdWFydDtcbmV4cG9ydHNbJ291dC1xdWFydCddID0gZXhwb3J0cy5vdXRRdWFydDtcbmV4cG9ydHNbJ2luLW91dC1xdWFydCddID0gZXhwb3J0cy5pbk91dFF1YXJ0O1xuZXhwb3J0c1snaW4tcXVpbnQnXSA9IGV4cG9ydHMuaW5RdWludDtcbmV4cG9ydHNbJ291dC1xdWludCddID0gZXhwb3J0cy5vdXRRdWludDtcbmV4cG9ydHNbJ2luLW91dC1xdWludCddID0gZXhwb3J0cy5pbk91dFF1aW50O1xuZXhwb3J0c1snaW4tc2luZSddID0gZXhwb3J0cy5pblNpbmU7XG5leHBvcnRzWydvdXQtc2luZSddID0gZXhwb3J0cy5vdXRTaW5lO1xuZXhwb3J0c1snaW4tb3V0LXNpbmUnXSA9IGV4cG9ydHMuaW5PdXRTaW5lO1xuZXhwb3J0c1snaW4tZXhwbyddID0gZXhwb3J0cy5pbkV4cG87XG5leHBvcnRzWydvdXQtZXhwbyddID0gZXhwb3J0cy5vdXRFeHBvO1xuZXhwb3J0c1snaW4tb3V0LWV4cG8nXSA9IGV4cG9ydHMuaW5PdXRFeHBvO1xuZXhwb3J0c1snaW4tY2lyYyddID0gZXhwb3J0cy5pbkNpcmM7XG5leHBvcnRzWydvdXQtY2lyYyddID0gZXhwb3J0cy5vdXRDaXJjO1xuZXhwb3J0c1snaW4tb3V0LWNpcmMnXSA9IGV4cG9ydHMuaW5PdXRDaXJjO1xuZXhwb3J0c1snaW4tYmFjayddID0gZXhwb3J0cy5pbkJhY2s7XG5leHBvcnRzWydvdXQtYmFjayddID0gZXhwb3J0cy5vdXRCYWNrO1xuZXhwb3J0c1snaW4tb3V0LWJhY2snXSA9IGV4cG9ydHMuaW5PdXRCYWNrO1xuZXhwb3J0c1snaW4tYm91bmNlJ10gPSBleHBvcnRzLmluQm91bmNlO1xuZXhwb3J0c1snb3V0LWJvdW5jZSddID0gZXhwb3J0cy5vdXRCb3VuY2U7XG5leHBvcnRzWydpbi1vdXQtYm91bmNlJ10gPSBleHBvcnRzLmluT3V0Qm91bmNlO1xuIiwiXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBhbGljZWJsdWU6IFsyNDAsIDI0OCwgMjU1XVxuICAsIGFudGlxdWV3aGl0ZTogWzI1MCwgMjM1LCAyMTVdXG4gICwgYXF1YTogWzAsIDI1NSwgMjU1XVxuICAsIGFxdWFtYXJpbmU6IFsxMjcsIDI1NSwgMjEyXVxuICAsIGF6dXJlOiBbMjQwLCAyNTUsIDI1NV1cbiAgLCBiZWlnZTogWzI0NSwgMjQ1LCAyMjBdXG4gICwgYmlzcXVlOiBbMjU1LCAyMjgsIDE5Nl1cbiAgLCBibGFjazogWzAsIDAsIDBdXG4gICwgYmxhbmNoZWRhbG1vbmQ6IFsyNTUsIDIzNSwgMjA1XVxuICAsIGJsdWU6IFswLCAwLCAyNTVdXG4gICwgYmx1ZXZpb2xldDogWzEzOCwgNDMsIDIyNl1cbiAgLCBicm93bjogWzE2NSwgNDIsIDQyXVxuICAsIGJ1cmx5d29vZDogWzIyMiwgMTg0LCAxMzVdXG4gICwgY2FkZXRibHVlOiBbOTUsIDE1OCwgMTYwXVxuICAsIGNoYXJ0cmV1c2U6IFsxMjcsIDI1NSwgMF1cbiAgLCBjaG9jb2xhdGU6IFsyMTAsIDEwNSwgMzBdXG4gICwgY29yYWw6IFsyNTUsIDEyNywgODBdXG4gICwgY29ybmZsb3dlcmJsdWU6IFsxMDAsIDE0OSwgMjM3XVxuICAsIGNvcm5zaWxrOiBbMjU1LCAyNDgsIDIyMF1cbiAgLCBjcmltc29uOiBbMjIwLCAyMCwgNjBdXG4gICwgY3lhbjogWzAsIDI1NSwgMjU1XVxuICAsIGRhcmtibHVlOiBbMCwgMCwgMTM5XVxuICAsIGRhcmtjeWFuOiBbMCwgMTM5LCAxMzldXG4gICwgZGFya2dvbGRlbnJvZDogWzE4NCwgMTMyLCAxMV1cbiAgLCBkYXJrZ3JheTogWzE2OSwgMTY5LCAxNjldXG4gICwgZGFya2dyZWVuOiBbMCwgMTAwLCAwXVxuICAsIGRhcmtncmV5OiBbMTY5LCAxNjksIDE2OV1cbiAgLCBkYXJra2hha2k6IFsxODksIDE4MywgMTA3XVxuICAsIGRhcmttYWdlbnRhOiBbMTM5LCAwLCAxMzldXG4gICwgZGFya29saXZlZ3JlZW46IFs4NSwgMTA3LCA0N11cbiAgLCBkYXJrb3JhbmdlOiBbMjU1LCAxNDAsIDBdXG4gICwgZGFya29yY2hpZDogWzE1MywgNTAsIDIwNF1cbiAgLCBkYXJrcmVkOiBbMTM5LCAwLCAwXVxuICAsIGRhcmtzYWxtb246IFsyMzMsIDE1MCwgMTIyXVxuICAsIGRhcmtzZWFncmVlbjogWzE0MywgMTg4LCAxNDNdXG4gICwgZGFya3NsYXRlYmx1ZTogWzcyLCA2MSwgMTM5XVxuICAsIGRhcmtzbGF0ZWdyYXk6IFs0NywgNzksIDc5XVxuICAsIGRhcmtzbGF0ZWdyZXk6IFs0NywgNzksIDc5XVxuICAsIGRhcmt0dXJxdW9pc2U6IFswLCAyMDYsIDIwOV1cbiAgLCBkYXJrdmlvbGV0OiBbMTQ4LCAwLCAyMTFdXG4gICwgZGVlcHBpbms6IFsyNTUsIDIwLCAxNDddXG4gICwgZGVlcHNreWJsdWU6IFswLCAxOTEsIDI1NV1cbiAgLCBkaW1ncmF5OiBbMTA1LCAxMDUsIDEwNV1cbiAgLCBkaW1ncmV5OiBbMTA1LCAxMDUsIDEwNV1cbiAgLCBkb2RnZXJibHVlOiBbMzAsIDE0NCwgMjU1XVxuICAsIGZpcmVicmljazogWzE3OCwgMzQsIDM0XVxuICAsIGZsb3JhbHdoaXRlOiBbMjU1LCAyNTUsIDI0MF1cbiAgLCBmb3Jlc3RncmVlbjogWzM0LCAxMzksIDM0XVxuICAsIGZ1Y2hzaWE6IFsyNTUsIDAsIDI1NV1cbiAgLCBnYWluc2Jvcm86IFsyMjAsIDIyMCwgMjIwXVxuICAsIGdob3N0d2hpdGU6IFsyNDgsIDI0OCwgMjU1XVxuICAsIGdvbGQ6IFsyNTUsIDIxNSwgMF1cbiAgLCBnb2xkZW5yb2Q6IFsyMTgsIDE2NSwgMzJdXG4gICwgZ3JheTogWzEyOCwgMTI4LCAxMjhdXG4gICwgZ3JlZW46IFswLCAxMjgsIDBdXG4gICwgZ3JlZW55ZWxsb3c6IFsxNzMsIDI1NSwgNDddXG4gICwgZ3JleTogWzEyOCwgMTI4LCAxMjhdXG4gICwgaG9uZXlkZXc6IFsyNDAsIDI1NSwgMjQwXVxuICAsIGhvdHBpbms6IFsyNTUsIDEwNSwgMTgwXVxuICAsIGluZGlhbnJlZDogWzIwNSwgOTIsIDkyXVxuICAsIGluZGlnbzogWzc1LCAwLCAxMzBdXG4gICwgaXZvcnk6IFsyNTUsIDI1NSwgMjQwXVxuICAsIGtoYWtpOiBbMjQwLCAyMzAsIDE0MF1cbiAgLCBsYXZlbmRlcjogWzIzMCwgMjMwLCAyNTBdXG4gICwgbGF2ZW5kZXJibHVzaDogWzI1NSwgMjQwLCAyNDVdXG4gICwgbGF3bmdyZWVuOiBbMTI0LCAyNTIsIDBdXG4gICwgbGVtb25jaGlmZm9uOiBbMjU1LCAyNTAsIDIwNV1cbiAgLCBsaWdodGJsdWU6IFsxNzMsIDIxNiwgMjMwXVxuICAsIGxpZ2h0Y29yYWw6IFsyNDAsIDEyOCwgMTI4XVxuICAsIGxpZ2h0Y3lhbjogWzIyNCwgMjU1LCAyNTVdXG4gICwgbGlnaHRnb2xkZW5yb2R5ZWxsb3c6IFsyNTAsIDI1MCwgMjEwXVxuICAsIGxpZ2h0Z3JheTogWzIxMSwgMjExLCAyMTFdXG4gICwgbGlnaHRncmVlbjogWzE0NCwgMjM4LCAxNDRdXG4gICwgbGlnaHRncmV5OiBbMjExLCAyMTEsIDIxMV1cbiAgLCBsaWdodHBpbms6IFsyNTUsIDE4MiwgMTkzXVxuICAsIGxpZ2h0c2FsbW9uOiBbMjU1LCAxNjAsIDEyMl1cbiAgLCBsaWdodHNlYWdyZWVuOiBbMzIsIDE3OCwgMTcwXVxuICAsIGxpZ2h0c2t5Ymx1ZTogWzEzNSwgMjA2LCAyNTBdXG4gICwgbGlnaHRzbGF0ZWdyYXk6IFsxMTksIDEzNiwgMTUzXVxuICAsIGxpZ2h0c2xhdGVncmV5OiBbMTE5LCAxMzYsIDE1M11cbiAgLCBsaWdodHN0ZWVsYmx1ZTogWzE3NiwgMTk2LCAyMjJdXG4gICwgbGlnaHR5ZWxsb3c6IFsyNTUsIDI1NSwgMjI0XVxuICAsIGxpbWU6IFswLCAyNTUsIDBdXG4gICwgbGltZWdyZWVuOiBbNTAsIDIwNSwgNTBdXG4gICwgbGluZW46IFsyNTAsIDI0MCwgMjMwXVxuICAsIG1hZ2VudGE6IFsyNTUsIDAsIDI1NV1cbiAgLCBtYXJvb246IFsxMjgsIDAsIDBdXG4gICwgbWVkaXVtYXF1YW1hcmluZTogWzEwMiwgMjA1LCAxNzBdXG4gICwgbWVkaXVtYmx1ZTogWzAsIDAsIDIwNV1cbiAgLCBtZWRpdW1vcmNoaWQ6IFsxODYsIDg1LCAyMTFdXG4gICwgbWVkaXVtcHVycGxlOiBbMTQ3LCAxMTIsIDIxOV1cbiAgLCBtZWRpdW1zZWFncmVlbjogWzYwLCAxNzksIDExM11cbiAgLCBtZWRpdW1zbGF0ZWJsdWU6IFsxMjMsIDEwNCwgMjM4XVxuICAsIG1lZGl1bXNwcmluZ2dyZWVuOiBbMCwgMjUwLCAxNTRdXG4gICwgbWVkaXVtdHVycXVvaXNlOiBbNzIsIDIwOSwgMjA0XVxuICAsIG1lZGl1bXZpb2xldHJlZDogWzE5OSwgMjEsIDEzM11cbiAgLCBtaWRuaWdodGJsdWU6IFsyNSwgMjUsIDExMl1cbiAgLCBtaW50Y3JlYW06IFsyNDUsIDI1NSwgMjUwXVxuICAsIG1pc3R5cm9zZTogWzI1NSwgMjI4LCAyMjVdXG4gICwgbW9jY2FzaW46IFsyNTUsIDIyOCwgMTgxXVxuICAsIG5hdmFqb3doaXRlOiBbMjU1LCAyMjIsIDE3M11cbiAgLCBuYXZ5OiBbMCwgMCwgMTI4XVxuICAsIG9sZGxhY2U6IFsyNTMsIDI0NSwgMjMwXVxuICAsIG9saXZlOiBbMTI4LCAxMjgsIDBdXG4gICwgb2xpdmVkcmFiOiBbMTA3LCAxNDIsIDM1XVxuICAsIG9yYW5nZTogWzI1NSwgMTY1LCAwXVxuICAsIG9yYW5nZXJlZDogWzI1NSwgNjksIDBdXG4gICwgb3JjaGlkOiBbMjE4LCAxMTIsIDIxNF1cbiAgLCBwYWxlZ29sZGVucm9kOiBbMjM4LCAyMzIsIDE3MF1cbiAgLCBwYWxlZ3JlZW46IFsxNTIsIDI1MSwgMTUyXVxuICAsIHBhbGV0dXJxdW9pc2U6IFsxNzUsIDIzOCwgMjM4XVxuICAsIHBhbGV2aW9sZXRyZWQ6IFsyMTksIDExMiwgMTQ3XVxuICAsIHBhcGF5YXdoaXA6IFsyNTUsIDIzOSwgMjEzXVxuICAsIHBlYWNocHVmZjogWzI1NSwgMjE4LCAxODVdXG4gICwgcGVydTogWzIwNSwgMTMzLCA2M11cbiAgLCBwaW5rOiBbMjU1LCAxOTIsIDIwM11cbiAgLCBwbHVtOiBbMjIxLCAxNjAsIDIwM11cbiAgLCBwb3dkZXJibHVlOiBbMTc2LCAyMjQsIDIzMF1cbiAgLCBwdXJwbGU6IFsxMjgsIDAsIDEyOF1cbiAgLCByZWQ6IFsyNTUsIDAsIDBdXG4gICwgcm9zeWJyb3duOiBbMTg4LCAxNDMsIDE0M11cbiAgLCByb3lhbGJsdWU6IFs2NSwgMTA1LCAyMjVdXG4gICwgc2FkZGxlYnJvd246IFsxMzksIDY5LCAxOV1cbiAgLCBzYWxtb246IFsyNTAsIDEyOCwgMTE0XVxuICAsIHNhbmR5YnJvd246IFsyNDQsIDE2NCwgOTZdXG4gICwgc2VhZ3JlZW46IFs0NiwgMTM5LCA4N11cbiAgLCBzZWFzaGVsbDogWzI1NSwgMjQ1LCAyMzhdXG4gICwgc2llbm5hOiBbMTYwLCA4MiwgNDVdXG4gICwgc2lsdmVyOiBbMTkyLCAxOTIsIDE5Ml1cbiAgLCBza3libHVlOiBbMTM1LCAyMDYsIDIzNV1cbiAgLCBzbGF0ZWJsdWU6IFsxMDYsIDkwLCAyMDVdXG4gICwgc2xhdGVncmF5OiBbMTE5LCAxMjgsIDE0NF1cbiAgLCBzbGF0ZWdyZXk6IFsxMTksIDEyOCwgMTQ0XVxuICAsIHNub3c6IFsyNTUsIDI1NSwgMjUwXVxuICAsIHNwcmluZ2dyZWVuOiBbMCwgMjU1LCAxMjddXG4gICwgc3RlZWxibHVlOiBbNzAsIDEzMCwgMTgwXVxuICAsIHRhbjogWzIxMCwgMTgwLCAxNDBdXG4gICwgdGVhbDogWzAsIDEyOCwgMTI4XVxuICAsIHRoaXN0bGU6IFsyMTYsIDE5MSwgMjE2XVxuICAsIHRvbWF0bzogWzI1NSwgOTksIDcxXVxuICAsIHR1cnF1b2lzZTogWzY0LCAyMjQsIDIwOF1cbiAgLCB2aW9sZXQ6IFsyMzgsIDEzMCwgMjM4XVxuICAsIHdoZWF0OiBbMjQ1LCAyMjIsIDE3OV1cbiAgLCB3aGl0ZTogWzI1NSwgMjU1LCAyNTVdXG4gICwgd2hpdGVzbW9rZTogWzI0NSwgMjQ1LCAyNDVdXG4gICwgeWVsbG93OiBbMjU1LCAyNTUsIDBdXG4gICwgeWVsbG93Z3JlZW46IFsxNTQsIDIwNSwgNV1cbn07IiwiXG5mdW5jdGlvbiBvbmUoc2VsZWN0b3IsIGVsKSB7XG4gIHJldHVybiBlbC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbn1cblxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc2VsZWN0b3IsIGVsKXtcbiAgZWwgPSBlbCB8fCBkb2N1bWVudDtcbiAgcmV0dXJuIG9uZShzZWxlY3RvciwgZWwpO1xufTtcblxuZXhwb3J0cy5hbGwgPSBmdW5jdGlvbihzZWxlY3RvciwgZWwpe1xuICBlbCA9IGVsIHx8IGRvY3VtZW50O1xuICByZXR1cm4gZWwucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG59O1xuXG5leHBvcnRzLmVuZ2luZSA9IGZ1bmN0aW9uKG9iail7XG4gIGlmICghb2JqLm9uZSkgdGhyb3cgbmV3IEVycm9yKCcub25lIGNhbGxiYWNrIHJlcXVpcmVkJyk7XG4gIGlmICghb2JqLmFsbCkgdGhyb3cgbmV3IEVycm9yKCcuYWxsIGNhbGxiYWNrIHJlcXVpcmVkJyk7XG4gIG9uZSA9IG9iai5vbmU7XG4gIGV4cG9ydHMuYWxsID0gb2JqLmFsbDtcbn07XG4iLCJcbi8qKlxuICogQmluZCBgZWxgIGV2ZW50IGB0eXBlYCB0byBgZm5gLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHBhcmFtIHtCb29sZWFufSBjYXB0dXJlXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy5iaW5kID0gZnVuY3Rpb24oZWwsIHR5cGUsIGZuLCBjYXB0dXJlKXtcbiAgaWYgKGVsLmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgICBlbC5hZGRFdmVudExpc3RlbmVyKHR5cGUsIGZuLCBjYXB0dXJlIHx8IGZhbHNlKTtcbiAgfSBlbHNlIHtcbiAgICBlbC5hdHRhY2hFdmVudCgnb24nICsgdHlwZSwgZm4pO1xuICB9XG4gIHJldHVybiBmbjtcbn07XG5cbi8qKlxuICogVW5iaW5kIGBlbGAgZXZlbnQgYHR5cGVgJ3MgY2FsbGJhY2sgYGZuYC5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gY2FwdHVyZVxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMudW5iaW5kID0gZnVuY3Rpb24oZWwsIHR5cGUsIGZuLCBjYXB0dXJlKXtcbiAgaWYgKGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIpIHtcbiAgICBlbC5yZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGZuLCBjYXB0dXJlIHx8IGZhbHNlKTtcbiAgfSBlbHNlIHtcbiAgICBlbC5kZXRhY2hFdmVudCgnb24nICsgdHlwZSwgZm4pO1xuICB9XG4gIHJldHVybiBmbjtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGFyciwgb2JqKXtcbiAgaWYgKGFyci5pbmRleE9mKSByZXR1cm4gYXJyLmluZGV4T2Yob2JqKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyArK2kpIHtcbiAgICBpZiAoYXJyW2ldID09PSBvYmopIHJldHVybiBpO1xuICB9XG4gIHJldHVybiAtMTtcbn07IiwiXG4vKipcbiAqIHRvU3RyaW5nIHJlZi5cbiAqL1xuXG52YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG4vKipcbiAqIFJldHVybiB0aGUgdHlwZSBvZiBgdmFsYC5cbiAqXG4gKiBAcGFyYW0ge01peGVkfSB2YWxcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHVibGljXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih2YWwpe1xuICBzd2l0Y2ggKHRvU3RyaW5nLmNhbGwodmFsKSkge1xuICAgIGNhc2UgJ1tvYmplY3QgRnVuY3Rpb25dJzogcmV0dXJuICdmdW5jdGlvbic7XG4gICAgY2FzZSAnW29iamVjdCBEYXRlXSc6IHJldHVybiAnZGF0ZSc7XG4gICAgY2FzZSAnW29iamVjdCBSZWdFeHBdJzogcmV0dXJuICdyZWdleHAnO1xuICAgIGNhc2UgJ1tvYmplY3QgQXJndW1lbnRzXSc6IHJldHVybiAnYXJndW1lbnRzJztcbiAgICBjYXNlICdbb2JqZWN0IEFycmF5XSc6IHJldHVybiAnYXJyYXknO1xuICAgIGNhc2UgJ1tvYmplY3QgU3RyaW5nXSc6IHJldHVybiAnc3RyaW5nJztcbiAgfVxuXG4gIGlmICh2YWwgPT09IG51bGwpIHJldHVybiAnbnVsbCc7XG4gIGlmICh2YWwgPT09IHVuZGVmaW5lZCkgcmV0dXJuICd1bmRlZmluZWQnO1xuICBpZiAodmFsICYmIHZhbC5ub2RlVHlwZSA9PT0gMSkgcmV0dXJuICdlbGVtZW50JztcbiAgaWYgKHZhbCA9PT0gT2JqZWN0KHZhbCkpIHJldHVybiAnb2JqZWN0JztcblxuICByZXR1cm4gdHlwZW9mIHZhbDtcbn07XG4iLCJcbnZhciBUd2VlbiA9IHJlcXVpcmUoJ3R3ZWVuL251bWJlcicpXG5cbm1vZHVsZS5leHBvcnRzID0gVHdlZW4uZXh0ZW5kKGZ1bmN0aW9uIE51bWJlcihmcm9tLCB0byl7XG5cdFR3ZWVuLmNhbGwodGhpcywgcGFyc2UoZnJvbSksIHBhcnNlKHRvKSlcbn0sICdmaW5hbCcpXG5cbmZ1bmN0aW9uIHBhcnNlKHB4KXtcblx0cmV0dXJuIHBhcnNlRmxvYXQocHgsIDEwKSB8fCAwXG59IiwiXG52YXIgVHdlZW4gPSByZXF1aXJlKCd0d2Vlbi9vYmplY3QnKVxudmFyIG1hdHJpeCA9IHJlcXVpcmUoJ3VubWF0cml4JylcbnZhciBkZWNvbXBvc2UgPSBtYXRyaXguZGVjb21wb3NlXG52YXIgcGFyc2VTdHJpbmcgPSBtYXRyaXgucGFyc2VcbnZhciBmcmFtZSA9IFR3ZWVuLnByb3RvdHlwZS5mcmFtZVxuXG5tb2R1bGUuZXhwb3J0cyA9IE1hdHJpeFxuXG5mdW5jdGlvbiBNYXRyaXgoZnJvbSwgdG8pe1xuXHRUd2Vlbi5jYWxsKHRoaXMsIHBhcnNlKGZyb20pLCBwYXJzZSh0bykpXG59XG5cblR3ZWVuLmV4dGVuZChNYXRyaXgsICdmaW5hbCcpXG5cbk1hdHJpeC5wcm90b3R5cGUuZnJhbWUgPSBmdW5jdGlvbihwKXtcblx0cmV0dXJuIHRvU3RyaW5nKGZyYW1lLmNhbGwodGhpcywgcCkpXG59XG5cbmZ1bmN0aW9uIHBhcnNlKG0pe1xuXHRpZiAobSA9PSAnbm9uZScpIHJldHVybiBpZGVudGl0eVxuXHRyZXR1cm4gZGVjb21wb3NlKHR5cGVvZiBtID09ICdzdHJpbmcnXG5cdFx0PyBwYXJzZVN0cmluZyhtKVxuXHRcdDogW1xuXHRcdFx0XHRtLm0xMSwgbS5tMTIsXG5cdFx0XHRcdG0ubTIxLCBtLm0yMixcblx0XHRcdFx0bS5tNDEsIG0ubTQyLFxuXHRcdFx0XSlcbn1cblxudmFyIGlkZW50aXR5ID0ge1xuXHR0cmFuc2xhdGVYOiAwLFxuXHR0cmFuc2xhdGVZOiAwLFxuXHRyb3RhdGU6IDAsXG5cdHNrZXc6IDAsXG5cdHNjYWxlWDogMSxcblx0c2NhbGVZOiAxXG59XG5cbmZ1bmN0aW9uIHRvU3RyaW5nKHByb3BzKSB7XG5cdHZhciBzdHIgPSAnJ1xuXHRmb3IodmFyIGsgaW4gcHJvcHMpIHtcblx0XHRcdHN0ciArPSBrICsgJygnICsgcHJvcHNba10gKyB1bml0W2tdICsgJykgJ1xuXHR9XG5cdHJldHVybiBzdHJcbn1cblxudmFyIHVuaXQgPSB7XG5cdHRyYW5zbGF0ZVg6ICdweCcsXG5cdHRyYW5zbGF0ZVk6ICdweCcsXG5cdHJvdGF0ZTogJ2RlZycsXG5cdHNrZXc6ICdkZWcnLFxuXHRzY2FsZVg6ICcnLFxuXHRzY2FsZVk6ICcnXG59IiwiXG52YXIgVHdlZW4gPSByZXF1aXJlKCd0d2Vlbi9hcnJheScpXG52YXIgZnJhbWUgPSBUd2Vlbi5wcm90b3R5cGUuZnJhbWVcbnZhciByZ2JhID0gcmVxdWlyZSgnY29sb3ItcGFyc2VyJylcblxubW9kdWxlLmV4cG9ydHMgPSBDb2xvclxuXG5mdW5jdGlvbiBDb2xvcihmcm9tLCB0byl7XG5cdFR3ZWVuLmNhbGwodGhpcywgcGFyc2UoZnJvbSksIHBhcnNlKHRvKSlcbn1cblxuVHdlZW4uZXh0ZW5kKENvbG9yLCAnZmluYWwnKVxuXG5Db2xvci5wcm90b3R5cGUuZnJhbWUgPSBmdW5jdGlvbihwcm9ncmVzcyl7XG5cdHZhciByZ2IgPSBmcmFtZS5jYWxsKHRoaXMsIHByb2dyZXNzKS5tYXAodG9JbnQpXG5cdHJldHVybiAncmdiYSgnICsgcmdiLmpvaW4oJywnKSArICcpJ1xufVxuXG5mdW5jdGlvbiB0b0ludChuKXtcblx0cmV0dXJuIG4udG9GaXhlZCgwKVxufVxuXG5mdW5jdGlvbiBwYXJzZShjb2xvcil7XG5cdGNvbG9yID0gcmdiYShjb2xvcilcblx0cmV0dXJuIFtcblx0XHRjb2xvci5yLFxuXHRcdGNvbG9yLmcsXG5cdFx0Y29sb3IuYixcblx0XHRjb2xvci5hIHx8IDEsXG5cdF1cbn0iLCJcbnZhciBUd2VlbiA9IHJlcXVpcmUoJ3R3ZWVuL251bWJlcicpXG52YXIgZnJhbWUgPSBUd2Vlbi5wcm90b3R5cGUuZnJhbWVcblxubW9kdWxlLmV4cG9ydHMgPSBQWFxuXG5Ud2Vlbi5leHRlbmQoUFgsICdmaW5hbCcpXG5cbmZ1bmN0aW9uIFBYKGZyb20sIHRvKXtcblx0VHdlZW4uY2FsbCh0aGlzLCBwYXJzZShmcm9tKSwgcGFyc2UodG8pKVxufVxuXG5QWC5wcm90b3R5cGUuZnJhbWUgPSBmdW5jdGlvbihwcm9ncmVzcykge1xuXHRyZXR1cm4gZnJhbWUuY2FsbCh0aGlzLCBwcm9ncmVzcykudG9GaXhlZCgxKSArICdweCdcbn07XG5cbmZ1bmN0aW9uIHBhcnNlKHB4KXtcblx0cmV0dXJuIHBhcnNlRmxvYXQocHgsIDEwKSB8fCAwXG59IiwiXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGEsIGIpe1xuICB2YXIgZm4gPSBmdW5jdGlvbigpe307XG4gIGZuLnByb3RvdHlwZSA9IGIucHJvdG90eXBlO1xuICBhLnByb3RvdHlwZSA9IG5ldyBmbjtcbiAgYS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBhO1xufTsiLCJcbnZhciBUd2VlbiA9IHJlcXVpcmUoJy4vdHdlZW4nKVxuXG5tb2R1bGUuZXhwb3J0cyA9IE51bWJlclR3ZWVuXG5cbmZ1bmN0aW9uIE51bWJlclR3ZWVuKGZyb20sIHRvKXtcblx0dGhpcy5fZGlmZiA9IHRvIC0gZnJvbVxuXHR0aGlzLl9mcm9tID0gZnJvbVxuXHR0aGlzLl90byA9IHRvXG59XG5cblR3ZWVuLmV4dGVuZChOdW1iZXJUd2VlbilcblxuTnVtYmVyVHdlZW4ucHJvdG90eXBlLmZyYW1lID0gZnVuY3Rpb24ocCl7XG5cdHJldHVybiB0aGlzLl9mcm9tICsgKHRoaXMuX2RpZmYgKiBwKVxufVxuXG5OdW1iZXJUd2Vlbi5wcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbigpe1xuXHRUd2Vlbi5wcm90b3R5cGUucmVzZXQuY2FsbCh0aGlzKVxuXHR0aGlzLl9kaWZmID0gdGhpcy5fdG8gLSB0aGlzLl9mcm9tXG5cdHJldHVybiB0aGlzXG59IiwiXG52YXIgVHdlZW4gPSByZXF1aXJlKCcuL3R3ZWVuJylcblxubW9kdWxlLmV4cG9ydHMgPSBPYmplY3RUd2VlblxuXG5mdW5jdGlvbiBPYmplY3RUd2Vlbihmcm9tLCB0byl7XG5cdHRoaXMuX2Zyb20gPSBmcm9tXG5cdHRoaXMuX2N1cnIgPSB7fVxuXHR0aGlzLl90byA9IHRvXG59XG5cblR3ZWVuLmV4dGVuZChPYmplY3RUd2VlbilcblxuT2JqZWN0VHdlZW4ucHJvdG90eXBlLmZyYW1lID0gZnVuY3Rpb24ocCl7XG5cdHZhciBmcm9tID0gdGhpcy5fZnJvbVxuXHR2YXIgY3VyciA9IHRoaXMuX2N1cnJcblx0dmFyIHRvID0gdGhpcy5fdG9cblx0Zm9yICh2YXIgayBpbiB0bykge1xuXHRcdGN1cnJba10gPSBmcm9tW2tdICsgKCh0b1trXSAtIGZyb21ba10pICogcClcblx0fVxuXHRyZXR1cm4gY3VyclxufVxuXG5PYmplY3RUd2Vlbi5wcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbigpe1xuXHRUd2Vlbi5wcm90b3R5cGUucmVzZXQuY2FsbCh0aGlzKVxuXHR0aGlzLl9jdXJyID0ge30gLy8gcHJldmVudCBtdXRhdGlvblxuXHRyZXR1cm4gdGhpc1xufSIsIlxudmFyIFR3ZWVuID0gcmVxdWlyZSgnLi90d2VlbicpXG5cbm1vZHVsZS5leHBvcnRzID0gQXJyYXlUd2VlblxuXG5mdW5jdGlvbiBBcnJheVR3ZWVuKGZyb20sIHRvKXtcblx0dGhpcy5fZnJvbSA9IGZyb21cblx0dGhpcy5fY3VyciA9IGZyb20uc2xpY2UoKVxuXHR0aGlzLl90byA9IHRvXG59XG5cblR3ZWVuLmV4dGVuZChBcnJheVR3ZWVuKVxuXG5BcnJheVR3ZWVuLnByb3RvdHlwZS5mcmFtZSA9IGZ1bmN0aW9uKHApe1xuXHR2YXIgZnJvbSA9IHRoaXMuX2Zyb21cblx0dmFyIGN1cnIgPSB0aGlzLl9jdXJyXG5cdHZhciB0byA9IHRoaXMuX3RvXG5cdHZhciBpID0gdG8ubGVuZ3RoXG5cdHdoaWxlIChpLS0pIHtcblx0XHRjdXJyW2ldID0gZnJvbVtpXSArICh0b1tpXSAtIGZyb21baV0pICogcFxuXHR9XG5cdHJldHVybiBjdXJyXG59XG5cbkFycmF5VHdlZW4ucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24oKXtcblx0VHdlZW4ucHJvdG90eXBlLnJlc2V0LmNhbGwodGhpcylcblx0dGhpcy5fY3VyciA9IFtdIC8vIHByZXZlbnQgbXV0YXRpb25cblx0cmV0dXJuIHRoaXNcbn0iLCIvKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXNcbiAqL1xuXG52YXIgc3R5bGUgPSByZXF1aXJlKCdjb21wdXRlZC1zdHlsZScpO1xudmFyIHByZWZpeCA9IHJlcXVpcmUoJ3ByZWZpeCcpO1xuXG4vKipcbiAqIEV4cG9zZSBgdW5tYXRyaXhgIGFuZCBoZWxwZXJzXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gdW5tYXRyaXg7XG5leHBvcnRzLmRlY29tcG9zZSA9IGRlY29tcG9zZTtcbmV4cG9ydHMucGFyc2UgPSBwYXJzZTtcblxuLyoqXG4gKiBVbm1hdHJpeFxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xuXG5mdW5jdGlvbiB1bm1hdHJpeChlbCkge1xuICB2YXIgcHJvcCA9IHN0eWxlKGVsKVtwcmVmaXgoJ3RyYW5zZm9ybScpXTtcbiAgdmFyIG1hdHJpeCA9IHBhcnNlKHByb3ApO1xuICByZXR1cm4gZGVjb21wb3NlKG1hdHJpeCk7XG59XG5cbi8qKlxuICogVW5tYXRyaXg6IHBhcnNlIHRoZSB2YWx1ZXMgb2YgdGhlIG1hdHJpeFxuICpcbiAqIEFsZ29yaXRobSBmcm9tOlxuICpcbiAqIC0gaHR0cDovL2hnLm1vemlsbGEub3JnL21vemlsbGEtY2VudHJhbC9maWxlLzdjYjNlOTc5NWQwNC9sYXlvdXQvc3R5bGUvbnNTdHlsZUFuaW1hdGlvbi5jcHBcbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBtIChtYXRyaXgpXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBkZWNvbXBvc2UobSkge1xuICB2YXIgQSA9IG1bMF07XG4gIHZhciBCID0gbVsxXTtcbiAgdmFyIEMgPSBtWzJdO1xuICB2YXIgRCA9IG1bM107XG4gIHZhciBkZXRlcm1pbmFudCA9IEEgKiBEIC0gQiAqIEM7XG5cbiAgLy8gc3RlcCgxKVxuICBpZiAoIWRldGVybWluYW50KSB0aHJvdyBuZXcgRXJyb3IoJ3RyYW5zZm9ybSN1bm1hdHJpeDogbWF0cml4IGlzIHNpbmd1bGFyJyk7XG5cbiAgLy8gc3RlcCAoMylcbiAgdmFyIHNjYWxlWCA9IE1hdGguc3FydChBICogQSArIEIgKiBCKTtcbiAgQSAvPSBzY2FsZVg7XG4gIEIgLz0gc2NhbGVYO1xuXG4gIC8vIHN0ZXAgKDQpXG4gIHZhciBza2V3ID0gQSAqIEMgKyBCICogRDtcbiAgQyAtPSBBICogc2tldztcbiAgRCAtPSBCICogc2tldztcblxuICAvLyBzdGVwICg1KVxuICB2YXIgc2NhbGVZID0gTWF0aC5zcXJ0KEMgKiBDICsgRCAqIEQpO1xuICBDIC89IHNjYWxlWTtcbiAgRCAvPSBzY2FsZVk7XG4gIHNrZXcgLz0gc2NhbGVZO1xuXG4gIC8vIHN0ZXAgKDYpXG4gIGlmIChkZXRlcm1pbmFudCA8IDApIHtcbiAgICBBID0gLUE7XG4gICAgQiA9IC1CO1xuICAgIHNrZXcgPSAtc2tldztcbiAgICBzY2FsZVggPSAtc2NhbGVYO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICB0cmFuc2xhdGVYOiBtWzRdLFxuICAgIHRyYW5zbGF0ZVk6IG1bNV0sXG4gICAgcm90YXRlOiBydG9kKE1hdGguYXRhbjIoQiwgQSkpLFxuICAgIHNrZXc6IHJ0b2QoTWF0aC5hdGFuKHNrZXcpKSxcbiAgICBzY2FsZVg6IHJvdW5kKHNjYWxlWCksXG4gICAgc2NhbGVZOiByb3VuZChzY2FsZVkpXG4gIH07XG59XG5cbi8qKlxuICogU3RyaW5nIHRvIG1hdHJpeFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHlsZVxuICogQHJldHVybiB7QXJyYXl9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBwYXJzZShzdHIpIHtcbiAgdmFyIG0gPSBzdHIuc2xpY2UoNykubWF0Y2goL1tcXGRcXC5cXC1dKy9nKTtcbiAgaWYgKCFtKSByZXR1cm4gWzEsIDAsIDAsIDEsIDAsIDBdXG4gIHJldHVybiBtLmxlbmd0aCA9PSA2XG4gICAgPyBtLm1hcChOdW1iZXIpXG4gICAgOiBbXG4gICAgICAgICttWzBdICwgK21bMV0sXG4gICAgICAgICttWzRdICwgK21bNV0sXG4gICAgICAgICttWzEyXSwgK21bMTNdXG4gICAgICBdO1xufVxuXG4vKipcbiAqIFJhZGlhbnMgdG8gZGVncmVlc1xuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSByYWRpYW5zXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IGRlZ3JlZXNcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHJ0b2QocmFkaWFucykge1xuICB2YXIgZGVnID0gcmFkaWFucyAqIDE4MCAvIE1hdGguUEk7XG4gIHJldHVybiByb3VuZChkZWcpO1xufVxuXG4vKipcbiAqIFJvdW5kIHRvIHRoZSBuZWFyZXN0IGh1bmRyZWR0aFxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBuXG4gKiBAcmV0dXJuIHtOdW1iZXJ9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiByb3VuZChuKSB7XG4gIHJldHVybiBNYXRoLnJvdW5kKG4gKiAxMDApIC8gMTAwO1xufVxuIl19