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
},"/Users/jkroso/Projects/js/move/examples.original.js": function(module,exports,require){

var move = require('move')
var dom = require('dom')

dom('.example').each(function(example){
  example.initial = example.find('.sandbox').html()
  var play = example.find('button.play')
  example.find('.source code').html(highlight(example.find('.source').text()))

  if (!play.length) return run()

  play.on('mousedown', run)

  example.find('h3').append('<button class="reset">↻</button>')
  example.find('button.reset').on('mousedown', function(e){
    example.find('.sandbox').html(example.initial)
  })

  function run(){
    var boxs = example.find('.box.small').toArray()
    var box = boxs[0]
    eval(example.find('.source').text())
  }
})

/**
 * Highlight the given string of `js`.
 *
 * @param {String} js
 * @return {String}
 * @api private
 */

function highlight(js) {
  return js
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\/\/(.*)/gm, '<span class="comment">//$1</span>')
    .replace(/('.*?')/gm, '<span class="string">$1</span>')
    .replace(/(\d+\.\d+)/gm, '<span class="number">$1</span>')
    .replace(/(\d+)/gm, '<span class="number">$1</span>')
    .replace(/\bnew *(\w+)/gm, '<span class="keyword">new</span> <span class="init">$1</span>')
    .replace(/\b(function|new|throw|return|var|if|else)\b/gm, '<span class="keyword">$1</span>')
}

},"/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/df04901/index.js": function(module,exports,require){

var query = require('query')
var Move = require('./move')
var SVG = require('./svg')

module.exports = function(el){
  if (typeof el == 'string') el = query(el)
  if (el instanceof SVGElement) return new SVG(el)
  return new Move(el)
}

},"/Users/jkroso/.packin/-/github.com/component/dom/tarball/2e041f9/index.js": function(module,exports,require){
/**
 * Module dependencies.
 */

var isArray = require('isArray');
var domify = require('domify');
var events = require('event');
var query = require('query');
var trim = require('trim');
var slice = [].slice;

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

/*
 * A simple way to check for HTML strings or ID strings
 */

var quickExpr = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/;

/**
 * Expose `dom()`.
 */

module.exports = dom;

/**
 * Return a dom `List` for the given
 * `html`, selector, or element.
 *
 * @param {String|Element|List} selector
 * @param {String|ELement|context} context
 * @return {List}
 * @api public
 */

function dom(selector, context) {
  // array
  if (isArray(selector)) {
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
  var htmlselector = trim.left(selector);
  if (isHTML(htmlselector)) {
    return new List([domify(htmlselector)], htmlselector);
  }

  // selector
  var ctx = context
    ? (context instanceof List ? context[0] : context)
    : document;

  return new List(query.all(selector, ctx), selector);
}

/**
 * Static: Expose `List`
 */

dom.List = List;

/**
 * Static: Expose supported attrs.
 */

dom.attrs = attrs;

/**
 * Static: Mixin a function
 *
 * @param {Object|String} name
 * @param {Object|Function} obj
 * @return {List} self
 */

dom.use = function(name, fn) {
  var keys = [];
  var tmp;

  if (2 == arguments.length) {
    keys.push(name);
    tmp = {};
    tmp[name] = fn;
    fn = tmp;
  } else if (name.name) {
    // use function name
    fn = name;
    name = name.name;
    keys.push(name);
    tmp = {};
    tmp[name] = fn;
    fn = tmp;
  } else {
    keys = Object.keys(name);
    fn = name;
  }

  for(var i = 0, len = keys.length; i < len; i++) {
    List.prototype[keys[i]] = fn[keys[i]];
  }

  return this;
}

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
  els = els || [];
  var len = this.length = els.length;
  for(var i = 0; i < len; i++) this[i] = els[i];
  this.selector = selector;
}

/**
 * Remake the list
 *
 * @param {String|ELement|context} context
 * @return {List}
 * @api private
 */

List.prototype.dom = dom;

/**
 * Make `List` an array-like object
 */

List.prototype.length = 0;
List.prototype.splice = Array.prototype.splice;

/**
 * Array-like object to array
 *
 * @return {Array}
 */

List.prototype.toArray = function() {
  return slice.call(this);
}

/**
 * Attribute accessors.
 */

attrs.forEach(function(name){
  List.prototype[name] = function(val){
    if (0 == arguments.length) return this.attr(name);
    return this.attr(name, val);
  };
});

/**
 * Mixin the API
 */

dom.use(require('./lib/attributes'));
dom.use(require('./lib/classes'));
dom.use(require('./lib/events'));
dom.use(require('./lib/manipulate'));
dom.use(require('./lib/traverse'));

/**
 * Check if the string is HTML
 *
 * @param {String} str
 * @return {Boolean}
 * @api private
 */

function isHTML(str) {
  // Faster than running regex, if str starts with `<` and ends with `>`, assume it's HTML
  if (str.charAt(0) === '<' && str.charAt(str.length - 1) === '>' && str.length >= 3) return true;

  // Run the regex
  var match = quickExpr.exec(str);
  return !!(match && match[1]);
}

},"/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/df04901/svg.js": function(module,exports,require){

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
  render: function(n){
    n = this._ease(n)
    var tweens = this.tweens
    var style = this.el.style
    for (var k in tweens) {
      if (k in attrs) this.el.setAttribute(k, tweens[k](n))
      else this.el.style[k] = tweens[k](n)
    }
    // HACK: force redraw because chrome has some buggy optimisations
    this.el.offsetHeight 
    return this
  }
})

},"/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/df04901/move.js": function(module,exports,require){

var Animation = require('animation')
var lazy = require('lazy-property')
var unmatrix = require('unmatrix')
var tween = require('./tween')
var prefix = require('prefix')
var clone = require('clone')

module.exports = Move

/**
 * 'webkitTransform' || 'MozTransform' etc..
 * @type {String}
 */

var transform = prefix('transform')

/**
 * the Move class
 *
 * @param {Element} el
 * @api public
 */

function Move(el){
  this._to = {}
  this.el = el
}

/**
 * inherit from Animation
 */

Animation.extend(Move)

/**
 * default duration
 */

Move.prototype.duration('300ms')

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
  return getComputedStyle(this.el)[prop]
}

/**
 * Skew by `deg`
 *
 * @param {Number} deg
 * @return {this}
 * @api public
 */

Move.prototype.skew = function(deg){
  this.matrix.skew += deg
  return this
}

/**
 * Translate `x` and `y` axis.
 *
 * @param {Number} x
 * @param {Number} y
 * @param {Number} z
 * @return {this}
 * @api public
 */

Move.prototype.translate = function(x, y){
  this.matrix.translateX += x
  this.matrix.translateY += y
  return this
}

/**
 * Translate on the x axis to `n`.
 *
 * @param {Number} n
 * @return {this}
 * @api public
 */

Move.prototype.translateX =
Move.prototype.x = function(n){
  return this.translate(n, 0)
}

/**
 * Translate on the y axis to `n`.
 *
 * @param {Number} n
 * @return {this}
 * @api public
 */

Move.prototype.translateY =
Move.prototype.y = function(n){
  return this.translate(0, n)
}

/**
 * Scale the x and y axis by `x`, or
 * individually scale `x` and `y`.
 *
 * @param {Number} x
 * @param {Number} y
 * @return {this}
 * @api public
 */

Move.prototype.scale = function(x, y){
  if (y == null) y = x
  this.matrix.scaleX *= x
  this.matrix.scaleY *= y
  return this
}

/**
 * Scale x axis by `n`.
 *
 * @param {Number} n
 * @return {this}
 * @api public
 */

Move.prototype.scaleX = function(n){
  return this.scale(n, 1, 1)
}

/**
 * Scale y axis by `n`.
 *
 * @param {Number} n
 * @return {this}
 * @api public
 */

Move.prototype.scaleY = function(n){
  return this.scale(1, n, 1)
}

/**
 * Rotate `n` degrees.
 *
 * @param {Number} n
 * @return {this}
 * @api public
 */

Move.prototype.rotate = function(n){
  this.matrix.rotate += n
  return this
}

/**
 * css transformation matrix for `this.el`
 *
 * @return {Object}
 * @api private
 */

lazy(Move.prototype, 'matrix', function(){
  var matrix = this.current(transform)
  if (typeof matrix == 'string') matrix = unmatrix(matrix)
  this._to[transform] = matrix
  return matrix
})

/**
 * generated tweening functions
 *
 * @return {Object}
 * @api private
 */

lazy(Move.prototype, 'tweens', function(){
  var tweens = {}
  for (var key in this._to) {
    tweens[key] = tween(key, this.current(key), this._to[key])
  }
  return tweens
})

/**
 * render the animation at completion level `n`
 *
 * @param {Number} n
 * @return {this}
 * @api public
 */

Move.prototype.render = function(n){
  n = this._ease(n)
  var tweens = this.tweens
  var style = this.el.style
  for (var k in tweens) style[k] = tweens[k](n)
  return this
}

/**
 * Create a new Move instance which will run
 * when `this` move completes. Optionally you can
 * pass in a Move instance or Function to be run
 * on completion of `this` animation.
 *
 * @param {Move|Function} [move]
 * @return {this|DeferredMove}
 * @api public
 */

Move.prototype.then = function(move){
  if (move) {
    var fn  = typeof move != 'function'
      ? function(){ move.run() }
      : move
    this.on('end', fn)
    this.running || this.parent || this.run()
    return this
  }
  move = defer(this)
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

function defer(parent){
  var child = new parent.constructor(parent.el)
  child._duration = parent._duration
  child._ease = parent._ease
  child.parent = parent
  child.current = function(prop){
    var anim = this.parent
    do if (prop in anim._to) return clone(anim._to[prop])
    while (anim = anim.parent)
    return this.constructor.prototype.current.call(this, prop)
  }
  return child
}

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

},"/Users/jkroso/.packin/-/github.com/component/event/tarball/0.1.2/index.js": function(module,exports,require){
var bind = window.addEventListener ? 'addEventListener' : 'attachEvent',
    unbind = window.removeEventListener ? 'removeEventListener' : 'detachEvent',
    prefix = bind !== 'addEventListener' ? 'on' : '';

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
  el[bind](prefix + type, fn, capture || false);

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
  el[unbind](prefix + type, fn, capture || false);

  return fn;
};
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

},"/Users/jkroso/.packin/-/github.com/component/trim/tarball/0.0.1/index.js": function(module,exports,require){

exports = module.exports = trim;

function trim(str){
  if (str.trim) return str.trim();
  return str.replace(/^\s*|\s*$/g, '');
}

exports.left = function(str){
  if (str.trimLeft) return str.trimLeft();
  return str.replace(/^\s*/, '');
};

exports.right = function(str){
  if (str.trimRight) return str.trimRight();
  return str.replace(/\s*$/, '');
};

},"/Users/jkroso/.packin/-/github.com/component/query/tarball/0.0.2/index.js": function(module,exports,require){
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
  return exports;
};

},"/Users/jkroso/.packin/-/github.com/yields/isArray/tarball/1.0.0/index.js": function(module,exports,require){

/**
 * isArray
 */

var isArray = Array.isArray;

/**
 * toString
 */

var str = Object.prototype.toString;

/**
 * Wether or not the given `val`
 * is an array.
 *
 * example:
 *
 *        isArray([]);
 *        // > true
 *        isArray(arguments);
 *        // > false
 *        isArray('');
 *        // > false
 *
 * @param {mixed} val
 * @return {bool}
 */

module.exports = isArray || function (val) {
  return !! val && '[object Array]' == str.call(val);
};

},"/Users/jkroso/.packin/-/github.com/component/dom/tarball/2e041f9/lib/attributes.js": function(module,exports,require){
/**
 * Module Dependencies
 */

var value = require('value');

/**
 * Set attribute `name` to `val`, or get attr `name`.
 *
 * @param {String} name
 * @param {String} [val]
 * @return {String|List} self
 * @api public
 */

exports.attr = function(name, val){
  // get
  if (1 == arguments.length) {
    return this[0] && this[0].getAttribute(name);
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

exports.removeAttr = function(name){
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

exports.prop = function(name, val){
  if (1 == arguments.length) {
    return this[0] && this[0][name];
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

exports.val =
exports.value = function(val){
  if (0 == arguments.length) {
    return this[0]
      ? value(this[0])
      : undefined;
  }

  return this.forEach(function(el){
    value(el, val);
  });
};

},"/Users/jkroso/.packin/-/github.com/component/dom/tarball/2e041f9/lib/classes.js": function(module,exports,require){
/**
 * Module Dependencies
 */

var classes = require('classes');

/**
 * Add the given class `name`.
 *
 * @param {String} name
 * @return {List} self
 * @api public
 */

exports.addClass = function(name){
  return this.forEach(function(el) {
    el._classes = el._classes || classes(el);
    el._classes.add(name);
  });
};

/**
 * Remove the given class `name`.
 *
 * @param {String|RegExp} name
 * @return {List} self
 * @api public
 */

exports.removeClass = function(name){
  return this.forEach(function(el) {
    el._classes = el._classes || classes(el);
    el._classes.remove(name);
  });
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

exports.toggleClass = function(name, bool){
  var fn = 'toggle';

  // toggle with boolean
  if (2 == arguments.length) {
    fn = bool ? 'add' : 'remove';
  }

  return this.forEach(function(el) {
    el._classes = el._classes || classes(el);
    el._classes[fn](name);
  })
};

/**
 * Check if the given class `name` is present.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

exports.hasClass = function(name){
  var el;

  for(var i = 0, len = this.length; i < len; i++) {
    el = this[i];
    el._classes = el._classes || classes(el);
    if (el._classes.has(name)) return true;
  }

  return false;
};

},"/Users/jkroso/.packin/-/github.com/component/dom/tarball/2e041f9/lib/events.js": function(module,exports,require){
/**
 * Module Dependencies
 */

var events = require('event');
var delegate = require('delegate');

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

exports.on = function(event, selector, fn, capture){
  if ('string' == typeof selector) {
    return this.forEach(function (el) {
      fn._delegate = delegate.bind(el, selector, event, fn, capture);
    });
  }

  capture = fn;
  fn = selector;

  return this.forEach(function (el) {
    events.bind(el, event, fn, capture);
  });
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

exports.off = function(event, selector, fn, capture){
  if ('string' == typeof selector) {
    return this.forEach(function (el) {
      // TODO: add selector support back
      delegate.unbind(el, event, fn._delegate, capture);
    });
  }

  capture = fn;
  fn = selector;

  return this.forEach(function (el) {
    events.unbind(el, event, fn, capture);
  });
};

},"/Users/jkroso/.packin/-/github.com/component/dom/tarball/2e041f9/lib/manipulate.js": function(module,exports,require){
/**
 * Module Dependencies
 */

var value = require('value');
var css = require('css');

/**
 * Return element text.
 *
 * @param {String} str
 * @return {String|List}
 * @api public
 */

exports.text = function(str) {
  if (1 == arguments.length) {
    return this.forEach(function(el) {
      var node = document.createTextNode(str);
      el.textContent = '';
      el.appendChild(node);
    });
  }

  var out = '';
  this.forEach(function(el) {
    out += getText(el);
  });

  return out;
};

/**
 * Get text helper from Sizzle.
 *
 * Source: https://github.com/jquery/sizzle/blob/master/src/sizzle.js#L914-L947
 *
 * @param {Element|Array} el
 * @return {String}
 */

function getText(el) {
  var ret = '';
  var type = el.nodeType;
  var node;

  switch(type) {
    case 1:
    case 9:
    case 11:
      if ('string' == typeof el.textContent) return el.textContent;
      for (el = el.firstChild; el; el = el.nextSibling) ret += text(el);
      break;
    case 3:
    case 4:
      return el.nodeValue;
    default:
      while (node = el[i++]) {
        ret += getText(node);
      }
  }

  return ret;
}

/**
 * Return element html.
 *
 * @return {String} html
 * @api public
 */

exports.html = function(html) {
  if (1 == arguments.length) {
    return this.forEach(function(el) {
      el.innerHTML = html;
    });
  }

  // TODO: real impl
  return this[0] && this[0].innerHTML;
};

/**
 * Get and set the css value
 *
 * @param {String|Object} prop
 * @param {Mixed} val
 * @return {Mixed}
 * @api public
 */

exports.css = function(prop, val) {
  // getter
  if (!val && 'object' != typeof prop) {
    return css(this[0], prop);
  }
  // setter
  this.forEach(function(el) {
    css(el, prop, val);
  });

  return this;
};

/**
 * Prepend `val`.
 *
 * From jQuery: if there is more than one target element
 * cloned copies of the inserted element will be created
 * for each target after the first.
 *
 * @param {String|Element|List} val
 * @return {List} self
 * @api public
 */

exports.prepend = function(val) {
  var dom = this.dom;

  this.forEach(function(target, i) {
    dom(val).forEach(function(selector) {
      selector = i ? selector.cloneNode(true) : selector;
      if (target.children.length) {
        target.insertBefore(selector, target.firstChild);
      } else {
        target.appendChild(selector);
      }
    });
  });

  return this;
};

/**
 * Append `val`.
 *
 * From jQuery: if there is more than one target element
 * cloned copies of the inserted element will be created
 * for each target after the first.
 *
 * @param {String|Element|List} val
 * @return {List} self
 * @api public
 */

exports.append = function(val) {
  var dom = this.dom;

  this.forEach(function(target, i) {
    dom(val).forEach(function(el) {
      el = i ? el.cloneNode(true) : el;
      target.appendChild(el);
    });
  });

  return this;
};

/**
 * Insert self's `els` after `val`
 *
 * From jQuery: if there is more than one target element,
 * cloned copies of the inserted element will be created
 * for each target after the first, and that new set
 * (the original element plus clones) is returned.
 *
 * @param {String|Element|List} val
 * @return {List} self
 * @api public
 */

exports.insertAfter = function(val) {
  var dom = this.dom;

  this.forEach(function(el) {
    dom(val).forEach(function(target, i) {
      if (!target.parentNode) return;
      el = i ? el.cloneNode(true) : el;
      target.parentNode.insertBefore(el, target.nextSibling);
    });
  });

  return this;
};

/**
 * Append self's `el` to `val`
 *
 * @param {String|Element|List} val
 * @return {List} self
 * @api public
 */

exports.appendTo = function(val) {
  this.dom(val).append(this);
  return this;
};

/**
 * Replace elements in the DOM.
 *
 * @param {String|Element|List} val
 * @return {List} self
 * @api public
 */

exports.replace = function(val) {
  var self = this;
  var list = this.dom(val);

  list.forEach(function(el, i) {
    var old = self[i];
    var parent = old.parentNode;
    if (!parent) return;
    el = i ? el.cloneNode(true) : el;
    parent.replaceChild(el, old);
  });

  return this;
};

/**
 * Empty the dom list
 *
 * @return self
 * @api public
 */

exports.empty = function() {
  return this.forEach(function(el) {
    el.textContent = '';
  });
};

/**
 * Remove all elements in the dom list
 *
 * @return {List} self
 * @api public
 */

exports.remove = function() {
  return this.forEach(function(el) {
    var parent = el.parentNode;
    if (parent) parent.removeChild(el);
  });
};

/**
 * Return a cloned dom list with all elements cloned.
 *
 * @return {List}
 * @api public
 */

exports.clone = function() {
  var out = this.map(function(el) {
    return el.cloneNode(true);
  });

  return this.dom(out);
};

},"/Users/jkroso/.packin/-/github.com/component/dom/tarball/2e041f9/lib/traverse.js": function(module,exports,require){
/**
 * Module Dependencies
 */

var proto = Array.prototype;
var traverse = require('traverse');
var toFunction = require('to-function');
var matches = require('matches-selector');

/**
 * Find children matching the given `selector`.
 *
 * @param {String} selector
 * @return {List}
 * @api public
 */

exports.find = function(selector){
  return this.dom(selector, this);
};

/**
 * Check if the any element in the selection
 * matches `selector`.
 *
 * @param {String} selector
 * @return {Boolean}
 * @api public
 */

exports.is = function(selector){
  for(var i = 0, el; el = this[i]; i++) {
    if (matches(el, selector)) return true;
  }

  return false;
};

/**
 * Get parent(s) with optional `selector` and `limit`
 *
 * @param {String} selector
 * @param {Number} limit
 * @return {List}
 * @api public
 */

exports.parent = function(selector, limit){
  return this.dom(traverse('parentNode',
    this[0],
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

exports.next = function(selector, limit){
  return this.dom(traverse('nextSibling',
    this[0],
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

exports.prev =
exports.previous = function(selector, limit){
  return this.dom(traverse('previousSibling',
    this[0],
    selector,
    limit
    || 1));
};

/**
 * Iterate over each element creating a new list with
 * one item and invoking `fn(list, i)`.
 *
 * @param {Function} fn
 * @return {List} self
 * @api public
 */

exports.each = function(fn){
  var dom = this.dom;

  for (var i = 0, list, len = this.length; i < len; i++) {
    list = dom(this[i]);
    fn.call(list, list, i);
  }

  return this;
};

/**
 * Iterate over each element and invoke `fn(el, i)`
 *
 * @param {Function} fn
 * @return {List} self
 * @api public
 */

exports.forEach = function(fn) {
  for (var i = 0, len = this.length; i < len; i++) {
    fn.call(this[i], this[i], i);
  }

  return this;
};

/**
 * Map each return value from `fn(val, i)`.
 *
 * Passing a callback function:
 *
 *    inputs.map(function(input){
 *      return input.type
 *    })
 *
 * Passing a property string:
 *
 *    inputs.map('type')
 *
 * @param {Function} fn
 * @return {List} self
 * @api public
 */

exports.map = function(fn){
  fn = toFunction(fn);
  var dom = this.dom;
  var out = [];

  for (var i = 0, len = this.length; i < len; i++) {
    out.push(fn.call(dom(this[i]), this[i], i));
  }

  return this.dom(out);
};

/**
 * Select all values that return a truthy value of `fn(val, i)`.
 *
 *    inputs.select(function(input){
 *      return input.type == 'password'
 *    })
 *
 *  With a property:
 *
 *    inputs.select('type == password')
 *
 * @param {Function|String} fn
 * @return {List} self
 * @api public
 */

exports.filter =
exports.select = function(fn){
  fn = toFunction(fn);
  var dom = this.dom;
  var out = [];
  var val;

  for (var i = 0, len = this.length; i < len; i++) {
    val = fn.call(dom(this[i]), this[i], i);
    if (val) out.push(this[i]);
  }

  return this.dom(out);
};

/**
 * Reject all values that return a truthy value of `fn(val, i)`.
 *
 * Rejecting using a callback:
 *
 *    input.reject(function(user){
 *      return input.length < 20
 *    })
 *
 * Rejecting with a property:
 *
 *    items.reject('password')
 *
 * Rejecting values via `==`:
 *
 *    data.reject(null)
 *    input.reject(file)
 *
 * @param {Function|String|Mixed} fn
 * @return {List}
 * @api public
 */

exports.reject = function(fn){
  var out = [];
  var len = this.length;
  var val, i;

  if ('string' == typeof fn) fn = toFunction(fn);

  if (fn) {
    for (i = 0; i < len; i++) {
      val = fn.call(dom(this[i]), this[i], i);
      if (!val) out.push(this[i]);
    }
  } else {
    for (i = 0; i < len; i++) {
      if (this[i] != fn) out.push(this[i]);
    }
  }

  return this.dom(out);
};

/**
 * Return a `List` containing the element at `i`.
 *
 * @param {Number} i
 * @return {List}
 * @api public
 */

exports.at = function(i){
  return this.dom(this[i]);
};

/**
 * Return a `List` containing the first element.
 *
 * @param {Number} i
 * @return {List}
 * @api public
 */

exports.first = function(){
  return this.dom(this[0]);
};

/**
 * Return a `List` containing the last element.
 *
 * @param {Number} i
 * @return {List}
 * @api public
 */

exports.last = function(){
  return this.dom(this[this.length - 1]);
};

/**
 * Mixin the array functions
 */

[
  'push',
  'pop',
  'shift',
  'splice',
  'unshift',
  'reverse',
  'sort',
  'toString',
  'concat',
  'join',
  'slice'
].forEach(function(method) {
  exports[method] = function() {
    return proto[method].apply(this.toArray(), arguments);
  };
});


},"/Users/jkroso/.packin/-/github.com/jkroso/animation/tarball/0.1.0/index.js": function(module,exports,require){

var extensible = require('extensible')
var ms = require('parse-duration')
var Emitter = require('emitter')
var ease = require('ease')
var now = require('now')
var raf = require('raf')

module.exports = Animation

function Animation(){}

/**
 * mixin methods
 */

Emitter(Animation.prototype)
extensible(Animation)

/**
 * set duration to `n` milliseconds. You can also
 * pass a natural language string
 *
 * @param {Number|String} n
 * @return {this}
 */

Animation.prototype.duration = function(n){
  if (typeof n == 'string') n = ms(n)
  this._duration = n
  return this
}

/**
 * Set easing function to `fn`.
 *
 *   animation.ease('in-out-sine')
 *
 * @param {String|Function} fn
 * @return {this}
 */

Animation.prototype.ease = function(fn){
  if (typeof fn == 'string') fn = ease[fn]
  if (!fn) throw new Error('invalid easing function')
  this._ease = fn
  return this
}

Animation.prototype.ease('linear') // default

/**
 * run the animation with an optional duration
 *
 * @param {Number|String|Function} [n]
 * @return {this}
 */

Animation.prototype.run = function(n){
  if (n != null) this.duration(n)
  var duration = this._duration
  var start = now()
  var self = this
  raf(function loop(){
    var progress = (now() - start) / duration
    if (progress >= 1) {
      self.render(1)
      self.running = false
      self.emit('end')
    } else {
      self.render(progress)
      raf(loop)
    }
  })
  this.running = true
  return this
}

},"/Users/jkroso/.packin/-/github.com/jkroso/unmatrix/tarball/0.1.0/index.js": function(module,exports,require){

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

function unmatrix(str) {
  return decompose(parse(str));
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

},"/Users/jkroso/.packin/-/github.com/jkroso/clone/tarball/0.3.0/index.js": function(module,exports,require){

/**
 * Module dependencies.
 */

var type = require('type');

/**
 * Clones values
 *
 * @param {Mixed} any object
 * @api public
 */

module.exports = function(obj){
  return clone(obj, [], []);
}

/**
 * internal dispatcher. if no specific handlers are
 * available `obj` itself will be returned
 * 
 * @param {X} obj
 * @param {Array} seen
 * @param {Array} copies
 * @return {X}
 * @api private
 */

function clone(obj, seen, copies){
  var fn = handle[type(obj)];
  return fn ? fn(obj, seen, copies) : obj;
}

/**
 * type specific handlers
 * 
 * @param {X} a
 * @param {Array} seen
 * @param {Array} copies
 * @return {X}
 * @api private
 */

var handle = {
  object: function(a, seen, copies){
    var k = seen.indexOf(a);
    if (k >= 0) return copies[k];
    var copy = Object.create(a);
    copies.push(copy);
    seen.push(a);
    for (var k in a) {
      copy[k] = clone(a[k], seen, copies);
    }
    return copy;
  },
  array: copyArray,
  arguments: copyArray,
  regexp: function(a){
    var flags = ''
      + (a.multiline ? 'm' : '')
      + (a.global ? 'g' : '')
      + (a.ignoreCase ? 'i' : '')
    return new RegExp(a.source, flags);
  },
  date: function(a){
    return new Date(a.getTime());
  },
  string: unbox,
  number: unbox,
  boolean: unbox,
  element: function(a, seen, copies){
    var k = seen.indexOf(a);
    if (k >= 0) return copies[k];
    var copy = a.cloneNode(true);
    copies.push(copy);
    seen.push(a);
    return copy;
  }
}

function unbox(a){ return a.valueOf() }

function copyArray(a, seen, copies){
  var i = seen.indexOf(a);
  if (i >= 0) return copies[i];
  var copy = new Array(i = a.length);
  seen.push(a);
  copies.push(copy);
  while (i--) {
    copy[i] = clone(a[i], seen, copies);
  }
  return copy;
}

},"/Users/jkroso/.packin/-/registry.npmjs.org/prefix/-/prefix-0.2.1.tgz/index.js": function(module,exports,require){

var style = document.createElement('p').style
var prefixes = 'O ms Moz webkit'.split(' ')
var upper = /([A-Z])/g

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
exports.dash = dashedPrefix

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
  // camel case
  key = key.replace(/-([a-z])/g, function(_, char){
    return char.toUpperCase()
  })

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

/**
 * create a dasherized prefix
 *
 * @param {String} key
 * @return {String}
 * @api public
 */

function dashedPrefix(key){
  key = prefix(key)
  if (upper.test(key)) key = '-' + key.replace(upper, '-$1')
  return key.toLowerCase()
}

},"/Users/jkroso/.packin/-/registry.npmjs.org/lazy-property/-/lazy-property-0.0.2.tgz/package.json": function(module,exports,require){
module.exports = require("./lazyProperty.js")
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

},"/Users/jkroso/.packin/-/github.com/component/css/tarball/0.0.3/index.js": function(module,exports,require){
/**
 * Module Dependencies
 */

var debug = require('debug')('css');
var set = require('./lib/style');
var get = require('./lib/css');

/**
 * Expose `css`
 */

module.exports = css;

/**
 * Get and set css values
 *
 * @param {Element} el
 * @param {String|Object} prop
 * @param {Mixed} val
 * @return {Element} el
 * @api public
 */

function css(el, prop, val) {
  if (!el) return;

  if (undefined !== val) {
    var obj = {};
    obj[prop] = val;
    debug('setting styles %j', obj);
    return setStyles(el, obj);
  }

  if ('object' == typeof prop) {
    debug('setting styles %j', prop);
    return setStyles(el, prop);
  }

  debug('getting %s', prop);
  return get(el, prop);
}

/**
 * Set the styles on an element
 *
 * @param {Element} el
 * @param {Object} props
 * @return {Element} el
 */

function setStyles(el, props) {
  for (var prop in props) {
    set(el, prop, props[prop]);
  }

  return el;
}

},"/Users/jkroso/.packin/-/github.com/component/matches-selector/tarball/0.1.1/index.js": function(module,exports,require){
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

var vendor = proto.matches
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

},"/Users/jkroso/.packin/-/github.com/yields/traverse/tarball/0.1.1/index.js": function(module,exports,require){

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

},"/Users/jkroso/.packin/-/github.com/component/to-function/tarball/getter/fns/index.js": function(module,exports,require){
/**
 * Module Dependencies
 */

try {
  var expr = require('props');
} catch(e) {
  var expr = require('props-component');
}

/**
 * Expose `toFunction()`.
 */

module.exports = toFunction;

/**
 * Convert `obj` to a `Function`.
 *
 * @param {Mixed} obj
 * @return {Function}
 * @api private
 */

function toFunction(obj) {
  switch ({}.toString.call(obj)) {
    case '[object Object]':
      return objectToFunction(obj);
    case '[object Function]':
      return obj;
    case '[object String]':
      return stringToFunction(obj);
    case '[object RegExp]':
      return regexpToFunction(obj);
    default:
      return defaultToFunction(obj);
  }
}

/**
 * Default to strict equality.
 *
 * @param {Mixed} val
 * @return {Function}
 * @api private
 */

function defaultToFunction(val) {
  return function(obj){
    return val === obj;
  }
}

/**
 * Convert `re` to a function.
 *
 * @param {RegExp} re
 * @return {Function}
 * @api private
 */

function regexpToFunction(re) {
  return function(obj){
    return re.test(obj);
  }
}

/**
 * Convert property `str` to a function.
 *
 * @param {String} str
 * @return {Function}
 * @api private
 */

function stringToFunction(str) {
  // immediate such as "> 20"
  if (/^ *\W+/.test(str)) return new Function('_', 'return _ ' + str);

  // properties such as "name.first" or "age > 18" or "age > 18 && age < 36"
  return new Function('_', 'return ' + get(str));
}

/**
 * Convert `object` to a function.
 *
 * @param {Object} object
 * @return {Function}
 * @api private
 */

function objectToFunction(obj) {
  var match = {}
  for (var key in obj) {
    match[key] = typeof obj[key] === 'string'
      ? defaultToFunction(obj[key])
      : toFunction(obj[key])
  }
  return function(val){
    if (typeof val !== 'object') return false;
    for (var key in match) {
      if (!(key in val)) return false;
      if (!match[key](val[key])) return false;
    }
    return true;
  }
}

/**
 * Built the getter function. Supports getter style functions
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function get(str) {
  var props = expr(str);
  if (!props.length) return '_.' + str;

  var val;
  for(var i = 0, prop; prop = props[i]; i++) {
    val = '_.' + prop;
    val = "('function' == typeof " + val + " ? " + val + "() : " + val + ")";
    str = str.replace(new RegExp(prop, 'g'), val);
  }

  return str;
}

},"/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/df04901/tween/index.js": function(module,exports,require){

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

},"/Users/jkroso/.packin/-/registry.npmjs.org/lazy-property/-/lazy-property-0.0.2.tgz/lazyProperty.js": function(module,exports,require){
"use strict"

function addLazyProperty(object, name, initializer, enumerable) {
  Object.defineProperty(object, name, {
    get: function() {
      var v = initializer.call(this)
      Object.defineProperty(this, name, { value: v, enumerable: !!enumerable, writable: true })
      return v
    },
    set: function(v) {
      Object.defineProperty(this, name, { value: v, enumerable: !!enumerable, writable: true })
      return v
    },
    enumerable: !!enumerable,
    configurable: true
  })
}

module.exports = addLazyProperty

},"/Users/jkroso/.packin/-/github.com/jkroso/extensible/tarball/0.2.0/index.js": function(module,exports,require){

/**
 * dependencies
 */

var inherit = require('inherit');
var merge = require('merge');

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
 * make `child` inherit from `this`. Unless `final`,
 * `child` will also be made extensible. If you don't 
 * pass a `child` a new one will be created.
 *
 * @param {Function} [child]
 * @param {Boolean} [final]
 * @return {child}
 */

function extend(child, final){
  var A = this;
  var B = 'function' != typeof child
    ? function(){ A.apply(this, arguments); }
    : child;
  !final && extensible(B);
  inherit(B, A);
  if ('object' == typeof child) merge(B.prototype, child);
  return B;
};

},"/Users/jkroso/.packin/-/github.com/jkroso/emitter/tarball/0.10.0/index.js": function(module,exports,require){

var merge = require('merge')
var own = Object.hasOwnProperty
var call = Function.call

module.exports = Emitter

/**
 * Emitter constructor. Can optionally also act as a mixin
 *
 * @param {Object} [obj]
 * @return {Object}
 */

function Emitter(obj){
	if (obj) return merge(obj, Emitter.prototype)
}

/**
 * Process `event`. All arguments after `topic` will
 * be passed to all listeners
 *
 *   emitter.emit('event', new Date)
 *
 * @param {String} topic
 * @param {Any} [...args]
 * @return {this}
 */

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
		var fn
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

/**
 * Add a subscription under a topic name
 *
 *   emitter.on('event', function(data){})
 *
 * @param {String} topic
 * @param {Function} fn
 * @return {this}
 */

Emitter.prototype.on = function(topic, fn){
	if (!own.call(this, '_events')) this._events = clone(this._events)
	var events = this._events
	if (typeof events[topic] == 'function') {
		events[topic] = [events[topic], fn]
	} else if (events[topic]) {
		events[topic] = events[topic].concat(fn)
	} else {
		events[topic] = fn
	}
	return this
}

/**
 * Remove subscriptions
 *
 *   emitter.off()            // clears all listeners
 *   emitter.off('topic')     // clears all `topic` listeners
 *   emitter.off('topic', fn) // as above but only where `listener == fn`
 *
 * @param {String} [topic]
 * @param {Function} [fn]
 * @return {this}
 */

Emitter.prototype.off = function(topic, fn){
	if (!this._events) return this
	if (!own.call(this, '_events')) this._events = clone(this._events)
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
			subs = events[topic] = subs.filter(function(listener){
				return listener !== fn
			})
			// tidy
			if (subs.length == 1) events[topic] = subs[0]
			else if (!subs.length) delete events[topic]
		}
	}
	return this
}

/**
 * subscribe `fn` but remove if after its first invocation
 *
 * @param {String} topic
 * @param {Function} fn
 * @return {this}
 */

Emitter.prototype.once = function(topic, fn){
	var self = this
	return this.on(topic, function once(){
		self.off(topic, once)
		fn.apply(this, arguments)
	})
}

/**
 * see if `emitter` has any subscriptions matching
 * `topic` and optionally also `fn`
 *
 * @param {Emitter} emitter
 * @param {String} topic
 * @param {Function} [fn]
 * @return {Boolean}
 */

Emitter.hasSubscription = function(emitter, topic, fn){
	var fns = Emitter.subscriptions(emitter, topic)
	if (fn == null) return Boolean(fns.length)
	return fns.indexOf(fn) >= 0
}

/**
 * get an Array of subscriptions for `topic`
 *
 * @param {Emitter} emitter
 * @param {String} topic
 * @return {Array}
 */

Emitter.subscriptions = function(emitter, topic){
	var fns = emitter._events
	if (!fns || !(fns = fns[topic])) return []
	if (typeof fns == 'function') return [fns]
	return fns.slice()
}

function clone(obj){
	return merge({}, obj)
}

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

},"/Users/jkroso/.packin/-/github.com/jkroso/type/tarball/1.0.2/index.js": function(module,exports,require){

var toString = {}.toString
var DomNode = typeof window != 'undefined'
	? window.Node
	: Function

/**
 * Return the type of `val`.
 *
 * @param {Mixed} val
 * @return {String}
 * @api public
 */

module.exports = exports = function(x){
	var type = typeof x
	if (type != 'object') return type
	type = types[toString.call(x)]
	if (type) return type
	if (x instanceof DomNode) switch (x.nodeType) {
		case 1:  return 'element'
		case 3:  return 'text-node'
		case 9:  return 'document'
		case 11: return 'document-fragment'
		default: return 'dom-node'
	}
}

var types = exports.types = {
	'[object Function]': 'function',
	'[object Date]': 'date',
	'[object RegExp]': 'regexp',
	'[object Arguments]': 'arguments',
	'[object Array]': 'array',
	'[object String]': 'string',
	'[object Null]': 'null',
	'[object Undefined]': 'undefined',
	'[object Number]': 'number',
	'[object Boolean]': 'boolean',
	'[object Object]': 'object',
	'[object Text]': 'text-node',
	'[object Uint8Array]': '8bit-array',
	'[object Uint16Array]': '16bit-array',
	'[object Uint32Array]': '32bit-array',
	'[object Uint8ClampedArray]': '8bit-array',
	'[object Error]': 'error',
	'[object FormData]': 'form-data',
	'[object File]': 'file',
	'[object Blob]': 'blob'
}
},"/Users/jkroso/.packin/-/registry.npmjs.org/parse-duration/-/parse-duration-0.1.0.tgz/index.js": function(module,exports,require){

var duration = /(-?\d*\.?\d+(?:e[-+]?\d+)?)\s*([a-z]*)/ig

module.exports = parse

/**
 * conversion ratios
 */

parse.ms = 1
parse.seconds =
parse.second =
parse.sec =
parse.s = parse.ms * 1000
parse.minutes =
parse.minute =
parse.min =
parse.mins =
parse.m = parse.s * 60
parse.hours =
parse.hour =
parse.hr =
parse.h = parse.m * 60
parse.days =
parse.day =
parse.d = parse.h * 24
parse.weeks =
parse.week =
parse.wk =
parse.w = parse.d * 7
parse.years =
parse.year =
parse.yr =
parse.y = parse.d * 365.25

/**
 * convert `str` to ms
 *
 * @param {String} str
 * @return {Number}
 */

function parse(str){
	var result = 0
	str.replace(duration, function(_, n, units){
		result += parseFloat(n, 10) * (parse[units] || 1)
	})
	return result
}

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

},"/Users/jkroso/.packin/-/github.com/component/raf/tarball/1.1.2/index.js": function(module,exports,require){
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
  var req = setTimeout(fn, ms);
  prev = curr;
  return req;
}

/**
 * Cancel.
 */

var cancel = window.cancelAnimationFrame
  || window.webkitCancelAnimationFrame
  || window.mozCancelAnimationFrame
  || window.oCancelAnimationFrame
  || window.msCancelAnimationFrame
  || window.clearTimeout;

exports.cancel = function(id){
  cancel.call(window, id);
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

},"/Users/jkroso/.packin/-/github.com/component/indexof/tarball/0.0.2/index.js": function(module,exports,require){
module.exports = function(arr, obj){
  if (arr.indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
},"/Users/jkroso/.packin/-/github.com/visionmedia/debug/tarball/0.7.4/index.js": function(module,exports,require){
if ('undefined' == typeof window) {
  module.exports = require('./lib/debug');
} else {
  module.exports = require('./debug');
}

},"/Users/jkroso/.packin/-/github.com/component/css/tarball/0.0.3/lib/css.js": function(module,exports,require){
/**
 * Module Dependencies
 */

var debug = require('debug')('css:css');
var camelcase = require('to-camel-case');
var computed = require('./computed');
var property = require('./prop');

/**
 * Expose `css`
 */

module.exports = css;

/**
 * CSS Normal Transforms
 */

var cssNormalTransform = {
  letterSpacing: 0,
  fontWeight: 400
};

/**
 * Get a CSS value
 *
 * @param {Element} el
 * @param {String} prop
 * @param {Mixed} extra
 * @param {Array} styles
 * @return {String}
 */

function css(el, prop, extra, styles) {
  var hooks = require('./hooks');
  var orig = camelcase(prop);
  var style = el.style;
  var val;

  prop = property(prop, style);
  var hook = hooks[prop] || hooks[orig];

  // If a hook was provided get the computed value from there
  if (hook && hook.get) {
    debug('get hook provided. use that');
    val = hook.get(el, true, extra);
  }

  // Otherwise, if a way to get the computed value exists, use that
  if (undefined == val) {
    debug('fetch the computed value of %s', prop);
    val = computed(el, prop);
  }

  if ('normal' == val && cssNormalTransform[prop]) {
    val = cssNormalTransform[prop];
    debug('normal => %s', val);
  }

  // Return, converting to number if forced or a qualifier was provided and val looks numeric
  if ('' == extra || extra) {
    debug('converting value: %s into a number');
    var num = parseFloat(val);
    return true === extra || isNumeric(num) ? num || 0 : val;
  }

  return val;
}

/**
 * Is Numeric
 *
 * @param {Mixed} obj
 * @return {Boolean}
 */

function isNumeric(obj) {
  return !isNan(parseFloat(obj)) && isFinite(obj);
}

},"/Users/jkroso/.packin/-/github.com/component/css/tarball/0.0.3/lib/style.js": function(module,exports,require){
/**
 * Module Dependencies
 */

var debug = require('debug')('css:style');
var camelcase = require('to-camel-case');
var support = require('./support');
var property = require('./prop');
var hooks = require('./hooks');

/**
 * Expose `style`
 */

module.exports = style;

/**
 * Possibly-unitless properties
 *
 * Don't automatically add 'px' to these properties
 */

var cssNumber = {
  "columnCount": true,
  "fillOpacity": true,
  "fontWeight": true,
  "lineHeight": true,
  "opacity": true,
  "order": true,
  "orphans": true,
  "widows": true,
  "zIndex": true,
  "zoom": true
};

/**
 * Set a css value
 *
 * @param {Element} el
 * @param {String} prop
 * @param {Mixed} val
 * @param {Mixed} extra
 */

function style(el, prop, val, extra) {
  // Don't set styles on text and comment nodes
  if (!el || el.nodeType === 3 || el.nodeType === 8 || !el.style ) return;

  var orig = camelcase(prop);
  var style = el.style;
  var type = typeof val;

  if (!val) return get(el, prop, orig, extra);

  prop = property(prop, style);

  var hook = hooks[prop] || hooks[orig];

  // If a number was passed in, add 'px' to the (except for certain CSS properties)
  if ('number' == type && !cssNumber[orig]) {
    debug('adding "px" to end of number');
    val += 'px';
  }

  // Fixes jQuery #8908, it can be done more correctly by specifying setters in cssHooks,
  // but it would mean to define eight (for every problematic property) identical functions
  if (!support.clearCloneStyle && '' === val && 0 === prop.indexOf('background')) {
    debug('set property (%s) value to "inherit"', prop);
    style[prop] = 'inherit';
  }

  // If a hook was provided, use that value, otherwise just set the specified value
  if (!hook || !hook.set || undefined !== (val = hook.set(el, val, extra))) {
    // Support: Chrome, Safari
    // Setting style to blank string required to delete "style: x !important;"
    debug('set hook defined. setting property (%s) to %s', prop, val);
    style[prop] = '';
    style[prop] = val;
  }

}

/**
 * Get the style
 *
 * @param {Element} el
 * @param {String} prop
 * @param {String} orig
 * @param {Mixed} extra
 * @return {String}
 */

function get(el, prop, orig, extra) {
  var style = el.style;
  var hook = hooks[prop] || hooks[orig];
  var ret;

  if (hook && hook.get && undefined !== (ret = hook.get(el, false, extra))) {
    debug('get hook defined, returning: %s', ret);
    return ret;
  }

  ret = style[prop];
  debug('getting %s', ret);
  return ret;
}

},"/Users/jkroso/.packin/-/github.com/component/props/tarball/1.1.0/index.js": function(module,exports,require){

/**
 * Return immediate identifiers parsed from `str`.
 *
 * @param {String} str
 * @param {String|Function} map function or prefix
 * @return {Array}
 * @api public
 */

module.exports = function(str, fn){
  var p = unique(props(str));
  if (fn && 'string' == typeof fn) fn = prefixed(fn);
  if (fn) return map(str, p, fn);
  return p;
};

/**
 * Return immediate identifiers in `str`.
 *
 * @param {String} str
 * @return {Array}
 * @api private
 */

function props(str) {
  return str
    .replace(/\.\w+|\w+ *\(|"[^"]*"|'[^']*'|\/([^/]+)\//g, '')
    .match(/[a-zA-Z_]\w*/g)
    || [];
}

/**
 * Return `str` with `props` mapped with `fn`.
 *
 * @param {String} str
 * @param {Array} props
 * @param {Function} fn
 * @return {String}
 * @api private
 */

function map(str, props, fn) {
  var re = /\.\w+|\w+ *\(|"[^"]*"|'[^']*'|\/([^/]+)\/|[a-zA-Z_]\w*/g;
  return str.replace(re, function(_){
    if ('(' == _[_.length - 1]) return fn(_);
    if (!~props.indexOf(_)) return _;
    return fn(_);
  });
}

/**
 * Return unique array.
 *
 * @param {Array} arr
 * @return {Array}
 * @api private
 */

function unique(arr) {
  var ret = [];

  for (var i = 0; i < arr.length; i++) {
    if (~ret.indexOf(arr[i])) continue;
    ret.push(arr[i]);
  }

  return ret;
}

/**
 * Map with prefix `str`.
 */

function prefixed(str) {
  return function(_){
    return str + _;
  }
}

},"/Users/jkroso/.packin/-/registry.npmjs.org/props-component/-/props-component-1.0.3.tgz/index.js": function(module,exports,require){

/**
 * Return immediate identifiers parsed from `str`.
 *
 * @param {String} str
 * @return {Array}
 * @api public
 */

module.exports = function(str, prefix){
  var p = unique(props(str));
  if (prefix) return prefixed(str, p, prefix);
  return p;
};

/**
 * Return immediate identifiers in `str`.
 *
 * @param {String} str
 * @return {Array}
 * @api private
 */

function props(str) {
  return str
    .replace(/\.\w+|\w+ *\(|"[^"]*"|'[^']*'|\/([^/]+)\//g, '')
    .match(/[a-zA-Z_]\w*/g)
    || [];
}

/**
 * Return `str` with `props` prefixed with `prefix`.
 *
 * @param {String} str
 * @param {Array} props
 * @param {String} prefix
 * @return {String}
 * @api private
 */

function prefixed(str, props, prefix) {
  var re = /\.\w+|\w+ *\(|"[^"]*"|'[^']*'|\/([^/]+)\/|[a-zA-Z_]\w*/g;
  return str.replace(re, function(_){
    if ('(' == _[_.length - 1]) return prefix + _;
    if (!~props.indexOf(_)) return _;
    return prefix + _;
  });
}

/**
 * Return unique array.
 *
 * @param {Array} arr
 * @return {Array}
 * @api private
 */

function unique(arr) {
  var ret = [];

  for (var i = 0; i < arr.length; i++) {
    if (~ret.indexOf(arr[i])) continue;
    ret.push(arr[i]);
  }

  return ret;
}

},"/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/df04901/tween/matrix.js": function(module,exports,require){

var tween = require('string-tween')
var unmatrix = require('unmatrix')
var keys = Object.keys

module.exports = function(from, to){
  return tween(normalize(from), normalize(to))
}

function normalize(m){
  if (typeof m == 'string') m = unmatrix(m)
  return keys(unit).reduce(function(str, key){
    return str + key + '(' + m[key] + unit[key] + ')'
  }, '')
}

var unit = {
  translateX: 'px',
  translateY: 'px',
  rotate: 'deg',
  skew: 'deg',
  scaleX: '',
  scaleY: ''
}
},"/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/df04901/tween/number.js": function(module,exports,require){

module.exports = function(from, to){
  from = parseFloat(from, 10) || 0
  to = parseFloat(to, 10) || 0
  return function frame(n){
    return from + (to - from) * n
  }
}

},"/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/df04901/tween/path.js": function(module,exports,require){

var toString = require('serialize-svg-path')
var balance = require('balance-svg-paths')
var tween = require('string-tween')
var normalize = require('fcomp')(
  require('parse-svg-path'),
  require('abs-svg-path'),
  require('normalize-svg-path'),
  require('rel-svg-path'))

module.exports = function(from, to){
  var ends = balance(normalize(from), normalize(to))
  return tween(toString(ends[0]), toString(ends[1]))
}

},"/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/df04901/tween/color.js": function(module,exports,require){

var parse = require('color-parser')
var round = Math.round

module.exports = function(from, to){
  from = rgba(from)
  to = rgba(to)
  var curr = to.slice()
  return function frame(n){
    for (var i = 0; i < 3; i++) {
      curr[i] = round(from[i] + (to[i] - from[i]) * n)
    }
    // don't round alpha
    curr[3] = from[i] + (to[i] - from[i]) * n
    return 'rgba(' + curr + ')'
  }
}

function rgba(color){
  color = parse(color)
  if (!color) return [255,255,255,0] // transparent
  return [
    color.r,
    color.g,
    color.b,
    (color.a == null ? 1 : color.a)
  ]
}

},"/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/df04901/tween/px.js": function(module,exports,require){

var tween = require('./number')

module.exports = function(from, to){
  var frame = tween(from, to)
  return function(n){
    return frame(n).toFixed(1) + 'px'
  }
}

},"/Users/jkroso/.packin/-/registry.npmjs.org/color-parser/-/color-parser-0.1.0.tgz/index.js": function(module,exports,require){

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


},"/Users/jkroso/.packin/-/github.com/nathan7/inherit/tarball/f1a75b4844/index.js": function(module,exports,require){

module.exports = function(a, b){
  var fn = function(){};
  fn.prototype = b.prototype;
  a.prototype = new fn;
  a.prototype.constructor = a;
};
},"/Users/jkroso/.packin/-/github.com/yields/merge/tarball/2f357cb501/index.js": function(module,exports,require){

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

},"/Users/jkroso/.packin/-/github.com/yields/merge/tarball/2f357cb/index.js": function(module,exports,require){

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

},"/Users/jkroso/.packin/-/github.com/visionmedia/debug/tarball/0.7.4/debug.js": function(module,exports,require){

/**
 * Expose `debug()` as the module.
 */

module.exports = debug;

/**
 * Create a debugger with the given `name`.
 *
 * @param {String} name
 * @return {Type}
 * @api public
 */

function debug(name) {
  if (!debug.enabled(name)) return function(){};

  return function(fmt){
    fmt = coerce(fmt);

    var curr = new Date;
    var ms = curr - (debug[name] || curr);
    debug[name] = curr;

    fmt = name
      + ' '
      + fmt
      + ' +' + debug.humanize(ms);

    // This hackery is required for IE8
    // where `console.log` doesn't have 'apply'
    window.console
      && console.log
      && Function.prototype.apply.call(console.log, console, arguments);
  }
}

/**
 * The currently active debug mode names.
 */

debug.names = [];
debug.skips = [];

/**
 * Enables a debug mode by name. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} name
 * @api public
 */

debug.enable = function(name) {
  try {
    localStorage.debug = name;
  } catch(e){}

  var split = (name || '').split(/[\s,]+/)
    , len = split.length;

  for (var i = 0; i < len; i++) {
    name = split[i].replace('*', '.*?');
    if (name[0] === '-') {
      debug.skips.push(new RegExp('^' + name.substr(1) + '$'));
    }
    else {
      debug.names.push(new RegExp('^' + name + '$'));
    }
  }
};

/**
 * Disable debug output.
 *
 * @api public
 */

debug.disable = function(){
  debug.enable('');
};

/**
 * Humanize the given `ms`.
 *
 * @param {Number} m
 * @return {String}
 * @api private
 */

debug.humanize = function(ms) {
  var sec = 1000
    , min = 60 * 1000
    , hour = 60 * min;

  if (ms >= hour) return (ms / hour).toFixed(1) + 'h';
  if (ms >= min) return (ms / min).toFixed(1) + 'm';
  if (ms >= sec) return (ms / sec | 0) + 's';
  return ms + 'ms';
};

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

debug.enabled = function(name) {
  for (var i = 0, len = debug.skips.length; i < len; i++) {
    if (debug.skips[i].test(name)) {
      return false;
    }
  }
  for (var i = 0, len = debug.names.length; i < len; i++) {
    if (debug.names[i].test(name)) {
      return true;
    }
  }
  return false;
};

/**
 * Coerce `val`.
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

// persist

try {
  if (window.localStorage) debug.enable(localStorage.debug);
} catch(e){}

},"/Users/jkroso/.packin/-/github.com/visionmedia/debug/tarball/0.7.4/lib/debug.js": function(module,exports,require){
/**
 * Module dependencies.
 */

var tty = require('tty');

/**
 * Expose `debug()` as the module.
 */

module.exports = debug;

/**
 * Enabled debuggers.
 */

var names = []
  , skips = [];

(process.env.DEBUG || '')
  .split(/[\s,]+/)
  .forEach(function(name){
    name = name.replace('*', '.*?');
    if (name[0] === '-') {
      skips.push(new RegExp('^' + name.substr(1) + '$'));
    } else {
      names.push(new RegExp('^' + name + '$'));
    }
  });

/**
 * Colors.
 */

var colors = [6, 2, 3, 4, 5, 1];

/**
 * Previous debug() call.
 */

var prev = {};

/**
 * Previously assigned color.
 */

var prevColor = 0;

/**
 * Is stdout a TTY? Colored output is disabled when `true`.
 */

var isatty = tty.isatty(2);

/**
 * Select a color.
 *
 * @return {Number}
 * @api private
 */

function color() {
  return colors[prevColor++ % colors.length];
}

/**
 * Humanize the given `ms`.
 *
 * @param {Number} m
 * @return {String}
 * @api private
 */

function humanize(ms) {
  var sec = 1000
    , min = 60 * 1000
    , hour = 60 * min;

  if (ms >= hour) return (ms / hour).toFixed(1) + 'h';
  if (ms >= min) return (ms / min).toFixed(1) + 'm';
  if (ms >= sec) return (ms / sec | 0) + 's';
  return ms + 'ms';
}

/**
 * Create a debugger with the given `name`.
 *
 * @param {String} name
 * @return {Type}
 * @api public
 */

function debug(name) {
  function disabled(){}
  disabled.enabled = false;

  var match = skips.some(function(re){
    return re.test(name);
  });

  if (match) return disabled;

  match = names.some(function(re){
    return re.test(name);
  });

  if (!match) return disabled;
  var c = color();

  function colored(fmt) {
    fmt = coerce(fmt);

    var curr = new Date;
    var ms = curr - (prev[name] || curr);
    prev[name] = curr;

    fmt = '  \u001b[9' + c + 'm' + name + ' '
      + '\u001b[3' + c + 'm\u001b[90m'
      + fmt + '\u001b[3' + c + 'm'
      + ' +' + humanize(ms) + '\u001b[0m';

    console.error.apply(this, arguments);
  }

  function plain(fmt) {
    fmt = coerce(fmt);

    fmt = new Date().toUTCString()
      + ' ' + name + ' ' + fmt;
    console.error.apply(this, arguments);
  }

  colored.enabled = plain.enabled = true;

  return isatty || process.env.DEBUG_COLORS
    ? colored
    : plain;
}

/**
 * Coerce `val`.
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

},"/Users/jkroso/.packin/-/github.com/component/css/tarball/0.0.3/lib/computed.js": function(module,exports,require){
/**
 * Module Dependencies
 */

var debug = require('debug')('css:computed');
var withinDocument = require('within-document');
var styles = require('./styles');

/**
 * Expose `computed`
 */

module.exports = computed;

/**
 * Get the computed style
 *
 * @param {Element} el
 * @param {String} prop
 * @param {Array} precomputed (optional)
 * @return {Array}
 * @api private
 */

function computed(el, prop, precomputed) {
  computed = precomputed || styles(el);
  if (!computed) return;

  var ret = computed.getPropertyValue(prop) || computed[prop];

  if ('' === ret && !withinDocument(el)) {
    debug('element not within document, try finding from style attribute');
    var style = require('./style');
    ret = style(el, prop);
  }

  debug('computed value of %s: %s', prop, ret);

  // Support: IE
  // IE returns zIndex value as an integer.
  return undefined === ret ? ret : ret + '';
}

},"/Users/jkroso/.packin/-/github.com/component/css/tarball/0.0.3/lib/prop.js": function(module,exports,require){
/**
 * Module dependencies
 */

var debug = require('debug')('css:prop');
var camelcase = require('to-camel-case');
var vendor = require('./vendor');

/**
 * Export `prop`
 */

module.exports = prop;

/**
 * Normalize Properties
 */

var cssProps = {
  'float': 'cssFloat'
};

/**
 * Get the vendor prefixed property
 *
 * @param {String} prop
 * @param {String} style
 * @return {String} prop
 * @api private
 */

function prop(prop, style) {
  prop = cssProps[prop] || (cssProps[prop] = vendor(prop, style));
  debug('transform property: %s => %s');
  return prop;
}

},"/Users/jkroso/.packin/-/github.com/component/css/tarball/0.0.3/lib/hooks.js": function(module,exports,require){
/**
 * Module Dependencies
 */

var css = require('./css');
var cssShow = { position: 'absolute', visibility: 'hidden', display: 'block' };
var pnum = (/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/).source;
var rnumnonpx = new RegExp( '^(' + pnum + ')(?!px)[a-z%]+$', 'i');
var rnumsplit = new RegExp( '^(' + pnum + ')(.*)$', 'i');
var rdisplayswap = /^(none|table(?!-c[ea]).+)/;
var styles = require('./styles');
var support = require('./support');
var swap = require('./swap');
var computed = require('./computed');
var cssExpand = [ "Top", "Right", "Bottom", "Left" ];

/**
 * Height & Width
 */

['width', 'height'].forEach(function(name) {
  exports[name] = {};

  exports[name].get = function(el, compute, extra) {
    if (!compute) return;
    // certain elements can have dimension info if we invisibly show them
    // however, it must have a current display style that would benefit from this
    return 0 == el.offsetWidth && rdisplayswap.test(css(el, 'display'))
      ? swap(el, cssShow, function() { return getWidthOrHeight(el, name, extra); })
      : getWidthOrHeight(el, name, extra);
  }

  exports[name].set = function(el, val, extra) {
    var styles = extra && styles(el);
    return setPositiveNumber(el, val, extra
      ? augmentWidthOrHeight(el, name, extra, 'border-box' == css(el, 'boxSizing', false, styles), styles)
      : 0
    );
  };

});

/**
 * Opacity
 */

exports.opacity = {};
exports.opacity.get = function(el, compute) {
  if (!compute) return;
  var ret = computed(el, 'opacity');
  return '' == ret ? '1' : ret;
}

/**
 * Utility: Set Positive Number
 *
 * @param {Element} el
 * @param {Mixed} val
 * @param {Number} subtract
 * @return {Number}
 */

function setPositiveNumber(el, val, subtract) {
  var matches = rnumsplit.exec(val);
  return matches ?
    // Guard against undefined 'subtract', e.g., when used as in cssHooks
    Math.max(0, matches[1]) + (matches[2] || 'px') :
    val;
}

/**
 * Utility: Get the width or height
 *
 * @param {Element} el
 * @param {String} prop
 * @param {Mixed} extra
 * @return {String}
 */

function getWidthOrHeight(el, prop, extra) {
  // Start with offset property, which is equivalent to the border-box value
  var valueIsBorderBox = true;
  var val = prop === 'width' ? el.offsetWidth : el.offsetHeight;
  var styles = computed(el);
  var isBorderBox = support.boxSizing && css(el, 'boxSizing') === 'border-box';

  // some non-html elements return undefined for offsetWidth, so check for null/undefined
  // svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
  // MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
  if (val <= 0 || val == null) {
    // Fall back to computed then uncomputed css if necessary
    val = computed(el, prop, styles);

    if (val < 0 || val == null) {
      val = el.style[prop];
    }

    // Computed unit is not pixels. Stop here and return.
    if (rnumnonpx.test(val)) {
      return val;
    }

    // we need the check for style in case a browser which returns unreliable values
    // for getComputedStyle silently falls back to the reliable el.style
    valueIsBorderBox = isBorderBox && (support.boxSizingReliable() || val === el.style[prop]);

    // Normalize ', auto, and prepare for extra
    val = parseFloat(val) || 0;
  }

  // use the active box-sizing model to add/subtract irrelevant styles
  extra = extra || (isBorderBox ? 'border' : 'content');
  val += augmentWidthOrHeight(el, prop, extra, valueIsBorderBox, styles);
  return val + 'px';
}

/**
 * Utility: Augment the width or the height
 *
 * @param {Element} el
 * @param {String} prop
 * @param {Mixed} extra
 * @param {Boolean} isBorderBox
 * @param {Array} styles
 */

function augmentWidthOrHeight(el, prop, extra, isBorderBox, styles) {
  // If we already have the right measurement, avoid augmentation,
  // Otherwise initialize for horizontal or vertical properties
  var i = extra === (isBorderBox ? 'border' : 'content') ? 4 : 'width' == prop ? 1 : 0;
  var val = 0;

  for (; i < 4; i += 2) {
    // both box models exclude margin, so add it if we want it
    if (extra === 'margin') {
      val += css(el, extra + cssExpand[i], true, styles);
    }

    if (isBorderBox) {
      // border-box includes padding, so remove it if we want content
      if (extra === 'content') {
        val -= css(el, 'padding' + cssExpand[i], true, styles);
      }

      // at this point, extra isn't border nor margin, so remove border
      if (extra !== 'margin') {
        val -= css(el, 'border' + cssExpand[i] + 'Width', true, styles);
      }
    } else {
      // at this point, extra isn't content, so add padding
      val += css(el, 'padding' + cssExpand[i], true, styles);

      // at this point, extra isn't content nor padding, so add border
      if (extra !== 'padding') {
        val += css(el, 'border' + cssExpand[i] + 'Width', true, styles);
      }
    }
  }

  return val;
}

},"/Users/jkroso/.packin/-/github.com/component/css/tarball/0.0.3/lib/support.js": function(module,exports,require){
/**
 * Support values
 */

var reliableMarginRight;
var boxSizingReliableVal;
var pixelPositionVal;
var clearCloneStyle;

/**
 * Container setup
 */

var docElem = document.documentElement;
var container = document.createElement('div');
var div = document.createElement('div');

/**
 * Clear clone style
 */

div.style.backgroundClip = 'content-box';
div.cloneNode(true).style.backgroundClip = '';
exports.clearCloneStyle = div.style.backgroundClip === 'content-box';

container.style.cssText = 'border:0;width:0;height:0;position:absolute;top:0;left:-9999px;margin-top:1px';
container.appendChild(div);

/**
 * Pixel position
 *
 * Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
 * getComputedStyle returns percent when specified for top/left/bottom/right
 * rather than make the css module depend on the offset module, we just check for it here
 */

exports.pixelPosition = function() {
  if (undefined == pixelPositionVal) computePixelPositionAndBoxSizingReliable();
  return pixelPositionVal;
}

/**
 * Reliable box sizing
 */

exports.boxSizingReliable = function() {
  if (undefined == boxSizingReliableVal) computePixelPositionAndBoxSizingReliable();
  return boxSizingReliableVal;
}

/**
 * Reliable margin right
 *
 * Support: Android 2.3
 * Check if div with explicit width and no margin-right incorrectly
 * gets computed margin-right based on width of container. (#3333)
 * WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
 * This support function is only executed once so no memoizing is needed.
 *
 * @return {Boolean}
 */

exports.reliableMarginRight = function() {
  var ret;
  var marginDiv = div.appendChild(document.createElement("div" ));

  marginDiv.style.cssText = div.style.cssText = divReset;
  marginDiv.style.marginRight = marginDiv.style.width = "0";
  div.style.width = "1px";
  docElem.appendChild(container);

  ret = !parseFloat(window.getComputedStyle(marginDiv, null).marginRight);

  docElem.removeChild(container);

  // Clean up the div for other support tests.
  div.innerHTML = "";

  return ret;
}

/**
 * Executing both pixelPosition & boxSizingReliable tests require only one layout
 * so they're executed at the same time to save the second computation.
 */

function computePixelPositionAndBoxSizingReliable() {
  // Support: Firefox, Android 2.3 (Prefixed box-sizing versions).
  div.style.cssText = "-webkit-box-sizing:border-box;-moz-box-sizing:border-box;" +
    "box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;" +
    "position:absolute;top:1%";
  docElem.appendChild(container);

  var divStyle = window.getComputedStyle(div, null);
  pixelPositionVal = divStyle.top !== "1%";
  boxSizingReliableVal = divStyle.width === "4px";

  docElem.removeChild(container);
}



},"/Users/jkroso/.packin/-/github.com/ianstormtaylor/to-camel-case/tarball/0.2.1/index.js": function(module,exports,require){

var toSpace = require('to-space-case');


/**
 * Expose `toCamelCase`.
 */

module.exports = toCamelCase;


/**
 * Convert a `string` to camel case.
 *
 * @param {String} string
 * @return {String}
 */


function toCamelCase (string) {
  return toSpace(string).replace(/\s(\w)/g, function (matches, letter) {
    return letter.toUpperCase();
  });
}
},"/Users/jkroso/.packin/-/registry.npmjs.org/color-parser/-/color-parser-0.1.0.tgz/colors.js": function(module,exports,require){

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
},"/Users/jkroso/.packin/-/registry.npmjs.org/string-tween/-/string-tween-0.1.0.tgz/index.js": function(module,exports,require){

/**
 * number pattern
 * @type {RegExp}
 */

var number = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g

module.exports = tween

/**
 * create a tween generator from `a` to `b`
 *
 * @param {String} a
 * @param {String} b
 * @return {Function}
 */

function tween(a, b){
	var string = []
	var keys = []
	var from = []
	var to = []
	var cursor = 0
	var m

	while (m = number.exec(b)) {
		if (m.index > cursor) string.push(b.slice(cursor, m.index))
		to.push(Number(m[0]))
		keys.push(string.length)
		string.push(null)
		cursor = number.lastIndex
	}
	if (cursor < b.length) string.push(b.slice(cursor))

	while (m = number.exec(a)) from.push(Number(m[0]))

	return function frame(n){
		var i = keys.length
		while (i--) string[keys[i]] = from[i] + (to[i] - from[i]) * n
		return string.join('')
	}
}

},"/Users/jkroso/.packin/-/registry.npmjs.org/serialize-svg-path/-/serialize-svg-path-0.1.0.tgz/index.js": function(module,exports,require){

module.exports = serialize

/**
 * convert `path` to a string
 *
 * @param {Array} path
 * @return {String}
 */

function serialize(path){
	return path.reduce(function(str, seg){
		return str + seg[0] + seg.slice(1).join(',')
	}, '')
}

},"/Users/jkroso/.packin/-/registry.npmjs.org/balance-svg-paths/-/balance-svg-paths-0.1.0.tgz/index.js": function(module,exports,require){

module.exports = balance

/**
 * define `a` and `b` using the same number of
 * path segments while preserving their shape
 *
 * @param {Array} a
 * @param {Array} b
 * @return {Array}
 */

function balance(a, b){
  var diff = a.length - b.length
  var short = diff >= 0 ? b : a
  diff = Math.abs(diff)
  while (diff--) short.push(['c',0,0,0,0,0,0])
  return [a, b]
}

},"/Users/jkroso/.packin/-/registry.npmjs.org/fcomp/-/fcomp-1.1.0.tgz/index.js": function(module,exports,require){
var apply = Function.prototype.apply
module.exports = fcomp

function fcomp() {
  var fns = arguments
    , len = fns.length
    , fn = function() {
        var val = apply.call(fns[0], null, arguments)
        for (var i = 1; i < len; i++)
          val = fns[i](val)
        return val
      }
  for (var i = 0; i < len; i++)
    fn.displayName = (fn.displayName || '')
      + (i === 0 ? '' : ' · ')
      + fns[i].name
  return fn
}

fcomp.reverse = function() {
  return fcomp.apply(null, [].slice.call(arguments).reverse())
}

},"/Users/jkroso/.packin/-/registry.npmjs.org/parse-svg-path/-/parse-svg-path-0.1.1.tgz/index.js": function(module,exports,require){

module.exports = parse

/**
 * expected argument lengths
 * @type {Object}
 */

var length = {a: 7, c: 6, h: 1, l: 2, m: 2, q: 4, s: 4, t: 2, v: 1, z: 0}

/**
 * segment pattern
 * @type {RegExp}
 */

var segment = /([astvzqmhlc])([^astvzqmhlc]*)/ig

/**
 * parse an svg path data string. Generates an Array
 * of commands where each command is an Array of the
 * form `[command, arg1, arg2, ...]`
 *
 * @param {String} path
 * @return {Array}
 */

function parse(path) {
	var data = []
	path.replace(segment, function(_, command, args){
		var type = command.toLowerCase()
		args = parseValues(args)

		// overloaded moveTo
		if (type == 'm' && args.length > 2) {
			data.push([command].concat(args.splice(0, 2)))
			type = 'l'
			command = command == 'm' ? 'l' : 'L'
		}

		while (true) {
			if (args.length == length[type]) {
				args.unshift(command)
				return data.push(args)
			}
			if (args.length < length[type]) throw new Error('malformed path data')
			data.push([command].concat(args.splice(0, length[type])))
		}
	})
	return data
}

function parseValues(args){
	args = args.match(/-?[.0-9]+(?:e[-+]?\d+)?/ig)
	return args ? args.map(Number) : []
}

},"/Users/jkroso/.packin/-/registry.npmjs.org/abs-svg-path/-/abs-svg-path-0.1.1.tgz/index.js": function(module,exports,require){

module.exports = absolutize

/**
 * redefine `path` with absolute coordinates
 *
 * @param {Array} path
 * @return {Array}
 */

function absolutize(path){
	var startX = 0
	var startY = 0
	var x = 0
	var y = 0

	return path.map(function(seg){
		seg = seg.slice()
		var type = seg[0]
		var command = type.toUpperCase()

		// is relative
		if (type != command) {
			seg[0] = command
			switch (type) {
				case 'a':
					seg[6] += x
					seg[7] += y
					break
				case 'v':
					seg[1] += y
					break
				case 'h':
					seg[1] += x
					break
				default:
					for (var i = 1; i < seg.length;) {
						seg[i++] += x
						seg[i++] += y
					}
			}
		}

		// update cursor state
		switch (command) {
			case 'Z':
				x = startX
				y = startY
				break
			case 'H':
				x = seg[1]
				break
			case 'V':
				y = seg[1]
				break
			case 'M':
				x = startX = seg[1]
				y = startY = seg[2]
				break
			default:
				x = seg[seg.length - 2]
				y = seg[seg.length - 1]
		}

		return seg
	})
}

},"/Users/jkroso/.packin/-/registry.npmjs.org/normalize-svg-path/-/normalize-svg-path-0.1.0.tgz/index.js": function(module,exports,require){

var π = Math.PI
var _120 = radians(120)

module.exports = normalize

/**
 * describe `path` in terms of cubic bézier 
 * curves and move commands
 *
 * @param {Array} path
 * @return {Array}
 */

function normalize(path){
	// init state
	var prev
	var result = []
	var bezierX = 0
	var bezierY = 0
	var startX = 0
	var startY = 0
	var quadX = null
	var quadY = null
	var x = 0
	var y = 0

	for (var i = 0, len = path.length; i < len; i++) {
		var seg = path[i]
		var command = seg[0]
		switch (command) {
			case 'M':
				startX = seg[1]
				startY = seg[2]
				break
			case 'A':
				seg = arc(x, y,seg[1],seg[2],radians(seg[3]),seg[4],seg[5],seg[6],seg[7])
				// split multi part
				seg.unshift('C')
				if (seg.length > 7) {
					result.push(seg.splice(0, 7))
					seg.unshift('C')
				}
				break
			case 'S':
				// default control point
				var cx = x
				var cy = y
				if (prev == 'C' || prev == 'S') {
					cx += cx - bezierX // reflect the previous command's control
					cy += cy - bezierY // point relative to the current point
				}
				seg = ['C', cx, cy, seg[1], seg[2], seg[3], seg[4]]
				break
			case 'T':
				if (prev == 'Q' || prev == 'T') {
					quadX = x * 2 - quadX // as with 'S' reflect previous control point
					quadY = y * 2 - quadY
				} else {
					quadX = x
					quadY = y
				}
				seg = quadratic(x, y, quadX, quadY, seg[1], seg[2])
				break
			case 'Q':
				quadX = seg[1]
				quadY = seg[2]
				seg = quadratic(x, y, seg[1], seg[2], seg[3], seg[4])
				break
			case 'L':
				seg = line(x, y, seg[1], seg[2])
				break
			case 'H':
				seg = line(x, y, seg[1], y)
				break
			case 'V':
				seg = line(x, y, x, seg[1])
				break
			case 'Z':
				seg = line(x, y, startX, startY)
				break
		}

		// update state
		prev = command
		x = seg[seg.length - 2]
		y = seg[seg.length - 1]
		if (seg.length > 4) {
			bezierX = seg[seg.length - 4]
			bezierY = seg[seg.length - 3]
		} else {
			bezierX = x
			bezierY = y
		}
		result.push(seg)
	}

	return result
}

function line(x1, y1, x2, y2){
	return ['C', x1, y1, x2, y2, x2, y2]
}

function quadratic(x1, y1, cx, cy, x2, y2){
	return [
		'C',
		x1/3 + (2/3) * cx,
		y1/3 + (2/3) * cy,
		x2/3 + (2/3) * cx,
		y2/3 + (2/3) * cy,
		x2,
		y2
	]
}

// This function is ripped from 
// github.com/DmitryBaranovskiy/raphael/blob/4d97d4/raphael.js#L2216-L2304 
// which references w3.org/TR/SVG11/implnote.html#ArcImplementationNotes
// TODO: make it human readable

function arc(x1, y1, rx, ry, angle, large_arc_flag, sweep_flag, x2, y2, recursive) {
	if (!recursive) {
		var xy = rotate(x1, y1, -angle)
		x1 = xy.x
		y1 = xy.y
		xy = rotate(x2, y2, -angle)
		x2 = xy.x
		y2 = xy.y
		var x = (x1 - x2) / 2
		var y = (y1 - y2) / 2
		var h = (x * x) / (rx * rx) + (y * y) / (ry * ry)
		if (h > 1) {
			h = Math.sqrt(h)
			rx = h * rx
			ry = h * ry
		}
		var rx2 = rx * rx
		var ry2 = ry * ry
		var k = (large_arc_flag == sweep_flag ? -1 : 1)
			* Math.sqrt(Math.abs((rx2 * ry2 - rx2 * y * y - ry2 * x * x) / (rx2 * y * y + ry2 * x * x)))
		if (k == Infinity) k = 1 // neutralize
		var cx = k * rx * y / ry + (x1 + x2) / 2
		var cy = k * -ry * x / rx + (y1 + y2) / 2
		var f1 = Math.asin(((y1 - cy) / ry).toFixed(9))
		var f2 = Math.asin(((y2 - cy) / ry).toFixed(9))

		f1 = x1 < cx ? π - f1 : f1
		f2 = x2 < cx ? π - f2 : f2
		if (f1 < 0) f1 = π * 2 + f1
		if (f2 < 0) f2 = π * 2 + f2
		if (sweep_flag && f1 > f2) f1 = f1 - π * 2
		if (!sweep_flag && f2 > f1) f2 = f2 - π * 2
	} else {
		f1 = recursive[0]
		f2 = recursive[1]
		cx = recursive[2]
		cy = recursive[3]
	}
	// greater than 120 degrees requires multiple segments
	if (Math.abs(f2 - f1) > _120) {
		var f2old = f2
		var x2old = x2
		var y2old = y2
		f2 = f1 + _120 * (sweep_flag && f2 > f1 ? 1 : -1)
		x2 = cx + rx * Math.cos(f2)
		y2 = cy + ry * Math.sin(f2)
		var res = arc(x2, y2, rx, ry, angle, 0, sweep_flag, x2old, y2old, [f2, f2old, cx, cy])
	}
	var t = Math.tan((f2 - f1) / 4)
	var hx = 4 / 3 * rx * t
	var hy = 4 / 3 * ry * t
	var curve = [
		2 * x1 - (x1 + hx * Math.sin(f1)),
		2 * y1 - (y1 - hy * Math.cos(f1)),
		x2 + hx * Math.sin(f2),
		y2 - hy * Math.cos(f2),
		x2,
		y2
	]
	if (recursive) return curve
	if (res) curve = curve.concat(res)
	for (var i = 0; i < curve.length;) {
		var rot = rotate(curve[i], curve[i+1], angle)
		curve[i++] = rot.x
		curve[i++] = rot.y
	}
	return curve
}

function rotate(x, y, rad){
	return {
		x: x * Math.cos(rad) - y * Math.sin(rad),
		y: x * Math.sin(rad) + y * Math.cos(rad)
	}
}

function radians(degress){
	return degress * (π / 180)
}

},"/Users/jkroso/.packin/-/registry.npmjs.org/rel-svg-path/-/rel-svg-path-0.1.0.tgz/index.js": function(module,exports,require){

module.exports = relative

/**
 * define `path` using relative points
 *
 * @param {Array} path
 * @return {Array}
 */

function relative(path){
	var startX = 0
	var startY = 0
	var x = 0
	var y = 0

	return path.map(function(seg){
		seg = seg.slice()
		var type = seg[0]
		var command = type.toLowerCase()

		// is absolute
		if (type != command) {
			seg[0] = command
			switch (type) {
				case 'A':
					seg[6] -= x
					seg[7] -= y
					break
				case 'V':
					seg[1] -= y
					break
				case 'H':
					seg[1] -= x
					break
				default:
					for (var i = 1; i < seg.length;) {
						seg[i++] -= x
						seg[i++] -= y
					}
			}
		}

		// update cursor state
		switch (command) {
			case 'z':
				x = startX
				y = startY
				break
			case 'h':
				x += seg[1]
				break
			case 'v':
				y += seg[1]
				break
			case 'm':
				x += seg[1] 
				y += seg[2]
				startX += seg[1]
				startY += seg[2]
				break
			default:
				x += seg[seg.length - 2]
				y += seg[seg.length - 1]
		}

		return seg
	})
}

},"/Users/jkroso/.packin/-/github.com/component/css/tarball/0.0.3/lib/styles.js": function(module,exports,require){
/**
 * Expose `styles`
 */

module.exports = styles;

/**
 * Get all the styles
 *
 * @param {Element} el
 * @return {Array}
 */

function styles(el) {
  return el.ownerDocument.defaultView.getComputedStyle(el, null);
}

},"/Users/jkroso/.packin/-/github.com/component/css/tarball/0.0.3/lib/vendor.js": function(module,exports,require){
/**
 * Module Dependencies
 */

var prefixes = ['Webkit', 'O', 'Moz', 'ms'];

/**
 * Expose `vendor`
 */

module.exports = vendor;

/**
 * Get the vendor prefix for a given property
 *
 * @param {String} prop
 * @param {Object} style
 * @return {String}
 */

function vendor(prop, style) {
  // shortcut for names that are not vendor prefixed
  if (style[prop]) return prop;

  // check for vendor prefixed names
  var capName = prop[0].toUpperCase() + prop.slice(1);
  var original = prop;
  var i = prefixes.length;

  while (i--) {
    prop = prefixes[i] + capName;
    if (prop in style) return prop;
  }

  return original;
}

},"/Users/jkroso/.packin/-/github.com/component/css/tarball/0.0.3/lib/swap.js": function(module,exports,require){
/**
 * Export `swap`
 */

module.exports = swap;

/**
 * Initialize `swap`
 *
 * @param {Element} el
 * @param {Object} options
 * @param {Function} fn
 * @param {Array} args
 * @return {Mixed}
 */

function swap(el, options, fn, args) {
  // Remember the old values, and insert the new ones
  for (var key in options) {
    old[key] = el.style[key];
    el.style[key] = options[key];
  }

  ret = fn.apply(el, args || []);

  // Revert the old values
  for (key in options) {
    el.style[key] = old[key];
  }

  return ret;
}

},"/Users/jkroso/.packin/-/github.com/component/within-document/tarball/0.0.1/index.js": function(module,exports,require){

/**
 * Check if `el` is within the document.
 *
 * @param {Element} el
 * @return {Boolean}
 * @api private
 */

module.exports = function(el) {
  var node = el;
  while (node = node.parentNode) {
    if (node == document) return true;
  }
  return false;
};
},"/Users/jkroso/.packin/-/registry.npmjs.org/to-space-case/-/to-space-case-0.1.2.tgz/index.js": function(module,exports,require){

var clean = require('to-no-case');


/**
 * Expose `toSpaceCase`.
 */

module.exports = toSpaceCase;


/**
 * Convert a `string` to space case.
 *
 * @param {String} string
 * @return {String}
 */


function toSpaceCase (string) {
  return clean(string).replace(/[\W_]+(.|$)/g, function (matches, match) {
    return match ? ' ' + match : '';
  });
}
},"/Users/jkroso/.packin/-/registry.npmjs.org/to-no-case/-/to-no-case-0.1.1.tgz/index.js": function(module,exports,require){

/**
 * Expose `toNoCase`.
 */

module.exports = toNoCase;


/**
 * Test whether a string is camel-case.
 */

var hasSpace = /\s/;
var hasCamel = /[a-z][A-Z]/;
var hasSeparator = /[\W_]/;


/**
 * Remove any starting case from a `string`, like camel or snake, but keep
 * spaces and punctuation that may be important otherwise.
 *
 * @param {String} string
 * @return {String}
 */

function toNoCase (string) {
  if (hasSpace.test(string)) return string.toLowerCase();

  if (hasSeparator.test(string)) string = unseparate(string);
  if (hasCamel.test(string)) string = uncamelize(string);
  return string.toLowerCase();
}


/**
 * Separator splitter.
 */

var separatorSplitter = /[\W_]+(.|$)/g;


/**
 * Un-separate a `string`.
 *
 * @param {String} string
 * @return {String}
 */

function unseparate (string) {
  return string.replace(separatorSplitter, function (m, next) {
    return next ? ' ' + next : '';
  });
}


/**
 * Camelcase splitter.
 */

var camelSplitter = /(.)([A-Z]+)/g;


/**
 * Un-camelcase a `string`.
 *
 * @param {String} string
 * @return {String}
 */

function uncamelize (string) {
  return string.replace(camelSplitter, function (m, previous, uppers) {
    return previous + ' ' + uppers.toLowerCase().split('').join(' ');
  });
}
},"/Users/jkroso/.packin/-/registry.npmjs.org/browser-builtins/-/browser-builtins-2.0.0.tgz/builtin/tty.js": function(module,exports,require){

exports.isatty = function () { return false; };

function ReadStream() {
  throw new Error('tty.ReadStream is not implemented');
}
exports.ReadStream = ReadStream;

function WriteStream() {
  throw new Error('tty.ReadStream is not implemented');
}
exports.WriteStream = WriteStream;

}},{
  "/Users/jkroso/Projects/js/move/examples.js": "/Users/jkroso/Projects/js/move/examples.original.js",
  "/Users/jkroso/Projects/js/move/node_modules/move/index.js": "/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/df04901/index.js",
  "/Users/jkroso/Projects/js/move/node_modules/dom/index.js": "/Users/jkroso/.packin/-/github.com/component/dom/tarball/2e041f9/index.js",
  "/Users/jkroso/.packin/-/github.com/component/dom/tarball/2e041f9/node_modules/domify/index.js": "/Users/jkroso/.packin/-/github.com/component/domify/tarball/1.0.0/index.js",
  "/Users/jkroso/.packin/-/github.com/component/dom/tarball/2e041f9/node_modules/event/index.js": "/Users/jkroso/.packin/-/github.com/component/event/tarball/0.1.2/index.js",
  "/Users/jkroso/.packin/-/github.com/component/delegate/tarball/0.1.0/node_modules/event/index.js": "/Users/jkroso/.packin/-/github.com/component/event/tarball/0.1.2/index.js",
  "/Users/jkroso/.packin/-/github.com/component/dom/tarball/2e041f9/node_modules/query/index.js": "/Users/jkroso/.packin/-/github.com/component/query/tarball/0.0.1/index.js",
  "/Users/jkroso/.packin/-/github.com/component/dom/tarball/2e041f9/node_modules/trim/index.js": "/Users/jkroso/.packin/-/github.com/component/trim/tarball/0.0.1/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/df04901/node_modules/query/index.js": "/Users/jkroso/.packin/-/github.com/component/query/tarball/0.0.2/index.js",
  "/Users/jkroso/.packin/-/github.com/component/matches-selector/tarball/0.1.1/node_modules/query/index.js": "/Users/jkroso/.packin/-/github.com/component/query/tarball/0.0.2/index.js",
  "/Users/jkroso/.packin/-/github.com/component/dom/tarball/2e041f9/node_modules/isArray/index.js": "/Users/jkroso/.packin/-/github.com/yields/isArray/tarball/1.0.0/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/df04901/node_modules/animation/index.js": "/Users/jkroso/.packin/-/github.com/jkroso/animation/tarball/0.1.0/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/df04901/node_modules/unmatrix/index.js": "/Users/jkroso/.packin/-/github.com/jkroso/unmatrix/tarball/0.1.0/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/df04901/node_modules/clone/index.js": "/Users/jkroso/.packin/-/github.com/jkroso/clone/tarball/0.3.0/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/df04901/node_modules/prefix/index.js": "/Users/jkroso/.packin/-/registry.npmjs.org/prefix/-/prefix-0.2.1.tgz/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/df04901/node_modules/lazy-property/package.json": "/Users/jkroso/.packin/-/registry.npmjs.org/lazy-property/-/lazy-property-0.0.2.tgz/package.json",
  "/Users/jkroso/.packin/-/github.com/component/dom/tarball/2e041f9/node_modules/value/index.js": "/Users/jkroso/.packin/-/github.com/component/value/tarball/1.1.0/index.js",
  "/Users/jkroso/.packin/-/github.com/component/dom/tarball/2e041f9/node_modules/classes/index.js": "/Users/jkroso/.packin/-/github.com/component/classes/tarball/1.1.2/index.js",
  "/Users/jkroso/.packin/-/github.com/component/dom/tarball/2e041f9/node_modules/delegate/index.js": "/Users/jkroso/.packin/-/github.com/component/delegate/tarball/0.1.0/index.js",
  "/Users/jkroso/.packin/-/github.com/component/dom/tarball/2e041f9/node_modules/css/index.js": "/Users/jkroso/.packin/-/github.com/component/css/tarball/0.0.3/index.js",
  "/Users/jkroso/.packin/-/github.com/component/dom/tarball/2e041f9/node_modules/matches-selector/index.js": "/Users/jkroso/.packin/-/github.com/component/matches-selector/tarball/0.1.1/index.js",
  "/Users/jkroso/.packin/-/github.com/component/delegate/tarball/0.1.0/node_modules/matches-selector/index.js": "/Users/jkroso/.packin/-/github.com/component/matches-selector/tarball/0.1.1/index.js",
  "/Users/jkroso/.packin/-/github.com/yields/traverse/tarball/0.1.1/node_modules/matches-selector/index.js": "/Users/jkroso/.packin/-/github.com/component/matches-selector/tarball/0.1.1/index.js",
  "/Users/jkroso/.packin/-/github.com/component/dom/tarball/2e041f9/node_modules/traverse/index.js": "/Users/jkroso/.packin/-/github.com/yields/traverse/tarball/0.1.1/index.js",
  "/Users/jkroso/.packin/-/github.com/component/dom/tarball/2e041f9/node_modules/to-function/index.js": "/Users/jkroso/.packin/-/github.com/component/to-function/tarball/getter/fns/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/animation/tarball/0.1.0/node_modules/extensible/index.js": "/Users/jkroso/.packin/-/github.com/jkroso/extensible/tarball/0.2.0/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/animation/tarball/0.1.0/node_modules/emitter/index.js": "/Users/jkroso/.packin/-/github.com/jkroso/emitter/tarball/0.10.0/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/animation/tarball/0.1.0/node_modules/now/index.js": "/Users/jkroso/.packin/-/github.com/jkroso/now/tarball/0.1.1/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/clone/tarball/0.3.0/node_modules/type/index.js": "/Users/jkroso/.packin/-/github.com/jkroso/type/tarball/1.0.2/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/animation/tarball/0.1.0/node_modules/parse-duration/index.js": "/Users/jkroso/.packin/-/registry.npmjs.org/parse-duration/-/parse-duration-0.1.0.tgz/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/animation/tarball/0.1.0/node_modules/ease/index.js": "/Users/jkroso/.packin/-/github.com/component/ease/tarball/1.0.0/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/animation/tarball/0.1.0/node_modules/raf/index.js": "/Users/jkroso/.packin/-/github.com/component/raf/tarball/1.1.2/index.js",
  "/Users/jkroso/.packin/-/github.com/component/value/tarball/1.1.0/node_modules/type/index.js": "/Users/jkroso/.packin/-/github.com/component/type/tarball/1.0.0/index.js",
  "/Users/jkroso/.packin/-/github.com/component/classes/tarball/1.1.2/node_modules/indexof/index.js": "/Users/jkroso/.packin/-/github.com/component/indexof/tarball/0.0.2/index.js",
  "/Users/jkroso/.packin/-/github.com/component/css/tarball/0.0.3/node_modules/debug/index.js": "/Users/jkroso/.packin/-/github.com/visionmedia/debug/tarball/0.7.4/index.js",
  "/Users/jkroso/.packin/-/github.com/component/to-function/tarball/getter/fns/node_modules/props/index.js": "/Users/jkroso/.packin/-/github.com/component/props/tarball/1.1.0/index.js",
  "/Users/jkroso/.packin/-/github.com/component/to-function/tarball/getter/fns/node_modules/props-component/index.js": "/Users/jkroso/.packin/-/registry.npmjs.org/props-component/-/props-component-1.0.3.tgz/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/df04901/node_modules/color-parser/index.js": "/Users/jkroso/.packin/-/registry.npmjs.org/color-parser/-/color-parser-0.1.0.tgz/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/extensible/tarball/0.2.0/node_modules/inherit/index.js": "/Users/jkroso/.packin/-/github.com/nathan7/inherit/tarball/f1a75b4844/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/extensible/tarball/0.2.0/node_modules/merge/index.js": "/Users/jkroso/.packin/-/github.com/yields/merge/tarball/2f357cb501/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/emitter/tarball/0.10.0/node_modules/merge/index.js": "/Users/jkroso/.packin/-/github.com/yields/merge/tarball/2f357cb/index.js",
  "/Users/jkroso/.packin/-/github.com/component/css/tarball/0.0.3/node_modules/to-camel-case/index.js": "/Users/jkroso/.packin/-/github.com/ianstormtaylor/to-camel-case/tarball/0.2.1/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/df04901/node_modules/string-tween/index.js": "/Users/jkroso/.packin/-/registry.npmjs.org/string-tween/-/string-tween-0.1.0.tgz/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/df04901/node_modules/serialize-svg-path/index.js": "/Users/jkroso/.packin/-/registry.npmjs.org/serialize-svg-path/-/serialize-svg-path-0.1.0.tgz/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/df04901/node_modules/balance-svg-paths/index.js": "/Users/jkroso/.packin/-/registry.npmjs.org/balance-svg-paths/-/balance-svg-paths-0.1.0.tgz/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/df04901/node_modules/fcomp/index.js": "/Users/jkroso/.packin/-/registry.npmjs.org/fcomp/-/fcomp-1.1.0.tgz/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/df04901/node_modules/parse-svg-path/index.js": "/Users/jkroso/.packin/-/registry.npmjs.org/parse-svg-path/-/parse-svg-path-0.1.1.tgz/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/df04901/node_modules/abs-svg-path/index.js": "/Users/jkroso/.packin/-/registry.npmjs.org/abs-svg-path/-/abs-svg-path-0.1.1.tgz/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/df04901/node_modules/normalize-svg-path/index.js": "/Users/jkroso/.packin/-/registry.npmjs.org/normalize-svg-path/-/normalize-svg-path-0.1.0.tgz/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/df04901/node_modules/rel-svg-path/index.js": "/Users/jkroso/.packin/-/registry.npmjs.org/rel-svg-path/-/rel-svg-path-0.1.0.tgz/index.js",
  "/Users/jkroso/.packin/-/github.com/component/css/tarball/0.0.3/node_modules/within-document/index.js": "/Users/jkroso/.packin/-/github.com/component/within-document/tarball/0.0.1/index.js",
  "/Users/jkroso/.packin/-/github.com/ianstormtaylor/to-camel-case/tarball/0.2.1/node_modules/to-space-case/index.js": "/Users/jkroso/.packin/-/registry.npmjs.org/to-space-case/-/to-space-case-0.1.2.tgz/index.js",
  "/Users/jkroso/.packin/-/registry.npmjs.org/to-space-case/-/to-space-case-0.1.2.tgz/node_modules/to-no-case/index.js": "/Users/jkroso/.packin/-/registry.npmjs.org/to-no-case/-/to-no-case-0.1.1.tgz/index.js",
  "/node_modules/tty.js": "/Users/jkroso/.packin/-/registry.npmjs.org/browser-builtins/-/browser-builtins-2.0.0.tgz/builtin/tty.js"
})("/Users/jkroso/Projects/js/move/examples.original.js")
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL1VzZXJzL2prcm9zby9Qcm9qZWN0cy9qcy9tb3ZlL2V4YW1wbGVzLm9yaWdpbmFsLmpzIiwic291cmNlcyI6WyIvbm9kZV9tb2R1bGVzL2Nzcy1pbnN0YWxsLmpzIiwiL25vZGVfbW9kdWxlcy9qYWRlLXJ1bnRpbWUuanMiLCIvVXNlcnMvamtyb3NvL1Byb2plY3RzL2pzL21vdmUvZXhhbXBsZXMub3JpZ2luYWwuanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2prcm9zby9tb3ZlL3RhcmJhbGwvZGYwNDkwMS9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vY29tcG9uZW50L2RvbS90YXJiYWxsLzJlMDQxZjkvaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2prcm9zby9tb3ZlL3RhcmJhbGwvZGYwNDkwMS9zdmcuanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2prcm9zby9tb3ZlL3RhcmJhbGwvZGYwNDkwMS9tb3ZlLmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9jb21wb25lbnQvZG9taWZ5L3RhcmJhbGwvMS4wLjAvaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2NvbXBvbmVudC9ldmVudC90YXJiYWxsLzAuMS4yL2luZGV4LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9jb21wb25lbnQvcXVlcnkvdGFyYmFsbC8wLjAuMS9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vY29tcG9uZW50L3RyaW0vdGFyYmFsbC8wLjAuMS9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vY29tcG9uZW50L3F1ZXJ5L3RhcmJhbGwvMC4wLjIvaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL3lpZWxkcy9pc0FycmF5L3RhcmJhbGwvMS4wLjAvaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2NvbXBvbmVudC9kb20vdGFyYmFsbC8yZTA0MWY5L2xpYi9hdHRyaWJ1dGVzLmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9jb21wb25lbnQvZG9tL3RhcmJhbGwvMmUwNDFmOS9saWIvY2xhc3Nlcy5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vY29tcG9uZW50L2RvbS90YXJiYWxsLzJlMDQxZjkvbGliL2V2ZW50cy5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vY29tcG9uZW50L2RvbS90YXJiYWxsLzJlMDQxZjkvbGliL21hbmlwdWxhdGUuanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2NvbXBvbmVudC9kb20vdGFyYmFsbC8yZTA0MWY5L2xpYi90cmF2ZXJzZS5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vamtyb3NvL2FuaW1hdGlvbi90YXJiYWxsLzAuMS4wL2luZGV4LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9qa3Jvc28vdW5tYXRyaXgvdGFyYmFsbC8wLjEuMC9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vamtyb3NvL2Nsb25lL3RhcmJhbGwvMC4zLjAvaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9yZWdpc3RyeS5ucG1qcy5vcmcvcHJlZml4Ly0vcHJlZml4LTAuMi4xLnRnei9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL3JlZ2lzdHJ5Lm5wbWpzLm9yZy9sYXp5LXByb3BlcnR5Ly0vbGF6eS1wcm9wZXJ0eS0wLjAuMi50Z3ovcGFja2FnZS5qc29uIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9jb21wb25lbnQvdmFsdWUvdGFyYmFsbC8xLjEuMC9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vY29tcG9uZW50L2NsYXNzZXMvdGFyYmFsbC8xLjEuMi9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vY29tcG9uZW50L2RlbGVnYXRlL3RhcmJhbGwvMC4xLjAvaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2NvbXBvbmVudC9jc3MvdGFyYmFsbC8wLjAuMy9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vY29tcG9uZW50L21hdGNoZXMtc2VsZWN0b3IvdGFyYmFsbC8wLjEuMS9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20veWllbGRzL3RyYXZlcnNlL3RhcmJhbGwvMC4xLjEvaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2NvbXBvbmVudC90by1mdW5jdGlvbi90YXJiYWxsL2dldHRlci9mbnMvaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2prcm9zby9tb3ZlL3RhcmJhbGwvZGYwNDkwMS90d2Vlbi9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL3JlZ2lzdHJ5Lm5wbWpzLm9yZy9sYXp5LXByb3BlcnR5Ly0vbGF6eS1wcm9wZXJ0eS0wLjAuMi50Z3ovbGF6eVByb3BlcnR5LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9qa3Jvc28vZXh0ZW5zaWJsZS90YXJiYWxsLzAuMi4wL2luZGV4LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9qa3Jvc28vZW1pdHRlci90YXJiYWxsLzAuMTAuMC9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vamtyb3NvL25vdy90YXJiYWxsLzAuMS4xL2luZGV4LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9qa3Jvc28vdHlwZS90YXJiYWxsLzEuMC4yL2luZGV4LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vcmVnaXN0cnkubnBtanMub3JnL3BhcnNlLWR1cmF0aW9uLy0vcGFyc2UtZHVyYXRpb24tMC4xLjAudGd6L2luZGV4LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9jb21wb25lbnQvZWFzZS90YXJiYWxsLzEuMC4wL2luZGV4LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9jb21wb25lbnQvcmFmL3RhcmJhbGwvMS4xLjIvaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2NvbXBvbmVudC90eXBlL3RhcmJhbGwvMS4wLjAvaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2NvbXBvbmVudC9pbmRleG9mL3RhcmJhbGwvMC4wLjIvaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL3Zpc2lvbm1lZGlhL2RlYnVnL3RhcmJhbGwvMC43LjQvaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2NvbXBvbmVudC9jc3MvdGFyYmFsbC8wLjAuMy9saWIvY3NzLmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9jb21wb25lbnQvY3NzL3RhcmJhbGwvMC4wLjMvbGliL3N0eWxlLmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9jb21wb25lbnQvcHJvcHMvdGFyYmFsbC8xLjEuMC9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL3JlZ2lzdHJ5Lm5wbWpzLm9yZy9wcm9wcy1jb21wb25lbnQvLS9wcm9wcy1jb21wb25lbnQtMS4wLjMudGd6L2luZGV4LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9qa3Jvc28vbW92ZS90YXJiYWxsL2RmMDQ5MDEvdHdlZW4vbWF0cml4LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9qa3Jvc28vbW92ZS90YXJiYWxsL2RmMDQ5MDEvdHdlZW4vbnVtYmVyLmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9qa3Jvc28vbW92ZS90YXJiYWxsL2RmMDQ5MDEvdHdlZW4vcGF0aC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vamtyb3NvL21vdmUvdGFyYmFsbC9kZjA0OTAxL3R3ZWVuL2NvbG9yLmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9qa3Jvc28vbW92ZS90YXJiYWxsL2RmMDQ5MDEvdHdlZW4vcHguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9yZWdpc3RyeS5ucG1qcy5vcmcvY29sb3ItcGFyc2VyLy0vY29sb3ItcGFyc2VyLTAuMS4wLnRnei9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vbmF0aGFuNy9pbmhlcml0L3RhcmJhbGwvZjFhNzViNDg0NC9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20veWllbGRzL21lcmdlL3RhcmJhbGwvMmYzNTdjYjUwMS9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20veWllbGRzL21lcmdlL3RhcmJhbGwvMmYzNTdjYi9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vdmlzaW9ubWVkaWEvZGVidWcvdGFyYmFsbC8wLjcuNC9kZWJ1Zy5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vdmlzaW9ubWVkaWEvZGVidWcvdGFyYmFsbC8wLjcuNC9saWIvZGVidWcuanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2NvbXBvbmVudC9jc3MvdGFyYmFsbC8wLjAuMy9saWIvY29tcHV0ZWQuanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2NvbXBvbmVudC9jc3MvdGFyYmFsbC8wLjAuMy9saWIvcHJvcC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vY29tcG9uZW50L2Nzcy90YXJiYWxsLzAuMC4zL2xpYi9ob29rcy5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vY29tcG9uZW50L2Nzcy90YXJiYWxsLzAuMC4zL2xpYi9zdXBwb3J0LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9pYW5zdG9ybXRheWxvci90by1jYW1lbC1jYXNlL3RhcmJhbGwvMC4yLjEvaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9yZWdpc3RyeS5ucG1qcy5vcmcvY29sb3ItcGFyc2VyLy0vY29sb3ItcGFyc2VyLTAuMS4wLnRnei9jb2xvcnMuanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9yZWdpc3RyeS5ucG1qcy5vcmcvc3RyaW5nLXR3ZWVuLy0vc3RyaW5nLXR3ZWVuLTAuMS4wLnRnei9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL3JlZ2lzdHJ5Lm5wbWpzLm9yZy9zZXJpYWxpemUtc3ZnLXBhdGgvLS9zZXJpYWxpemUtc3ZnLXBhdGgtMC4xLjAudGd6L2luZGV4LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vcmVnaXN0cnkubnBtanMub3JnL2JhbGFuY2Utc3ZnLXBhdGhzLy0vYmFsYW5jZS1zdmctcGF0aHMtMC4xLjAudGd6L2luZGV4LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vcmVnaXN0cnkubnBtanMub3JnL2Zjb21wLy0vZmNvbXAtMS4xLjAudGd6L2luZGV4LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vcmVnaXN0cnkubnBtanMub3JnL3BhcnNlLXN2Zy1wYXRoLy0vcGFyc2Utc3ZnLXBhdGgtMC4xLjEudGd6L2luZGV4LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vcmVnaXN0cnkubnBtanMub3JnL2Ficy1zdmctcGF0aC8tL2Ficy1zdmctcGF0aC0wLjEuMS50Z3ovaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9yZWdpc3RyeS5ucG1qcy5vcmcvbm9ybWFsaXplLXN2Zy1wYXRoLy0vbm9ybWFsaXplLXN2Zy1wYXRoLTAuMS4wLnRnei9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL3JlZ2lzdHJ5Lm5wbWpzLm9yZy9yZWwtc3ZnLXBhdGgvLS9yZWwtc3ZnLXBhdGgtMC4xLjAudGd6L2luZGV4LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9jb21wb25lbnQvY3NzL3RhcmJhbGwvMC4wLjMvbGliL3N0eWxlcy5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vY29tcG9uZW50L2Nzcy90YXJiYWxsLzAuMC4zL2xpYi92ZW5kb3IuanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2NvbXBvbmVudC9jc3MvdGFyYmFsbC8wLjAuMy9saWIvc3dhcC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vY29tcG9uZW50L3dpdGhpbi1kb2N1bWVudC90YXJiYWxsLzAuMC4xL2luZGV4LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vcmVnaXN0cnkubnBtanMub3JnL3RvLXNwYWNlLWNhc2UvLS90by1zcGFjZS1jYXNlLTAuMS4yLnRnei9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL3JlZ2lzdHJ5Lm5wbWpzLm9yZy90by1uby1jYXNlLy0vdG8tbm8tY2FzZS0wLjEuMS50Z3ovaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9yZWdpc3RyeS5ucG1qcy5vcmcvYnJvd3Nlci1idWlsdGlucy8tL2Jyb3dzZXItYnVpbHRpbnMtMi4wLjAudGd6L2J1aWx0aW4vdHR5LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FEdk1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FFSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNU5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkVBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcktBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9IQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25KQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNySkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHRleHQpIHtcblx0dmFyIHN0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKVxuXHRzdHlsZS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh0ZXh0KSlcblx0ZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXS5hcHBlbmRDaGlsZChzdHlsZSlcbn0iLCJcclxuLyohXHJcbiAqIEphZGUgLSBydW50aW1lXHJcbiAqIENvcHlyaWdodChjKSAyMDEwIFRKIEhvbG93YXljaHVrIDx0akB2aXNpb24tbWVkaWEuY2E+XHJcbiAqIE1JVCBMaWNlbnNlZFxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBMYW1lIEFycmF5LmlzQXJyYXkoKSBwb2x5ZmlsbCBmb3Igbm93LlxyXG4gKi9cclxuXHJcbmlmICghQXJyYXkuaXNBcnJheSkge1xyXG4gIEFycmF5LmlzQXJyYXkgPSBmdW5jdGlvbihhcnIpe1xyXG4gICAgcmV0dXJuICdbb2JqZWN0IEFycmF5XScgPT0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGFycik7XHJcbiAgfTtcclxufVxyXG5cclxuLyoqXHJcbiAqIExhbWUgT2JqZWN0LmtleXMoKSBwb2x5ZmlsbCBmb3Igbm93LlxyXG4gKi9cclxuXHJcbmlmICghT2JqZWN0LmtleXMpIHtcclxuICBPYmplY3Qua2V5cyA9IGZ1bmN0aW9uKG9iail7XHJcbiAgICB2YXIgYXJyID0gW107XHJcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XHJcbiAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkoa2V5KSkge1xyXG4gICAgICAgIGFyci5wdXNoKGtleSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBhcnI7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogTWVyZ2UgdHdvIGF0dHJpYnV0ZSBvYmplY3RzIGdpdmluZyBwcmVjZWRlbmNlXHJcbiAqIHRvIHZhbHVlcyBpbiBvYmplY3QgYGJgLiBDbGFzc2VzIGFyZSBzcGVjaWFsLWNhc2VkXHJcbiAqIGFsbG93aW5nIGZvciBhcnJheXMgYW5kIG1lcmdpbmcvam9pbmluZyBhcHByb3ByaWF0ZWx5XHJcbiAqIHJlc3VsdGluZyBpbiBhIHN0cmluZy5cclxuICpcclxuICogQHBhcmFtIHtPYmplY3R9IGFcclxuICogQHBhcmFtIHtPYmplY3R9IGJcclxuICogQHJldHVybiB7T2JqZWN0fSBhXHJcbiAqIEBhcGkgcHJpdmF0ZVxyXG4gKi9cclxuXHJcbmV4cG9ydHMubWVyZ2UgPSBmdW5jdGlvbiBtZXJnZShhLCBiKSB7XHJcbiAgdmFyIGFjID0gYVsnY2xhc3MnXTtcclxuICB2YXIgYmMgPSBiWydjbGFzcyddO1xyXG5cclxuICBpZiAoYWMgfHwgYmMpIHtcclxuICAgIGFjID0gYWMgfHwgW107XHJcbiAgICBiYyA9IGJjIHx8IFtdO1xyXG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGFjKSkgYWMgPSBbYWNdO1xyXG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGJjKSkgYmMgPSBbYmNdO1xyXG4gICAgYVsnY2xhc3MnXSA9IGFjLmNvbmNhdChiYykuZmlsdGVyKG51bGxzKTtcclxuICB9XHJcblxyXG4gIGZvciAodmFyIGtleSBpbiBiKSB7XHJcbiAgICBpZiAoa2V5ICE9ICdjbGFzcycpIHtcclxuICAgICAgYVtrZXldID0gYltrZXldO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGE7XHJcbn07XHJcblxyXG4vKipcclxuICogRmlsdGVyIG51bGwgYHZhbGBzLlxyXG4gKlxyXG4gKiBAcGFyYW0geyp9IHZhbFxyXG4gKiBAcmV0dXJuIHtCb29sZWFufVxyXG4gKiBAYXBpIHByaXZhdGVcclxuICovXHJcblxyXG5mdW5jdGlvbiBudWxscyh2YWwpIHtcclxuICByZXR1cm4gdmFsICE9IG51bGwgJiYgdmFsICE9PSAnJztcclxufVxyXG5cclxuLyoqXHJcbiAqIGpvaW4gYXJyYXkgYXMgY2xhc3Nlcy5cclxuICpcclxuICogQHBhcmFtIHsqfSB2YWxcclxuICogQHJldHVybiB7U3RyaW5nfVxyXG4gKiBAYXBpIHByaXZhdGVcclxuICovXHJcblxyXG5mdW5jdGlvbiBqb2luQ2xhc3Nlcyh2YWwpIHtcclxuICByZXR1cm4gQXJyYXkuaXNBcnJheSh2YWwpID8gdmFsLm1hcChqb2luQ2xhc3NlcykuZmlsdGVyKG51bGxzKS5qb2luKCcgJykgOiB2YWw7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZW5kZXIgdGhlIGdpdmVuIGF0dHJpYnV0ZXMgb2JqZWN0LlxyXG4gKlxyXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBlc2NhcGVkXHJcbiAqIEByZXR1cm4ge1N0cmluZ31cclxuICogQGFwaSBwcml2YXRlXHJcbiAqL1xyXG5cclxuZXhwb3J0cy5hdHRycyA9IGZ1bmN0aW9uIGF0dHJzKG9iaiwgZXNjYXBlZCl7XHJcbiAgdmFyIGJ1ZiA9IFtdXHJcbiAgICAsIHRlcnNlID0gb2JqLnRlcnNlO1xyXG5cclxuICBkZWxldGUgb2JqLnRlcnNlO1xyXG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXMob2JqKVxyXG4gICAgLCBsZW4gPSBrZXlzLmxlbmd0aDtcclxuXHJcbiAgaWYgKGxlbikge1xyXG4gICAgYnVmLnB1c2goJycpO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47ICsraSkge1xyXG4gICAgICB2YXIga2V5ID0ga2V5c1tpXVxyXG4gICAgICAgICwgdmFsID0gb2JqW2tleV07XHJcblxyXG4gICAgICBpZiAoJ2Jvb2xlYW4nID09IHR5cGVvZiB2YWwgfHwgbnVsbCA9PSB2YWwpIHtcclxuICAgICAgICBpZiAodmFsKSB7XHJcbiAgICAgICAgICB0ZXJzZVxyXG4gICAgICAgICAgICA/IGJ1Zi5wdXNoKGtleSlcclxuICAgICAgICAgICAgOiBidWYucHVzaChrZXkgKyAnPVwiJyArIGtleSArICdcIicpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIGlmICgwID09IGtleS5pbmRleE9mKCdkYXRhJykgJiYgJ3N0cmluZycgIT0gdHlwZW9mIHZhbCkge1xyXG4gICAgICAgIGJ1Zi5wdXNoKGtleSArIFwiPSdcIiArIEpTT04uc3RyaW5naWZ5KHZhbCkgKyBcIidcIik7XHJcbiAgICAgIH0gZWxzZSBpZiAoJ2NsYXNzJyA9PSBrZXkpIHtcclxuICAgICAgICBpZiAoZXNjYXBlZCAmJiBlc2NhcGVkW2tleV0pe1xyXG4gICAgICAgICAgaWYgKHZhbCA9IGV4cG9ydHMuZXNjYXBlKGpvaW5DbGFzc2VzKHZhbCkpKSB7XHJcbiAgICAgICAgICAgIGJ1Zi5wdXNoKGtleSArICc9XCInICsgdmFsICsgJ1wiJyk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGlmICh2YWwgPSBqb2luQ2xhc3Nlcyh2YWwpKSB7XHJcbiAgICAgICAgICAgIGJ1Zi5wdXNoKGtleSArICc9XCInICsgdmFsICsgJ1wiJyk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2UgaWYgKGVzY2FwZWQgJiYgZXNjYXBlZFtrZXldKSB7XHJcbiAgICAgICAgYnVmLnB1c2goa2V5ICsgJz1cIicgKyBleHBvcnRzLmVzY2FwZSh2YWwpICsgJ1wiJyk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgYnVmLnB1c2goa2V5ICsgJz1cIicgKyB2YWwgKyAnXCInKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGJ1Zi5qb2luKCcgJyk7XHJcbn07XHJcblxyXG4vKipcclxuICogRXNjYXBlIHRoZSBnaXZlbiBzdHJpbmcgb2YgYGh0bWxgLlxyXG4gKlxyXG4gKiBAcGFyYW0ge1N0cmluZ30gaHRtbFxyXG4gKiBAcmV0dXJuIHtTdHJpbmd9XHJcbiAqIEBhcGkgcHJpdmF0ZVxyXG4gKi9cclxuXHJcbmV4cG9ydHMuZXNjYXBlID0gZnVuY3Rpb24gZXNjYXBlKGh0bWwpe1xyXG4gIHJldHVybiBTdHJpbmcoaHRtbClcclxuICAgIC5yZXBsYWNlKC8mL2csICcmYW1wOycpXHJcbiAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXHJcbiAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpXHJcbiAgICAucmVwbGFjZSgvXCIvZywgJyZxdW90OycpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFJlLXRocm93IHRoZSBnaXZlbiBgZXJyYCBpbiBjb250ZXh0IHRvIHRoZVxyXG4gKiB0aGUgamFkZSBpbiBgZmlsZW5hbWVgIGF0IHRoZSBnaXZlbiBgbGluZW5vYC5cclxuICpcclxuICogQHBhcmFtIHtFcnJvcn0gZXJyXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWxlbmFtZVxyXG4gKiBAcGFyYW0ge1N0cmluZ30gbGluZW5vXHJcbiAqIEBhcGkgcHJpdmF0ZVxyXG4gKi9cclxuXHJcbmV4cG9ydHMucmV0aHJvdyA9IGZ1bmN0aW9uIHJldGhyb3coZXJyLCBmaWxlbmFtZSwgbGluZW5vLCBzdHIpe1xyXG4gIGlmICghKGVyciBpbnN0YW5jZW9mIEVycm9yKSkgdGhyb3cgZXJyO1xyXG4gIGlmICgodHlwZW9mIHdpbmRvdyAhPSAndW5kZWZpbmVkJyB8fCAhZmlsZW5hbWUpICYmICFzdHIpIHtcclxuICAgIGVyci5tZXNzYWdlICs9ICcgb24gbGluZSAnICsgbGluZW5vO1xyXG4gICAgdGhyb3cgZXJyO1xyXG4gIH1cclxuICB0cnkge1xyXG4gICAgc3RyID0gIHN0ciB8fCByZXF1aXJlKCdmcycpLnJlYWRGaWxlU3luYyhmaWxlbmFtZSwgJ3V0ZjgnKVxyXG4gIH0gY2F0Y2ggKGV4KSB7XHJcbiAgICByZXRocm93KGVyciwgbnVsbCwgbGluZW5vKVxyXG4gIH1cclxuICB2YXIgY29udGV4dCA9IDNcclxuICAgICwgbGluZXMgPSBzdHIuc3BsaXQoJ1xcbicpXHJcbiAgICAsIHN0YXJ0ID0gTWF0aC5tYXgobGluZW5vIC0gY29udGV4dCwgMClcclxuICAgICwgZW5kID0gTWF0aC5taW4obGluZXMubGVuZ3RoLCBsaW5lbm8gKyBjb250ZXh0KTtcclxuXHJcbiAgLy8gRXJyb3IgY29udGV4dFxyXG4gIHZhciBjb250ZXh0ID0gbGluZXMuc2xpY2Uoc3RhcnQsIGVuZCkubWFwKGZ1bmN0aW9uKGxpbmUsIGkpe1xyXG4gICAgdmFyIGN1cnIgPSBpICsgc3RhcnQgKyAxO1xyXG4gICAgcmV0dXJuIChjdXJyID09IGxpbmVubyA/ICcgID4gJyA6ICcgICAgJylcclxuICAgICAgKyBjdXJyXHJcbiAgICAgICsgJ3wgJ1xyXG4gICAgICArIGxpbmU7XHJcbiAgfSkuam9pbignXFxuJyk7XHJcblxyXG4gIC8vIEFsdGVyIGV4Y2VwdGlvbiBtZXNzYWdlXHJcbiAgZXJyLnBhdGggPSBmaWxlbmFtZTtcclxuICBlcnIubWVzc2FnZSA9IChmaWxlbmFtZSB8fCAnSmFkZScpICsgJzonICsgbGluZW5vXHJcbiAgICArICdcXG4nICsgY29udGV4dCArICdcXG5cXG4nICsgZXJyLm1lc3NhZ2U7XHJcbiAgdGhyb3cgZXJyO1xyXG59O1xyXG4iLCJcbnZhciBtb3ZlID0gcmVxdWlyZSgnbW92ZScpXG52YXIgZG9tID0gcmVxdWlyZSgnZG9tJylcblxuZG9tKCcuZXhhbXBsZScpLmVhY2goZnVuY3Rpb24oZXhhbXBsZSl7XG4gIGV4YW1wbGUuaW5pdGlhbCA9IGV4YW1wbGUuZmluZCgnLnNhbmRib3gnKS5odG1sKClcbiAgdmFyIHBsYXkgPSBleGFtcGxlLmZpbmQoJ2J1dHRvbi5wbGF5JylcbiAgZXhhbXBsZS5maW5kKCcuc291cmNlIGNvZGUnKS5odG1sKGhpZ2hsaWdodChleGFtcGxlLmZpbmQoJy5zb3VyY2UnKS50ZXh0KCkpKVxuXG4gIGlmICghcGxheS5sZW5ndGgpIHJldHVybiBydW4oKVxuXG4gIHBsYXkub24oJ21vdXNlZG93bicsIHJ1bilcblxuICBleGFtcGxlLmZpbmQoJ2gzJykuYXBwZW5kKCc8YnV0dG9uIGNsYXNzPVwicmVzZXRcIj7ihrs8L2J1dHRvbj4nKVxuICBleGFtcGxlLmZpbmQoJ2J1dHRvbi5yZXNldCcpLm9uKCdtb3VzZWRvd24nLCBmdW5jdGlvbihlKXtcbiAgICBleGFtcGxlLmZpbmQoJy5zYW5kYm94JykuaHRtbChleGFtcGxlLmluaXRpYWwpXG4gIH0pXG5cbiAgZnVuY3Rpb24gcnVuKCl7XG4gICAgdmFyIGJveHMgPSBleGFtcGxlLmZpbmQoJy5ib3guc21hbGwnKS50b0FycmF5KClcbiAgICB2YXIgYm94ID0gYm94c1swXVxuICAgIGV2YWwoZXhhbXBsZS5maW5kKCcuc291cmNlJykudGV4dCgpKVxuICB9XG59KVxuXG4vKipcbiAqIEhpZ2hsaWdodCB0aGUgZ2l2ZW4gc3RyaW5nIG9mIGBqc2AuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGpzXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBoaWdobGlnaHQoanMpIHtcbiAgcmV0dXJuIGpzXG4gICAgLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxuICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcbiAgICAucmVwbGFjZSgvXFwvXFwvKC4qKS9nbSwgJzxzcGFuIGNsYXNzPVwiY29tbWVudFwiPi8vJDE8L3NwYW4+JylcbiAgICAucmVwbGFjZSgvKCcuKj8nKS9nbSwgJzxzcGFuIGNsYXNzPVwic3RyaW5nXCI+JDE8L3NwYW4+JylcbiAgICAucmVwbGFjZSgvKFxcZCtcXC5cXGQrKS9nbSwgJzxzcGFuIGNsYXNzPVwibnVtYmVyXCI+JDE8L3NwYW4+JylcbiAgICAucmVwbGFjZSgvKFxcZCspL2dtLCAnPHNwYW4gY2xhc3M9XCJudW1iZXJcIj4kMTwvc3Bhbj4nKVxuICAgIC5yZXBsYWNlKC9cXGJuZXcgKihcXHcrKS9nbSwgJzxzcGFuIGNsYXNzPVwia2V5d29yZFwiPm5ldzwvc3Bhbj4gPHNwYW4gY2xhc3M9XCJpbml0XCI+JDE8L3NwYW4+JylcbiAgICAucmVwbGFjZSgvXFxiKGZ1bmN0aW9ufG5ld3x0aHJvd3xyZXR1cm58dmFyfGlmfGVsc2UpXFxiL2dtLCAnPHNwYW4gY2xhc3M9XCJrZXl3b3JkXCI+JDE8L3NwYW4+Jylcbn1cbiIsIlxudmFyIHF1ZXJ5ID0gcmVxdWlyZSgncXVlcnknKVxudmFyIE1vdmUgPSByZXF1aXJlKCcuL21vdmUnKVxudmFyIFNWRyA9IHJlcXVpcmUoJy4vc3ZnJylcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihlbCl7XG4gIGlmICh0eXBlb2YgZWwgPT0gJ3N0cmluZycpIGVsID0gcXVlcnkoZWwpXG4gIGlmIChlbCBpbnN0YW5jZW9mIFNWR0VsZW1lbnQpIHJldHVybiBuZXcgU1ZHKGVsKVxuICByZXR1cm4gbmV3IE1vdmUoZWwpXG59XG4iLCIvKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxudmFyIGlzQXJyYXkgPSByZXF1aXJlKCdpc0FycmF5Jyk7XG52YXIgZG9taWZ5ID0gcmVxdWlyZSgnZG9taWZ5Jyk7XG52YXIgZXZlbnRzID0gcmVxdWlyZSgnZXZlbnQnKTtcbnZhciBxdWVyeSA9IHJlcXVpcmUoJ3F1ZXJ5Jyk7XG52YXIgdHJpbSA9IHJlcXVpcmUoJ3RyaW0nKTtcbnZhciBzbGljZSA9IFtdLnNsaWNlO1xuXG4vKipcbiAqIEF0dHJpYnV0ZXMgc3VwcG9ydGVkLlxuICovXG5cbnZhciBhdHRycyA9IFtcbiAgJ2lkJyxcbiAgJ3NyYycsXG4gICdyZWwnLFxuICAnY29scycsXG4gICdyb3dzJyxcbiAgJ3R5cGUnLFxuICAnbmFtZScsXG4gICdocmVmJyxcbiAgJ3RpdGxlJyxcbiAgJ3N0eWxlJyxcbiAgJ3dpZHRoJyxcbiAgJ2hlaWdodCcsXG4gICdhY3Rpb24nLFxuICAnbWV0aG9kJyxcbiAgJ3RhYmluZGV4JyxcbiAgJ3BsYWNlaG9sZGVyJ1xuXTtcblxuLypcbiAqIEEgc2ltcGxlIHdheSB0byBjaGVjayBmb3IgSFRNTCBzdHJpbmdzIG9yIElEIHN0cmluZ3NcbiAqL1xuXG52YXIgcXVpY2tFeHByID0gL14oPzpbXiM8XSooPFtcXHdcXFddKz4pW14+XSokfCMoW1xcd1xcLV0qKSQpLztcblxuLyoqXG4gKiBFeHBvc2UgYGRvbSgpYC5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRvbTtcblxuLyoqXG4gKiBSZXR1cm4gYSBkb20gYExpc3RgIGZvciB0aGUgZ2l2ZW5cbiAqIGBodG1sYCwgc2VsZWN0b3IsIG9yIGVsZW1lbnQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd8RWxlbWVudHxMaXN0fSBzZWxlY3RvclxuICogQHBhcmFtIHtTdHJpbmd8RUxlbWVudHxjb250ZXh0fSBjb250ZXh0XG4gKiBAcmV0dXJuIHtMaXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBkb20oc2VsZWN0b3IsIGNvbnRleHQpIHtcbiAgLy8gYXJyYXlcbiAgaWYgKGlzQXJyYXkoc2VsZWN0b3IpKSB7XG4gICAgcmV0dXJuIG5ldyBMaXN0KHNlbGVjdG9yKTtcbiAgfVxuXG4gIC8vIExpc3RcbiAgaWYgKHNlbGVjdG9yIGluc3RhbmNlb2YgTGlzdCkge1xuICAgIHJldHVybiBzZWxlY3RvcjtcbiAgfVxuXG4gIC8vIG5vZGVcbiAgaWYgKHNlbGVjdG9yLm5vZGVOYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBMaXN0KFtzZWxlY3Rvcl0pO1xuICB9XG5cbiAgaWYgKCdzdHJpbmcnICE9IHR5cGVvZiBzZWxlY3Rvcikge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2ludmFsaWQgc2VsZWN0b3InKTtcbiAgfVxuXG4gIC8vIGh0bWxcbiAgdmFyIGh0bWxzZWxlY3RvciA9IHRyaW0ubGVmdChzZWxlY3Rvcik7XG4gIGlmIChpc0hUTUwoaHRtbHNlbGVjdG9yKSkge1xuICAgIHJldHVybiBuZXcgTGlzdChbZG9taWZ5KGh0bWxzZWxlY3RvcildLCBodG1sc2VsZWN0b3IpO1xuICB9XG5cbiAgLy8gc2VsZWN0b3JcbiAgdmFyIGN0eCA9IGNvbnRleHRcbiAgICA/IChjb250ZXh0IGluc3RhbmNlb2YgTGlzdCA/IGNvbnRleHRbMF0gOiBjb250ZXh0KVxuICAgIDogZG9jdW1lbnQ7XG5cbiAgcmV0dXJuIG5ldyBMaXN0KHF1ZXJ5LmFsbChzZWxlY3RvciwgY3R4KSwgc2VsZWN0b3IpO1xufVxuXG4vKipcbiAqIFN0YXRpYzogRXhwb3NlIGBMaXN0YFxuICovXG5cbmRvbS5MaXN0ID0gTGlzdDtcblxuLyoqXG4gKiBTdGF0aWM6IEV4cG9zZSBzdXBwb3J0ZWQgYXR0cnMuXG4gKi9cblxuZG9tLmF0dHJzID0gYXR0cnM7XG5cbi8qKlxuICogU3RhdGljOiBNaXhpbiBhIGZ1bmN0aW9uXG4gKlxuICogQHBhcmFtIHtPYmplY3R8U3RyaW5nfSBuYW1lXG4gKiBAcGFyYW0ge09iamVjdHxGdW5jdGlvbn0gb2JqXG4gKiBAcmV0dXJuIHtMaXN0fSBzZWxmXG4gKi9cblxuZG9tLnVzZSA9IGZ1bmN0aW9uKG5hbWUsIGZuKSB7XG4gIHZhciBrZXlzID0gW107XG4gIHZhciB0bXA7XG5cbiAgaWYgKDIgPT0gYXJndW1lbnRzLmxlbmd0aCkge1xuICAgIGtleXMucHVzaChuYW1lKTtcbiAgICB0bXAgPSB7fTtcbiAgICB0bXBbbmFtZV0gPSBmbjtcbiAgICBmbiA9IHRtcDtcbiAgfSBlbHNlIGlmIChuYW1lLm5hbWUpIHtcbiAgICAvLyB1c2UgZnVuY3Rpb24gbmFtZVxuICAgIGZuID0gbmFtZTtcbiAgICBuYW1lID0gbmFtZS5uYW1lO1xuICAgIGtleXMucHVzaChuYW1lKTtcbiAgICB0bXAgPSB7fTtcbiAgICB0bXBbbmFtZV0gPSBmbjtcbiAgICBmbiA9IHRtcDtcbiAgfSBlbHNlIHtcbiAgICBrZXlzID0gT2JqZWN0LmtleXMobmFtZSk7XG4gICAgZm4gPSBuYW1lO1xuICB9XG5cbiAgZm9yKHZhciBpID0gMCwgbGVuID0ga2V5cy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIExpc3QucHJvdG90eXBlW2tleXNbaV1dID0gZm5ba2V5c1tpXV07XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn1cblxuLyoqXG4gKiBJbml0aWFsaXplIGEgbmV3IGBMaXN0YCB3aXRoIHRoZVxuICogZ2l2ZW4gYXJyYXktaXNoIG9mIGBlbHNgIGFuZCBgc2VsZWN0b3JgXG4gKiBzdHJpbmcuXG4gKlxuICogQHBhcmFtIHtNaXhlZH0gZWxzXG4gKiBAcGFyYW0ge1N0cmluZ30gc2VsZWN0b3JcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIExpc3QoZWxzLCBzZWxlY3Rvcikge1xuICBlbHMgPSBlbHMgfHwgW107XG4gIHZhciBsZW4gPSB0aGlzLmxlbmd0aCA9IGVscy5sZW5ndGg7XG4gIGZvcih2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykgdGhpc1tpXSA9IGVsc1tpXTtcbiAgdGhpcy5zZWxlY3RvciA9IHNlbGVjdG9yO1xufVxuXG4vKipcbiAqIFJlbWFrZSB0aGUgbGlzdFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfEVMZW1lbnR8Y29udGV4dH0gY29udGV4dFxuICogQHJldHVybiB7TGlzdH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbkxpc3QucHJvdG90eXBlLmRvbSA9IGRvbTtcblxuLyoqXG4gKiBNYWtlIGBMaXN0YCBhbiBhcnJheS1saWtlIG9iamVjdFxuICovXG5cbkxpc3QucHJvdG90eXBlLmxlbmd0aCA9IDA7XG5MaXN0LnByb3RvdHlwZS5zcGxpY2UgPSBBcnJheS5wcm90b3R5cGUuc3BsaWNlO1xuXG4vKipcbiAqIEFycmF5LWxpa2Ugb2JqZWN0IHRvIGFycmF5XG4gKlxuICogQHJldHVybiB7QXJyYXl9XG4gKi9cblxuTGlzdC5wcm90b3R5cGUudG9BcnJheSA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gc2xpY2UuY2FsbCh0aGlzKTtcbn1cblxuLyoqXG4gKiBBdHRyaWJ1dGUgYWNjZXNzb3JzLlxuICovXG5cbmF0dHJzLmZvckVhY2goZnVuY3Rpb24obmFtZSl7XG4gIExpc3QucHJvdG90eXBlW25hbWVdID0gZnVuY3Rpb24odmFsKXtcbiAgICBpZiAoMCA9PSBhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gdGhpcy5hdHRyKG5hbWUpO1xuICAgIHJldHVybiB0aGlzLmF0dHIobmFtZSwgdmFsKTtcbiAgfTtcbn0pO1xuXG4vKipcbiAqIE1peGluIHRoZSBBUElcbiAqL1xuXG5kb20udXNlKHJlcXVpcmUoJy4vbGliL2F0dHJpYnV0ZXMnKSk7XG5kb20udXNlKHJlcXVpcmUoJy4vbGliL2NsYXNzZXMnKSk7XG5kb20udXNlKHJlcXVpcmUoJy4vbGliL2V2ZW50cycpKTtcbmRvbS51c2UocmVxdWlyZSgnLi9saWIvbWFuaXB1bGF0ZScpKTtcbmRvbS51c2UocmVxdWlyZSgnLi9saWIvdHJhdmVyc2UnKSk7XG5cbi8qKlxuICogQ2hlY2sgaWYgdGhlIHN0cmluZyBpcyBIVE1MXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGlzSFRNTChzdHIpIHtcbiAgLy8gRmFzdGVyIHRoYW4gcnVubmluZyByZWdleCwgaWYgc3RyIHN0YXJ0cyB3aXRoIGA8YCBhbmQgZW5kcyB3aXRoIGA+YCwgYXNzdW1lIGl0J3MgSFRNTFxuICBpZiAoc3RyLmNoYXJBdCgwKSA9PT0gJzwnICYmIHN0ci5jaGFyQXQoc3RyLmxlbmd0aCAtIDEpID09PSAnPicgJiYgc3RyLmxlbmd0aCA+PSAzKSByZXR1cm4gdHJ1ZTtcblxuICAvLyBSdW4gdGhlIHJlZ2V4XG4gIHZhciBtYXRjaCA9IHF1aWNrRXhwci5leGVjKHN0cik7XG4gIHJldHVybiAhIShtYXRjaCAmJiBtYXRjaFsxXSk7XG59XG4iLCJcbnZhciBwcmVmaXggPSByZXF1aXJlKCdwcmVmaXgnKVxudmFyIE1vdmUgPSByZXF1aXJlKCcuL21vdmUnKVxuXG52YXIgYXR0cnMgPSBbXG4gICdjeCcsICdjeScsXG4gICd4JywgICd5JyxcbiAgJ2QnXG5dLnJlZHVjZShmdW5jdGlvbihhdHRycywga2V5KXtcbiAgYXR0cnNba2V5XSA9IHRydWVcbiAgcmV0dXJuIGF0dHJzXG59LCB7fSlcblxubW9kdWxlLmV4cG9ydHMgPSBNb3ZlLmV4dGVuZCh7XG4gIHNldDogZnVuY3Rpb24oaywgdil7XG4gICAgaWYgKCEoayBpbiBhdHRycykpIGsgPSBwcmVmaXgoaylcbiAgICB0aGlzLl90b1trXSA9IHZcbiAgICByZXR1cm4gdGhpc1xuICB9LFxuICBjdXJyZW50OiBmdW5jdGlvbihrKXtcbiAgICBpZiAoayBpbiBhdHRycykgcmV0dXJuIHRoaXMuZWwuZ2V0QXR0cmlidXRlKGspXG4gICAgcmV0dXJuIGdldENvbXB1dGVkU3R5bGUodGhpcy5lbClbcHJlZml4KGspXVxuICAgICAgfHwgdGhpcy5lbC5nZXRBdHRyaWJ1dGUoaylcbiAgfSxcbiAgcmVuZGVyOiBmdW5jdGlvbihuKXtcbiAgICBuID0gdGhpcy5fZWFzZShuKVxuICAgIHZhciB0d2VlbnMgPSB0aGlzLnR3ZWVuc1xuICAgIHZhciBzdHlsZSA9IHRoaXMuZWwuc3R5bGVcbiAgICBmb3IgKHZhciBrIGluIHR3ZWVucykge1xuICAgICAgaWYgKGsgaW4gYXR0cnMpIHRoaXMuZWwuc2V0QXR0cmlidXRlKGssIHR3ZWVuc1trXShuKSlcbiAgICAgIGVsc2UgdGhpcy5lbC5zdHlsZVtrXSA9IHR3ZWVuc1trXShuKVxuICAgIH1cbiAgICAvLyBIQUNLOiBmb3JjZSByZWRyYXcgYmVjYXVzZSBjaHJvbWUgaGFzIHNvbWUgYnVnZ3kgb3B0aW1pc2F0aW9uc1xuICAgIHRoaXMuZWwub2Zmc2V0SGVpZ2h0IFxuICAgIHJldHVybiB0aGlzXG4gIH1cbn0pXG4iLCJcbnZhciBBbmltYXRpb24gPSByZXF1aXJlKCdhbmltYXRpb24nKVxudmFyIGxhenkgPSByZXF1aXJlKCdsYXp5LXByb3BlcnR5JylcbnZhciB1bm1hdHJpeCA9IHJlcXVpcmUoJ3VubWF0cml4JylcbnZhciB0d2VlbiA9IHJlcXVpcmUoJy4vdHdlZW4nKVxudmFyIHByZWZpeCA9IHJlcXVpcmUoJ3ByZWZpeCcpXG52YXIgY2xvbmUgPSByZXF1aXJlKCdjbG9uZScpXG5cbm1vZHVsZS5leHBvcnRzID0gTW92ZVxuXG4vKipcbiAqICd3ZWJraXRUcmFuc2Zvcm0nIHx8ICdNb3pUcmFuc2Zvcm0nIGV0Yy4uXG4gKiBAdHlwZSB7U3RyaW5nfVxuICovXG5cbnZhciB0cmFuc2Zvcm0gPSBwcmVmaXgoJ3RyYW5zZm9ybScpXG5cbi8qKlxuICogdGhlIE1vdmUgY2xhc3NcbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIE1vdmUoZWwpe1xuICB0aGlzLl90byA9IHt9XG4gIHRoaXMuZWwgPSBlbFxufVxuXG4vKipcbiAqIGluaGVyaXQgZnJvbSBBbmltYXRpb25cbiAqL1xuXG5BbmltYXRpb24uZXh0ZW5kKE1vdmUpXG5cbi8qKlxuICogZGVmYXVsdCBkdXJhdGlvblxuICovXG5cbk1vdmUucHJvdG90eXBlLmR1cmF0aW9uKCczMDBtcycpXG5cbi8qKlxuICogYWRkIGBwcm9wYCB0byBhbmltYXRpb24uIFdoZW4gdGhlIGFuaW1hdGlvbiBpcyBydW5cbiAqIGBwcm9wYCB3aWxsIGJlIHR3ZWVuZWQgZnJvbSBpdHMgY3VycmVudCB2YWx1ZSB0byBgdG9gXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHByb3BcbiAqIEBwYXJhbSB7Q1NTfSB0b1xuICogQHJldHVybiB7dGhpc31cbiAqL1xuXG5Nb3ZlLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbihwcm9wLCB0byl7XG4gIHRoaXMuX3RvW3ByZWZpeChwcm9wKV0gPSB0b1xuICByZXR1cm4gdGhpc1xufVxuXG4vKipcbiAqIGluY3JlbWVudCBgcHJvcGAgYnkgYG5gXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHByb3BcbiAqIEBwYXJhbSB7TnVtYmVyfSB0b1xuICogQHJldHVybiB7dGhpc31cbiAqL1xuXG5Nb3ZlLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbihwcm9wLCBuKXtcbiAgcHJvcCA9IHByZWZpeChwcm9wKVxuICB2YXIgY3VyciA9IHBhcnNlSW50KHRoaXMuY3VycmVudChwcm9wKSwgMTApXG4gIHJldHVybiB0aGlzLnNldChwcm9wLCBjdXJyICsgbilcbn1cblxuLyoqXG4gKiBkZWNyZW1lbnQgYHByb3BgIGJ5IGBuYFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBwcm9wXG4gKiBAcGFyYW0ge051bWJlcn0gdG9cbiAqIEByZXR1cm4ge3RoaXN9XG4gKi9cblxuTW92ZS5wcm90b3R5cGUuc3ViID0gZnVuY3Rpb24ocHJvcCwgbil7XG4gIHByb3AgPSBwcmVmaXgocHJvcClcbiAgdmFyIGN1cnIgPSBwYXJzZUludCh0aGlzLmN1cnJlbnQocHJvcCksIDEwKVxuICByZXR1cm4gdGhpcy5zZXQocHJvcCwgY3VyciAtIG4pXG59XG5cbi8qKlxuICogZ2V0IHRoZSBjdXJyZW50IHZhbHVlIG9mIGBwcm9wYFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBwcm9wXG4gKiBAcmV0dXJuIHtDU1N9XG4gKi9cblxuTW92ZS5wcm90b3R5cGUuY3VycmVudCA9IGZ1bmN0aW9uKHByb3Ape1xuICByZXR1cm4gZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzLmVsKVtwcm9wXVxufVxuXG4vKipcbiAqIFNrZXcgYnkgYGRlZ2BcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gZGVnXG4gKiBAcmV0dXJuIHt0aGlzfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5Nb3ZlLnByb3RvdHlwZS5za2V3ID0gZnVuY3Rpb24oZGVnKXtcbiAgdGhpcy5tYXRyaXguc2tldyArPSBkZWdcbiAgcmV0dXJuIHRoaXNcbn1cblxuLyoqXG4gKiBUcmFuc2xhdGUgYHhgIGFuZCBgeWAgYXhpcy5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0geFxuICogQHBhcmFtIHtOdW1iZXJ9IHlcbiAqIEBwYXJhbSB7TnVtYmVyfSB6XG4gKiBAcmV0dXJuIHt0aGlzfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5Nb3ZlLnByb3RvdHlwZS50cmFuc2xhdGUgPSBmdW5jdGlvbih4LCB5KXtcbiAgdGhpcy5tYXRyaXgudHJhbnNsYXRlWCArPSB4XG4gIHRoaXMubWF0cml4LnRyYW5zbGF0ZVkgKz0geVxuICByZXR1cm4gdGhpc1xufVxuXG4vKipcbiAqIFRyYW5zbGF0ZSBvbiB0aGUgeCBheGlzIHRvIGBuYC5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gblxuICogQHJldHVybiB7dGhpc31cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuTW92ZS5wcm90b3R5cGUudHJhbnNsYXRlWCA9XG5Nb3ZlLnByb3RvdHlwZS54ID0gZnVuY3Rpb24obil7XG4gIHJldHVybiB0aGlzLnRyYW5zbGF0ZShuLCAwKVxufVxuXG4vKipcbiAqIFRyYW5zbGF0ZSBvbiB0aGUgeSBheGlzIHRvIGBuYC5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gblxuICogQHJldHVybiB7dGhpc31cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuTW92ZS5wcm90b3R5cGUudHJhbnNsYXRlWSA9XG5Nb3ZlLnByb3RvdHlwZS55ID0gZnVuY3Rpb24obil7XG4gIHJldHVybiB0aGlzLnRyYW5zbGF0ZSgwLCBuKVxufVxuXG4vKipcbiAqIFNjYWxlIHRoZSB4IGFuZCB5IGF4aXMgYnkgYHhgLCBvclxuICogaW5kaXZpZHVhbGx5IHNjYWxlIGB4YCBhbmQgYHlgLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSB4XG4gKiBAcGFyYW0ge051bWJlcn0geVxuICogQHJldHVybiB7dGhpc31cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuTW92ZS5wcm90b3R5cGUuc2NhbGUgPSBmdW5jdGlvbih4LCB5KXtcbiAgaWYgKHkgPT0gbnVsbCkgeSA9IHhcbiAgdGhpcy5tYXRyaXguc2NhbGVYICo9IHhcbiAgdGhpcy5tYXRyaXguc2NhbGVZICo9IHlcbiAgcmV0dXJuIHRoaXNcbn1cblxuLyoqXG4gKiBTY2FsZSB4IGF4aXMgYnkgYG5gLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBuXG4gKiBAcmV0dXJuIHt0aGlzfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5Nb3ZlLnByb3RvdHlwZS5zY2FsZVggPSBmdW5jdGlvbihuKXtcbiAgcmV0dXJuIHRoaXMuc2NhbGUobiwgMSwgMSlcbn1cblxuLyoqXG4gKiBTY2FsZSB5IGF4aXMgYnkgYG5gLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBuXG4gKiBAcmV0dXJuIHt0aGlzfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5Nb3ZlLnByb3RvdHlwZS5zY2FsZVkgPSBmdW5jdGlvbihuKXtcbiAgcmV0dXJuIHRoaXMuc2NhbGUoMSwgbiwgMSlcbn1cblxuLyoqXG4gKiBSb3RhdGUgYG5gIGRlZ3JlZXMuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IG5cbiAqIEByZXR1cm4ge3RoaXN9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbk1vdmUucHJvdG90eXBlLnJvdGF0ZSA9IGZ1bmN0aW9uKG4pe1xuICB0aGlzLm1hdHJpeC5yb3RhdGUgKz0gblxuICByZXR1cm4gdGhpc1xufVxuXG4vKipcbiAqIGNzcyB0cmFuc2Zvcm1hdGlvbiBtYXRyaXggZm9yIGB0aGlzLmVsYFxuICpcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmxhenkoTW92ZS5wcm90b3R5cGUsICdtYXRyaXgnLCBmdW5jdGlvbigpe1xuICB2YXIgbWF0cml4ID0gdGhpcy5jdXJyZW50KHRyYW5zZm9ybSlcbiAgaWYgKHR5cGVvZiBtYXRyaXggPT0gJ3N0cmluZycpIG1hdHJpeCA9IHVubWF0cml4KG1hdHJpeClcbiAgdGhpcy5fdG9bdHJhbnNmb3JtXSA9IG1hdHJpeFxuICByZXR1cm4gbWF0cml4XG59KVxuXG4vKipcbiAqIGdlbmVyYXRlZCB0d2VlbmluZyBmdW5jdGlvbnNcbiAqXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5sYXp5KE1vdmUucHJvdG90eXBlLCAndHdlZW5zJywgZnVuY3Rpb24oKXtcbiAgdmFyIHR3ZWVucyA9IHt9XG4gIGZvciAodmFyIGtleSBpbiB0aGlzLl90bykge1xuICAgIHR3ZWVuc1trZXldID0gdHdlZW4oa2V5LCB0aGlzLmN1cnJlbnQoa2V5KSwgdGhpcy5fdG9ba2V5XSlcbiAgfVxuICByZXR1cm4gdHdlZW5zXG59KVxuXG4vKipcbiAqIHJlbmRlciB0aGUgYW5pbWF0aW9uIGF0IGNvbXBsZXRpb24gbGV2ZWwgYG5gXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IG5cbiAqIEByZXR1cm4ge3RoaXN9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbk1vdmUucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKG4pe1xuICBuID0gdGhpcy5fZWFzZShuKVxuICB2YXIgdHdlZW5zID0gdGhpcy50d2VlbnNcbiAgdmFyIHN0eWxlID0gdGhpcy5lbC5zdHlsZVxuICBmb3IgKHZhciBrIGluIHR3ZWVucykgc3R5bGVba10gPSB0d2VlbnNba10obilcbiAgcmV0dXJuIHRoaXNcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSBuZXcgTW92ZSBpbnN0YW5jZSB3aGljaCB3aWxsIHJ1blxuICogd2hlbiBgdGhpc2AgbW92ZSBjb21wbGV0ZXMuIE9wdGlvbmFsbHkgeW91IGNhblxuICogcGFzcyBpbiBhIE1vdmUgaW5zdGFuY2Ugb3IgRnVuY3Rpb24gdG8gYmUgcnVuXG4gKiBvbiBjb21wbGV0aW9uIG9mIGB0aGlzYCBhbmltYXRpb24uXG4gKlxuICogQHBhcmFtIHtNb3ZlfEZ1bmN0aW9ufSBbbW92ZV1cbiAqIEByZXR1cm4ge3RoaXN8RGVmZXJyZWRNb3ZlfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5Nb3ZlLnByb3RvdHlwZS50aGVuID0gZnVuY3Rpb24obW92ZSl7XG4gIGlmIChtb3ZlKSB7XG4gICAgdmFyIGZuICA9IHR5cGVvZiBtb3ZlICE9ICdmdW5jdGlvbidcbiAgICAgID8gZnVuY3Rpb24oKXsgbW92ZS5ydW4oKSB9XG4gICAgICA6IG1vdmVcbiAgICB0aGlzLm9uKCdlbmQnLCBmbilcbiAgICB0aGlzLnJ1bm5pbmcgfHwgdGhpcy5wYXJlbnQgfHwgdGhpcy5ydW4oKVxuICAgIHJldHVybiB0aGlzXG4gIH1cbiAgbW92ZSA9IGRlZmVyKHRoaXMpXG4gIHRoaXMudGhlbihtb3ZlKVxuICByZXR1cm4gbW92ZVxufVxuXG4vKipcbiAqIGNyZWF0ZSBhIHNwZWNpYWxpemVkIHN1Yi1jbGFzcyBvZiBgTW92ZWAgZm9yIHVzZVxuICogaW4gYHRoZW4oKWBcbiAqXG4gKiBAcGFyYW0ge01vdmV9IHBhcmVudFxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gZGVmZXIocGFyZW50KXtcbiAgdmFyIGNoaWxkID0gbmV3IHBhcmVudC5jb25zdHJ1Y3RvcihwYXJlbnQuZWwpXG4gIGNoaWxkLl9kdXJhdGlvbiA9IHBhcmVudC5fZHVyYXRpb25cbiAgY2hpbGQuX2Vhc2UgPSBwYXJlbnQuX2Vhc2VcbiAgY2hpbGQucGFyZW50ID0gcGFyZW50XG4gIGNoaWxkLmN1cnJlbnQgPSBmdW5jdGlvbihwcm9wKXtcbiAgICB2YXIgYW5pbSA9IHRoaXMucGFyZW50XG4gICAgZG8gaWYgKHByb3AgaW4gYW5pbS5fdG8pIHJldHVybiBjbG9uZShhbmltLl90b1twcm9wXSlcbiAgICB3aGlsZSAoYW5pbSA9IGFuaW0ucGFyZW50KVxuICAgIHJldHVybiB0aGlzLmNvbnN0cnVjdG9yLnByb3RvdHlwZS5jdXJyZW50LmNhbGwodGhpcywgcHJvcClcbiAgfVxuICByZXR1cm4gY2hpbGRcbn1cbiIsIlxuLyoqXG4gKiBFeHBvc2UgYHBhcnNlYC5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHBhcnNlO1xuXG4vKipcbiAqIFdyYXAgbWFwIGZyb20ganF1ZXJ5LlxuICovXG5cbnZhciBtYXAgPSB7XG4gIG9wdGlvbjogWzEsICc8c2VsZWN0IG11bHRpcGxlPVwibXVsdGlwbGVcIj4nLCAnPC9zZWxlY3Q+J10sXG4gIG9wdGdyb3VwOiBbMSwgJzxzZWxlY3QgbXVsdGlwbGU9XCJtdWx0aXBsZVwiPicsICc8L3NlbGVjdD4nXSxcbiAgbGVnZW5kOiBbMSwgJzxmaWVsZHNldD4nLCAnPC9maWVsZHNldD4nXSxcbiAgdGhlYWQ6IFsxLCAnPHRhYmxlPicsICc8L3RhYmxlPiddLFxuICB0Ym9keTogWzEsICc8dGFibGU+JywgJzwvdGFibGU+J10sXG4gIHRmb290OiBbMSwgJzx0YWJsZT4nLCAnPC90YWJsZT4nXSxcbiAgY29sZ3JvdXA6IFsxLCAnPHRhYmxlPicsICc8L3RhYmxlPiddLFxuICBjYXB0aW9uOiBbMSwgJzx0YWJsZT4nLCAnPC90YWJsZT4nXSxcbiAgdHI6IFsyLCAnPHRhYmxlPjx0Ym9keT4nLCAnPC90Ym9keT48L3RhYmxlPiddLFxuICB0ZDogWzMsICc8dGFibGU+PHRib2R5Pjx0cj4nLCAnPC90cj48L3Rib2R5PjwvdGFibGU+J10sXG4gIHRoOiBbMywgJzx0YWJsZT48dGJvZHk+PHRyPicsICc8L3RyPjwvdGJvZHk+PC90YWJsZT4nXSxcbiAgY29sOiBbMiwgJzx0YWJsZT48dGJvZHk+PC90Ym9keT48Y29sZ3JvdXA+JywgJzwvY29sZ3JvdXA+PC90YWJsZT4nXSxcbiAgX2RlZmF1bHQ6IFswLCAnJywgJyddXG59O1xuXG4vKipcbiAqIFBhcnNlIGBodG1sYCBhbmQgcmV0dXJuIHRoZSBjaGlsZHJlbi5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gaHRtbFxuICogQHJldHVybiB7QXJyYXl9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBwYXJzZShodG1sKSB7XG4gIGlmICgnc3RyaW5nJyAhPSB0eXBlb2YgaHRtbCkgdGhyb3cgbmV3IFR5cGVFcnJvcignU3RyaW5nIGV4cGVjdGVkJyk7XG5cbiAgLy8gdGFnIG5hbWVcbiAgdmFyIG0gPSAvPChbXFx3Ol0rKS8uZXhlYyhodG1sKTtcbiAgaWYgKCFtKSB0aHJvdyBuZXcgRXJyb3IoJ05vIGVsZW1lbnRzIHdlcmUgZ2VuZXJhdGVkLicpO1xuICB2YXIgdGFnID0gbVsxXTtcblxuICAvLyBib2R5IHN1cHBvcnRcbiAgaWYgKHRhZyA9PSAnYm9keScpIHtcbiAgICB2YXIgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdodG1sJyk7XG4gICAgZWwuaW5uZXJIVE1MID0gaHRtbDtcbiAgICByZXR1cm4gZWwucmVtb3ZlQ2hpbGQoZWwubGFzdENoaWxkKTtcbiAgfVxuXG4gIC8vIHdyYXAgbWFwXG4gIHZhciB3cmFwID0gbWFwW3RhZ10gfHwgbWFwLl9kZWZhdWx0O1xuICB2YXIgZGVwdGggPSB3cmFwWzBdO1xuICB2YXIgcHJlZml4ID0gd3JhcFsxXTtcbiAgdmFyIHN1ZmZpeCA9IHdyYXBbMl07XG4gIHZhciBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBlbC5pbm5lckhUTUwgPSBwcmVmaXggKyBodG1sICsgc3VmZml4O1xuICB3aGlsZSAoZGVwdGgtLSkgZWwgPSBlbC5sYXN0Q2hpbGQ7XG5cbiAgdmFyIGVscyA9IGVsLmNoaWxkcmVuO1xuICBpZiAoMSA9PSBlbHMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGVsLnJlbW92ZUNoaWxkKGVsc1swXSk7XG4gIH1cblxuICB2YXIgZnJhZ21lbnQgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gIHdoaWxlIChlbHMubGVuZ3RoKSB7XG4gICAgZnJhZ21lbnQuYXBwZW5kQ2hpbGQoZWwucmVtb3ZlQ2hpbGQoZWxzWzBdKSk7XG4gIH1cblxuICByZXR1cm4gZnJhZ21lbnQ7XG59XG4iLCJ2YXIgYmluZCA9IHdpbmRvdy5hZGRFdmVudExpc3RlbmVyID8gJ2FkZEV2ZW50TGlzdGVuZXInIDogJ2F0dGFjaEV2ZW50JyxcbiAgICB1bmJpbmQgPSB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciA/ICdyZW1vdmVFdmVudExpc3RlbmVyJyA6ICdkZXRhY2hFdmVudCcsXG4gICAgcHJlZml4ID0gYmluZCAhPT0gJ2FkZEV2ZW50TGlzdGVuZXInID8gJ29uJyA6ICcnO1xuXG4vKipcbiAqIEJpbmQgYGVsYCBldmVudCBgdHlwZWAgdG8gYGZuYC5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gY2FwdHVyZVxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMuYmluZCA9IGZ1bmN0aW9uKGVsLCB0eXBlLCBmbiwgY2FwdHVyZSl7XG4gIGVsW2JpbmRdKHByZWZpeCArIHR5cGUsIGZuLCBjYXB0dXJlIHx8IGZhbHNlKTtcblxuICByZXR1cm4gZm47XG59O1xuXG4vKipcbiAqIFVuYmluZCBgZWxgIGV2ZW50IGB0eXBlYCdzIGNhbGxiYWNrIGBmbmAuXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbFxuICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGNhcHR1cmVcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5leHBvcnRzLnVuYmluZCA9IGZ1bmN0aW9uKGVsLCB0eXBlLCBmbiwgY2FwdHVyZSl7XG4gIGVsW3VuYmluZF0ocHJlZml4ICsgdHlwZSwgZm4sIGNhcHR1cmUgfHwgZmFsc2UpO1xuXG4gIHJldHVybiBmbjtcbn07IiwiXG5mdW5jdGlvbiBvbmUoc2VsZWN0b3IsIGVsKSB7XG4gIHJldHVybiBlbC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbn1cblxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc2VsZWN0b3IsIGVsKXtcbiAgZWwgPSBlbCB8fCBkb2N1bWVudDtcbiAgcmV0dXJuIG9uZShzZWxlY3RvciwgZWwpO1xufTtcblxuZXhwb3J0cy5hbGwgPSBmdW5jdGlvbihzZWxlY3RvciwgZWwpe1xuICBlbCA9IGVsIHx8IGRvY3VtZW50O1xuICByZXR1cm4gZWwucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG59O1xuXG5leHBvcnRzLmVuZ2luZSA9IGZ1bmN0aW9uKG9iail7XG4gIGlmICghb2JqLm9uZSkgdGhyb3cgbmV3IEVycm9yKCcub25lIGNhbGxiYWNrIHJlcXVpcmVkJyk7XG4gIGlmICghb2JqLmFsbCkgdGhyb3cgbmV3IEVycm9yKCcuYWxsIGNhbGxiYWNrIHJlcXVpcmVkJyk7XG4gIG9uZSA9IG9iai5vbmU7XG4gIGV4cG9ydHMuYWxsID0gb2JqLmFsbDtcbn07XG4iLCJcbmV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IHRyaW07XG5cbmZ1bmN0aW9uIHRyaW0oc3RyKXtcbiAgaWYgKHN0ci50cmltKSByZXR1cm4gc3RyLnRyaW0oKTtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC9eXFxzKnxcXHMqJC9nLCAnJyk7XG59XG5cbmV4cG9ydHMubGVmdCA9IGZ1bmN0aW9uKHN0cil7XG4gIGlmIChzdHIudHJpbUxlZnQpIHJldHVybiBzdHIudHJpbUxlZnQoKTtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC9eXFxzKi8sICcnKTtcbn07XG5cbmV4cG9ydHMucmlnaHQgPSBmdW5jdGlvbihzdHIpe1xuICBpZiAoc3RyLnRyaW1SaWdodCkgcmV0dXJuIHN0ci50cmltUmlnaHQoKTtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC9cXHMqJC8sICcnKTtcbn07XG4iLCJmdW5jdGlvbiBvbmUoc2VsZWN0b3IsIGVsKSB7XG4gIHJldHVybiBlbC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbn1cblxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc2VsZWN0b3IsIGVsKXtcbiAgZWwgPSBlbCB8fCBkb2N1bWVudDtcbiAgcmV0dXJuIG9uZShzZWxlY3RvciwgZWwpO1xufTtcblxuZXhwb3J0cy5hbGwgPSBmdW5jdGlvbihzZWxlY3RvciwgZWwpe1xuICBlbCA9IGVsIHx8IGRvY3VtZW50O1xuICByZXR1cm4gZWwucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG59O1xuXG5leHBvcnRzLmVuZ2luZSA9IGZ1bmN0aW9uKG9iail7XG4gIGlmICghb2JqLm9uZSkgdGhyb3cgbmV3IEVycm9yKCcub25lIGNhbGxiYWNrIHJlcXVpcmVkJyk7XG4gIGlmICghb2JqLmFsbCkgdGhyb3cgbmV3IEVycm9yKCcuYWxsIGNhbGxiYWNrIHJlcXVpcmVkJyk7XG4gIG9uZSA9IG9iai5vbmU7XG4gIGV4cG9ydHMuYWxsID0gb2JqLmFsbDtcbiAgcmV0dXJuIGV4cG9ydHM7XG59O1xuIiwiXG4vKipcbiAqIGlzQXJyYXlcbiAqL1xuXG52YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXk7XG5cbi8qKlxuICogdG9TdHJpbmdcbiAqL1xuXG52YXIgc3RyID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuLyoqXG4gKiBXZXRoZXIgb3Igbm90IHRoZSBnaXZlbiBgdmFsYFxuICogaXMgYW4gYXJyYXkuXG4gKlxuICogZXhhbXBsZTpcbiAqXG4gKiAgICAgICAgaXNBcnJheShbXSk7XG4gKiAgICAgICAgLy8gPiB0cnVlXG4gKiAgICAgICAgaXNBcnJheShhcmd1bWVudHMpO1xuICogICAgICAgIC8vID4gZmFsc2VcbiAqICAgICAgICBpc0FycmF5KCcnKTtcbiAqICAgICAgICAvLyA+IGZhbHNlXG4gKlxuICogQHBhcmFtIHttaXhlZH0gdmFsXG4gKiBAcmV0dXJuIHtib29sfVxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gaXNBcnJheSB8fCBmdW5jdGlvbiAodmFsKSB7XG4gIHJldHVybiAhISB2YWwgJiYgJ1tvYmplY3QgQXJyYXldJyA9PSBzdHIuY2FsbCh2YWwpO1xufTtcbiIsIi8qKlxuICogTW9kdWxlIERlcGVuZGVuY2llc1xuICovXG5cbnZhciB2YWx1ZSA9IHJlcXVpcmUoJ3ZhbHVlJyk7XG5cbi8qKlxuICogU2V0IGF0dHJpYnV0ZSBgbmFtZWAgdG8gYHZhbGAsIG9yIGdldCBhdHRyIGBuYW1lYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICogQHBhcmFtIHtTdHJpbmd9IFt2YWxdXG4gKiBAcmV0dXJuIHtTdHJpbmd8TGlzdH0gc2VsZlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5leHBvcnRzLmF0dHIgPSBmdW5jdGlvbihuYW1lLCB2YWwpe1xuICAvLyBnZXRcbiAgaWYgKDEgPT0gYXJndW1lbnRzLmxlbmd0aCkge1xuICAgIHJldHVybiB0aGlzWzBdICYmIHRoaXNbMF0uZ2V0QXR0cmlidXRlKG5hbWUpO1xuICB9XG5cbiAgLy8gcmVtb3ZlXG4gIGlmIChudWxsID09IHZhbCkge1xuICAgIHJldHVybiB0aGlzLnJlbW92ZUF0dHIobmFtZSk7XG4gIH1cblxuICAvLyBzZXRcbiAgcmV0dXJuIHRoaXMuZm9yRWFjaChmdW5jdGlvbihlbCl7XG4gICAgZWwuc2V0QXR0cmlidXRlKG5hbWUsIHZhbCk7XG4gIH0pO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgYXR0cmlidXRlIGBuYW1lYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICogQHJldHVybiB7TGlzdH0gc2VsZlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5leHBvcnRzLnJlbW92ZUF0dHIgPSBmdW5jdGlvbihuYW1lKXtcbiAgcmV0dXJuIHRoaXMuZm9yRWFjaChmdW5jdGlvbihlbCl7XG4gICAgZWwucmVtb3ZlQXR0cmlidXRlKG5hbWUpO1xuICB9KTtcbn07XG5cbi8qKlxuICogU2V0IHByb3BlcnR5IGBuYW1lYCB0byBgdmFsYCwgb3IgZ2V0IHByb3BlcnR5IGBuYW1lYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICogQHBhcmFtIHtTdHJpbmd9IFt2YWxdXG4gKiBAcmV0dXJuIHtPYmplY3R8TGlzdH0gc2VsZlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5leHBvcnRzLnByb3AgPSBmdW5jdGlvbihuYW1lLCB2YWwpe1xuICBpZiAoMSA9PSBhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIHRoaXNbMF0gJiYgdGhpc1swXVtuYW1lXTtcbiAgfVxuXG4gIHJldHVybiB0aGlzLmZvckVhY2goZnVuY3Rpb24oZWwpe1xuICAgIGVsW25hbWVdID0gdmFsO1xuICB9KTtcbn07XG5cbi8qKlxuICogR2V0IHRoZSBmaXJzdCBlbGVtZW50J3MgdmFsdWUgb3Igc2V0IHNlbGVjdGVkXG4gKiBlbGVtZW50IHZhbHVlcyB0byBgdmFsYC5cbiAqXG4gKiBAcGFyYW0ge01peGVkfSBbdmFsXVxuICogQHJldHVybiB7TWl4ZWR9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMudmFsID1cbmV4cG9ydHMudmFsdWUgPSBmdW5jdGlvbih2YWwpe1xuICBpZiAoMCA9PSBhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIHRoaXNbMF1cbiAgICAgID8gdmFsdWUodGhpc1swXSlcbiAgICAgIDogdW5kZWZpbmVkO1xuICB9XG5cbiAgcmV0dXJuIHRoaXMuZm9yRWFjaChmdW5jdGlvbihlbCl7XG4gICAgdmFsdWUoZWwsIHZhbCk7XG4gIH0pO1xufTtcbiIsIi8qKlxuICogTW9kdWxlIERlcGVuZGVuY2llc1xuICovXG5cbnZhciBjbGFzc2VzID0gcmVxdWlyZSgnY2xhc3NlcycpO1xuXG4vKipcbiAqIEFkZCB0aGUgZ2l2ZW4gY2xhc3MgYG5hbWVgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gKiBAcmV0dXJuIHtMaXN0fSBzZWxmXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMuYWRkQ2xhc3MgPSBmdW5jdGlvbihuYW1lKXtcbiAgcmV0dXJuIHRoaXMuZm9yRWFjaChmdW5jdGlvbihlbCkge1xuICAgIGVsLl9jbGFzc2VzID0gZWwuX2NsYXNzZXMgfHwgY2xhc3NlcyhlbCk7XG4gICAgZWwuX2NsYXNzZXMuYWRkKG5hbWUpO1xuICB9KTtcbn07XG5cbi8qKlxuICogUmVtb3ZlIHRoZSBnaXZlbiBjbGFzcyBgbmFtZWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd8UmVnRXhwfSBuYW1lXG4gKiBAcmV0dXJuIHtMaXN0fSBzZWxmXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMucmVtb3ZlQ2xhc3MgPSBmdW5jdGlvbihuYW1lKXtcbiAgcmV0dXJuIHRoaXMuZm9yRWFjaChmdW5jdGlvbihlbCkge1xuICAgIGVsLl9jbGFzc2VzID0gZWwuX2NsYXNzZXMgfHwgY2xhc3NlcyhlbCk7XG4gICAgZWwuX2NsYXNzZXMucmVtb3ZlKG5hbWUpO1xuICB9KTtcbn07XG5cbi8qKlxuICogVG9nZ2xlIHRoZSBnaXZlbiBjbGFzcyBgbmFtZWAsXG4gKiBvcHRpb25hbGx5IGEgYGJvb2xgIG1heSBiZSBnaXZlblxuICogdG8gaW5kaWNhdGUgdGhhdCB0aGUgY2xhc3Mgc2hvdWxkXG4gKiBiZSBhZGRlZCB3aGVuIHRydXRoeS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICogQHBhcmFtIHtCb29sZWFufSBib29sXG4gKiBAcmV0dXJuIHtMaXN0fSBzZWxmXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMudG9nZ2xlQ2xhc3MgPSBmdW5jdGlvbihuYW1lLCBib29sKXtcbiAgdmFyIGZuID0gJ3RvZ2dsZSc7XG5cbiAgLy8gdG9nZ2xlIHdpdGggYm9vbGVhblxuICBpZiAoMiA9PSBhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgZm4gPSBib29sID8gJ2FkZCcgOiAncmVtb3ZlJztcbiAgfVxuXG4gIHJldHVybiB0aGlzLmZvckVhY2goZnVuY3Rpb24oZWwpIHtcbiAgICBlbC5fY2xhc3NlcyA9IGVsLl9jbGFzc2VzIHx8IGNsYXNzZXMoZWwpO1xuICAgIGVsLl9jbGFzc2VzW2ZuXShuYW1lKTtcbiAgfSlcbn07XG5cbi8qKlxuICogQ2hlY2sgaWYgdGhlIGdpdmVuIGNsYXNzIGBuYW1lYCBpcyBwcmVzZW50LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5leHBvcnRzLmhhc0NsYXNzID0gZnVuY3Rpb24obmFtZSl7XG4gIHZhciBlbDtcblxuICBmb3IodmFyIGkgPSAwLCBsZW4gPSB0aGlzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgZWwgPSB0aGlzW2ldO1xuICAgIGVsLl9jbGFzc2VzID0gZWwuX2NsYXNzZXMgfHwgY2xhc3NlcyhlbCk7XG4gICAgaWYgKGVsLl9jbGFzc2VzLmhhcyhuYW1lKSkgcmV0dXJuIHRydWU7XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59O1xuIiwiLyoqXG4gKiBNb2R1bGUgRGVwZW5kZW5jaWVzXG4gKi9cblxudmFyIGV2ZW50cyA9IHJlcXVpcmUoJ2V2ZW50Jyk7XG52YXIgZGVsZWdhdGUgPSByZXF1aXJlKCdkZWxlZ2F0ZScpO1xuXG4vKipcbiAqIEJpbmQgdG8gYGV2ZW50YCBhbmQgaW52b2tlIGBmbihlKWAuIFdoZW5cbiAqIGEgYHNlbGVjdG9yYCBpcyBnaXZlbiB0aGVuIGV2ZW50cyBhcmUgZGVsZWdhdGVkLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHBhcmFtIHtTdHJpbmd9IFtzZWxlY3Rvcl1cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGNhcHR1cmVcbiAqIEByZXR1cm4ge0xpc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMub24gPSBmdW5jdGlvbihldmVudCwgc2VsZWN0b3IsIGZuLCBjYXB0dXJlKXtcbiAgaWYgKCdzdHJpbmcnID09IHR5cGVvZiBzZWxlY3Rvcikge1xuICAgIHJldHVybiB0aGlzLmZvckVhY2goZnVuY3Rpb24gKGVsKSB7XG4gICAgICBmbi5fZGVsZWdhdGUgPSBkZWxlZ2F0ZS5iaW5kKGVsLCBzZWxlY3RvciwgZXZlbnQsIGZuLCBjYXB0dXJlKTtcbiAgICB9KTtcbiAgfVxuXG4gIGNhcHR1cmUgPSBmbjtcbiAgZm4gPSBzZWxlY3RvcjtcblxuICByZXR1cm4gdGhpcy5mb3JFYWNoKGZ1bmN0aW9uIChlbCkge1xuICAgIGV2ZW50cy5iaW5kKGVsLCBldmVudCwgZm4sIGNhcHR1cmUpO1xuICB9KTtcbn07XG5cbi8qKlxuICogVW5iaW5kIHRvIGBldmVudGAgYW5kIGludm9rZSBgZm4oZSlgLiBXaGVuXG4gKiBhIGBzZWxlY3RvcmAgaXMgZ2l2ZW4gdGhlbiBkZWxlZ2F0ZWQgZXZlbnRcbiAqIGhhbmRsZXJzIGFyZSB1bmJvdW5kLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHBhcmFtIHtTdHJpbmd9IFtzZWxlY3Rvcl1cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGNhcHR1cmVcbiAqIEByZXR1cm4ge0xpc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMub2ZmID0gZnVuY3Rpb24oZXZlbnQsIHNlbGVjdG9yLCBmbiwgY2FwdHVyZSl7XG4gIGlmICgnc3RyaW5nJyA9PSB0eXBlb2Ygc2VsZWN0b3IpIHtcbiAgICByZXR1cm4gdGhpcy5mb3JFYWNoKGZ1bmN0aW9uIChlbCkge1xuICAgICAgLy8gVE9ETzogYWRkIHNlbGVjdG9yIHN1cHBvcnQgYmFja1xuICAgICAgZGVsZWdhdGUudW5iaW5kKGVsLCBldmVudCwgZm4uX2RlbGVnYXRlLCBjYXB0dXJlKTtcbiAgICB9KTtcbiAgfVxuXG4gIGNhcHR1cmUgPSBmbjtcbiAgZm4gPSBzZWxlY3RvcjtcblxuICByZXR1cm4gdGhpcy5mb3JFYWNoKGZ1bmN0aW9uIChlbCkge1xuICAgIGV2ZW50cy51bmJpbmQoZWwsIGV2ZW50LCBmbiwgY2FwdHVyZSk7XG4gIH0pO1xufTtcbiIsIi8qKlxuICogTW9kdWxlIERlcGVuZGVuY2llc1xuICovXG5cbnZhciB2YWx1ZSA9IHJlcXVpcmUoJ3ZhbHVlJyk7XG52YXIgY3NzID0gcmVxdWlyZSgnY3NzJyk7XG5cbi8qKlxuICogUmV0dXJuIGVsZW1lbnQgdGV4dC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtTdHJpbmd8TGlzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy50ZXh0ID0gZnVuY3Rpb24oc3RyKSB7XG4gIGlmICgxID09IGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICByZXR1cm4gdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKGVsKSB7XG4gICAgICB2YXIgbm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHN0cik7XG4gICAgICBlbC50ZXh0Q29udGVudCA9ICcnO1xuICAgICAgZWwuYXBwZW5kQ2hpbGQobm9kZSk7XG4gICAgfSk7XG4gIH1cblxuICB2YXIgb3V0ID0gJyc7XG4gIHRoaXMuZm9yRWFjaChmdW5jdGlvbihlbCkge1xuICAgIG91dCArPSBnZXRUZXh0KGVsKTtcbiAgfSk7XG5cbiAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogR2V0IHRleHQgaGVscGVyIGZyb20gU2l6emxlLlxuICpcbiAqIFNvdXJjZTogaHR0cHM6Ly9naXRodWIuY29tL2pxdWVyeS9zaXp6bGUvYmxvYi9tYXN0ZXIvc3JjL3NpenpsZS5qcyNMOTE0LUw5NDdcbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR8QXJyYXl9IGVsXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cblxuZnVuY3Rpb24gZ2V0VGV4dChlbCkge1xuICB2YXIgcmV0ID0gJyc7XG4gIHZhciB0eXBlID0gZWwubm9kZVR5cGU7XG4gIHZhciBub2RlO1xuXG4gIHN3aXRjaCh0eXBlKSB7XG4gICAgY2FzZSAxOlxuICAgIGNhc2UgOTpcbiAgICBjYXNlIDExOlxuICAgICAgaWYgKCdzdHJpbmcnID09IHR5cGVvZiBlbC50ZXh0Q29udGVudCkgcmV0dXJuIGVsLnRleHRDb250ZW50O1xuICAgICAgZm9yIChlbCA9IGVsLmZpcnN0Q2hpbGQ7IGVsOyBlbCA9IGVsLm5leHRTaWJsaW5nKSByZXQgKz0gdGV4dChlbCk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIDM6XG4gICAgY2FzZSA0OlxuICAgICAgcmV0dXJuIGVsLm5vZGVWYWx1ZTtcbiAgICBkZWZhdWx0OlxuICAgICAgd2hpbGUgKG5vZGUgPSBlbFtpKytdKSB7XG4gICAgICAgIHJldCArPSBnZXRUZXh0KG5vZGUpO1xuICAgICAgfVxuICB9XG5cbiAgcmV0dXJuIHJldDtcbn1cblxuLyoqXG4gKiBSZXR1cm4gZWxlbWVudCBodG1sLlxuICpcbiAqIEByZXR1cm4ge1N0cmluZ30gaHRtbFxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5leHBvcnRzLmh0bWwgPSBmdW5jdGlvbihodG1sKSB7XG4gIGlmICgxID09IGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICByZXR1cm4gdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKGVsKSB7XG4gICAgICBlbC5pbm5lckhUTUwgPSBodG1sO1xuICAgIH0pO1xuICB9XG5cbiAgLy8gVE9ETzogcmVhbCBpbXBsXG4gIHJldHVybiB0aGlzWzBdICYmIHRoaXNbMF0uaW5uZXJIVE1MO1xufTtcblxuLyoqXG4gKiBHZXQgYW5kIHNldCB0aGUgY3NzIHZhbHVlXG4gKlxuICogQHBhcmFtIHtTdHJpbmd8T2JqZWN0fSBwcm9wXG4gKiBAcGFyYW0ge01peGVkfSB2YWxcbiAqIEByZXR1cm4ge01peGVkfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5leHBvcnRzLmNzcyA9IGZ1bmN0aW9uKHByb3AsIHZhbCkge1xuICAvLyBnZXR0ZXJcbiAgaWYgKCF2YWwgJiYgJ29iamVjdCcgIT0gdHlwZW9mIHByb3ApIHtcbiAgICByZXR1cm4gY3NzKHRoaXNbMF0sIHByb3ApO1xuICB9XG4gIC8vIHNldHRlclxuICB0aGlzLmZvckVhY2goZnVuY3Rpb24oZWwpIHtcbiAgICBjc3MoZWwsIHByb3AsIHZhbCk7XG4gIH0pO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBQcmVwZW5kIGB2YWxgLlxuICpcbiAqIEZyb20galF1ZXJ5OiBpZiB0aGVyZSBpcyBtb3JlIHRoYW4gb25lIHRhcmdldCBlbGVtZW50XG4gKiBjbG9uZWQgY29waWVzIG9mIHRoZSBpbnNlcnRlZCBlbGVtZW50IHdpbGwgYmUgY3JlYXRlZFxuICogZm9yIGVhY2ggdGFyZ2V0IGFmdGVyIHRoZSBmaXJzdC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xFbGVtZW50fExpc3R9IHZhbFxuICogQHJldHVybiB7TGlzdH0gc2VsZlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5leHBvcnRzLnByZXBlbmQgPSBmdW5jdGlvbih2YWwpIHtcbiAgdmFyIGRvbSA9IHRoaXMuZG9tO1xuXG4gIHRoaXMuZm9yRWFjaChmdW5jdGlvbih0YXJnZXQsIGkpIHtcbiAgICBkb20odmFsKS5mb3JFYWNoKGZ1bmN0aW9uKHNlbGVjdG9yKSB7XG4gICAgICBzZWxlY3RvciA9IGkgPyBzZWxlY3Rvci5jbG9uZU5vZGUodHJ1ZSkgOiBzZWxlY3RvcjtcbiAgICAgIGlmICh0YXJnZXQuY2hpbGRyZW4ubGVuZ3RoKSB7XG4gICAgICAgIHRhcmdldC5pbnNlcnRCZWZvcmUoc2VsZWN0b3IsIHRhcmdldC5maXJzdENoaWxkKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRhcmdldC5hcHBlbmRDaGlsZChzZWxlY3Rvcik7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBBcHBlbmQgYHZhbGAuXG4gKlxuICogRnJvbSBqUXVlcnk6IGlmIHRoZXJlIGlzIG1vcmUgdGhhbiBvbmUgdGFyZ2V0IGVsZW1lbnRcbiAqIGNsb25lZCBjb3BpZXMgb2YgdGhlIGluc2VydGVkIGVsZW1lbnQgd2lsbCBiZSBjcmVhdGVkXG4gKiBmb3IgZWFjaCB0YXJnZXQgYWZ0ZXIgdGhlIGZpcnN0LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfEVsZW1lbnR8TGlzdH0gdmFsXG4gKiBAcmV0dXJuIHtMaXN0fSBzZWxmXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMuYXBwZW5kID0gZnVuY3Rpb24odmFsKSB7XG4gIHZhciBkb20gPSB0aGlzLmRvbTtcblxuICB0aGlzLmZvckVhY2goZnVuY3Rpb24odGFyZ2V0LCBpKSB7XG4gICAgZG9tKHZhbCkuZm9yRWFjaChmdW5jdGlvbihlbCkge1xuICAgICAgZWwgPSBpID8gZWwuY2xvbmVOb2RlKHRydWUpIDogZWw7XG4gICAgICB0YXJnZXQuYXBwZW5kQ2hpbGQoZWwpO1xuICAgIH0pO1xuICB9KTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogSW5zZXJ0IHNlbGYncyBgZWxzYCBhZnRlciBgdmFsYFxuICpcbiAqIEZyb20galF1ZXJ5OiBpZiB0aGVyZSBpcyBtb3JlIHRoYW4gb25lIHRhcmdldCBlbGVtZW50LFxuICogY2xvbmVkIGNvcGllcyBvZiB0aGUgaW5zZXJ0ZWQgZWxlbWVudCB3aWxsIGJlIGNyZWF0ZWRcbiAqIGZvciBlYWNoIHRhcmdldCBhZnRlciB0aGUgZmlyc3QsIGFuZCB0aGF0IG5ldyBzZXRcbiAqICh0aGUgb3JpZ2luYWwgZWxlbWVudCBwbHVzIGNsb25lcykgaXMgcmV0dXJuZWQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd8RWxlbWVudHxMaXN0fSB2YWxcbiAqIEByZXR1cm4ge0xpc3R9IHNlbGZcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy5pbnNlcnRBZnRlciA9IGZ1bmN0aW9uKHZhbCkge1xuICB2YXIgZG9tID0gdGhpcy5kb207XG5cbiAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKGVsKSB7XG4gICAgZG9tKHZhbCkuZm9yRWFjaChmdW5jdGlvbih0YXJnZXQsIGkpIHtcbiAgICAgIGlmICghdGFyZ2V0LnBhcmVudE5vZGUpIHJldHVybjtcbiAgICAgIGVsID0gaSA/IGVsLmNsb25lTm9kZSh0cnVlKSA6IGVsO1xuICAgICAgdGFyZ2V0LnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGVsLCB0YXJnZXQubmV4dFNpYmxpbmcpO1xuICAgIH0pO1xuICB9KTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQXBwZW5kIHNlbGYncyBgZWxgIHRvIGB2YWxgXG4gKlxuICogQHBhcmFtIHtTdHJpbmd8RWxlbWVudHxMaXN0fSB2YWxcbiAqIEByZXR1cm4ge0xpc3R9IHNlbGZcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy5hcHBlbmRUbyA9IGZ1bmN0aW9uKHZhbCkge1xuICB0aGlzLmRvbSh2YWwpLmFwcGVuZCh0aGlzKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJlcGxhY2UgZWxlbWVudHMgaW4gdGhlIERPTS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xFbGVtZW50fExpc3R9IHZhbFxuICogQHJldHVybiB7TGlzdH0gc2VsZlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5leHBvcnRzLnJlcGxhY2UgPSBmdW5jdGlvbih2YWwpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICB2YXIgbGlzdCA9IHRoaXMuZG9tKHZhbCk7XG5cbiAgbGlzdC5mb3JFYWNoKGZ1bmN0aW9uKGVsLCBpKSB7XG4gICAgdmFyIG9sZCA9IHNlbGZbaV07XG4gICAgdmFyIHBhcmVudCA9IG9sZC5wYXJlbnROb2RlO1xuICAgIGlmICghcGFyZW50KSByZXR1cm47XG4gICAgZWwgPSBpID8gZWwuY2xvbmVOb2RlKHRydWUpIDogZWw7XG4gICAgcGFyZW50LnJlcGxhY2VDaGlsZChlbCwgb2xkKTtcbiAgfSk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEVtcHR5IHRoZSBkb20gbGlzdFxuICpcbiAqIEByZXR1cm4gc2VsZlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5leHBvcnRzLmVtcHR5ID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLmZvckVhY2goZnVuY3Rpb24oZWwpIHtcbiAgICBlbC50ZXh0Q29udGVudCA9ICcnO1xuICB9KTtcbn07XG5cbi8qKlxuICogUmVtb3ZlIGFsbCBlbGVtZW50cyBpbiB0aGUgZG9tIGxpc3RcbiAqXG4gKiBAcmV0dXJuIHtMaXN0fSBzZWxmXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMucmVtb3ZlID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLmZvckVhY2goZnVuY3Rpb24oZWwpIHtcbiAgICB2YXIgcGFyZW50ID0gZWwucGFyZW50Tm9kZTtcbiAgICBpZiAocGFyZW50KSBwYXJlbnQucmVtb3ZlQ2hpbGQoZWwpO1xuICB9KTtcbn07XG5cbi8qKlxuICogUmV0dXJuIGEgY2xvbmVkIGRvbSBsaXN0IHdpdGggYWxsIGVsZW1lbnRzIGNsb25lZC5cbiAqXG4gKiBAcmV0dXJuIHtMaXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5leHBvcnRzLmNsb25lID0gZnVuY3Rpb24oKSB7XG4gIHZhciBvdXQgPSB0aGlzLm1hcChmdW5jdGlvbihlbCkge1xuICAgIHJldHVybiBlbC5jbG9uZU5vZGUodHJ1ZSk7XG4gIH0pO1xuXG4gIHJldHVybiB0aGlzLmRvbShvdXQpO1xufTtcbiIsIi8qKlxuICogTW9kdWxlIERlcGVuZGVuY2llc1xuICovXG5cbnZhciBwcm90byA9IEFycmF5LnByb3RvdHlwZTtcbnZhciB0cmF2ZXJzZSA9IHJlcXVpcmUoJ3RyYXZlcnNlJyk7XG52YXIgdG9GdW5jdGlvbiA9IHJlcXVpcmUoJ3RvLWZ1bmN0aW9uJyk7XG52YXIgbWF0Y2hlcyA9IHJlcXVpcmUoJ21hdGNoZXMtc2VsZWN0b3InKTtcblxuLyoqXG4gKiBGaW5kIGNoaWxkcmVuIG1hdGNoaW5nIHRoZSBnaXZlbiBgc2VsZWN0b3JgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzZWxlY3RvclxuICogQHJldHVybiB7TGlzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy5maW5kID0gZnVuY3Rpb24oc2VsZWN0b3Ipe1xuICByZXR1cm4gdGhpcy5kb20oc2VsZWN0b3IsIHRoaXMpO1xufTtcblxuLyoqXG4gKiBDaGVjayBpZiB0aGUgYW55IGVsZW1lbnQgaW4gdGhlIHNlbGVjdGlvblxuICogbWF0Y2hlcyBgc2VsZWN0b3JgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzZWxlY3RvclxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy5pcyA9IGZ1bmN0aW9uKHNlbGVjdG9yKXtcbiAgZm9yKHZhciBpID0gMCwgZWw7IGVsID0gdGhpc1tpXTsgaSsrKSB7XG4gICAgaWYgKG1hdGNoZXMoZWwsIHNlbGVjdG9yKSkgcmV0dXJuIHRydWU7XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59O1xuXG4vKipcbiAqIEdldCBwYXJlbnQocykgd2l0aCBvcHRpb25hbCBgc2VsZWN0b3JgIGFuZCBgbGltaXRgXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHNlbGVjdG9yXG4gKiBAcGFyYW0ge051bWJlcn0gbGltaXRcbiAqIEByZXR1cm4ge0xpc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMucGFyZW50ID0gZnVuY3Rpb24oc2VsZWN0b3IsIGxpbWl0KXtcbiAgcmV0dXJuIHRoaXMuZG9tKHRyYXZlcnNlKCdwYXJlbnROb2RlJyxcbiAgICB0aGlzWzBdLFxuICAgIHNlbGVjdG9yLFxuICAgIGxpbWl0XG4gICAgfHwgMSkpO1xufTtcblxuLyoqXG4gKiBHZXQgbmV4dCBlbGVtZW50KHMpIHdpdGggb3B0aW9uYWwgYHNlbGVjdG9yYCBhbmQgYGxpbWl0YC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc2VsZWN0b3JcbiAqIEBwYXJhbSB7TnVtYmVyfSBsaW1pdFxuICogQHJldHJ1biB7TGlzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy5uZXh0ID0gZnVuY3Rpb24oc2VsZWN0b3IsIGxpbWl0KXtcbiAgcmV0dXJuIHRoaXMuZG9tKHRyYXZlcnNlKCduZXh0U2libGluZycsXG4gICAgdGhpc1swXSxcbiAgICBzZWxlY3RvcixcbiAgICBsaW1pdFxuICAgIHx8IDEpKTtcbn07XG5cbi8qKlxuICogR2V0IHByZXZpb3VzIGVsZW1lbnQocykgd2l0aCBvcHRpb25hbCBgc2VsZWN0b3JgIGFuZCBgbGltaXRgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzZWxlY3RvclxuICogQHBhcmFtIHtOdW1iZXJ9IGxpbWl0XG4gKiBAcmV0dXJuIHtMaXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5leHBvcnRzLnByZXYgPVxuZXhwb3J0cy5wcmV2aW91cyA9IGZ1bmN0aW9uKHNlbGVjdG9yLCBsaW1pdCl7XG4gIHJldHVybiB0aGlzLmRvbSh0cmF2ZXJzZSgncHJldmlvdXNTaWJsaW5nJyxcbiAgICB0aGlzWzBdLFxuICAgIHNlbGVjdG9yLFxuICAgIGxpbWl0XG4gICAgfHwgMSkpO1xufTtcblxuLyoqXG4gKiBJdGVyYXRlIG92ZXIgZWFjaCBlbGVtZW50IGNyZWF0aW5nIGEgbmV3IGxpc3Qgd2l0aFxuICogb25lIGl0ZW0gYW5kIGludm9raW5nIGBmbihsaXN0LCBpKWAuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge0xpc3R9IHNlbGZcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy5lYWNoID0gZnVuY3Rpb24oZm4pe1xuICB2YXIgZG9tID0gdGhpcy5kb207XG5cbiAgZm9yICh2YXIgaSA9IDAsIGxpc3QsIGxlbiA9IHRoaXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICBsaXN0ID0gZG9tKHRoaXNbaV0pO1xuICAgIGZuLmNhbGwobGlzdCwgbGlzdCwgaSk7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogSXRlcmF0ZSBvdmVyIGVhY2ggZWxlbWVudCBhbmQgaW52b2tlIGBmbihlbCwgaSlgXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge0xpc3R9IHNlbGZcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy5mb3JFYWNoID0gZnVuY3Rpb24oZm4pIHtcbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHRoaXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICBmbi5jYWxsKHRoaXNbaV0sIHRoaXNbaV0sIGkpO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIE1hcCBlYWNoIHJldHVybiB2YWx1ZSBmcm9tIGBmbih2YWwsIGkpYC5cbiAqXG4gKiBQYXNzaW5nIGEgY2FsbGJhY2sgZnVuY3Rpb246XG4gKlxuICogICAgaW5wdXRzLm1hcChmdW5jdGlvbihpbnB1dCl7XG4gKiAgICAgIHJldHVybiBpbnB1dC50eXBlXG4gKiAgICB9KVxuICpcbiAqIFBhc3NpbmcgYSBwcm9wZXJ0eSBzdHJpbmc6XG4gKlxuICogICAgaW5wdXRzLm1hcCgndHlwZScpXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge0xpc3R9IHNlbGZcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy5tYXAgPSBmdW5jdGlvbihmbil7XG4gIGZuID0gdG9GdW5jdGlvbihmbik7XG4gIHZhciBkb20gPSB0aGlzLmRvbTtcbiAgdmFyIG91dCA9IFtdO1xuXG4gIGZvciAodmFyIGkgPSAwLCBsZW4gPSB0aGlzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgb3V0LnB1c2goZm4uY2FsbChkb20odGhpc1tpXSksIHRoaXNbaV0sIGkpKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzLmRvbShvdXQpO1xufTtcblxuLyoqXG4gKiBTZWxlY3QgYWxsIHZhbHVlcyB0aGF0IHJldHVybiBhIHRydXRoeSB2YWx1ZSBvZiBgZm4odmFsLCBpKWAuXG4gKlxuICogICAgaW5wdXRzLnNlbGVjdChmdW5jdGlvbihpbnB1dCl7XG4gKiAgICAgIHJldHVybiBpbnB1dC50eXBlID09ICdwYXNzd29yZCdcbiAqICAgIH0pXG4gKlxuICogIFdpdGggYSBwcm9wZXJ0eTpcbiAqXG4gKiAgICBpbnB1dHMuc2VsZWN0KCd0eXBlID09IHBhc3N3b3JkJylcbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufFN0cmluZ30gZm5cbiAqIEByZXR1cm4ge0xpc3R9IHNlbGZcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy5maWx0ZXIgPVxuZXhwb3J0cy5zZWxlY3QgPSBmdW5jdGlvbihmbil7XG4gIGZuID0gdG9GdW5jdGlvbihmbik7XG4gIHZhciBkb20gPSB0aGlzLmRvbTtcbiAgdmFyIG91dCA9IFtdO1xuICB2YXIgdmFsO1xuXG4gIGZvciAodmFyIGkgPSAwLCBsZW4gPSB0aGlzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgdmFsID0gZm4uY2FsbChkb20odGhpc1tpXSksIHRoaXNbaV0sIGkpO1xuICAgIGlmICh2YWwpIG91dC5wdXNoKHRoaXNbaV0pO1xuICB9XG5cbiAgcmV0dXJuIHRoaXMuZG9tKG91dCk7XG59O1xuXG4vKipcbiAqIFJlamVjdCBhbGwgdmFsdWVzIHRoYXQgcmV0dXJuIGEgdHJ1dGh5IHZhbHVlIG9mIGBmbih2YWwsIGkpYC5cbiAqXG4gKiBSZWplY3RpbmcgdXNpbmcgYSBjYWxsYmFjazpcbiAqXG4gKiAgICBpbnB1dC5yZWplY3QoZnVuY3Rpb24odXNlcil7XG4gKiAgICAgIHJldHVybiBpbnB1dC5sZW5ndGggPCAyMFxuICogICAgfSlcbiAqXG4gKiBSZWplY3Rpbmcgd2l0aCBhIHByb3BlcnR5OlxuICpcbiAqICAgIGl0ZW1zLnJlamVjdCgncGFzc3dvcmQnKVxuICpcbiAqIFJlamVjdGluZyB2YWx1ZXMgdmlhIGA9PWA6XG4gKlxuICogICAgZGF0YS5yZWplY3QobnVsbClcbiAqICAgIGlucHV0LnJlamVjdChmaWxlKVxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb258U3RyaW5nfE1peGVkfSBmblxuICogQHJldHVybiB7TGlzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy5yZWplY3QgPSBmdW5jdGlvbihmbil7XG4gIHZhciBvdXQgPSBbXTtcbiAgdmFyIGxlbiA9IHRoaXMubGVuZ3RoO1xuICB2YXIgdmFsLCBpO1xuXG4gIGlmICgnc3RyaW5nJyA9PSB0eXBlb2YgZm4pIGZuID0gdG9GdW5jdGlvbihmbik7XG5cbiAgaWYgKGZuKSB7XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICB2YWwgPSBmbi5jYWxsKGRvbSh0aGlzW2ldKSwgdGhpc1tpXSwgaSk7XG4gICAgICBpZiAoIXZhbCkgb3V0LnB1c2godGhpc1tpXSk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgaWYgKHRoaXNbaV0gIT0gZm4pIG91dC5wdXNoKHRoaXNbaV0pO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzLmRvbShvdXQpO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gYSBgTGlzdGAgY29udGFpbmluZyB0aGUgZWxlbWVudCBhdCBgaWAuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IGlcbiAqIEByZXR1cm4ge0xpc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMuYXQgPSBmdW5jdGlvbihpKXtcbiAgcmV0dXJuIHRoaXMuZG9tKHRoaXNbaV0pO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gYSBgTGlzdGAgY29udGFpbmluZyB0aGUgZmlyc3QgZWxlbWVudC5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gaVxuICogQHJldHVybiB7TGlzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy5maXJzdCA9IGZ1bmN0aW9uKCl7XG4gIHJldHVybiB0aGlzLmRvbSh0aGlzWzBdKTtcbn07XG5cbi8qKlxuICogUmV0dXJuIGEgYExpc3RgIGNvbnRhaW5pbmcgdGhlIGxhc3QgZWxlbWVudC5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gaVxuICogQHJldHVybiB7TGlzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy5sYXN0ID0gZnVuY3Rpb24oKXtcbiAgcmV0dXJuIHRoaXMuZG9tKHRoaXNbdGhpcy5sZW5ndGggLSAxXSk7XG59O1xuXG4vKipcbiAqIE1peGluIHRoZSBhcnJheSBmdW5jdGlvbnNcbiAqL1xuXG5bXG4gICdwdXNoJyxcbiAgJ3BvcCcsXG4gICdzaGlmdCcsXG4gICdzcGxpY2UnLFxuICAndW5zaGlmdCcsXG4gICdyZXZlcnNlJyxcbiAgJ3NvcnQnLFxuICAndG9TdHJpbmcnLFxuICAnY29uY2F0JyxcbiAgJ2pvaW4nLFxuICAnc2xpY2UnXG5dLmZvckVhY2goZnVuY3Rpb24obWV0aG9kKSB7XG4gIGV4cG9ydHNbbWV0aG9kXSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBwcm90b1ttZXRob2RdLmFwcGx5KHRoaXMudG9BcnJheSgpLCBhcmd1bWVudHMpO1xuICB9O1xufSk7XG5cbiIsIlxudmFyIGV4dGVuc2libGUgPSByZXF1aXJlKCdleHRlbnNpYmxlJylcbnZhciBtcyA9IHJlcXVpcmUoJ3BhcnNlLWR1cmF0aW9uJylcbnZhciBFbWl0dGVyID0gcmVxdWlyZSgnZW1pdHRlcicpXG52YXIgZWFzZSA9IHJlcXVpcmUoJ2Vhc2UnKVxudmFyIG5vdyA9IHJlcXVpcmUoJ25vdycpXG52YXIgcmFmID0gcmVxdWlyZSgncmFmJylcblxubW9kdWxlLmV4cG9ydHMgPSBBbmltYXRpb25cblxuZnVuY3Rpb24gQW5pbWF0aW9uKCl7fVxuXG4vKipcbiAqIG1peGluIG1ldGhvZHNcbiAqL1xuXG5FbWl0dGVyKEFuaW1hdGlvbi5wcm90b3R5cGUpXG5leHRlbnNpYmxlKEFuaW1hdGlvbilcblxuLyoqXG4gKiBzZXQgZHVyYXRpb24gdG8gYG5gIG1pbGxpc2Vjb25kcy4gWW91IGNhbiBhbHNvXG4gKiBwYXNzIGEgbmF0dXJhbCBsYW5ndWFnZSBzdHJpbmdcbiAqXG4gKiBAcGFyYW0ge051bWJlcnxTdHJpbmd9IG5cbiAqIEByZXR1cm4ge3RoaXN9XG4gKi9cblxuQW5pbWF0aW9uLnByb3RvdHlwZS5kdXJhdGlvbiA9IGZ1bmN0aW9uKG4pe1xuICBpZiAodHlwZW9mIG4gPT0gJ3N0cmluZycpIG4gPSBtcyhuKVxuICB0aGlzLl9kdXJhdGlvbiA9IG5cbiAgcmV0dXJuIHRoaXNcbn1cblxuLyoqXG4gKiBTZXQgZWFzaW5nIGZ1bmN0aW9uIHRvIGBmbmAuXG4gKlxuICogICBhbmltYXRpb24uZWFzZSgnaW4tb3V0LXNpbmUnKVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfEZ1bmN0aW9ufSBmblxuICogQHJldHVybiB7dGhpc31cbiAqL1xuXG5BbmltYXRpb24ucHJvdG90eXBlLmVhc2UgPSBmdW5jdGlvbihmbil7XG4gIGlmICh0eXBlb2YgZm4gPT0gJ3N0cmluZycpIGZuID0gZWFzZVtmbl1cbiAgaWYgKCFmbikgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIGVhc2luZyBmdW5jdGlvbicpXG4gIHRoaXMuX2Vhc2UgPSBmblxuICByZXR1cm4gdGhpc1xufVxuXG5BbmltYXRpb24ucHJvdG90eXBlLmVhc2UoJ2xpbmVhcicpIC8vIGRlZmF1bHRcblxuLyoqXG4gKiBydW4gdGhlIGFuaW1hdGlvbiB3aXRoIGFuIG9wdGlvbmFsIGR1cmF0aW9uXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ8U3RyaW5nfEZ1bmN0aW9ufSBbbl1cbiAqIEByZXR1cm4ge3RoaXN9XG4gKi9cblxuQW5pbWF0aW9uLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbihuKXtcbiAgaWYgKG4gIT0gbnVsbCkgdGhpcy5kdXJhdGlvbihuKVxuICB2YXIgZHVyYXRpb24gPSB0aGlzLl9kdXJhdGlvblxuICB2YXIgc3RhcnQgPSBub3coKVxuICB2YXIgc2VsZiA9IHRoaXNcbiAgcmFmKGZ1bmN0aW9uIGxvb3AoKXtcbiAgICB2YXIgcHJvZ3Jlc3MgPSAobm93KCkgLSBzdGFydCkgLyBkdXJhdGlvblxuICAgIGlmIChwcm9ncmVzcyA+PSAxKSB7XG4gICAgICBzZWxmLnJlbmRlcigxKVxuICAgICAgc2VsZi5ydW5uaW5nID0gZmFsc2VcbiAgICAgIHNlbGYuZW1pdCgnZW5kJylcbiAgICB9IGVsc2Uge1xuICAgICAgc2VsZi5yZW5kZXIocHJvZ3Jlc3MpXG4gICAgICByYWYobG9vcClcbiAgICB9XG4gIH0pXG4gIHRoaXMucnVubmluZyA9IHRydWVcbiAgcmV0dXJuIHRoaXNcbn1cbiIsIlxuLyoqXG4gKiBFeHBvc2UgYHVubWF0cml4YCBhbmQgaGVscGVyc1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IHVubWF0cml4O1xuZXhwb3J0cy5kZWNvbXBvc2UgPSBkZWNvbXBvc2U7XG5leHBvcnRzLnBhcnNlID0gcGFyc2U7XG5cbi8qKlxuICogVW5tYXRyaXhcbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cblxuZnVuY3Rpb24gdW5tYXRyaXgoc3RyKSB7XG4gIHJldHVybiBkZWNvbXBvc2UocGFyc2Uoc3RyKSk7XG59XG5cbi8qKlxuICogVW5tYXRyaXg6IHBhcnNlIHRoZSB2YWx1ZXMgb2YgdGhlIG1hdHJpeFxuICpcbiAqIEFsZ29yaXRobSBmcm9tOlxuICpcbiAqIC0gaHR0cDovL2hnLm1vemlsbGEub3JnL21vemlsbGEtY2VudHJhbC9maWxlLzdjYjNlOTc5NWQwNC9sYXlvdXQvc3R5bGUvbnNTdHlsZUFuaW1hdGlvbi5jcHBcbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBtIChtYXRyaXgpXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBkZWNvbXBvc2UobSkge1xuICB2YXIgQSA9IG1bMF07XG4gIHZhciBCID0gbVsxXTtcbiAgdmFyIEMgPSBtWzJdO1xuICB2YXIgRCA9IG1bM107XG4gIHZhciBkZXRlcm1pbmFudCA9IEEgKiBEIC0gQiAqIEM7XG5cbiAgLy8gc3RlcCgxKVxuICBpZiAoIWRldGVybWluYW50KSB0aHJvdyBuZXcgRXJyb3IoJ3RyYW5zZm9ybSN1bm1hdHJpeDogbWF0cml4IGlzIHNpbmd1bGFyJyk7XG5cbiAgLy8gc3RlcCAoMylcbiAgdmFyIHNjYWxlWCA9IE1hdGguc3FydChBICogQSArIEIgKiBCKTtcbiAgQSAvPSBzY2FsZVg7XG4gIEIgLz0gc2NhbGVYO1xuXG4gIC8vIHN0ZXAgKDQpXG4gIHZhciBza2V3ID0gQSAqIEMgKyBCICogRDtcbiAgQyAtPSBBICogc2tldztcbiAgRCAtPSBCICogc2tldztcblxuICAvLyBzdGVwICg1KVxuICB2YXIgc2NhbGVZID0gTWF0aC5zcXJ0KEMgKiBDICsgRCAqIEQpO1xuICBDIC89IHNjYWxlWTtcbiAgRCAvPSBzY2FsZVk7XG4gIHNrZXcgLz0gc2NhbGVZO1xuXG4gIC8vIHN0ZXAgKDYpXG4gIGlmIChkZXRlcm1pbmFudCA8IDApIHtcbiAgICBBID0gLUE7XG4gICAgQiA9IC1CO1xuICAgIHNrZXcgPSAtc2tldztcbiAgICBzY2FsZVggPSAtc2NhbGVYO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICB0cmFuc2xhdGVYOiBtWzRdLFxuICAgIHRyYW5zbGF0ZVk6IG1bNV0sXG4gICAgcm90YXRlOiBydG9kKE1hdGguYXRhbjIoQiwgQSkpLFxuICAgIHNrZXc6IHJ0b2QoTWF0aC5hdGFuKHNrZXcpKSxcbiAgICBzY2FsZVg6IHJvdW5kKHNjYWxlWCksXG4gICAgc2NhbGVZOiByb3VuZChzY2FsZVkpXG4gIH07XG59XG5cbi8qKlxuICogU3RyaW5nIHRvIG1hdHJpeFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHlsZVxuICogQHJldHVybiB7QXJyYXl9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBwYXJzZShzdHIpIHtcbiAgdmFyIG0gPSBzdHIuc2xpY2UoNykubWF0Y2goL1tcXGRcXC5cXC1dKy9nKTtcbiAgaWYgKCFtKSByZXR1cm4gWzEsIDAsIDAsIDEsIDAsIDBdXG4gIHJldHVybiBtLmxlbmd0aCA9PSA2XG4gICAgPyBtLm1hcChOdW1iZXIpXG4gICAgOiBbXG4gICAgICAgICttWzBdICwgK21bMV0sXG4gICAgICAgICttWzRdICwgK21bNV0sXG4gICAgICAgICttWzEyXSwgK21bMTNdXG4gICAgICBdO1xufVxuXG4vKipcbiAqIFJhZGlhbnMgdG8gZGVncmVlc1xuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSByYWRpYW5zXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IGRlZ3JlZXNcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHJ0b2QocmFkaWFucykge1xuICB2YXIgZGVnID0gcmFkaWFucyAqIDE4MCAvIE1hdGguUEk7XG4gIHJldHVybiByb3VuZChkZWcpO1xufVxuXG4vKipcbiAqIFJvdW5kIHRvIHRoZSBuZWFyZXN0IGh1bmRyZWR0aFxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBuXG4gKiBAcmV0dXJuIHtOdW1iZXJ9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiByb3VuZChuKSB7XG4gIHJldHVybiBNYXRoLnJvdW5kKG4gKiAxMDApIC8gMTAwO1xufVxuIiwiXG4vKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxudmFyIHR5cGUgPSByZXF1aXJlKCd0eXBlJyk7XG5cbi8qKlxuICogQ2xvbmVzIHZhbHVlc1xuICpcbiAqIEBwYXJhbSB7TWl4ZWR9IGFueSBvYmplY3RcbiAqIEBhcGkgcHVibGljXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihvYmope1xuICByZXR1cm4gY2xvbmUob2JqLCBbXSwgW10pO1xufVxuXG4vKipcbiAqIGludGVybmFsIGRpc3BhdGNoZXIuIGlmIG5vIHNwZWNpZmljIGhhbmRsZXJzIGFyZVxuICogYXZhaWxhYmxlIGBvYmpgIGl0c2VsZiB3aWxsIGJlIHJldHVybmVkXG4gKiBcbiAqIEBwYXJhbSB7WH0gb2JqXG4gKiBAcGFyYW0ge0FycmF5fSBzZWVuXG4gKiBAcGFyYW0ge0FycmF5fSBjb3BpZXNcbiAqIEByZXR1cm4ge1h9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBjbG9uZShvYmosIHNlZW4sIGNvcGllcyl7XG4gIHZhciBmbiA9IGhhbmRsZVt0eXBlKG9iaildO1xuICByZXR1cm4gZm4gPyBmbihvYmosIHNlZW4sIGNvcGllcykgOiBvYmo7XG59XG5cbi8qKlxuICogdHlwZSBzcGVjaWZpYyBoYW5kbGVyc1xuICogXG4gKiBAcGFyYW0ge1h9IGFcbiAqIEBwYXJhbSB7QXJyYXl9IHNlZW5cbiAqIEBwYXJhbSB7QXJyYXl9IGNvcGllc1xuICogQHJldHVybiB7WH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbnZhciBoYW5kbGUgPSB7XG4gIG9iamVjdDogZnVuY3Rpb24oYSwgc2VlbiwgY29waWVzKXtcbiAgICB2YXIgayA9IHNlZW4uaW5kZXhPZihhKTtcbiAgICBpZiAoayA+PSAwKSByZXR1cm4gY29waWVzW2tdO1xuICAgIHZhciBjb3B5ID0gT2JqZWN0LmNyZWF0ZShhKTtcbiAgICBjb3BpZXMucHVzaChjb3B5KTtcbiAgICBzZWVuLnB1c2goYSk7XG4gICAgZm9yICh2YXIgayBpbiBhKSB7XG4gICAgICBjb3B5W2tdID0gY2xvbmUoYVtrXSwgc2VlbiwgY29waWVzKTtcbiAgICB9XG4gICAgcmV0dXJuIGNvcHk7XG4gIH0sXG4gIGFycmF5OiBjb3B5QXJyYXksXG4gIGFyZ3VtZW50czogY29weUFycmF5LFxuICByZWdleHA6IGZ1bmN0aW9uKGEpe1xuICAgIHZhciBmbGFncyA9ICcnXG4gICAgICArIChhLm11bHRpbGluZSA/ICdtJyA6ICcnKVxuICAgICAgKyAoYS5nbG9iYWwgPyAnZycgOiAnJylcbiAgICAgICsgKGEuaWdub3JlQ2FzZSA/ICdpJyA6ICcnKVxuICAgIHJldHVybiBuZXcgUmVnRXhwKGEuc291cmNlLCBmbGFncyk7XG4gIH0sXG4gIGRhdGU6IGZ1bmN0aW9uKGEpe1xuICAgIHJldHVybiBuZXcgRGF0ZShhLmdldFRpbWUoKSk7XG4gIH0sXG4gIHN0cmluZzogdW5ib3gsXG4gIG51bWJlcjogdW5ib3gsXG4gIGJvb2xlYW46IHVuYm94LFxuICBlbGVtZW50OiBmdW5jdGlvbihhLCBzZWVuLCBjb3BpZXMpe1xuICAgIHZhciBrID0gc2Vlbi5pbmRleE9mKGEpO1xuICAgIGlmIChrID49IDApIHJldHVybiBjb3BpZXNba107XG4gICAgdmFyIGNvcHkgPSBhLmNsb25lTm9kZSh0cnVlKTtcbiAgICBjb3BpZXMucHVzaChjb3B5KTtcbiAgICBzZWVuLnB1c2goYSk7XG4gICAgcmV0dXJuIGNvcHk7XG4gIH1cbn1cblxuZnVuY3Rpb24gdW5ib3goYSl7IHJldHVybiBhLnZhbHVlT2YoKSB9XG5cbmZ1bmN0aW9uIGNvcHlBcnJheShhLCBzZWVuLCBjb3BpZXMpe1xuICB2YXIgaSA9IHNlZW4uaW5kZXhPZihhKTtcbiAgaWYgKGkgPj0gMCkgcmV0dXJuIGNvcGllc1tpXTtcbiAgdmFyIGNvcHkgPSBuZXcgQXJyYXkoaSA9IGEubGVuZ3RoKTtcbiAgc2Vlbi5wdXNoKGEpO1xuICBjb3BpZXMucHVzaChjb3B5KTtcbiAgd2hpbGUgKGktLSkge1xuICAgIGNvcHlbaV0gPSBjbG9uZShhW2ldLCBzZWVuLCBjb3BpZXMpO1xuICB9XG4gIHJldHVybiBjb3B5O1xufVxuIiwiXG52YXIgc3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJykuc3R5bGVcbnZhciBwcmVmaXhlcyA9ICdPIG1zIE1veiB3ZWJraXQnLnNwbGl0KCcgJylcbnZhciB1cHBlciA9IC8oW0EtWl0pL2dcblxudmFyIG1lbW8gPSB7fVxuXG4vKipcbiAqIG1lbW9pemVkIGBwcmVmaXhgXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBmdW5jdGlvbihrZXkpe1xuICByZXR1cm4ga2V5IGluIG1lbW9cbiAgICA/IG1lbW9ba2V5XVxuICAgIDogbWVtb1trZXldID0gcHJlZml4KGtleSlcbn1cblxuZXhwb3J0cy5wcmVmaXggPSBwcmVmaXhcbmV4cG9ydHMuZGFzaCA9IGRhc2hlZFByZWZpeFxuXG4vKipcbiAqIHByZWZpeCBga2V5YFxuICpcbiAqICAgcHJlZml4KCd0cmFuc2Zvcm0nKSAvLyA9PiB3ZWJraXRUcmFuc2Zvcm1cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIHByZWZpeChrZXkpe1xuICAvLyBjYW1lbCBjYXNlXG4gIGtleSA9IGtleS5yZXBsYWNlKC8tKFthLXpdKS9nLCBmdW5jdGlvbihfLCBjaGFyKXtcbiAgICByZXR1cm4gY2hhci50b1VwcGVyQ2FzZSgpXG4gIH0pXG5cbiAgLy8gd2l0aG91dCBwcmVmaXhcbiAgaWYgKHN0eWxlW2tleV0gIT09IHVuZGVmaW5lZCkgcmV0dXJuIGtleVxuXG4gIC8vIHdpdGggcHJlZml4XG4gIHZhciBLZXkgPSBjYXBpdGFsaXplKGtleSlcbiAgdmFyIGkgPSBwcmVmaXhlcy5sZW5ndGhcbiAgd2hpbGUgKGktLSkge1xuICAgIHZhciBuYW1lID0gcHJlZml4ZXNbaV0gKyBLZXlcbiAgICBpZiAoc3R5bGVbbmFtZV0gIT09IHVuZGVmaW5lZCkgcmV0dXJuIG5hbWVcbiAgfVxuXG4gIHRocm93IG5ldyBFcnJvcigndW5hYmxlIHRvIHByZWZpeCAnICsga2V5KVxufVxuXG5mdW5jdGlvbiBjYXBpdGFsaXplKHN0cil7XG4gIHJldHVybiBzdHIuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzdHIuc2xpY2UoMSlcbn1cblxuLyoqXG4gKiBjcmVhdGUgYSBkYXNoZXJpemVkIHByZWZpeFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gZGFzaGVkUHJlZml4KGtleSl7XG4gIGtleSA9IHByZWZpeChrZXkpXG4gIGlmICh1cHBlci50ZXN0KGtleSkpIGtleSA9ICctJyArIGtleS5yZXBsYWNlKHVwcGVyLCAnLSQxJylcbiAgcmV0dXJuIGtleS50b0xvd2VyQ2FzZSgpXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCIuL2xhenlQcm9wZXJ0eS5qc1wiKSIsIlxuLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICovXG5cbnZhciB0eXBlT2YgPSByZXF1aXJlKCd0eXBlJyk7XG5cbi8qKlxuICogU2V0IG9yIGdldCBgZWxgJ3MnIHZhbHVlLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7TWl4ZWR9IHZhbFxuICogQHJldHVybiB7TWl4ZWR9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZWwsIHZhbCl7XG4gIGlmICgyID09IGFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBzZXQoZWwsIHZhbCk7XG4gIHJldHVybiBnZXQoZWwpO1xufTtcblxuLyoqXG4gKiBHZXQgYGVsYCdzIHZhbHVlLlxuICovXG5cbmZ1bmN0aW9uIGdldChlbCkge1xuICBzd2l0Y2ggKHR5cGUoZWwpKSB7XG4gICAgY2FzZSAnY2hlY2tib3gnOlxuICAgIGNhc2UgJ3JhZGlvJzpcbiAgICAgIGlmIChlbC5jaGVja2VkKSB7XG4gICAgICAgIHZhciBhdHRyID0gZWwuZ2V0QXR0cmlidXRlKCd2YWx1ZScpO1xuICAgICAgICByZXR1cm4gbnVsbCA9PSBhdHRyID8gdHJ1ZSA6IGF0dHI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgY2FzZSAncmFkaW9ncm91cCc6XG4gICAgICBmb3IgKHZhciBpID0gMCwgcmFkaW87IHJhZGlvID0gZWxbaV07IGkrKykge1xuICAgICAgICBpZiAocmFkaW8uY2hlY2tlZCkgcmV0dXJuIHJhZGlvLnZhbHVlO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnc2VsZWN0JzpcbiAgICAgIGZvciAodmFyIGkgPSAwLCBvcHRpb247IG9wdGlvbiA9IGVsLm9wdGlvbnNbaV07IGkrKykge1xuICAgICAgICBpZiAob3B0aW9uLnNlbGVjdGVkKSByZXR1cm4gb3B0aW9uLnZhbHVlO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBlbC52YWx1ZTtcbiAgfVxufVxuXG4vKipcbiAqIFNldCBgZWxgJ3MgdmFsdWUuXG4gKi9cblxuZnVuY3Rpb24gc2V0KGVsLCB2YWwpIHtcbiAgc3dpdGNoICh0eXBlKGVsKSkge1xuICAgIGNhc2UgJ2NoZWNrYm94JzpcbiAgICBjYXNlICdyYWRpbyc6XG4gICAgICBpZiAodmFsKSB7XG4gICAgICAgIGVsLmNoZWNrZWQgPSB0cnVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZWwuY2hlY2tlZCA9IGZhbHNlO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAncmFkaW9ncm91cCc6XG4gICAgICBmb3IgKHZhciBpID0gMCwgcmFkaW87IHJhZGlvID0gZWxbaV07IGkrKykge1xuICAgICAgICByYWRpby5jaGVja2VkID0gcmFkaW8udmFsdWUgPT09IHZhbDtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3NlbGVjdCc6XG4gICAgICBmb3IgKHZhciBpID0gMCwgb3B0aW9uOyBvcHRpb24gPSBlbC5vcHRpb25zW2ldOyBpKyspIHtcbiAgICAgICAgb3B0aW9uLnNlbGVjdGVkID0gb3B0aW9uLnZhbHVlID09PSB2YWw7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgZWwudmFsdWUgPSB2YWw7XG4gIH1cbn1cblxuLyoqXG4gKiBFbGVtZW50IHR5cGUuXG4gKi9cblxuZnVuY3Rpb24gdHlwZShlbCkge1xuICB2YXIgZ3JvdXAgPSAnYXJyYXknID09IHR5cGVPZihlbCkgfHwgJ29iamVjdCcgPT0gdHlwZU9mKGVsKTtcbiAgaWYgKGdyb3VwKSBlbCA9IGVsWzBdO1xuICB2YXIgbmFtZSA9IGVsLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCk7XG4gIHZhciB0eXBlID0gZWwuZ2V0QXR0cmlidXRlKCd0eXBlJyk7XG5cbiAgaWYgKGdyb3VwICYmIHR5cGUgJiYgJ3JhZGlvJyA9PSB0eXBlLnRvTG93ZXJDYXNlKCkpIHJldHVybiAncmFkaW9ncm91cCc7XG4gIGlmICgnaW5wdXQnID09IG5hbWUgJiYgdHlwZSAmJiAnY2hlY2tib3gnID09IHR5cGUudG9Mb3dlckNhc2UoKSkgcmV0dXJuICdjaGVja2JveCc7XG4gIGlmICgnaW5wdXQnID09IG5hbWUgJiYgdHlwZSAmJiAncmFkaW8nID09IHR5cGUudG9Mb3dlckNhc2UoKSkgcmV0dXJuICdyYWRpbyc7XG4gIGlmICgnc2VsZWN0JyA9PSBuYW1lKSByZXR1cm4gJ3NlbGVjdCc7XG4gIHJldHVybiBuYW1lO1xufVxuIiwiXG4vKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxudmFyIGluZGV4ID0gcmVxdWlyZSgnaW5kZXhvZicpO1xuXG4vKipcbiAqIFdoaXRlc3BhY2UgcmVnZXhwLlxuICovXG5cbnZhciByZSA9IC9cXHMrLztcblxuLyoqXG4gKiB0b1N0cmluZyByZWZlcmVuY2UuXG4gKi9cblxudmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuLyoqXG4gKiBXcmFwIGBlbGAgaW4gYSBgQ2xhc3NMaXN0YC5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gKiBAcmV0dXJuIHtDbGFzc0xpc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZWwpe1xuICByZXR1cm4gbmV3IENsYXNzTGlzdChlbCk7XG59O1xuXG4vKipcbiAqIEluaXRpYWxpemUgYSBuZXcgQ2xhc3NMaXN0IGZvciBgZWxgLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIENsYXNzTGlzdChlbCkge1xuICB0aGlzLmVsID0gZWw7XG4gIHRoaXMubGlzdCA9IGVsLmNsYXNzTGlzdDtcbn1cblxuLyoqXG4gKiBBZGQgY2xhc3MgYG5hbWVgIGlmIG5vdCBhbHJlYWR5IHByZXNlbnQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAqIEByZXR1cm4ge0NsYXNzTGlzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuQ2xhc3NMaXN0LnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbihuYW1lKXtcbiAgLy8gY2xhc3NMaXN0XG4gIGlmICh0aGlzLmxpc3QpIHtcbiAgICB0aGlzLmxpc3QuYWRkKG5hbWUpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gZmFsbGJhY2tcbiAgdmFyIGFyciA9IHRoaXMuYXJyYXkoKTtcbiAgdmFyIGkgPSBpbmRleChhcnIsIG5hbWUpO1xuICBpZiAoIX5pKSBhcnIucHVzaChuYW1lKTtcbiAgdGhpcy5lbC5jbGFzc05hbWUgPSBhcnIuam9pbignICcpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmVtb3ZlIGNsYXNzIGBuYW1lYCB3aGVuIHByZXNlbnQsIG9yXG4gKiBwYXNzIGEgcmVndWxhciBleHByZXNzaW9uIHRvIHJlbW92ZVxuICogYW55IHdoaWNoIG1hdGNoLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfFJlZ0V4cH0gbmFtZVxuICogQHJldHVybiB7Q2xhc3NMaXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5DbGFzc0xpc3QucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uKG5hbWUpe1xuICBpZiAoJ1tvYmplY3QgUmVnRXhwXScgPT0gdG9TdHJpbmcuY2FsbChuYW1lKSkge1xuICAgIHJldHVybiB0aGlzLnJlbW92ZU1hdGNoaW5nKG5hbWUpO1xuICB9XG5cbiAgLy8gY2xhc3NMaXN0XG4gIGlmICh0aGlzLmxpc3QpIHtcbiAgICB0aGlzLmxpc3QucmVtb3ZlKG5hbWUpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gZmFsbGJhY2tcbiAgdmFyIGFyciA9IHRoaXMuYXJyYXkoKTtcbiAgdmFyIGkgPSBpbmRleChhcnIsIG5hbWUpO1xuICBpZiAofmkpIGFyci5zcGxpY2UoaSwgMSk7XG4gIHRoaXMuZWwuY2xhc3NOYW1lID0gYXJyLmpvaW4oJyAnKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBhbGwgY2xhc3NlcyBtYXRjaGluZyBgcmVgLlxuICpcbiAqIEBwYXJhbSB7UmVnRXhwfSByZVxuICogQHJldHVybiB7Q2xhc3NMaXN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuQ2xhc3NMaXN0LnByb3RvdHlwZS5yZW1vdmVNYXRjaGluZyA9IGZ1bmN0aW9uKHJlKXtcbiAgdmFyIGFyciA9IHRoaXMuYXJyYXkoKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAocmUudGVzdChhcnJbaV0pKSB7XG4gICAgICB0aGlzLnJlbW92ZShhcnJbaV0pO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogVG9nZ2xlIGNsYXNzIGBuYW1lYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICogQHJldHVybiB7Q2xhc3NMaXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5DbGFzc0xpc3QucHJvdG90eXBlLnRvZ2dsZSA9IGZ1bmN0aW9uKG5hbWUpe1xuICAvLyBjbGFzc0xpc3RcbiAgaWYgKHRoaXMubGlzdCkge1xuICAgIHRoaXMubGlzdC50b2dnbGUobmFtZSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyBmYWxsYmFja1xuICBpZiAodGhpcy5oYXMobmFtZSkpIHtcbiAgICB0aGlzLnJlbW92ZShuYW1lKTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLmFkZChuYW1lKTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmV0dXJuIGFuIGFycmF5IG9mIGNsYXNzZXMuXG4gKlxuICogQHJldHVybiB7QXJyYXl9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkNsYXNzTGlzdC5wcm90b3R5cGUuYXJyYXkgPSBmdW5jdGlvbigpe1xuICB2YXIgc3RyID0gdGhpcy5lbC5jbGFzc05hbWUucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpO1xuICB2YXIgYXJyID0gc3RyLnNwbGl0KHJlKTtcbiAgaWYgKCcnID09PSBhcnJbMF0pIGFyci5zaGlmdCgpO1xuICByZXR1cm4gYXJyO1xufTtcblxuLyoqXG4gKiBDaGVjayBpZiBjbGFzcyBgbmFtZWAgaXMgcHJlc2VudC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICogQHJldHVybiB7Q2xhc3NMaXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5DbGFzc0xpc3QucHJvdG90eXBlLmhhcyA9XG5DbGFzc0xpc3QucHJvdG90eXBlLmNvbnRhaW5zID0gZnVuY3Rpb24obmFtZSl7XG4gIHJldHVybiB0aGlzLmxpc3RcbiAgICA/IHRoaXMubGlzdC5jb250YWlucyhuYW1lKVxuICAgIDogISEgfmluZGV4KHRoaXMuYXJyYXkoKSwgbmFtZSk7XG59O1xuIiwiXG4vKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxudmFyIG1hdGNoZXMgPSByZXF1aXJlKCdtYXRjaGVzLXNlbGVjdG9yJylcbiAgLCBldmVudCA9IHJlcXVpcmUoJ2V2ZW50Jyk7XG5cbi8qKlxuICogRGVsZWdhdGUgZXZlbnQgYHR5cGVgIHRvIGBzZWxlY3RvcmBcbiAqIGFuZCBpbnZva2UgYGZuKGUpYC4gQSBjYWxsYmFjayBmdW5jdGlvblxuICogaXMgcmV0dXJuZWQgd2hpY2ggbWF5IGJlIHBhc3NlZCB0byBgLnVuYmluZCgpYC5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gKiBAcGFyYW0ge1N0cmluZ30gc2VsZWN0b3JcbiAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHBhcmFtIHtCb29sZWFufSBjYXB0dXJlXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy5iaW5kID0gZnVuY3Rpb24oZWwsIHNlbGVjdG9yLCB0eXBlLCBmbiwgY2FwdHVyZSl7XG4gIHJldHVybiBldmVudC5iaW5kKGVsLCB0eXBlLCBmdW5jdGlvbihlKXtcbiAgICBpZiAobWF0Y2hlcyhlLnRhcmdldCwgc2VsZWN0b3IpKSBmbihlKTtcbiAgfSwgY2FwdHVyZSk7XG4gIHJldHVybiBjYWxsYmFjaztcbn07XG5cbi8qKlxuICogVW5iaW5kIGV2ZW50IGB0eXBlYCdzIGNhbGxiYWNrIGBmbmAuXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbFxuICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGNhcHR1cmVcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy51bmJpbmQgPSBmdW5jdGlvbihlbCwgdHlwZSwgZm4sIGNhcHR1cmUpe1xuICBldmVudC51bmJpbmQoZWwsIHR5cGUsIGZuLCBjYXB0dXJlKTtcbn07XG4iLCIvKipcbiAqIE1vZHVsZSBEZXBlbmRlbmNpZXNcbiAqL1xuXG52YXIgZGVidWcgPSByZXF1aXJlKCdkZWJ1ZycpKCdjc3MnKTtcbnZhciBzZXQgPSByZXF1aXJlKCcuL2xpYi9zdHlsZScpO1xudmFyIGdldCA9IHJlcXVpcmUoJy4vbGliL2NzcycpO1xuXG4vKipcbiAqIEV4cG9zZSBgY3NzYFxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gY3NzO1xuXG4vKipcbiAqIEdldCBhbmQgc2V0IGNzcyB2YWx1ZXNcbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gKiBAcGFyYW0ge1N0cmluZ3xPYmplY3R9IHByb3BcbiAqIEBwYXJhbSB7TWl4ZWR9IHZhbFxuICogQHJldHVybiB7RWxlbWVudH0gZWxcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gY3NzKGVsLCBwcm9wLCB2YWwpIHtcbiAgaWYgKCFlbCkgcmV0dXJuO1xuXG4gIGlmICh1bmRlZmluZWQgIT09IHZhbCkge1xuICAgIHZhciBvYmogPSB7fTtcbiAgICBvYmpbcHJvcF0gPSB2YWw7XG4gICAgZGVidWcoJ3NldHRpbmcgc3R5bGVzICVqJywgb2JqKTtcbiAgICByZXR1cm4gc2V0U3R5bGVzKGVsLCBvYmopO1xuICB9XG5cbiAgaWYgKCdvYmplY3QnID09IHR5cGVvZiBwcm9wKSB7XG4gICAgZGVidWcoJ3NldHRpbmcgc3R5bGVzICVqJywgcHJvcCk7XG4gICAgcmV0dXJuIHNldFN0eWxlcyhlbCwgcHJvcCk7XG4gIH1cblxuICBkZWJ1ZygnZ2V0dGluZyAlcycsIHByb3ApO1xuICByZXR1cm4gZ2V0KGVsLCBwcm9wKTtcbn1cblxuLyoqXG4gKiBTZXQgdGhlIHN0eWxlcyBvbiBhbiBlbGVtZW50XG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbFxuICogQHBhcmFtIHtPYmplY3R9IHByb3BzXG4gKiBAcmV0dXJuIHtFbGVtZW50fSBlbFxuICovXG5cbmZ1bmN0aW9uIHNldFN0eWxlcyhlbCwgcHJvcHMpIHtcbiAgZm9yICh2YXIgcHJvcCBpbiBwcm9wcykge1xuICAgIHNldChlbCwgcHJvcCwgcHJvcHNbcHJvcF0pO1xuICB9XG5cbiAgcmV0dXJuIGVsO1xufVxuIiwiLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICovXG5cbnZhciBxdWVyeSA9IHJlcXVpcmUoJ3F1ZXJ5Jyk7XG5cbi8qKlxuICogRWxlbWVudCBwcm90b3R5cGUuXG4gKi9cblxudmFyIHByb3RvID0gRWxlbWVudC5wcm90b3R5cGU7XG5cbi8qKlxuICogVmVuZG9yIGZ1bmN0aW9uLlxuICovXG5cbnZhciB2ZW5kb3IgPSBwcm90by5tYXRjaGVzXG4gIHx8IHByb3RvLndlYmtpdE1hdGNoZXNTZWxlY3RvclxuICB8fCBwcm90by5tb3pNYXRjaGVzU2VsZWN0b3JcbiAgfHwgcHJvdG8ubXNNYXRjaGVzU2VsZWN0b3JcbiAgfHwgcHJvdG8ub01hdGNoZXNTZWxlY3RvcjtcblxuLyoqXG4gKiBFeHBvc2UgYG1hdGNoKClgLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gbWF0Y2g7XG5cbi8qKlxuICogTWF0Y2ggYGVsYCB0byBgc2VsZWN0b3JgLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7U3RyaW5nfSBzZWxlY3RvclxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gbWF0Y2goZWwsIHNlbGVjdG9yKSB7XG4gIGlmICh2ZW5kb3IpIHJldHVybiB2ZW5kb3IuY2FsbChlbCwgc2VsZWN0b3IpO1xuICB2YXIgbm9kZXMgPSBxdWVyeS5hbGwoc2VsZWN0b3IsIGVsLnBhcmVudE5vZGUpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgKytpKSB7XG4gICAgaWYgKG5vZGVzW2ldID09IGVsKSByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG4iLCJcbi8qKlxuICogZGVwZW5kZW5jaWVzXG4gKi9cblxudmFyIG1hdGNoZXMgPSByZXF1aXJlKCdtYXRjaGVzLXNlbGVjdG9yJyk7XG5cbi8qKlxuICogVHJhdmVyc2Ugd2l0aCB0aGUgZ2l2ZW4gYGVsYCwgYHNlbGVjdG9yYCBhbmQgYGxlbmAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7U3RyaW5nfSBzZWxlY3RvclxuICogQHBhcmFtIHtOdW1iZXJ9IGxlblxuICogQHJldHVybiB7QXJyYXl9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24odHlwZSwgZWwsIHNlbGVjdG9yLCBsZW4pe1xuICB2YXIgZWwgPSBlbFt0eXBlXVxuICAgICwgbiA9IGxlbiB8fCAxXG4gICAgLCByZXQgPSBbXTtcblxuICBpZiAoIWVsKSByZXR1cm4gcmV0O1xuXG4gIGRvIHtcbiAgICBpZiAobiA9PSByZXQubGVuZ3RoKSBicmVhaztcbiAgICBpZiAoMSAhPSBlbC5ub2RlVHlwZSkgY29udGludWU7XG4gICAgaWYgKG1hdGNoZXMoZWwsIHNlbGVjdG9yKSkgcmV0LnB1c2goZWwpO1xuICAgIGlmICghc2VsZWN0b3IpIHJldC5wdXNoKGVsKTtcbiAgfSB3aGlsZSAoZWwgPSBlbFt0eXBlXSk7XG5cbiAgcmV0dXJuIHJldDtcbn1cbiIsIi8qKlxuICogTW9kdWxlIERlcGVuZGVuY2llc1xuICovXG5cbnRyeSB7XG4gIHZhciBleHByID0gcmVxdWlyZSgncHJvcHMnKTtcbn0gY2F0Y2goZSkge1xuICB2YXIgZXhwciA9IHJlcXVpcmUoJ3Byb3BzLWNvbXBvbmVudCcpO1xufVxuXG4vKipcbiAqIEV4cG9zZSBgdG9GdW5jdGlvbigpYC5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHRvRnVuY3Rpb247XG5cbi8qKlxuICogQ29udmVydCBgb2JqYCB0byBhIGBGdW5jdGlvbmAuXG4gKlxuICogQHBhcmFtIHtNaXhlZH0gb2JqXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHRvRnVuY3Rpb24ob2JqKSB7XG4gIHN3aXRjaCAoe30udG9TdHJpbmcuY2FsbChvYmopKSB7XG4gICAgY2FzZSAnW29iamVjdCBPYmplY3RdJzpcbiAgICAgIHJldHVybiBvYmplY3RUb0Z1bmN0aW9uKG9iaik7XG4gICAgY2FzZSAnW29iamVjdCBGdW5jdGlvbl0nOlxuICAgICAgcmV0dXJuIG9iajtcbiAgICBjYXNlICdbb2JqZWN0IFN0cmluZ10nOlxuICAgICAgcmV0dXJuIHN0cmluZ1RvRnVuY3Rpb24ob2JqKTtcbiAgICBjYXNlICdbb2JqZWN0IFJlZ0V4cF0nOlxuICAgICAgcmV0dXJuIHJlZ2V4cFRvRnVuY3Rpb24ob2JqKTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGRlZmF1bHRUb0Z1bmN0aW9uKG9iaik7XG4gIH1cbn1cblxuLyoqXG4gKiBEZWZhdWx0IHRvIHN0cmljdCBlcXVhbGl0eS5cbiAqXG4gKiBAcGFyYW0ge01peGVkfSB2YWxcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gZGVmYXVsdFRvRnVuY3Rpb24odmFsKSB7XG4gIHJldHVybiBmdW5jdGlvbihvYmope1xuICAgIHJldHVybiB2YWwgPT09IG9iajtcbiAgfVxufVxuXG4vKipcbiAqIENvbnZlcnQgYHJlYCB0byBhIGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSB7UmVnRXhwfSByZVxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiByZWdleHBUb0Z1bmN0aW9uKHJlKSB7XG4gIHJldHVybiBmdW5jdGlvbihvYmope1xuICAgIHJldHVybiByZS50ZXN0KG9iaik7XG4gIH1cbn1cblxuLyoqXG4gKiBDb252ZXJ0IHByb3BlcnR5IGBzdHJgIHRvIGEgZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBzdHJpbmdUb0Z1bmN0aW9uKHN0cikge1xuICAvLyBpbW1lZGlhdGUgc3VjaCBhcyBcIj4gMjBcIlxuICBpZiAoL14gKlxcVysvLnRlc3Qoc3RyKSkgcmV0dXJuIG5ldyBGdW5jdGlvbignXycsICdyZXR1cm4gXyAnICsgc3RyKTtcblxuICAvLyBwcm9wZXJ0aWVzIHN1Y2ggYXMgXCJuYW1lLmZpcnN0XCIgb3IgXCJhZ2UgPiAxOFwiIG9yIFwiYWdlID4gMTggJiYgYWdlIDwgMzZcIlxuICByZXR1cm4gbmV3IEZ1bmN0aW9uKCdfJywgJ3JldHVybiAnICsgZ2V0KHN0cikpO1xufVxuXG4vKipcbiAqIENvbnZlcnQgYG9iamVjdGAgdG8gYSBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0XG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIG9iamVjdFRvRnVuY3Rpb24ob2JqKSB7XG4gIHZhciBtYXRjaCA9IHt9XG4gIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICBtYXRjaFtrZXldID0gdHlwZW9mIG9ialtrZXldID09PSAnc3RyaW5nJ1xuICAgICAgPyBkZWZhdWx0VG9GdW5jdGlvbihvYmpba2V5XSlcbiAgICAgIDogdG9GdW5jdGlvbihvYmpba2V5XSlcbiAgfVxuICByZXR1cm4gZnVuY3Rpb24odmFsKXtcbiAgICBpZiAodHlwZW9mIHZhbCAhPT0gJ29iamVjdCcpIHJldHVybiBmYWxzZTtcbiAgICBmb3IgKHZhciBrZXkgaW4gbWF0Y2gpIHtcbiAgICAgIGlmICghKGtleSBpbiB2YWwpKSByZXR1cm4gZmFsc2U7XG4gICAgICBpZiAoIW1hdGNoW2tleV0odmFsW2tleV0pKSByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG59XG5cbi8qKlxuICogQnVpbHQgdGhlIGdldHRlciBmdW5jdGlvbi4gU3VwcG9ydHMgZ2V0dGVyIHN0eWxlIGZ1bmN0aW9uc1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGdldChzdHIpIHtcbiAgdmFyIHByb3BzID0gZXhwcihzdHIpO1xuICBpZiAoIXByb3BzLmxlbmd0aCkgcmV0dXJuICdfLicgKyBzdHI7XG5cbiAgdmFyIHZhbDtcbiAgZm9yKHZhciBpID0gMCwgcHJvcDsgcHJvcCA9IHByb3BzW2ldOyBpKyspIHtcbiAgICB2YWwgPSAnXy4nICsgcHJvcDtcbiAgICB2YWwgPSBcIignZnVuY3Rpb24nID09IHR5cGVvZiBcIiArIHZhbCArIFwiID8gXCIgKyB2YWwgKyBcIigpIDogXCIgKyB2YWwgKyBcIilcIjtcbiAgICBzdHIgPSBzdHIucmVwbGFjZShuZXcgUmVnRXhwKHByb3AsICdnJyksIHZhbCk7XG4gIH1cblxuICByZXR1cm4gc3RyO1xufVxuIiwiXG52YXIgcGFyc2VDb2xvciA9IHJlcXVpcmUoJ2NvbG9yLXBhcnNlcicpXG52YXIgcHJlZml4ID0gcmVxdWlyZSgncHJlZml4JylcblxubW9kdWxlLmV4cG9ydHMgPSB0d2VlblxuXG52YXIgZGVmYXVsdFR5cGVzID0ge1xuICBmaWxsT3BhY2l0eTogJ251bWJlcicsXG4gIGZvbnRXZWlnaHQ6ICdudW1iZXInLFxuICBvcGFjaXR5OiAnbnVtYmVyJyxcbiAgekluZGV4OiAnbnVtYmVyJyxcbiAgem9vbTogJ251bWJlcicsXG4gIHRyYW5zZm9ybTogJ21hdHJpeCcsXG4gIGQ6ICdwYXRoJ1xufVxuXG5kZWZhdWx0VHlwZXNbcHJlZml4KCd0cmFuc2Zvcm0nKV0gPSAnbWF0cml4J1xuXG4vKipcbiAqIGNyZWF0ZSBhIHR3ZWVuIGZ1bmN0aW9uXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHByb3BcbiAqIEBwYXJhbSB7QW55fSBmcm9tXG4gKiBAcGFyYW0ge0FueX0gdG9cbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICovXG5cbmZ1bmN0aW9uIHR3ZWVuKHByb3AsIGZyb20sIHRvKXtcbiAgdmFyIGZuID0gdHlwZW9mIHRvID09ICdzdHJpbmcnICYmIHR3ZWVuW3R5cGUodG8pXVxuICBpZiAoIWZuKSBmbiA9IHR3ZWVuW2RlZmF1bHRUeXBlc1twcm9wXSB8fCAncHgnXVxuICByZXR1cm4gZm4oZnJvbSwgdG8pXG59XG5cbnR3ZWVuLm51bWJlciA9IHJlcXVpcmUoJy4vbnVtYmVyJylcbnR3ZWVuLm1hdHJpeCA9IHJlcXVpcmUoJy4vbWF0cml4JylcbnR3ZWVuLmNvbG9yID0gcmVxdWlyZSgnLi9jb2xvcicpXG50d2Vlbi5wYXRoID0gcmVxdWlyZSgnLi9wYXRoJylcbnR3ZWVuLnB4ID0gcmVxdWlyZSgnLi9weCcpXG5cbi8qKlxuICogZGV0ZXJtaW5lIHR5cGUgb2YgYGNzc2AgdmFsdWVcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gY3NzXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiB0eXBlKGNzcyl7XG4gIGlmICgvXm1hdHJpeCgzZCk/XFwoW14pXSpcXCkkLy50ZXN0KGNzcykpIHJldHVybiAnbWF0cml4J1xuICBpZiAoL15bLS5cXGRdK3B4Ly50ZXN0KGNzcykpIHJldHVybiAncHgnXG4gIGlmIChwYXJzZUNvbG9yKGNzcykpIHJldHVybiAnY29sb3InXG59XG4iLCJcInVzZSBzdHJpY3RcIlxuXG5mdW5jdGlvbiBhZGRMYXp5UHJvcGVydHkob2JqZWN0LCBuYW1lLCBpbml0aWFsaXplciwgZW51bWVyYWJsZSkge1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqZWN0LCBuYW1lLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciB2ID0gaW5pdGlhbGl6ZXIuY2FsbCh0aGlzKVxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIG5hbWUsIHsgdmFsdWU6IHYsIGVudW1lcmFibGU6ICEhZW51bWVyYWJsZSwgd3JpdGFibGU6IHRydWUgfSlcbiAgICAgIHJldHVybiB2XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uKHYpIHtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBuYW1lLCB7IHZhbHVlOiB2LCBlbnVtZXJhYmxlOiAhIWVudW1lcmFibGUsIHdyaXRhYmxlOiB0cnVlIH0pXG4gICAgICByZXR1cm4gdlxuICAgIH0sXG4gICAgZW51bWVyYWJsZTogISFlbnVtZXJhYmxlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICB9KVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGFkZExhenlQcm9wZXJ0eVxuIiwiXG4vKipcbiAqIGRlcGVuZGVuY2llc1xuICovXG5cbnZhciBpbmhlcml0ID0gcmVxdWlyZSgnaW5oZXJpdCcpO1xudmFyIG1lcmdlID0gcmVxdWlyZSgnbWVyZ2UnKTtcblxuLyoqXG4gKiBFeHBvcnQgYGV4dGVuc2libGVgXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBleHRlbnNpYmxlO1xuXG4vKipcbiAqIE1ha2UgdGhlIGdpdmVuIGBBYCBleHRlbnNpYmxlLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IEFcbiAqIEByZXR1cm4ge0F9XG4gKi9cblxuZnVuY3Rpb24gZXh0ZW5zaWJsZShBKXtcbiAgQS5leHRlbmQgPSBleHRlbmQ7XG4gIHJldHVybiBBO1xufTtcblxuLyoqXG4gKiBtYWtlIGBjaGlsZGAgaW5oZXJpdCBmcm9tIGB0aGlzYC4gVW5sZXNzIGBmaW5hbGAsXG4gKiBgY2hpbGRgIHdpbGwgYWxzbyBiZSBtYWRlIGV4dGVuc2libGUuIElmIHlvdSBkb24ndCBcbiAqIHBhc3MgYSBgY2hpbGRgIGEgbmV3IG9uZSB3aWxsIGJlIGNyZWF0ZWQuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2NoaWxkXVxuICogQHBhcmFtIHtCb29sZWFufSBbZmluYWxdXG4gKiBAcmV0dXJuIHtjaGlsZH1cbiAqL1xuXG5mdW5jdGlvbiBleHRlbmQoY2hpbGQsIGZpbmFsKXtcbiAgdmFyIEEgPSB0aGlzO1xuICB2YXIgQiA9ICdmdW5jdGlvbicgIT0gdHlwZW9mIGNoaWxkXG4gICAgPyBmdW5jdGlvbigpeyBBLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7IH1cbiAgICA6IGNoaWxkO1xuICAhZmluYWwgJiYgZXh0ZW5zaWJsZShCKTtcbiAgaW5oZXJpdChCLCBBKTtcbiAgaWYgKCdvYmplY3QnID09IHR5cGVvZiBjaGlsZCkgbWVyZ2UoQi5wcm90b3R5cGUsIGNoaWxkKTtcbiAgcmV0dXJuIEI7XG59O1xuIiwiXG52YXIgbWVyZ2UgPSByZXF1aXJlKCdtZXJnZScpXG52YXIgb3duID0gT2JqZWN0Lmhhc093blByb3BlcnR5XG52YXIgY2FsbCA9IEZ1bmN0aW9uLmNhbGxcblxubW9kdWxlLmV4cG9ydHMgPSBFbWl0dGVyXG5cbi8qKlxuICogRW1pdHRlciBjb25zdHJ1Y3Rvci4gQ2FuIG9wdGlvbmFsbHkgYWxzbyBhY3QgYXMgYSBtaXhpblxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBbb2JqXVxuICogQHJldHVybiB7T2JqZWN0fVxuICovXG5cbmZ1bmN0aW9uIEVtaXR0ZXIob2JqKXtcblx0aWYgKG9iaikgcmV0dXJuIG1lcmdlKG9iaiwgRW1pdHRlci5wcm90b3R5cGUpXG59XG5cbi8qKlxuICogUHJvY2VzcyBgZXZlbnRgLiBBbGwgYXJndW1lbnRzIGFmdGVyIGB0b3BpY2Agd2lsbFxuICogYmUgcGFzc2VkIHRvIGFsbCBsaXN0ZW5lcnNcbiAqXG4gKiAgIGVtaXR0ZXIuZW1pdCgnZXZlbnQnLCBuZXcgRGF0ZSlcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdG9waWNcbiAqIEBwYXJhbSB7QW55fSBbLi4uYXJnc11cbiAqIEByZXR1cm4ge3RoaXN9XG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKHRvcGljKXtcblx0dmFyIHN1YiA9IHRoaXMuX2V2ZW50c1xuXHRpZiAoIShzdWIgJiYgKHN1YiA9IHN1Ylt0b3BpY10pKSkgcmV0dXJuIHRoaXNcblx0Ly8gc2luZ2xlIHN1YnNyaXB0aW9uIGNhc2Vcblx0aWYgKHR5cGVvZiBzdWIgPT0gJ2Z1bmN0aW9uJykge1xuXHRcdC8vIGF2b2lkIHVzaW5nIC5hcHBseSgpIGZvciBzcGVlZFxuXHRcdHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuXHRcdFx0Y2FzZSAxOiBzdWIuY2FsbCh0aGlzKTticmVha1xuXHRcdFx0Y2FzZSAyOiBzdWIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0pO2JyZWFrXG5cdFx0XHRjYXNlIDM6IHN1Yi5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdKTticmVha1xuXHRcdFx0Y2FzZSA0OiBzdWIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSwgYXJndW1lbnRzWzNdKTticmVha1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0Ly8gYGFyZ3VtZW50c2AgaXMgbWFnaWMgOilcblx0XHRcdFx0dG9waWMgPSB0aGlzXG5cdFx0XHRcdGNhbGwuYXBwbHkoc3ViLCBhcmd1bWVudHMpXG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdHZhciBmblxuXHRcdHZhciBpID0gMFxuXHRcdHZhciBsID0gc3ViLmxlbmd0aFxuXHRcdHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuXHRcdFx0Y2FzZSAxOiB3aGlsZSAoaSA8IGwpIHN1YltpKytdLmNhbGwodGhpcyk7YnJlYWtcblx0XHRcdGNhc2UgMjogd2hpbGUgKGkgPCBsKSBzdWJbaSsrXS5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSk7YnJlYWtcblx0XHRcdGNhc2UgMzogd2hpbGUgKGkgPCBsKSBzdWJbaSsrXS5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdKTticmVha1xuXHRcdFx0Y2FzZSA0OiB3aGlsZSAoaSA8IGwpIHN1YltpKytdLmNhbGwodGhpcywgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0sIGFyZ3VtZW50c1szXSk7YnJlYWtcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHRvcGljID0gdGhpc1xuXHRcdFx0XHR3aGlsZSAoaSA8IGwpIGNhbGwuYXBwbHkoc3ViW2krK10sIGFyZ3VtZW50cylcblx0XHR9XG5cdH1cblx0cmV0dXJuIHRoaXNcbn1cblxuLyoqXG4gKiBBZGQgYSBzdWJzY3JpcHRpb24gdW5kZXIgYSB0b3BpYyBuYW1lXG4gKlxuICogICBlbWl0dGVyLm9uKCdldmVudCcsIGZ1bmN0aW9uKGRhdGEpe30pXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHRvcGljXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7dGhpc31cbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uKHRvcGljLCBmbil7XG5cdGlmICghb3duLmNhbGwodGhpcywgJ19ldmVudHMnKSkgdGhpcy5fZXZlbnRzID0gY2xvbmUodGhpcy5fZXZlbnRzKVxuXHR2YXIgZXZlbnRzID0gdGhpcy5fZXZlbnRzXG5cdGlmICh0eXBlb2YgZXZlbnRzW3RvcGljXSA9PSAnZnVuY3Rpb24nKSB7XG5cdFx0ZXZlbnRzW3RvcGljXSA9IFtldmVudHNbdG9waWNdLCBmbl1cblx0fSBlbHNlIGlmIChldmVudHNbdG9waWNdKSB7XG5cdFx0ZXZlbnRzW3RvcGljXSA9IGV2ZW50c1t0b3BpY10uY29uY2F0KGZuKVxuXHR9IGVsc2Uge1xuXHRcdGV2ZW50c1t0b3BpY10gPSBmblxuXHR9XG5cdHJldHVybiB0aGlzXG59XG5cbi8qKlxuICogUmVtb3ZlIHN1YnNjcmlwdGlvbnNcbiAqXG4gKiAgIGVtaXR0ZXIub2ZmKCkgICAgICAgICAgICAvLyBjbGVhcnMgYWxsIGxpc3RlbmVyc1xuICogICBlbWl0dGVyLm9mZigndG9waWMnKSAgICAgLy8gY2xlYXJzIGFsbCBgdG9waWNgIGxpc3RlbmVyc1xuICogICBlbWl0dGVyLm9mZigndG9waWMnLCBmbikgLy8gYXMgYWJvdmUgYnV0IG9ubHkgd2hlcmUgYGxpc3RlbmVyID09IGZuYFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBbdG9waWNdXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbZm5dXG4gKiBAcmV0dXJuIHt0aGlzfVxuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLm9mZiA9IGZ1bmN0aW9uKHRvcGljLCBmbil7XG5cdGlmICghdGhpcy5fZXZlbnRzKSByZXR1cm4gdGhpc1xuXHRpZiAoIW93bi5jYWxsKHRoaXMsICdfZXZlbnRzJykpIHRoaXMuX2V2ZW50cyA9IGNsb25lKHRoaXMuX2V2ZW50cylcblx0dmFyIGV2ZW50cyA9IHRoaXMuX2V2ZW50c1xuXG5cdGlmICh0b3BpYyA9PSBudWxsKSB7XG5cdFx0Zm9yICh2YXIgaSBpbiBldmVudHMpIGRlbGV0ZSBldmVudHNbaV1cblx0fSBlbHNlIGlmIChmbiA9PSBudWxsKSB7XG5cdFx0ZGVsZXRlIGV2ZW50c1t0b3BpY11cblx0fSBlbHNlIHtcblx0XHR2YXIgc3VicyA9IGV2ZW50c1t0b3BpY11cblx0XHRpZiAoIXN1YnMpIHJldHVybiB0aGlzXG5cdFx0aWYgKHR5cGVvZiBzdWJzID09ICdmdW5jdGlvbicpIHtcblx0XHRcdGlmIChzdWJzID09PSBmbikgZGVsZXRlIGV2ZW50c1t0b3BpY11cblx0XHR9IGVsc2Uge1xuXHRcdFx0c3VicyA9IGV2ZW50c1t0b3BpY10gPSBzdWJzLmZpbHRlcihmdW5jdGlvbihsaXN0ZW5lcil7XG5cdFx0XHRcdHJldHVybiBsaXN0ZW5lciAhPT0gZm5cblx0XHRcdH0pXG5cdFx0XHQvLyB0aWR5XG5cdFx0XHRpZiAoc3Vicy5sZW5ndGggPT0gMSkgZXZlbnRzW3RvcGljXSA9IHN1YnNbMF1cblx0XHRcdGVsc2UgaWYgKCFzdWJzLmxlbmd0aCkgZGVsZXRlIGV2ZW50c1t0b3BpY11cblx0XHR9XG5cdH1cblx0cmV0dXJuIHRoaXNcbn1cblxuLyoqXG4gKiBzdWJzY3JpYmUgYGZuYCBidXQgcmVtb3ZlIGlmIGFmdGVyIGl0cyBmaXJzdCBpbnZvY2F0aW9uXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHRvcGljXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7dGhpc31cbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24odG9waWMsIGZuKXtcblx0dmFyIHNlbGYgPSB0aGlzXG5cdHJldHVybiB0aGlzLm9uKHRvcGljLCBmdW5jdGlvbiBvbmNlKCl7XG5cdFx0c2VsZi5vZmYodG9waWMsIG9uY2UpXG5cdFx0Zm4uYXBwbHkodGhpcywgYXJndW1lbnRzKVxuXHR9KVxufVxuXG4vKipcbiAqIHNlZSBpZiBgZW1pdHRlcmAgaGFzIGFueSBzdWJzY3JpcHRpb25zIG1hdGNoaW5nXG4gKiBgdG9waWNgIGFuZCBvcHRpb25hbGx5IGFsc28gYGZuYFxuICpcbiAqIEBwYXJhbSB7RW1pdHRlcn0gZW1pdHRlclxuICogQHBhcmFtIHtTdHJpbmd9IHRvcGljXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbZm5dXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5cbkVtaXR0ZXIuaGFzU3Vic2NyaXB0aW9uID0gZnVuY3Rpb24oZW1pdHRlciwgdG9waWMsIGZuKXtcblx0dmFyIGZucyA9IEVtaXR0ZXIuc3Vic2NyaXB0aW9ucyhlbWl0dGVyLCB0b3BpYylcblx0aWYgKGZuID09IG51bGwpIHJldHVybiBCb29sZWFuKGZucy5sZW5ndGgpXG5cdHJldHVybiBmbnMuaW5kZXhPZihmbikgPj0gMFxufVxuXG4vKipcbiAqIGdldCBhbiBBcnJheSBvZiBzdWJzY3JpcHRpb25zIGZvciBgdG9waWNgXG4gKlxuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyXG4gKiBAcGFyYW0ge1N0cmluZ30gdG9waWNcbiAqIEByZXR1cm4ge0FycmF5fVxuICovXG5cbkVtaXR0ZXIuc3Vic2NyaXB0aW9ucyA9IGZ1bmN0aW9uKGVtaXR0ZXIsIHRvcGljKXtcblx0dmFyIGZucyA9IGVtaXR0ZXIuX2V2ZW50c1xuXHRpZiAoIWZucyB8fCAhKGZucyA9IGZuc1t0b3BpY10pKSByZXR1cm4gW11cblx0aWYgKHR5cGVvZiBmbnMgPT0gJ2Z1bmN0aW9uJykgcmV0dXJuIFtmbnNdXG5cdHJldHVybiBmbnMuc2xpY2UoKVxufVxuXG5mdW5jdGlvbiBjbG9uZShvYmope1xuXHRyZXR1cm4gbWVyZ2Uoe30sIG9iailcbn1cbiIsIlxudmFyIGdsb2JhbCA9IGZ1bmN0aW9uKCl7cmV0dXJuIHRoaXN9KClcbnZhciBwZXJmb3JtYW5jZSA9IGdsb2JhbC5wZXJmb3JtYW5jZVxuXG4vKipcbiAqIEdldCBhIHRpbWVzdGFtcFxuICogXG4gKiBAcmV0dXJuIHtOdW1iZXJ9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKXtcbiAgcmV0dXJuIHBlcmZvcm1hbmNlLm5vdygpXG59XG5cbi8vIGZhbGxiYWNrXG5cbmlmICghcGVyZm9ybWFuY2UgfHwgdHlwZW9mIHBlcmZvcm1hbmNlLm5vdyAhPSAnZnVuY3Rpb24nKSB7XG5cdG1vZHVsZS5leHBvcnRzID0gRGF0ZS5ub3cgfHwgZnVuY3Rpb24oKXsgcmV0dXJuICsobmV3IERhdGUpIH1cbn1cbiIsIlxudmFyIHRvU3RyaW5nID0ge30udG9TdHJpbmdcbnZhciBEb21Ob2RlID0gdHlwZW9mIHdpbmRvdyAhPSAndW5kZWZpbmVkJ1xuXHQ/IHdpbmRvdy5Ob2RlXG5cdDogRnVuY3Rpb25cblxuLyoqXG4gKiBSZXR1cm4gdGhlIHR5cGUgb2YgYHZhbGAuXG4gKlxuICogQHBhcmFtIHtNaXhlZH0gdmFsXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IGZ1bmN0aW9uKHgpe1xuXHR2YXIgdHlwZSA9IHR5cGVvZiB4XG5cdGlmICh0eXBlICE9ICdvYmplY3QnKSByZXR1cm4gdHlwZVxuXHR0eXBlID0gdHlwZXNbdG9TdHJpbmcuY2FsbCh4KV1cblx0aWYgKHR5cGUpIHJldHVybiB0eXBlXG5cdGlmICh4IGluc3RhbmNlb2YgRG9tTm9kZSkgc3dpdGNoICh4Lm5vZGVUeXBlKSB7XG5cdFx0Y2FzZSAxOiAgcmV0dXJuICdlbGVtZW50J1xuXHRcdGNhc2UgMzogIHJldHVybiAndGV4dC1ub2RlJ1xuXHRcdGNhc2UgOTogIHJldHVybiAnZG9jdW1lbnQnXG5cdFx0Y2FzZSAxMTogcmV0dXJuICdkb2N1bWVudC1mcmFnbWVudCdcblx0XHRkZWZhdWx0OiByZXR1cm4gJ2RvbS1ub2RlJ1xuXHR9XG59XG5cbnZhciB0eXBlcyA9IGV4cG9ydHMudHlwZXMgPSB7XG5cdCdbb2JqZWN0IEZ1bmN0aW9uXSc6ICdmdW5jdGlvbicsXG5cdCdbb2JqZWN0IERhdGVdJzogJ2RhdGUnLFxuXHQnW29iamVjdCBSZWdFeHBdJzogJ3JlZ2V4cCcsXG5cdCdbb2JqZWN0IEFyZ3VtZW50c10nOiAnYXJndW1lbnRzJyxcblx0J1tvYmplY3QgQXJyYXldJzogJ2FycmF5Jyxcblx0J1tvYmplY3QgU3RyaW5nXSc6ICdzdHJpbmcnLFxuXHQnW29iamVjdCBOdWxsXSc6ICdudWxsJyxcblx0J1tvYmplY3QgVW5kZWZpbmVkXSc6ICd1bmRlZmluZWQnLFxuXHQnW29iamVjdCBOdW1iZXJdJzogJ251bWJlcicsXG5cdCdbb2JqZWN0IEJvb2xlYW5dJzogJ2Jvb2xlYW4nLFxuXHQnW29iamVjdCBPYmplY3RdJzogJ29iamVjdCcsXG5cdCdbb2JqZWN0IFRleHRdJzogJ3RleHQtbm9kZScsXG5cdCdbb2JqZWN0IFVpbnQ4QXJyYXldJzogJzhiaXQtYXJyYXknLFxuXHQnW29iamVjdCBVaW50MTZBcnJheV0nOiAnMTZiaXQtYXJyYXknLFxuXHQnW29iamVjdCBVaW50MzJBcnJheV0nOiAnMzJiaXQtYXJyYXknLFxuXHQnW29iamVjdCBVaW50OENsYW1wZWRBcnJheV0nOiAnOGJpdC1hcnJheScsXG5cdCdbb2JqZWN0IEVycm9yXSc6ICdlcnJvcicsXG5cdCdbb2JqZWN0IEZvcm1EYXRhXSc6ICdmb3JtLWRhdGEnLFxuXHQnW29iamVjdCBGaWxlXSc6ICdmaWxlJyxcblx0J1tvYmplY3QgQmxvYl0nOiAnYmxvYidcbn0iLCJcbnZhciBkdXJhdGlvbiA9IC8oLT9cXGQqXFwuP1xcZCsoPzplWy0rXT9cXGQrKT8pXFxzKihbYS16XSopL2lnXG5cbm1vZHVsZS5leHBvcnRzID0gcGFyc2VcblxuLyoqXG4gKiBjb252ZXJzaW9uIHJhdGlvc1xuICovXG5cbnBhcnNlLm1zID0gMVxucGFyc2Uuc2Vjb25kcyA9XG5wYXJzZS5zZWNvbmQgPVxucGFyc2Uuc2VjID1cbnBhcnNlLnMgPSBwYXJzZS5tcyAqIDEwMDBcbnBhcnNlLm1pbnV0ZXMgPVxucGFyc2UubWludXRlID1cbnBhcnNlLm1pbiA9XG5wYXJzZS5taW5zID1cbnBhcnNlLm0gPSBwYXJzZS5zICogNjBcbnBhcnNlLmhvdXJzID1cbnBhcnNlLmhvdXIgPVxucGFyc2UuaHIgPVxucGFyc2UuaCA9IHBhcnNlLm0gKiA2MFxucGFyc2UuZGF5cyA9XG5wYXJzZS5kYXkgPVxucGFyc2UuZCA9IHBhcnNlLmggKiAyNFxucGFyc2Uud2Vla3MgPVxucGFyc2Uud2VlayA9XG5wYXJzZS53ayA9XG5wYXJzZS53ID0gcGFyc2UuZCAqIDdcbnBhcnNlLnllYXJzID1cbnBhcnNlLnllYXIgPVxucGFyc2UueXIgPVxucGFyc2UueSA9IHBhcnNlLmQgKiAzNjUuMjVcblxuLyoqXG4gKiBjb252ZXJ0IGBzdHJgIHRvIG1zXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7TnVtYmVyfVxuICovXG5cbmZ1bmN0aW9uIHBhcnNlKHN0cil7XG5cdHZhciByZXN1bHQgPSAwXG5cdHN0ci5yZXBsYWNlKGR1cmF0aW9uLCBmdW5jdGlvbihfLCBuLCB1bml0cyl7XG5cdFx0cmVzdWx0ICs9IHBhcnNlRmxvYXQobiwgMTApICogKHBhcnNlW3VuaXRzXSB8fCAxKVxuXHR9KVxuXHRyZXR1cm4gcmVzdWx0XG59XG4iLCJcbmV4cG9ydHMubGluZWFyID0gZnVuY3Rpb24obil7XG4gIHJldHVybiBuO1xufTtcblxuZXhwb3J0cy5pblF1YWQgPSBmdW5jdGlvbihuKXtcbiAgcmV0dXJuIG4gKiBuO1xufTtcblxuZXhwb3J0cy5vdXRRdWFkID0gZnVuY3Rpb24obil7XG4gIHJldHVybiBuICogKDIgLSBuKTtcbn07XG5cbmV4cG9ydHMuaW5PdXRRdWFkID0gZnVuY3Rpb24obil7XG4gIG4gKj0gMjtcbiAgaWYgKG4gPCAxKSByZXR1cm4gMC41ICogbiAqIG47XG4gIHJldHVybiAtIDAuNSAqICgtLW4gKiAobiAtIDIpIC0gMSk7XG59O1xuXG5leHBvcnRzLmluQ3ViZSA9IGZ1bmN0aW9uKG4pe1xuICByZXR1cm4gbiAqIG4gKiBuO1xufTtcblxuZXhwb3J0cy5vdXRDdWJlID0gZnVuY3Rpb24obil7XG4gIHJldHVybiAtLW4gKiBuICogbiArIDE7XG59O1xuXG5leHBvcnRzLmluT3V0Q3ViZSA9IGZ1bmN0aW9uKG4pe1xuICBuICo9IDI7XG4gIGlmIChuIDwgMSkgcmV0dXJuIDAuNSAqIG4gKiBuICogbjtcbiAgcmV0dXJuIDAuNSAqICgobiAtPSAyICkgKiBuICogbiArIDIpO1xufTtcblxuZXhwb3J0cy5pblF1YXJ0ID0gZnVuY3Rpb24obil7XG4gIHJldHVybiBuICogbiAqIG4gKiBuO1xufTtcblxuZXhwb3J0cy5vdXRRdWFydCA9IGZ1bmN0aW9uKG4pe1xuICByZXR1cm4gMSAtICgtLW4gKiBuICogbiAqIG4pO1xufTtcblxuZXhwb3J0cy5pbk91dFF1YXJ0ID0gZnVuY3Rpb24obil7XG4gIG4gKj0gMjtcbiAgaWYgKG4gPCAxKSByZXR1cm4gMC41ICogbiAqIG4gKiBuICogbjtcbiAgcmV0dXJuIC0wLjUgKiAoKG4gLT0gMikgKiBuICogbiAqIG4gLSAyKTtcbn07XG5cbmV4cG9ydHMuaW5RdWludCA9IGZ1bmN0aW9uKG4pe1xuICByZXR1cm4gbiAqIG4gKiBuICogbiAqIG47XG59XG5cbmV4cG9ydHMub3V0UXVpbnQgPSBmdW5jdGlvbihuKXtcbiAgcmV0dXJuIC0tbiAqIG4gKiBuICogbiAqIG4gKyAxO1xufVxuXG5leHBvcnRzLmluT3V0UXVpbnQgPSBmdW5jdGlvbihuKXtcbiAgbiAqPSAyO1xuICBpZiAobiA8IDEpIHJldHVybiAwLjUgKiBuICogbiAqIG4gKiBuICogbjtcbiAgcmV0dXJuIDAuNSAqICgobiAtPSAyKSAqIG4gKiBuICogbiAqIG4gKyAyKTtcbn07XG5cbmV4cG9ydHMuaW5TaW5lID0gZnVuY3Rpb24obil7XG4gIHJldHVybiAxIC0gTWF0aC5jb3MobiAqIE1hdGguUEkgLyAyICk7XG59O1xuXG5leHBvcnRzLm91dFNpbmUgPSBmdW5jdGlvbihuKXtcbiAgcmV0dXJuIE1hdGguc2luKG4gKiBNYXRoLlBJIC8gMik7XG59O1xuXG5leHBvcnRzLmluT3V0U2luZSA9IGZ1bmN0aW9uKG4pe1xuICByZXR1cm4gLjUgKiAoMSAtIE1hdGguY29zKE1hdGguUEkgKiBuKSk7XG59O1xuXG5leHBvcnRzLmluRXhwbyA9IGZ1bmN0aW9uKG4pe1xuICByZXR1cm4gMCA9PSBuID8gMCA6IE1hdGgucG93KDEwMjQsIG4gLSAxKTtcbn07XG5cbmV4cG9ydHMub3V0RXhwbyA9IGZ1bmN0aW9uKG4pe1xuICByZXR1cm4gMSA9PSBuID8gbiA6IDEgLSBNYXRoLnBvdygyLCAtMTAgKiBuKTtcbn07XG5cbmV4cG9ydHMuaW5PdXRFeHBvID0gZnVuY3Rpb24obil7XG4gIGlmICgwID09IG4pIHJldHVybiAwO1xuICBpZiAoMSA9PSBuKSByZXR1cm4gMTtcbiAgaWYgKChuICo9IDIpIDwgMSkgcmV0dXJuIC41ICogTWF0aC5wb3coMTAyNCwgbiAtIDEpO1xuICByZXR1cm4gLjUgKiAoLU1hdGgucG93KDIsIC0xMCAqIChuIC0gMSkpICsgMik7XG59O1xuXG5leHBvcnRzLmluQ2lyYyA9IGZ1bmN0aW9uKG4pe1xuICByZXR1cm4gMSAtIE1hdGguc3FydCgxIC0gbiAqIG4pO1xufTtcblxuZXhwb3J0cy5vdXRDaXJjID0gZnVuY3Rpb24obil7XG4gIHJldHVybiBNYXRoLnNxcnQoMSAtICgtLW4gKiBuKSk7XG59O1xuXG5leHBvcnRzLmluT3V0Q2lyYyA9IGZ1bmN0aW9uKG4pe1xuICBuICo9IDJcbiAgaWYgKG4gPCAxKSByZXR1cm4gLTAuNSAqIChNYXRoLnNxcnQoMSAtIG4gKiBuKSAtIDEpO1xuICByZXR1cm4gMC41ICogKE1hdGguc3FydCgxIC0gKG4gLT0gMikgKiBuKSArIDEpO1xufTtcblxuZXhwb3J0cy5pbkJhY2sgPSBmdW5jdGlvbihuKXtcbiAgdmFyIHMgPSAxLjcwMTU4O1xuICByZXR1cm4gbiAqIG4gKiAoKCBzICsgMSApICogbiAtIHMpO1xufTtcblxuZXhwb3J0cy5vdXRCYWNrID0gZnVuY3Rpb24obil7XG4gIHZhciBzID0gMS43MDE1ODtcbiAgcmV0dXJuIC0tbiAqIG4gKiAoKHMgKyAxKSAqIG4gKyBzKSArIDE7XG59O1xuXG5leHBvcnRzLmluT3V0QmFjayA9IGZ1bmN0aW9uKG4pe1xuICB2YXIgcyA9IDEuNzAxNTggKiAxLjUyNTtcbiAgaWYgKCAoIG4gKj0gMiApIDwgMSApIHJldHVybiAwLjUgKiAoIG4gKiBuICogKCAoIHMgKyAxICkgKiBuIC0gcyApICk7XG4gIHJldHVybiAwLjUgKiAoICggbiAtPSAyICkgKiBuICogKCAoIHMgKyAxICkgKiBuICsgcyApICsgMiApO1xufTtcblxuZXhwb3J0cy5pbkJvdW5jZSA9IGZ1bmN0aW9uKG4pe1xuICByZXR1cm4gMSAtIGV4cG9ydHMub3V0Qm91bmNlKDEgLSBuKTtcbn07XG5cbmV4cG9ydHMub3V0Qm91bmNlID0gZnVuY3Rpb24obil7XG4gIGlmICggbiA8ICggMSAvIDIuNzUgKSApIHtcbiAgICByZXR1cm4gNy41NjI1ICogbiAqIG47XG4gIH0gZWxzZSBpZiAoIG4gPCAoIDIgLyAyLjc1ICkgKSB7XG4gICAgcmV0dXJuIDcuNTYyNSAqICggbiAtPSAoIDEuNSAvIDIuNzUgKSApICogbiArIDAuNzU7XG4gIH0gZWxzZSBpZiAoIG4gPCAoIDIuNSAvIDIuNzUgKSApIHtcbiAgICByZXR1cm4gNy41NjI1ICogKCBuIC09ICggMi4yNSAvIDIuNzUgKSApICogbiArIDAuOTM3NTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gNy41NjI1ICogKCBuIC09ICggMi42MjUgLyAyLjc1ICkgKSAqIG4gKyAwLjk4NDM3NTtcbiAgfVxufTtcblxuZXhwb3J0cy5pbk91dEJvdW5jZSA9IGZ1bmN0aW9uKG4pe1xuICBpZiAobiA8IC41KSByZXR1cm4gZXhwb3J0cy5pbkJvdW5jZShuICogMikgKiAuNTtcbiAgcmV0dXJuIGV4cG9ydHMub3V0Qm91bmNlKG4gKiAyIC0gMSkgKiAuNSArIC41O1xufTtcblxuLy8gYWxpYXNlc1xuXG5leHBvcnRzWydpbi1xdWFkJ10gPSBleHBvcnRzLmluUXVhZDtcbmV4cG9ydHNbJ291dC1xdWFkJ10gPSBleHBvcnRzLm91dFF1YWQ7XG5leHBvcnRzWydpbi1vdXQtcXVhZCddID0gZXhwb3J0cy5pbk91dFF1YWQ7XG5leHBvcnRzWydpbi1jdWJlJ10gPSBleHBvcnRzLmluQ3ViZTtcbmV4cG9ydHNbJ291dC1jdWJlJ10gPSBleHBvcnRzLm91dEN1YmU7XG5leHBvcnRzWydpbi1vdXQtY3ViZSddID0gZXhwb3J0cy5pbk91dEN1YmU7XG5leHBvcnRzWydpbi1xdWFydCddID0gZXhwb3J0cy5pblF1YXJ0O1xuZXhwb3J0c1snb3V0LXF1YXJ0J10gPSBleHBvcnRzLm91dFF1YXJ0O1xuZXhwb3J0c1snaW4tb3V0LXF1YXJ0J10gPSBleHBvcnRzLmluT3V0UXVhcnQ7XG5leHBvcnRzWydpbi1xdWludCddID0gZXhwb3J0cy5pblF1aW50O1xuZXhwb3J0c1snb3V0LXF1aW50J10gPSBleHBvcnRzLm91dFF1aW50O1xuZXhwb3J0c1snaW4tb3V0LXF1aW50J10gPSBleHBvcnRzLmluT3V0UXVpbnQ7XG5leHBvcnRzWydpbi1zaW5lJ10gPSBleHBvcnRzLmluU2luZTtcbmV4cG9ydHNbJ291dC1zaW5lJ10gPSBleHBvcnRzLm91dFNpbmU7XG5leHBvcnRzWydpbi1vdXQtc2luZSddID0gZXhwb3J0cy5pbk91dFNpbmU7XG5leHBvcnRzWydpbi1leHBvJ10gPSBleHBvcnRzLmluRXhwbztcbmV4cG9ydHNbJ291dC1leHBvJ10gPSBleHBvcnRzLm91dEV4cG87XG5leHBvcnRzWydpbi1vdXQtZXhwbyddID0gZXhwb3J0cy5pbk91dEV4cG87XG5leHBvcnRzWydpbi1jaXJjJ10gPSBleHBvcnRzLmluQ2lyYztcbmV4cG9ydHNbJ291dC1jaXJjJ10gPSBleHBvcnRzLm91dENpcmM7XG5leHBvcnRzWydpbi1vdXQtY2lyYyddID0gZXhwb3J0cy5pbk91dENpcmM7XG5leHBvcnRzWydpbi1iYWNrJ10gPSBleHBvcnRzLmluQmFjaztcbmV4cG9ydHNbJ291dC1iYWNrJ10gPSBleHBvcnRzLm91dEJhY2s7XG5leHBvcnRzWydpbi1vdXQtYmFjayddID0gZXhwb3J0cy5pbk91dEJhY2s7XG5leHBvcnRzWydpbi1ib3VuY2UnXSA9IGV4cG9ydHMuaW5Cb3VuY2U7XG5leHBvcnRzWydvdXQtYm91bmNlJ10gPSBleHBvcnRzLm91dEJvdW5jZTtcbmV4cG9ydHNbJ2luLW91dC1ib3VuY2UnXSA9IGV4cG9ydHMuaW5PdXRCb3VuY2U7XG4iLCIvKipcbiAqIEV4cG9zZSBgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKClgLlxuICovXG5cbmV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWVcbiAgfHwgd2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZVxuICB8fCB3aW5kb3cubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lXG4gIHx8IHdpbmRvdy5vUmVxdWVzdEFuaW1hdGlvbkZyYW1lXG4gIHx8IHdpbmRvdy5tc1JlcXVlc3RBbmltYXRpb25GcmFtZVxuICB8fCBmYWxsYmFjaztcblxuLyoqXG4gKiBGYWxsYmFjayBpbXBsZW1lbnRhdGlvbi5cbiAqL1xuXG52YXIgcHJldiA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuZnVuY3Rpb24gZmFsbGJhY2soZm4pIHtcbiAgdmFyIGN1cnIgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgdmFyIG1zID0gTWF0aC5tYXgoMCwgMTYgLSAoY3VyciAtIHByZXYpKTtcbiAgdmFyIHJlcSA9IHNldFRpbWVvdXQoZm4sIG1zKTtcbiAgcHJldiA9IGN1cnI7XG4gIHJldHVybiByZXE7XG59XG5cbi8qKlxuICogQ2FuY2VsLlxuICovXG5cbnZhciBjYW5jZWwgPSB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWVcbiAgfHwgd2luZG93LndlYmtpdENhbmNlbEFuaW1hdGlvbkZyYW1lXG4gIHx8IHdpbmRvdy5tb3pDYW5jZWxBbmltYXRpb25GcmFtZVxuICB8fCB3aW5kb3cub0NhbmNlbEFuaW1hdGlvbkZyYW1lXG4gIHx8IHdpbmRvdy5tc0NhbmNlbEFuaW1hdGlvbkZyYW1lXG4gIHx8IHdpbmRvdy5jbGVhclRpbWVvdXQ7XG5cbmV4cG9ydHMuY2FuY2VsID0gZnVuY3Rpb24oaWQpe1xuICBjYW5jZWwuY2FsbCh3aW5kb3csIGlkKTtcbn07XG4iLCJcbi8qKlxuICogdG9TdHJpbmcgcmVmLlxuICovXG5cbnZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbi8qKlxuICogUmV0dXJuIHRoZSB0eXBlIG9mIGB2YWxgLlxuICpcbiAqIEBwYXJhbSB7TWl4ZWR9IHZhbFxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHZhbCl7XG4gIHN3aXRjaCAodG9TdHJpbmcuY2FsbCh2YWwpKSB7XG4gICAgY2FzZSAnW29iamVjdCBGdW5jdGlvbl0nOiByZXR1cm4gJ2Z1bmN0aW9uJztcbiAgICBjYXNlICdbb2JqZWN0IERhdGVdJzogcmV0dXJuICdkYXRlJztcbiAgICBjYXNlICdbb2JqZWN0IFJlZ0V4cF0nOiByZXR1cm4gJ3JlZ2V4cCc7XG4gICAgY2FzZSAnW29iamVjdCBBcmd1bWVudHNdJzogcmV0dXJuICdhcmd1bWVudHMnO1xuICAgIGNhc2UgJ1tvYmplY3QgQXJyYXldJzogcmV0dXJuICdhcnJheSc7XG4gICAgY2FzZSAnW29iamVjdCBTdHJpbmddJzogcmV0dXJuICdzdHJpbmcnO1xuICB9XG5cbiAgaWYgKHZhbCA9PT0gbnVsbCkgcmV0dXJuICdudWxsJztcbiAgaWYgKHZhbCA9PT0gdW5kZWZpbmVkKSByZXR1cm4gJ3VuZGVmaW5lZCc7XG4gIGlmICh2YWwgJiYgdmFsLm5vZGVUeXBlID09PSAxKSByZXR1cm4gJ2VsZW1lbnQnO1xuICBpZiAodmFsID09PSBPYmplY3QodmFsKSkgcmV0dXJuICdvYmplY3QnO1xuXG4gIHJldHVybiB0eXBlb2YgdmFsO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oYXJyLCBvYmope1xuICBpZiAoYXJyLmluZGV4T2YpIHJldHVybiBhcnIuaW5kZXhPZihvYmopO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7ICsraSkge1xuICAgIGlmIChhcnJbaV0gPT09IG9iaikgcmV0dXJuIGk7XG4gIH1cbiAgcmV0dXJuIC0xO1xufTsiLCJpZiAoJ3VuZGVmaW5lZCcgPT0gdHlwZW9mIHdpbmRvdykge1xuICBtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vbGliL2RlYnVnJyk7XG59IGVsc2Uge1xuICBtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vZGVidWcnKTtcbn1cbiIsIi8qKlxuICogTW9kdWxlIERlcGVuZGVuY2llc1xuICovXG5cbnZhciBkZWJ1ZyA9IHJlcXVpcmUoJ2RlYnVnJykoJ2Nzczpjc3MnKTtcbnZhciBjYW1lbGNhc2UgPSByZXF1aXJlKCd0by1jYW1lbC1jYXNlJyk7XG52YXIgY29tcHV0ZWQgPSByZXF1aXJlKCcuL2NvbXB1dGVkJyk7XG52YXIgcHJvcGVydHkgPSByZXF1aXJlKCcuL3Byb3AnKTtcblxuLyoqXG4gKiBFeHBvc2UgYGNzc2BcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNzcztcblxuLyoqXG4gKiBDU1MgTm9ybWFsIFRyYW5zZm9ybXNcbiAqL1xuXG52YXIgY3NzTm9ybWFsVHJhbnNmb3JtID0ge1xuICBsZXR0ZXJTcGFjaW5nOiAwLFxuICBmb250V2VpZ2h0OiA0MDBcbn07XG5cbi8qKlxuICogR2V0IGEgQ1NTIHZhbHVlXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbFxuICogQHBhcmFtIHtTdHJpbmd9IHByb3BcbiAqIEBwYXJhbSB7TWl4ZWR9IGV4dHJhXG4gKiBAcGFyYW0ge0FycmF5fSBzdHlsZXNcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuXG5mdW5jdGlvbiBjc3MoZWwsIHByb3AsIGV4dHJhLCBzdHlsZXMpIHtcbiAgdmFyIGhvb2tzID0gcmVxdWlyZSgnLi9ob29rcycpO1xuICB2YXIgb3JpZyA9IGNhbWVsY2FzZShwcm9wKTtcbiAgdmFyIHN0eWxlID0gZWwuc3R5bGU7XG4gIHZhciB2YWw7XG5cbiAgcHJvcCA9IHByb3BlcnR5KHByb3AsIHN0eWxlKTtcbiAgdmFyIGhvb2sgPSBob29rc1twcm9wXSB8fCBob29rc1tvcmlnXTtcblxuICAvLyBJZiBhIGhvb2sgd2FzIHByb3ZpZGVkIGdldCB0aGUgY29tcHV0ZWQgdmFsdWUgZnJvbSB0aGVyZVxuICBpZiAoaG9vayAmJiBob29rLmdldCkge1xuICAgIGRlYnVnKCdnZXQgaG9vayBwcm92aWRlZC4gdXNlIHRoYXQnKTtcbiAgICB2YWwgPSBob29rLmdldChlbCwgdHJ1ZSwgZXh0cmEpO1xuICB9XG5cbiAgLy8gT3RoZXJ3aXNlLCBpZiBhIHdheSB0byBnZXQgdGhlIGNvbXB1dGVkIHZhbHVlIGV4aXN0cywgdXNlIHRoYXRcbiAgaWYgKHVuZGVmaW5lZCA9PSB2YWwpIHtcbiAgICBkZWJ1ZygnZmV0Y2ggdGhlIGNvbXB1dGVkIHZhbHVlIG9mICVzJywgcHJvcCk7XG4gICAgdmFsID0gY29tcHV0ZWQoZWwsIHByb3ApO1xuICB9XG5cbiAgaWYgKCdub3JtYWwnID09IHZhbCAmJiBjc3NOb3JtYWxUcmFuc2Zvcm1bcHJvcF0pIHtcbiAgICB2YWwgPSBjc3NOb3JtYWxUcmFuc2Zvcm1bcHJvcF07XG4gICAgZGVidWcoJ25vcm1hbCA9PiAlcycsIHZhbCk7XG4gIH1cblxuICAvLyBSZXR1cm4sIGNvbnZlcnRpbmcgdG8gbnVtYmVyIGlmIGZvcmNlZCBvciBhIHF1YWxpZmllciB3YXMgcHJvdmlkZWQgYW5kIHZhbCBsb29rcyBudW1lcmljXG4gIGlmICgnJyA9PSBleHRyYSB8fCBleHRyYSkge1xuICAgIGRlYnVnKCdjb252ZXJ0aW5nIHZhbHVlOiAlcyBpbnRvIGEgbnVtYmVyJyk7XG4gICAgdmFyIG51bSA9IHBhcnNlRmxvYXQodmFsKTtcbiAgICByZXR1cm4gdHJ1ZSA9PT0gZXh0cmEgfHwgaXNOdW1lcmljKG51bSkgPyBudW0gfHwgMCA6IHZhbDtcbiAgfVxuXG4gIHJldHVybiB2YWw7XG59XG5cbi8qKlxuICogSXMgTnVtZXJpY1xuICpcbiAqIEBwYXJhbSB7TWl4ZWR9IG9ialxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuXG5mdW5jdGlvbiBpc051bWVyaWMob2JqKSB7XG4gIHJldHVybiAhaXNOYW4ocGFyc2VGbG9hdChvYmopKSAmJiBpc0Zpbml0ZShvYmopO1xufVxuIiwiLyoqXG4gKiBNb2R1bGUgRGVwZW5kZW5jaWVzXG4gKi9cblxudmFyIGRlYnVnID0gcmVxdWlyZSgnZGVidWcnKSgnY3NzOnN0eWxlJyk7XG52YXIgY2FtZWxjYXNlID0gcmVxdWlyZSgndG8tY2FtZWwtY2FzZScpO1xudmFyIHN1cHBvcnQgPSByZXF1aXJlKCcuL3N1cHBvcnQnKTtcbnZhciBwcm9wZXJ0eSA9IHJlcXVpcmUoJy4vcHJvcCcpO1xudmFyIGhvb2tzID0gcmVxdWlyZSgnLi9ob29rcycpO1xuXG4vKipcbiAqIEV4cG9zZSBgc3R5bGVgXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBzdHlsZTtcblxuLyoqXG4gKiBQb3NzaWJseS11bml0bGVzcyBwcm9wZXJ0aWVzXG4gKlxuICogRG9uJ3QgYXV0b21hdGljYWxseSBhZGQgJ3B4JyB0byB0aGVzZSBwcm9wZXJ0aWVzXG4gKi9cblxudmFyIGNzc051bWJlciA9IHtcbiAgXCJjb2x1bW5Db3VudFwiOiB0cnVlLFxuICBcImZpbGxPcGFjaXR5XCI6IHRydWUsXG4gIFwiZm9udFdlaWdodFwiOiB0cnVlLFxuICBcImxpbmVIZWlnaHRcIjogdHJ1ZSxcbiAgXCJvcGFjaXR5XCI6IHRydWUsXG4gIFwib3JkZXJcIjogdHJ1ZSxcbiAgXCJvcnBoYW5zXCI6IHRydWUsXG4gIFwid2lkb3dzXCI6IHRydWUsXG4gIFwiekluZGV4XCI6IHRydWUsXG4gIFwiem9vbVwiOiB0cnVlXG59O1xuXG4vKipcbiAqIFNldCBhIGNzcyB2YWx1ZVxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7U3RyaW5nfSBwcm9wXG4gKiBAcGFyYW0ge01peGVkfSB2YWxcbiAqIEBwYXJhbSB7TWl4ZWR9IGV4dHJhXG4gKi9cblxuZnVuY3Rpb24gc3R5bGUoZWwsIHByb3AsIHZhbCwgZXh0cmEpIHtcbiAgLy8gRG9uJ3Qgc2V0IHN0eWxlcyBvbiB0ZXh0IGFuZCBjb21tZW50IG5vZGVzXG4gIGlmICghZWwgfHwgZWwubm9kZVR5cGUgPT09IDMgfHwgZWwubm9kZVR5cGUgPT09IDggfHwgIWVsLnN0eWxlICkgcmV0dXJuO1xuXG4gIHZhciBvcmlnID0gY2FtZWxjYXNlKHByb3ApO1xuICB2YXIgc3R5bGUgPSBlbC5zdHlsZTtcbiAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsO1xuXG4gIGlmICghdmFsKSByZXR1cm4gZ2V0KGVsLCBwcm9wLCBvcmlnLCBleHRyYSk7XG5cbiAgcHJvcCA9IHByb3BlcnR5KHByb3AsIHN0eWxlKTtcblxuICB2YXIgaG9vayA9IGhvb2tzW3Byb3BdIHx8IGhvb2tzW29yaWddO1xuXG4gIC8vIElmIGEgbnVtYmVyIHdhcyBwYXNzZWQgaW4sIGFkZCAncHgnIHRvIHRoZSAoZXhjZXB0IGZvciBjZXJ0YWluIENTUyBwcm9wZXJ0aWVzKVxuICBpZiAoJ251bWJlcicgPT0gdHlwZSAmJiAhY3NzTnVtYmVyW29yaWddKSB7XG4gICAgZGVidWcoJ2FkZGluZyBcInB4XCIgdG8gZW5kIG9mIG51bWJlcicpO1xuICAgIHZhbCArPSAncHgnO1xuICB9XG5cbiAgLy8gRml4ZXMgalF1ZXJ5ICM4OTA4LCBpdCBjYW4gYmUgZG9uZSBtb3JlIGNvcnJlY3RseSBieSBzcGVjaWZ5aW5nIHNldHRlcnMgaW4gY3NzSG9va3MsXG4gIC8vIGJ1dCBpdCB3b3VsZCBtZWFuIHRvIGRlZmluZSBlaWdodCAoZm9yIGV2ZXJ5IHByb2JsZW1hdGljIHByb3BlcnR5KSBpZGVudGljYWwgZnVuY3Rpb25zXG4gIGlmICghc3VwcG9ydC5jbGVhckNsb25lU3R5bGUgJiYgJycgPT09IHZhbCAmJiAwID09PSBwcm9wLmluZGV4T2YoJ2JhY2tncm91bmQnKSkge1xuICAgIGRlYnVnKCdzZXQgcHJvcGVydHkgKCVzKSB2YWx1ZSB0byBcImluaGVyaXRcIicsIHByb3ApO1xuICAgIHN0eWxlW3Byb3BdID0gJ2luaGVyaXQnO1xuICB9XG5cbiAgLy8gSWYgYSBob29rIHdhcyBwcm92aWRlZCwgdXNlIHRoYXQgdmFsdWUsIG90aGVyd2lzZSBqdXN0IHNldCB0aGUgc3BlY2lmaWVkIHZhbHVlXG4gIGlmICghaG9vayB8fCAhaG9vay5zZXQgfHwgdW5kZWZpbmVkICE9PSAodmFsID0gaG9vay5zZXQoZWwsIHZhbCwgZXh0cmEpKSkge1xuICAgIC8vIFN1cHBvcnQ6IENocm9tZSwgU2FmYXJpXG4gICAgLy8gU2V0dGluZyBzdHlsZSB0byBibGFuayBzdHJpbmcgcmVxdWlyZWQgdG8gZGVsZXRlIFwic3R5bGU6IHggIWltcG9ydGFudDtcIlxuICAgIGRlYnVnKCdzZXQgaG9vayBkZWZpbmVkLiBzZXR0aW5nIHByb3BlcnR5ICglcykgdG8gJXMnLCBwcm9wLCB2YWwpO1xuICAgIHN0eWxlW3Byb3BdID0gJyc7XG4gICAgc3R5bGVbcHJvcF0gPSB2YWw7XG4gIH1cblxufVxuXG4vKipcbiAqIEdldCB0aGUgc3R5bGVcbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gKiBAcGFyYW0ge1N0cmluZ30gcHJvcFxuICogQHBhcmFtIHtTdHJpbmd9IG9yaWdcbiAqIEBwYXJhbSB7TWl4ZWR9IGV4dHJhXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cblxuZnVuY3Rpb24gZ2V0KGVsLCBwcm9wLCBvcmlnLCBleHRyYSkge1xuICB2YXIgc3R5bGUgPSBlbC5zdHlsZTtcbiAgdmFyIGhvb2sgPSBob29rc1twcm9wXSB8fCBob29rc1tvcmlnXTtcbiAgdmFyIHJldDtcblxuICBpZiAoaG9vayAmJiBob29rLmdldCAmJiB1bmRlZmluZWQgIT09IChyZXQgPSBob29rLmdldChlbCwgZmFsc2UsIGV4dHJhKSkpIHtcbiAgICBkZWJ1ZygnZ2V0IGhvb2sgZGVmaW5lZCwgcmV0dXJuaW5nOiAlcycsIHJldCk7XG4gICAgcmV0dXJuIHJldDtcbiAgfVxuXG4gIHJldCA9IHN0eWxlW3Byb3BdO1xuICBkZWJ1ZygnZ2V0dGluZyAlcycsIHJldCk7XG4gIHJldHVybiByZXQ7XG59XG4iLCJcbi8qKlxuICogUmV0dXJuIGltbWVkaWF0ZSBpZGVudGlmaWVycyBwYXJzZWQgZnJvbSBgc3RyYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcGFyYW0ge1N0cmluZ3xGdW5jdGlvbn0gbWFwIGZ1bmN0aW9uIG9yIHByZWZpeFxuICogQHJldHVybiB7QXJyYXl9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc3RyLCBmbil7XG4gIHZhciBwID0gdW5pcXVlKHByb3BzKHN0cikpO1xuICBpZiAoZm4gJiYgJ3N0cmluZycgPT0gdHlwZW9mIGZuKSBmbiA9IHByZWZpeGVkKGZuKTtcbiAgaWYgKGZuKSByZXR1cm4gbWFwKHN0ciwgcCwgZm4pO1xuICByZXR1cm4gcDtcbn07XG5cbi8qKlxuICogUmV0dXJuIGltbWVkaWF0ZSBpZGVudGlmaWVycyBpbiBgc3RyYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHByb3BzKHN0cikge1xuICByZXR1cm4gc3RyXG4gICAgLnJlcGxhY2UoL1xcLlxcdyt8XFx3KyAqXFwofFwiW15cIl0qXCJ8J1teJ10qJ3xcXC8oW14vXSspXFwvL2csICcnKVxuICAgIC5tYXRjaCgvW2EtekEtWl9dXFx3Ki9nKVxuICAgIHx8IFtdO1xufVxuXG4vKipcbiAqIFJldHVybiBgc3RyYCB3aXRoIGBwcm9wc2AgbWFwcGVkIHdpdGggYGZuYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcGFyYW0ge0FycmF5fSBwcm9wc1xuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIG1hcChzdHIsIHByb3BzLCBmbikge1xuICB2YXIgcmUgPSAvXFwuXFx3K3xcXHcrICpcXCh8XCJbXlwiXSpcInwnW14nXSonfFxcLyhbXi9dKylcXC98W2EtekEtWl9dXFx3Ki9nO1xuICByZXR1cm4gc3RyLnJlcGxhY2UocmUsIGZ1bmN0aW9uKF8pe1xuICAgIGlmICgnKCcgPT0gX1tfLmxlbmd0aCAtIDFdKSByZXR1cm4gZm4oXyk7XG4gICAgaWYgKCF+cHJvcHMuaW5kZXhPZihfKSkgcmV0dXJuIF87XG4gICAgcmV0dXJuIGZuKF8pO1xuICB9KTtcbn1cblxuLyoqXG4gKiBSZXR1cm4gdW5pcXVlIGFycmF5LlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGFyclxuICogQHJldHVybiB7QXJyYXl9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiB1bmlxdWUoYXJyKSB7XG4gIHZhciByZXQgPSBbXTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xuICAgIGlmICh+cmV0LmluZGV4T2YoYXJyW2ldKSkgY29udGludWU7XG4gICAgcmV0LnB1c2goYXJyW2ldKTtcbiAgfVxuXG4gIHJldHVybiByZXQ7XG59XG5cbi8qKlxuICogTWFwIHdpdGggcHJlZml4IGBzdHJgLlxuICovXG5cbmZ1bmN0aW9uIHByZWZpeGVkKHN0cikge1xuICByZXR1cm4gZnVuY3Rpb24oXyl7XG4gICAgcmV0dXJuIHN0ciArIF87XG4gIH1cbn1cbiIsIlxuLyoqXG4gKiBSZXR1cm4gaW1tZWRpYXRlIGlkZW50aWZpZXJzIHBhcnNlZCBmcm9tIGBzdHJgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge0FycmF5fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHN0ciwgcHJlZml4KXtcbiAgdmFyIHAgPSB1bmlxdWUocHJvcHMoc3RyKSk7XG4gIGlmIChwcmVmaXgpIHJldHVybiBwcmVmaXhlZChzdHIsIHAsIHByZWZpeCk7XG4gIHJldHVybiBwO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gaW1tZWRpYXRlIGlkZW50aWZpZXJzIGluIGBzdHJgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge0FycmF5fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gcHJvcHMoc3RyKSB7XG4gIHJldHVybiBzdHJcbiAgICAucmVwbGFjZSgvXFwuXFx3K3xcXHcrICpcXCh8XCJbXlwiXSpcInwnW14nXSonfFxcLyhbXi9dKylcXC8vZywgJycpXG4gICAgLm1hdGNoKC9bYS16QS1aX11cXHcqL2cpXG4gICAgfHwgW107XG59XG5cbi8qKlxuICogUmV0dXJuIGBzdHJgIHdpdGggYHByb3BzYCBwcmVmaXhlZCB3aXRoIGBwcmVmaXhgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEBwYXJhbSB7QXJyYXl9IHByb3BzXG4gKiBAcGFyYW0ge1N0cmluZ30gcHJlZml4XG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBwcmVmaXhlZChzdHIsIHByb3BzLCBwcmVmaXgpIHtcbiAgdmFyIHJlID0gL1xcLlxcdyt8XFx3KyAqXFwofFwiW15cIl0qXCJ8J1teJ10qJ3xcXC8oW14vXSspXFwvfFthLXpBLVpfXVxcdyovZztcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKHJlLCBmdW5jdGlvbihfKXtcbiAgICBpZiAoJygnID09IF9bXy5sZW5ndGggLSAxXSkgcmV0dXJuIHByZWZpeCArIF87XG4gICAgaWYgKCF+cHJvcHMuaW5kZXhPZihfKSkgcmV0dXJuIF87XG4gICAgcmV0dXJuIHByZWZpeCArIF87XG4gIH0pO1xufVxuXG4vKipcbiAqIFJldHVybiB1bmlxdWUgYXJyYXkuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gYXJyXG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHVuaXF1ZShhcnIpIHtcbiAgdmFyIHJldCA9IFtdO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKH5yZXQuaW5kZXhPZihhcnJbaV0pKSBjb250aW51ZTtcbiAgICByZXQucHVzaChhcnJbaV0pO1xuICB9XG5cbiAgcmV0dXJuIHJldDtcbn1cbiIsIlxudmFyIHR3ZWVuID0gcmVxdWlyZSgnc3RyaW5nLXR3ZWVuJylcbnZhciB1bm1hdHJpeCA9IHJlcXVpcmUoJ3VubWF0cml4JylcbnZhciBrZXlzID0gT2JqZWN0LmtleXNcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihmcm9tLCB0byl7XG4gIHJldHVybiB0d2Vlbihub3JtYWxpemUoZnJvbSksIG5vcm1hbGl6ZSh0bykpXG59XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZShtKXtcbiAgaWYgKHR5cGVvZiBtID09ICdzdHJpbmcnKSBtID0gdW5tYXRyaXgobSlcbiAgcmV0dXJuIGtleXModW5pdCkucmVkdWNlKGZ1bmN0aW9uKHN0ciwga2V5KXtcbiAgICByZXR1cm4gc3RyICsga2V5ICsgJygnICsgbVtrZXldICsgdW5pdFtrZXldICsgJyknXG4gIH0sICcnKVxufVxuXG52YXIgdW5pdCA9IHtcbiAgdHJhbnNsYXRlWDogJ3B4JyxcbiAgdHJhbnNsYXRlWTogJ3B4JyxcbiAgcm90YXRlOiAnZGVnJyxcbiAgc2tldzogJ2RlZycsXG4gIHNjYWxlWDogJycsXG4gIHNjYWxlWTogJydcbn0iLCJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZnJvbSwgdG8pe1xuICBmcm9tID0gcGFyc2VGbG9hdChmcm9tLCAxMCkgfHwgMFxuICB0byA9IHBhcnNlRmxvYXQodG8sIDEwKSB8fCAwXG4gIHJldHVybiBmdW5jdGlvbiBmcmFtZShuKXtcbiAgICByZXR1cm4gZnJvbSArICh0byAtIGZyb20pICogblxuICB9XG59XG4iLCJcbnZhciB0b1N0cmluZyA9IHJlcXVpcmUoJ3NlcmlhbGl6ZS1zdmctcGF0aCcpXG52YXIgYmFsYW5jZSA9IHJlcXVpcmUoJ2JhbGFuY2Utc3ZnLXBhdGhzJylcbnZhciB0d2VlbiA9IHJlcXVpcmUoJ3N0cmluZy10d2VlbicpXG52YXIgbm9ybWFsaXplID0gcmVxdWlyZSgnZmNvbXAnKShcbiAgcmVxdWlyZSgncGFyc2Utc3ZnLXBhdGgnKSxcbiAgcmVxdWlyZSgnYWJzLXN2Zy1wYXRoJyksXG4gIHJlcXVpcmUoJ25vcm1hbGl6ZS1zdmctcGF0aCcpLFxuICByZXF1aXJlKCdyZWwtc3ZnLXBhdGgnKSlcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihmcm9tLCB0byl7XG4gIHZhciBlbmRzID0gYmFsYW5jZShub3JtYWxpemUoZnJvbSksIG5vcm1hbGl6ZSh0bykpXG4gIHJldHVybiB0d2Vlbih0b1N0cmluZyhlbmRzWzBdKSwgdG9TdHJpbmcoZW5kc1sxXSkpXG59XG4iLCJcbnZhciBwYXJzZSA9IHJlcXVpcmUoJ2NvbG9yLXBhcnNlcicpXG52YXIgcm91bmQgPSBNYXRoLnJvdW5kXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZnJvbSwgdG8pe1xuICBmcm9tID0gcmdiYShmcm9tKVxuICB0byA9IHJnYmEodG8pXG4gIHZhciBjdXJyID0gdG8uc2xpY2UoKVxuICByZXR1cm4gZnVuY3Rpb24gZnJhbWUobil7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAzOyBpKyspIHtcbiAgICAgIGN1cnJbaV0gPSByb3VuZChmcm9tW2ldICsgKHRvW2ldIC0gZnJvbVtpXSkgKiBuKVxuICAgIH1cbiAgICAvLyBkb24ndCByb3VuZCBhbHBoYVxuICAgIGN1cnJbM10gPSBmcm9tW2ldICsgKHRvW2ldIC0gZnJvbVtpXSkgKiBuXG4gICAgcmV0dXJuICdyZ2JhKCcgKyBjdXJyICsgJyknXG4gIH1cbn1cblxuZnVuY3Rpb24gcmdiYShjb2xvcil7XG4gIGNvbG9yID0gcGFyc2UoY29sb3IpXG4gIGlmICghY29sb3IpIHJldHVybiBbMjU1LDI1NSwyNTUsMF0gLy8gdHJhbnNwYXJlbnRcbiAgcmV0dXJuIFtcbiAgICBjb2xvci5yLFxuICAgIGNvbG9yLmcsXG4gICAgY29sb3IuYixcbiAgICAoY29sb3IuYSA9PSBudWxsID8gMSA6IGNvbG9yLmEpXG4gIF1cbn1cbiIsIlxudmFyIHR3ZWVuID0gcmVxdWlyZSgnLi9udW1iZXInKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGZyb20sIHRvKXtcbiAgdmFyIGZyYW1lID0gdHdlZW4oZnJvbSwgdG8pXG4gIHJldHVybiBmdW5jdGlvbihuKXtcbiAgICByZXR1cm4gZnJhbWUobikudG9GaXhlZCgxKSArICdweCdcbiAgfVxufVxuIiwiXG4vKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxudmFyIGNvbG9ycyA9IHJlcXVpcmUoJy4vY29sb3JzJyk7XG5cbi8qKlxuICogRXhwb3NlIGBwYXJzZWAuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBwYXJzZTtcblxuLyoqXG4gKiBQYXJzZSBgc3RyYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIHBhcnNlKHN0cikge1xuICByZXR1cm4gbmFtZWQoc3RyKVxuICAgIHx8IGhleDMoc3RyKVxuICAgIHx8IGhleDYoc3RyKVxuICAgIHx8IHJnYihzdHIpXG4gICAgfHwgcmdiYShzdHIpO1xufVxuXG4vKipcbiAqIFBhcnNlIG5hbWVkIGNzcyBjb2xvciBgc3RyYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBuYW1lZChzdHIpIHtcbiAgdmFyIGMgPSBjb2xvcnNbc3RyLnRvTG93ZXJDYXNlKCldO1xuICBpZiAoIWMpIHJldHVybjtcbiAgcmV0dXJuIHtcbiAgICByOiBjWzBdLFxuICAgIGc6IGNbMV0sXG4gICAgYjogY1syXVxuICB9XG59XG5cbi8qKlxuICogUGFyc2UgcmdiKG4sIG4sIG4pXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gcmdiKHN0cikge1xuICBpZiAoMCA9PSBzdHIuaW5kZXhPZigncmdiKCcpKSB7XG4gICAgc3RyID0gc3RyLm1hdGNoKC9yZ2JcXCgoW14pXSspXFwpLylbMV07XG4gICAgdmFyIHBhcnRzID0gc3RyLnNwbGl0KC8gKiwgKi8pLm1hcChOdW1iZXIpO1xuICAgIHJldHVybiB7XG4gICAgICByOiBwYXJ0c1swXSxcbiAgICAgIGc6IHBhcnRzWzFdLFxuICAgICAgYjogcGFydHNbMl0sXG4gICAgICBhOiAxXG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogUGFyc2UgcmdiYShuLCBuLCBuLCBuKVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHJnYmEoc3RyKSB7XG4gIGlmICgwID09IHN0ci5pbmRleE9mKCdyZ2JhKCcpKSB7XG4gICAgc3RyID0gc3RyLm1hdGNoKC9yZ2JhXFwoKFteKV0rKVxcKS8pWzFdO1xuICAgIHZhciBwYXJ0cyA9IHN0ci5zcGxpdCgvICosICovKS5tYXAoTnVtYmVyKTtcbiAgICByZXR1cm4ge1xuICAgICAgcjogcGFydHNbMF0sXG4gICAgICBnOiBwYXJ0c1sxXSxcbiAgICAgIGI6IHBhcnRzWzJdLFxuICAgICAgYTogcGFydHNbM11cbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBQYXJzZSAjbm5ubm5uXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gaGV4NihzdHIpIHtcbiAgaWYgKCcjJyA9PSBzdHJbMF0gJiYgNyA9PSBzdHIubGVuZ3RoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHI6IHBhcnNlSW50KHN0ci5zbGljZSgxLCAzKSwgMTYpLFxuICAgICAgZzogcGFyc2VJbnQoc3RyLnNsaWNlKDMsIDUpLCAxNiksXG4gICAgICBiOiBwYXJzZUludChzdHIuc2xpY2UoNSwgNyksIDE2KSxcbiAgICAgIGE6IDFcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBQYXJzZSAjbm5uXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gaGV4MyhzdHIpIHtcbiAgaWYgKCcjJyA9PSBzdHJbMF0gJiYgNCA9PSBzdHIubGVuZ3RoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHI6IHBhcnNlSW50KHN0clsxXSArIHN0clsxXSwgMTYpLFxuICAgICAgZzogcGFyc2VJbnQoc3RyWzJdICsgc3RyWzJdLCAxNiksXG4gICAgICBiOiBwYXJzZUludChzdHJbM10gKyBzdHJbM10sIDE2KSxcbiAgICAgIGE6IDFcbiAgICB9XG4gIH1cbn1cblxuIiwiXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGEsIGIpe1xuICB2YXIgZm4gPSBmdW5jdGlvbigpe307XG4gIGZuLnByb3RvdHlwZSA9IGIucHJvdG90eXBlO1xuICBhLnByb3RvdHlwZSA9IG5ldyBmbjtcbiAgYS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBhO1xufTsiLCJcbi8qKlxuICogbWVyZ2UgYGJgJ3MgcHJvcGVydGllcyB3aXRoIGBhYCdzLlxuICpcbiAqIGV4YW1wbGU6XG4gKlxuICogICAgICAgIHZhciB1c2VyID0ge307XG4gKiAgICAgICAgbWVyZ2UodXNlciwgY29uc29sZSk7XG4gKiAgICAgICAgLy8gPiB7IGxvZzogZm4sIGRpcjogZm4gLi59XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGFcbiAqIEBwYXJhbSB7T2JqZWN0fSBiXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoYSwgYikge1xuICBmb3IgKHZhciBrIGluIGIpIGFba10gPSBiW2tdO1xuICByZXR1cm4gYTtcbn07XG4iLCJcbi8qKlxuICogbWVyZ2UgYGJgJ3MgcHJvcGVydGllcyB3aXRoIGBhYCdzLlxuICpcbiAqIGV4YW1wbGU6XG4gKlxuICogICAgICAgIHZhciB1c2VyID0ge307XG4gKiAgICAgICAgbWVyZ2UodXNlciwgY29uc29sZSk7XG4gKiAgICAgICAgLy8gPiB7IGxvZzogZm4sIGRpcjogZm4gLi59XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGFcbiAqIEBwYXJhbSB7T2JqZWN0fSBiXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoYSwgYikge1xuICBmb3IgKHZhciBrIGluIGIpIGFba10gPSBiW2tdO1xuICByZXR1cm4gYTtcbn07XG4iLCJcbi8qKlxuICogRXhwb3NlIGBkZWJ1ZygpYCBhcyB0aGUgbW9kdWxlLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZGVidWc7XG5cbi8qKlxuICogQ3JlYXRlIGEgZGVidWdnZXIgd2l0aCB0aGUgZ2l2ZW4gYG5hbWVgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gKiBAcmV0dXJuIHtUeXBlfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBkZWJ1ZyhuYW1lKSB7XG4gIGlmICghZGVidWcuZW5hYmxlZChuYW1lKSkgcmV0dXJuIGZ1bmN0aW9uKCl7fTtcblxuICByZXR1cm4gZnVuY3Rpb24oZm10KXtcbiAgICBmbXQgPSBjb2VyY2UoZm10KTtcblxuICAgIHZhciBjdXJyID0gbmV3IERhdGU7XG4gICAgdmFyIG1zID0gY3VyciAtIChkZWJ1Z1tuYW1lXSB8fCBjdXJyKTtcbiAgICBkZWJ1Z1tuYW1lXSA9IGN1cnI7XG5cbiAgICBmbXQgPSBuYW1lXG4gICAgICArICcgJ1xuICAgICAgKyBmbXRcbiAgICAgICsgJyArJyArIGRlYnVnLmh1bWFuaXplKG1zKTtcblxuICAgIC8vIFRoaXMgaGFja2VyeSBpcyByZXF1aXJlZCBmb3IgSUU4XG4gICAgLy8gd2hlcmUgYGNvbnNvbGUubG9nYCBkb2Vzbid0IGhhdmUgJ2FwcGx5J1xuICAgIHdpbmRvdy5jb25zb2xlXG4gICAgICAmJiBjb25zb2xlLmxvZ1xuICAgICAgJiYgRnVuY3Rpb24ucHJvdG90eXBlLmFwcGx5LmNhbGwoY29uc29sZS5sb2csIGNvbnNvbGUsIGFyZ3VtZW50cyk7XG4gIH1cbn1cblxuLyoqXG4gKiBUaGUgY3VycmVudGx5IGFjdGl2ZSBkZWJ1ZyBtb2RlIG5hbWVzLlxuICovXG5cbmRlYnVnLm5hbWVzID0gW107XG5kZWJ1Zy5za2lwcyA9IFtdO1xuXG4vKipcbiAqIEVuYWJsZXMgYSBkZWJ1ZyBtb2RlIGJ5IG5hbWUuIFRoaXMgY2FuIGluY2x1ZGUgbW9kZXNcbiAqIHNlcGFyYXRlZCBieSBhIGNvbG9uIGFuZCB3aWxkY2FyZHMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZGVidWcuZW5hYmxlID0gZnVuY3Rpb24obmFtZSkge1xuICB0cnkge1xuICAgIGxvY2FsU3RvcmFnZS5kZWJ1ZyA9IG5hbWU7XG4gIH0gY2F0Y2goZSl7fVxuXG4gIHZhciBzcGxpdCA9IChuYW1lIHx8ICcnKS5zcGxpdCgvW1xccyxdKy8pXG4gICAgLCBsZW4gPSBzcGxpdC5sZW5ndGg7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgIG5hbWUgPSBzcGxpdFtpXS5yZXBsYWNlKCcqJywgJy4qPycpO1xuICAgIGlmIChuYW1lWzBdID09PSAnLScpIHtcbiAgICAgIGRlYnVnLnNraXBzLnB1c2gobmV3IFJlZ0V4cCgnXicgKyBuYW1lLnN1YnN0cigxKSArICckJykpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGRlYnVnLm5hbWVzLnB1c2gobmV3IFJlZ0V4cCgnXicgKyBuYW1lICsgJyQnKSk7XG4gICAgfVxuICB9XG59O1xuXG4vKipcbiAqIERpc2FibGUgZGVidWcgb3V0cHV0LlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZGVidWcuZGlzYWJsZSA9IGZ1bmN0aW9uKCl7XG4gIGRlYnVnLmVuYWJsZSgnJyk7XG59O1xuXG4vKipcbiAqIEh1bWFuaXplIHRoZSBnaXZlbiBgbXNgLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBtXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5kZWJ1Zy5odW1hbml6ZSA9IGZ1bmN0aW9uKG1zKSB7XG4gIHZhciBzZWMgPSAxMDAwXG4gICAgLCBtaW4gPSA2MCAqIDEwMDBcbiAgICAsIGhvdXIgPSA2MCAqIG1pbjtcblxuICBpZiAobXMgPj0gaG91cikgcmV0dXJuIChtcyAvIGhvdXIpLnRvRml4ZWQoMSkgKyAnaCc7XG4gIGlmIChtcyA+PSBtaW4pIHJldHVybiAobXMgLyBtaW4pLnRvRml4ZWQoMSkgKyAnbSc7XG4gIGlmIChtcyA+PSBzZWMpIHJldHVybiAobXMgLyBzZWMgfCAwKSArICdzJztcbiAgcmV0dXJuIG1zICsgJ21zJztcbn07XG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIHRoZSBnaXZlbiBtb2RlIG5hbWUgaXMgZW5hYmxlZCwgZmFsc2Ugb3RoZXJ3aXNlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5kZWJ1Zy5lbmFibGVkID0gZnVuY3Rpb24obmFtZSkge1xuICBmb3IgKHZhciBpID0gMCwgbGVuID0gZGVidWcuc2tpcHMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICBpZiAoZGVidWcuc2tpcHNbaV0udGVzdChuYW1lKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICBmb3IgKHZhciBpID0gMCwgbGVuID0gZGVidWcubmFtZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICBpZiAoZGVidWcubmFtZXNbaV0udGVzdChuYW1lKSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn07XG5cbi8qKlxuICogQ29lcmNlIGB2YWxgLlxuICovXG5cbmZ1bmN0aW9uIGNvZXJjZSh2YWwpIHtcbiAgaWYgKHZhbCBpbnN0YW5jZW9mIEVycm9yKSByZXR1cm4gdmFsLnN0YWNrIHx8IHZhbC5tZXNzYWdlO1xuICByZXR1cm4gdmFsO1xufVxuXG4vLyBwZXJzaXN0XG5cbnRyeSB7XG4gIGlmICh3aW5kb3cubG9jYWxTdG9yYWdlKSBkZWJ1Zy5lbmFibGUobG9jYWxTdG9yYWdlLmRlYnVnKTtcbn0gY2F0Y2goZSl7fVxuIiwiLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICovXG5cbnZhciB0dHkgPSByZXF1aXJlKCd0dHknKTtcblxuLyoqXG4gKiBFeHBvc2UgYGRlYnVnKClgIGFzIHRoZSBtb2R1bGUuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBkZWJ1ZztcblxuLyoqXG4gKiBFbmFibGVkIGRlYnVnZ2Vycy5cbiAqL1xuXG52YXIgbmFtZXMgPSBbXVxuICAsIHNraXBzID0gW107XG5cbihwcm9jZXNzLmVudi5ERUJVRyB8fCAnJylcbiAgLnNwbGl0KC9bXFxzLF0rLylcbiAgLmZvckVhY2goZnVuY3Rpb24obmFtZSl7XG4gICAgbmFtZSA9IG5hbWUucmVwbGFjZSgnKicsICcuKj8nKTtcbiAgICBpZiAobmFtZVswXSA9PT0gJy0nKSB7XG4gICAgICBza2lwcy5wdXNoKG5ldyBSZWdFeHAoJ14nICsgbmFtZS5zdWJzdHIoMSkgKyAnJCcpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbmFtZXMucHVzaChuZXcgUmVnRXhwKCdeJyArIG5hbWUgKyAnJCcpKTtcbiAgICB9XG4gIH0pO1xuXG4vKipcbiAqIENvbG9ycy5cbiAqL1xuXG52YXIgY29sb3JzID0gWzYsIDIsIDMsIDQsIDUsIDFdO1xuXG4vKipcbiAqIFByZXZpb3VzIGRlYnVnKCkgY2FsbC5cbiAqL1xuXG52YXIgcHJldiA9IHt9O1xuXG4vKipcbiAqIFByZXZpb3VzbHkgYXNzaWduZWQgY29sb3IuXG4gKi9cblxudmFyIHByZXZDb2xvciA9IDA7XG5cbi8qKlxuICogSXMgc3Rkb3V0IGEgVFRZPyBDb2xvcmVkIG91dHB1dCBpcyBkaXNhYmxlZCB3aGVuIGB0cnVlYC5cbiAqL1xuXG52YXIgaXNhdHR5ID0gdHR5LmlzYXR0eSgyKTtcblxuLyoqXG4gKiBTZWxlY3QgYSBjb2xvci5cbiAqXG4gKiBAcmV0dXJuIHtOdW1iZXJ9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBjb2xvcigpIHtcbiAgcmV0dXJuIGNvbG9yc1twcmV2Q29sb3IrKyAlIGNvbG9ycy5sZW5ndGhdO1xufVxuXG4vKipcbiAqIEh1bWFuaXplIHRoZSBnaXZlbiBgbXNgLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBtXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBodW1hbml6ZShtcykge1xuICB2YXIgc2VjID0gMTAwMFxuICAgICwgbWluID0gNjAgKiAxMDAwXG4gICAgLCBob3VyID0gNjAgKiBtaW47XG5cbiAgaWYgKG1zID49IGhvdXIpIHJldHVybiAobXMgLyBob3VyKS50b0ZpeGVkKDEpICsgJ2gnO1xuICBpZiAobXMgPj0gbWluKSByZXR1cm4gKG1zIC8gbWluKS50b0ZpeGVkKDEpICsgJ20nO1xuICBpZiAobXMgPj0gc2VjKSByZXR1cm4gKG1zIC8gc2VjIHwgMCkgKyAncyc7XG4gIHJldHVybiBtcyArICdtcyc7XG59XG5cbi8qKlxuICogQ3JlYXRlIGEgZGVidWdnZXIgd2l0aCB0aGUgZ2l2ZW4gYG5hbWVgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gKiBAcmV0dXJuIHtUeXBlfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBkZWJ1ZyhuYW1lKSB7XG4gIGZ1bmN0aW9uIGRpc2FibGVkKCl7fVxuICBkaXNhYmxlZC5lbmFibGVkID0gZmFsc2U7XG5cbiAgdmFyIG1hdGNoID0gc2tpcHMuc29tZShmdW5jdGlvbihyZSl7XG4gICAgcmV0dXJuIHJlLnRlc3QobmFtZSk7XG4gIH0pO1xuXG4gIGlmIChtYXRjaCkgcmV0dXJuIGRpc2FibGVkO1xuXG4gIG1hdGNoID0gbmFtZXMuc29tZShmdW5jdGlvbihyZSl7XG4gICAgcmV0dXJuIHJlLnRlc3QobmFtZSk7XG4gIH0pO1xuXG4gIGlmICghbWF0Y2gpIHJldHVybiBkaXNhYmxlZDtcbiAgdmFyIGMgPSBjb2xvcigpO1xuXG4gIGZ1bmN0aW9uIGNvbG9yZWQoZm10KSB7XG4gICAgZm10ID0gY29lcmNlKGZtdCk7XG5cbiAgICB2YXIgY3VyciA9IG5ldyBEYXRlO1xuICAgIHZhciBtcyA9IGN1cnIgLSAocHJldltuYW1lXSB8fCBjdXJyKTtcbiAgICBwcmV2W25hbWVdID0gY3VycjtcblxuICAgIGZtdCA9ICcgIFxcdTAwMWJbOScgKyBjICsgJ20nICsgbmFtZSArICcgJ1xuICAgICAgKyAnXFx1MDAxYlszJyArIGMgKyAnbVxcdTAwMWJbOTBtJ1xuICAgICAgKyBmbXQgKyAnXFx1MDAxYlszJyArIGMgKyAnbSdcbiAgICAgICsgJyArJyArIGh1bWFuaXplKG1zKSArICdcXHUwMDFiWzBtJztcblxuICAgIGNvbnNvbGUuZXJyb3IuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHBsYWluKGZtdCkge1xuICAgIGZtdCA9IGNvZXJjZShmbXQpO1xuXG4gICAgZm10ID0gbmV3IERhdGUoKS50b1VUQ1N0cmluZygpXG4gICAgICArICcgJyArIG5hbWUgKyAnICcgKyBmbXQ7XG4gICAgY29uc29sZS5lcnJvci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG5cbiAgY29sb3JlZC5lbmFibGVkID0gcGxhaW4uZW5hYmxlZCA9IHRydWU7XG5cbiAgcmV0dXJuIGlzYXR0eSB8fCBwcm9jZXNzLmVudi5ERUJVR19DT0xPUlNcbiAgICA/IGNvbG9yZWRcbiAgICA6IHBsYWluO1xufVxuXG4vKipcbiAqIENvZXJjZSBgdmFsYC5cbiAqL1xuXG5mdW5jdGlvbiBjb2VyY2UodmFsKSB7XG4gIGlmICh2YWwgaW5zdGFuY2VvZiBFcnJvcikgcmV0dXJuIHZhbC5zdGFjayB8fCB2YWwubWVzc2FnZTtcbiAgcmV0dXJuIHZhbDtcbn1cbiIsIi8qKlxuICogTW9kdWxlIERlcGVuZGVuY2llc1xuICovXG5cbnZhciBkZWJ1ZyA9IHJlcXVpcmUoJ2RlYnVnJykoJ2Nzczpjb21wdXRlZCcpO1xudmFyIHdpdGhpbkRvY3VtZW50ID0gcmVxdWlyZSgnd2l0aGluLWRvY3VtZW50Jyk7XG52YXIgc3R5bGVzID0gcmVxdWlyZSgnLi9zdHlsZXMnKTtcblxuLyoqXG4gKiBFeHBvc2UgYGNvbXB1dGVkYFxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gY29tcHV0ZWQ7XG5cbi8qKlxuICogR2V0IHRoZSBjb21wdXRlZCBzdHlsZVxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7U3RyaW5nfSBwcm9wXG4gKiBAcGFyYW0ge0FycmF5fSBwcmVjb21wdXRlZCAob3B0aW9uYWwpXG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGNvbXB1dGVkKGVsLCBwcm9wLCBwcmVjb21wdXRlZCkge1xuICBjb21wdXRlZCA9IHByZWNvbXB1dGVkIHx8IHN0eWxlcyhlbCk7XG4gIGlmICghY29tcHV0ZWQpIHJldHVybjtcblxuICB2YXIgcmV0ID0gY29tcHV0ZWQuZ2V0UHJvcGVydHlWYWx1ZShwcm9wKSB8fCBjb21wdXRlZFtwcm9wXTtcblxuICBpZiAoJycgPT09IHJldCAmJiAhd2l0aGluRG9jdW1lbnQoZWwpKSB7XG4gICAgZGVidWcoJ2VsZW1lbnQgbm90IHdpdGhpbiBkb2N1bWVudCwgdHJ5IGZpbmRpbmcgZnJvbSBzdHlsZSBhdHRyaWJ1dGUnKTtcbiAgICB2YXIgc3R5bGUgPSByZXF1aXJlKCcuL3N0eWxlJyk7XG4gICAgcmV0ID0gc3R5bGUoZWwsIHByb3ApO1xuICB9XG5cbiAgZGVidWcoJ2NvbXB1dGVkIHZhbHVlIG9mICVzOiAlcycsIHByb3AsIHJldCk7XG5cbiAgLy8gU3VwcG9ydDogSUVcbiAgLy8gSUUgcmV0dXJucyB6SW5kZXggdmFsdWUgYXMgYW4gaW50ZWdlci5cbiAgcmV0dXJuIHVuZGVmaW5lZCA9PT0gcmV0ID8gcmV0IDogcmV0ICsgJyc7XG59XG4iLCIvKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXNcbiAqL1xuXG52YXIgZGVidWcgPSByZXF1aXJlKCdkZWJ1ZycpKCdjc3M6cHJvcCcpO1xudmFyIGNhbWVsY2FzZSA9IHJlcXVpcmUoJ3RvLWNhbWVsLWNhc2UnKTtcbnZhciB2ZW5kb3IgPSByZXF1aXJlKCcuL3ZlbmRvcicpO1xuXG4vKipcbiAqIEV4cG9ydCBgcHJvcGBcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHByb3A7XG5cbi8qKlxuICogTm9ybWFsaXplIFByb3BlcnRpZXNcbiAqL1xuXG52YXIgY3NzUHJvcHMgPSB7XG4gICdmbG9hdCc6ICdjc3NGbG9hdCdcbn07XG5cbi8qKlxuICogR2V0IHRoZSB2ZW5kb3IgcHJlZml4ZWQgcHJvcGVydHlcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gcHJvcFxuICogQHBhcmFtIHtTdHJpbmd9IHN0eWxlXG4gKiBAcmV0dXJuIHtTdHJpbmd9IHByb3BcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHByb3AocHJvcCwgc3R5bGUpIHtcbiAgcHJvcCA9IGNzc1Byb3BzW3Byb3BdIHx8IChjc3NQcm9wc1twcm9wXSA9IHZlbmRvcihwcm9wLCBzdHlsZSkpO1xuICBkZWJ1ZygndHJhbnNmb3JtIHByb3BlcnR5OiAlcyA9PiAlcycpO1xuICByZXR1cm4gcHJvcDtcbn1cbiIsIi8qKlxuICogTW9kdWxlIERlcGVuZGVuY2llc1xuICovXG5cbnZhciBjc3MgPSByZXF1aXJlKCcuL2NzcycpO1xudmFyIGNzc1Nob3cgPSB7IHBvc2l0aW9uOiAnYWJzb2x1dGUnLCB2aXNpYmlsaXR5OiAnaGlkZGVuJywgZGlzcGxheTogJ2Jsb2NrJyB9O1xudmFyIHBudW0gPSAoL1srLV0/KD86XFxkKlxcLnwpXFxkKyg/OltlRV1bKy1dP1xcZCt8KS8pLnNvdXJjZTtcbnZhciBybnVtbm9ucHggPSBuZXcgUmVnRXhwKCAnXignICsgcG51bSArICcpKD8hcHgpW2EteiVdKyQnLCAnaScpO1xudmFyIHJudW1zcGxpdCA9IG5ldyBSZWdFeHAoICdeKCcgKyBwbnVtICsgJykoLiopJCcsICdpJyk7XG52YXIgcmRpc3BsYXlzd2FwID0gL14obm9uZXx0YWJsZSg/IS1jW2VhXSkuKykvO1xudmFyIHN0eWxlcyA9IHJlcXVpcmUoJy4vc3R5bGVzJyk7XG52YXIgc3VwcG9ydCA9IHJlcXVpcmUoJy4vc3VwcG9ydCcpO1xudmFyIHN3YXAgPSByZXF1aXJlKCcuL3N3YXAnKTtcbnZhciBjb21wdXRlZCA9IHJlcXVpcmUoJy4vY29tcHV0ZWQnKTtcbnZhciBjc3NFeHBhbmQgPSBbIFwiVG9wXCIsIFwiUmlnaHRcIiwgXCJCb3R0b21cIiwgXCJMZWZ0XCIgXTtcblxuLyoqXG4gKiBIZWlnaHQgJiBXaWR0aFxuICovXG5cblsnd2lkdGgnLCAnaGVpZ2h0J10uZm9yRWFjaChmdW5jdGlvbihuYW1lKSB7XG4gIGV4cG9ydHNbbmFtZV0gPSB7fTtcblxuICBleHBvcnRzW25hbWVdLmdldCA9IGZ1bmN0aW9uKGVsLCBjb21wdXRlLCBleHRyYSkge1xuICAgIGlmICghY29tcHV0ZSkgcmV0dXJuO1xuICAgIC8vIGNlcnRhaW4gZWxlbWVudHMgY2FuIGhhdmUgZGltZW5zaW9uIGluZm8gaWYgd2UgaW52aXNpYmx5IHNob3cgdGhlbVxuICAgIC8vIGhvd2V2ZXIsIGl0IG11c3QgaGF2ZSBhIGN1cnJlbnQgZGlzcGxheSBzdHlsZSB0aGF0IHdvdWxkIGJlbmVmaXQgZnJvbSB0aGlzXG4gICAgcmV0dXJuIDAgPT0gZWwub2Zmc2V0V2lkdGggJiYgcmRpc3BsYXlzd2FwLnRlc3QoY3NzKGVsLCAnZGlzcGxheScpKVxuICAgICAgPyBzd2FwKGVsLCBjc3NTaG93LCBmdW5jdGlvbigpIHsgcmV0dXJuIGdldFdpZHRoT3JIZWlnaHQoZWwsIG5hbWUsIGV4dHJhKTsgfSlcbiAgICAgIDogZ2V0V2lkdGhPckhlaWdodChlbCwgbmFtZSwgZXh0cmEpO1xuICB9XG5cbiAgZXhwb3J0c1tuYW1lXS5zZXQgPSBmdW5jdGlvbihlbCwgdmFsLCBleHRyYSkge1xuICAgIHZhciBzdHlsZXMgPSBleHRyYSAmJiBzdHlsZXMoZWwpO1xuICAgIHJldHVybiBzZXRQb3NpdGl2ZU51bWJlcihlbCwgdmFsLCBleHRyYVxuICAgICAgPyBhdWdtZW50V2lkdGhPckhlaWdodChlbCwgbmFtZSwgZXh0cmEsICdib3JkZXItYm94JyA9PSBjc3MoZWwsICdib3hTaXppbmcnLCBmYWxzZSwgc3R5bGVzKSwgc3R5bGVzKVxuICAgICAgOiAwXG4gICAgKTtcbiAgfTtcblxufSk7XG5cbi8qKlxuICogT3BhY2l0eVxuICovXG5cbmV4cG9ydHMub3BhY2l0eSA9IHt9O1xuZXhwb3J0cy5vcGFjaXR5LmdldCA9IGZ1bmN0aW9uKGVsLCBjb21wdXRlKSB7XG4gIGlmICghY29tcHV0ZSkgcmV0dXJuO1xuICB2YXIgcmV0ID0gY29tcHV0ZWQoZWwsICdvcGFjaXR5Jyk7XG4gIHJldHVybiAnJyA9PSByZXQgPyAnMScgOiByZXQ7XG59XG5cbi8qKlxuICogVXRpbGl0eTogU2V0IFBvc2l0aXZlIE51bWJlclxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7TWl4ZWR9IHZhbFxuICogQHBhcmFtIHtOdW1iZXJ9IHN1YnRyYWN0XG4gKiBAcmV0dXJuIHtOdW1iZXJ9XG4gKi9cblxuZnVuY3Rpb24gc2V0UG9zaXRpdmVOdW1iZXIoZWwsIHZhbCwgc3VidHJhY3QpIHtcbiAgdmFyIG1hdGNoZXMgPSBybnVtc3BsaXQuZXhlYyh2YWwpO1xuICByZXR1cm4gbWF0Y2hlcyA/XG4gICAgLy8gR3VhcmQgYWdhaW5zdCB1bmRlZmluZWQgJ3N1YnRyYWN0JywgZS5nLiwgd2hlbiB1c2VkIGFzIGluIGNzc0hvb2tzXG4gICAgTWF0aC5tYXgoMCwgbWF0Y2hlc1sxXSkgKyAobWF0Y2hlc1syXSB8fCAncHgnKSA6XG4gICAgdmFsO1xufVxuXG4vKipcbiAqIFV0aWxpdHk6IEdldCB0aGUgd2lkdGggb3IgaGVpZ2h0XG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbFxuICogQHBhcmFtIHtTdHJpbmd9IHByb3BcbiAqIEBwYXJhbSB7TWl4ZWR9IGV4dHJhXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cblxuZnVuY3Rpb24gZ2V0V2lkdGhPckhlaWdodChlbCwgcHJvcCwgZXh0cmEpIHtcbiAgLy8gU3RhcnQgd2l0aCBvZmZzZXQgcHJvcGVydHksIHdoaWNoIGlzIGVxdWl2YWxlbnQgdG8gdGhlIGJvcmRlci1ib3ggdmFsdWVcbiAgdmFyIHZhbHVlSXNCb3JkZXJCb3ggPSB0cnVlO1xuICB2YXIgdmFsID0gcHJvcCA9PT0gJ3dpZHRoJyA/IGVsLm9mZnNldFdpZHRoIDogZWwub2Zmc2V0SGVpZ2h0O1xuICB2YXIgc3R5bGVzID0gY29tcHV0ZWQoZWwpO1xuICB2YXIgaXNCb3JkZXJCb3ggPSBzdXBwb3J0LmJveFNpemluZyAmJiBjc3MoZWwsICdib3hTaXppbmcnKSA9PT0gJ2JvcmRlci1ib3gnO1xuXG4gIC8vIHNvbWUgbm9uLWh0bWwgZWxlbWVudHMgcmV0dXJuIHVuZGVmaW5lZCBmb3Igb2Zmc2V0V2lkdGgsIHNvIGNoZWNrIGZvciBudWxsL3VuZGVmaW5lZFxuICAvLyBzdmcgLSBodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD02NDkyODVcbiAgLy8gTWF0aE1MIC0gaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9NDkxNjY4XG4gIGlmICh2YWwgPD0gMCB8fCB2YWwgPT0gbnVsbCkge1xuICAgIC8vIEZhbGwgYmFjayB0byBjb21wdXRlZCB0aGVuIHVuY29tcHV0ZWQgY3NzIGlmIG5lY2Vzc2FyeVxuICAgIHZhbCA9IGNvbXB1dGVkKGVsLCBwcm9wLCBzdHlsZXMpO1xuXG4gICAgaWYgKHZhbCA8IDAgfHwgdmFsID09IG51bGwpIHtcbiAgICAgIHZhbCA9IGVsLnN0eWxlW3Byb3BdO1xuICAgIH1cblxuICAgIC8vIENvbXB1dGVkIHVuaXQgaXMgbm90IHBpeGVscy4gU3RvcCBoZXJlIGFuZCByZXR1cm4uXG4gICAgaWYgKHJudW1ub25weC50ZXN0KHZhbCkpIHtcbiAgICAgIHJldHVybiB2YWw7XG4gICAgfVxuXG4gICAgLy8gd2UgbmVlZCB0aGUgY2hlY2sgZm9yIHN0eWxlIGluIGNhc2UgYSBicm93c2VyIHdoaWNoIHJldHVybnMgdW5yZWxpYWJsZSB2YWx1ZXNcbiAgICAvLyBmb3IgZ2V0Q29tcHV0ZWRTdHlsZSBzaWxlbnRseSBmYWxscyBiYWNrIHRvIHRoZSByZWxpYWJsZSBlbC5zdHlsZVxuICAgIHZhbHVlSXNCb3JkZXJCb3ggPSBpc0JvcmRlckJveCAmJiAoc3VwcG9ydC5ib3hTaXppbmdSZWxpYWJsZSgpIHx8IHZhbCA9PT0gZWwuc3R5bGVbcHJvcF0pO1xuXG4gICAgLy8gTm9ybWFsaXplICcsIGF1dG8sIGFuZCBwcmVwYXJlIGZvciBleHRyYVxuICAgIHZhbCA9IHBhcnNlRmxvYXQodmFsKSB8fCAwO1xuICB9XG5cbiAgLy8gdXNlIHRoZSBhY3RpdmUgYm94LXNpemluZyBtb2RlbCB0byBhZGQvc3VidHJhY3QgaXJyZWxldmFudCBzdHlsZXNcbiAgZXh0cmEgPSBleHRyYSB8fCAoaXNCb3JkZXJCb3ggPyAnYm9yZGVyJyA6ICdjb250ZW50Jyk7XG4gIHZhbCArPSBhdWdtZW50V2lkdGhPckhlaWdodChlbCwgcHJvcCwgZXh0cmEsIHZhbHVlSXNCb3JkZXJCb3gsIHN0eWxlcyk7XG4gIHJldHVybiB2YWwgKyAncHgnO1xufVxuXG4vKipcbiAqIFV0aWxpdHk6IEF1Z21lbnQgdGhlIHdpZHRoIG9yIHRoZSBoZWlnaHRcbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gKiBAcGFyYW0ge1N0cmluZ30gcHJvcFxuICogQHBhcmFtIHtNaXhlZH0gZXh0cmFcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gaXNCb3JkZXJCb3hcbiAqIEBwYXJhbSB7QXJyYXl9IHN0eWxlc1xuICovXG5cbmZ1bmN0aW9uIGF1Z21lbnRXaWR0aE9ySGVpZ2h0KGVsLCBwcm9wLCBleHRyYSwgaXNCb3JkZXJCb3gsIHN0eWxlcykge1xuICAvLyBJZiB3ZSBhbHJlYWR5IGhhdmUgdGhlIHJpZ2h0IG1lYXN1cmVtZW50LCBhdm9pZCBhdWdtZW50YXRpb24sXG4gIC8vIE90aGVyd2lzZSBpbml0aWFsaXplIGZvciBob3Jpem9udGFsIG9yIHZlcnRpY2FsIHByb3BlcnRpZXNcbiAgdmFyIGkgPSBleHRyYSA9PT0gKGlzQm9yZGVyQm94ID8gJ2JvcmRlcicgOiAnY29udGVudCcpID8gNCA6ICd3aWR0aCcgPT0gcHJvcCA/IDEgOiAwO1xuICB2YXIgdmFsID0gMDtcblxuICBmb3IgKDsgaSA8IDQ7IGkgKz0gMikge1xuICAgIC8vIGJvdGggYm94IG1vZGVscyBleGNsdWRlIG1hcmdpbiwgc28gYWRkIGl0IGlmIHdlIHdhbnQgaXRcbiAgICBpZiAoZXh0cmEgPT09ICdtYXJnaW4nKSB7XG4gICAgICB2YWwgKz0gY3NzKGVsLCBleHRyYSArIGNzc0V4cGFuZFtpXSwgdHJ1ZSwgc3R5bGVzKTtcbiAgICB9XG5cbiAgICBpZiAoaXNCb3JkZXJCb3gpIHtcbiAgICAgIC8vIGJvcmRlci1ib3ggaW5jbHVkZXMgcGFkZGluZywgc28gcmVtb3ZlIGl0IGlmIHdlIHdhbnQgY29udGVudFxuICAgICAgaWYgKGV4dHJhID09PSAnY29udGVudCcpIHtcbiAgICAgICAgdmFsIC09IGNzcyhlbCwgJ3BhZGRpbmcnICsgY3NzRXhwYW5kW2ldLCB0cnVlLCBzdHlsZXMpO1xuICAgICAgfVxuXG4gICAgICAvLyBhdCB0aGlzIHBvaW50LCBleHRyYSBpc24ndCBib3JkZXIgbm9yIG1hcmdpbiwgc28gcmVtb3ZlIGJvcmRlclxuICAgICAgaWYgKGV4dHJhICE9PSAnbWFyZ2luJykge1xuICAgICAgICB2YWwgLT0gY3NzKGVsLCAnYm9yZGVyJyArIGNzc0V4cGFuZFtpXSArICdXaWR0aCcsIHRydWUsIHN0eWxlcyk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGF0IHRoaXMgcG9pbnQsIGV4dHJhIGlzbid0IGNvbnRlbnQsIHNvIGFkZCBwYWRkaW5nXG4gICAgICB2YWwgKz0gY3NzKGVsLCAncGFkZGluZycgKyBjc3NFeHBhbmRbaV0sIHRydWUsIHN0eWxlcyk7XG5cbiAgICAgIC8vIGF0IHRoaXMgcG9pbnQsIGV4dHJhIGlzbid0IGNvbnRlbnQgbm9yIHBhZGRpbmcsIHNvIGFkZCBib3JkZXJcbiAgICAgIGlmIChleHRyYSAhPT0gJ3BhZGRpbmcnKSB7XG4gICAgICAgIHZhbCArPSBjc3MoZWwsICdib3JkZXInICsgY3NzRXhwYW5kW2ldICsgJ1dpZHRoJywgdHJ1ZSwgc3R5bGVzKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdmFsO1xufVxuIiwiLyoqXG4gKiBTdXBwb3J0IHZhbHVlc1xuICovXG5cbnZhciByZWxpYWJsZU1hcmdpblJpZ2h0O1xudmFyIGJveFNpemluZ1JlbGlhYmxlVmFsO1xudmFyIHBpeGVsUG9zaXRpb25WYWw7XG52YXIgY2xlYXJDbG9uZVN0eWxlO1xuXG4vKipcbiAqIENvbnRhaW5lciBzZXR1cFxuICovXG5cbnZhciBkb2NFbGVtID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xudmFyIGNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xudmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXG4vKipcbiAqIENsZWFyIGNsb25lIHN0eWxlXG4gKi9cblxuZGl2LnN0eWxlLmJhY2tncm91bmRDbGlwID0gJ2NvbnRlbnQtYm94JztcbmRpdi5jbG9uZU5vZGUodHJ1ZSkuc3R5bGUuYmFja2dyb3VuZENsaXAgPSAnJztcbmV4cG9ydHMuY2xlYXJDbG9uZVN0eWxlID0gZGl2LnN0eWxlLmJhY2tncm91bmRDbGlwID09PSAnY29udGVudC1ib3gnO1xuXG5jb250YWluZXIuc3R5bGUuY3NzVGV4dCA9ICdib3JkZXI6MDt3aWR0aDowO2hlaWdodDowO3Bvc2l0aW9uOmFic29sdXRlO3RvcDowO2xlZnQ6LTk5OTlweDttYXJnaW4tdG9wOjFweCc7XG5jb250YWluZXIuYXBwZW5kQ2hpbGQoZGl2KTtcblxuLyoqXG4gKiBQaXhlbCBwb3NpdGlvblxuICpcbiAqIFdlYmtpdCBidWc6IGh0dHBzOi8vYnVncy53ZWJraXQub3JnL3Nob3dfYnVnLmNnaT9pZD0yOTA4NFxuICogZ2V0Q29tcHV0ZWRTdHlsZSByZXR1cm5zIHBlcmNlbnQgd2hlbiBzcGVjaWZpZWQgZm9yIHRvcC9sZWZ0L2JvdHRvbS9yaWdodFxuICogcmF0aGVyIHRoYW4gbWFrZSB0aGUgY3NzIG1vZHVsZSBkZXBlbmQgb24gdGhlIG9mZnNldCBtb2R1bGUsIHdlIGp1c3QgY2hlY2sgZm9yIGl0IGhlcmVcbiAqL1xuXG5leHBvcnRzLnBpeGVsUG9zaXRpb24gPSBmdW5jdGlvbigpIHtcbiAgaWYgKHVuZGVmaW5lZCA9PSBwaXhlbFBvc2l0aW9uVmFsKSBjb21wdXRlUGl4ZWxQb3NpdGlvbkFuZEJveFNpemluZ1JlbGlhYmxlKCk7XG4gIHJldHVybiBwaXhlbFBvc2l0aW9uVmFsO1xufVxuXG4vKipcbiAqIFJlbGlhYmxlIGJveCBzaXppbmdcbiAqL1xuXG5leHBvcnRzLmJveFNpemluZ1JlbGlhYmxlID0gZnVuY3Rpb24oKSB7XG4gIGlmICh1bmRlZmluZWQgPT0gYm94U2l6aW5nUmVsaWFibGVWYWwpIGNvbXB1dGVQaXhlbFBvc2l0aW9uQW5kQm94U2l6aW5nUmVsaWFibGUoKTtcbiAgcmV0dXJuIGJveFNpemluZ1JlbGlhYmxlVmFsO1xufVxuXG4vKipcbiAqIFJlbGlhYmxlIG1hcmdpbiByaWdodFxuICpcbiAqIFN1cHBvcnQ6IEFuZHJvaWQgMi4zXG4gKiBDaGVjayBpZiBkaXYgd2l0aCBleHBsaWNpdCB3aWR0aCBhbmQgbm8gbWFyZ2luLXJpZ2h0IGluY29ycmVjdGx5XG4gKiBnZXRzIGNvbXB1dGVkIG1hcmdpbi1yaWdodCBiYXNlZCBvbiB3aWR0aCBvZiBjb250YWluZXIuICgjMzMzMylcbiAqIFdlYktpdCBCdWcgMTMzNDMgLSBnZXRDb21wdXRlZFN0eWxlIHJldHVybnMgd3JvbmcgdmFsdWUgZm9yIG1hcmdpbi1yaWdodFxuICogVGhpcyBzdXBwb3J0IGZ1bmN0aW9uIGlzIG9ubHkgZXhlY3V0ZWQgb25jZSBzbyBubyBtZW1vaXppbmcgaXMgbmVlZGVkLlxuICpcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cblxuZXhwb3J0cy5yZWxpYWJsZU1hcmdpblJpZ2h0ID0gZnVuY3Rpb24oKSB7XG4gIHZhciByZXQ7XG4gIHZhciBtYXJnaW5EaXYgPSBkaXYuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiICkpO1xuXG4gIG1hcmdpbkRpdi5zdHlsZS5jc3NUZXh0ID0gZGl2LnN0eWxlLmNzc1RleHQgPSBkaXZSZXNldDtcbiAgbWFyZ2luRGl2LnN0eWxlLm1hcmdpblJpZ2h0ID0gbWFyZ2luRGl2LnN0eWxlLndpZHRoID0gXCIwXCI7XG4gIGRpdi5zdHlsZS53aWR0aCA9IFwiMXB4XCI7XG4gIGRvY0VsZW0uYXBwZW5kQ2hpbGQoY29udGFpbmVyKTtcblxuICByZXQgPSAhcGFyc2VGbG9hdCh3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShtYXJnaW5EaXYsIG51bGwpLm1hcmdpblJpZ2h0KTtcblxuICBkb2NFbGVtLnJlbW92ZUNoaWxkKGNvbnRhaW5lcik7XG5cbiAgLy8gQ2xlYW4gdXAgdGhlIGRpdiBmb3Igb3RoZXIgc3VwcG9ydCB0ZXN0cy5cbiAgZGl2LmlubmVySFRNTCA9IFwiXCI7XG5cbiAgcmV0dXJuIHJldDtcbn1cblxuLyoqXG4gKiBFeGVjdXRpbmcgYm90aCBwaXhlbFBvc2l0aW9uICYgYm94U2l6aW5nUmVsaWFibGUgdGVzdHMgcmVxdWlyZSBvbmx5IG9uZSBsYXlvdXRcbiAqIHNvIHRoZXkncmUgZXhlY3V0ZWQgYXQgdGhlIHNhbWUgdGltZSB0byBzYXZlIHRoZSBzZWNvbmQgY29tcHV0YXRpb24uXG4gKi9cblxuZnVuY3Rpb24gY29tcHV0ZVBpeGVsUG9zaXRpb25BbmRCb3hTaXppbmdSZWxpYWJsZSgpIHtcbiAgLy8gU3VwcG9ydDogRmlyZWZveCwgQW5kcm9pZCAyLjMgKFByZWZpeGVkIGJveC1zaXppbmcgdmVyc2lvbnMpLlxuICBkaXYuc3R5bGUuY3NzVGV4dCA9IFwiLXdlYmtpdC1ib3gtc2l6aW5nOmJvcmRlci1ib3g7LW1vei1ib3gtc2l6aW5nOmJvcmRlci1ib3g7XCIgK1xuICAgIFwiYm94LXNpemluZzpib3JkZXItYm94O3BhZGRpbmc6MXB4O2JvcmRlcjoxcHg7ZGlzcGxheTpibG9jazt3aWR0aDo0cHg7bWFyZ2luLXRvcDoxJTtcIiArXG4gICAgXCJwb3NpdGlvbjphYnNvbHV0ZTt0b3A6MSVcIjtcbiAgZG9jRWxlbS5hcHBlbmRDaGlsZChjb250YWluZXIpO1xuXG4gIHZhciBkaXZTdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGRpdiwgbnVsbCk7XG4gIHBpeGVsUG9zaXRpb25WYWwgPSBkaXZTdHlsZS50b3AgIT09IFwiMSVcIjtcbiAgYm94U2l6aW5nUmVsaWFibGVWYWwgPSBkaXZTdHlsZS53aWR0aCA9PT0gXCI0cHhcIjtcblxuICBkb2NFbGVtLnJlbW92ZUNoaWxkKGNvbnRhaW5lcik7XG59XG5cblxuIiwiXG52YXIgdG9TcGFjZSA9IHJlcXVpcmUoJ3RvLXNwYWNlLWNhc2UnKTtcblxuXG4vKipcbiAqIEV4cG9zZSBgdG9DYW1lbENhc2VgLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gdG9DYW1lbENhc2U7XG5cblxuLyoqXG4gKiBDb252ZXJ0IGEgYHN0cmluZ2AgdG8gY2FtZWwgY2FzZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyaW5nXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cblxuXG5mdW5jdGlvbiB0b0NhbWVsQ2FzZSAoc3RyaW5nKSB7XG4gIHJldHVybiB0b1NwYWNlKHN0cmluZykucmVwbGFjZSgvXFxzKFxcdykvZywgZnVuY3Rpb24gKG1hdGNoZXMsIGxldHRlcikge1xuICAgIHJldHVybiBsZXR0ZXIudG9VcHBlckNhc2UoKTtcbiAgfSk7XG59IiwiXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBhbGljZWJsdWU6IFsyNDAsIDI0OCwgMjU1XVxuICAsIGFudGlxdWV3aGl0ZTogWzI1MCwgMjM1LCAyMTVdXG4gICwgYXF1YTogWzAsIDI1NSwgMjU1XVxuICAsIGFxdWFtYXJpbmU6IFsxMjcsIDI1NSwgMjEyXVxuICAsIGF6dXJlOiBbMjQwLCAyNTUsIDI1NV1cbiAgLCBiZWlnZTogWzI0NSwgMjQ1LCAyMjBdXG4gICwgYmlzcXVlOiBbMjU1LCAyMjgsIDE5Nl1cbiAgLCBibGFjazogWzAsIDAsIDBdXG4gICwgYmxhbmNoZWRhbG1vbmQ6IFsyNTUsIDIzNSwgMjA1XVxuICAsIGJsdWU6IFswLCAwLCAyNTVdXG4gICwgYmx1ZXZpb2xldDogWzEzOCwgNDMsIDIyNl1cbiAgLCBicm93bjogWzE2NSwgNDIsIDQyXVxuICAsIGJ1cmx5d29vZDogWzIyMiwgMTg0LCAxMzVdXG4gICwgY2FkZXRibHVlOiBbOTUsIDE1OCwgMTYwXVxuICAsIGNoYXJ0cmV1c2U6IFsxMjcsIDI1NSwgMF1cbiAgLCBjaG9jb2xhdGU6IFsyMTAsIDEwNSwgMzBdXG4gICwgY29yYWw6IFsyNTUsIDEyNywgODBdXG4gICwgY29ybmZsb3dlcmJsdWU6IFsxMDAsIDE0OSwgMjM3XVxuICAsIGNvcm5zaWxrOiBbMjU1LCAyNDgsIDIyMF1cbiAgLCBjcmltc29uOiBbMjIwLCAyMCwgNjBdXG4gICwgY3lhbjogWzAsIDI1NSwgMjU1XVxuICAsIGRhcmtibHVlOiBbMCwgMCwgMTM5XVxuICAsIGRhcmtjeWFuOiBbMCwgMTM5LCAxMzldXG4gICwgZGFya2dvbGRlbnJvZDogWzE4NCwgMTMyLCAxMV1cbiAgLCBkYXJrZ3JheTogWzE2OSwgMTY5LCAxNjldXG4gICwgZGFya2dyZWVuOiBbMCwgMTAwLCAwXVxuICAsIGRhcmtncmV5OiBbMTY5LCAxNjksIDE2OV1cbiAgLCBkYXJra2hha2k6IFsxODksIDE4MywgMTA3XVxuICAsIGRhcmttYWdlbnRhOiBbMTM5LCAwLCAxMzldXG4gICwgZGFya29saXZlZ3JlZW46IFs4NSwgMTA3LCA0N11cbiAgLCBkYXJrb3JhbmdlOiBbMjU1LCAxNDAsIDBdXG4gICwgZGFya29yY2hpZDogWzE1MywgNTAsIDIwNF1cbiAgLCBkYXJrcmVkOiBbMTM5LCAwLCAwXVxuICAsIGRhcmtzYWxtb246IFsyMzMsIDE1MCwgMTIyXVxuICAsIGRhcmtzZWFncmVlbjogWzE0MywgMTg4LCAxNDNdXG4gICwgZGFya3NsYXRlYmx1ZTogWzcyLCA2MSwgMTM5XVxuICAsIGRhcmtzbGF0ZWdyYXk6IFs0NywgNzksIDc5XVxuICAsIGRhcmtzbGF0ZWdyZXk6IFs0NywgNzksIDc5XVxuICAsIGRhcmt0dXJxdW9pc2U6IFswLCAyMDYsIDIwOV1cbiAgLCBkYXJrdmlvbGV0OiBbMTQ4LCAwLCAyMTFdXG4gICwgZGVlcHBpbms6IFsyNTUsIDIwLCAxNDddXG4gICwgZGVlcHNreWJsdWU6IFswLCAxOTEsIDI1NV1cbiAgLCBkaW1ncmF5OiBbMTA1LCAxMDUsIDEwNV1cbiAgLCBkaW1ncmV5OiBbMTA1LCAxMDUsIDEwNV1cbiAgLCBkb2RnZXJibHVlOiBbMzAsIDE0NCwgMjU1XVxuICAsIGZpcmVicmljazogWzE3OCwgMzQsIDM0XVxuICAsIGZsb3JhbHdoaXRlOiBbMjU1LCAyNTUsIDI0MF1cbiAgLCBmb3Jlc3RncmVlbjogWzM0LCAxMzksIDM0XVxuICAsIGZ1Y2hzaWE6IFsyNTUsIDAsIDI1NV1cbiAgLCBnYWluc2Jvcm86IFsyMjAsIDIyMCwgMjIwXVxuICAsIGdob3N0d2hpdGU6IFsyNDgsIDI0OCwgMjU1XVxuICAsIGdvbGQ6IFsyNTUsIDIxNSwgMF1cbiAgLCBnb2xkZW5yb2Q6IFsyMTgsIDE2NSwgMzJdXG4gICwgZ3JheTogWzEyOCwgMTI4LCAxMjhdXG4gICwgZ3JlZW46IFswLCAxMjgsIDBdXG4gICwgZ3JlZW55ZWxsb3c6IFsxNzMsIDI1NSwgNDddXG4gICwgZ3JleTogWzEyOCwgMTI4LCAxMjhdXG4gICwgaG9uZXlkZXc6IFsyNDAsIDI1NSwgMjQwXVxuICAsIGhvdHBpbms6IFsyNTUsIDEwNSwgMTgwXVxuICAsIGluZGlhbnJlZDogWzIwNSwgOTIsIDkyXVxuICAsIGluZGlnbzogWzc1LCAwLCAxMzBdXG4gICwgaXZvcnk6IFsyNTUsIDI1NSwgMjQwXVxuICAsIGtoYWtpOiBbMjQwLCAyMzAsIDE0MF1cbiAgLCBsYXZlbmRlcjogWzIzMCwgMjMwLCAyNTBdXG4gICwgbGF2ZW5kZXJibHVzaDogWzI1NSwgMjQwLCAyNDVdXG4gICwgbGF3bmdyZWVuOiBbMTI0LCAyNTIsIDBdXG4gICwgbGVtb25jaGlmZm9uOiBbMjU1LCAyNTAsIDIwNV1cbiAgLCBsaWdodGJsdWU6IFsxNzMsIDIxNiwgMjMwXVxuICAsIGxpZ2h0Y29yYWw6IFsyNDAsIDEyOCwgMTI4XVxuICAsIGxpZ2h0Y3lhbjogWzIyNCwgMjU1LCAyNTVdXG4gICwgbGlnaHRnb2xkZW5yb2R5ZWxsb3c6IFsyNTAsIDI1MCwgMjEwXVxuICAsIGxpZ2h0Z3JheTogWzIxMSwgMjExLCAyMTFdXG4gICwgbGlnaHRncmVlbjogWzE0NCwgMjM4LCAxNDRdXG4gICwgbGlnaHRncmV5OiBbMjExLCAyMTEsIDIxMV1cbiAgLCBsaWdodHBpbms6IFsyNTUsIDE4MiwgMTkzXVxuICAsIGxpZ2h0c2FsbW9uOiBbMjU1LCAxNjAsIDEyMl1cbiAgLCBsaWdodHNlYWdyZWVuOiBbMzIsIDE3OCwgMTcwXVxuICAsIGxpZ2h0c2t5Ymx1ZTogWzEzNSwgMjA2LCAyNTBdXG4gICwgbGlnaHRzbGF0ZWdyYXk6IFsxMTksIDEzNiwgMTUzXVxuICAsIGxpZ2h0c2xhdGVncmV5OiBbMTE5LCAxMzYsIDE1M11cbiAgLCBsaWdodHN0ZWVsYmx1ZTogWzE3NiwgMTk2LCAyMjJdXG4gICwgbGlnaHR5ZWxsb3c6IFsyNTUsIDI1NSwgMjI0XVxuICAsIGxpbWU6IFswLCAyNTUsIDBdXG4gICwgbGltZWdyZWVuOiBbNTAsIDIwNSwgNTBdXG4gICwgbGluZW46IFsyNTAsIDI0MCwgMjMwXVxuICAsIG1hZ2VudGE6IFsyNTUsIDAsIDI1NV1cbiAgLCBtYXJvb246IFsxMjgsIDAsIDBdXG4gICwgbWVkaXVtYXF1YW1hcmluZTogWzEwMiwgMjA1LCAxNzBdXG4gICwgbWVkaXVtYmx1ZTogWzAsIDAsIDIwNV1cbiAgLCBtZWRpdW1vcmNoaWQ6IFsxODYsIDg1LCAyMTFdXG4gICwgbWVkaXVtcHVycGxlOiBbMTQ3LCAxMTIsIDIxOV1cbiAgLCBtZWRpdW1zZWFncmVlbjogWzYwLCAxNzksIDExM11cbiAgLCBtZWRpdW1zbGF0ZWJsdWU6IFsxMjMsIDEwNCwgMjM4XVxuICAsIG1lZGl1bXNwcmluZ2dyZWVuOiBbMCwgMjUwLCAxNTRdXG4gICwgbWVkaXVtdHVycXVvaXNlOiBbNzIsIDIwOSwgMjA0XVxuICAsIG1lZGl1bXZpb2xldHJlZDogWzE5OSwgMjEsIDEzM11cbiAgLCBtaWRuaWdodGJsdWU6IFsyNSwgMjUsIDExMl1cbiAgLCBtaW50Y3JlYW06IFsyNDUsIDI1NSwgMjUwXVxuICAsIG1pc3R5cm9zZTogWzI1NSwgMjI4LCAyMjVdXG4gICwgbW9jY2FzaW46IFsyNTUsIDIyOCwgMTgxXVxuICAsIG5hdmFqb3doaXRlOiBbMjU1LCAyMjIsIDE3M11cbiAgLCBuYXZ5OiBbMCwgMCwgMTI4XVxuICAsIG9sZGxhY2U6IFsyNTMsIDI0NSwgMjMwXVxuICAsIG9saXZlOiBbMTI4LCAxMjgsIDBdXG4gICwgb2xpdmVkcmFiOiBbMTA3LCAxNDIsIDM1XVxuICAsIG9yYW5nZTogWzI1NSwgMTY1LCAwXVxuICAsIG9yYW5nZXJlZDogWzI1NSwgNjksIDBdXG4gICwgb3JjaGlkOiBbMjE4LCAxMTIsIDIxNF1cbiAgLCBwYWxlZ29sZGVucm9kOiBbMjM4LCAyMzIsIDE3MF1cbiAgLCBwYWxlZ3JlZW46IFsxNTIsIDI1MSwgMTUyXVxuICAsIHBhbGV0dXJxdW9pc2U6IFsxNzUsIDIzOCwgMjM4XVxuICAsIHBhbGV2aW9sZXRyZWQ6IFsyMTksIDExMiwgMTQ3XVxuICAsIHBhcGF5YXdoaXA6IFsyNTUsIDIzOSwgMjEzXVxuICAsIHBlYWNocHVmZjogWzI1NSwgMjE4LCAxODVdXG4gICwgcGVydTogWzIwNSwgMTMzLCA2M11cbiAgLCBwaW5rOiBbMjU1LCAxOTIsIDIwM11cbiAgLCBwbHVtOiBbMjIxLCAxNjAsIDIwM11cbiAgLCBwb3dkZXJibHVlOiBbMTc2LCAyMjQsIDIzMF1cbiAgLCBwdXJwbGU6IFsxMjgsIDAsIDEyOF1cbiAgLCByZWQ6IFsyNTUsIDAsIDBdXG4gICwgcm9zeWJyb3duOiBbMTg4LCAxNDMsIDE0M11cbiAgLCByb3lhbGJsdWU6IFs2NSwgMTA1LCAyMjVdXG4gICwgc2FkZGxlYnJvd246IFsxMzksIDY5LCAxOV1cbiAgLCBzYWxtb246IFsyNTAsIDEyOCwgMTE0XVxuICAsIHNhbmR5YnJvd246IFsyNDQsIDE2NCwgOTZdXG4gICwgc2VhZ3JlZW46IFs0NiwgMTM5LCA4N11cbiAgLCBzZWFzaGVsbDogWzI1NSwgMjQ1LCAyMzhdXG4gICwgc2llbm5hOiBbMTYwLCA4MiwgNDVdXG4gICwgc2lsdmVyOiBbMTkyLCAxOTIsIDE5Ml1cbiAgLCBza3libHVlOiBbMTM1LCAyMDYsIDIzNV1cbiAgLCBzbGF0ZWJsdWU6IFsxMDYsIDkwLCAyMDVdXG4gICwgc2xhdGVncmF5OiBbMTE5LCAxMjgsIDE0NF1cbiAgLCBzbGF0ZWdyZXk6IFsxMTksIDEyOCwgMTQ0XVxuICAsIHNub3c6IFsyNTUsIDI1NSwgMjUwXVxuICAsIHNwcmluZ2dyZWVuOiBbMCwgMjU1LCAxMjddXG4gICwgc3RlZWxibHVlOiBbNzAsIDEzMCwgMTgwXVxuICAsIHRhbjogWzIxMCwgMTgwLCAxNDBdXG4gICwgdGVhbDogWzAsIDEyOCwgMTI4XVxuICAsIHRoaXN0bGU6IFsyMTYsIDE5MSwgMjE2XVxuICAsIHRvbWF0bzogWzI1NSwgOTksIDcxXVxuICAsIHR1cnF1b2lzZTogWzY0LCAyMjQsIDIwOF1cbiAgLCB2aW9sZXQ6IFsyMzgsIDEzMCwgMjM4XVxuICAsIHdoZWF0OiBbMjQ1LCAyMjIsIDE3OV1cbiAgLCB3aGl0ZTogWzI1NSwgMjU1LCAyNTVdXG4gICwgd2hpdGVzbW9rZTogWzI0NSwgMjQ1LCAyNDVdXG4gICwgeWVsbG93OiBbMjU1LCAyNTUsIDBdXG4gICwgeWVsbG93Z3JlZW46IFsxNTQsIDIwNSwgNV1cbn07IiwiXG4vKipcbiAqIG51bWJlciBwYXR0ZXJuXG4gKiBAdHlwZSB7UmVnRXhwfVxuICovXG5cbnZhciBudW1iZXIgPSAvWy0rXT8oPzpcXGQrXFwuP1xcZCp8XFwuP1xcZCspKD86W2VFXVstK10/XFxkKyk/L2dcblxubW9kdWxlLmV4cG9ydHMgPSB0d2VlblxuXG4vKipcbiAqIGNyZWF0ZSBhIHR3ZWVuIGdlbmVyYXRvciBmcm9tIGBhYCB0byBgYmBcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gYVxuICogQHBhcmFtIHtTdHJpbmd9IGJcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICovXG5cbmZ1bmN0aW9uIHR3ZWVuKGEsIGIpe1xuXHR2YXIgc3RyaW5nID0gW11cblx0dmFyIGtleXMgPSBbXVxuXHR2YXIgZnJvbSA9IFtdXG5cdHZhciB0byA9IFtdXG5cdHZhciBjdXJzb3IgPSAwXG5cdHZhciBtXG5cblx0d2hpbGUgKG0gPSBudW1iZXIuZXhlYyhiKSkge1xuXHRcdGlmIChtLmluZGV4ID4gY3Vyc29yKSBzdHJpbmcucHVzaChiLnNsaWNlKGN1cnNvciwgbS5pbmRleCkpXG5cdFx0dG8ucHVzaChOdW1iZXIobVswXSkpXG5cdFx0a2V5cy5wdXNoKHN0cmluZy5sZW5ndGgpXG5cdFx0c3RyaW5nLnB1c2gobnVsbClcblx0XHRjdXJzb3IgPSBudW1iZXIubGFzdEluZGV4XG5cdH1cblx0aWYgKGN1cnNvciA8IGIubGVuZ3RoKSBzdHJpbmcucHVzaChiLnNsaWNlKGN1cnNvcikpXG5cblx0d2hpbGUgKG0gPSBudW1iZXIuZXhlYyhhKSkgZnJvbS5wdXNoKE51bWJlcihtWzBdKSlcblxuXHRyZXR1cm4gZnVuY3Rpb24gZnJhbWUobil7XG5cdFx0dmFyIGkgPSBrZXlzLmxlbmd0aFxuXHRcdHdoaWxlIChpLS0pIHN0cmluZ1trZXlzW2ldXSA9IGZyb21baV0gKyAodG9baV0gLSBmcm9tW2ldKSAqIG5cblx0XHRyZXR1cm4gc3RyaW5nLmpvaW4oJycpXG5cdH1cbn1cbiIsIlxubW9kdWxlLmV4cG9ydHMgPSBzZXJpYWxpemVcblxuLyoqXG4gKiBjb252ZXJ0IGBwYXRoYCB0byBhIHN0cmluZ1xuICpcbiAqIEBwYXJhbSB7QXJyYXl9IHBhdGhcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuXG5mdW5jdGlvbiBzZXJpYWxpemUocGF0aCl7XG5cdHJldHVybiBwYXRoLnJlZHVjZShmdW5jdGlvbihzdHIsIHNlZyl7XG5cdFx0cmV0dXJuIHN0ciArIHNlZ1swXSArIHNlZy5zbGljZSgxKS5qb2luKCcsJylcblx0fSwgJycpXG59XG4iLCJcbm1vZHVsZS5leHBvcnRzID0gYmFsYW5jZVxuXG4vKipcbiAqIGRlZmluZSBgYWAgYW5kIGBiYCB1c2luZyB0aGUgc2FtZSBudW1iZXIgb2ZcbiAqIHBhdGggc2VnbWVudHMgd2hpbGUgcHJlc2VydmluZyB0aGVpciBzaGFwZVxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGFcbiAqIEBwYXJhbSB7QXJyYXl9IGJcbiAqIEByZXR1cm4ge0FycmF5fVxuICovXG5cbmZ1bmN0aW9uIGJhbGFuY2UoYSwgYil7XG4gIHZhciBkaWZmID0gYS5sZW5ndGggLSBiLmxlbmd0aFxuICB2YXIgc2hvcnQgPSBkaWZmID49IDAgPyBiIDogYVxuICBkaWZmID0gTWF0aC5hYnMoZGlmZilcbiAgd2hpbGUgKGRpZmYtLSkgc2hvcnQucHVzaChbJ2MnLDAsMCwwLDAsMCwwXSlcbiAgcmV0dXJuIFthLCBiXVxufVxuIiwidmFyIGFwcGx5ID0gRnVuY3Rpb24ucHJvdG90eXBlLmFwcGx5XG5tb2R1bGUuZXhwb3J0cyA9IGZjb21wXG5cbmZ1bmN0aW9uIGZjb21wKCkge1xuICB2YXIgZm5zID0gYXJndW1lbnRzXG4gICAgLCBsZW4gPSBmbnMubGVuZ3RoXG4gICAgLCBmbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgdmFsID0gYXBwbHkuY2FsbChmbnNbMF0sIG51bGwsIGFyZ3VtZW50cylcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBsZW47IGkrKylcbiAgICAgICAgICB2YWwgPSBmbnNbaV0odmFsKVxuICAgICAgICByZXR1cm4gdmFsXG4gICAgICB9XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspXG4gICAgZm4uZGlzcGxheU5hbWUgPSAoZm4uZGlzcGxheU5hbWUgfHwgJycpXG4gICAgICArIChpID09PSAwID8gJycgOiAnIMK3ICcpXG4gICAgICArIGZuc1tpXS5uYW1lXG4gIHJldHVybiBmblxufVxuXG5mY29tcC5yZXZlcnNlID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiBmY29tcC5hcHBseShudWxsLCBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cykucmV2ZXJzZSgpKVxufVxuIiwiXG5tb2R1bGUuZXhwb3J0cyA9IHBhcnNlXG5cbi8qKlxuICogZXhwZWN0ZWQgYXJndW1lbnQgbGVuZ3Roc1xuICogQHR5cGUge09iamVjdH1cbiAqL1xuXG52YXIgbGVuZ3RoID0ge2E6IDcsIGM6IDYsIGg6IDEsIGw6IDIsIG06IDIsIHE6IDQsIHM6IDQsIHQ6IDIsIHY6IDEsIHo6IDB9XG5cbi8qKlxuICogc2VnbWVudCBwYXR0ZXJuXG4gKiBAdHlwZSB7UmVnRXhwfVxuICovXG5cbnZhciBzZWdtZW50ID0gLyhbYXN0dnpxbWhsY10pKFteYXN0dnpxbWhsY10qKS9pZ1xuXG4vKipcbiAqIHBhcnNlIGFuIHN2ZyBwYXRoIGRhdGEgc3RyaW5nLiBHZW5lcmF0ZXMgYW4gQXJyYXlcbiAqIG9mIGNvbW1hbmRzIHdoZXJlIGVhY2ggY29tbWFuZCBpcyBhbiBBcnJheSBvZiB0aGVcbiAqIGZvcm0gYFtjb21tYW5kLCBhcmcxLCBhcmcyLCAuLi5dYFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBwYXRoXG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqL1xuXG5mdW5jdGlvbiBwYXJzZShwYXRoKSB7XG5cdHZhciBkYXRhID0gW11cblx0cGF0aC5yZXBsYWNlKHNlZ21lbnQsIGZ1bmN0aW9uKF8sIGNvbW1hbmQsIGFyZ3Mpe1xuXHRcdHZhciB0eXBlID0gY29tbWFuZC50b0xvd2VyQ2FzZSgpXG5cdFx0YXJncyA9IHBhcnNlVmFsdWVzKGFyZ3MpXG5cblx0XHQvLyBvdmVybG9hZGVkIG1vdmVUb1xuXHRcdGlmICh0eXBlID09ICdtJyAmJiBhcmdzLmxlbmd0aCA+IDIpIHtcblx0XHRcdGRhdGEucHVzaChbY29tbWFuZF0uY29uY2F0KGFyZ3Muc3BsaWNlKDAsIDIpKSlcblx0XHRcdHR5cGUgPSAnbCdcblx0XHRcdGNvbW1hbmQgPSBjb21tYW5kID09ICdtJyA/ICdsJyA6ICdMJ1xuXHRcdH1cblxuXHRcdHdoaWxlICh0cnVlKSB7XG5cdFx0XHRpZiAoYXJncy5sZW5ndGggPT0gbGVuZ3RoW3R5cGVdKSB7XG5cdFx0XHRcdGFyZ3MudW5zaGlmdChjb21tYW5kKVxuXHRcdFx0XHRyZXR1cm4gZGF0YS5wdXNoKGFyZ3MpXG5cdFx0XHR9XG5cdFx0XHRpZiAoYXJncy5sZW5ndGggPCBsZW5ndGhbdHlwZV0pIHRocm93IG5ldyBFcnJvcignbWFsZm9ybWVkIHBhdGggZGF0YScpXG5cdFx0XHRkYXRhLnB1c2goW2NvbW1hbmRdLmNvbmNhdChhcmdzLnNwbGljZSgwLCBsZW5ndGhbdHlwZV0pKSlcblx0XHR9XG5cdH0pXG5cdHJldHVybiBkYXRhXG59XG5cbmZ1bmN0aW9uIHBhcnNlVmFsdWVzKGFyZ3Mpe1xuXHRhcmdzID0gYXJncy5tYXRjaCgvLT9bLjAtOV0rKD86ZVstK10/XFxkKyk/L2lnKVxuXHRyZXR1cm4gYXJncyA/IGFyZ3MubWFwKE51bWJlcikgOiBbXVxufVxuIiwiXG5tb2R1bGUuZXhwb3J0cyA9IGFic29sdXRpemVcblxuLyoqXG4gKiByZWRlZmluZSBgcGF0aGAgd2l0aCBhYnNvbHV0ZSBjb29yZGluYXRlc1xuICpcbiAqIEBwYXJhbSB7QXJyYXl9IHBhdGhcbiAqIEByZXR1cm4ge0FycmF5fVxuICovXG5cbmZ1bmN0aW9uIGFic29sdXRpemUocGF0aCl7XG5cdHZhciBzdGFydFggPSAwXG5cdHZhciBzdGFydFkgPSAwXG5cdHZhciB4ID0gMFxuXHR2YXIgeSA9IDBcblxuXHRyZXR1cm4gcGF0aC5tYXAoZnVuY3Rpb24oc2VnKXtcblx0XHRzZWcgPSBzZWcuc2xpY2UoKVxuXHRcdHZhciB0eXBlID0gc2VnWzBdXG5cdFx0dmFyIGNvbW1hbmQgPSB0eXBlLnRvVXBwZXJDYXNlKClcblxuXHRcdC8vIGlzIHJlbGF0aXZlXG5cdFx0aWYgKHR5cGUgIT0gY29tbWFuZCkge1xuXHRcdFx0c2VnWzBdID0gY29tbWFuZFxuXHRcdFx0c3dpdGNoICh0eXBlKSB7XG5cdFx0XHRcdGNhc2UgJ2EnOlxuXHRcdFx0XHRcdHNlZ1s2XSArPSB4XG5cdFx0XHRcdFx0c2VnWzddICs9IHlcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRjYXNlICd2Jzpcblx0XHRcdFx0XHRzZWdbMV0gKz0geVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdGNhc2UgJ2gnOlxuXHRcdFx0XHRcdHNlZ1sxXSArPSB4XG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRmb3IgKHZhciBpID0gMTsgaSA8IHNlZy5sZW5ndGg7KSB7XG5cdFx0XHRcdFx0XHRzZWdbaSsrXSArPSB4XG5cdFx0XHRcdFx0XHRzZWdbaSsrXSArPSB5XG5cdFx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIHVwZGF0ZSBjdXJzb3Igc3RhdGVcblx0XHRzd2l0Y2ggKGNvbW1hbmQpIHtcblx0XHRcdGNhc2UgJ1onOlxuXHRcdFx0XHR4ID0gc3RhcnRYXG5cdFx0XHRcdHkgPSBzdGFydFlcblx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgJ0gnOlxuXHRcdFx0XHR4ID0gc2VnWzFdXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlICdWJzpcblx0XHRcdFx0eSA9IHNlZ1sxXVxuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSAnTSc6XG5cdFx0XHRcdHggPSBzdGFydFggPSBzZWdbMV1cblx0XHRcdFx0eSA9IHN0YXJ0WSA9IHNlZ1syXVxuXHRcdFx0XHRicmVha1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0eCA9IHNlZ1tzZWcubGVuZ3RoIC0gMl1cblx0XHRcdFx0eSA9IHNlZ1tzZWcubGVuZ3RoIC0gMV1cblx0XHR9XG5cblx0XHRyZXR1cm4gc2VnXG5cdH0pXG59XG4iLCJcbnZhciDPgCA9IE1hdGguUElcbnZhciBfMTIwID0gcmFkaWFucygxMjApXG5cbm1vZHVsZS5leHBvcnRzID0gbm9ybWFsaXplXG5cbi8qKlxuICogZGVzY3JpYmUgYHBhdGhgIGluIHRlcm1zIG9mIGN1YmljIGLDqXppZXIgXG4gKiBjdXJ2ZXMgYW5kIG1vdmUgY29tbWFuZHNcbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBwYXRoXG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqL1xuXG5mdW5jdGlvbiBub3JtYWxpemUocGF0aCl7XG5cdC8vIGluaXQgc3RhdGVcblx0dmFyIHByZXZcblx0dmFyIHJlc3VsdCA9IFtdXG5cdHZhciBiZXppZXJYID0gMFxuXHR2YXIgYmV6aWVyWSA9IDBcblx0dmFyIHN0YXJ0WCA9IDBcblx0dmFyIHN0YXJ0WSA9IDBcblx0dmFyIHF1YWRYID0gbnVsbFxuXHR2YXIgcXVhZFkgPSBudWxsXG5cdHZhciB4ID0gMFxuXHR2YXIgeSA9IDBcblxuXHRmb3IgKHZhciBpID0gMCwgbGVuID0gcGF0aC5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuXHRcdHZhciBzZWcgPSBwYXRoW2ldXG5cdFx0dmFyIGNvbW1hbmQgPSBzZWdbMF1cblx0XHRzd2l0Y2ggKGNvbW1hbmQpIHtcblx0XHRcdGNhc2UgJ00nOlxuXHRcdFx0XHRzdGFydFggPSBzZWdbMV1cblx0XHRcdFx0c3RhcnRZID0gc2VnWzJdXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlICdBJzpcblx0XHRcdFx0c2VnID0gYXJjKHgsIHksc2VnWzFdLHNlZ1syXSxyYWRpYW5zKHNlZ1szXSksc2VnWzRdLHNlZ1s1XSxzZWdbNl0sc2VnWzddKVxuXHRcdFx0XHQvLyBzcGxpdCBtdWx0aSBwYXJ0XG5cdFx0XHRcdHNlZy51bnNoaWZ0KCdDJylcblx0XHRcdFx0aWYgKHNlZy5sZW5ndGggPiA3KSB7XG5cdFx0XHRcdFx0cmVzdWx0LnB1c2goc2VnLnNwbGljZSgwLCA3KSlcblx0XHRcdFx0XHRzZWcudW5zaGlmdCgnQycpXG5cdFx0XHRcdH1cblx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgJ1MnOlxuXHRcdFx0XHQvLyBkZWZhdWx0IGNvbnRyb2wgcG9pbnRcblx0XHRcdFx0dmFyIGN4ID0geFxuXHRcdFx0XHR2YXIgY3kgPSB5XG5cdFx0XHRcdGlmIChwcmV2ID09ICdDJyB8fCBwcmV2ID09ICdTJykge1xuXHRcdFx0XHRcdGN4ICs9IGN4IC0gYmV6aWVyWCAvLyByZWZsZWN0IHRoZSBwcmV2aW91cyBjb21tYW5kJ3MgY29udHJvbFxuXHRcdFx0XHRcdGN5ICs9IGN5IC0gYmV6aWVyWSAvLyBwb2ludCByZWxhdGl2ZSB0byB0aGUgY3VycmVudCBwb2ludFxuXHRcdFx0XHR9XG5cdFx0XHRcdHNlZyA9IFsnQycsIGN4LCBjeSwgc2VnWzFdLCBzZWdbMl0sIHNlZ1szXSwgc2VnWzRdXVxuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSAnVCc6XG5cdFx0XHRcdGlmIChwcmV2ID09ICdRJyB8fCBwcmV2ID09ICdUJykge1xuXHRcdFx0XHRcdHF1YWRYID0geCAqIDIgLSBxdWFkWCAvLyBhcyB3aXRoICdTJyByZWZsZWN0IHByZXZpb3VzIGNvbnRyb2wgcG9pbnRcblx0XHRcdFx0XHRxdWFkWSA9IHkgKiAyIC0gcXVhZFlcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRxdWFkWCA9IHhcblx0XHRcdFx0XHRxdWFkWSA9IHlcblx0XHRcdFx0fVxuXHRcdFx0XHRzZWcgPSBxdWFkcmF0aWMoeCwgeSwgcXVhZFgsIHF1YWRZLCBzZWdbMV0sIHNlZ1syXSlcblx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgJ1EnOlxuXHRcdFx0XHRxdWFkWCA9IHNlZ1sxXVxuXHRcdFx0XHRxdWFkWSA9IHNlZ1syXVxuXHRcdFx0XHRzZWcgPSBxdWFkcmF0aWMoeCwgeSwgc2VnWzFdLCBzZWdbMl0sIHNlZ1szXSwgc2VnWzRdKVxuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSAnTCc6XG5cdFx0XHRcdHNlZyA9IGxpbmUoeCwgeSwgc2VnWzFdLCBzZWdbMl0pXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlICdIJzpcblx0XHRcdFx0c2VnID0gbGluZSh4LCB5LCBzZWdbMV0sIHkpXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlICdWJzpcblx0XHRcdFx0c2VnID0gbGluZSh4LCB5LCB4LCBzZWdbMV0pXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlICdaJzpcblx0XHRcdFx0c2VnID0gbGluZSh4LCB5LCBzdGFydFgsIHN0YXJ0WSlcblx0XHRcdFx0YnJlYWtcblx0XHR9XG5cblx0XHQvLyB1cGRhdGUgc3RhdGVcblx0XHRwcmV2ID0gY29tbWFuZFxuXHRcdHggPSBzZWdbc2VnLmxlbmd0aCAtIDJdXG5cdFx0eSA9IHNlZ1tzZWcubGVuZ3RoIC0gMV1cblx0XHRpZiAoc2VnLmxlbmd0aCA+IDQpIHtcblx0XHRcdGJlemllclggPSBzZWdbc2VnLmxlbmd0aCAtIDRdXG5cdFx0XHRiZXppZXJZID0gc2VnW3NlZy5sZW5ndGggLSAzXVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRiZXppZXJYID0geFxuXHRcdFx0YmV6aWVyWSA9IHlcblx0XHR9XG5cdFx0cmVzdWx0LnB1c2goc2VnKVxuXHR9XG5cblx0cmV0dXJuIHJlc3VsdFxufVxuXG5mdW5jdGlvbiBsaW5lKHgxLCB5MSwgeDIsIHkyKXtcblx0cmV0dXJuIFsnQycsIHgxLCB5MSwgeDIsIHkyLCB4MiwgeTJdXG59XG5cbmZ1bmN0aW9uIHF1YWRyYXRpYyh4MSwgeTEsIGN4LCBjeSwgeDIsIHkyKXtcblx0cmV0dXJuIFtcblx0XHQnQycsXG5cdFx0eDEvMyArICgyLzMpICogY3gsXG5cdFx0eTEvMyArICgyLzMpICogY3ksXG5cdFx0eDIvMyArICgyLzMpICogY3gsXG5cdFx0eTIvMyArICgyLzMpICogY3ksXG5cdFx0eDIsXG5cdFx0eTJcblx0XVxufVxuXG4vLyBUaGlzIGZ1bmN0aW9uIGlzIHJpcHBlZCBmcm9tIFxuLy8gZ2l0aHViLmNvbS9EbWl0cnlCYXJhbm92c2tpeS9yYXBoYWVsL2Jsb2IvNGQ5N2Q0L3JhcGhhZWwuanMjTDIyMTYtTDIzMDQgXG4vLyB3aGljaCByZWZlcmVuY2VzIHczLm9yZy9UUi9TVkcxMS9pbXBsbm90ZS5odG1sI0FyY0ltcGxlbWVudGF0aW9uTm90ZXNcbi8vIFRPRE86IG1ha2UgaXQgaHVtYW4gcmVhZGFibGVcblxuZnVuY3Rpb24gYXJjKHgxLCB5MSwgcngsIHJ5LCBhbmdsZSwgbGFyZ2VfYXJjX2ZsYWcsIHN3ZWVwX2ZsYWcsIHgyLCB5MiwgcmVjdXJzaXZlKSB7XG5cdGlmICghcmVjdXJzaXZlKSB7XG5cdFx0dmFyIHh5ID0gcm90YXRlKHgxLCB5MSwgLWFuZ2xlKVxuXHRcdHgxID0geHkueFxuXHRcdHkxID0geHkueVxuXHRcdHh5ID0gcm90YXRlKHgyLCB5MiwgLWFuZ2xlKVxuXHRcdHgyID0geHkueFxuXHRcdHkyID0geHkueVxuXHRcdHZhciB4ID0gKHgxIC0geDIpIC8gMlxuXHRcdHZhciB5ID0gKHkxIC0geTIpIC8gMlxuXHRcdHZhciBoID0gKHggKiB4KSAvIChyeCAqIHJ4KSArICh5ICogeSkgLyAocnkgKiByeSlcblx0XHRpZiAoaCA+IDEpIHtcblx0XHRcdGggPSBNYXRoLnNxcnQoaClcblx0XHRcdHJ4ID0gaCAqIHJ4XG5cdFx0XHRyeSA9IGggKiByeVxuXHRcdH1cblx0XHR2YXIgcngyID0gcnggKiByeFxuXHRcdHZhciByeTIgPSByeSAqIHJ5XG5cdFx0dmFyIGsgPSAobGFyZ2VfYXJjX2ZsYWcgPT0gc3dlZXBfZmxhZyA/IC0xIDogMSlcblx0XHRcdCogTWF0aC5zcXJ0KE1hdGguYWJzKChyeDIgKiByeTIgLSByeDIgKiB5ICogeSAtIHJ5MiAqIHggKiB4KSAvIChyeDIgKiB5ICogeSArIHJ5MiAqIHggKiB4KSkpXG5cdFx0aWYgKGsgPT0gSW5maW5pdHkpIGsgPSAxIC8vIG5ldXRyYWxpemVcblx0XHR2YXIgY3ggPSBrICogcnggKiB5IC8gcnkgKyAoeDEgKyB4MikgLyAyXG5cdFx0dmFyIGN5ID0gayAqIC1yeSAqIHggLyByeCArICh5MSArIHkyKSAvIDJcblx0XHR2YXIgZjEgPSBNYXRoLmFzaW4oKCh5MSAtIGN5KSAvIHJ5KS50b0ZpeGVkKDkpKVxuXHRcdHZhciBmMiA9IE1hdGguYXNpbigoKHkyIC0gY3kpIC8gcnkpLnRvRml4ZWQoOSkpXG5cblx0XHRmMSA9IHgxIDwgY3ggPyDPgCAtIGYxIDogZjFcblx0XHRmMiA9IHgyIDwgY3ggPyDPgCAtIGYyIDogZjJcblx0XHRpZiAoZjEgPCAwKSBmMSA9IM+AICogMiArIGYxXG5cdFx0aWYgKGYyIDwgMCkgZjIgPSDPgCAqIDIgKyBmMlxuXHRcdGlmIChzd2VlcF9mbGFnICYmIGYxID4gZjIpIGYxID0gZjEgLSDPgCAqIDJcblx0XHRpZiAoIXN3ZWVwX2ZsYWcgJiYgZjIgPiBmMSkgZjIgPSBmMiAtIM+AICogMlxuXHR9IGVsc2Uge1xuXHRcdGYxID0gcmVjdXJzaXZlWzBdXG5cdFx0ZjIgPSByZWN1cnNpdmVbMV1cblx0XHRjeCA9IHJlY3Vyc2l2ZVsyXVxuXHRcdGN5ID0gcmVjdXJzaXZlWzNdXG5cdH1cblx0Ly8gZ3JlYXRlciB0aGFuIDEyMCBkZWdyZWVzIHJlcXVpcmVzIG11bHRpcGxlIHNlZ21lbnRzXG5cdGlmIChNYXRoLmFicyhmMiAtIGYxKSA+IF8xMjApIHtcblx0XHR2YXIgZjJvbGQgPSBmMlxuXHRcdHZhciB4Mm9sZCA9IHgyXG5cdFx0dmFyIHkyb2xkID0geTJcblx0XHRmMiA9IGYxICsgXzEyMCAqIChzd2VlcF9mbGFnICYmIGYyID4gZjEgPyAxIDogLTEpXG5cdFx0eDIgPSBjeCArIHJ4ICogTWF0aC5jb3MoZjIpXG5cdFx0eTIgPSBjeSArIHJ5ICogTWF0aC5zaW4oZjIpXG5cdFx0dmFyIHJlcyA9IGFyYyh4MiwgeTIsIHJ4LCByeSwgYW5nbGUsIDAsIHN3ZWVwX2ZsYWcsIHgyb2xkLCB5Mm9sZCwgW2YyLCBmMm9sZCwgY3gsIGN5XSlcblx0fVxuXHR2YXIgdCA9IE1hdGgudGFuKChmMiAtIGYxKSAvIDQpXG5cdHZhciBoeCA9IDQgLyAzICogcnggKiB0XG5cdHZhciBoeSA9IDQgLyAzICogcnkgKiB0XG5cdHZhciBjdXJ2ZSA9IFtcblx0XHQyICogeDEgLSAoeDEgKyBoeCAqIE1hdGguc2luKGYxKSksXG5cdFx0MiAqIHkxIC0gKHkxIC0gaHkgKiBNYXRoLmNvcyhmMSkpLFxuXHRcdHgyICsgaHggKiBNYXRoLnNpbihmMiksXG5cdFx0eTIgLSBoeSAqIE1hdGguY29zKGYyKSxcblx0XHR4Mixcblx0XHR5MlxuXHRdXG5cdGlmIChyZWN1cnNpdmUpIHJldHVybiBjdXJ2ZVxuXHRpZiAocmVzKSBjdXJ2ZSA9IGN1cnZlLmNvbmNhdChyZXMpXG5cdGZvciAodmFyIGkgPSAwOyBpIDwgY3VydmUubGVuZ3RoOykge1xuXHRcdHZhciByb3QgPSByb3RhdGUoY3VydmVbaV0sIGN1cnZlW2krMV0sIGFuZ2xlKVxuXHRcdGN1cnZlW2krK10gPSByb3QueFxuXHRcdGN1cnZlW2krK10gPSByb3QueVxuXHR9XG5cdHJldHVybiBjdXJ2ZVxufVxuXG5mdW5jdGlvbiByb3RhdGUoeCwgeSwgcmFkKXtcblx0cmV0dXJuIHtcblx0XHR4OiB4ICogTWF0aC5jb3MocmFkKSAtIHkgKiBNYXRoLnNpbihyYWQpLFxuXHRcdHk6IHggKiBNYXRoLnNpbihyYWQpICsgeSAqIE1hdGguY29zKHJhZClcblx0fVxufVxuXG5mdW5jdGlvbiByYWRpYW5zKGRlZ3Jlc3Mpe1xuXHRyZXR1cm4gZGVncmVzcyAqICjPgCAvIDE4MClcbn1cbiIsIlxubW9kdWxlLmV4cG9ydHMgPSByZWxhdGl2ZVxuXG4vKipcbiAqIGRlZmluZSBgcGF0aGAgdXNpbmcgcmVsYXRpdmUgcG9pbnRzXG4gKlxuICogQHBhcmFtIHtBcnJheX0gcGF0aFxuICogQHJldHVybiB7QXJyYXl9XG4gKi9cblxuZnVuY3Rpb24gcmVsYXRpdmUocGF0aCl7XG5cdHZhciBzdGFydFggPSAwXG5cdHZhciBzdGFydFkgPSAwXG5cdHZhciB4ID0gMFxuXHR2YXIgeSA9IDBcblxuXHRyZXR1cm4gcGF0aC5tYXAoZnVuY3Rpb24oc2VnKXtcblx0XHRzZWcgPSBzZWcuc2xpY2UoKVxuXHRcdHZhciB0eXBlID0gc2VnWzBdXG5cdFx0dmFyIGNvbW1hbmQgPSB0eXBlLnRvTG93ZXJDYXNlKClcblxuXHRcdC8vIGlzIGFic29sdXRlXG5cdFx0aWYgKHR5cGUgIT0gY29tbWFuZCkge1xuXHRcdFx0c2VnWzBdID0gY29tbWFuZFxuXHRcdFx0c3dpdGNoICh0eXBlKSB7XG5cdFx0XHRcdGNhc2UgJ0EnOlxuXHRcdFx0XHRcdHNlZ1s2XSAtPSB4XG5cdFx0XHRcdFx0c2VnWzddIC09IHlcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRjYXNlICdWJzpcblx0XHRcdFx0XHRzZWdbMV0gLT0geVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdGNhc2UgJ0gnOlxuXHRcdFx0XHRcdHNlZ1sxXSAtPSB4XG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRmb3IgKHZhciBpID0gMTsgaSA8IHNlZy5sZW5ndGg7KSB7XG5cdFx0XHRcdFx0XHRzZWdbaSsrXSAtPSB4XG5cdFx0XHRcdFx0XHRzZWdbaSsrXSAtPSB5XG5cdFx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIHVwZGF0ZSBjdXJzb3Igc3RhdGVcblx0XHRzd2l0Y2ggKGNvbW1hbmQpIHtcblx0XHRcdGNhc2UgJ3onOlxuXHRcdFx0XHR4ID0gc3RhcnRYXG5cdFx0XHRcdHkgPSBzdGFydFlcblx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgJ2gnOlxuXHRcdFx0XHR4ICs9IHNlZ1sxXVxuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSAndic6XG5cdFx0XHRcdHkgKz0gc2VnWzFdXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlICdtJzpcblx0XHRcdFx0eCArPSBzZWdbMV0gXG5cdFx0XHRcdHkgKz0gc2VnWzJdXG5cdFx0XHRcdHN0YXJ0WCArPSBzZWdbMV1cblx0XHRcdFx0c3RhcnRZICs9IHNlZ1syXVxuXHRcdFx0XHRicmVha1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0eCArPSBzZWdbc2VnLmxlbmd0aCAtIDJdXG5cdFx0XHRcdHkgKz0gc2VnW3NlZy5sZW5ndGggLSAxXVxuXHRcdH1cblxuXHRcdHJldHVybiBzZWdcblx0fSlcbn1cbiIsIi8qKlxuICogRXhwb3NlIGBzdHlsZXNgXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBzdHlsZXM7XG5cbi8qKlxuICogR2V0IGFsbCB0aGUgc3R5bGVzXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbFxuICogQHJldHVybiB7QXJyYXl9XG4gKi9cblxuZnVuY3Rpb24gc3R5bGVzKGVsKSB7XG4gIHJldHVybiBlbC5vd25lckRvY3VtZW50LmRlZmF1bHRWaWV3LmdldENvbXB1dGVkU3R5bGUoZWwsIG51bGwpO1xufVxuIiwiLyoqXG4gKiBNb2R1bGUgRGVwZW5kZW5jaWVzXG4gKi9cblxudmFyIHByZWZpeGVzID0gWydXZWJraXQnLCAnTycsICdNb3onLCAnbXMnXTtcblxuLyoqXG4gKiBFeHBvc2UgYHZlbmRvcmBcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHZlbmRvcjtcblxuLyoqXG4gKiBHZXQgdGhlIHZlbmRvciBwcmVmaXggZm9yIGEgZ2l2ZW4gcHJvcGVydHlcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gcHJvcFxuICogQHBhcmFtIHtPYmplY3R9IHN0eWxlXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cblxuZnVuY3Rpb24gdmVuZG9yKHByb3AsIHN0eWxlKSB7XG4gIC8vIHNob3J0Y3V0IGZvciBuYW1lcyB0aGF0IGFyZSBub3QgdmVuZG9yIHByZWZpeGVkXG4gIGlmIChzdHlsZVtwcm9wXSkgcmV0dXJuIHByb3A7XG5cbiAgLy8gY2hlY2sgZm9yIHZlbmRvciBwcmVmaXhlZCBuYW1lc1xuICB2YXIgY2FwTmFtZSA9IHByb3BbMF0udG9VcHBlckNhc2UoKSArIHByb3Auc2xpY2UoMSk7XG4gIHZhciBvcmlnaW5hbCA9IHByb3A7XG4gIHZhciBpID0gcHJlZml4ZXMubGVuZ3RoO1xuXG4gIHdoaWxlIChpLS0pIHtcbiAgICBwcm9wID0gcHJlZml4ZXNbaV0gKyBjYXBOYW1lO1xuICAgIGlmIChwcm9wIGluIHN0eWxlKSByZXR1cm4gcHJvcDtcbiAgfVxuXG4gIHJldHVybiBvcmlnaW5hbDtcbn1cbiIsIi8qKlxuICogRXhwb3J0IGBzd2FwYFxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gc3dhcDtcblxuLyoqXG4gKiBJbml0aWFsaXplIGBzd2FwYFxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHBhcmFtIHtBcnJheX0gYXJnc1xuICogQHJldHVybiB7TWl4ZWR9XG4gKi9cblxuZnVuY3Rpb24gc3dhcChlbCwgb3B0aW9ucywgZm4sIGFyZ3MpIHtcbiAgLy8gUmVtZW1iZXIgdGhlIG9sZCB2YWx1ZXMsIGFuZCBpbnNlcnQgdGhlIG5ldyBvbmVzXG4gIGZvciAodmFyIGtleSBpbiBvcHRpb25zKSB7XG4gICAgb2xkW2tleV0gPSBlbC5zdHlsZVtrZXldO1xuICAgIGVsLnN0eWxlW2tleV0gPSBvcHRpb25zW2tleV07XG4gIH1cblxuICByZXQgPSBmbi5hcHBseShlbCwgYXJncyB8fCBbXSk7XG5cbiAgLy8gUmV2ZXJ0IHRoZSBvbGQgdmFsdWVzXG4gIGZvciAoa2V5IGluIG9wdGlvbnMpIHtcbiAgICBlbC5zdHlsZVtrZXldID0gb2xkW2tleV07XG4gIH1cblxuICByZXR1cm4gcmV0O1xufVxuIiwiXG4vKipcbiAqIENoZWNrIGlmIGBlbGAgaXMgd2l0aGluIHRoZSBkb2N1bWVudC5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihlbCkge1xuICB2YXIgbm9kZSA9IGVsO1xuICB3aGlsZSAobm9kZSA9IG5vZGUucGFyZW50Tm9kZSkge1xuICAgIGlmIChub2RlID09IGRvY3VtZW50KSByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59OyIsIlxudmFyIGNsZWFuID0gcmVxdWlyZSgndG8tbm8tY2FzZScpO1xuXG5cbi8qKlxuICogRXhwb3NlIGB0b1NwYWNlQ2FzZWAuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSB0b1NwYWNlQ2FzZTtcblxuXG4vKipcbiAqIENvbnZlcnQgYSBgc3RyaW5nYCB0byBzcGFjZSBjYXNlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJpbmdcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuXG5cbmZ1bmN0aW9uIHRvU3BhY2VDYXNlIChzdHJpbmcpIHtcbiAgcmV0dXJuIGNsZWFuKHN0cmluZykucmVwbGFjZSgvW1xcV19dKygufCQpL2csIGZ1bmN0aW9uIChtYXRjaGVzLCBtYXRjaCkge1xuICAgIHJldHVybiBtYXRjaCA/ICcgJyArIG1hdGNoIDogJyc7XG4gIH0pO1xufSIsIlxuLyoqXG4gKiBFeHBvc2UgYHRvTm9DYXNlYC5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHRvTm9DYXNlO1xuXG5cbi8qKlxuICogVGVzdCB3aGV0aGVyIGEgc3RyaW5nIGlzIGNhbWVsLWNhc2UuXG4gKi9cblxudmFyIGhhc1NwYWNlID0gL1xccy87XG52YXIgaGFzQ2FtZWwgPSAvW2Etel1bQS1aXS87XG52YXIgaGFzU2VwYXJhdG9yID0gL1tcXFdfXS87XG5cblxuLyoqXG4gKiBSZW1vdmUgYW55IHN0YXJ0aW5nIGNhc2UgZnJvbSBhIGBzdHJpbmdgLCBsaWtlIGNhbWVsIG9yIHNuYWtlLCBidXQga2VlcFxuICogc3BhY2VzIGFuZCBwdW5jdHVhdGlvbiB0aGF0IG1heSBiZSBpbXBvcnRhbnQgb3RoZXJ3aXNlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJpbmdcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuXG5mdW5jdGlvbiB0b05vQ2FzZSAoc3RyaW5nKSB7XG4gIGlmIChoYXNTcGFjZS50ZXN0KHN0cmluZykpIHJldHVybiBzdHJpbmcudG9Mb3dlckNhc2UoKTtcblxuICBpZiAoaGFzU2VwYXJhdG9yLnRlc3Qoc3RyaW5nKSkgc3RyaW5nID0gdW5zZXBhcmF0ZShzdHJpbmcpO1xuICBpZiAoaGFzQ2FtZWwudGVzdChzdHJpbmcpKSBzdHJpbmcgPSB1bmNhbWVsaXplKHN0cmluZyk7XG4gIHJldHVybiBzdHJpbmcudG9Mb3dlckNhc2UoKTtcbn1cblxuXG4vKipcbiAqIFNlcGFyYXRvciBzcGxpdHRlci5cbiAqL1xuXG52YXIgc2VwYXJhdG9yU3BsaXR0ZXIgPSAvW1xcV19dKygufCQpL2c7XG5cblxuLyoqXG4gKiBVbi1zZXBhcmF0ZSBhIGBzdHJpbmdgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJpbmdcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuXG5mdW5jdGlvbiB1bnNlcGFyYXRlIChzdHJpbmcpIHtcbiAgcmV0dXJuIHN0cmluZy5yZXBsYWNlKHNlcGFyYXRvclNwbGl0dGVyLCBmdW5jdGlvbiAobSwgbmV4dCkge1xuICAgIHJldHVybiBuZXh0ID8gJyAnICsgbmV4dCA6ICcnO1xuICB9KTtcbn1cblxuXG4vKipcbiAqIENhbWVsY2FzZSBzcGxpdHRlci5cbiAqL1xuXG52YXIgY2FtZWxTcGxpdHRlciA9IC8oLikoW0EtWl0rKS9nO1xuXG5cbi8qKlxuICogVW4tY2FtZWxjYXNlIGEgYHN0cmluZ2AuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0cmluZ1xuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5cbmZ1bmN0aW9uIHVuY2FtZWxpemUgKHN0cmluZykge1xuICByZXR1cm4gc3RyaW5nLnJlcGxhY2UoY2FtZWxTcGxpdHRlciwgZnVuY3Rpb24gKG0sIHByZXZpb3VzLCB1cHBlcnMpIHtcbiAgICByZXR1cm4gcHJldmlvdXMgKyAnICcgKyB1cHBlcnMudG9Mb3dlckNhc2UoKS5zcGxpdCgnJykuam9pbignICcpO1xuICB9KTtcbn0iLCJcbmV4cG9ydHMuaXNhdHR5ID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gZmFsc2U7IH07XG5cbmZ1bmN0aW9uIFJlYWRTdHJlYW0oKSB7XG4gIHRocm93IG5ldyBFcnJvcigndHR5LlJlYWRTdHJlYW0gaXMgbm90IGltcGxlbWVudGVkJyk7XG59XG5leHBvcnRzLlJlYWRTdHJlYW0gPSBSZWFkU3RyZWFtO1xuXG5mdW5jdGlvbiBXcml0ZVN0cmVhbSgpIHtcbiAgdGhyb3cgbmV3IEVycm9yKCd0dHkuUmVhZFN0cmVhbSBpcyBub3QgaW1wbGVtZW50ZWQnKTtcbn1cbmV4cG9ydHMuV3JpdGVTdHJlYW0gPSBXcml0ZVN0cmVhbTtcbiJdfQ==