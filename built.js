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
    var sandbox = example.find('.sandbox')[0]
    var box = boxs[0] || sandbox.firstChild
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

},"/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/df04901/tween/number.js": function(module,exports,require){

module.exports = function(from, to){
  from = parseFloat(from, 10) || 0
  to = parseFloat(to, 10) || 0
  return function frame(n){
    return from + (to - from) * n
  }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL1VzZXJzL2prcm9zby9Qcm9qZWN0cy9qcy9tb3ZlL2V4YW1wbGVzLm9yaWdpbmFsLmpzIiwic291cmNlcyI6WyIvbm9kZV9tb2R1bGVzL2Nzcy1pbnN0YWxsLmpzIiwiL25vZGVfbW9kdWxlcy9qYWRlLXJ1bnRpbWUuanMiLCIvVXNlcnMvamtyb3NvL1Byb2plY3RzL2pzL21vdmUvZXhhbXBsZXMub3JpZ2luYWwuanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2prcm9zby9tb3ZlL3RhcmJhbGwvZGYwNDkwMS9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vY29tcG9uZW50L2RvbS90YXJiYWxsLzJlMDQxZjkvaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2prcm9zby9tb3ZlL3RhcmJhbGwvZGYwNDkwMS9tb3ZlLmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9qa3Jvc28vbW92ZS90YXJiYWxsL2RmMDQ5MDEvc3ZnLmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9jb21wb25lbnQvZG9taWZ5L3RhcmJhbGwvMS4wLjAvaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2NvbXBvbmVudC9ldmVudC90YXJiYWxsLzAuMS4yL2luZGV4LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9jb21wb25lbnQvcXVlcnkvdGFyYmFsbC8wLjAuMS9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vY29tcG9uZW50L3RyaW0vdGFyYmFsbC8wLjAuMS9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vY29tcG9uZW50L3F1ZXJ5L3RhcmJhbGwvMC4wLjIvaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL3lpZWxkcy9pc0FycmF5L3RhcmJhbGwvMS4wLjAvaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2NvbXBvbmVudC9kb20vdGFyYmFsbC8yZTA0MWY5L2xpYi9hdHRyaWJ1dGVzLmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9jb21wb25lbnQvZG9tL3RhcmJhbGwvMmUwNDFmOS9saWIvY2xhc3Nlcy5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vY29tcG9uZW50L2RvbS90YXJiYWxsLzJlMDQxZjkvbGliL2V2ZW50cy5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vY29tcG9uZW50L2RvbS90YXJiYWxsLzJlMDQxZjkvbGliL21hbmlwdWxhdGUuanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2NvbXBvbmVudC9kb20vdGFyYmFsbC8yZTA0MWY5L2xpYi90cmF2ZXJzZS5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vamtyb3NvL2FuaW1hdGlvbi90YXJiYWxsLzAuMS4wL2luZGV4LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9qa3Jvc28vdW5tYXRyaXgvdGFyYmFsbC8wLjEuMC9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vamtyb3NvL2Nsb25lL3RhcmJhbGwvMC4zLjAvaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9yZWdpc3RyeS5ucG1qcy5vcmcvcHJlZml4Ly0vcHJlZml4LTAuMi4xLnRnei9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL3JlZ2lzdHJ5Lm5wbWpzLm9yZy9sYXp5LXByb3BlcnR5Ly0vbGF6eS1wcm9wZXJ0eS0wLjAuMi50Z3ovcGFja2FnZS5qc29uIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9jb21wb25lbnQvdmFsdWUvdGFyYmFsbC8xLjEuMC9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vY29tcG9uZW50L2NsYXNzZXMvdGFyYmFsbC8xLjEuMi9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vY29tcG9uZW50L2RlbGVnYXRlL3RhcmJhbGwvMC4xLjAvaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2NvbXBvbmVudC9jc3MvdGFyYmFsbC8wLjAuMy9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vY29tcG9uZW50L21hdGNoZXMtc2VsZWN0b3IvdGFyYmFsbC8wLjEuMS9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20veWllbGRzL3RyYXZlcnNlL3RhcmJhbGwvMC4xLjEvaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2NvbXBvbmVudC90by1mdW5jdGlvbi90YXJiYWxsL2dldHRlci9mbnMvaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2prcm9zby9tb3ZlL3RhcmJhbGwvZGYwNDkwMS90d2Vlbi9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL3JlZ2lzdHJ5Lm5wbWpzLm9yZy9sYXp5LXByb3BlcnR5Ly0vbGF6eS1wcm9wZXJ0eS0wLjAuMi50Z3ovbGF6eVByb3BlcnR5LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9qa3Jvc28vZXh0ZW5zaWJsZS90YXJiYWxsLzAuMi4wL2luZGV4LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9qa3Jvc28vZW1pdHRlci90YXJiYWxsLzAuMTAuMC9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vamtyb3NvL25vdy90YXJiYWxsLzAuMS4xL2luZGV4LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9qa3Jvc28vdHlwZS90YXJiYWxsLzEuMC4yL2luZGV4LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vcmVnaXN0cnkubnBtanMub3JnL3BhcnNlLWR1cmF0aW9uLy0vcGFyc2UtZHVyYXRpb24tMC4xLjAudGd6L2luZGV4LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9jb21wb25lbnQvZWFzZS90YXJiYWxsLzEuMC4wL2luZGV4LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9jb21wb25lbnQvcmFmL3RhcmJhbGwvMS4xLjIvaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2NvbXBvbmVudC90eXBlL3RhcmJhbGwvMS4wLjAvaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2NvbXBvbmVudC9pbmRleG9mL3RhcmJhbGwvMC4wLjIvaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL3Zpc2lvbm1lZGlhL2RlYnVnL3RhcmJhbGwvMC43LjQvaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2NvbXBvbmVudC9jc3MvdGFyYmFsbC8wLjAuMy9saWIvc3R5bGUuanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2NvbXBvbmVudC9jc3MvdGFyYmFsbC8wLjAuMy9saWIvY3NzLmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9jb21wb25lbnQvcHJvcHMvdGFyYmFsbC8xLjEuMC9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL3JlZ2lzdHJ5Lm5wbWpzLm9yZy9wcm9wcy1jb21wb25lbnQvLS9wcm9wcy1jb21wb25lbnQtMS4wLjMudGd6L2luZGV4LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9qa3Jvc28vbW92ZS90YXJiYWxsL2RmMDQ5MDEvdHdlZW4vbnVtYmVyLmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9qa3Jvc28vbW92ZS90YXJiYWxsL2RmMDQ5MDEvdHdlZW4vbWF0cml4LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9qa3Jvc28vbW92ZS90YXJiYWxsL2RmMDQ5MDEvdHdlZW4vY29sb3IuanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2prcm9zby9tb3ZlL3RhcmJhbGwvZGYwNDkwMS90d2Vlbi9wYXRoLmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9qa3Jvc28vbW92ZS90YXJiYWxsL2RmMDQ5MDEvdHdlZW4vcHguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9yZWdpc3RyeS5ucG1qcy5vcmcvY29sb3ItcGFyc2VyLy0vY29sb3ItcGFyc2VyLTAuMS4wLnRnei9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vbmF0aGFuNy9pbmhlcml0L3RhcmJhbGwvZjFhNzViNDg0NC9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20veWllbGRzL21lcmdlL3RhcmJhbGwvMmYzNTdjYjUwMS9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20veWllbGRzL21lcmdlL3RhcmJhbGwvMmYzNTdjYi9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vdmlzaW9ubWVkaWEvZGVidWcvdGFyYmFsbC8wLjcuNC9kZWJ1Zy5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vdmlzaW9ubWVkaWEvZGVidWcvdGFyYmFsbC8wLjcuNC9saWIvZGVidWcuanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2NvbXBvbmVudC9jc3MvdGFyYmFsbC8wLjAuMy9saWIvc3VwcG9ydC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vY29tcG9uZW50L2Nzcy90YXJiYWxsLzAuMC4zL2xpYi9wcm9wLmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9jb21wb25lbnQvY3NzL3RhcmJhbGwvMC4wLjMvbGliL2hvb2tzLmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9jb21wb25lbnQvY3NzL3RhcmJhbGwvMC4wLjMvbGliL2NvbXB1dGVkLmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9pYW5zdG9ybXRheWxvci90by1jYW1lbC1jYXNlL3RhcmJhbGwvMC4yLjEvaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9yZWdpc3RyeS5ucG1qcy5vcmcvY29sb3ItcGFyc2VyLy0vY29sb3ItcGFyc2VyLTAuMS4wLnRnei9jb2xvcnMuanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9yZWdpc3RyeS5ucG1qcy5vcmcvc3RyaW5nLXR3ZWVuLy0vc3RyaW5nLXR3ZWVuLTAuMS4wLnRnei9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL3JlZ2lzdHJ5Lm5wbWpzLm9yZy9zZXJpYWxpemUtc3ZnLXBhdGgvLS9zZXJpYWxpemUtc3ZnLXBhdGgtMC4xLjAudGd6L2luZGV4LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vcmVnaXN0cnkubnBtanMub3JnL2JhbGFuY2Utc3ZnLXBhdGhzLy0vYmFsYW5jZS1zdmctcGF0aHMtMC4xLjAudGd6L2luZGV4LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vcmVnaXN0cnkubnBtanMub3JnL2Zjb21wLy0vZmNvbXAtMS4xLjAudGd6L2luZGV4LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vcmVnaXN0cnkubnBtanMub3JnL3BhcnNlLXN2Zy1wYXRoLy0vcGFyc2Utc3ZnLXBhdGgtMC4xLjEudGd6L2luZGV4LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vcmVnaXN0cnkubnBtanMub3JnL2Ficy1zdmctcGF0aC8tL2Ficy1zdmctcGF0aC0wLjEuMS50Z3ovaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9yZWdpc3RyeS5ucG1qcy5vcmcvbm9ybWFsaXplLXN2Zy1wYXRoLy0vbm9ybWFsaXplLXN2Zy1wYXRoLTAuMS4wLnRnei9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL3JlZ2lzdHJ5Lm5wbWpzLm9yZy9yZWwtc3ZnLXBhdGgvLS9yZWwtc3ZnLXBhdGgtMC4xLjAudGd6L2luZGV4LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9jb21wb25lbnQvY3NzL3RhcmJhbGwvMC4wLjMvbGliL3ZlbmRvci5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vY29tcG9uZW50L2Nzcy90YXJiYWxsLzAuMC4zL2xpYi9zd2FwLmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9jb21wb25lbnQvY3NzL3RhcmJhbGwvMC4wLjMvbGliL3N0eWxlcy5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vY29tcG9uZW50L3dpdGhpbi1kb2N1bWVudC90YXJiYWxsLzAuMC4xL2luZGV4LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vcmVnaXN0cnkubnBtanMub3JnL3RvLXNwYWNlLWNhc2UvLS90by1zcGFjZS1jYXNlLTAuMS4yLnRnei9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL3JlZ2lzdHJ5Lm5wbWpzLm9yZy90by1uby1jYXNlLy0vdG8tbm8tY2FzZS0wLjEuMS50Z3ovaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9yZWdpc3RyeS5ucG1qcy5vcmcvYnJvd3Nlci1idWlsdGlucy8tL2Jyb3dzZXItYnVpbHRpbnMtMi4wLjAudGd6L2J1aWx0aW4vdHR5LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FEdk1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FFSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1TkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdFNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdlFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDalNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RUE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeE1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAodGV4dCkge1xuXHR2YXIgc3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpXG5cdHN0eWxlLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRleHQpKVxuXHRkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdLmFwcGVuZENoaWxkKHN0eWxlKVxufSIsIlxyXG4vKiFcclxuICogSmFkZSAtIHJ1bnRpbWVcclxuICogQ29weXJpZ2h0KGMpIDIwMTAgVEogSG9sb3dheWNodWsgPHRqQHZpc2lvbi1tZWRpYS5jYT5cclxuICogTUlUIExpY2Vuc2VkXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIExhbWUgQXJyYXkuaXNBcnJheSgpIHBvbHlmaWxsIGZvciBub3cuXHJcbiAqL1xyXG5cclxuaWYgKCFBcnJheS5pc0FycmF5KSB7XHJcbiAgQXJyYXkuaXNBcnJheSA9IGZ1bmN0aW9uKGFycil7XHJcbiAgICByZXR1cm4gJ1tvYmplY3QgQXJyYXldJyA9PSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYXJyKTtcclxuICB9O1xyXG59XHJcblxyXG4vKipcclxuICogTGFtZSBPYmplY3Qua2V5cygpIHBvbHlmaWxsIGZvciBub3cuXHJcbiAqL1xyXG5cclxuaWYgKCFPYmplY3Qua2V5cykge1xyXG4gIE9iamVjdC5rZXlzID0gZnVuY3Rpb24ob2JqKXtcclxuICAgIHZhciBhcnIgPSBbXTtcclxuICAgIGZvciAodmFyIGtleSBpbiBvYmopIHtcclxuICAgICAgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XHJcbiAgICAgICAgYXJyLnB1c2goa2V5KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGFycjtcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBNZXJnZSB0d28gYXR0cmlidXRlIG9iamVjdHMgZ2l2aW5nIHByZWNlZGVuY2VcclxuICogdG8gdmFsdWVzIGluIG9iamVjdCBgYmAuIENsYXNzZXMgYXJlIHNwZWNpYWwtY2FzZWRcclxuICogYWxsb3dpbmcgZm9yIGFycmF5cyBhbmQgbWVyZ2luZy9qb2luaW5nIGFwcHJvcHJpYXRlbHlcclxuICogcmVzdWx0aW5nIGluIGEgc3RyaW5nLlxyXG4gKlxyXG4gKiBAcGFyYW0ge09iamVjdH0gYVxyXG4gKiBAcGFyYW0ge09iamVjdH0gYlxyXG4gKiBAcmV0dXJuIHtPYmplY3R9IGFcclxuICogQGFwaSBwcml2YXRlXHJcbiAqL1xyXG5cclxuZXhwb3J0cy5tZXJnZSA9IGZ1bmN0aW9uIG1lcmdlKGEsIGIpIHtcclxuICB2YXIgYWMgPSBhWydjbGFzcyddO1xyXG4gIHZhciBiYyA9IGJbJ2NsYXNzJ107XHJcblxyXG4gIGlmIChhYyB8fCBiYykge1xyXG4gICAgYWMgPSBhYyB8fCBbXTtcclxuICAgIGJjID0gYmMgfHwgW107XHJcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoYWMpKSBhYyA9IFthY107XHJcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoYmMpKSBiYyA9IFtiY107XHJcbiAgICBhWydjbGFzcyddID0gYWMuY29uY2F0KGJjKS5maWx0ZXIobnVsbHMpO1xyXG4gIH1cclxuXHJcbiAgZm9yICh2YXIga2V5IGluIGIpIHtcclxuICAgIGlmIChrZXkgIT0gJ2NsYXNzJykge1xyXG4gICAgICBhW2tleV0gPSBiW2tleV07XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4gYTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBGaWx0ZXIgbnVsbCBgdmFsYHMuXHJcbiAqXHJcbiAqIEBwYXJhbSB7Kn0gdmFsXHJcbiAqIEByZXR1cm4ge0Jvb2xlYW59XHJcbiAqIEBhcGkgcHJpdmF0ZVxyXG4gKi9cclxuXHJcbmZ1bmN0aW9uIG51bGxzKHZhbCkge1xyXG4gIHJldHVybiB2YWwgIT0gbnVsbCAmJiB2YWwgIT09ICcnO1xyXG59XHJcblxyXG4vKipcclxuICogam9pbiBhcnJheSBhcyBjbGFzc2VzLlxyXG4gKlxyXG4gKiBAcGFyYW0geyp9IHZhbFxyXG4gKiBAcmV0dXJuIHtTdHJpbmd9XHJcbiAqIEBhcGkgcHJpdmF0ZVxyXG4gKi9cclxuXHJcbmZ1bmN0aW9uIGpvaW5DbGFzc2VzKHZhbCkge1xyXG4gIHJldHVybiBBcnJheS5pc0FycmF5KHZhbCkgPyB2YWwubWFwKGpvaW5DbGFzc2VzKS5maWx0ZXIobnVsbHMpLmpvaW4oJyAnKSA6IHZhbDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJlbmRlciB0aGUgZ2l2ZW4gYXR0cmlidXRlcyBvYmplY3QuXHJcbiAqXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcclxuICogQHBhcmFtIHtPYmplY3R9IGVzY2FwZWRcclxuICogQHJldHVybiB7U3RyaW5nfVxyXG4gKiBAYXBpIHByaXZhdGVcclxuICovXHJcblxyXG5leHBvcnRzLmF0dHJzID0gZnVuY3Rpb24gYXR0cnMob2JqLCBlc2NhcGVkKXtcclxuICB2YXIgYnVmID0gW11cclxuICAgICwgdGVyc2UgPSBvYmoudGVyc2U7XHJcblxyXG4gIGRlbGV0ZSBvYmoudGVyc2U7XHJcbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhvYmopXHJcbiAgICAsIGxlbiA9IGtleXMubGVuZ3RoO1xyXG5cclxuICBpZiAobGVuKSB7XHJcbiAgICBidWYucHVzaCgnJyk7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgKytpKSB7XHJcbiAgICAgIHZhciBrZXkgPSBrZXlzW2ldXHJcbiAgICAgICAgLCB2YWwgPSBvYmpba2V5XTtcclxuXHJcbiAgICAgIGlmICgnYm9vbGVhbicgPT0gdHlwZW9mIHZhbCB8fCBudWxsID09IHZhbCkge1xyXG4gICAgICAgIGlmICh2YWwpIHtcclxuICAgICAgICAgIHRlcnNlXHJcbiAgICAgICAgICAgID8gYnVmLnB1c2goa2V5KVxyXG4gICAgICAgICAgICA6IGJ1Zi5wdXNoKGtleSArICc9XCInICsga2V5ICsgJ1wiJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2UgaWYgKDAgPT0ga2V5LmluZGV4T2YoJ2RhdGEnKSAmJiAnc3RyaW5nJyAhPSB0eXBlb2YgdmFsKSB7XHJcbiAgICAgICAgYnVmLnB1c2goa2V5ICsgXCI9J1wiICsgSlNPTi5zdHJpbmdpZnkodmFsKSArIFwiJ1wiKTtcclxuICAgICAgfSBlbHNlIGlmICgnY2xhc3MnID09IGtleSkge1xyXG4gICAgICAgIGlmIChlc2NhcGVkICYmIGVzY2FwZWRba2V5XSl7XHJcbiAgICAgICAgICBpZiAodmFsID0gZXhwb3J0cy5lc2NhcGUoam9pbkNsYXNzZXModmFsKSkpIHtcclxuICAgICAgICAgICAgYnVmLnB1c2goa2V5ICsgJz1cIicgKyB2YWwgKyAnXCInKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgaWYgKHZhbCA9IGpvaW5DbGFzc2VzKHZhbCkpIHtcclxuICAgICAgICAgICAgYnVmLnB1c2goa2V5ICsgJz1cIicgKyB2YWwgKyAnXCInKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSBpZiAoZXNjYXBlZCAmJiBlc2NhcGVkW2tleV0pIHtcclxuICAgICAgICBidWYucHVzaChrZXkgKyAnPVwiJyArIGV4cG9ydHMuZXNjYXBlKHZhbCkgKyAnXCInKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBidWYucHVzaChrZXkgKyAnPVwiJyArIHZhbCArICdcIicpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4gYnVmLmpvaW4oJyAnKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBFc2NhcGUgdGhlIGdpdmVuIHN0cmluZyBvZiBgaHRtbGAuXHJcbiAqXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBodG1sXHJcbiAqIEByZXR1cm4ge1N0cmluZ31cclxuICogQGFwaSBwcml2YXRlXHJcbiAqL1xyXG5cclxuZXhwb3J0cy5lc2NhcGUgPSBmdW5jdGlvbiBlc2NhcGUoaHRtbCl7XHJcbiAgcmV0dXJuIFN0cmluZyhodG1sKVxyXG4gICAgLnJlcGxhY2UoLyYvZywgJyZhbXA7JylcclxuICAgIC5yZXBsYWNlKC88L2csICcmbHQ7JylcclxuICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcclxuICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7Jyk7XHJcbn07XHJcblxyXG4vKipcclxuICogUmUtdGhyb3cgdGhlIGdpdmVuIGBlcnJgIGluIGNvbnRleHQgdG8gdGhlXHJcbiAqIHRoZSBqYWRlIGluIGBmaWxlbmFtZWAgYXQgdGhlIGdpdmVuIGBsaW5lbm9gLlxyXG4gKlxyXG4gKiBAcGFyYW0ge0Vycm9yfSBlcnJcclxuICogQHBhcmFtIHtTdHJpbmd9IGZpbGVuYW1lXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBsaW5lbm9cclxuICogQGFwaSBwcml2YXRlXHJcbiAqL1xyXG5cclxuZXhwb3J0cy5yZXRocm93ID0gZnVuY3Rpb24gcmV0aHJvdyhlcnIsIGZpbGVuYW1lLCBsaW5lbm8sIHN0cil7XHJcbiAgaWYgKCEoZXJyIGluc3RhbmNlb2YgRXJyb3IpKSB0aHJvdyBlcnI7XHJcbiAgaWYgKCh0eXBlb2Ygd2luZG93ICE9ICd1bmRlZmluZWQnIHx8ICFmaWxlbmFtZSkgJiYgIXN0cikge1xyXG4gICAgZXJyLm1lc3NhZ2UgKz0gJyBvbiBsaW5lICcgKyBsaW5lbm87XHJcbiAgICB0aHJvdyBlcnI7XHJcbiAgfVxyXG4gIHRyeSB7XHJcbiAgICBzdHIgPSAgc3RyIHx8IHJlcXVpcmUoJ2ZzJykucmVhZEZpbGVTeW5jKGZpbGVuYW1lLCAndXRmOCcpXHJcbiAgfSBjYXRjaCAoZXgpIHtcclxuICAgIHJldGhyb3coZXJyLCBudWxsLCBsaW5lbm8pXHJcbiAgfVxyXG4gIHZhciBjb250ZXh0ID0gM1xyXG4gICAgLCBsaW5lcyA9IHN0ci5zcGxpdCgnXFxuJylcclxuICAgICwgc3RhcnQgPSBNYXRoLm1heChsaW5lbm8gLSBjb250ZXh0LCAwKVxyXG4gICAgLCBlbmQgPSBNYXRoLm1pbihsaW5lcy5sZW5ndGgsIGxpbmVubyArIGNvbnRleHQpO1xyXG5cclxuICAvLyBFcnJvciBjb250ZXh0XHJcbiAgdmFyIGNvbnRleHQgPSBsaW5lcy5zbGljZShzdGFydCwgZW5kKS5tYXAoZnVuY3Rpb24obGluZSwgaSl7XHJcbiAgICB2YXIgY3VyciA9IGkgKyBzdGFydCArIDE7XHJcbiAgICByZXR1cm4gKGN1cnIgPT0gbGluZW5vID8gJyAgPiAnIDogJyAgICAnKVxyXG4gICAgICArIGN1cnJcclxuICAgICAgKyAnfCAnXHJcbiAgICAgICsgbGluZTtcclxuICB9KS5qb2luKCdcXG4nKTtcclxuXHJcbiAgLy8gQWx0ZXIgZXhjZXB0aW9uIG1lc3NhZ2VcclxuICBlcnIucGF0aCA9IGZpbGVuYW1lO1xyXG4gIGVyci5tZXNzYWdlID0gKGZpbGVuYW1lIHx8ICdKYWRlJykgKyAnOicgKyBsaW5lbm9cclxuICAgICsgJ1xcbicgKyBjb250ZXh0ICsgJ1xcblxcbicgKyBlcnIubWVzc2FnZTtcclxuICB0aHJvdyBlcnI7XHJcbn07XHJcbiIsIlxudmFyIG1vdmUgPSByZXF1aXJlKCdtb3ZlJylcbnZhciBkb20gPSByZXF1aXJlKCdkb20nKVxuXG5kb20oJy5leGFtcGxlJykuZWFjaChmdW5jdGlvbihleGFtcGxlKXtcbiAgZXhhbXBsZS5pbml0aWFsID0gZXhhbXBsZS5maW5kKCcuc2FuZGJveCcpLmh0bWwoKVxuICB2YXIgcGxheSA9IGV4YW1wbGUuZmluZCgnYnV0dG9uLnBsYXknKVxuICBleGFtcGxlLmZpbmQoJy5zb3VyY2UgY29kZScpLmh0bWwoaGlnaGxpZ2h0KGV4YW1wbGUuZmluZCgnLnNvdXJjZScpLnRleHQoKSkpXG5cbiAgaWYgKCFwbGF5Lmxlbmd0aCkgcmV0dXJuIHJ1bigpXG5cbiAgcGxheS5vbignbW91c2Vkb3duJywgcnVuKVxuXG4gIGV4YW1wbGUuZmluZCgnaDMnKS5hcHBlbmQoJzxidXR0b24gY2xhc3M9XCJyZXNldFwiPuKGuzwvYnV0dG9uPicpXG4gIGV4YW1wbGUuZmluZCgnYnV0dG9uLnJlc2V0Jykub24oJ21vdXNlZG93bicsIGZ1bmN0aW9uKGUpe1xuICAgIGV4YW1wbGUuZmluZCgnLnNhbmRib3gnKS5odG1sKGV4YW1wbGUuaW5pdGlhbClcbiAgfSlcblxuICBmdW5jdGlvbiBydW4oKXtcbiAgICB2YXIgYm94cyA9IGV4YW1wbGUuZmluZCgnLmJveC5zbWFsbCcpLnRvQXJyYXkoKVxuICAgIHZhciBzYW5kYm94ID0gZXhhbXBsZS5maW5kKCcuc2FuZGJveCcpWzBdXG4gICAgdmFyIGJveCA9IGJveHNbMF0gfHwgc2FuZGJveC5maXJzdENoaWxkXG4gICAgZXZhbChleGFtcGxlLmZpbmQoJy5zb3VyY2UnKS50ZXh0KCkpXG4gIH1cbn0pXG5cbi8qKlxuICogSGlnaGxpZ2h0IHRoZSBnaXZlbiBzdHJpbmcgb2YgYGpzYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30ganNcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGhpZ2hsaWdodChqcykge1xuICByZXR1cm4ganNcbiAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKVxuICAgIC5yZXBsYWNlKC9cXC9cXC8oLiopL2dtLCAnPHNwYW4gY2xhc3M9XCJjb21tZW50XCI+Ly8kMTwvc3Bhbj4nKVxuICAgIC5yZXBsYWNlKC8oJy4qPycpL2dtLCAnPHNwYW4gY2xhc3M9XCJzdHJpbmdcIj4kMTwvc3Bhbj4nKVxuICAgIC5yZXBsYWNlKC8oXFxkK1xcLlxcZCspL2dtLCAnPHNwYW4gY2xhc3M9XCJudW1iZXJcIj4kMTwvc3Bhbj4nKVxuICAgIC5yZXBsYWNlKC8oXFxkKykvZ20sICc8c3BhbiBjbGFzcz1cIm51bWJlclwiPiQxPC9zcGFuPicpXG4gICAgLnJlcGxhY2UoL1xcYm5ldyAqKFxcdyspL2dtLCAnPHNwYW4gY2xhc3M9XCJrZXl3b3JkXCI+bmV3PC9zcGFuPiA8c3BhbiBjbGFzcz1cImluaXRcIj4kMTwvc3Bhbj4nKVxuICAgIC5yZXBsYWNlKC9cXGIoZnVuY3Rpb258bmV3fHRocm93fHJldHVybnx2YXJ8aWZ8ZWxzZSlcXGIvZ20sICc8c3BhbiBjbGFzcz1cImtleXdvcmRcIj4kMTwvc3Bhbj4nKVxufVxuIiwiXG52YXIgcXVlcnkgPSByZXF1aXJlKCdxdWVyeScpXG52YXIgTW92ZSA9IHJlcXVpcmUoJy4vbW92ZScpXG52YXIgU1ZHID0gcmVxdWlyZSgnLi9zdmcnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGVsKXtcbiAgaWYgKHR5cGVvZiBlbCA9PSAnc3RyaW5nJykgZWwgPSBxdWVyeShlbClcbiAgaWYgKGVsIGluc3RhbmNlb2YgU1ZHRWxlbWVudCkgcmV0dXJuIG5ldyBTVkcoZWwpXG4gIHJldHVybiBuZXcgTW92ZShlbClcbn1cbiIsIi8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL1xuXG52YXIgaXNBcnJheSA9IHJlcXVpcmUoJ2lzQXJyYXknKTtcbnZhciBkb21pZnkgPSByZXF1aXJlKCdkb21pZnknKTtcbnZhciBldmVudHMgPSByZXF1aXJlKCdldmVudCcpO1xudmFyIHF1ZXJ5ID0gcmVxdWlyZSgncXVlcnknKTtcbnZhciB0cmltID0gcmVxdWlyZSgndHJpbScpO1xudmFyIHNsaWNlID0gW10uc2xpY2U7XG5cbi8qKlxuICogQXR0cmlidXRlcyBzdXBwb3J0ZWQuXG4gKi9cblxudmFyIGF0dHJzID0gW1xuICAnaWQnLFxuICAnc3JjJyxcbiAgJ3JlbCcsXG4gICdjb2xzJyxcbiAgJ3Jvd3MnLFxuICAndHlwZScsXG4gICduYW1lJyxcbiAgJ2hyZWYnLFxuICAndGl0bGUnLFxuICAnc3R5bGUnLFxuICAnd2lkdGgnLFxuICAnaGVpZ2h0JyxcbiAgJ2FjdGlvbicsXG4gICdtZXRob2QnLFxuICAndGFiaW5kZXgnLFxuICAncGxhY2Vob2xkZXInXG5dO1xuXG4vKlxuICogQSBzaW1wbGUgd2F5IHRvIGNoZWNrIGZvciBIVE1MIHN0cmluZ3Mgb3IgSUQgc3RyaW5nc1xuICovXG5cbnZhciBxdWlja0V4cHIgPSAvXig/OlteIzxdKig8W1xcd1xcV10rPilbXj5dKiR8IyhbXFx3XFwtXSopJCkvO1xuXG4vKipcbiAqIEV4cG9zZSBgZG9tKClgLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZG9tO1xuXG4vKipcbiAqIFJldHVybiBhIGRvbSBgTGlzdGAgZm9yIHRoZSBnaXZlblxuICogYGh0bWxgLCBzZWxlY3Rvciwgb3IgZWxlbWVudC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xFbGVtZW50fExpc3R9IHNlbGVjdG9yXG4gKiBAcGFyYW0ge1N0cmluZ3xFTGVtZW50fGNvbnRleHR9IGNvbnRleHRcbiAqIEByZXR1cm4ge0xpc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIGRvbShzZWxlY3RvciwgY29udGV4dCkge1xuICAvLyBhcnJheVxuICBpZiAoaXNBcnJheShzZWxlY3RvcikpIHtcbiAgICByZXR1cm4gbmV3IExpc3Qoc2VsZWN0b3IpO1xuICB9XG5cbiAgLy8gTGlzdFxuICBpZiAoc2VsZWN0b3IgaW5zdGFuY2VvZiBMaXN0KSB7XG4gICAgcmV0dXJuIHNlbGVjdG9yO1xuICB9XG5cbiAgLy8gbm9kZVxuICBpZiAoc2VsZWN0b3Iubm9kZU5hbWUpIHtcbiAgICByZXR1cm4gbmV3IExpc3QoW3NlbGVjdG9yXSk7XG4gIH1cblxuICBpZiAoJ3N0cmluZycgIT0gdHlwZW9mIHNlbGVjdG9yKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignaW52YWxpZCBzZWxlY3RvcicpO1xuICB9XG5cbiAgLy8gaHRtbFxuICB2YXIgaHRtbHNlbGVjdG9yID0gdHJpbS5sZWZ0KHNlbGVjdG9yKTtcbiAgaWYgKGlzSFRNTChodG1sc2VsZWN0b3IpKSB7XG4gICAgcmV0dXJuIG5ldyBMaXN0KFtkb21pZnkoaHRtbHNlbGVjdG9yKV0sIGh0bWxzZWxlY3Rvcik7XG4gIH1cblxuICAvLyBzZWxlY3RvclxuICB2YXIgY3R4ID0gY29udGV4dFxuICAgID8gKGNvbnRleHQgaW5zdGFuY2VvZiBMaXN0ID8gY29udGV4dFswXSA6IGNvbnRleHQpXG4gICAgOiBkb2N1bWVudDtcblxuICByZXR1cm4gbmV3IExpc3QocXVlcnkuYWxsKHNlbGVjdG9yLCBjdHgpLCBzZWxlY3Rvcik7XG59XG5cbi8qKlxuICogU3RhdGljOiBFeHBvc2UgYExpc3RgXG4gKi9cblxuZG9tLkxpc3QgPSBMaXN0O1xuXG4vKipcbiAqIFN0YXRpYzogRXhwb3NlIHN1cHBvcnRlZCBhdHRycy5cbiAqL1xuXG5kb20uYXR0cnMgPSBhdHRycztcblxuLyoqXG4gKiBTdGF0aWM6IE1peGluIGEgZnVuY3Rpb25cbiAqXG4gKiBAcGFyYW0ge09iamVjdHxTdHJpbmd9IG5hbWVcbiAqIEBwYXJhbSB7T2JqZWN0fEZ1bmN0aW9ufSBvYmpcbiAqIEByZXR1cm4ge0xpc3R9IHNlbGZcbiAqL1xuXG5kb20udXNlID0gZnVuY3Rpb24obmFtZSwgZm4pIHtcbiAgdmFyIGtleXMgPSBbXTtcbiAgdmFyIHRtcDtcblxuICBpZiAoMiA9PSBhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAga2V5cy5wdXNoKG5hbWUpO1xuICAgIHRtcCA9IHt9O1xuICAgIHRtcFtuYW1lXSA9IGZuO1xuICAgIGZuID0gdG1wO1xuICB9IGVsc2UgaWYgKG5hbWUubmFtZSkge1xuICAgIC8vIHVzZSBmdW5jdGlvbiBuYW1lXG4gICAgZm4gPSBuYW1lO1xuICAgIG5hbWUgPSBuYW1lLm5hbWU7XG4gICAga2V5cy5wdXNoKG5hbWUpO1xuICAgIHRtcCA9IHt9O1xuICAgIHRtcFtuYW1lXSA9IGZuO1xuICAgIGZuID0gdG1wO1xuICB9IGVsc2Uge1xuICAgIGtleXMgPSBPYmplY3Qua2V5cyhuYW1lKTtcbiAgICBmbiA9IG5hbWU7XG4gIH1cblxuICBmb3IodmFyIGkgPSAwLCBsZW4gPSBrZXlzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgTGlzdC5wcm90b3R5cGVba2V5c1tpXV0gPSBmbltrZXlzW2ldXTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufVxuXG4vKipcbiAqIEluaXRpYWxpemUgYSBuZXcgYExpc3RgIHdpdGggdGhlXG4gKiBnaXZlbiBhcnJheS1pc2ggb2YgYGVsc2AgYW5kIGBzZWxlY3RvcmBcbiAqIHN0cmluZy5cbiAqXG4gKiBAcGFyYW0ge01peGVkfSBlbHNcbiAqIEBwYXJhbSB7U3RyaW5nfSBzZWxlY3RvclxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gTGlzdChlbHMsIHNlbGVjdG9yKSB7XG4gIGVscyA9IGVscyB8fCBbXTtcbiAgdmFyIGxlbiA9IHRoaXMubGVuZ3RoID0gZWxzLmxlbmd0aDtcbiAgZm9yKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB0aGlzW2ldID0gZWxzW2ldO1xuICB0aGlzLnNlbGVjdG9yID0gc2VsZWN0b3I7XG59XG5cbi8qKlxuICogUmVtYWtlIHRoZSBsaXN0XG4gKlxuICogQHBhcmFtIHtTdHJpbmd8RUxlbWVudHxjb250ZXh0fSBjb250ZXh0XG4gKiBAcmV0dXJuIHtMaXN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuTGlzdC5wcm90b3R5cGUuZG9tID0gZG9tO1xuXG4vKipcbiAqIE1ha2UgYExpc3RgIGFuIGFycmF5LWxpa2Ugb2JqZWN0XG4gKi9cblxuTGlzdC5wcm90b3R5cGUubGVuZ3RoID0gMDtcbkxpc3QucHJvdG90eXBlLnNwbGljZSA9IEFycmF5LnByb3RvdHlwZS5zcGxpY2U7XG5cbi8qKlxuICogQXJyYXktbGlrZSBvYmplY3QgdG8gYXJyYXlcbiAqXG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqL1xuXG5MaXN0LnByb3RvdHlwZS50b0FycmF5ID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiBzbGljZS5jYWxsKHRoaXMpO1xufVxuXG4vKipcbiAqIEF0dHJpYnV0ZSBhY2Nlc3NvcnMuXG4gKi9cblxuYXR0cnMuZm9yRWFjaChmdW5jdGlvbihuYW1lKXtcbiAgTGlzdC5wcm90b3R5cGVbbmFtZV0gPSBmdW5jdGlvbih2YWwpe1xuICAgIGlmICgwID09IGFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiB0aGlzLmF0dHIobmFtZSk7XG4gICAgcmV0dXJuIHRoaXMuYXR0cihuYW1lLCB2YWwpO1xuICB9O1xufSk7XG5cbi8qKlxuICogTWl4aW4gdGhlIEFQSVxuICovXG5cbmRvbS51c2UocmVxdWlyZSgnLi9saWIvYXR0cmlidXRlcycpKTtcbmRvbS51c2UocmVxdWlyZSgnLi9saWIvY2xhc3NlcycpKTtcbmRvbS51c2UocmVxdWlyZSgnLi9saWIvZXZlbnRzJykpO1xuZG9tLnVzZShyZXF1aXJlKCcuL2xpYi9tYW5pcHVsYXRlJykpO1xuZG9tLnVzZShyZXF1aXJlKCcuL2xpYi90cmF2ZXJzZScpKTtcblxuLyoqXG4gKiBDaGVjayBpZiB0aGUgc3RyaW5nIGlzIEhUTUxcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gaXNIVE1MKHN0cikge1xuICAvLyBGYXN0ZXIgdGhhbiBydW5uaW5nIHJlZ2V4LCBpZiBzdHIgc3RhcnRzIHdpdGggYDxgIGFuZCBlbmRzIHdpdGggYD5gLCBhc3N1bWUgaXQncyBIVE1MXG4gIGlmIChzdHIuY2hhckF0KDApID09PSAnPCcgJiYgc3RyLmNoYXJBdChzdHIubGVuZ3RoIC0gMSkgPT09ICc+JyAmJiBzdHIubGVuZ3RoID49IDMpIHJldHVybiB0cnVlO1xuXG4gIC8vIFJ1biB0aGUgcmVnZXhcbiAgdmFyIG1hdGNoID0gcXVpY2tFeHByLmV4ZWMoc3RyKTtcbiAgcmV0dXJuICEhKG1hdGNoICYmIG1hdGNoWzFdKTtcbn1cbiIsIlxudmFyIEFuaW1hdGlvbiA9IHJlcXVpcmUoJ2FuaW1hdGlvbicpXG52YXIgbGF6eSA9IHJlcXVpcmUoJ2xhenktcHJvcGVydHknKVxudmFyIHVubWF0cml4ID0gcmVxdWlyZSgndW5tYXRyaXgnKVxudmFyIHR3ZWVuID0gcmVxdWlyZSgnLi90d2VlbicpXG52YXIgcHJlZml4ID0gcmVxdWlyZSgncHJlZml4JylcbnZhciBjbG9uZSA9IHJlcXVpcmUoJ2Nsb25lJylcblxubW9kdWxlLmV4cG9ydHMgPSBNb3ZlXG5cbi8qKlxuICogJ3dlYmtpdFRyYW5zZm9ybScgfHwgJ01velRyYW5zZm9ybScgZXRjLi5cbiAqIEB0eXBlIHtTdHJpbmd9XG4gKi9cblxudmFyIHRyYW5zZm9ybSA9IHByZWZpeCgndHJhbnNmb3JtJylcblxuLyoqXG4gKiB0aGUgTW92ZSBjbGFzc1xuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gTW92ZShlbCl7XG4gIHRoaXMuX3RvID0ge31cbiAgdGhpcy5lbCA9IGVsXG59XG5cbi8qKlxuICogaW5oZXJpdCBmcm9tIEFuaW1hdGlvblxuICovXG5cbkFuaW1hdGlvbi5leHRlbmQoTW92ZSlcblxuLyoqXG4gKiBkZWZhdWx0IGR1cmF0aW9uXG4gKi9cblxuTW92ZS5wcm90b3R5cGUuZHVyYXRpb24oJzMwMG1zJylcblxuLyoqXG4gKiBhZGQgYHByb3BgIHRvIGFuaW1hdGlvbi4gV2hlbiB0aGUgYW5pbWF0aW9uIGlzIHJ1blxuICogYHByb3BgIHdpbGwgYmUgdHdlZW5lZCBmcm9tIGl0cyBjdXJyZW50IHZhbHVlIHRvIGB0b2BcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gcHJvcFxuICogQHBhcmFtIHtDU1N9IHRvXG4gKiBAcmV0dXJuIHt0aGlzfVxuICovXG5cbk1vdmUucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uKHByb3AsIHRvKXtcbiAgdGhpcy5fdG9bcHJlZml4KHByb3ApXSA9IHRvXG4gIHJldHVybiB0aGlzXG59XG5cbi8qKlxuICogaW5jcmVtZW50IGBwcm9wYCBieSBgbmBcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gcHJvcFxuICogQHBhcmFtIHtOdW1iZXJ9IHRvXG4gKiBAcmV0dXJuIHt0aGlzfVxuICovXG5cbk1vdmUucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uKHByb3AsIG4pe1xuICBwcm9wID0gcHJlZml4KHByb3ApXG4gIHZhciBjdXJyID0gcGFyc2VJbnQodGhpcy5jdXJyZW50KHByb3ApLCAxMClcbiAgcmV0dXJuIHRoaXMuc2V0KHByb3AsIGN1cnIgKyBuKVxufVxuXG4vKipcbiAqIGRlY3JlbWVudCBgcHJvcGAgYnkgYG5gXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHByb3BcbiAqIEBwYXJhbSB7TnVtYmVyfSB0b1xuICogQHJldHVybiB7dGhpc31cbiAqL1xuXG5Nb3ZlLnByb3RvdHlwZS5zdWIgPSBmdW5jdGlvbihwcm9wLCBuKXtcbiAgcHJvcCA9IHByZWZpeChwcm9wKVxuICB2YXIgY3VyciA9IHBhcnNlSW50KHRoaXMuY3VycmVudChwcm9wKSwgMTApXG4gIHJldHVybiB0aGlzLnNldChwcm9wLCBjdXJyIC0gbilcbn1cblxuLyoqXG4gKiBnZXQgdGhlIGN1cnJlbnQgdmFsdWUgb2YgYHByb3BgXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHByb3BcbiAqIEByZXR1cm4ge0NTU31cbiAqL1xuXG5Nb3ZlLnByb3RvdHlwZS5jdXJyZW50ID0gZnVuY3Rpb24ocHJvcCl7XG4gIHJldHVybiBnZXRDb21wdXRlZFN0eWxlKHRoaXMuZWwpW3Byb3BdXG59XG5cbi8qKlxuICogU2tldyBieSBgZGVnYFxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBkZWdcbiAqIEByZXR1cm4ge3RoaXN9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbk1vdmUucHJvdG90eXBlLnNrZXcgPSBmdW5jdGlvbihkZWcpe1xuICB0aGlzLm1hdHJpeC5za2V3ICs9IGRlZ1xuICByZXR1cm4gdGhpc1xufVxuXG4vKipcbiAqIFRyYW5zbGF0ZSBgeGAgYW5kIGB5YCBheGlzLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSB4XG4gKiBAcGFyYW0ge051bWJlcn0geVxuICogQHBhcmFtIHtOdW1iZXJ9IHpcbiAqIEByZXR1cm4ge3RoaXN9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbk1vdmUucHJvdG90eXBlLnRyYW5zbGF0ZSA9IGZ1bmN0aW9uKHgsIHkpe1xuICB0aGlzLm1hdHJpeC50cmFuc2xhdGVYICs9IHhcbiAgdGhpcy5tYXRyaXgudHJhbnNsYXRlWSArPSB5XG4gIHJldHVybiB0aGlzXG59XG5cbi8qKlxuICogVHJhbnNsYXRlIG9uIHRoZSB4IGF4aXMgdG8gYG5gLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBuXG4gKiBAcmV0dXJuIHt0aGlzfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5Nb3ZlLnByb3RvdHlwZS50cmFuc2xhdGVYID1cbk1vdmUucHJvdG90eXBlLnggPSBmdW5jdGlvbihuKXtcbiAgcmV0dXJuIHRoaXMudHJhbnNsYXRlKG4sIDApXG59XG5cbi8qKlxuICogVHJhbnNsYXRlIG9uIHRoZSB5IGF4aXMgdG8gYG5gLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBuXG4gKiBAcmV0dXJuIHt0aGlzfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5Nb3ZlLnByb3RvdHlwZS50cmFuc2xhdGVZID1cbk1vdmUucHJvdG90eXBlLnkgPSBmdW5jdGlvbihuKXtcbiAgcmV0dXJuIHRoaXMudHJhbnNsYXRlKDAsIG4pXG59XG5cbi8qKlxuICogU2NhbGUgdGhlIHggYW5kIHkgYXhpcyBieSBgeGAsIG9yXG4gKiBpbmRpdmlkdWFsbHkgc2NhbGUgYHhgIGFuZCBgeWAuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IHhcbiAqIEBwYXJhbSB7TnVtYmVyfSB5XG4gKiBAcmV0dXJuIHt0aGlzfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5Nb3ZlLnByb3RvdHlwZS5zY2FsZSA9IGZ1bmN0aW9uKHgsIHkpe1xuICBpZiAoeSA9PSBudWxsKSB5ID0geFxuICB0aGlzLm1hdHJpeC5zY2FsZVggKj0geFxuICB0aGlzLm1hdHJpeC5zY2FsZVkgKj0geVxuICByZXR1cm4gdGhpc1xufVxuXG4vKipcbiAqIFNjYWxlIHggYXhpcyBieSBgbmAuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IG5cbiAqIEByZXR1cm4ge3RoaXN9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbk1vdmUucHJvdG90eXBlLnNjYWxlWCA9IGZ1bmN0aW9uKG4pe1xuICByZXR1cm4gdGhpcy5zY2FsZShuLCAxLCAxKVxufVxuXG4vKipcbiAqIFNjYWxlIHkgYXhpcyBieSBgbmAuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IG5cbiAqIEByZXR1cm4ge3RoaXN9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbk1vdmUucHJvdG90eXBlLnNjYWxlWSA9IGZ1bmN0aW9uKG4pe1xuICByZXR1cm4gdGhpcy5zY2FsZSgxLCBuLCAxKVxufVxuXG4vKipcbiAqIFJvdGF0ZSBgbmAgZGVncmVlcy5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gblxuICogQHJldHVybiB7dGhpc31cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuTW92ZS5wcm90b3R5cGUucm90YXRlID0gZnVuY3Rpb24obil7XG4gIHRoaXMubWF0cml4LnJvdGF0ZSArPSBuXG4gIHJldHVybiB0aGlzXG59XG5cbi8qKlxuICogY3NzIHRyYW5zZm9ybWF0aW9uIG1hdHJpeCBmb3IgYHRoaXMuZWxgXG4gKlxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxubGF6eShNb3ZlLnByb3RvdHlwZSwgJ21hdHJpeCcsIGZ1bmN0aW9uKCl7XG4gIHZhciBtYXRyaXggPSB0aGlzLmN1cnJlbnQodHJhbnNmb3JtKVxuICBpZiAodHlwZW9mIG1hdHJpeCA9PSAnc3RyaW5nJykgbWF0cml4ID0gdW5tYXRyaXgobWF0cml4KVxuICB0aGlzLl90b1t0cmFuc2Zvcm1dID0gbWF0cml4XG4gIHJldHVybiBtYXRyaXhcbn0pXG5cbi8qKlxuICogZ2VuZXJhdGVkIHR3ZWVuaW5nIGZ1bmN0aW9uc1xuICpcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmxhenkoTW92ZS5wcm90b3R5cGUsICd0d2VlbnMnLCBmdW5jdGlvbigpe1xuICB2YXIgdHdlZW5zID0ge31cbiAgZm9yICh2YXIga2V5IGluIHRoaXMuX3RvKSB7XG4gICAgdHdlZW5zW2tleV0gPSB0d2VlbihrZXksIHRoaXMuY3VycmVudChrZXkpLCB0aGlzLl90b1trZXldKVxuICB9XG4gIHJldHVybiB0d2VlbnNcbn0pXG5cbi8qKlxuICogcmVuZGVyIHRoZSBhbmltYXRpb24gYXQgY29tcGxldGlvbiBsZXZlbCBgbmBcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gblxuICogQHJldHVybiB7dGhpc31cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuTW92ZS5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24obil7XG4gIG4gPSB0aGlzLl9lYXNlKG4pXG4gIHZhciB0d2VlbnMgPSB0aGlzLnR3ZWVuc1xuICB2YXIgc3R5bGUgPSB0aGlzLmVsLnN0eWxlXG4gIGZvciAodmFyIGsgaW4gdHdlZW5zKSBzdHlsZVtrXSA9IHR3ZWVuc1trXShuKVxuICByZXR1cm4gdGhpc1xufVxuXG4vKipcbiAqIENyZWF0ZSBhIG5ldyBNb3ZlIGluc3RhbmNlIHdoaWNoIHdpbGwgcnVuXG4gKiB3aGVuIGB0aGlzYCBtb3ZlIGNvbXBsZXRlcy4gT3B0aW9uYWxseSB5b3UgY2FuXG4gKiBwYXNzIGluIGEgTW92ZSBpbnN0YW5jZSBvciBGdW5jdGlvbiB0byBiZSBydW5cbiAqIG9uIGNvbXBsZXRpb24gb2YgYHRoaXNgIGFuaW1hdGlvbi5cbiAqXG4gKiBAcGFyYW0ge01vdmV8RnVuY3Rpb259IFttb3ZlXVxuICogQHJldHVybiB7dGhpc3xEZWZlcnJlZE1vdmV9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbk1vdmUucHJvdG90eXBlLnRoZW4gPSBmdW5jdGlvbihtb3ZlKXtcbiAgaWYgKG1vdmUpIHtcbiAgICB2YXIgZm4gID0gdHlwZW9mIG1vdmUgIT0gJ2Z1bmN0aW9uJ1xuICAgICAgPyBmdW5jdGlvbigpeyBtb3ZlLnJ1bigpIH1cbiAgICAgIDogbW92ZVxuICAgIHRoaXMub24oJ2VuZCcsIGZuKVxuICAgIHRoaXMucnVubmluZyB8fCB0aGlzLnBhcmVudCB8fCB0aGlzLnJ1bigpXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuICBtb3ZlID0gZGVmZXIodGhpcylcbiAgdGhpcy50aGVuKG1vdmUpXG4gIHJldHVybiBtb3ZlXG59XG5cbi8qKlxuICogY3JlYXRlIGEgc3BlY2lhbGl6ZWQgc3ViLWNsYXNzIG9mIGBNb3ZlYCBmb3IgdXNlXG4gKiBpbiBgdGhlbigpYFxuICpcbiAqIEBwYXJhbSB7TW92ZX0gcGFyZW50XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBkZWZlcihwYXJlbnQpe1xuICB2YXIgY2hpbGQgPSBuZXcgcGFyZW50LmNvbnN0cnVjdG9yKHBhcmVudC5lbClcbiAgY2hpbGQuX2R1cmF0aW9uID0gcGFyZW50Ll9kdXJhdGlvblxuICBjaGlsZC5fZWFzZSA9IHBhcmVudC5fZWFzZVxuICBjaGlsZC5wYXJlbnQgPSBwYXJlbnRcbiAgY2hpbGQuY3VycmVudCA9IGZ1bmN0aW9uKHByb3Ape1xuICAgIHZhciBhbmltID0gdGhpcy5wYXJlbnRcbiAgICBkbyBpZiAocHJvcCBpbiBhbmltLl90bykgcmV0dXJuIGNsb25lKGFuaW0uX3RvW3Byb3BdKVxuICAgIHdoaWxlIChhbmltID0gYW5pbS5wYXJlbnQpXG4gICAgcmV0dXJuIHRoaXMuY29uc3RydWN0b3IucHJvdG90eXBlLmN1cnJlbnQuY2FsbCh0aGlzLCBwcm9wKVxuICB9XG4gIHJldHVybiBjaGlsZFxufVxuIiwiXG52YXIgcHJlZml4ID0gcmVxdWlyZSgncHJlZml4JylcbnZhciBNb3ZlID0gcmVxdWlyZSgnLi9tb3ZlJylcblxudmFyIGF0dHJzID0gW1xuICAnY3gnLCAnY3knLFxuICAneCcsICAneScsXG4gICdkJ1xuXS5yZWR1Y2UoZnVuY3Rpb24oYXR0cnMsIGtleSl7XG4gIGF0dHJzW2tleV0gPSB0cnVlXG4gIHJldHVybiBhdHRyc1xufSwge30pXG5cbm1vZHVsZS5leHBvcnRzID0gTW92ZS5leHRlbmQoe1xuICBzZXQ6IGZ1bmN0aW9uKGssIHYpe1xuICAgIGlmICghKGsgaW4gYXR0cnMpKSBrID0gcHJlZml4KGspXG4gICAgdGhpcy5fdG9ba10gPSB2XG4gICAgcmV0dXJuIHRoaXNcbiAgfSxcbiAgY3VycmVudDogZnVuY3Rpb24oayl7XG4gICAgaWYgKGsgaW4gYXR0cnMpIHJldHVybiB0aGlzLmVsLmdldEF0dHJpYnV0ZShrKVxuICAgIHJldHVybiBnZXRDb21wdXRlZFN0eWxlKHRoaXMuZWwpW3ByZWZpeChrKV1cbiAgICAgIHx8IHRoaXMuZWwuZ2V0QXR0cmlidXRlKGspXG4gIH0sXG4gIHJlbmRlcjogZnVuY3Rpb24obil7XG4gICAgbiA9IHRoaXMuX2Vhc2UobilcbiAgICB2YXIgdHdlZW5zID0gdGhpcy50d2VlbnNcbiAgICB2YXIgc3R5bGUgPSB0aGlzLmVsLnN0eWxlXG4gICAgZm9yICh2YXIgayBpbiB0d2VlbnMpIHtcbiAgICAgIGlmIChrIGluIGF0dHJzKSB0aGlzLmVsLnNldEF0dHJpYnV0ZShrLCB0d2VlbnNba10obikpXG4gICAgICBlbHNlIHRoaXMuZWwuc3R5bGVba10gPSB0d2VlbnNba10obilcbiAgICB9XG4gICAgLy8gSEFDSzogZm9yY2UgcmVkcmF3IGJlY2F1c2UgY2hyb21lIGhhcyBzb21lIGJ1Z2d5IG9wdGltaXNhdGlvbnNcbiAgICB0aGlzLmVsLm9mZnNldEhlaWdodCBcbiAgICByZXR1cm4gdGhpc1xuICB9XG59KVxuIiwiXG4vKipcbiAqIEV4cG9zZSBgcGFyc2VgLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gcGFyc2U7XG5cbi8qKlxuICogV3JhcCBtYXAgZnJvbSBqcXVlcnkuXG4gKi9cblxudmFyIG1hcCA9IHtcbiAgb3B0aW9uOiBbMSwgJzxzZWxlY3QgbXVsdGlwbGU9XCJtdWx0aXBsZVwiPicsICc8L3NlbGVjdD4nXSxcbiAgb3B0Z3JvdXA6IFsxLCAnPHNlbGVjdCBtdWx0aXBsZT1cIm11bHRpcGxlXCI+JywgJzwvc2VsZWN0PiddLFxuICBsZWdlbmQ6IFsxLCAnPGZpZWxkc2V0PicsICc8L2ZpZWxkc2V0PiddLFxuICB0aGVhZDogWzEsICc8dGFibGU+JywgJzwvdGFibGU+J10sXG4gIHRib2R5OiBbMSwgJzx0YWJsZT4nLCAnPC90YWJsZT4nXSxcbiAgdGZvb3Q6IFsxLCAnPHRhYmxlPicsICc8L3RhYmxlPiddLFxuICBjb2xncm91cDogWzEsICc8dGFibGU+JywgJzwvdGFibGU+J10sXG4gIGNhcHRpb246IFsxLCAnPHRhYmxlPicsICc8L3RhYmxlPiddLFxuICB0cjogWzIsICc8dGFibGU+PHRib2R5PicsICc8L3Rib2R5PjwvdGFibGU+J10sXG4gIHRkOiBbMywgJzx0YWJsZT48dGJvZHk+PHRyPicsICc8L3RyPjwvdGJvZHk+PC90YWJsZT4nXSxcbiAgdGg6IFszLCAnPHRhYmxlPjx0Ym9keT48dHI+JywgJzwvdHI+PC90Ym9keT48L3RhYmxlPiddLFxuICBjb2w6IFsyLCAnPHRhYmxlPjx0Ym9keT48L3Rib2R5Pjxjb2xncm91cD4nLCAnPC9jb2xncm91cD48L3RhYmxlPiddLFxuICBfZGVmYXVsdDogWzAsICcnLCAnJ11cbn07XG5cbi8qKlxuICogUGFyc2UgYGh0bWxgIGFuZCByZXR1cm4gdGhlIGNoaWxkcmVuLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBodG1sXG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHBhcnNlKGh0bWwpIHtcbiAgaWYgKCdzdHJpbmcnICE9IHR5cGVvZiBodG1sKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdTdHJpbmcgZXhwZWN0ZWQnKTtcblxuICAvLyB0YWcgbmFtZVxuICB2YXIgbSA9IC88KFtcXHc6XSspLy5leGVjKGh0bWwpO1xuICBpZiAoIW0pIHRocm93IG5ldyBFcnJvcignTm8gZWxlbWVudHMgd2VyZSBnZW5lcmF0ZWQuJyk7XG4gIHZhciB0YWcgPSBtWzFdO1xuXG4gIC8vIGJvZHkgc3VwcG9ydFxuICBpZiAodGFnID09ICdib2R5Jykge1xuICAgIHZhciBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2h0bWwnKTtcbiAgICBlbC5pbm5lckhUTUwgPSBodG1sO1xuICAgIHJldHVybiBlbC5yZW1vdmVDaGlsZChlbC5sYXN0Q2hpbGQpO1xuICB9XG5cbiAgLy8gd3JhcCBtYXBcbiAgdmFyIHdyYXAgPSBtYXBbdGFnXSB8fCBtYXAuX2RlZmF1bHQ7XG4gIHZhciBkZXB0aCA9IHdyYXBbMF07XG4gIHZhciBwcmVmaXggPSB3cmFwWzFdO1xuICB2YXIgc3VmZml4ID0gd3JhcFsyXTtcbiAgdmFyIGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIGVsLmlubmVySFRNTCA9IHByZWZpeCArIGh0bWwgKyBzdWZmaXg7XG4gIHdoaWxlIChkZXB0aC0tKSBlbCA9IGVsLmxhc3RDaGlsZDtcblxuICB2YXIgZWxzID0gZWwuY2hpbGRyZW47XG4gIGlmICgxID09IGVscy5sZW5ndGgpIHtcbiAgICByZXR1cm4gZWwucmVtb3ZlQ2hpbGQoZWxzWzBdKTtcbiAgfVxuXG4gIHZhciBmcmFnbWVudCA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgd2hpbGUgKGVscy5sZW5ndGgpIHtcbiAgICBmcmFnbWVudC5hcHBlbmRDaGlsZChlbC5yZW1vdmVDaGlsZChlbHNbMF0pKTtcbiAgfVxuXG4gIHJldHVybiBmcmFnbWVudDtcbn1cbiIsInZhciBiaW5kID0gd2luZG93LmFkZEV2ZW50TGlzdGVuZXIgPyAnYWRkRXZlbnRMaXN0ZW5lcicgOiAnYXR0YWNoRXZlbnQnLFxuICAgIHVuYmluZCA9IHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyID8gJ3JlbW92ZUV2ZW50TGlzdGVuZXInIDogJ2RldGFjaEV2ZW50JyxcbiAgICBwcmVmaXggPSBiaW5kICE9PSAnYWRkRXZlbnRMaXN0ZW5lcicgPyAnb24nIDogJyc7XG5cbi8qKlxuICogQmluZCBgZWxgIGV2ZW50IGB0eXBlYCB0byBgZm5gLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHBhcmFtIHtCb29sZWFufSBjYXB0dXJlXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy5iaW5kID0gZnVuY3Rpb24oZWwsIHR5cGUsIGZuLCBjYXB0dXJlKXtcbiAgZWxbYmluZF0ocHJlZml4ICsgdHlwZSwgZm4sIGNhcHR1cmUgfHwgZmFsc2UpO1xuXG4gIHJldHVybiBmbjtcbn07XG5cbi8qKlxuICogVW5iaW5kIGBlbGAgZXZlbnQgYHR5cGVgJ3MgY2FsbGJhY2sgYGZuYC5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gY2FwdHVyZVxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMudW5iaW5kID0gZnVuY3Rpb24oZWwsIHR5cGUsIGZuLCBjYXB0dXJlKXtcbiAgZWxbdW5iaW5kXShwcmVmaXggKyB0eXBlLCBmbiwgY2FwdHVyZSB8fCBmYWxzZSk7XG5cbiAgcmV0dXJuIGZuO1xufTsiLCJcbmZ1bmN0aW9uIG9uZShzZWxlY3RvciwgZWwpIHtcbiAgcmV0dXJuIGVsLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xufVxuXG5leHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzZWxlY3RvciwgZWwpe1xuICBlbCA9IGVsIHx8IGRvY3VtZW50O1xuICByZXR1cm4gb25lKHNlbGVjdG9yLCBlbCk7XG59O1xuXG5leHBvcnRzLmFsbCA9IGZ1bmN0aW9uKHNlbGVjdG9yLCBlbCl7XG4gIGVsID0gZWwgfHwgZG9jdW1lbnQ7XG4gIHJldHVybiBlbC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcbn07XG5cbmV4cG9ydHMuZW5naW5lID0gZnVuY3Rpb24ob2JqKXtcbiAgaWYgKCFvYmoub25lKSB0aHJvdyBuZXcgRXJyb3IoJy5vbmUgY2FsbGJhY2sgcmVxdWlyZWQnKTtcbiAgaWYgKCFvYmouYWxsKSB0aHJvdyBuZXcgRXJyb3IoJy5hbGwgY2FsbGJhY2sgcmVxdWlyZWQnKTtcbiAgb25lID0gb2JqLm9uZTtcbiAgZXhwb3J0cy5hbGwgPSBvYmouYWxsO1xufTtcbiIsIlxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gdHJpbTtcblxuZnVuY3Rpb24gdHJpbShzdHIpe1xuICBpZiAoc3RyLnRyaW0pIHJldHVybiBzdHIudHJpbSgpO1xuICByZXR1cm4gc3RyLnJlcGxhY2UoL15cXHMqfFxccyokL2csICcnKTtcbn1cblxuZXhwb3J0cy5sZWZ0ID0gZnVuY3Rpb24oc3RyKXtcbiAgaWYgKHN0ci50cmltTGVmdCkgcmV0dXJuIHN0ci50cmltTGVmdCgpO1xuICByZXR1cm4gc3RyLnJlcGxhY2UoL15cXHMqLywgJycpO1xufTtcblxuZXhwb3J0cy5yaWdodCA9IGZ1bmN0aW9uKHN0cil7XG4gIGlmIChzdHIudHJpbVJpZ2h0KSByZXR1cm4gc3RyLnRyaW1SaWdodCgpO1xuICByZXR1cm4gc3RyLnJlcGxhY2UoL1xccyokLywgJycpO1xufTtcbiIsImZ1bmN0aW9uIG9uZShzZWxlY3RvciwgZWwpIHtcbiAgcmV0dXJuIGVsLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xufVxuXG5leHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzZWxlY3RvciwgZWwpe1xuICBlbCA9IGVsIHx8IGRvY3VtZW50O1xuICByZXR1cm4gb25lKHNlbGVjdG9yLCBlbCk7XG59O1xuXG5leHBvcnRzLmFsbCA9IGZ1bmN0aW9uKHNlbGVjdG9yLCBlbCl7XG4gIGVsID0gZWwgfHwgZG9jdW1lbnQ7XG4gIHJldHVybiBlbC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcbn07XG5cbmV4cG9ydHMuZW5naW5lID0gZnVuY3Rpb24ob2JqKXtcbiAgaWYgKCFvYmoub25lKSB0aHJvdyBuZXcgRXJyb3IoJy5vbmUgY2FsbGJhY2sgcmVxdWlyZWQnKTtcbiAgaWYgKCFvYmouYWxsKSB0aHJvdyBuZXcgRXJyb3IoJy5hbGwgY2FsbGJhY2sgcmVxdWlyZWQnKTtcbiAgb25lID0gb2JqLm9uZTtcbiAgZXhwb3J0cy5hbGwgPSBvYmouYWxsO1xuICByZXR1cm4gZXhwb3J0cztcbn07XG4iLCJcbi8qKlxuICogaXNBcnJheVxuICovXG5cbnZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheTtcblxuLyoqXG4gKiB0b1N0cmluZ1xuICovXG5cbnZhciBzdHIgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG4vKipcbiAqIFdldGhlciBvciBub3QgdGhlIGdpdmVuIGB2YWxgXG4gKiBpcyBhbiBhcnJheS5cbiAqXG4gKiBleGFtcGxlOlxuICpcbiAqICAgICAgICBpc0FycmF5KFtdKTtcbiAqICAgICAgICAvLyA+IHRydWVcbiAqICAgICAgICBpc0FycmF5KGFyZ3VtZW50cyk7XG4gKiAgICAgICAgLy8gPiBmYWxzZVxuICogICAgICAgIGlzQXJyYXkoJycpO1xuICogICAgICAgIC8vID4gZmFsc2VcbiAqXG4gKiBAcGFyYW0ge21peGVkfSB2YWxcbiAqIEByZXR1cm4ge2Jvb2x9XG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBpc0FycmF5IHx8IGZ1bmN0aW9uICh2YWwpIHtcbiAgcmV0dXJuICEhIHZhbCAmJiAnW29iamVjdCBBcnJheV0nID09IHN0ci5jYWxsKHZhbCk7XG59O1xuIiwiLyoqXG4gKiBNb2R1bGUgRGVwZW5kZW5jaWVzXG4gKi9cblxudmFyIHZhbHVlID0gcmVxdWlyZSgndmFsdWUnKTtcblxuLyoqXG4gKiBTZXQgYXR0cmlidXRlIGBuYW1lYCB0byBgdmFsYCwgb3IgZ2V0IGF0dHIgYG5hbWVgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gKiBAcGFyYW0ge1N0cmluZ30gW3ZhbF1cbiAqIEByZXR1cm4ge1N0cmluZ3xMaXN0fSBzZWxmXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMuYXR0ciA9IGZ1bmN0aW9uKG5hbWUsIHZhbCl7XG4gIC8vIGdldFxuICBpZiAoMSA9PSBhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIHRoaXNbMF0gJiYgdGhpc1swXS5nZXRBdHRyaWJ1dGUobmFtZSk7XG4gIH1cblxuICAvLyByZW1vdmVcbiAgaWYgKG51bGwgPT0gdmFsKSB7XG4gICAgcmV0dXJuIHRoaXMucmVtb3ZlQXR0cihuYW1lKTtcbiAgfVxuXG4gIC8vIHNldFxuICByZXR1cm4gdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKGVsKXtcbiAgICBlbC5zZXRBdHRyaWJ1dGUobmFtZSwgdmFsKTtcbiAgfSk7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBhdHRyaWJ1dGUgYG5hbWVgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gKiBAcmV0dXJuIHtMaXN0fSBzZWxmXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMucmVtb3ZlQXR0ciA9IGZ1bmN0aW9uKG5hbWUpe1xuICByZXR1cm4gdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKGVsKXtcbiAgICBlbC5yZW1vdmVBdHRyaWJ1dGUobmFtZSk7XG4gIH0pO1xufTtcblxuLyoqXG4gKiBTZXQgcHJvcGVydHkgYG5hbWVgIHRvIGB2YWxgLCBvciBnZXQgcHJvcGVydHkgYG5hbWVgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gKiBAcGFyYW0ge1N0cmluZ30gW3ZhbF1cbiAqIEByZXR1cm4ge09iamVjdHxMaXN0fSBzZWxmXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMucHJvcCA9IGZ1bmN0aW9uKG5hbWUsIHZhbCl7XG4gIGlmICgxID09IGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICByZXR1cm4gdGhpc1swXSAmJiB0aGlzWzBdW25hbWVdO1xuICB9XG5cbiAgcmV0dXJuIHRoaXMuZm9yRWFjaChmdW5jdGlvbihlbCl7XG4gICAgZWxbbmFtZV0gPSB2YWw7XG4gIH0pO1xufTtcblxuLyoqXG4gKiBHZXQgdGhlIGZpcnN0IGVsZW1lbnQncyB2YWx1ZSBvciBzZXQgc2VsZWN0ZWRcbiAqIGVsZW1lbnQgdmFsdWVzIHRvIGB2YWxgLlxuICpcbiAqIEBwYXJhbSB7TWl4ZWR9IFt2YWxdXG4gKiBAcmV0dXJuIHtNaXhlZH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy52YWwgPVxuZXhwb3J0cy52YWx1ZSA9IGZ1bmN0aW9uKHZhbCl7XG4gIGlmICgwID09IGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICByZXR1cm4gdGhpc1swXVxuICAgICAgPyB2YWx1ZSh0aGlzWzBdKVxuICAgICAgOiB1bmRlZmluZWQ7XG4gIH1cblxuICByZXR1cm4gdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKGVsKXtcbiAgICB2YWx1ZShlbCwgdmFsKTtcbiAgfSk7XG59O1xuIiwiLyoqXG4gKiBNb2R1bGUgRGVwZW5kZW5jaWVzXG4gKi9cblxudmFyIGNsYXNzZXMgPSByZXF1aXJlKCdjbGFzc2VzJyk7XG5cbi8qKlxuICogQWRkIHRoZSBnaXZlbiBjbGFzcyBgbmFtZWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAqIEByZXR1cm4ge0xpc3R9IHNlbGZcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy5hZGRDbGFzcyA9IGZ1bmN0aW9uKG5hbWUpe1xuICByZXR1cm4gdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKGVsKSB7XG4gICAgZWwuX2NsYXNzZXMgPSBlbC5fY2xhc3NlcyB8fCBjbGFzc2VzKGVsKTtcbiAgICBlbC5fY2xhc3Nlcy5hZGQobmFtZSk7XG4gIH0pO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgdGhlIGdpdmVuIGNsYXNzIGBuYW1lYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xSZWdFeHB9IG5hbWVcbiAqIEByZXR1cm4ge0xpc3R9IHNlbGZcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy5yZW1vdmVDbGFzcyA9IGZ1bmN0aW9uKG5hbWUpe1xuICByZXR1cm4gdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKGVsKSB7XG4gICAgZWwuX2NsYXNzZXMgPSBlbC5fY2xhc3NlcyB8fCBjbGFzc2VzKGVsKTtcbiAgICBlbC5fY2xhc3Nlcy5yZW1vdmUobmFtZSk7XG4gIH0pO1xufTtcblxuLyoqXG4gKiBUb2dnbGUgdGhlIGdpdmVuIGNsYXNzIGBuYW1lYCxcbiAqIG9wdGlvbmFsbHkgYSBgYm9vbGAgbWF5IGJlIGdpdmVuXG4gKiB0byBpbmRpY2F0ZSB0aGF0IHRoZSBjbGFzcyBzaG91bGRcbiAqIGJlIGFkZGVkIHdoZW4gdHJ1dGh5LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGJvb2xcbiAqIEByZXR1cm4ge0xpc3R9IHNlbGZcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy50b2dnbGVDbGFzcyA9IGZ1bmN0aW9uKG5hbWUsIGJvb2wpe1xuICB2YXIgZm4gPSAndG9nZ2xlJztcblxuICAvLyB0b2dnbGUgd2l0aCBib29sZWFuXG4gIGlmICgyID09IGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICBmbiA9IGJvb2wgPyAnYWRkJyA6ICdyZW1vdmUnO1xuICB9XG5cbiAgcmV0dXJuIHRoaXMuZm9yRWFjaChmdW5jdGlvbihlbCkge1xuICAgIGVsLl9jbGFzc2VzID0gZWwuX2NsYXNzZXMgfHwgY2xhc3NlcyhlbCk7XG4gICAgZWwuX2NsYXNzZXNbZm5dKG5hbWUpO1xuICB9KVxufTtcblxuLyoqXG4gKiBDaGVjayBpZiB0aGUgZ2l2ZW4gY2xhc3MgYG5hbWVgIGlzIHByZXNlbnQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMuaGFzQ2xhc3MgPSBmdW5jdGlvbihuYW1lKXtcbiAgdmFyIGVsO1xuXG4gIGZvcih2YXIgaSA9IDAsIGxlbiA9IHRoaXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICBlbCA9IHRoaXNbaV07XG4gICAgZWwuX2NsYXNzZXMgPSBlbC5fY2xhc3NlcyB8fCBjbGFzc2VzKGVsKTtcbiAgICBpZiAoZWwuX2NsYXNzZXMuaGFzKG5hbWUpKSByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiBmYWxzZTtcbn07XG4iLCIvKipcbiAqIE1vZHVsZSBEZXBlbmRlbmNpZXNcbiAqL1xuXG52YXIgZXZlbnRzID0gcmVxdWlyZSgnZXZlbnQnKTtcbnZhciBkZWxlZ2F0ZSA9IHJlcXVpcmUoJ2RlbGVnYXRlJyk7XG5cbi8qKlxuICogQmluZCB0byBgZXZlbnRgIGFuZCBpbnZva2UgYGZuKGUpYC4gV2hlblxuICogYSBgc2VsZWN0b3JgIGlzIGdpdmVuIHRoZW4gZXZlbnRzIGFyZSBkZWxlZ2F0ZWQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge1N0cmluZ30gW3NlbGVjdG9yXVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gY2FwdHVyZVxuICogQHJldHVybiB7TGlzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy5vbiA9IGZ1bmN0aW9uKGV2ZW50LCBzZWxlY3RvciwgZm4sIGNhcHR1cmUpe1xuICBpZiAoJ3N0cmluZycgPT0gdHlwZW9mIHNlbGVjdG9yKSB7XG4gICAgcmV0dXJuIHRoaXMuZm9yRWFjaChmdW5jdGlvbiAoZWwpIHtcbiAgICAgIGZuLl9kZWxlZ2F0ZSA9IGRlbGVnYXRlLmJpbmQoZWwsIHNlbGVjdG9yLCBldmVudCwgZm4sIGNhcHR1cmUpO1xuICAgIH0pO1xuICB9XG5cbiAgY2FwdHVyZSA9IGZuO1xuICBmbiA9IHNlbGVjdG9yO1xuXG4gIHJldHVybiB0aGlzLmZvckVhY2goZnVuY3Rpb24gKGVsKSB7XG4gICAgZXZlbnRzLmJpbmQoZWwsIGV2ZW50LCBmbiwgY2FwdHVyZSk7XG4gIH0pO1xufTtcblxuLyoqXG4gKiBVbmJpbmQgdG8gYGV2ZW50YCBhbmQgaW52b2tlIGBmbihlKWAuIFdoZW5cbiAqIGEgYHNlbGVjdG9yYCBpcyBnaXZlbiB0aGVuIGRlbGVnYXRlZCBldmVudFxuICogaGFuZGxlcnMgYXJlIHVuYm91bmQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge1N0cmluZ30gW3NlbGVjdG9yXVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gY2FwdHVyZVxuICogQHJldHVybiB7TGlzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy5vZmYgPSBmdW5jdGlvbihldmVudCwgc2VsZWN0b3IsIGZuLCBjYXB0dXJlKXtcbiAgaWYgKCdzdHJpbmcnID09IHR5cGVvZiBzZWxlY3Rvcikge1xuICAgIHJldHVybiB0aGlzLmZvckVhY2goZnVuY3Rpb24gKGVsKSB7XG4gICAgICAvLyBUT0RPOiBhZGQgc2VsZWN0b3Igc3VwcG9ydCBiYWNrXG4gICAgICBkZWxlZ2F0ZS51bmJpbmQoZWwsIGV2ZW50LCBmbi5fZGVsZWdhdGUsIGNhcHR1cmUpO1xuICAgIH0pO1xuICB9XG5cbiAgY2FwdHVyZSA9IGZuO1xuICBmbiA9IHNlbGVjdG9yO1xuXG4gIHJldHVybiB0aGlzLmZvckVhY2goZnVuY3Rpb24gKGVsKSB7XG4gICAgZXZlbnRzLnVuYmluZChlbCwgZXZlbnQsIGZuLCBjYXB0dXJlKTtcbiAgfSk7XG59O1xuIiwiLyoqXG4gKiBNb2R1bGUgRGVwZW5kZW5jaWVzXG4gKi9cblxudmFyIHZhbHVlID0gcmVxdWlyZSgndmFsdWUnKTtcbnZhciBjc3MgPSByZXF1aXJlKCdjc3MnKTtcblxuLyoqXG4gKiBSZXR1cm4gZWxlbWVudCB0ZXh0LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge1N0cmluZ3xMaXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5leHBvcnRzLnRleHQgPSBmdW5jdGlvbihzdHIpIHtcbiAgaWYgKDEgPT0gYXJndW1lbnRzLmxlbmd0aCkge1xuICAgIHJldHVybiB0aGlzLmZvckVhY2goZnVuY3Rpb24oZWwpIHtcbiAgICAgIHZhciBub2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoc3RyKTtcbiAgICAgIGVsLnRleHRDb250ZW50ID0gJyc7XG4gICAgICBlbC5hcHBlbmRDaGlsZChub2RlKTtcbiAgICB9KTtcbiAgfVxuXG4gIHZhciBvdXQgPSAnJztcbiAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKGVsKSB7XG4gICAgb3V0ICs9IGdldFRleHQoZWwpO1xuICB9KTtcblxuICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBHZXQgdGV4dCBoZWxwZXIgZnJvbSBTaXp6bGUuXG4gKlxuICogU291cmNlOiBodHRwczovL2dpdGh1Yi5jb20vanF1ZXJ5L3NpenpsZS9ibG9iL21hc3Rlci9zcmMvc2l6emxlLmpzI0w5MTQtTDk0N1xuICpcbiAqIEBwYXJhbSB7RWxlbWVudHxBcnJheX0gZWxcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuXG5mdW5jdGlvbiBnZXRUZXh0KGVsKSB7XG4gIHZhciByZXQgPSAnJztcbiAgdmFyIHR5cGUgPSBlbC5ub2RlVHlwZTtcbiAgdmFyIG5vZGU7XG5cbiAgc3dpdGNoKHR5cGUpIHtcbiAgICBjYXNlIDE6XG4gICAgY2FzZSA5OlxuICAgIGNhc2UgMTE6XG4gICAgICBpZiAoJ3N0cmluZycgPT0gdHlwZW9mIGVsLnRleHRDb250ZW50KSByZXR1cm4gZWwudGV4dENvbnRlbnQ7XG4gICAgICBmb3IgKGVsID0gZWwuZmlyc3RDaGlsZDsgZWw7IGVsID0gZWwubmV4dFNpYmxpbmcpIHJldCArPSB0ZXh0KGVsKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgMzpcbiAgICBjYXNlIDQ6XG4gICAgICByZXR1cm4gZWwubm9kZVZhbHVlO1xuICAgIGRlZmF1bHQ6XG4gICAgICB3aGlsZSAobm9kZSA9IGVsW2krK10pIHtcbiAgICAgICAgcmV0ICs9IGdldFRleHQobm9kZSk7XG4gICAgICB9XG4gIH1cblxuICByZXR1cm4gcmV0O1xufVxuXG4vKipcbiAqIFJldHVybiBlbGVtZW50IGh0bWwuXG4gKlxuICogQHJldHVybiB7U3RyaW5nfSBodG1sXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMuaHRtbCA9IGZ1bmN0aW9uKGh0bWwpIHtcbiAgaWYgKDEgPT0gYXJndW1lbnRzLmxlbmd0aCkge1xuICAgIHJldHVybiB0aGlzLmZvckVhY2goZnVuY3Rpb24oZWwpIHtcbiAgICAgIGVsLmlubmVySFRNTCA9IGh0bWw7XG4gICAgfSk7XG4gIH1cblxuICAvLyBUT0RPOiByZWFsIGltcGxcbiAgcmV0dXJuIHRoaXNbMF0gJiYgdGhpc1swXS5pbm5lckhUTUw7XG59O1xuXG4vKipcbiAqIEdldCBhbmQgc2V0IHRoZSBjc3MgdmFsdWVcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xPYmplY3R9IHByb3BcbiAqIEBwYXJhbSB7TWl4ZWR9IHZhbFxuICogQHJldHVybiB7TWl4ZWR9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMuY3NzID0gZnVuY3Rpb24ocHJvcCwgdmFsKSB7XG4gIC8vIGdldHRlclxuICBpZiAoIXZhbCAmJiAnb2JqZWN0JyAhPSB0eXBlb2YgcHJvcCkge1xuICAgIHJldHVybiBjc3ModGhpc1swXSwgcHJvcCk7XG4gIH1cbiAgLy8gc2V0dGVyXG4gIHRoaXMuZm9yRWFjaChmdW5jdGlvbihlbCkge1xuICAgIGNzcyhlbCwgcHJvcCwgdmFsKTtcbiAgfSk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFByZXBlbmQgYHZhbGAuXG4gKlxuICogRnJvbSBqUXVlcnk6IGlmIHRoZXJlIGlzIG1vcmUgdGhhbiBvbmUgdGFyZ2V0IGVsZW1lbnRcbiAqIGNsb25lZCBjb3BpZXMgb2YgdGhlIGluc2VydGVkIGVsZW1lbnQgd2lsbCBiZSBjcmVhdGVkXG4gKiBmb3IgZWFjaCB0YXJnZXQgYWZ0ZXIgdGhlIGZpcnN0LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfEVsZW1lbnR8TGlzdH0gdmFsXG4gKiBAcmV0dXJuIHtMaXN0fSBzZWxmXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMucHJlcGVuZCA9IGZ1bmN0aW9uKHZhbCkge1xuICB2YXIgZG9tID0gdGhpcy5kb207XG5cbiAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKHRhcmdldCwgaSkge1xuICAgIGRvbSh2YWwpLmZvckVhY2goZnVuY3Rpb24oc2VsZWN0b3IpIHtcbiAgICAgIHNlbGVjdG9yID0gaSA/IHNlbGVjdG9yLmNsb25lTm9kZSh0cnVlKSA6IHNlbGVjdG9yO1xuICAgICAgaWYgKHRhcmdldC5jaGlsZHJlbi5sZW5ndGgpIHtcbiAgICAgICAgdGFyZ2V0Lmluc2VydEJlZm9yZShzZWxlY3RvciwgdGFyZ2V0LmZpcnN0Q2hpbGQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGFyZ2V0LmFwcGVuZENoaWxkKHNlbGVjdG9yKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEFwcGVuZCBgdmFsYC5cbiAqXG4gKiBGcm9tIGpRdWVyeTogaWYgdGhlcmUgaXMgbW9yZSB0aGFuIG9uZSB0YXJnZXQgZWxlbWVudFxuICogY2xvbmVkIGNvcGllcyBvZiB0aGUgaW5zZXJ0ZWQgZWxlbWVudCB3aWxsIGJlIGNyZWF0ZWRcbiAqIGZvciBlYWNoIHRhcmdldCBhZnRlciB0aGUgZmlyc3QuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd8RWxlbWVudHxMaXN0fSB2YWxcbiAqIEByZXR1cm4ge0xpc3R9IHNlbGZcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy5hcHBlbmQgPSBmdW5jdGlvbih2YWwpIHtcbiAgdmFyIGRvbSA9IHRoaXMuZG9tO1xuXG4gIHRoaXMuZm9yRWFjaChmdW5jdGlvbih0YXJnZXQsIGkpIHtcbiAgICBkb20odmFsKS5mb3JFYWNoKGZ1bmN0aW9uKGVsKSB7XG4gICAgICBlbCA9IGkgPyBlbC5jbG9uZU5vZGUodHJ1ZSkgOiBlbDtcbiAgICAgIHRhcmdldC5hcHBlbmRDaGlsZChlbCk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBJbnNlcnQgc2VsZidzIGBlbHNgIGFmdGVyIGB2YWxgXG4gKlxuICogRnJvbSBqUXVlcnk6IGlmIHRoZXJlIGlzIG1vcmUgdGhhbiBvbmUgdGFyZ2V0IGVsZW1lbnQsXG4gKiBjbG9uZWQgY29waWVzIG9mIHRoZSBpbnNlcnRlZCBlbGVtZW50IHdpbGwgYmUgY3JlYXRlZFxuICogZm9yIGVhY2ggdGFyZ2V0IGFmdGVyIHRoZSBmaXJzdCwgYW5kIHRoYXQgbmV3IHNldFxuICogKHRoZSBvcmlnaW5hbCBlbGVtZW50IHBsdXMgY2xvbmVzKSBpcyByZXR1cm5lZC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xFbGVtZW50fExpc3R9IHZhbFxuICogQHJldHVybiB7TGlzdH0gc2VsZlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5leHBvcnRzLmluc2VydEFmdGVyID0gZnVuY3Rpb24odmFsKSB7XG4gIHZhciBkb20gPSB0aGlzLmRvbTtcblxuICB0aGlzLmZvckVhY2goZnVuY3Rpb24oZWwpIHtcbiAgICBkb20odmFsKS5mb3JFYWNoKGZ1bmN0aW9uKHRhcmdldCwgaSkge1xuICAgICAgaWYgKCF0YXJnZXQucGFyZW50Tm9kZSkgcmV0dXJuO1xuICAgICAgZWwgPSBpID8gZWwuY2xvbmVOb2RlKHRydWUpIDogZWw7XG4gICAgICB0YXJnZXQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoZWwsIHRhcmdldC5uZXh0U2libGluZyk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBBcHBlbmQgc2VsZidzIGBlbGAgdG8gYHZhbGBcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xFbGVtZW50fExpc3R9IHZhbFxuICogQHJldHVybiB7TGlzdH0gc2VsZlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5leHBvcnRzLmFwcGVuZFRvID0gZnVuY3Rpb24odmFsKSB7XG4gIHRoaXMuZG9tKHZhbCkuYXBwZW5kKHRoaXMpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmVwbGFjZSBlbGVtZW50cyBpbiB0aGUgRE9NLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfEVsZW1lbnR8TGlzdH0gdmFsXG4gKiBAcmV0dXJuIHtMaXN0fSBzZWxmXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMucmVwbGFjZSA9IGZ1bmN0aW9uKHZhbCkge1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHZhciBsaXN0ID0gdGhpcy5kb20odmFsKTtcblxuICBsaXN0LmZvckVhY2goZnVuY3Rpb24oZWwsIGkpIHtcbiAgICB2YXIgb2xkID0gc2VsZltpXTtcbiAgICB2YXIgcGFyZW50ID0gb2xkLnBhcmVudE5vZGU7XG4gICAgaWYgKCFwYXJlbnQpIHJldHVybjtcbiAgICBlbCA9IGkgPyBlbC5jbG9uZU5vZGUodHJ1ZSkgOiBlbDtcbiAgICBwYXJlbnQucmVwbGFjZUNoaWxkKGVsLCBvbGQpO1xuICB9KTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogRW1wdHkgdGhlIGRvbSBsaXN0XG4gKlxuICogQHJldHVybiBzZWxmXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMuZW1wdHkgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuZm9yRWFjaChmdW5jdGlvbihlbCkge1xuICAgIGVsLnRleHRDb250ZW50ID0gJyc7XG4gIH0pO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgYWxsIGVsZW1lbnRzIGluIHRoZSBkb20gbGlzdFxuICpcbiAqIEByZXR1cm4ge0xpc3R9IHNlbGZcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy5yZW1vdmUgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuZm9yRWFjaChmdW5jdGlvbihlbCkge1xuICAgIHZhciBwYXJlbnQgPSBlbC5wYXJlbnROb2RlO1xuICAgIGlmIChwYXJlbnQpIHBhcmVudC5yZW1vdmVDaGlsZChlbCk7XG4gIH0pO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gYSBjbG9uZWQgZG9tIGxpc3Qgd2l0aCBhbGwgZWxlbWVudHMgY2xvbmVkLlxuICpcbiAqIEByZXR1cm4ge0xpc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMuY2xvbmUgPSBmdW5jdGlvbigpIHtcbiAgdmFyIG91dCA9IHRoaXMubWFwKGZ1bmN0aW9uKGVsKSB7XG4gICAgcmV0dXJuIGVsLmNsb25lTm9kZSh0cnVlKTtcbiAgfSk7XG5cbiAgcmV0dXJuIHRoaXMuZG9tKG91dCk7XG59O1xuIiwiLyoqXG4gKiBNb2R1bGUgRGVwZW5kZW5jaWVzXG4gKi9cblxudmFyIHByb3RvID0gQXJyYXkucHJvdG90eXBlO1xudmFyIHRyYXZlcnNlID0gcmVxdWlyZSgndHJhdmVyc2UnKTtcbnZhciB0b0Z1bmN0aW9uID0gcmVxdWlyZSgndG8tZnVuY3Rpb24nKTtcbnZhciBtYXRjaGVzID0gcmVxdWlyZSgnbWF0Y2hlcy1zZWxlY3RvcicpO1xuXG4vKipcbiAqIEZpbmQgY2hpbGRyZW4gbWF0Y2hpbmcgdGhlIGdpdmVuIGBzZWxlY3RvcmAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHNlbGVjdG9yXG4gKiBAcmV0dXJuIHtMaXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5leHBvcnRzLmZpbmQgPSBmdW5jdGlvbihzZWxlY3Rvcil7XG4gIHJldHVybiB0aGlzLmRvbShzZWxlY3RvciwgdGhpcyk7XG59O1xuXG4vKipcbiAqIENoZWNrIGlmIHRoZSBhbnkgZWxlbWVudCBpbiB0aGUgc2VsZWN0aW9uXG4gKiBtYXRjaGVzIGBzZWxlY3RvcmAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHNlbGVjdG9yXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5leHBvcnRzLmlzID0gZnVuY3Rpb24oc2VsZWN0b3Ipe1xuICBmb3IodmFyIGkgPSAwLCBlbDsgZWwgPSB0aGlzW2ldOyBpKyspIHtcbiAgICBpZiAobWF0Y2hlcyhlbCwgc2VsZWN0b3IpKSByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiBmYWxzZTtcbn07XG5cbi8qKlxuICogR2V0IHBhcmVudChzKSB3aXRoIG9wdGlvbmFsIGBzZWxlY3RvcmAgYW5kIGBsaW1pdGBcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc2VsZWN0b3JcbiAqIEBwYXJhbSB7TnVtYmVyfSBsaW1pdFxuICogQHJldHVybiB7TGlzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy5wYXJlbnQgPSBmdW5jdGlvbihzZWxlY3RvciwgbGltaXQpe1xuICByZXR1cm4gdGhpcy5kb20odHJhdmVyc2UoJ3BhcmVudE5vZGUnLFxuICAgIHRoaXNbMF0sXG4gICAgc2VsZWN0b3IsXG4gICAgbGltaXRcbiAgICB8fCAxKSk7XG59O1xuXG4vKipcbiAqIEdldCBuZXh0IGVsZW1lbnQocykgd2l0aCBvcHRpb25hbCBgc2VsZWN0b3JgIGFuZCBgbGltaXRgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzZWxlY3RvclxuICogQHBhcmFtIHtOdW1iZXJ9IGxpbWl0XG4gKiBAcmV0cnVuIHtMaXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5leHBvcnRzLm5leHQgPSBmdW5jdGlvbihzZWxlY3RvciwgbGltaXQpe1xuICByZXR1cm4gdGhpcy5kb20odHJhdmVyc2UoJ25leHRTaWJsaW5nJyxcbiAgICB0aGlzWzBdLFxuICAgIHNlbGVjdG9yLFxuICAgIGxpbWl0XG4gICAgfHwgMSkpO1xufTtcblxuLyoqXG4gKiBHZXQgcHJldmlvdXMgZWxlbWVudChzKSB3aXRoIG9wdGlvbmFsIGBzZWxlY3RvcmAgYW5kIGBsaW1pdGAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHNlbGVjdG9yXG4gKiBAcGFyYW0ge051bWJlcn0gbGltaXRcbiAqIEByZXR1cm4ge0xpc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMucHJldiA9XG5leHBvcnRzLnByZXZpb3VzID0gZnVuY3Rpb24oc2VsZWN0b3IsIGxpbWl0KXtcbiAgcmV0dXJuIHRoaXMuZG9tKHRyYXZlcnNlKCdwcmV2aW91c1NpYmxpbmcnLFxuICAgIHRoaXNbMF0sXG4gICAgc2VsZWN0b3IsXG4gICAgbGltaXRcbiAgICB8fCAxKSk7XG59O1xuXG4vKipcbiAqIEl0ZXJhdGUgb3ZlciBlYWNoIGVsZW1lbnQgY3JlYXRpbmcgYSBuZXcgbGlzdCB3aXRoXG4gKiBvbmUgaXRlbSBhbmQgaW52b2tpbmcgYGZuKGxpc3QsIGkpYC5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7TGlzdH0gc2VsZlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5leHBvcnRzLmVhY2ggPSBmdW5jdGlvbihmbil7XG4gIHZhciBkb20gPSB0aGlzLmRvbTtcblxuICBmb3IgKHZhciBpID0gMCwgbGlzdCwgbGVuID0gdGhpcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIGxpc3QgPSBkb20odGhpc1tpXSk7XG4gICAgZm4uY2FsbChsaXN0LCBsaXN0LCBpKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBJdGVyYXRlIG92ZXIgZWFjaCBlbGVtZW50IGFuZCBpbnZva2UgYGZuKGVsLCBpKWBcbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7TGlzdH0gc2VsZlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5leHBvcnRzLmZvckVhY2ggPSBmdW5jdGlvbihmbikge1xuICBmb3IgKHZhciBpID0gMCwgbGVuID0gdGhpcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIGZuLmNhbGwodGhpc1tpXSwgdGhpc1tpXSwgaSk7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogTWFwIGVhY2ggcmV0dXJuIHZhbHVlIGZyb20gYGZuKHZhbCwgaSlgLlxuICpcbiAqIFBhc3NpbmcgYSBjYWxsYmFjayBmdW5jdGlvbjpcbiAqXG4gKiAgICBpbnB1dHMubWFwKGZ1bmN0aW9uKGlucHV0KXtcbiAqICAgICAgcmV0dXJuIGlucHV0LnR5cGVcbiAqICAgIH0pXG4gKlxuICogUGFzc2luZyBhIHByb3BlcnR5IHN0cmluZzpcbiAqXG4gKiAgICBpbnB1dHMubWFwKCd0eXBlJylcbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7TGlzdH0gc2VsZlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5leHBvcnRzLm1hcCA9IGZ1bmN0aW9uKGZuKXtcbiAgZm4gPSB0b0Z1bmN0aW9uKGZuKTtcbiAgdmFyIGRvbSA9IHRoaXMuZG9tO1xuICB2YXIgb3V0ID0gW107XG5cbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHRoaXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICBvdXQucHVzaChmbi5jYWxsKGRvbSh0aGlzW2ldKSwgdGhpc1tpXSwgaSkpO1xuICB9XG5cbiAgcmV0dXJuIHRoaXMuZG9tKG91dCk7XG59O1xuXG4vKipcbiAqIFNlbGVjdCBhbGwgdmFsdWVzIHRoYXQgcmV0dXJuIGEgdHJ1dGh5IHZhbHVlIG9mIGBmbih2YWwsIGkpYC5cbiAqXG4gKiAgICBpbnB1dHMuc2VsZWN0KGZ1bmN0aW9uKGlucHV0KXtcbiAqICAgICAgcmV0dXJuIGlucHV0LnR5cGUgPT0gJ3Bhc3N3b3JkJ1xuICogICAgfSlcbiAqXG4gKiAgV2l0aCBhIHByb3BlcnR5OlxuICpcbiAqICAgIGlucHV0cy5zZWxlY3QoJ3R5cGUgPT0gcGFzc3dvcmQnKVxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb258U3RyaW5nfSBmblxuICogQHJldHVybiB7TGlzdH0gc2VsZlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5leHBvcnRzLmZpbHRlciA9XG5leHBvcnRzLnNlbGVjdCA9IGZ1bmN0aW9uKGZuKXtcbiAgZm4gPSB0b0Z1bmN0aW9uKGZuKTtcbiAgdmFyIGRvbSA9IHRoaXMuZG9tO1xuICB2YXIgb3V0ID0gW107XG4gIHZhciB2YWw7XG5cbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHRoaXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICB2YWwgPSBmbi5jYWxsKGRvbSh0aGlzW2ldKSwgdGhpc1tpXSwgaSk7XG4gICAgaWYgKHZhbCkgb3V0LnB1c2godGhpc1tpXSk7XG4gIH1cblxuICByZXR1cm4gdGhpcy5kb20ob3V0KTtcbn07XG5cbi8qKlxuICogUmVqZWN0IGFsbCB2YWx1ZXMgdGhhdCByZXR1cm4gYSB0cnV0aHkgdmFsdWUgb2YgYGZuKHZhbCwgaSlgLlxuICpcbiAqIFJlamVjdGluZyB1c2luZyBhIGNhbGxiYWNrOlxuICpcbiAqICAgIGlucHV0LnJlamVjdChmdW5jdGlvbih1c2VyKXtcbiAqICAgICAgcmV0dXJuIGlucHV0Lmxlbmd0aCA8IDIwXG4gKiAgICB9KVxuICpcbiAqIFJlamVjdGluZyB3aXRoIGEgcHJvcGVydHk6XG4gKlxuICogICAgaXRlbXMucmVqZWN0KCdwYXNzd29yZCcpXG4gKlxuICogUmVqZWN0aW5nIHZhbHVlcyB2aWEgYD09YDpcbiAqXG4gKiAgICBkYXRhLnJlamVjdChudWxsKVxuICogICAgaW5wdXQucmVqZWN0KGZpbGUpXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbnxTdHJpbmd8TWl4ZWR9IGZuXG4gKiBAcmV0dXJuIHtMaXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5leHBvcnRzLnJlamVjdCA9IGZ1bmN0aW9uKGZuKXtcbiAgdmFyIG91dCA9IFtdO1xuICB2YXIgbGVuID0gdGhpcy5sZW5ndGg7XG4gIHZhciB2YWwsIGk7XG5cbiAgaWYgKCdzdHJpbmcnID09IHR5cGVvZiBmbikgZm4gPSB0b0Z1bmN0aW9uKGZuKTtcblxuICBpZiAoZm4pIHtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIHZhbCA9IGZuLmNhbGwoZG9tKHRoaXNbaV0pLCB0aGlzW2ldLCBpKTtcbiAgICAgIGlmICghdmFsKSBvdXQucHVzaCh0aGlzW2ldKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBpZiAodGhpc1tpXSAhPSBmbikgb3V0LnB1c2godGhpc1tpXSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXMuZG9tKG91dCk7XG59O1xuXG4vKipcbiAqIFJldHVybiBhIGBMaXN0YCBjb250YWluaW5nIHRoZSBlbGVtZW50IGF0IGBpYC5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gaVxuICogQHJldHVybiB7TGlzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy5hdCA9IGZ1bmN0aW9uKGkpe1xuICByZXR1cm4gdGhpcy5kb20odGhpc1tpXSk7XG59O1xuXG4vKipcbiAqIFJldHVybiBhIGBMaXN0YCBjb250YWluaW5nIHRoZSBmaXJzdCBlbGVtZW50LlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBpXG4gKiBAcmV0dXJuIHtMaXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5leHBvcnRzLmZpcnN0ID0gZnVuY3Rpb24oKXtcbiAgcmV0dXJuIHRoaXMuZG9tKHRoaXNbMF0pO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gYSBgTGlzdGAgY29udGFpbmluZyB0aGUgbGFzdCBlbGVtZW50LlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBpXG4gKiBAcmV0dXJuIHtMaXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5leHBvcnRzLmxhc3QgPSBmdW5jdGlvbigpe1xuICByZXR1cm4gdGhpcy5kb20odGhpc1t0aGlzLmxlbmd0aCAtIDFdKTtcbn07XG5cbi8qKlxuICogTWl4aW4gdGhlIGFycmF5IGZ1bmN0aW9uc1xuICovXG5cbltcbiAgJ3B1c2gnLFxuICAncG9wJyxcbiAgJ3NoaWZ0JyxcbiAgJ3NwbGljZScsXG4gICd1bnNoaWZ0JyxcbiAgJ3JldmVyc2UnLFxuICAnc29ydCcsXG4gICd0b1N0cmluZycsXG4gICdjb25jYXQnLFxuICAnam9pbicsXG4gICdzbGljZSdcbl0uZm9yRWFjaChmdW5jdGlvbihtZXRob2QpIHtcbiAgZXhwb3J0c1ttZXRob2RdID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHByb3RvW21ldGhvZF0uYXBwbHkodGhpcy50b0FycmF5KCksIGFyZ3VtZW50cyk7XG4gIH07XG59KTtcblxuIiwiXG52YXIgZXh0ZW5zaWJsZSA9IHJlcXVpcmUoJ2V4dGVuc2libGUnKVxudmFyIG1zID0gcmVxdWlyZSgncGFyc2UtZHVyYXRpb24nKVxudmFyIEVtaXR0ZXIgPSByZXF1aXJlKCdlbWl0dGVyJylcbnZhciBlYXNlID0gcmVxdWlyZSgnZWFzZScpXG52YXIgbm93ID0gcmVxdWlyZSgnbm93JylcbnZhciByYWYgPSByZXF1aXJlKCdyYWYnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEFuaW1hdGlvblxuXG5mdW5jdGlvbiBBbmltYXRpb24oKXt9XG5cbi8qKlxuICogbWl4aW4gbWV0aG9kc1xuICovXG5cbkVtaXR0ZXIoQW5pbWF0aW9uLnByb3RvdHlwZSlcbmV4dGVuc2libGUoQW5pbWF0aW9uKVxuXG4vKipcbiAqIHNldCBkdXJhdGlvbiB0byBgbmAgbWlsbGlzZWNvbmRzLiBZb3UgY2FuIGFsc29cbiAqIHBhc3MgYSBuYXR1cmFsIGxhbmd1YWdlIHN0cmluZ1xuICpcbiAqIEBwYXJhbSB7TnVtYmVyfFN0cmluZ30gblxuICogQHJldHVybiB7dGhpc31cbiAqL1xuXG5BbmltYXRpb24ucHJvdG90eXBlLmR1cmF0aW9uID0gZnVuY3Rpb24obil7XG4gIGlmICh0eXBlb2YgbiA9PSAnc3RyaW5nJykgbiA9IG1zKG4pXG4gIHRoaXMuX2R1cmF0aW9uID0gblxuICByZXR1cm4gdGhpc1xufVxuXG4vKipcbiAqIFNldCBlYXNpbmcgZnVuY3Rpb24gdG8gYGZuYC5cbiAqXG4gKiAgIGFuaW1hdGlvbi5lYXNlKCdpbi1vdXQtc2luZScpXG4gKlxuICogQHBhcmFtIHtTdHJpbmd8RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHt0aGlzfVxuICovXG5cbkFuaW1hdGlvbi5wcm90b3R5cGUuZWFzZSA9IGZ1bmN0aW9uKGZuKXtcbiAgaWYgKHR5cGVvZiBmbiA9PSAnc3RyaW5nJykgZm4gPSBlYXNlW2ZuXVxuICBpZiAoIWZuKSB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgZWFzaW5nIGZ1bmN0aW9uJylcbiAgdGhpcy5fZWFzZSA9IGZuXG4gIHJldHVybiB0aGlzXG59XG5cbkFuaW1hdGlvbi5wcm90b3R5cGUuZWFzZSgnbGluZWFyJykgLy8gZGVmYXVsdFxuXG4vKipcbiAqIHJ1biB0aGUgYW5pbWF0aW9uIHdpdGggYW4gb3B0aW9uYWwgZHVyYXRpb25cbiAqXG4gKiBAcGFyYW0ge051bWJlcnxTdHJpbmd8RnVuY3Rpb259IFtuXVxuICogQHJldHVybiB7dGhpc31cbiAqL1xuXG5BbmltYXRpb24ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uKG4pe1xuICBpZiAobiAhPSBudWxsKSB0aGlzLmR1cmF0aW9uKG4pXG4gIHZhciBkdXJhdGlvbiA9IHRoaXMuX2R1cmF0aW9uXG4gIHZhciBzdGFydCA9IG5vdygpXG4gIHZhciBzZWxmID0gdGhpc1xuICByYWYoZnVuY3Rpb24gbG9vcCgpe1xuICAgIHZhciBwcm9ncmVzcyA9IChub3coKSAtIHN0YXJ0KSAvIGR1cmF0aW9uXG4gICAgaWYgKHByb2dyZXNzID49IDEpIHtcbiAgICAgIHNlbGYucmVuZGVyKDEpXG4gICAgICBzZWxmLnJ1bm5pbmcgPSBmYWxzZVxuICAgICAgc2VsZi5lbWl0KCdlbmQnKVxuICAgIH0gZWxzZSB7XG4gICAgICBzZWxmLnJlbmRlcihwcm9ncmVzcylcbiAgICAgIHJhZihsb29wKVxuICAgIH1cbiAgfSlcbiAgdGhpcy5ydW5uaW5nID0gdHJ1ZVxuICByZXR1cm4gdGhpc1xufVxuIiwiXG4vKipcbiAqIEV4cG9zZSBgdW5tYXRyaXhgIGFuZCBoZWxwZXJzXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gdW5tYXRyaXg7XG5leHBvcnRzLmRlY29tcG9zZSA9IGRlY29tcG9zZTtcbmV4cG9ydHMucGFyc2UgPSBwYXJzZTtcblxuLyoqXG4gKiBVbm1hdHJpeFxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xuXG5mdW5jdGlvbiB1bm1hdHJpeChzdHIpIHtcbiAgcmV0dXJuIGRlY29tcG9zZShwYXJzZShzdHIpKTtcbn1cblxuLyoqXG4gKiBVbm1hdHJpeDogcGFyc2UgdGhlIHZhbHVlcyBvZiB0aGUgbWF0cml4XG4gKlxuICogQWxnb3JpdGhtIGZyb206XG4gKlxuICogLSBodHRwOi8vaGcubW96aWxsYS5vcmcvbW96aWxsYS1jZW50cmFsL2ZpbGUvN2NiM2U5Nzk1ZDA0L2xheW91dC9zdHlsZS9uc1N0eWxlQW5pbWF0aW9uLmNwcFxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IG0gKG1hdHJpeClcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGRlY29tcG9zZShtKSB7XG4gIHZhciBBID0gbVswXTtcbiAgdmFyIEIgPSBtWzFdO1xuICB2YXIgQyA9IG1bMl07XG4gIHZhciBEID0gbVszXTtcbiAgdmFyIGRldGVybWluYW50ID0gQSAqIEQgLSBCICogQztcblxuICAvLyBzdGVwKDEpXG4gIGlmICghZGV0ZXJtaW5hbnQpIHRocm93IG5ldyBFcnJvcigndHJhbnNmb3JtI3VubWF0cml4OiBtYXRyaXggaXMgc2luZ3VsYXInKTtcblxuICAvLyBzdGVwICgzKVxuICB2YXIgc2NhbGVYID0gTWF0aC5zcXJ0KEEgKiBBICsgQiAqIEIpO1xuICBBIC89IHNjYWxlWDtcbiAgQiAvPSBzY2FsZVg7XG5cbiAgLy8gc3RlcCAoNClcbiAgdmFyIHNrZXcgPSBBICogQyArIEIgKiBEO1xuICBDIC09IEEgKiBza2V3O1xuICBEIC09IEIgKiBza2V3O1xuXG4gIC8vIHN0ZXAgKDUpXG4gIHZhciBzY2FsZVkgPSBNYXRoLnNxcnQoQyAqIEMgKyBEICogRCk7XG4gIEMgLz0gc2NhbGVZO1xuICBEIC89IHNjYWxlWTtcbiAgc2tldyAvPSBzY2FsZVk7XG5cbiAgLy8gc3RlcCAoNilcbiAgaWYgKGRldGVybWluYW50IDwgMCkge1xuICAgIEEgPSAtQTtcbiAgICBCID0gLUI7XG4gICAgc2tldyA9IC1za2V3O1xuICAgIHNjYWxlWCA9IC1zY2FsZVg7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIHRyYW5zbGF0ZVg6IG1bNF0sXG4gICAgdHJhbnNsYXRlWTogbVs1XSxcbiAgICByb3RhdGU6IHJ0b2QoTWF0aC5hdGFuMihCLCBBKSksXG4gICAgc2tldzogcnRvZChNYXRoLmF0YW4oc2tldykpLFxuICAgIHNjYWxlWDogcm91bmQoc2NhbGVYKSxcbiAgICBzY2FsZVk6IHJvdW5kKHNjYWxlWSlcbiAgfTtcbn1cblxuLyoqXG4gKiBTdHJpbmcgdG8gbWF0cml4XG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0eWxlXG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHBhcnNlKHN0cikge1xuICB2YXIgbSA9IHN0ci5zbGljZSg3KS5tYXRjaCgvW1xcZFxcLlxcLV0rL2cpO1xuICBpZiAoIW0pIHJldHVybiBbMSwgMCwgMCwgMSwgMCwgMF1cbiAgcmV0dXJuIG0ubGVuZ3RoID09IDZcbiAgICA/IG0ubWFwKE51bWJlcilcbiAgICA6IFtcbiAgICAgICAgK21bMF0gLCArbVsxXSxcbiAgICAgICAgK21bNF0gLCArbVs1XSxcbiAgICAgICAgK21bMTJdLCArbVsxM11cbiAgICAgIF07XG59XG5cbi8qKlxuICogUmFkaWFucyB0byBkZWdyZWVzXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IHJhZGlhbnNcbiAqIEByZXR1cm4ge051bWJlcn0gZGVncmVlc1xuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gcnRvZChyYWRpYW5zKSB7XG4gIHZhciBkZWcgPSByYWRpYW5zICogMTgwIC8gTWF0aC5QSTtcbiAgcmV0dXJuIHJvdW5kKGRlZyk7XG59XG5cbi8qKlxuICogUm91bmQgdG8gdGhlIG5lYXJlc3QgaHVuZHJlZHRoXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IG5cbiAqIEByZXR1cm4ge051bWJlcn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHJvdW5kKG4pIHtcbiAgcmV0dXJuIE1hdGgucm91bmQobiAqIDEwMCkgLyAxMDA7XG59XG4iLCJcbi8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL1xuXG52YXIgdHlwZSA9IHJlcXVpcmUoJ3R5cGUnKTtcblxuLyoqXG4gKiBDbG9uZXMgdmFsdWVzXG4gKlxuICogQHBhcmFtIHtNaXhlZH0gYW55IG9iamVjdFxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG9iail7XG4gIHJldHVybiBjbG9uZShvYmosIFtdLCBbXSk7XG59XG5cbi8qKlxuICogaW50ZXJuYWwgZGlzcGF0Y2hlci4gaWYgbm8gc3BlY2lmaWMgaGFuZGxlcnMgYXJlXG4gKiBhdmFpbGFibGUgYG9iamAgaXRzZWxmIHdpbGwgYmUgcmV0dXJuZWRcbiAqIFxuICogQHBhcmFtIHtYfSBvYmpcbiAqIEBwYXJhbSB7QXJyYXl9IHNlZW5cbiAqIEBwYXJhbSB7QXJyYXl9IGNvcGllc1xuICogQHJldHVybiB7WH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGNsb25lKG9iaiwgc2VlbiwgY29waWVzKXtcbiAgdmFyIGZuID0gaGFuZGxlW3R5cGUob2JqKV07XG4gIHJldHVybiBmbiA/IGZuKG9iaiwgc2VlbiwgY29waWVzKSA6IG9iajtcbn1cblxuLyoqXG4gKiB0eXBlIHNwZWNpZmljIGhhbmRsZXJzXG4gKiBcbiAqIEBwYXJhbSB7WH0gYVxuICogQHBhcmFtIHtBcnJheX0gc2VlblxuICogQHBhcmFtIHtBcnJheX0gY29waWVzXG4gKiBAcmV0dXJuIHtYfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxudmFyIGhhbmRsZSA9IHtcbiAgb2JqZWN0OiBmdW5jdGlvbihhLCBzZWVuLCBjb3BpZXMpe1xuICAgIHZhciBrID0gc2Vlbi5pbmRleE9mKGEpO1xuICAgIGlmIChrID49IDApIHJldHVybiBjb3BpZXNba107XG4gICAgdmFyIGNvcHkgPSBPYmplY3QuY3JlYXRlKGEpO1xuICAgIGNvcGllcy5wdXNoKGNvcHkpO1xuICAgIHNlZW4ucHVzaChhKTtcbiAgICBmb3IgKHZhciBrIGluIGEpIHtcbiAgICAgIGNvcHlba10gPSBjbG9uZShhW2tdLCBzZWVuLCBjb3BpZXMpO1xuICAgIH1cbiAgICByZXR1cm4gY29weTtcbiAgfSxcbiAgYXJyYXk6IGNvcHlBcnJheSxcbiAgYXJndW1lbnRzOiBjb3B5QXJyYXksXG4gIHJlZ2V4cDogZnVuY3Rpb24oYSl7XG4gICAgdmFyIGZsYWdzID0gJydcbiAgICAgICsgKGEubXVsdGlsaW5lID8gJ20nIDogJycpXG4gICAgICArIChhLmdsb2JhbCA/ICdnJyA6ICcnKVxuICAgICAgKyAoYS5pZ25vcmVDYXNlID8gJ2knIDogJycpXG4gICAgcmV0dXJuIG5ldyBSZWdFeHAoYS5zb3VyY2UsIGZsYWdzKTtcbiAgfSxcbiAgZGF0ZTogZnVuY3Rpb24oYSl7XG4gICAgcmV0dXJuIG5ldyBEYXRlKGEuZ2V0VGltZSgpKTtcbiAgfSxcbiAgc3RyaW5nOiB1bmJveCxcbiAgbnVtYmVyOiB1bmJveCxcbiAgYm9vbGVhbjogdW5ib3gsXG4gIGVsZW1lbnQ6IGZ1bmN0aW9uKGEsIHNlZW4sIGNvcGllcyl7XG4gICAgdmFyIGsgPSBzZWVuLmluZGV4T2YoYSk7XG4gICAgaWYgKGsgPj0gMCkgcmV0dXJuIGNvcGllc1trXTtcbiAgICB2YXIgY29weSA9IGEuY2xvbmVOb2RlKHRydWUpO1xuICAgIGNvcGllcy5wdXNoKGNvcHkpO1xuICAgIHNlZW4ucHVzaChhKTtcbiAgICByZXR1cm4gY29weTtcbiAgfVxufVxuXG5mdW5jdGlvbiB1bmJveChhKXsgcmV0dXJuIGEudmFsdWVPZigpIH1cblxuZnVuY3Rpb24gY29weUFycmF5KGEsIHNlZW4sIGNvcGllcyl7XG4gIHZhciBpID0gc2Vlbi5pbmRleE9mKGEpO1xuICBpZiAoaSA+PSAwKSByZXR1cm4gY29waWVzW2ldO1xuICB2YXIgY29weSA9IG5ldyBBcnJheShpID0gYS5sZW5ndGgpO1xuICBzZWVuLnB1c2goYSk7XG4gIGNvcGllcy5wdXNoKGNvcHkpO1xuICB3aGlsZSAoaS0tKSB7XG4gICAgY29weVtpXSA9IGNsb25lKGFbaV0sIHNlZW4sIGNvcGllcyk7XG4gIH1cbiAgcmV0dXJuIGNvcHk7XG59XG4iLCJcbnZhciBzdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKS5zdHlsZVxudmFyIHByZWZpeGVzID0gJ08gbXMgTW96IHdlYmtpdCcuc3BsaXQoJyAnKVxudmFyIHVwcGVyID0gLyhbQS1aXSkvZ1xuXG52YXIgbWVtbyA9IHt9XG5cbi8qKlxuICogbWVtb2l6ZWQgYHByZWZpeGBcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IGZ1bmN0aW9uKGtleSl7XG4gIHJldHVybiBrZXkgaW4gbWVtb1xuICAgID8gbWVtb1trZXldXG4gICAgOiBtZW1vW2tleV0gPSBwcmVmaXgoa2V5KVxufVxuXG5leHBvcnRzLnByZWZpeCA9IHByZWZpeFxuZXhwb3J0cy5kYXNoID0gZGFzaGVkUHJlZml4XG5cbi8qKlxuICogcHJlZml4IGBrZXlgXG4gKlxuICogICBwcmVmaXgoJ3RyYW5zZm9ybScpIC8vID0+IHdlYmtpdFRyYW5zZm9ybVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gcHJlZml4KGtleSl7XG4gIC8vIGNhbWVsIGNhc2VcbiAga2V5ID0ga2V5LnJlcGxhY2UoLy0oW2Etel0pL2csIGZ1bmN0aW9uKF8sIGNoYXIpe1xuICAgIHJldHVybiBjaGFyLnRvVXBwZXJDYXNlKClcbiAgfSlcblxuICAvLyB3aXRob3V0IHByZWZpeFxuICBpZiAoc3R5bGVba2V5XSAhPT0gdW5kZWZpbmVkKSByZXR1cm4ga2V5XG5cbiAgLy8gd2l0aCBwcmVmaXhcbiAgdmFyIEtleSA9IGNhcGl0YWxpemUoa2V5KVxuICB2YXIgaSA9IHByZWZpeGVzLmxlbmd0aFxuICB3aGlsZSAoaS0tKSB7XG4gICAgdmFyIG5hbWUgPSBwcmVmaXhlc1tpXSArIEtleVxuICAgIGlmIChzdHlsZVtuYW1lXSAhPT0gdW5kZWZpbmVkKSByZXR1cm4gbmFtZVxuICB9XG5cbiAgdGhyb3cgbmV3IEVycm9yKCd1bmFibGUgdG8gcHJlZml4ICcgKyBrZXkpXG59XG5cbmZ1bmN0aW9uIGNhcGl0YWxpemUoc3RyKXtcbiAgcmV0dXJuIHN0ci5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHN0ci5zbGljZSgxKVxufVxuXG4vKipcbiAqIGNyZWF0ZSBhIGRhc2hlcml6ZWQgcHJlZml4XG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBkYXNoZWRQcmVmaXgoa2V5KXtcbiAga2V5ID0gcHJlZml4KGtleSlcbiAgaWYgKHVwcGVyLnRlc3Qoa2V5KSkga2V5ID0gJy0nICsga2V5LnJlcGxhY2UodXBwZXIsICctJDEnKVxuICByZXR1cm4ga2V5LnRvTG93ZXJDYXNlKClcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIi4vbGF6eVByb3BlcnR5LmpzXCIpIiwiXG4vKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxudmFyIHR5cGVPZiA9IHJlcXVpcmUoJ3R5cGUnKTtcblxuLyoqXG4gKiBTZXQgb3IgZ2V0IGBlbGAncycgdmFsdWUuXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbFxuICogQHBhcmFtIHtNaXhlZH0gdmFsXG4gKiBAcmV0dXJuIHtNaXhlZH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihlbCwgdmFsKXtcbiAgaWYgKDIgPT0gYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHNldChlbCwgdmFsKTtcbiAgcmV0dXJuIGdldChlbCk7XG59O1xuXG4vKipcbiAqIEdldCBgZWxgJ3MgdmFsdWUuXG4gKi9cblxuZnVuY3Rpb24gZ2V0KGVsKSB7XG4gIHN3aXRjaCAodHlwZShlbCkpIHtcbiAgICBjYXNlICdjaGVja2JveCc6XG4gICAgY2FzZSAncmFkaW8nOlxuICAgICAgaWYgKGVsLmNoZWNrZWQpIHtcbiAgICAgICAgdmFyIGF0dHIgPSBlbC5nZXRBdHRyaWJ1dGUoJ3ZhbHVlJyk7XG4gICAgICAgIHJldHVybiBudWxsID09IGF0dHIgPyB0cnVlIDogYXR0cjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICBjYXNlICdyYWRpb2dyb3VwJzpcbiAgICAgIGZvciAodmFyIGkgPSAwLCByYWRpbzsgcmFkaW8gPSBlbFtpXTsgaSsrKSB7XG4gICAgICAgIGlmIChyYWRpby5jaGVja2VkKSByZXR1cm4gcmFkaW8udmFsdWU7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdzZWxlY3QnOlxuICAgICAgZm9yICh2YXIgaSA9IDAsIG9wdGlvbjsgb3B0aW9uID0gZWwub3B0aW9uc1tpXTsgaSsrKSB7XG4gICAgICAgIGlmIChvcHRpb24uc2VsZWN0ZWQpIHJldHVybiBvcHRpb24udmFsdWU7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGVsLnZhbHVlO1xuICB9XG59XG5cbi8qKlxuICogU2V0IGBlbGAncyB2YWx1ZS5cbiAqL1xuXG5mdW5jdGlvbiBzZXQoZWwsIHZhbCkge1xuICBzd2l0Y2ggKHR5cGUoZWwpKSB7XG4gICAgY2FzZSAnY2hlY2tib3gnOlxuICAgIGNhc2UgJ3JhZGlvJzpcbiAgICAgIGlmICh2YWwpIHtcbiAgICAgICAgZWwuY2hlY2tlZCA9IHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlbC5jaGVja2VkID0gZmFsc2U7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdyYWRpb2dyb3VwJzpcbiAgICAgIGZvciAodmFyIGkgPSAwLCByYWRpbzsgcmFkaW8gPSBlbFtpXTsgaSsrKSB7XG4gICAgICAgIHJhZGlvLmNoZWNrZWQgPSByYWRpby52YWx1ZSA9PT0gdmFsO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnc2VsZWN0JzpcbiAgICAgIGZvciAodmFyIGkgPSAwLCBvcHRpb247IG9wdGlvbiA9IGVsLm9wdGlvbnNbaV07IGkrKykge1xuICAgICAgICBvcHRpb24uc2VsZWN0ZWQgPSBvcHRpb24udmFsdWUgPT09IHZhbDtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICBlbC52YWx1ZSA9IHZhbDtcbiAgfVxufVxuXG4vKipcbiAqIEVsZW1lbnQgdHlwZS5cbiAqL1xuXG5mdW5jdGlvbiB0eXBlKGVsKSB7XG4gIHZhciBncm91cCA9ICdhcnJheScgPT0gdHlwZU9mKGVsKSB8fCAnb2JqZWN0JyA9PSB0eXBlT2YoZWwpO1xuICBpZiAoZ3JvdXApIGVsID0gZWxbMF07XG4gIHZhciBuYW1lID0gZWwubm9kZU5hbWUudG9Mb3dlckNhc2UoKTtcbiAgdmFyIHR5cGUgPSBlbC5nZXRBdHRyaWJ1dGUoJ3R5cGUnKTtcblxuICBpZiAoZ3JvdXAgJiYgdHlwZSAmJiAncmFkaW8nID09IHR5cGUudG9Mb3dlckNhc2UoKSkgcmV0dXJuICdyYWRpb2dyb3VwJztcbiAgaWYgKCdpbnB1dCcgPT0gbmFtZSAmJiB0eXBlICYmICdjaGVja2JveCcgPT0gdHlwZS50b0xvd2VyQ2FzZSgpKSByZXR1cm4gJ2NoZWNrYm94JztcbiAgaWYgKCdpbnB1dCcgPT0gbmFtZSAmJiB0eXBlICYmICdyYWRpbycgPT0gdHlwZS50b0xvd2VyQ2FzZSgpKSByZXR1cm4gJ3JhZGlvJztcbiAgaWYgKCdzZWxlY3QnID09IG5hbWUpIHJldHVybiAnc2VsZWN0JztcbiAgcmV0dXJuIG5hbWU7XG59XG4iLCJcbi8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL1xuXG52YXIgaW5kZXggPSByZXF1aXJlKCdpbmRleG9mJyk7XG5cbi8qKlxuICogV2hpdGVzcGFjZSByZWdleHAuXG4gKi9cblxudmFyIHJlID0gL1xccysvO1xuXG4vKipcbiAqIHRvU3RyaW5nIHJlZmVyZW5jZS5cbiAqL1xuXG52YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG4vKipcbiAqIFdyYXAgYGVsYCBpbiBhIGBDbGFzc0xpc3RgLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEByZXR1cm4ge0NsYXNzTGlzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihlbCl7XG4gIHJldHVybiBuZXcgQ2xhc3NMaXN0KGVsKTtcbn07XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBhIG5ldyBDbGFzc0xpc3QgZm9yIGBlbGAuXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbFxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gQ2xhc3NMaXN0KGVsKSB7XG4gIHRoaXMuZWwgPSBlbDtcbiAgdGhpcy5saXN0ID0gZWwuY2xhc3NMaXN0O1xufVxuXG4vKipcbiAqIEFkZCBjbGFzcyBgbmFtZWAgaWYgbm90IGFscmVhZHkgcHJlc2VudC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICogQHJldHVybiB7Q2xhc3NMaXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5DbGFzc0xpc3QucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uKG5hbWUpe1xuICAvLyBjbGFzc0xpc3RcbiAgaWYgKHRoaXMubGlzdCkge1xuICAgIHRoaXMubGlzdC5hZGQobmFtZSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyBmYWxsYmFja1xuICB2YXIgYXJyID0gdGhpcy5hcnJheSgpO1xuICB2YXIgaSA9IGluZGV4KGFyciwgbmFtZSk7XG4gIGlmICghfmkpIGFyci5wdXNoKG5hbWUpO1xuICB0aGlzLmVsLmNsYXNzTmFtZSA9IGFyci5qb2luKCcgJyk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgY2xhc3MgYG5hbWVgIHdoZW4gcHJlc2VudCwgb3JcbiAqIHBhc3MgYSByZWd1bGFyIGV4cHJlc3Npb24gdG8gcmVtb3ZlXG4gKiBhbnkgd2hpY2ggbWF0Y2guXG4gKlxuICogQHBhcmFtIHtTdHJpbmd8UmVnRXhwfSBuYW1lXG4gKiBAcmV0dXJuIHtDbGFzc0xpc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkNsYXNzTGlzdC5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24obmFtZSl7XG4gIGlmICgnW29iamVjdCBSZWdFeHBdJyA9PSB0b1N0cmluZy5jYWxsKG5hbWUpKSB7XG4gICAgcmV0dXJuIHRoaXMucmVtb3ZlTWF0Y2hpbmcobmFtZSk7XG4gIH1cblxuICAvLyBjbGFzc0xpc3RcbiAgaWYgKHRoaXMubGlzdCkge1xuICAgIHRoaXMubGlzdC5yZW1vdmUobmFtZSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyBmYWxsYmFja1xuICB2YXIgYXJyID0gdGhpcy5hcnJheSgpO1xuICB2YXIgaSA9IGluZGV4KGFyciwgbmFtZSk7XG4gIGlmICh+aSkgYXJyLnNwbGljZShpLCAxKTtcbiAgdGhpcy5lbC5jbGFzc05hbWUgPSBhcnIuam9pbignICcpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmVtb3ZlIGFsbCBjbGFzc2VzIG1hdGNoaW5nIGByZWAuXG4gKlxuICogQHBhcmFtIHtSZWdFeHB9IHJlXG4gKiBAcmV0dXJuIHtDbGFzc0xpc3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5DbGFzc0xpc3QucHJvdG90eXBlLnJlbW92ZU1hdGNoaW5nID0gZnVuY3Rpb24ocmUpe1xuICB2YXIgYXJyID0gdGhpcy5hcnJheSgpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xuICAgIGlmIChyZS50ZXN0KGFycltpXSkpIHtcbiAgICAgIHRoaXMucmVtb3ZlKGFycltpXSk7XG4gICAgfVxuICB9XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBUb2dnbGUgY2xhc3MgYG5hbWVgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gKiBAcmV0dXJuIHtDbGFzc0xpc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkNsYXNzTGlzdC5wcm90b3R5cGUudG9nZ2xlID0gZnVuY3Rpb24obmFtZSl7XG4gIC8vIGNsYXNzTGlzdFxuICBpZiAodGhpcy5saXN0KSB7XG4gICAgdGhpcy5saXN0LnRvZ2dsZShuYW1lKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIGZhbGxiYWNrXG4gIGlmICh0aGlzLmhhcyhuYW1lKSkge1xuICAgIHRoaXMucmVtb3ZlKG5hbWUpO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuYWRkKG5hbWUpO1xuICB9XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gYW4gYXJyYXkgb2YgY2xhc3Nlcy5cbiAqXG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuQ2xhc3NMaXN0LnByb3RvdHlwZS5hcnJheSA9IGZ1bmN0aW9uKCl7XG4gIHZhciBzdHIgPSB0aGlzLmVsLmNsYXNzTmFtZS5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJyk7XG4gIHZhciBhcnIgPSBzdHIuc3BsaXQocmUpO1xuICBpZiAoJycgPT09IGFyclswXSkgYXJyLnNoaWZ0KCk7XG4gIHJldHVybiBhcnI7XG59O1xuXG4vKipcbiAqIENoZWNrIGlmIGNsYXNzIGBuYW1lYCBpcyBwcmVzZW50LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gKiBAcmV0dXJuIHtDbGFzc0xpc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkNsYXNzTGlzdC5wcm90b3R5cGUuaGFzID1cbkNsYXNzTGlzdC5wcm90b3R5cGUuY29udGFpbnMgPSBmdW5jdGlvbihuYW1lKXtcbiAgcmV0dXJuIHRoaXMubGlzdFxuICAgID8gdGhpcy5saXN0LmNvbnRhaW5zKG5hbWUpXG4gICAgOiAhISB+aW5kZXgodGhpcy5hcnJheSgpLCBuYW1lKTtcbn07XG4iLCJcbi8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL1xuXG52YXIgbWF0Y2hlcyA9IHJlcXVpcmUoJ21hdGNoZXMtc2VsZWN0b3InKVxuICAsIGV2ZW50ID0gcmVxdWlyZSgnZXZlbnQnKTtcblxuLyoqXG4gKiBEZWxlZ2F0ZSBldmVudCBgdHlwZWAgdG8gYHNlbGVjdG9yYFxuICogYW5kIGludm9rZSBgZm4oZSlgLiBBIGNhbGxiYWNrIGZ1bmN0aW9uXG4gKiBpcyByZXR1cm5lZCB3aGljaCBtYXkgYmUgcGFzc2VkIHRvIGAudW5iaW5kKClgLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7U3RyaW5nfSBzZWxlY3RvclxuICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGNhcHR1cmVcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5leHBvcnRzLmJpbmQgPSBmdW5jdGlvbihlbCwgc2VsZWN0b3IsIHR5cGUsIGZuLCBjYXB0dXJlKXtcbiAgcmV0dXJuIGV2ZW50LmJpbmQoZWwsIHR5cGUsIGZ1bmN0aW9uKGUpe1xuICAgIGlmIChtYXRjaGVzKGUudGFyZ2V0LCBzZWxlY3RvcikpIGZuKGUpO1xuICB9LCBjYXB0dXJlKTtcbiAgcmV0dXJuIGNhbGxiYWNrO1xufTtcblxuLyoqXG4gKiBVbmJpbmQgZXZlbnQgYHR5cGVgJ3MgY2FsbGJhY2sgYGZuYC5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gY2FwdHVyZVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5leHBvcnRzLnVuYmluZCA9IGZ1bmN0aW9uKGVsLCB0eXBlLCBmbiwgY2FwdHVyZSl7XG4gIGV2ZW50LnVuYmluZChlbCwgdHlwZSwgZm4sIGNhcHR1cmUpO1xufTtcbiIsIi8qKlxuICogTW9kdWxlIERlcGVuZGVuY2llc1xuICovXG5cbnZhciBkZWJ1ZyA9IHJlcXVpcmUoJ2RlYnVnJykoJ2NzcycpO1xudmFyIHNldCA9IHJlcXVpcmUoJy4vbGliL3N0eWxlJyk7XG52YXIgZ2V0ID0gcmVxdWlyZSgnLi9saWIvY3NzJyk7XG5cbi8qKlxuICogRXhwb3NlIGBjc3NgXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBjc3M7XG5cbi8qKlxuICogR2V0IGFuZCBzZXQgY3NzIHZhbHVlc1xuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7U3RyaW5nfE9iamVjdH0gcHJvcFxuICogQHBhcmFtIHtNaXhlZH0gdmFsXG4gKiBAcmV0dXJuIHtFbGVtZW50fSBlbFxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBjc3MoZWwsIHByb3AsIHZhbCkge1xuICBpZiAoIWVsKSByZXR1cm47XG5cbiAgaWYgKHVuZGVmaW5lZCAhPT0gdmFsKSB7XG4gICAgdmFyIG9iaiA9IHt9O1xuICAgIG9ialtwcm9wXSA9IHZhbDtcbiAgICBkZWJ1Zygnc2V0dGluZyBzdHlsZXMgJWonLCBvYmopO1xuICAgIHJldHVybiBzZXRTdHlsZXMoZWwsIG9iaik7XG4gIH1cblxuICBpZiAoJ29iamVjdCcgPT0gdHlwZW9mIHByb3ApIHtcbiAgICBkZWJ1Zygnc2V0dGluZyBzdHlsZXMgJWonLCBwcm9wKTtcbiAgICByZXR1cm4gc2V0U3R5bGVzKGVsLCBwcm9wKTtcbiAgfVxuXG4gIGRlYnVnKCdnZXR0aW5nICVzJywgcHJvcCk7XG4gIHJldHVybiBnZXQoZWwsIHByb3ApO1xufVxuXG4vKipcbiAqIFNldCB0aGUgc3R5bGVzIG9uIGFuIGVsZW1lbnRcbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gKiBAcGFyYW0ge09iamVjdH0gcHJvcHNcbiAqIEByZXR1cm4ge0VsZW1lbnR9IGVsXG4gKi9cblxuZnVuY3Rpb24gc2V0U3R5bGVzKGVsLCBwcm9wcykge1xuICBmb3IgKHZhciBwcm9wIGluIHByb3BzKSB7XG4gICAgc2V0KGVsLCBwcm9wLCBwcm9wc1twcm9wXSk7XG4gIH1cblxuICByZXR1cm4gZWw7XG59XG4iLCIvKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxudmFyIHF1ZXJ5ID0gcmVxdWlyZSgncXVlcnknKTtcblxuLyoqXG4gKiBFbGVtZW50IHByb3RvdHlwZS5cbiAqL1xuXG52YXIgcHJvdG8gPSBFbGVtZW50LnByb3RvdHlwZTtcblxuLyoqXG4gKiBWZW5kb3IgZnVuY3Rpb24uXG4gKi9cblxudmFyIHZlbmRvciA9IHByb3RvLm1hdGNoZXNcbiAgfHwgcHJvdG8ud2Via2l0TWF0Y2hlc1NlbGVjdG9yXG4gIHx8IHByb3RvLm1vek1hdGNoZXNTZWxlY3RvclxuICB8fCBwcm90by5tc01hdGNoZXNTZWxlY3RvclxuICB8fCBwcm90by5vTWF0Y2hlc1NlbGVjdG9yO1xuXG4vKipcbiAqIEV4cG9zZSBgbWF0Y2goKWAuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBtYXRjaDtcblxuLyoqXG4gKiBNYXRjaCBgZWxgIHRvIGBzZWxlY3RvcmAuXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbFxuICogQHBhcmFtIHtTdHJpbmd9IHNlbGVjdG9yXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBtYXRjaChlbCwgc2VsZWN0b3IpIHtcbiAgaWYgKHZlbmRvcikgcmV0dXJuIHZlbmRvci5jYWxsKGVsLCBzZWxlY3Rvcik7XG4gIHZhciBub2RlcyA9IHF1ZXJ5LmFsbChzZWxlY3RvciwgZWwucGFyZW50Tm9kZSk7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbm9kZXMubGVuZ3RoOyArK2kpIHtcbiAgICBpZiAobm9kZXNbaV0gPT0gZWwpIHJldHVybiB0cnVlO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cbiIsIlxuLyoqXG4gKiBkZXBlbmRlbmNpZXNcbiAqL1xuXG52YXIgbWF0Y2hlcyA9IHJlcXVpcmUoJ21hdGNoZXMtc2VsZWN0b3InKTtcblxuLyoqXG4gKiBUcmF2ZXJzZSB3aXRoIHRoZSBnaXZlbiBgZWxgLCBgc2VsZWN0b3JgIGFuZCBgbGVuYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuICogQHBhcmFtIHtFbGVtZW50fSBlbFxuICogQHBhcmFtIHtTdHJpbmd9IHNlbGVjdG9yXG4gKiBAcGFyYW0ge051bWJlcn0gbGVuXG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih0eXBlLCBlbCwgc2VsZWN0b3IsIGxlbil7XG4gIHZhciBlbCA9IGVsW3R5cGVdXG4gICAgLCBuID0gbGVuIHx8IDFcbiAgICAsIHJldCA9IFtdO1xuXG4gIGlmICghZWwpIHJldHVybiByZXQ7XG5cbiAgZG8ge1xuICAgIGlmIChuID09IHJldC5sZW5ndGgpIGJyZWFrO1xuICAgIGlmICgxICE9IGVsLm5vZGVUeXBlKSBjb250aW51ZTtcbiAgICBpZiAobWF0Y2hlcyhlbCwgc2VsZWN0b3IpKSByZXQucHVzaChlbCk7XG4gICAgaWYgKCFzZWxlY3RvcikgcmV0LnB1c2goZWwpO1xuICB9IHdoaWxlIChlbCA9IGVsW3R5cGVdKTtcblxuICByZXR1cm4gcmV0O1xufVxuIiwiLyoqXG4gKiBNb2R1bGUgRGVwZW5kZW5jaWVzXG4gKi9cblxudHJ5IHtcbiAgdmFyIGV4cHIgPSByZXF1aXJlKCdwcm9wcycpO1xufSBjYXRjaChlKSB7XG4gIHZhciBleHByID0gcmVxdWlyZSgncHJvcHMtY29tcG9uZW50Jyk7XG59XG5cbi8qKlxuICogRXhwb3NlIGB0b0Z1bmN0aW9uKClgLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gdG9GdW5jdGlvbjtcblxuLyoqXG4gKiBDb252ZXJ0IGBvYmpgIHRvIGEgYEZ1bmN0aW9uYC5cbiAqXG4gKiBAcGFyYW0ge01peGVkfSBvYmpcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gdG9GdW5jdGlvbihvYmopIHtcbiAgc3dpdGNoICh7fS50b1N0cmluZy5jYWxsKG9iaikpIHtcbiAgICBjYXNlICdbb2JqZWN0IE9iamVjdF0nOlxuICAgICAgcmV0dXJuIG9iamVjdFRvRnVuY3Rpb24ob2JqKTtcbiAgICBjYXNlICdbb2JqZWN0IEZ1bmN0aW9uXSc6XG4gICAgICByZXR1cm4gb2JqO1xuICAgIGNhc2UgJ1tvYmplY3QgU3RyaW5nXSc6XG4gICAgICByZXR1cm4gc3RyaW5nVG9GdW5jdGlvbihvYmopO1xuICAgIGNhc2UgJ1tvYmplY3QgUmVnRXhwXSc6XG4gICAgICByZXR1cm4gcmVnZXhwVG9GdW5jdGlvbihvYmopO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZGVmYXVsdFRvRnVuY3Rpb24ob2JqKTtcbiAgfVxufVxuXG4vKipcbiAqIERlZmF1bHQgdG8gc3RyaWN0IGVxdWFsaXR5LlxuICpcbiAqIEBwYXJhbSB7TWl4ZWR9IHZhbFxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBkZWZhdWx0VG9GdW5jdGlvbih2YWwpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKG9iail7XG4gICAgcmV0dXJuIHZhbCA9PT0gb2JqO1xuICB9XG59XG5cbi8qKlxuICogQ29udmVydCBgcmVgIHRvIGEgZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIHtSZWdFeHB9IHJlXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHJlZ2V4cFRvRnVuY3Rpb24ocmUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKG9iail7XG4gICAgcmV0dXJuIHJlLnRlc3Qob2JqKTtcbiAgfVxufVxuXG4vKipcbiAqIENvbnZlcnQgcHJvcGVydHkgYHN0cmAgdG8gYSBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHN0cmluZ1RvRnVuY3Rpb24oc3RyKSB7XG4gIC8vIGltbWVkaWF0ZSBzdWNoIGFzIFwiPiAyMFwiXG4gIGlmICgvXiAqXFxXKy8udGVzdChzdHIpKSByZXR1cm4gbmV3IEZ1bmN0aW9uKCdfJywgJ3JldHVybiBfICcgKyBzdHIpO1xuXG4gIC8vIHByb3BlcnRpZXMgc3VjaCBhcyBcIm5hbWUuZmlyc3RcIiBvciBcImFnZSA+IDE4XCIgb3IgXCJhZ2UgPiAxOCAmJiBhZ2UgPCAzNlwiXG4gIHJldHVybiBuZXcgRnVuY3Rpb24oJ18nLCAncmV0dXJuICcgKyBnZXQoc3RyKSk7XG59XG5cbi8qKlxuICogQ29udmVydCBgb2JqZWN0YCB0byBhIGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3RcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gb2JqZWN0VG9GdW5jdGlvbihvYmopIHtcbiAgdmFyIG1hdGNoID0ge31cbiAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgIG1hdGNoW2tleV0gPSB0eXBlb2Ygb2JqW2tleV0gPT09ICdzdHJpbmcnXG4gICAgICA/IGRlZmF1bHRUb0Z1bmN0aW9uKG9ialtrZXldKVxuICAgICAgOiB0b0Z1bmN0aW9uKG9ialtrZXldKVxuICB9XG4gIHJldHVybiBmdW5jdGlvbih2YWwpe1xuICAgIGlmICh0eXBlb2YgdmFsICE9PSAnb2JqZWN0JykgcmV0dXJuIGZhbHNlO1xuICAgIGZvciAodmFyIGtleSBpbiBtYXRjaCkge1xuICAgICAgaWYgKCEoa2V5IGluIHZhbCkpIHJldHVybiBmYWxzZTtcbiAgICAgIGlmICghbWF0Y2hba2V5XSh2YWxba2V5XSkpIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn1cblxuLyoqXG4gKiBCdWlsdCB0aGUgZ2V0dGVyIGZ1bmN0aW9uLiBTdXBwb3J0cyBnZXR0ZXIgc3R5bGUgZnVuY3Rpb25zXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gZ2V0KHN0cikge1xuICB2YXIgcHJvcHMgPSBleHByKHN0cik7XG4gIGlmICghcHJvcHMubGVuZ3RoKSByZXR1cm4gJ18uJyArIHN0cjtcblxuICB2YXIgdmFsO1xuICBmb3IodmFyIGkgPSAwLCBwcm9wOyBwcm9wID0gcHJvcHNbaV07IGkrKykge1xuICAgIHZhbCA9ICdfLicgKyBwcm9wO1xuICAgIHZhbCA9IFwiKCdmdW5jdGlvbicgPT0gdHlwZW9mIFwiICsgdmFsICsgXCIgPyBcIiArIHZhbCArIFwiKCkgOiBcIiArIHZhbCArIFwiKVwiO1xuICAgIHN0ciA9IHN0ci5yZXBsYWNlKG5ldyBSZWdFeHAocHJvcCwgJ2cnKSwgdmFsKTtcbiAgfVxuXG4gIHJldHVybiBzdHI7XG59XG4iLCJcbnZhciBwYXJzZUNvbG9yID0gcmVxdWlyZSgnY29sb3ItcGFyc2VyJylcbnZhciBwcmVmaXggPSByZXF1aXJlKCdwcmVmaXgnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IHR3ZWVuXG5cbnZhciBkZWZhdWx0VHlwZXMgPSB7XG4gIGZpbGxPcGFjaXR5OiAnbnVtYmVyJyxcbiAgZm9udFdlaWdodDogJ251bWJlcicsXG4gIG9wYWNpdHk6ICdudW1iZXInLFxuICB6SW5kZXg6ICdudW1iZXInLFxuICB6b29tOiAnbnVtYmVyJyxcbiAgdHJhbnNmb3JtOiAnbWF0cml4JyxcbiAgZDogJ3BhdGgnXG59XG5cbmRlZmF1bHRUeXBlc1twcmVmaXgoJ3RyYW5zZm9ybScpXSA9ICdtYXRyaXgnXG5cbi8qKlxuICogY3JlYXRlIGEgdHdlZW4gZnVuY3Rpb25cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gcHJvcFxuICogQHBhcmFtIHtBbnl9IGZyb21cbiAqIEBwYXJhbSB7QW55fSB0b1xuICogQHJldHVybiB7RnVuY3Rpb259XG4gKi9cblxuZnVuY3Rpb24gdHdlZW4ocHJvcCwgZnJvbSwgdG8pe1xuICB2YXIgZm4gPSB0eXBlb2YgdG8gPT0gJ3N0cmluZycgJiYgdHdlZW5bdHlwZSh0byldXG4gIGlmICghZm4pIGZuID0gdHdlZW5bZGVmYXVsdFR5cGVzW3Byb3BdIHx8ICdweCddXG4gIHJldHVybiBmbihmcm9tLCB0bylcbn1cblxudHdlZW4ubnVtYmVyID0gcmVxdWlyZSgnLi9udW1iZXInKVxudHdlZW4ubWF0cml4ID0gcmVxdWlyZSgnLi9tYXRyaXgnKVxudHdlZW4uY29sb3IgPSByZXF1aXJlKCcuL2NvbG9yJylcbnR3ZWVuLnBhdGggPSByZXF1aXJlKCcuL3BhdGgnKVxudHdlZW4ucHggPSByZXF1aXJlKCcuL3B4JylcblxuLyoqXG4gKiBkZXRlcm1pbmUgdHlwZSBvZiBgY3NzYCB2YWx1ZVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBjc3NcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHR5cGUoY3NzKXtcbiAgaWYgKC9ebWF0cml4KDNkKT9cXChbXildKlxcKSQvLnRlc3QoY3NzKSkgcmV0dXJuICdtYXRyaXgnXG4gIGlmICgvXlstLlxcZF0rcHgvLnRlc3QoY3NzKSkgcmV0dXJuICdweCdcbiAgaWYgKHBhcnNlQ29sb3IoY3NzKSkgcmV0dXJuICdjb2xvcidcbn1cbiIsIlwidXNlIHN0cmljdFwiXG5cbmZ1bmN0aW9uIGFkZExhenlQcm9wZXJ0eShvYmplY3QsIG5hbWUsIGluaXRpYWxpemVyLCBlbnVtZXJhYmxlKSB7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmplY3QsIG5hbWUsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHYgPSBpbml0aWFsaXplci5jYWxsKHRoaXMpXG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgbmFtZSwgeyB2YWx1ZTogdiwgZW51bWVyYWJsZTogISFlbnVtZXJhYmxlLCB3cml0YWJsZTogdHJ1ZSB9KVxuICAgICAgcmV0dXJuIHZcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24odikge1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIG5hbWUsIHsgdmFsdWU6IHYsIGVudW1lcmFibGU6ICEhZW51bWVyYWJsZSwgd3JpdGFibGU6IHRydWUgfSlcbiAgICAgIHJldHVybiB2XG4gICAgfSxcbiAgICBlbnVtZXJhYmxlOiAhIWVudW1lcmFibGUsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG4gIH0pXG59XG5cbm1vZHVsZS5leHBvcnRzID0gYWRkTGF6eVByb3BlcnR5XG4iLCJcbi8qKlxuICogZGVwZW5kZW5jaWVzXG4gKi9cblxudmFyIGluaGVyaXQgPSByZXF1aXJlKCdpbmhlcml0Jyk7XG52YXIgbWVyZ2UgPSByZXF1aXJlKCdtZXJnZScpO1xuXG4vKipcbiAqIEV4cG9ydCBgZXh0ZW5zaWJsZWBcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4dGVuc2libGU7XG5cbi8qKlxuICogTWFrZSB0aGUgZ2l2ZW4gYEFgIGV4dGVuc2libGUuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gQVxuICogQHJldHVybiB7QX1cbiAqL1xuXG5mdW5jdGlvbiBleHRlbnNpYmxlKEEpe1xuICBBLmV4dGVuZCA9IGV4dGVuZDtcbiAgcmV0dXJuIEE7XG59O1xuXG4vKipcbiAqIG1ha2UgYGNoaWxkYCBpbmhlcml0IGZyb20gYHRoaXNgLiBVbmxlc3MgYGZpbmFsYCxcbiAqIGBjaGlsZGAgd2lsbCBhbHNvIGJlIG1hZGUgZXh0ZW5zaWJsZS4gSWYgeW91IGRvbid0IFxuICogcGFzcyBhIGBjaGlsZGAgYSBuZXcgb25lIHdpbGwgYmUgY3JlYXRlZC5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2hpbGRdXG4gKiBAcGFyYW0ge0Jvb2xlYW59IFtmaW5hbF1cbiAqIEByZXR1cm4ge2NoaWxkfVxuICovXG5cbmZ1bmN0aW9uIGV4dGVuZChjaGlsZCwgZmluYWwpe1xuICB2YXIgQSA9IHRoaXM7XG4gIHZhciBCID0gJ2Z1bmN0aW9uJyAhPSB0eXBlb2YgY2hpbGRcbiAgICA/IGZ1bmN0aW9uKCl7IEEuYXBwbHkodGhpcywgYXJndW1lbnRzKTsgfVxuICAgIDogY2hpbGQ7XG4gICFmaW5hbCAmJiBleHRlbnNpYmxlKEIpO1xuICBpbmhlcml0KEIsIEEpO1xuICBpZiAoJ29iamVjdCcgPT0gdHlwZW9mIGNoaWxkKSBtZXJnZShCLnByb3RvdHlwZSwgY2hpbGQpO1xuICByZXR1cm4gQjtcbn07XG4iLCJcbnZhciBtZXJnZSA9IHJlcXVpcmUoJ21lcmdlJylcbnZhciBvd24gPSBPYmplY3QuaGFzT3duUHJvcGVydHlcbnZhciBjYWxsID0gRnVuY3Rpb24uY2FsbFxuXG5tb2R1bGUuZXhwb3J0cyA9IEVtaXR0ZXJcblxuLyoqXG4gKiBFbWl0dGVyIGNvbnN0cnVjdG9yLiBDYW4gb3B0aW9uYWxseSBhbHNvIGFjdCBhcyBhIG1peGluXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IFtvYmpdXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cblxuZnVuY3Rpb24gRW1pdHRlcihvYmope1xuXHRpZiAob2JqKSByZXR1cm4gbWVyZ2Uob2JqLCBFbWl0dGVyLnByb3RvdHlwZSlcbn1cblxuLyoqXG4gKiBQcm9jZXNzIGBldmVudGAuIEFsbCBhcmd1bWVudHMgYWZ0ZXIgYHRvcGljYCB3aWxsXG4gKiBiZSBwYXNzZWQgdG8gYWxsIGxpc3RlbmVyc1xuICpcbiAqICAgZW1pdHRlci5lbWl0KCdldmVudCcsIG5ldyBEYXRlKVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB0b3BpY1xuICogQHBhcmFtIHtBbnl9IFsuLi5hcmdzXVxuICogQHJldHVybiB7dGhpc31cbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24odG9waWMpe1xuXHR2YXIgc3ViID0gdGhpcy5fZXZlbnRzXG5cdGlmICghKHN1YiAmJiAoc3ViID0gc3ViW3RvcGljXSkpKSByZXR1cm4gdGhpc1xuXHQvLyBzaW5nbGUgc3Vic3JpcHRpb24gY2FzZVxuXHRpZiAodHlwZW9mIHN1YiA9PSAnZnVuY3Rpb24nKSB7XG5cdFx0Ly8gYXZvaWQgdXNpbmcgLmFwcGx5KCkgZm9yIHNwZWVkXG5cdFx0c3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG5cdFx0XHRjYXNlIDE6IHN1Yi5jYWxsKHRoaXMpO2JyZWFrXG5cdFx0XHRjYXNlIDI6IHN1Yi5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSk7YnJlYWtcblx0XHRcdGNhc2UgMzogc3ViLmNhbGwodGhpcywgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0pO2JyZWFrXG5cdFx0XHRjYXNlIDQ6IHN1Yi5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdLCBhcmd1bWVudHNbM10pO2JyZWFrXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHQvLyBgYXJndW1lbnRzYCBpcyBtYWdpYyA6KVxuXHRcdFx0XHR0b3BpYyA9IHRoaXNcblx0XHRcdFx0Y2FsbC5hcHBseShzdWIsIGFyZ3VtZW50cylcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0dmFyIGZuXG5cdFx0dmFyIGkgPSAwXG5cdFx0dmFyIGwgPSBzdWIubGVuZ3RoXG5cdFx0c3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG5cdFx0XHRjYXNlIDE6IHdoaWxlIChpIDwgbCkgc3ViW2krK10uY2FsbCh0aGlzKTticmVha1xuXHRcdFx0Y2FzZSAyOiB3aGlsZSAoaSA8IGwpIHN1YltpKytdLmNhbGwodGhpcywgYXJndW1lbnRzWzFdKTticmVha1xuXHRcdFx0Y2FzZSAzOiB3aGlsZSAoaSA8IGwpIHN1YltpKytdLmNhbGwodGhpcywgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0pO2JyZWFrXG5cdFx0XHRjYXNlIDQ6IHdoaWxlIChpIDwgbCkgc3ViW2krK10uY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSwgYXJndW1lbnRzWzNdKTticmVha1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0dG9waWMgPSB0aGlzXG5cdFx0XHRcdHdoaWxlIChpIDwgbCkgY2FsbC5hcHBseShzdWJbaSsrXSwgYXJndW1lbnRzKVxuXHRcdH1cblx0fVxuXHRyZXR1cm4gdGhpc1xufVxuXG4vKipcbiAqIEFkZCBhIHN1YnNjcmlwdGlvbiB1bmRlciBhIHRvcGljIG5hbWVcbiAqXG4gKiAgIGVtaXR0ZXIub24oJ2V2ZW50JywgZnVuY3Rpb24oZGF0YSl7fSlcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdG9waWNcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHt0aGlzfVxuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLm9uID0gZnVuY3Rpb24odG9waWMsIGZuKXtcblx0aWYgKCFvd24uY2FsbCh0aGlzLCAnX2V2ZW50cycpKSB0aGlzLl9ldmVudHMgPSBjbG9uZSh0aGlzLl9ldmVudHMpXG5cdHZhciBldmVudHMgPSB0aGlzLl9ldmVudHNcblx0aWYgKHR5cGVvZiBldmVudHNbdG9waWNdID09ICdmdW5jdGlvbicpIHtcblx0XHRldmVudHNbdG9waWNdID0gW2V2ZW50c1t0b3BpY10sIGZuXVxuXHR9IGVsc2UgaWYgKGV2ZW50c1t0b3BpY10pIHtcblx0XHRldmVudHNbdG9waWNdID0gZXZlbnRzW3RvcGljXS5jb25jYXQoZm4pXG5cdH0gZWxzZSB7XG5cdFx0ZXZlbnRzW3RvcGljXSA9IGZuXG5cdH1cblx0cmV0dXJuIHRoaXNcbn1cblxuLyoqXG4gKiBSZW1vdmUgc3Vic2NyaXB0aW9uc1xuICpcbiAqICAgZW1pdHRlci5vZmYoKSAgICAgICAgICAgIC8vIGNsZWFycyBhbGwgbGlzdGVuZXJzXG4gKiAgIGVtaXR0ZXIub2ZmKCd0b3BpYycpICAgICAvLyBjbGVhcnMgYWxsIGB0b3BpY2AgbGlzdGVuZXJzXG4gKiAgIGVtaXR0ZXIub2ZmKCd0b3BpYycsIGZuKSAvLyBhcyBhYm92ZSBidXQgb25seSB3aGVyZSBgbGlzdGVuZXIgPT0gZm5gXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IFt0b3BpY11cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtmbl1cbiAqIEByZXR1cm4ge3RoaXN9XG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUub2ZmID0gZnVuY3Rpb24odG9waWMsIGZuKXtcblx0aWYgKCF0aGlzLl9ldmVudHMpIHJldHVybiB0aGlzXG5cdGlmICghb3duLmNhbGwodGhpcywgJ19ldmVudHMnKSkgdGhpcy5fZXZlbnRzID0gY2xvbmUodGhpcy5fZXZlbnRzKVxuXHR2YXIgZXZlbnRzID0gdGhpcy5fZXZlbnRzXG5cblx0aWYgKHRvcGljID09IG51bGwpIHtcblx0XHRmb3IgKHZhciBpIGluIGV2ZW50cykgZGVsZXRlIGV2ZW50c1tpXVxuXHR9IGVsc2UgaWYgKGZuID09IG51bGwpIHtcblx0XHRkZWxldGUgZXZlbnRzW3RvcGljXVxuXHR9IGVsc2Uge1xuXHRcdHZhciBzdWJzID0gZXZlbnRzW3RvcGljXVxuXHRcdGlmICghc3VicykgcmV0dXJuIHRoaXNcblx0XHRpZiAodHlwZW9mIHN1YnMgPT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0aWYgKHN1YnMgPT09IGZuKSBkZWxldGUgZXZlbnRzW3RvcGljXVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRzdWJzID0gZXZlbnRzW3RvcGljXSA9IHN1YnMuZmlsdGVyKGZ1bmN0aW9uKGxpc3RlbmVyKXtcblx0XHRcdFx0cmV0dXJuIGxpc3RlbmVyICE9PSBmblxuXHRcdFx0fSlcblx0XHRcdC8vIHRpZHlcblx0XHRcdGlmIChzdWJzLmxlbmd0aCA9PSAxKSBldmVudHNbdG9waWNdID0gc3Vic1swXVxuXHRcdFx0ZWxzZSBpZiAoIXN1YnMubGVuZ3RoKSBkZWxldGUgZXZlbnRzW3RvcGljXVxuXHRcdH1cblx0fVxuXHRyZXR1cm4gdGhpc1xufVxuXG4vKipcbiAqIHN1YnNjcmliZSBgZm5gIGJ1dCByZW1vdmUgaWYgYWZ0ZXIgaXRzIGZpcnN0IGludm9jYXRpb25cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdG9waWNcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHt0aGlzfVxuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbih0b3BpYywgZm4pe1xuXHR2YXIgc2VsZiA9IHRoaXNcblx0cmV0dXJuIHRoaXMub24odG9waWMsIGZ1bmN0aW9uIG9uY2UoKXtcblx0XHRzZWxmLm9mZih0b3BpYywgb25jZSlcblx0XHRmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG5cdH0pXG59XG5cbi8qKlxuICogc2VlIGlmIGBlbWl0dGVyYCBoYXMgYW55IHN1YnNjcmlwdGlvbnMgbWF0Y2hpbmdcbiAqIGB0b3BpY2AgYW5kIG9wdGlvbmFsbHkgYWxzbyBgZm5gXG4gKlxuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyXG4gKiBAcGFyYW0ge1N0cmluZ30gdG9waWNcbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtmbl1cbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cblxuRW1pdHRlci5oYXNTdWJzY3JpcHRpb24gPSBmdW5jdGlvbihlbWl0dGVyLCB0b3BpYywgZm4pe1xuXHR2YXIgZm5zID0gRW1pdHRlci5zdWJzY3JpcHRpb25zKGVtaXR0ZXIsIHRvcGljKVxuXHRpZiAoZm4gPT0gbnVsbCkgcmV0dXJuIEJvb2xlYW4oZm5zLmxlbmd0aClcblx0cmV0dXJuIGZucy5pbmRleE9mKGZuKSA+PSAwXG59XG5cbi8qKlxuICogZ2V0IGFuIEFycmF5IG9mIHN1YnNjcmlwdGlvbnMgZm9yIGB0b3BpY2BcbiAqXG4gKiBAcGFyYW0ge0VtaXR0ZXJ9IGVtaXR0ZXJcbiAqIEBwYXJhbSB7U3RyaW5nfSB0b3BpY1xuICogQHJldHVybiB7QXJyYXl9XG4gKi9cblxuRW1pdHRlci5zdWJzY3JpcHRpb25zID0gZnVuY3Rpb24oZW1pdHRlciwgdG9waWMpe1xuXHR2YXIgZm5zID0gZW1pdHRlci5fZXZlbnRzXG5cdGlmICghZm5zIHx8ICEoZm5zID0gZm5zW3RvcGljXSkpIHJldHVybiBbXVxuXHRpZiAodHlwZW9mIGZucyA9PSAnZnVuY3Rpb24nKSByZXR1cm4gW2Zuc11cblx0cmV0dXJuIGZucy5zbGljZSgpXG59XG5cbmZ1bmN0aW9uIGNsb25lKG9iail7XG5cdHJldHVybiBtZXJnZSh7fSwgb2JqKVxufVxuIiwiXG52YXIgZ2xvYmFsID0gZnVuY3Rpb24oKXtyZXR1cm4gdGhpc30oKVxudmFyIHBlcmZvcm1hbmNlID0gZ2xvYmFsLnBlcmZvcm1hbmNlXG5cbi8qKlxuICogR2V0IGEgdGltZXN0YW1wXG4gKiBcbiAqIEByZXR1cm4ge051bWJlcn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpe1xuICByZXR1cm4gcGVyZm9ybWFuY2Uubm93KClcbn1cblxuLy8gZmFsbGJhY2tcblxuaWYgKCFwZXJmb3JtYW5jZSB8fCB0eXBlb2YgcGVyZm9ybWFuY2Uubm93ICE9ICdmdW5jdGlvbicpIHtcblx0bW9kdWxlLmV4cG9ydHMgPSBEYXRlLm5vdyB8fCBmdW5jdGlvbigpeyByZXR1cm4gKyhuZXcgRGF0ZSkgfVxufVxuIiwiXG52YXIgdG9TdHJpbmcgPSB7fS50b1N0cmluZ1xudmFyIERvbU5vZGUgPSB0eXBlb2Ygd2luZG93ICE9ICd1bmRlZmluZWQnXG5cdD8gd2luZG93Lk5vZGVcblx0OiBGdW5jdGlvblxuXG4vKipcbiAqIFJldHVybiB0aGUgdHlwZSBvZiBgdmFsYC5cbiAqXG4gKiBAcGFyYW0ge01peGVkfSB2YWxcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHVibGljXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gZnVuY3Rpb24oeCl7XG5cdHZhciB0eXBlID0gdHlwZW9mIHhcblx0aWYgKHR5cGUgIT0gJ29iamVjdCcpIHJldHVybiB0eXBlXG5cdHR5cGUgPSB0eXBlc1t0b1N0cmluZy5jYWxsKHgpXVxuXHRpZiAodHlwZSkgcmV0dXJuIHR5cGVcblx0aWYgKHggaW5zdGFuY2VvZiBEb21Ob2RlKSBzd2l0Y2ggKHgubm9kZVR5cGUpIHtcblx0XHRjYXNlIDE6ICByZXR1cm4gJ2VsZW1lbnQnXG5cdFx0Y2FzZSAzOiAgcmV0dXJuICd0ZXh0LW5vZGUnXG5cdFx0Y2FzZSA5OiAgcmV0dXJuICdkb2N1bWVudCdcblx0XHRjYXNlIDExOiByZXR1cm4gJ2RvY3VtZW50LWZyYWdtZW50J1xuXHRcdGRlZmF1bHQ6IHJldHVybiAnZG9tLW5vZGUnXG5cdH1cbn1cblxudmFyIHR5cGVzID0gZXhwb3J0cy50eXBlcyA9IHtcblx0J1tvYmplY3QgRnVuY3Rpb25dJzogJ2Z1bmN0aW9uJyxcblx0J1tvYmplY3QgRGF0ZV0nOiAnZGF0ZScsXG5cdCdbb2JqZWN0IFJlZ0V4cF0nOiAncmVnZXhwJyxcblx0J1tvYmplY3QgQXJndW1lbnRzXSc6ICdhcmd1bWVudHMnLFxuXHQnW29iamVjdCBBcnJheV0nOiAnYXJyYXknLFxuXHQnW29iamVjdCBTdHJpbmddJzogJ3N0cmluZycsXG5cdCdbb2JqZWN0IE51bGxdJzogJ251bGwnLFxuXHQnW29iamVjdCBVbmRlZmluZWRdJzogJ3VuZGVmaW5lZCcsXG5cdCdbb2JqZWN0IE51bWJlcl0nOiAnbnVtYmVyJyxcblx0J1tvYmplY3QgQm9vbGVhbl0nOiAnYm9vbGVhbicsXG5cdCdbb2JqZWN0IE9iamVjdF0nOiAnb2JqZWN0Jyxcblx0J1tvYmplY3QgVGV4dF0nOiAndGV4dC1ub2RlJyxcblx0J1tvYmplY3QgVWludDhBcnJheV0nOiAnOGJpdC1hcnJheScsXG5cdCdbb2JqZWN0IFVpbnQxNkFycmF5XSc6ICcxNmJpdC1hcnJheScsXG5cdCdbb2JqZWN0IFVpbnQzMkFycmF5XSc6ICczMmJpdC1hcnJheScsXG5cdCdbb2JqZWN0IFVpbnQ4Q2xhbXBlZEFycmF5XSc6ICc4Yml0LWFycmF5Jyxcblx0J1tvYmplY3QgRXJyb3JdJzogJ2Vycm9yJyxcblx0J1tvYmplY3QgRm9ybURhdGFdJzogJ2Zvcm0tZGF0YScsXG5cdCdbb2JqZWN0IEZpbGVdJzogJ2ZpbGUnLFxuXHQnW29iamVjdCBCbG9iXSc6ICdibG9iJ1xufSIsIlxudmFyIGR1cmF0aW9uID0gLygtP1xcZCpcXC4/XFxkKyg/OmVbLStdP1xcZCspPylcXHMqKFthLXpdKikvaWdcblxubW9kdWxlLmV4cG9ydHMgPSBwYXJzZVxuXG4vKipcbiAqIGNvbnZlcnNpb24gcmF0aW9zXG4gKi9cblxucGFyc2UubXMgPSAxXG5wYXJzZS5zZWNvbmRzID1cbnBhcnNlLnNlY29uZCA9XG5wYXJzZS5zZWMgPVxucGFyc2UucyA9IHBhcnNlLm1zICogMTAwMFxucGFyc2UubWludXRlcyA9XG5wYXJzZS5taW51dGUgPVxucGFyc2UubWluID1cbnBhcnNlLm1pbnMgPVxucGFyc2UubSA9IHBhcnNlLnMgKiA2MFxucGFyc2UuaG91cnMgPVxucGFyc2UuaG91ciA9XG5wYXJzZS5ociA9XG5wYXJzZS5oID0gcGFyc2UubSAqIDYwXG5wYXJzZS5kYXlzID1cbnBhcnNlLmRheSA9XG5wYXJzZS5kID0gcGFyc2UuaCAqIDI0XG5wYXJzZS53ZWVrcyA9XG5wYXJzZS53ZWVrID1cbnBhcnNlLndrID1cbnBhcnNlLncgPSBwYXJzZS5kICogN1xucGFyc2UueWVhcnMgPVxucGFyc2UueWVhciA9XG5wYXJzZS55ciA9XG5wYXJzZS55ID0gcGFyc2UuZCAqIDM2NS4yNVxuXG4vKipcbiAqIGNvbnZlcnQgYHN0cmAgdG8gbXNcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtOdW1iZXJ9XG4gKi9cblxuZnVuY3Rpb24gcGFyc2Uoc3RyKXtcblx0dmFyIHJlc3VsdCA9IDBcblx0c3RyLnJlcGxhY2UoZHVyYXRpb24sIGZ1bmN0aW9uKF8sIG4sIHVuaXRzKXtcblx0XHRyZXN1bHQgKz0gcGFyc2VGbG9hdChuLCAxMCkgKiAocGFyc2VbdW5pdHNdIHx8IDEpXG5cdH0pXG5cdHJldHVybiByZXN1bHRcbn1cbiIsIlxuZXhwb3J0cy5saW5lYXIgPSBmdW5jdGlvbihuKXtcbiAgcmV0dXJuIG47XG59O1xuXG5leHBvcnRzLmluUXVhZCA9IGZ1bmN0aW9uKG4pe1xuICByZXR1cm4gbiAqIG47XG59O1xuXG5leHBvcnRzLm91dFF1YWQgPSBmdW5jdGlvbihuKXtcbiAgcmV0dXJuIG4gKiAoMiAtIG4pO1xufTtcblxuZXhwb3J0cy5pbk91dFF1YWQgPSBmdW5jdGlvbihuKXtcbiAgbiAqPSAyO1xuICBpZiAobiA8IDEpIHJldHVybiAwLjUgKiBuICogbjtcbiAgcmV0dXJuIC0gMC41ICogKC0tbiAqIChuIC0gMikgLSAxKTtcbn07XG5cbmV4cG9ydHMuaW5DdWJlID0gZnVuY3Rpb24obil7XG4gIHJldHVybiBuICogbiAqIG47XG59O1xuXG5leHBvcnRzLm91dEN1YmUgPSBmdW5jdGlvbihuKXtcbiAgcmV0dXJuIC0tbiAqIG4gKiBuICsgMTtcbn07XG5cbmV4cG9ydHMuaW5PdXRDdWJlID0gZnVuY3Rpb24obil7XG4gIG4gKj0gMjtcbiAgaWYgKG4gPCAxKSByZXR1cm4gMC41ICogbiAqIG4gKiBuO1xuICByZXR1cm4gMC41ICogKChuIC09IDIgKSAqIG4gKiBuICsgMik7XG59O1xuXG5leHBvcnRzLmluUXVhcnQgPSBmdW5jdGlvbihuKXtcbiAgcmV0dXJuIG4gKiBuICogbiAqIG47XG59O1xuXG5leHBvcnRzLm91dFF1YXJ0ID0gZnVuY3Rpb24obil7XG4gIHJldHVybiAxIC0gKC0tbiAqIG4gKiBuICogbik7XG59O1xuXG5leHBvcnRzLmluT3V0UXVhcnQgPSBmdW5jdGlvbihuKXtcbiAgbiAqPSAyO1xuICBpZiAobiA8IDEpIHJldHVybiAwLjUgKiBuICogbiAqIG4gKiBuO1xuICByZXR1cm4gLTAuNSAqICgobiAtPSAyKSAqIG4gKiBuICogbiAtIDIpO1xufTtcblxuZXhwb3J0cy5pblF1aW50ID0gZnVuY3Rpb24obil7XG4gIHJldHVybiBuICogbiAqIG4gKiBuICogbjtcbn1cblxuZXhwb3J0cy5vdXRRdWludCA9IGZ1bmN0aW9uKG4pe1xuICByZXR1cm4gLS1uICogbiAqIG4gKiBuICogbiArIDE7XG59XG5cbmV4cG9ydHMuaW5PdXRRdWludCA9IGZ1bmN0aW9uKG4pe1xuICBuICo9IDI7XG4gIGlmIChuIDwgMSkgcmV0dXJuIDAuNSAqIG4gKiBuICogbiAqIG4gKiBuO1xuICByZXR1cm4gMC41ICogKChuIC09IDIpICogbiAqIG4gKiBuICogbiArIDIpO1xufTtcblxuZXhwb3J0cy5pblNpbmUgPSBmdW5jdGlvbihuKXtcbiAgcmV0dXJuIDEgLSBNYXRoLmNvcyhuICogTWF0aC5QSSAvIDIgKTtcbn07XG5cbmV4cG9ydHMub3V0U2luZSA9IGZ1bmN0aW9uKG4pe1xuICByZXR1cm4gTWF0aC5zaW4obiAqIE1hdGguUEkgLyAyKTtcbn07XG5cbmV4cG9ydHMuaW5PdXRTaW5lID0gZnVuY3Rpb24obil7XG4gIHJldHVybiAuNSAqICgxIC0gTWF0aC5jb3MoTWF0aC5QSSAqIG4pKTtcbn07XG5cbmV4cG9ydHMuaW5FeHBvID0gZnVuY3Rpb24obil7XG4gIHJldHVybiAwID09IG4gPyAwIDogTWF0aC5wb3coMTAyNCwgbiAtIDEpO1xufTtcblxuZXhwb3J0cy5vdXRFeHBvID0gZnVuY3Rpb24obil7XG4gIHJldHVybiAxID09IG4gPyBuIDogMSAtIE1hdGgucG93KDIsIC0xMCAqIG4pO1xufTtcblxuZXhwb3J0cy5pbk91dEV4cG8gPSBmdW5jdGlvbihuKXtcbiAgaWYgKDAgPT0gbikgcmV0dXJuIDA7XG4gIGlmICgxID09IG4pIHJldHVybiAxO1xuICBpZiAoKG4gKj0gMikgPCAxKSByZXR1cm4gLjUgKiBNYXRoLnBvdygxMDI0LCBuIC0gMSk7XG4gIHJldHVybiAuNSAqICgtTWF0aC5wb3coMiwgLTEwICogKG4gLSAxKSkgKyAyKTtcbn07XG5cbmV4cG9ydHMuaW5DaXJjID0gZnVuY3Rpb24obil7XG4gIHJldHVybiAxIC0gTWF0aC5zcXJ0KDEgLSBuICogbik7XG59O1xuXG5leHBvcnRzLm91dENpcmMgPSBmdW5jdGlvbihuKXtcbiAgcmV0dXJuIE1hdGguc3FydCgxIC0gKC0tbiAqIG4pKTtcbn07XG5cbmV4cG9ydHMuaW5PdXRDaXJjID0gZnVuY3Rpb24obil7XG4gIG4gKj0gMlxuICBpZiAobiA8IDEpIHJldHVybiAtMC41ICogKE1hdGguc3FydCgxIC0gbiAqIG4pIC0gMSk7XG4gIHJldHVybiAwLjUgKiAoTWF0aC5zcXJ0KDEgLSAobiAtPSAyKSAqIG4pICsgMSk7XG59O1xuXG5leHBvcnRzLmluQmFjayA9IGZ1bmN0aW9uKG4pe1xuICB2YXIgcyA9IDEuNzAxNTg7XG4gIHJldHVybiBuICogbiAqICgoIHMgKyAxICkgKiBuIC0gcyk7XG59O1xuXG5leHBvcnRzLm91dEJhY2sgPSBmdW5jdGlvbihuKXtcbiAgdmFyIHMgPSAxLjcwMTU4O1xuICByZXR1cm4gLS1uICogbiAqICgocyArIDEpICogbiArIHMpICsgMTtcbn07XG5cbmV4cG9ydHMuaW5PdXRCYWNrID0gZnVuY3Rpb24obil7XG4gIHZhciBzID0gMS43MDE1OCAqIDEuNTI1O1xuICBpZiAoICggbiAqPSAyICkgPCAxICkgcmV0dXJuIDAuNSAqICggbiAqIG4gKiAoICggcyArIDEgKSAqIG4gLSBzICkgKTtcbiAgcmV0dXJuIDAuNSAqICggKCBuIC09IDIgKSAqIG4gKiAoICggcyArIDEgKSAqIG4gKyBzICkgKyAyICk7XG59O1xuXG5leHBvcnRzLmluQm91bmNlID0gZnVuY3Rpb24obil7XG4gIHJldHVybiAxIC0gZXhwb3J0cy5vdXRCb3VuY2UoMSAtIG4pO1xufTtcblxuZXhwb3J0cy5vdXRCb3VuY2UgPSBmdW5jdGlvbihuKXtcbiAgaWYgKCBuIDwgKCAxIC8gMi43NSApICkge1xuICAgIHJldHVybiA3LjU2MjUgKiBuICogbjtcbiAgfSBlbHNlIGlmICggbiA8ICggMiAvIDIuNzUgKSApIHtcbiAgICByZXR1cm4gNy41NjI1ICogKCBuIC09ICggMS41IC8gMi43NSApICkgKiBuICsgMC43NTtcbiAgfSBlbHNlIGlmICggbiA8ICggMi41IC8gMi43NSApICkge1xuICAgIHJldHVybiA3LjU2MjUgKiAoIG4gLT0gKCAyLjI1IC8gMi43NSApICkgKiBuICsgMC45Mzc1O1xuICB9IGVsc2Uge1xuICAgIHJldHVybiA3LjU2MjUgKiAoIG4gLT0gKCAyLjYyNSAvIDIuNzUgKSApICogbiArIDAuOTg0Mzc1O1xuICB9XG59O1xuXG5leHBvcnRzLmluT3V0Qm91bmNlID0gZnVuY3Rpb24obil7XG4gIGlmIChuIDwgLjUpIHJldHVybiBleHBvcnRzLmluQm91bmNlKG4gKiAyKSAqIC41O1xuICByZXR1cm4gZXhwb3J0cy5vdXRCb3VuY2UobiAqIDIgLSAxKSAqIC41ICsgLjU7XG59O1xuXG4vLyBhbGlhc2VzXG5cbmV4cG9ydHNbJ2luLXF1YWQnXSA9IGV4cG9ydHMuaW5RdWFkO1xuZXhwb3J0c1snb3V0LXF1YWQnXSA9IGV4cG9ydHMub3V0UXVhZDtcbmV4cG9ydHNbJ2luLW91dC1xdWFkJ10gPSBleHBvcnRzLmluT3V0UXVhZDtcbmV4cG9ydHNbJ2luLWN1YmUnXSA9IGV4cG9ydHMuaW5DdWJlO1xuZXhwb3J0c1snb3V0LWN1YmUnXSA9IGV4cG9ydHMub3V0Q3ViZTtcbmV4cG9ydHNbJ2luLW91dC1jdWJlJ10gPSBleHBvcnRzLmluT3V0Q3ViZTtcbmV4cG9ydHNbJ2luLXF1YXJ0J10gPSBleHBvcnRzLmluUXVhcnQ7XG5leHBvcnRzWydvdXQtcXVhcnQnXSA9IGV4cG9ydHMub3V0UXVhcnQ7XG5leHBvcnRzWydpbi1vdXQtcXVhcnQnXSA9IGV4cG9ydHMuaW5PdXRRdWFydDtcbmV4cG9ydHNbJ2luLXF1aW50J10gPSBleHBvcnRzLmluUXVpbnQ7XG5leHBvcnRzWydvdXQtcXVpbnQnXSA9IGV4cG9ydHMub3V0UXVpbnQ7XG5leHBvcnRzWydpbi1vdXQtcXVpbnQnXSA9IGV4cG9ydHMuaW5PdXRRdWludDtcbmV4cG9ydHNbJ2luLXNpbmUnXSA9IGV4cG9ydHMuaW5TaW5lO1xuZXhwb3J0c1snb3V0LXNpbmUnXSA9IGV4cG9ydHMub3V0U2luZTtcbmV4cG9ydHNbJ2luLW91dC1zaW5lJ10gPSBleHBvcnRzLmluT3V0U2luZTtcbmV4cG9ydHNbJ2luLWV4cG8nXSA9IGV4cG9ydHMuaW5FeHBvO1xuZXhwb3J0c1snb3V0LWV4cG8nXSA9IGV4cG9ydHMub3V0RXhwbztcbmV4cG9ydHNbJ2luLW91dC1leHBvJ10gPSBleHBvcnRzLmluT3V0RXhwbztcbmV4cG9ydHNbJ2luLWNpcmMnXSA9IGV4cG9ydHMuaW5DaXJjO1xuZXhwb3J0c1snb3V0LWNpcmMnXSA9IGV4cG9ydHMub3V0Q2lyYztcbmV4cG9ydHNbJ2luLW91dC1jaXJjJ10gPSBleHBvcnRzLmluT3V0Q2lyYztcbmV4cG9ydHNbJ2luLWJhY2snXSA9IGV4cG9ydHMuaW5CYWNrO1xuZXhwb3J0c1snb3V0LWJhY2snXSA9IGV4cG9ydHMub3V0QmFjaztcbmV4cG9ydHNbJ2luLW91dC1iYWNrJ10gPSBleHBvcnRzLmluT3V0QmFjaztcbmV4cG9ydHNbJ2luLWJvdW5jZSddID0gZXhwb3J0cy5pbkJvdW5jZTtcbmV4cG9ydHNbJ291dC1ib3VuY2UnXSA9IGV4cG9ydHMub3V0Qm91bmNlO1xuZXhwb3J0c1snaW4tb3V0LWJvdW5jZSddID0gZXhwb3J0cy5pbk91dEJvdW5jZTtcbiIsIi8qKlxuICogRXhwb3NlIGByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKWAuXG4gKi9cblxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZVxuICB8fCB3aW5kb3cud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lXG4gIHx8IHdpbmRvdy5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWVcbiAgfHwgd2luZG93Lm9SZXF1ZXN0QW5pbWF0aW9uRnJhbWVcbiAgfHwgd2luZG93Lm1zUmVxdWVzdEFuaW1hdGlvbkZyYW1lXG4gIHx8IGZhbGxiYWNrO1xuXG4vKipcbiAqIEZhbGxiYWNrIGltcGxlbWVudGF0aW9uLlxuICovXG5cbnZhciBwcmV2ID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5mdW5jdGlvbiBmYWxsYmFjayhmbikge1xuICB2YXIgY3VyciA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICB2YXIgbXMgPSBNYXRoLm1heCgwLCAxNiAtIChjdXJyIC0gcHJldikpO1xuICB2YXIgcmVxID0gc2V0VGltZW91dChmbiwgbXMpO1xuICBwcmV2ID0gY3VycjtcbiAgcmV0dXJuIHJlcTtcbn1cblxuLyoqXG4gKiBDYW5jZWwuXG4gKi9cblxudmFyIGNhbmNlbCA9IHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZVxuICB8fCB3aW5kb3cud2Via2l0Q2FuY2VsQW5pbWF0aW9uRnJhbWVcbiAgfHwgd2luZG93Lm1vekNhbmNlbEFuaW1hdGlvbkZyYW1lXG4gIHx8IHdpbmRvdy5vQ2FuY2VsQW5pbWF0aW9uRnJhbWVcbiAgfHwgd2luZG93Lm1zQ2FuY2VsQW5pbWF0aW9uRnJhbWVcbiAgfHwgd2luZG93LmNsZWFyVGltZW91dDtcblxuZXhwb3J0cy5jYW5jZWwgPSBmdW5jdGlvbihpZCl7XG4gIGNhbmNlbC5jYWxsKHdpbmRvdywgaWQpO1xufTtcbiIsIlxuLyoqXG4gKiB0b1N0cmluZyByZWYuXG4gKi9cblxudmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuLyoqXG4gKiBSZXR1cm4gdGhlIHR5cGUgb2YgYHZhbGAuXG4gKlxuICogQHBhcmFtIHtNaXhlZH0gdmFsXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24odmFsKXtcbiAgc3dpdGNoICh0b1N0cmluZy5jYWxsKHZhbCkpIHtcbiAgICBjYXNlICdbb2JqZWN0IEZ1bmN0aW9uXSc6IHJldHVybiAnZnVuY3Rpb24nO1xuICAgIGNhc2UgJ1tvYmplY3QgRGF0ZV0nOiByZXR1cm4gJ2RhdGUnO1xuICAgIGNhc2UgJ1tvYmplY3QgUmVnRXhwXSc6IHJldHVybiAncmVnZXhwJztcbiAgICBjYXNlICdbb2JqZWN0IEFyZ3VtZW50c10nOiByZXR1cm4gJ2FyZ3VtZW50cyc7XG4gICAgY2FzZSAnW29iamVjdCBBcnJheV0nOiByZXR1cm4gJ2FycmF5JztcbiAgICBjYXNlICdbb2JqZWN0IFN0cmluZ10nOiByZXR1cm4gJ3N0cmluZyc7XG4gIH1cblxuICBpZiAodmFsID09PSBudWxsKSByZXR1cm4gJ251bGwnO1xuICBpZiAodmFsID09PSB1bmRlZmluZWQpIHJldHVybiAndW5kZWZpbmVkJztcbiAgaWYgKHZhbCAmJiB2YWwubm9kZVR5cGUgPT09IDEpIHJldHVybiAnZWxlbWVudCc7XG4gIGlmICh2YWwgPT09IE9iamVjdCh2YWwpKSByZXR1cm4gJ29iamVjdCc7XG5cbiAgcmV0dXJuIHR5cGVvZiB2YWw7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihhcnIsIG9iail7XG4gIGlmIChhcnIuaW5kZXhPZikgcmV0dXJuIGFyci5pbmRleE9mKG9iaik7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgKytpKSB7XG4gICAgaWYgKGFycltpXSA9PT0gb2JqKSByZXR1cm4gaTtcbiAgfVxuICByZXR1cm4gLTE7XG59OyIsImlmICgndW5kZWZpbmVkJyA9PSB0eXBlb2Ygd2luZG93KSB7XG4gIG1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9saWIvZGVidWcnKTtcbn0gZWxzZSB7XG4gIG1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9kZWJ1ZycpO1xufVxuIiwiLyoqXG4gKiBNb2R1bGUgRGVwZW5kZW5jaWVzXG4gKi9cblxudmFyIGRlYnVnID0gcmVxdWlyZSgnZGVidWcnKSgnY3NzOnN0eWxlJyk7XG52YXIgY2FtZWxjYXNlID0gcmVxdWlyZSgndG8tY2FtZWwtY2FzZScpO1xudmFyIHN1cHBvcnQgPSByZXF1aXJlKCcuL3N1cHBvcnQnKTtcbnZhciBwcm9wZXJ0eSA9IHJlcXVpcmUoJy4vcHJvcCcpO1xudmFyIGhvb2tzID0gcmVxdWlyZSgnLi9ob29rcycpO1xuXG4vKipcbiAqIEV4cG9zZSBgc3R5bGVgXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBzdHlsZTtcblxuLyoqXG4gKiBQb3NzaWJseS11bml0bGVzcyBwcm9wZXJ0aWVzXG4gKlxuICogRG9uJ3QgYXV0b21hdGljYWxseSBhZGQgJ3B4JyB0byB0aGVzZSBwcm9wZXJ0aWVzXG4gKi9cblxudmFyIGNzc051bWJlciA9IHtcbiAgXCJjb2x1bW5Db3VudFwiOiB0cnVlLFxuICBcImZpbGxPcGFjaXR5XCI6IHRydWUsXG4gIFwiZm9udFdlaWdodFwiOiB0cnVlLFxuICBcImxpbmVIZWlnaHRcIjogdHJ1ZSxcbiAgXCJvcGFjaXR5XCI6IHRydWUsXG4gIFwib3JkZXJcIjogdHJ1ZSxcbiAgXCJvcnBoYW5zXCI6IHRydWUsXG4gIFwid2lkb3dzXCI6IHRydWUsXG4gIFwiekluZGV4XCI6IHRydWUsXG4gIFwiem9vbVwiOiB0cnVlXG59O1xuXG4vKipcbiAqIFNldCBhIGNzcyB2YWx1ZVxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7U3RyaW5nfSBwcm9wXG4gKiBAcGFyYW0ge01peGVkfSB2YWxcbiAqIEBwYXJhbSB7TWl4ZWR9IGV4dHJhXG4gKi9cblxuZnVuY3Rpb24gc3R5bGUoZWwsIHByb3AsIHZhbCwgZXh0cmEpIHtcbiAgLy8gRG9uJ3Qgc2V0IHN0eWxlcyBvbiB0ZXh0IGFuZCBjb21tZW50IG5vZGVzXG4gIGlmICghZWwgfHwgZWwubm9kZVR5cGUgPT09IDMgfHwgZWwubm9kZVR5cGUgPT09IDggfHwgIWVsLnN0eWxlICkgcmV0dXJuO1xuXG4gIHZhciBvcmlnID0gY2FtZWxjYXNlKHByb3ApO1xuICB2YXIgc3R5bGUgPSBlbC5zdHlsZTtcbiAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsO1xuXG4gIGlmICghdmFsKSByZXR1cm4gZ2V0KGVsLCBwcm9wLCBvcmlnLCBleHRyYSk7XG5cbiAgcHJvcCA9IHByb3BlcnR5KHByb3AsIHN0eWxlKTtcblxuICB2YXIgaG9vayA9IGhvb2tzW3Byb3BdIHx8IGhvb2tzW29yaWddO1xuXG4gIC8vIElmIGEgbnVtYmVyIHdhcyBwYXNzZWQgaW4sIGFkZCAncHgnIHRvIHRoZSAoZXhjZXB0IGZvciBjZXJ0YWluIENTUyBwcm9wZXJ0aWVzKVxuICBpZiAoJ251bWJlcicgPT0gdHlwZSAmJiAhY3NzTnVtYmVyW29yaWddKSB7XG4gICAgZGVidWcoJ2FkZGluZyBcInB4XCIgdG8gZW5kIG9mIG51bWJlcicpO1xuICAgIHZhbCArPSAncHgnO1xuICB9XG5cbiAgLy8gRml4ZXMgalF1ZXJ5ICM4OTA4LCBpdCBjYW4gYmUgZG9uZSBtb3JlIGNvcnJlY3RseSBieSBzcGVjaWZ5aW5nIHNldHRlcnMgaW4gY3NzSG9va3MsXG4gIC8vIGJ1dCBpdCB3b3VsZCBtZWFuIHRvIGRlZmluZSBlaWdodCAoZm9yIGV2ZXJ5IHByb2JsZW1hdGljIHByb3BlcnR5KSBpZGVudGljYWwgZnVuY3Rpb25zXG4gIGlmICghc3VwcG9ydC5jbGVhckNsb25lU3R5bGUgJiYgJycgPT09IHZhbCAmJiAwID09PSBwcm9wLmluZGV4T2YoJ2JhY2tncm91bmQnKSkge1xuICAgIGRlYnVnKCdzZXQgcHJvcGVydHkgKCVzKSB2YWx1ZSB0byBcImluaGVyaXRcIicsIHByb3ApO1xuICAgIHN0eWxlW3Byb3BdID0gJ2luaGVyaXQnO1xuICB9XG5cbiAgLy8gSWYgYSBob29rIHdhcyBwcm92aWRlZCwgdXNlIHRoYXQgdmFsdWUsIG90aGVyd2lzZSBqdXN0IHNldCB0aGUgc3BlY2lmaWVkIHZhbHVlXG4gIGlmICghaG9vayB8fCAhaG9vay5zZXQgfHwgdW5kZWZpbmVkICE9PSAodmFsID0gaG9vay5zZXQoZWwsIHZhbCwgZXh0cmEpKSkge1xuICAgIC8vIFN1cHBvcnQ6IENocm9tZSwgU2FmYXJpXG4gICAgLy8gU2V0dGluZyBzdHlsZSB0byBibGFuayBzdHJpbmcgcmVxdWlyZWQgdG8gZGVsZXRlIFwic3R5bGU6IHggIWltcG9ydGFudDtcIlxuICAgIGRlYnVnKCdzZXQgaG9vayBkZWZpbmVkLiBzZXR0aW5nIHByb3BlcnR5ICglcykgdG8gJXMnLCBwcm9wLCB2YWwpO1xuICAgIHN0eWxlW3Byb3BdID0gJyc7XG4gICAgc3R5bGVbcHJvcF0gPSB2YWw7XG4gIH1cblxufVxuXG4vKipcbiAqIEdldCB0aGUgc3R5bGVcbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gKiBAcGFyYW0ge1N0cmluZ30gcHJvcFxuICogQHBhcmFtIHtTdHJpbmd9IG9yaWdcbiAqIEBwYXJhbSB7TWl4ZWR9IGV4dHJhXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cblxuZnVuY3Rpb24gZ2V0KGVsLCBwcm9wLCBvcmlnLCBleHRyYSkge1xuICB2YXIgc3R5bGUgPSBlbC5zdHlsZTtcbiAgdmFyIGhvb2sgPSBob29rc1twcm9wXSB8fCBob29rc1tvcmlnXTtcbiAgdmFyIHJldDtcblxuICBpZiAoaG9vayAmJiBob29rLmdldCAmJiB1bmRlZmluZWQgIT09IChyZXQgPSBob29rLmdldChlbCwgZmFsc2UsIGV4dHJhKSkpIHtcbiAgICBkZWJ1ZygnZ2V0IGhvb2sgZGVmaW5lZCwgcmV0dXJuaW5nOiAlcycsIHJldCk7XG4gICAgcmV0dXJuIHJldDtcbiAgfVxuXG4gIHJldCA9IHN0eWxlW3Byb3BdO1xuICBkZWJ1ZygnZ2V0dGluZyAlcycsIHJldCk7XG4gIHJldHVybiByZXQ7XG59XG4iLCIvKipcbiAqIE1vZHVsZSBEZXBlbmRlbmNpZXNcbiAqL1xuXG52YXIgZGVidWcgPSByZXF1aXJlKCdkZWJ1ZycpKCdjc3M6Y3NzJyk7XG52YXIgY2FtZWxjYXNlID0gcmVxdWlyZSgndG8tY2FtZWwtY2FzZScpO1xudmFyIGNvbXB1dGVkID0gcmVxdWlyZSgnLi9jb21wdXRlZCcpO1xudmFyIHByb3BlcnR5ID0gcmVxdWlyZSgnLi9wcm9wJyk7XG5cbi8qKlxuICogRXhwb3NlIGBjc3NgXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBjc3M7XG5cbi8qKlxuICogQ1NTIE5vcm1hbCBUcmFuc2Zvcm1zXG4gKi9cblxudmFyIGNzc05vcm1hbFRyYW5zZm9ybSA9IHtcbiAgbGV0dGVyU3BhY2luZzogMCxcbiAgZm9udFdlaWdodDogNDAwXG59O1xuXG4vKipcbiAqIEdldCBhIENTUyB2YWx1ZVxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7U3RyaW5nfSBwcm9wXG4gKiBAcGFyYW0ge01peGVkfSBleHRyYVxuICogQHBhcmFtIHtBcnJheX0gc3R5bGVzXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cblxuZnVuY3Rpb24gY3NzKGVsLCBwcm9wLCBleHRyYSwgc3R5bGVzKSB7XG4gIHZhciBob29rcyA9IHJlcXVpcmUoJy4vaG9va3MnKTtcbiAgdmFyIG9yaWcgPSBjYW1lbGNhc2UocHJvcCk7XG4gIHZhciBzdHlsZSA9IGVsLnN0eWxlO1xuICB2YXIgdmFsO1xuXG4gIHByb3AgPSBwcm9wZXJ0eShwcm9wLCBzdHlsZSk7XG4gIHZhciBob29rID0gaG9va3NbcHJvcF0gfHwgaG9va3Nbb3JpZ107XG5cbiAgLy8gSWYgYSBob29rIHdhcyBwcm92aWRlZCBnZXQgdGhlIGNvbXB1dGVkIHZhbHVlIGZyb20gdGhlcmVcbiAgaWYgKGhvb2sgJiYgaG9vay5nZXQpIHtcbiAgICBkZWJ1ZygnZ2V0IGhvb2sgcHJvdmlkZWQuIHVzZSB0aGF0Jyk7XG4gICAgdmFsID0gaG9vay5nZXQoZWwsIHRydWUsIGV4dHJhKTtcbiAgfVxuXG4gIC8vIE90aGVyd2lzZSwgaWYgYSB3YXkgdG8gZ2V0IHRoZSBjb21wdXRlZCB2YWx1ZSBleGlzdHMsIHVzZSB0aGF0XG4gIGlmICh1bmRlZmluZWQgPT0gdmFsKSB7XG4gICAgZGVidWcoJ2ZldGNoIHRoZSBjb21wdXRlZCB2YWx1ZSBvZiAlcycsIHByb3ApO1xuICAgIHZhbCA9IGNvbXB1dGVkKGVsLCBwcm9wKTtcbiAgfVxuXG4gIGlmICgnbm9ybWFsJyA9PSB2YWwgJiYgY3NzTm9ybWFsVHJhbnNmb3JtW3Byb3BdKSB7XG4gICAgdmFsID0gY3NzTm9ybWFsVHJhbnNmb3JtW3Byb3BdO1xuICAgIGRlYnVnKCdub3JtYWwgPT4gJXMnLCB2YWwpO1xuICB9XG5cbiAgLy8gUmV0dXJuLCBjb252ZXJ0aW5nIHRvIG51bWJlciBpZiBmb3JjZWQgb3IgYSBxdWFsaWZpZXIgd2FzIHByb3ZpZGVkIGFuZCB2YWwgbG9va3MgbnVtZXJpY1xuICBpZiAoJycgPT0gZXh0cmEgfHwgZXh0cmEpIHtcbiAgICBkZWJ1ZygnY29udmVydGluZyB2YWx1ZTogJXMgaW50byBhIG51bWJlcicpO1xuICAgIHZhciBudW0gPSBwYXJzZUZsb2F0KHZhbCk7XG4gICAgcmV0dXJuIHRydWUgPT09IGV4dHJhIHx8IGlzTnVtZXJpYyhudW0pID8gbnVtIHx8IDAgOiB2YWw7XG4gIH1cblxuICByZXR1cm4gdmFsO1xufVxuXG4vKipcbiAqIElzIE51bWVyaWNcbiAqXG4gKiBAcGFyYW0ge01peGVkfSBvYmpcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cblxuZnVuY3Rpb24gaXNOdW1lcmljKG9iaikge1xuICByZXR1cm4gIWlzTmFuKHBhcnNlRmxvYXQob2JqKSkgJiYgaXNGaW5pdGUob2JqKTtcbn1cbiIsIlxuLyoqXG4gKiBSZXR1cm4gaW1tZWRpYXRlIGlkZW50aWZpZXJzIHBhcnNlZCBmcm9tIGBzdHJgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEBwYXJhbSB7U3RyaW5nfEZ1bmN0aW9ufSBtYXAgZnVuY3Rpb24gb3IgcHJlZml4XG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzdHIsIGZuKXtcbiAgdmFyIHAgPSB1bmlxdWUocHJvcHMoc3RyKSk7XG4gIGlmIChmbiAmJiAnc3RyaW5nJyA9PSB0eXBlb2YgZm4pIGZuID0gcHJlZml4ZWQoZm4pO1xuICBpZiAoZm4pIHJldHVybiBtYXAoc3RyLCBwLCBmbik7XG4gIHJldHVybiBwO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gaW1tZWRpYXRlIGlkZW50aWZpZXJzIGluIGBzdHJgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge0FycmF5fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gcHJvcHMoc3RyKSB7XG4gIHJldHVybiBzdHJcbiAgICAucmVwbGFjZSgvXFwuXFx3K3xcXHcrICpcXCh8XCJbXlwiXSpcInwnW14nXSonfFxcLyhbXi9dKylcXC8vZywgJycpXG4gICAgLm1hdGNoKC9bYS16QS1aX11cXHcqL2cpXG4gICAgfHwgW107XG59XG5cbi8qKlxuICogUmV0dXJuIGBzdHJgIHdpdGggYHByb3BzYCBtYXBwZWQgd2l0aCBgZm5gLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEBwYXJhbSB7QXJyYXl9IHByb3BzXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gbWFwKHN0ciwgcHJvcHMsIGZuKSB7XG4gIHZhciByZSA9IC9cXC5cXHcrfFxcdysgKlxcKHxcIlteXCJdKlwifCdbXiddKid8XFwvKFteL10rKVxcL3xbYS16QS1aX11cXHcqL2c7XG4gIHJldHVybiBzdHIucmVwbGFjZShyZSwgZnVuY3Rpb24oXyl7XG4gICAgaWYgKCcoJyA9PSBfW18ubGVuZ3RoIC0gMV0pIHJldHVybiBmbihfKTtcbiAgICBpZiAoIX5wcm9wcy5pbmRleE9mKF8pKSByZXR1cm4gXztcbiAgICByZXR1cm4gZm4oXyk7XG4gIH0pO1xufVxuXG4vKipcbiAqIFJldHVybiB1bmlxdWUgYXJyYXkuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gYXJyXG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHVuaXF1ZShhcnIpIHtcbiAgdmFyIHJldCA9IFtdO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKH5yZXQuaW5kZXhPZihhcnJbaV0pKSBjb250aW51ZTtcbiAgICByZXQucHVzaChhcnJbaV0pO1xuICB9XG5cbiAgcmV0dXJuIHJldDtcbn1cblxuLyoqXG4gKiBNYXAgd2l0aCBwcmVmaXggYHN0cmAuXG4gKi9cblxuZnVuY3Rpb24gcHJlZml4ZWQoc3RyKSB7XG4gIHJldHVybiBmdW5jdGlvbihfKXtcbiAgICByZXR1cm4gc3RyICsgXztcbiAgfVxufVxuIiwiXG4vKipcbiAqIFJldHVybiBpbW1lZGlhdGUgaWRlbnRpZmllcnMgcGFyc2VkIGZyb20gYHN0cmAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7QXJyYXl9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc3RyLCBwcmVmaXgpe1xuICB2YXIgcCA9IHVuaXF1ZShwcm9wcyhzdHIpKTtcbiAgaWYgKHByZWZpeCkgcmV0dXJuIHByZWZpeGVkKHN0ciwgcCwgcHJlZml4KTtcbiAgcmV0dXJuIHA7XG59O1xuXG4vKipcbiAqIFJldHVybiBpbW1lZGlhdGUgaWRlbnRpZmllcnMgaW4gYHN0cmAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7QXJyYXl9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBwcm9wcyhzdHIpIHtcbiAgcmV0dXJuIHN0clxuICAgIC5yZXBsYWNlKC9cXC5cXHcrfFxcdysgKlxcKHxcIlteXCJdKlwifCdbXiddKid8XFwvKFteL10rKVxcLy9nLCAnJylcbiAgICAubWF0Y2goL1thLXpBLVpfXVxcdyovZylcbiAgICB8fCBbXTtcbn1cblxuLyoqXG4gKiBSZXR1cm4gYHN0cmAgd2l0aCBgcHJvcHNgIHByZWZpeGVkIHdpdGggYHByZWZpeGAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHBhcmFtIHtBcnJheX0gcHJvcHNcbiAqIEBwYXJhbSB7U3RyaW5nfSBwcmVmaXhcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHByZWZpeGVkKHN0ciwgcHJvcHMsIHByZWZpeCkge1xuICB2YXIgcmUgPSAvXFwuXFx3K3xcXHcrICpcXCh8XCJbXlwiXSpcInwnW14nXSonfFxcLyhbXi9dKylcXC98W2EtekEtWl9dXFx3Ki9nO1xuICByZXR1cm4gc3RyLnJlcGxhY2UocmUsIGZ1bmN0aW9uKF8pe1xuICAgIGlmICgnKCcgPT0gX1tfLmxlbmd0aCAtIDFdKSByZXR1cm4gcHJlZml4ICsgXztcbiAgICBpZiAoIX5wcm9wcy5pbmRleE9mKF8pKSByZXR1cm4gXztcbiAgICByZXR1cm4gcHJlZml4ICsgXztcbiAgfSk7XG59XG5cbi8qKlxuICogUmV0dXJuIHVuaXF1ZSBhcnJheS5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJcbiAqIEByZXR1cm4ge0FycmF5fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gdW5pcXVlKGFycikge1xuICB2YXIgcmV0ID0gW107XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAofnJldC5pbmRleE9mKGFycltpXSkpIGNvbnRpbnVlO1xuICAgIHJldC5wdXNoKGFycltpXSk7XG4gIH1cblxuICByZXR1cm4gcmV0O1xufVxuIiwiXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGZyb20sIHRvKXtcbiAgZnJvbSA9IHBhcnNlRmxvYXQoZnJvbSwgMTApIHx8IDBcbiAgdG8gPSBwYXJzZUZsb2F0KHRvLCAxMCkgfHwgMFxuICByZXR1cm4gZnVuY3Rpb24gZnJhbWUobil7XG4gICAgcmV0dXJuIGZyb20gKyAodG8gLSBmcm9tKSAqIG5cbiAgfVxufVxuIiwiXG52YXIgdHdlZW4gPSByZXF1aXJlKCdzdHJpbmctdHdlZW4nKVxudmFyIHVubWF0cml4ID0gcmVxdWlyZSgndW5tYXRyaXgnKVxudmFyIGtleXMgPSBPYmplY3Qua2V5c1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGZyb20sIHRvKXtcbiAgcmV0dXJuIHR3ZWVuKG5vcm1hbGl6ZShmcm9tKSwgbm9ybWFsaXplKHRvKSlcbn1cblxuZnVuY3Rpb24gbm9ybWFsaXplKG0pe1xuICBpZiAodHlwZW9mIG0gPT0gJ3N0cmluZycpIG0gPSB1bm1hdHJpeChtKVxuICByZXR1cm4ga2V5cyh1bml0KS5yZWR1Y2UoZnVuY3Rpb24oc3RyLCBrZXkpe1xuICAgIHJldHVybiBzdHIgKyBrZXkgKyAnKCcgKyBtW2tleV0gKyB1bml0W2tleV0gKyAnKSdcbiAgfSwgJycpXG59XG5cbnZhciB1bml0ID0ge1xuICB0cmFuc2xhdGVYOiAncHgnLFxuICB0cmFuc2xhdGVZOiAncHgnLFxuICByb3RhdGU6ICdkZWcnLFxuICBza2V3OiAnZGVnJyxcbiAgc2NhbGVYOiAnJyxcbiAgc2NhbGVZOiAnJ1xufSIsIlxudmFyIHBhcnNlID0gcmVxdWlyZSgnY29sb3ItcGFyc2VyJylcbnZhciByb3VuZCA9IE1hdGgucm91bmRcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihmcm9tLCB0byl7XG4gIGZyb20gPSByZ2JhKGZyb20pXG4gIHRvID0gcmdiYSh0bylcbiAgdmFyIGN1cnIgPSB0by5zbGljZSgpXG4gIHJldHVybiBmdW5jdGlvbiBmcmFtZShuKXtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDM7IGkrKykge1xuICAgICAgY3VycltpXSA9IHJvdW5kKGZyb21baV0gKyAodG9baV0gLSBmcm9tW2ldKSAqIG4pXG4gICAgfVxuICAgIC8vIGRvbid0IHJvdW5kIGFscGhhXG4gICAgY3VyclszXSA9IGZyb21baV0gKyAodG9baV0gLSBmcm9tW2ldKSAqIG5cbiAgICByZXR1cm4gJ3JnYmEoJyArIGN1cnIgKyAnKSdcbiAgfVxufVxuXG5mdW5jdGlvbiByZ2JhKGNvbG9yKXtcbiAgY29sb3IgPSBwYXJzZShjb2xvcilcbiAgaWYgKCFjb2xvcikgcmV0dXJuIFsyNTUsMjU1LDI1NSwwXSAvLyB0cmFuc3BhcmVudFxuICByZXR1cm4gW1xuICAgIGNvbG9yLnIsXG4gICAgY29sb3IuZyxcbiAgICBjb2xvci5iLFxuICAgIChjb2xvci5hID09IG51bGwgPyAxIDogY29sb3IuYSlcbiAgXVxufVxuIiwiXG52YXIgdG9TdHJpbmcgPSByZXF1aXJlKCdzZXJpYWxpemUtc3ZnLXBhdGgnKVxudmFyIGJhbGFuY2UgPSByZXF1aXJlKCdiYWxhbmNlLXN2Zy1wYXRocycpXG52YXIgdHdlZW4gPSByZXF1aXJlKCdzdHJpbmctdHdlZW4nKVxudmFyIG5vcm1hbGl6ZSA9IHJlcXVpcmUoJ2Zjb21wJykoXG4gIHJlcXVpcmUoJ3BhcnNlLXN2Zy1wYXRoJyksXG4gIHJlcXVpcmUoJ2Ficy1zdmctcGF0aCcpLFxuICByZXF1aXJlKCdub3JtYWxpemUtc3ZnLXBhdGgnKSxcbiAgcmVxdWlyZSgncmVsLXN2Zy1wYXRoJykpXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZnJvbSwgdG8pe1xuICB2YXIgZW5kcyA9IGJhbGFuY2Uobm9ybWFsaXplKGZyb20pLCBub3JtYWxpemUodG8pKVxuICByZXR1cm4gdHdlZW4odG9TdHJpbmcoZW5kc1swXSksIHRvU3RyaW5nKGVuZHNbMV0pKVxufVxuIiwiXG52YXIgdHdlZW4gPSByZXF1aXJlKCcuL251bWJlcicpXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZnJvbSwgdG8pe1xuICB2YXIgZnJhbWUgPSB0d2Vlbihmcm9tLCB0bylcbiAgcmV0dXJuIGZ1bmN0aW9uKG4pe1xuICAgIHJldHVybiBmcmFtZShuKS50b0ZpeGVkKDEpICsgJ3B4J1xuICB9XG59XG4iLCJcbi8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL1xuXG52YXIgY29sb3JzID0gcmVxdWlyZSgnLi9jb2xvcnMnKTtcblxuLyoqXG4gKiBFeHBvc2UgYHBhcnNlYC5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHBhcnNlO1xuXG4vKipcbiAqIFBhcnNlIGBzdHJgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gcGFyc2Uoc3RyKSB7XG4gIHJldHVybiBuYW1lZChzdHIpXG4gICAgfHwgaGV4MyhzdHIpXG4gICAgfHwgaGV4NihzdHIpXG4gICAgfHwgcmdiKHN0cilcbiAgICB8fCByZ2JhKHN0cik7XG59XG5cbi8qKlxuICogUGFyc2UgbmFtZWQgY3NzIGNvbG9yIGBzdHJgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIG5hbWVkKHN0cikge1xuICB2YXIgYyA9IGNvbG9yc1tzdHIudG9Mb3dlckNhc2UoKV07XG4gIGlmICghYykgcmV0dXJuO1xuICByZXR1cm4ge1xuICAgIHI6IGNbMF0sXG4gICAgZzogY1sxXSxcbiAgICBiOiBjWzJdXG4gIH1cbn1cblxuLyoqXG4gKiBQYXJzZSByZ2IobiwgbiwgbilcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiByZ2Ioc3RyKSB7XG4gIGlmICgwID09IHN0ci5pbmRleE9mKCdyZ2IoJykpIHtcbiAgICBzdHIgPSBzdHIubWF0Y2goL3JnYlxcKChbXildKylcXCkvKVsxXTtcbiAgICB2YXIgcGFydHMgPSBzdHIuc3BsaXQoLyAqLCAqLykubWFwKE51bWJlcik7XG4gICAgcmV0dXJuIHtcbiAgICAgIHI6IHBhcnRzWzBdLFxuICAgICAgZzogcGFydHNbMV0sXG4gICAgICBiOiBwYXJ0c1syXSxcbiAgICAgIGE6IDFcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBQYXJzZSByZ2JhKG4sIG4sIG4sIG4pXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gcmdiYShzdHIpIHtcbiAgaWYgKDAgPT0gc3RyLmluZGV4T2YoJ3JnYmEoJykpIHtcbiAgICBzdHIgPSBzdHIubWF0Y2goL3JnYmFcXCgoW14pXSspXFwpLylbMV07XG4gICAgdmFyIHBhcnRzID0gc3RyLnNwbGl0KC8gKiwgKi8pLm1hcChOdW1iZXIpO1xuICAgIHJldHVybiB7XG4gICAgICByOiBwYXJ0c1swXSxcbiAgICAgIGc6IHBhcnRzWzFdLFxuICAgICAgYjogcGFydHNbMl0sXG4gICAgICBhOiBwYXJ0c1szXVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIFBhcnNlICNubm5ubm5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBoZXg2KHN0cikge1xuICBpZiAoJyMnID09IHN0clswXSAmJiA3ID09IHN0ci5sZW5ndGgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgcjogcGFyc2VJbnQoc3RyLnNsaWNlKDEsIDMpLCAxNiksXG4gICAgICBnOiBwYXJzZUludChzdHIuc2xpY2UoMywgNSksIDE2KSxcbiAgICAgIGI6IHBhcnNlSW50KHN0ci5zbGljZSg1LCA3KSwgMTYpLFxuICAgICAgYTogMVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIFBhcnNlICNubm5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBoZXgzKHN0cikge1xuICBpZiAoJyMnID09IHN0clswXSAmJiA0ID09IHN0ci5sZW5ndGgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgcjogcGFyc2VJbnQoc3RyWzFdICsgc3RyWzFdLCAxNiksXG4gICAgICBnOiBwYXJzZUludChzdHJbMl0gKyBzdHJbMl0sIDE2KSxcbiAgICAgIGI6IHBhcnNlSW50KHN0clszXSArIHN0clszXSwgMTYpLFxuICAgICAgYTogMVxuICAgIH1cbiAgfVxufVxuXG4iLCJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oYSwgYil7XG4gIHZhciBmbiA9IGZ1bmN0aW9uKCl7fTtcbiAgZm4ucHJvdG90eXBlID0gYi5wcm90b3R5cGU7XG4gIGEucHJvdG90eXBlID0gbmV3IGZuO1xuICBhLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGE7XG59OyIsIlxuLyoqXG4gKiBtZXJnZSBgYmAncyBwcm9wZXJ0aWVzIHdpdGggYGFgJ3MuXG4gKlxuICogZXhhbXBsZTpcbiAqXG4gKiAgICAgICAgdmFyIHVzZXIgPSB7fTtcbiAqICAgICAgICBtZXJnZSh1c2VyLCBjb25zb2xlKTtcbiAqICAgICAgICAvLyA+IHsgbG9nOiBmbiwgZGlyOiBmbiAuLn1cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gYVxuICogQHBhcmFtIHtPYmplY3R9IGJcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChhLCBiKSB7XG4gIGZvciAodmFyIGsgaW4gYikgYVtrXSA9IGJba107XG4gIHJldHVybiBhO1xufTtcbiIsIlxuLyoqXG4gKiBtZXJnZSBgYmAncyBwcm9wZXJ0aWVzIHdpdGggYGFgJ3MuXG4gKlxuICogZXhhbXBsZTpcbiAqXG4gKiAgICAgICAgdmFyIHVzZXIgPSB7fTtcbiAqICAgICAgICBtZXJnZSh1c2VyLCBjb25zb2xlKTtcbiAqICAgICAgICAvLyA+IHsgbG9nOiBmbiwgZGlyOiBmbiAuLn1cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gYVxuICogQHBhcmFtIHtPYmplY3R9IGJcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChhLCBiKSB7XG4gIGZvciAodmFyIGsgaW4gYikgYVtrXSA9IGJba107XG4gIHJldHVybiBhO1xufTtcbiIsIlxuLyoqXG4gKiBFeHBvc2UgYGRlYnVnKClgIGFzIHRoZSBtb2R1bGUuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBkZWJ1ZztcblxuLyoqXG4gKiBDcmVhdGUgYSBkZWJ1Z2dlciB3aXRoIHRoZSBnaXZlbiBgbmFtZWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAqIEByZXR1cm4ge1R5cGV9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIGRlYnVnKG5hbWUpIHtcbiAgaWYgKCFkZWJ1Zy5lbmFibGVkKG5hbWUpKSByZXR1cm4gZnVuY3Rpb24oKXt9O1xuXG4gIHJldHVybiBmdW5jdGlvbihmbXQpe1xuICAgIGZtdCA9IGNvZXJjZShmbXQpO1xuXG4gICAgdmFyIGN1cnIgPSBuZXcgRGF0ZTtcbiAgICB2YXIgbXMgPSBjdXJyIC0gKGRlYnVnW25hbWVdIHx8IGN1cnIpO1xuICAgIGRlYnVnW25hbWVdID0gY3VycjtcblxuICAgIGZtdCA9IG5hbWVcbiAgICAgICsgJyAnXG4gICAgICArIGZtdFxuICAgICAgKyAnICsnICsgZGVidWcuaHVtYW5pemUobXMpO1xuXG4gICAgLy8gVGhpcyBoYWNrZXJ5IGlzIHJlcXVpcmVkIGZvciBJRThcbiAgICAvLyB3aGVyZSBgY29uc29sZS5sb2dgIGRvZXNuJ3QgaGF2ZSAnYXBwbHknXG4gICAgd2luZG93LmNvbnNvbGVcbiAgICAgICYmIGNvbnNvbGUubG9nXG4gICAgICAmJiBGdW5jdGlvbi5wcm90b3R5cGUuYXBwbHkuY2FsbChjb25zb2xlLmxvZywgY29uc29sZSwgYXJndW1lbnRzKTtcbiAgfVxufVxuXG4vKipcbiAqIFRoZSBjdXJyZW50bHkgYWN0aXZlIGRlYnVnIG1vZGUgbmFtZXMuXG4gKi9cblxuZGVidWcubmFtZXMgPSBbXTtcbmRlYnVnLnNraXBzID0gW107XG5cbi8qKlxuICogRW5hYmxlcyBhIGRlYnVnIG1vZGUgYnkgbmFtZS4gVGhpcyBjYW4gaW5jbHVkZSBtb2Rlc1xuICogc2VwYXJhdGVkIGJ5IGEgY29sb24gYW5kIHdpbGRjYXJkcy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5kZWJ1Zy5lbmFibGUgPSBmdW5jdGlvbihuYW1lKSB7XG4gIHRyeSB7XG4gICAgbG9jYWxTdG9yYWdlLmRlYnVnID0gbmFtZTtcbiAgfSBjYXRjaChlKXt9XG5cbiAgdmFyIHNwbGl0ID0gKG5hbWUgfHwgJycpLnNwbGl0KC9bXFxzLF0rLylcbiAgICAsIGxlbiA9IHNwbGl0Lmxlbmd0aDtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgbmFtZSA9IHNwbGl0W2ldLnJlcGxhY2UoJyonLCAnLio/Jyk7XG4gICAgaWYgKG5hbWVbMF0gPT09ICctJykge1xuICAgICAgZGVidWcuc2tpcHMucHVzaChuZXcgUmVnRXhwKCdeJyArIG5hbWUuc3Vic3RyKDEpICsgJyQnKSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgZGVidWcubmFtZXMucHVzaChuZXcgUmVnRXhwKCdeJyArIG5hbWUgKyAnJCcpKTtcbiAgICB9XG4gIH1cbn07XG5cbi8qKlxuICogRGlzYWJsZSBkZWJ1ZyBvdXRwdXQuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5kZWJ1Zy5kaXNhYmxlID0gZnVuY3Rpb24oKXtcbiAgZGVidWcuZW5hYmxlKCcnKTtcbn07XG5cbi8qKlxuICogSHVtYW5pemUgdGhlIGdpdmVuIGBtc2AuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IG1cbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmRlYnVnLmh1bWFuaXplID0gZnVuY3Rpb24obXMpIHtcbiAgdmFyIHNlYyA9IDEwMDBcbiAgICAsIG1pbiA9IDYwICogMTAwMFxuICAgICwgaG91ciA9IDYwICogbWluO1xuXG4gIGlmIChtcyA+PSBob3VyKSByZXR1cm4gKG1zIC8gaG91cikudG9GaXhlZCgxKSArICdoJztcbiAgaWYgKG1zID49IG1pbikgcmV0dXJuIChtcyAvIG1pbikudG9GaXhlZCgxKSArICdtJztcbiAgaWYgKG1zID49IHNlYykgcmV0dXJuIChtcyAvIHNlYyB8IDApICsgJ3MnO1xuICByZXR1cm4gbXMgKyAnbXMnO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIGdpdmVuIG1vZGUgbmFtZSBpcyBlbmFibGVkLCBmYWxzZSBvdGhlcndpc2UuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmRlYnVnLmVuYWJsZWQgPSBmdW5jdGlvbihuYW1lKSB7XG4gIGZvciAodmFyIGkgPSAwLCBsZW4gPSBkZWJ1Zy5za2lwcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIGlmIChkZWJ1Zy5za2lwc1tpXS50ZXN0KG5hbWUpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIGZvciAodmFyIGkgPSAwLCBsZW4gPSBkZWJ1Zy5uYW1lcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIGlmIChkZWJ1Zy5uYW1lc1tpXS50ZXN0KG5hbWUpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufTtcblxuLyoqXG4gKiBDb2VyY2UgYHZhbGAuXG4gKi9cblxuZnVuY3Rpb24gY29lcmNlKHZhbCkge1xuICBpZiAodmFsIGluc3RhbmNlb2YgRXJyb3IpIHJldHVybiB2YWwuc3RhY2sgfHwgdmFsLm1lc3NhZ2U7XG4gIHJldHVybiB2YWw7XG59XG5cbi8vIHBlcnNpc3RcblxudHJ5IHtcbiAgaWYgKHdpbmRvdy5sb2NhbFN0b3JhZ2UpIGRlYnVnLmVuYWJsZShsb2NhbFN0b3JhZ2UuZGVidWcpO1xufSBjYXRjaChlKXt9XG4iLCIvKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxudmFyIHR0eSA9IHJlcXVpcmUoJ3R0eScpO1xuXG4vKipcbiAqIEV4cG9zZSBgZGVidWcoKWAgYXMgdGhlIG1vZHVsZS5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRlYnVnO1xuXG4vKipcbiAqIEVuYWJsZWQgZGVidWdnZXJzLlxuICovXG5cbnZhciBuYW1lcyA9IFtdXG4gICwgc2tpcHMgPSBbXTtcblxuKHByb2Nlc3MuZW52LkRFQlVHIHx8ICcnKVxuICAuc3BsaXQoL1tcXHMsXSsvKVxuICAuZm9yRWFjaChmdW5jdGlvbihuYW1lKXtcbiAgICBuYW1lID0gbmFtZS5yZXBsYWNlKCcqJywgJy4qPycpO1xuICAgIGlmIChuYW1lWzBdID09PSAnLScpIHtcbiAgICAgIHNraXBzLnB1c2gobmV3IFJlZ0V4cCgnXicgKyBuYW1lLnN1YnN0cigxKSArICckJykpO1xuICAgIH0gZWxzZSB7XG4gICAgICBuYW1lcy5wdXNoKG5ldyBSZWdFeHAoJ14nICsgbmFtZSArICckJykpO1xuICAgIH1cbiAgfSk7XG5cbi8qKlxuICogQ29sb3JzLlxuICovXG5cbnZhciBjb2xvcnMgPSBbNiwgMiwgMywgNCwgNSwgMV07XG5cbi8qKlxuICogUHJldmlvdXMgZGVidWcoKSBjYWxsLlxuICovXG5cbnZhciBwcmV2ID0ge307XG5cbi8qKlxuICogUHJldmlvdXNseSBhc3NpZ25lZCBjb2xvci5cbiAqL1xuXG52YXIgcHJldkNvbG9yID0gMDtcblxuLyoqXG4gKiBJcyBzdGRvdXQgYSBUVFk/IENvbG9yZWQgb3V0cHV0IGlzIGRpc2FibGVkIHdoZW4gYHRydWVgLlxuICovXG5cbnZhciBpc2F0dHkgPSB0dHkuaXNhdHR5KDIpO1xuXG4vKipcbiAqIFNlbGVjdCBhIGNvbG9yLlxuICpcbiAqIEByZXR1cm4ge051bWJlcn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGNvbG9yKCkge1xuICByZXR1cm4gY29sb3JzW3ByZXZDb2xvcisrICUgY29sb3JzLmxlbmd0aF07XG59XG5cbi8qKlxuICogSHVtYW5pemUgdGhlIGdpdmVuIGBtc2AuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IG1cbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGh1bWFuaXplKG1zKSB7XG4gIHZhciBzZWMgPSAxMDAwXG4gICAgLCBtaW4gPSA2MCAqIDEwMDBcbiAgICAsIGhvdXIgPSA2MCAqIG1pbjtcblxuICBpZiAobXMgPj0gaG91cikgcmV0dXJuIChtcyAvIGhvdXIpLnRvRml4ZWQoMSkgKyAnaCc7XG4gIGlmIChtcyA+PSBtaW4pIHJldHVybiAobXMgLyBtaW4pLnRvRml4ZWQoMSkgKyAnbSc7XG4gIGlmIChtcyA+PSBzZWMpIHJldHVybiAobXMgLyBzZWMgfCAwKSArICdzJztcbiAgcmV0dXJuIG1zICsgJ21zJztcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSBkZWJ1Z2dlciB3aXRoIHRoZSBnaXZlbiBgbmFtZWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAqIEByZXR1cm4ge1R5cGV9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIGRlYnVnKG5hbWUpIHtcbiAgZnVuY3Rpb24gZGlzYWJsZWQoKXt9XG4gIGRpc2FibGVkLmVuYWJsZWQgPSBmYWxzZTtcblxuICB2YXIgbWF0Y2ggPSBza2lwcy5zb21lKGZ1bmN0aW9uKHJlKXtcbiAgICByZXR1cm4gcmUudGVzdChuYW1lKTtcbiAgfSk7XG5cbiAgaWYgKG1hdGNoKSByZXR1cm4gZGlzYWJsZWQ7XG5cbiAgbWF0Y2ggPSBuYW1lcy5zb21lKGZ1bmN0aW9uKHJlKXtcbiAgICByZXR1cm4gcmUudGVzdChuYW1lKTtcbiAgfSk7XG5cbiAgaWYgKCFtYXRjaCkgcmV0dXJuIGRpc2FibGVkO1xuICB2YXIgYyA9IGNvbG9yKCk7XG5cbiAgZnVuY3Rpb24gY29sb3JlZChmbXQpIHtcbiAgICBmbXQgPSBjb2VyY2UoZm10KTtcblxuICAgIHZhciBjdXJyID0gbmV3IERhdGU7XG4gICAgdmFyIG1zID0gY3VyciAtIChwcmV2W25hbWVdIHx8IGN1cnIpO1xuICAgIHByZXZbbmFtZV0gPSBjdXJyO1xuXG4gICAgZm10ID0gJyAgXFx1MDAxYls5JyArIGMgKyAnbScgKyBuYW1lICsgJyAnXG4gICAgICArICdcXHUwMDFiWzMnICsgYyArICdtXFx1MDAxYls5MG0nXG4gICAgICArIGZtdCArICdcXHUwMDFiWzMnICsgYyArICdtJ1xuICAgICAgKyAnICsnICsgaHVtYW5pemUobXMpICsgJ1xcdTAwMWJbMG0nO1xuXG4gICAgY29uc29sZS5lcnJvci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG5cbiAgZnVuY3Rpb24gcGxhaW4oZm10KSB7XG4gICAgZm10ID0gY29lcmNlKGZtdCk7XG5cbiAgICBmbXQgPSBuZXcgRGF0ZSgpLnRvVVRDU3RyaW5nKClcbiAgICAgICsgJyAnICsgbmFtZSArICcgJyArIGZtdDtcbiAgICBjb25zb2xlLmVycm9yLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cblxuICBjb2xvcmVkLmVuYWJsZWQgPSBwbGFpbi5lbmFibGVkID0gdHJ1ZTtcblxuICByZXR1cm4gaXNhdHR5IHx8IHByb2Nlc3MuZW52LkRFQlVHX0NPTE9SU1xuICAgID8gY29sb3JlZFxuICAgIDogcGxhaW47XG59XG5cbi8qKlxuICogQ29lcmNlIGB2YWxgLlxuICovXG5cbmZ1bmN0aW9uIGNvZXJjZSh2YWwpIHtcbiAgaWYgKHZhbCBpbnN0YW5jZW9mIEVycm9yKSByZXR1cm4gdmFsLnN0YWNrIHx8IHZhbC5tZXNzYWdlO1xuICByZXR1cm4gdmFsO1xufVxuIiwiLyoqXG4gKiBTdXBwb3J0IHZhbHVlc1xuICovXG5cbnZhciByZWxpYWJsZU1hcmdpblJpZ2h0O1xudmFyIGJveFNpemluZ1JlbGlhYmxlVmFsO1xudmFyIHBpeGVsUG9zaXRpb25WYWw7XG52YXIgY2xlYXJDbG9uZVN0eWxlO1xuXG4vKipcbiAqIENvbnRhaW5lciBzZXR1cFxuICovXG5cbnZhciBkb2NFbGVtID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xudmFyIGNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xudmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXG4vKipcbiAqIENsZWFyIGNsb25lIHN0eWxlXG4gKi9cblxuZGl2LnN0eWxlLmJhY2tncm91bmRDbGlwID0gJ2NvbnRlbnQtYm94JztcbmRpdi5jbG9uZU5vZGUodHJ1ZSkuc3R5bGUuYmFja2dyb3VuZENsaXAgPSAnJztcbmV4cG9ydHMuY2xlYXJDbG9uZVN0eWxlID0gZGl2LnN0eWxlLmJhY2tncm91bmRDbGlwID09PSAnY29udGVudC1ib3gnO1xuXG5jb250YWluZXIuc3R5bGUuY3NzVGV4dCA9ICdib3JkZXI6MDt3aWR0aDowO2hlaWdodDowO3Bvc2l0aW9uOmFic29sdXRlO3RvcDowO2xlZnQ6LTk5OTlweDttYXJnaW4tdG9wOjFweCc7XG5jb250YWluZXIuYXBwZW5kQ2hpbGQoZGl2KTtcblxuLyoqXG4gKiBQaXhlbCBwb3NpdGlvblxuICpcbiAqIFdlYmtpdCBidWc6IGh0dHBzOi8vYnVncy53ZWJraXQub3JnL3Nob3dfYnVnLmNnaT9pZD0yOTA4NFxuICogZ2V0Q29tcHV0ZWRTdHlsZSByZXR1cm5zIHBlcmNlbnQgd2hlbiBzcGVjaWZpZWQgZm9yIHRvcC9sZWZ0L2JvdHRvbS9yaWdodFxuICogcmF0aGVyIHRoYW4gbWFrZSB0aGUgY3NzIG1vZHVsZSBkZXBlbmQgb24gdGhlIG9mZnNldCBtb2R1bGUsIHdlIGp1c3QgY2hlY2sgZm9yIGl0IGhlcmVcbiAqL1xuXG5leHBvcnRzLnBpeGVsUG9zaXRpb24gPSBmdW5jdGlvbigpIHtcbiAgaWYgKHVuZGVmaW5lZCA9PSBwaXhlbFBvc2l0aW9uVmFsKSBjb21wdXRlUGl4ZWxQb3NpdGlvbkFuZEJveFNpemluZ1JlbGlhYmxlKCk7XG4gIHJldHVybiBwaXhlbFBvc2l0aW9uVmFsO1xufVxuXG4vKipcbiAqIFJlbGlhYmxlIGJveCBzaXppbmdcbiAqL1xuXG5leHBvcnRzLmJveFNpemluZ1JlbGlhYmxlID0gZnVuY3Rpb24oKSB7XG4gIGlmICh1bmRlZmluZWQgPT0gYm94U2l6aW5nUmVsaWFibGVWYWwpIGNvbXB1dGVQaXhlbFBvc2l0aW9uQW5kQm94U2l6aW5nUmVsaWFibGUoKTtcbiAgcmV0dXJuIGJveFNpemluZ1JlbGlhYmxlVmFsO1xufVxuXG4vKipcbiAqIFJlbGlhYmxlIG1hcmdpbiByaWdodFxuICpcbiAqIFN1cHBvcnQ6IEFuZHJvaWQgMi4zXG4gKiBDaGVjayBpZiBkaXYgd2l0aCBleHBsaWNpdCB3aWR0aCBhbmQgbm8gbWFyZ2luLXJpZ2h0IGluY29ycmVjdGx5XG4gKiBnZXRzIGNvbXB1dGVkIG1hcmdpbi1yaWdodCBiYXNlZCBvbiB3aWR0aCBvZiBjb250YWluZXIuICgjMzMzMylcbiAqIFdlYktpdCBCdWcgMTMzNDMgLSBnZXRDb21wdXRlZFN0eWxlIHJldHVybnMgd3JvbmcgdmFsdWUgZm9yIG1hcmdpbi1yaWdodFxuICogVGhpcyBzdXBwb3J0IGZ1bmN0aW9uIGlzIG9ubHkgZXhlY3V0ZWQgb25jZSBzbyBubyBtZW1vaXppbmcgaXMgbmVlZGVkLlxuICpcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cblxuZXhwb3J0cy5yZWxpYWJsZU1hcmdpblJpZ2h0ID0gZnVuY3Rpb24oKSB7XG4gIHZhciByZXQ7XG4gIHZhciBtYXJnaW5EaXYgPSBkaXYuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiICkpO1xuXG4gIG1hcmdpbkRpdi5zdHlsZS5jc3NUZXh0ID0gZGl2LnN0eWxlLmNzc1RleHQgPSBkaXZSZXNldDtcbiAgbWFyZ2luRGl2LnN0eWxlLm1hcmdpblJpZ2h0ID0gbWFyZ2luRGl2LnN0eWxlLndpZHRoID0gXCIwXCI7XG4gIGRpdi5zdHlsZS53aWR0aCA9IFwiMXB4XCI7XG4gIGRvY0VsZW0uYXBwZW5kQ2hpbGQoY29udGFpbmVyKTtcblxuICByZXQgPSAhcGFyc2VGbG9hdCh3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShtYXJnaW5EaXYsIG51bGwpLm1hcmdpblJpZ2h0KTtcblxuICBkb2NFbGVtLnJlbW92ZUNoaWxkKGNvbnRhaW5lcik7XG5cbiAgLy8gQ2xlYW4gdXAgdGhlIGRpdiBmb3Igb3RoZXIgc3VwcG9ydCB0ZXN0cy5cbiAgZGl2LmlubmVySFRNTCA9IFwiXCI7XG5cbiAgcmV0dXJuIHJldDtcbn1cblxuLyoqXG4gKiBFeGVjdXRpbmcgYm90aCBwaXhlbFBvc2l0aW9uICYgYm94U2l6aW5nUmVsaWFibGUgdGVzdHMgcmVxdWlyZSBvbmx5IG9uZSBsYXlvdXRcbiAqIHNvIHRoZXkncmUgZXhlY3V0ZWQgYXQgdGhlIHNhbWUgdGltZSB0byBzYXZlIHRoZSBzZWNvbmQgY29tcHV0YXRpb24uXG4gKi9cblxuZnVuY3Rpb24gY29tcHV0ZVBpeGVsUG9zaXRpb25BbmRCb3hTaXppbmdSZWxpYWJsZSgpIHtcbiAgLy8gU3VwcG9ydDogRmlyZWZveCwgQW5kcm9pZCAyLjMgKFByZWZpeGVkIGJveC1zaXppbmcgdmVyc2lvbnMpLlxuICBkaXYuc3R5bGUuY3NzVGV4dCA9IFwiLXdlYmtpdC1ib3gtc2l6aW5nOmJvcmRlci1ib3g7LW1vei1ib3gtc2l6aW5nOmJvcmRlci1ib3g7XCIgK1xuICAgIFwiYm94LXNpemluZzpib3JkZXItYm94O3BhZGRpbmc6MXB4O2JvcmRlcjoxcHg7ZGlzcGxheTpibG9jazt3aWR0aDo0cHg7bWFyZ2luLXRvcDoxJTtcIiArXG4gICAgXCJwb3NpdGlvbjphYnNvbHV0ZTt0b3A6MSVcIjtcbiAgZG9jRWxlbS5hcHBlbmRDaGlsZChjb250YWluZXIpO1xuXG4gIHZhciBkaXZTdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGRpdiwgbnVsbCk7XG4gIHBpeGVsUG9zaXRpb25WYWwgPSBkaXZTdHlsZS50b3AgIT09IFwiMSVcIjtcbiAgYm94U2l6aW5nUmVsaWFibGVWYWwgPSBkaXZTdHlsZS53aWR0aCA9PT0gXCI0cHhcIjtcblxuICBkb2NFbGVtLnJlbW92ZUNoaWxkKGNvbnRhaW5lcik7XG59XG5cblxuIiwiLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzXG4gKi9cblxudmFyIGRlYnVnID0gcmVxdWlyZSgnZGVidWcnKSgnY3NzOnByb3AnKTtcbnZhciBjYW1lbGNhc2UgPSByZXF1aXJlKCd0by1jYW1lbC1jYXNlJyk7XG52YXIgdmVuZG9yID0gcmVxdWlyZSgnLi92ZW5kb3InKTtcblxuLyoqXG4gKiBFeHBvcnQgYHByb3BgXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBwcm9wO1xuXG4vKipcbiAqIE5vcm1hbGl6ZSBQcm9wZXJ0aWVzXG4gKi9cblxudmFyIGNzc1Byb3BzID0ge1xuICAnZmxvYXQnOiAnY3NzRmxvYXQnXG59O1xuXG4vKipcbiAqIEdldCB0aGUgdmVuZG9yIHByZWZpeGVkIHByb3BlcnR5XG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHByb3BcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHlsZVxuICogQHJldHVybiB7U3RyaW5nfSBwcm9wXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBwcm9wKHByb3AsIHN0eWxlKSB7XG4gIHByb3AgPSBjc3NQcm9wc1twcm9wXSB8fCAoY3NzUHJvcHNbcHJvcF0gPSB2ZW5kb3IocHJvcCwgc3R5bGUpKTtcbiAgZGVidWcoJ3RyYW5zZm9ybSBwcm9wZXJ0eTogJXMgPT4gJXMnKTtcbiAgcmV0dXJuIHByb3A7XG59XG4iLCIvKipcbiAqIE1vZHVsZSBEZXBlbmRlbmNpZXNcbiAqL1xuXG52YXIgY3NzID0gcmVxdWlyZSgnLi9jc3MnKTtcbnZhciBjc3NTaG93ID0geyBwb3NpdGlvbjogJ2Fic29sdXRlJywgdmlzaWJpbGl0eTogJ2hpZGRlbicsIGRpc3BsYXk6ICdibG9jaycgfTtcbnZhciBwbnVtID0gKC9bKy1dPyg/OlxcZCpcXC58KVxcZCsoPzpbZUVdWystXT9cXGQrfCkvKS5zb3VyY2U7XG52YXIgcm51bW5vbnB4ID0gbmV3IFJlZ0V4cCggJ14oJyArIHBudW0gKyAnKSg/IXB4KVthLXolXSskJywgJ2knKTtcbnZhciBybnVtc3BsaXQgPSBuZXcgUmVnRXhwKCAnXignICsgcG51bSArICcpKC4qKSQnLCAnaScpO1xudmFyIHJkaXNwbGF5c3dhcCA9IC9eKG5vbmV8dGFibGUoPyEtY1tlYV0pLispLztcbnZhciBzdHlsZXMgPSByZXF1aXJlKCcuL3N0eWxlcycpO1xudmFyIHN1cHBvcnQgPSByZXF1aXJlKCcuL3N1cHBvcnQnKTtcbnZhciBzd2FwID0gcmVxdWlyZSgnLi9zd2FwJyk7XG52YXIgY29tcHV0ZWQgPSByZXF1aXJlKCcuL2NvbXB1dGVkJyk7XG52YXIgY3NzRXhwYW5kID0gWyBcIlRvcFwiLCBcIlJpZ2h0XCIsIFwiQm90dG9tXCIsIFwiTGVmdFwiIF07XG5cbi8qKlxuICogSGVpZ2h0ICYgV2lkdGhcbiAqL1xuXG5bJ3dpZHRoJywgJ2hlaWdodCddLmZvckVhY2goZnVuY3Rpb24obmFtZSkge1xuICBleHBvcnRzW25hbWVdID0ge307XG5cbiAgZXhwb3J0c1tuYW1lXS5nZXQgPSBmdW5jdGlvbihlbCwgY29tcHV0ZSwgZXh0cmEpIHtcbiAgICBpZiAoIWNvbXB1dGUpIHJldHVybjtcbiAgICAvLyBjZXJ0YWluIGVsZW1lbnRzIGNhbiBoYXZlIGRpbWVuc2lvbiBpbmZvIGlmIHdlIGludmlzaWJseSBzaG93IHRoZW1cbiAgICAvLyBob3dldmVyLCBpdCBtdXN0IGhhdmUgYSBjdXJyZW50IGRpc3BsYXkgc3R5bGUgdGhhdCB3b3VsZCBiZW5lZml0IGZyb20gdGhpc1xuICAgIHJldHVybiAwID09IGVsLm9mZnNldFdpZHRoICYmIHJkaXNwbGF5c3dhcC50ZXN0KGNzcyhlbCwgJ2Rpc3BsYXknKSlcbiAgICAgID8gc3dhcChlbCwgY3NzU2hvdywgZnVuY3Rpb24oKSB7IHJldHVybiBnZXRXaWR0aE9ySGVpZ2h0KGVsLCBuYW1lLCBleHRyYSk7IH0pXG4gICAgICA6IGdldFdpZHRoT3JIZWlnaHQoZWwsIG5hbWUsIGV4dHJhKTtcbiAgfVxuXG4gIGV4cG9ydHNbbmFtZV0uc2V0ID0gZnVuY3Rpb24oZWwsIHZhbCwgZXh0cmEpIHtcbiAgICB2YXIgc3R5bGVzID0gZXh0cmEgJiYgc3R5bGVzKGVsKTtcbiAgICByZXR1cm4gc2V0UG9zaXRpdmVOdW1iZXIoZWwsIHZhbCwgZXh0cmFcbiAgICAgID8gYXVnbWVudFdpZHRoT3JIZWlnaHQoZWwsIG5hbWUsIGV4dHJhLCAnYm9yZGVyLWJveCcgPT0gY3NzKGVsLCAnYm94U2l6aW5nJywgZmFsc2UsIHN0eWxlcyksIHN0eWxlcylcbiAgICAgIDogMFxuICAgICk7XG4gIH07XG5cbn0pO1xuXG4vKipcbiAqIE9wYWNpdHlcbiAqL1xuXG5leHBvcnRzLm9wYWNpdHkgPSB7fTtcbmV4cG9ydHMub3BhY2l0eS5nZXQgPSBmdW5jdGlvbihlbCwgY29tcHV0ZSkge1xuICBpZiAoIWNvbXB1dGUpIHJldHVybjtcbiAgdmFyIHJldCA9IGNvbXB1dGVkKGVsLCAnb3BhY2l0eScpO1xuICByZXR1cm4gJycgPT0gcmV0ID8gJzEnIDogcmV0O1xufVxuXG4vKipcbiAqIFV0aWxpdHk6IFNldCBQb3NpdGl2ZSBOdW1iZXJcbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gKiBAcGFyYW0ge01peGVkfSB2YWxcbiAqIEBwYXJhbSB7TnVtYmVyfSBzdWJ0cmFjdFxuICogQHJldHVybiB7TnVtYmVyfVxuICovXG5cbmZ1bmN0aW9uIHNldFBvc2l0aXZlTnVtYmVyKGVsLCB2YWwsIHN1YnRyYWN0KSB7XG4gIHZhciBtYXRjaGVzID0gcm51bXNwbGl0LmV4ZWModmFsKTtcbiAgcmV0dXJuIG1hdGNoZXMgP1xuICAgIC8vIEd1YXJkIGFnYWluc3QgdW5kZWZpbmVkICdzdWJ0cmFjdCcsIGUuZy4sIHdoZW4gdXNlZCBhcyBpbiBjc3NIb29rc1xuICAgIE1hdGgubWF4KDAsIG1hdGNoZXNbMV0pICsgKG1hdGNoZXNbMl0gfHwgJ3B4JykgOlxuICAgIHZhbDtcbn1cblxuLyoqXG4gKiBVdGlsaXR5OiBHZXQgdGhlIHdpZHRoIG9yIGhlaWdodFxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7U3RyaW5nfSBwcm9wXG4gKiBAcGFyYW0ge01peGVkfSBleHRyYVxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5cbmZ1bmN0aW9uIGdldFdpZHRoT3JIZWlnaHQoZWwsIHByb3AsIGV4dHJhKSB7XG4gIC8vIFN0YXJ0IHdpdGggb2Zmc2V0IHByb3BlcnR5LCB3aGljaCBpcyBlcXVpdmFsZW50IHRvIHRoZSBib3JkZXItYm94IHZhbHVlXG4gIHZhciB2YWx1ZUlzQm9yZGVyQm94ID0gdHJ1ZTtcbiAgdmFyIHZhbCA9IHByb3AgPT09ICd3aWR0aCcgPyBlbC5vZmZzZXRXaWR0aCA6IGVsLm9mZnNldEhlaWdodDtcbiAgdmFyIHN0eWxlcyA9IGNvbXB1dGVkKGVsKTtcbiAgdmFyIGlzQm9yZGVyQm94ID0gc3VwcG9ydC5ib3hTaXppbmcgJiYgY3NzKGVsLCAnYm94U2l6aW5nJykgPT09ICdib3JkZXItYm94JztcblxuICAvLyBzb21lIG5vbi1odG1sIGVsZW1lbnRzIHJldHVybiB1bmRlZmluZWQgZm9yIG9mZnNldFdpZHRoLCBzbyBjaGVjayBmb3IgbnVsbC91bmRlZmluZWRcbiAgLy8gc3ZnIC0gaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9NjQ5Mjg1XG4gIC8vIE1hdGhNTCAtIGh0dHBzOi8vYnVnemlsbGEubW96aWxsYS5vcmcvc2hvd19idWcuY2dpP2lkPTQ5MTY2OFxuICBpZiAodmFsIDw9IDAgfHwgdmFsID09IG51bGwpIHtcbiAgICAvLyBGYWxsIGJhY2sgdG8gY29tcHV0ZWQgdGhlbiB1bmNvbXB1dGVkIGNzcyBpZiBuZWNlc3NhcnlcbiAgICB2YWwgPSBjb21wdXRlZChlbCwgcHJvcCwgc3R5bGVzKTtcblxuICAgIGlmICh2YWwgPCAwIHx8IHZhbCA9PSBudWxsKSB7XG4gICAgICB2YWwgPSBlbC5zdHlsZVtwcm9wXTtcbiAgICB9XG5cbiAgICAvLyBDb21wdXRlZCB1bml0IGlzIG5vdCBwaXhlbHMuIFN0b3AgaGVyZSBhbmQgcmV0dXJuLlxuICAgIGlmIChybnVtbm9ucHgudGVzdCh2YWwpKSB7XG4gICAgICByZXR1cm4gdmFsO1xuICAgIH1cblxuICAgIC8vIHdlIG5lZWQgdGhlIGNoZWNrIGZvciBzdHlsZSBpbiBjYXNlIGEgYnJvd3NlciB3aGljaCByZXR1cm5zIHVucmVsaWFibGUgdmFsdWVzXG4gICAgLy8gZm9yIGdldENvbXB1dGVkU3R5bGUgc2lsZW50bHkgZmFsbHMgYmFjayB0byB0aGUgcmVsaWFibGUgZWwuc3R5bGVcbiAgICB2YWx1ZUlzQm9yZGVyQm94ID0gaXNCb3JkZXJCb3ggJiYgKHN1cHBvcnQuYm94U2l6aW5nUmVsaWFibGUoKSB8fCB2YWwgPT09IGVsLnN0eWxlW3Byb3BdKTtcblxuICAgIC8vIE5vcm1hbGl6ZSAnLCBhdXRvLCBhbmQgcHJlcGFyZSBmb3IgZXh0cmFcbiAgICB2YWwgPSBwYXJzZUZsb2F0KHZhbCkgfHwgMDtcbiAgfVxuXG4gIC8vIHVzZSB0aGUgYWN0aXZlIGJveC1zaXppbmcgbW9kZWwgdG8gYWRkL3N1YnRyYWN0IGlycmVsZXZhbnQgc3R5bGVzXG4gIGV4dHJhID0gZXh0cmEgfHwgKGlzQm9yZGVyQm94ID8gJ2JvcmRlcicgOiAnY29udGVudCcpO1xuICB2YWwgKz0gYXVnbWVudFdpZHRoT3JIZWlnaHQoZWwsIHByb3AsIGV4dHJhLCB2YWx1ZUlzQm9yZGVyQm94LCBzdHlsZXMpO1xuICByZXR1cm4gdmFsICsgJ3B4Jztcbn1cblxuLyoqXG4gKiBVdGlsaXR5OiBBdWdtZW50IHRoZSB3aWR0aCBvciB0aGUgaGVpZ2h0XG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbFxuICogQHBhcmFtIHtTdHJpbmd9IHByb3BcbiAqIEBwYXJhbSB7TWl4ZWR9IGV4dHJhXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGlzQm9yZGVyQm94XG4gKiBAcGFyYW0ge0FycmF5fSBzdHlsZXNcbiAqL1xuXG5mdW5jdGlvbiBhdWdtZW50V2lkdGhPckhlaWdodChlbCwgcHJvcCwgZXh0cmEsIGlzQm9yZGVyQm94LCBzdHlsZXMpIHtcbiAgLy8gSWYgd2UgYWxyZWFkeSBoYXZlIHRoZSByaWdodCBtZWFzdXJlbWVudCwgYXZvaWQgYXVnbWVudGF0aW9uLFxuICAvLyBPdGhlcndpc2UgaW5pdGlhbGl6ZSBmb3IgaG9yaXpvbnRhbCBvciB2ZXJ0aWNhbCBwcm9wZXJ0aWVzXG4gIHZhciBpID0gZXh0cmEgPT09IChpc0JvcmRlckJveCA/ICdib3JkZXInIDogJ2NvbnRlbnQnKSA/IDQgOiAnd2lkdGgnID09IHByb3AgPyAxIDogMDtcbiAgdmFyIHZhbCA9IDA7XG5cbiAgZm9yICg7IGkgPCA0OyBpICs9IDIpIHtcbiAgICAvLyBib3RoIGJveCBtb2RlbHMgZXhjbHVkZSBtYXJnaW4sIHNvIGFkZCBpdCBpZiB3ZSB3YW50IGl0XG4gICAgaWYgKGV4dHJhID09PSAnbWFyZ2luJykge1xuICAgICAgdmFsICs9IGNzcyhlbCwgZXh0cmEgKyBjc3NFeHBhbmRbaV0sIHRydWUsIHN0eWxlcyk7XG4gICAgfVxuXG4gICAgaWYgKGlzQm9yZGVyQm94KSB7XG4gICAgICAvLyBib3JkZXItYm94IGluY2x1ZGVzIHBhZGRpbmcsIHNvIHJlbW92ZSBpdCBpZiB3ZSB3YW50IGNvbnRlbnRcbiAgICAgIGlmIChleHRyYSA9PT0gJ2NvbnRlbnQnKSB7XG4gICAgICAgIHZhbCAtPSBjc3MoZWwsICdwYWRkaW5nJyArIGNzc0V4cGFuZFtpXSwgdHJ1ZSwgc3R5bGVzKTtcbiAgICAgIH1cblxuICAgICAgLy8gYXQgdGhpcyBwb2ludCwgZXh0cmEgaXNuJ3QgYm9yZGVyIG5vciBtYXJnaW4sIHNvIHJlbW92ZSBib3JkZXJcbiAgICAgIGlmIChleHRyYSAhPT0gJ21hcmdpbicpIHtcbiAgICAgICAgdmFsIC09IGNzcyhlbCwgJ2JvcmRlcicgKyBjc3NFeHBhbmRbaV0gKyAnV2lkdGgnLCB0cnVlLCBzdHlsZXMpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBhdCB0aGlzIHBvaW50LCBleHRyYSBpc24ndCBjb250ZW50LCBzbyBhZGQgcGFkZGluZ1xuICAgICAgdmFsICs9IGNzcyhlbCwgJ3BhZGRpbmcnICsgY3NzRXhwYW5kW2ldLCB0cnVlLCBzdHlsZXMpO1xuXG4gICAgICAvLyBhdCB0aGlzIHBvaW50LCBleHRyYSBpc24ndCBjb250ZW50IG5vciBwYWRkaW5nLCBzbyBhZGQgYm9yZGVyXG4gICAgICBpZiAoZXh0cmEgIT09ICdwYWRkaW5nJykge1xuICAgICAgICB2YWwgKz0gY3NzKGVsLCAnYm9yZGVyJyArIGNzc0V4cGFuZFtpXSArICdXaWR0aCcsIHRydWUsIHN0eWxlcyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHZhbDtcbn1cbiIsIi8qKlxuICogTW9kdWxlIERlcGVuZGVuY2llc1xuICovXG5cbnZhciBkZWJ1ZyA9IHJlcXVpcmUoJ2RlYnVnJykoJ2Nzczpjb21wdXRlZCcpO1xudmFyIHdpdGhpbkRvY3VtZW50ID0gcmVxdWlyZSgnd2l0aGluLWRvY3VtZW50Jyk7XG52YXIgc3R5bGVzID0gcmVxdWlyZSgnLi9zdHlsZXMnKTtcblxuLyoqXG4gKiBFeHBvc2UgYGNvbXB1dGVkYFxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gY29tcHV0ZWQ7XG5cbi8qKlxuICogR2V0IHRoZSBjb21wdXRlZCBzdHlsZVxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7U3RyaW5nfSBwcm9wXG4gKiBAcGFyYW0ge0FycmF5fSBwcmVjb21wdXRlZCAob3B0aW9uYWwpXG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGNvbXB1dGVkKGVsLCBwcm9wLCBwcmVjb21wdXRlZCkge1xuICBjb21wdXRlZCA9IHByZWNvbXB1dGVkIHx8IHN0eWxlcyhlbCk7XG4gIGlmICghY29tcHV0ZWQpIHJldHVybjtcblxuICB2YXIgcmV0ID0gY29tcHV0ZWQuZ2V0UHJvcGVydHlWYWx1ZShwcm9wKSB8fCBjb21wdXRlZFtwcm9wXTtcblxuICBpZiAoJycgPT09IHJldCAmJiAhd2l0aGluRG9jdW1lbnQoZWwpKSB7XG4gICAgZGVidWcoJ2VsZW1lbnQgbm90IHdpdGhpbiBkb2N1bWVudCwgdHJ5IGZpbmRpbmcgZnJvbSBzdHlsZSBhdHRyaWJ1dGUnKTtcbiAgICB2YXIgc3R5bGUgPSByZXF1aXJlKCcuL3N0eWxlJyk7XG4gICAgcmV0ID0gc3R5bGUoZWwsIHByb3ApO1xuICB9XG5cbiAgZGVidWcoJ2NvbXB1dGVkIHZhbHVlIG9mICVzOiAlcycsIHByb3AsIHJldCk7XG5cbiAgLy8gU3VwcG9ydDogSUVcbiAgLy8gSUUgcmV0dXJucyB6SW5kZXggdmFsdWUgYXMgYW4gaW50ZWdlci5cbiAgcmV0dXJuIHVuZGVmaW5lZCA9PT0gcmV0ID8gcmV0IDogcmV0ICsgJyc7XG59XG4iLCJcbnZhciB0b1NwYWNlID0gcmVxdWlyZSgndG8tc3BhY2UtY2FzZScpO1xuXG5cbi8qKlxuICogRXhwb3NlIGB0b0NhbWVsQ2FzZWAuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSB0b0NhbWVsQ2FzZTtcblxuXG4vKipcbiAqIENvbnZlcnQgYSBgc3RyaW5nYCB0byBjYW1lbCBjYXNlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJpbmdcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuXG5cbmZ1bmN0aW9uIHRvQ2FtZWxDYXNlIChzdHJpbmcpIHtcbiAgcmV0dXJuIHRvU3BhY2Uoc3RyaW5nKS5yZXBsYWNlKC9cXHMoXFx3KS9nLCBmdW5jdGlvbiAobWF0Y2hlcywgbGV0dGVyKSB7XG4gICAgcmV0dXJuIGxldHRlci50b1VwcGVyQ2FzZSgpO1xuICB9KTtcbn0iLCJcbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGFsaWNlYmx1ZTogWzI0MCwgMjQ4LCAyNTVdXG4gICwgYW50aXF1ZXdoaXRlOiBbMjUwLCAyMzUsIDIxNV1cbiAgLCBhcXVhOiBbMCwgMjU1LCAyNTVdXG4gICwgYXF1YW1hcmluZTogWzEyNywgMjU1LCAyMTJdXG4gICwgYXp1cmU6IFsyNDAsIDI1NSwgMjU1XVxuICAsIGJlaWdlOiBbMjQ1LCAyNDUsIDIyMF1cbiAgLCBiaXNxdWU6IFsyNTUsIDIyOCwgMTk2XVxuICAsIGJsYWNrOiBbMCwgMCwgMF1cbiAgLCBibGFuY2hlZGFsbW9uZDogWzI1NSwgMjM1LCAyMDVdXG4gICwgYmx1ZTogWzAsIDAsIDI1NV1cbiAgLCBibHVldmlvbGV0OiBbMTM4LCA0MywgMjI2XVxuICAsIGJyb3duOiBbMTY1LCA0MiwgNDJdXG4gICwgYnVybHl3b29kOiBbMjIyLCAxODQsIDEzNV1cbiAgLCBjYWRldGJsdWU6IFs5NSwgMTU4LCAxNjBdXG4gICwgY2hhcnRyZXVzZTogWzEyNywgMjU1LCAwXVxuICAsIGNob2NvbGF0ZTogWzIxMCwgMTA1LCAzMF1cbiAgLCBjb3JhbDogWzI1NSwgMTI3LCA4MF1cbiAgLCBjb3JuZmxvd2VyYmx1ZTogWzEwMCwgMTQ5LCAyMzddXG4gICwgY29ybnNpbGs6IFsyNTUsIDI0OCwgMjIwXVxuICAsIGNyaW1zb246IFsyMjAsIDIwLCA2MF1cbiAgLCBjeWFuOiBbMCwgMjU1LCAyNTVdXG4gICwgZGFya2JsdWU6IFswLCAwLCAxMzldXG4gICwgZGFya2N5YW46IFswLCAxMzksIDEzOV1cbiAgLCBkYXJrZ29sZGVucm9kOiBbMTg0LCAxMzIsIDExXVxuICAsIGRhcmtncmF5OiBbMTY5LCAxNjksIDE2OV1cbiAgLCBkYXJrZ3JlZW46IFswLCAxMDAsIDBdXG4gICwgZGFya2dyZXk6IFsxNjksIDE2OSwgMTY5XVxuICAsIGRhcmtraGFraTogWzE4OSwgMTgzLCAxMDddXG4gICwgZGFya21hZ2VudGE6IFsxMzksIDAsIDEzOV1cbiAgLCBkYXJrb2xpdmVncmVlbjogWzg1LCAxMDcsIDQ3XVxuICAsIGRhcmtvcmFuZ2U6IFsyNTUsIDE0MCwgMF1cbiAgLCBkYXJrb3JjaGlkOiBbMTUzLCA1MCwgMjA0XVxuICAsIGRhcmtyZWQ6IFsxMzksIDAsIDBdXG4gICwgZGFya3NhbG1vbjogWzIzMywgMTUwLCAxMjJdXG4gICwgZGFya3NlYWdyZWVuOiBbMTQzLCAxODgsIDE0M11cbiAgLCBkYXJrc2xhdGVibHVlOiBbNzIsIDYxLCAxMzldXG4gICwgZGFya3NsYXRlZ3JheTogWzQ3LCA3OSwgNzldXG4gICwgZGFya3NsYXRlZ3JleTogWzQ3LCA3OSwgNzldXG4gICwgZGFya3R1cnF1b2lzZTogWzAsIDIwNiwgMjA5XVxuICAsIGRhcmt2aW9sZXQ6IFsxNDgsIDAsIDIxMV1cbiAgLCBkZWVwcGluazogWzI1NSwgMjAsIDE0N11cbiAgLCBkZWVwc2t5Ymx1ZTogWzAsIDE5MSwgMjU1XVxuICAsIGRpbWdyYXk6IFsxMDUsIDEwNSwgMTA1XVxuICAsIGRpbWdyZXk6IFsxMDUsIDEwNSwgMTA1XVxuICAsIGRvZGdlcmJsdWU6IFszMCwgMTQ0LCAyNTVdXG4gICwgZmlyZWJyaWNrOiBbMTc4LCAzNCwgMzRdXG4gICwgZmxvcmFsd2hpdGU6IFsyNTUsIDI1NSwgMjQwXVxuICAsIGZvcmVzdGdyZWVuOiBbMzQsIDEzOSwgMzRdXG4gICwgZnVjaHNpYTogWzI1NSwgMCwgMjU1XVxuICAsIGdhaW5zYm9ybzogWzIyMCwgMjIwLCAyMjBdXG4gICwgZ2hvc3R3aGl0ZTogWzI0OCwgMjQ4LCAyNTVdXG4gICwgZ29sZDogWzI1NSwgMjE1LCAwXVxuICAsIGdvbGRlbnJvZDogWzIxOCwgMTY1LCAzMl1cbiAgLCBncmF5OiBbMTI4LCAxMjgsIDEyOF1cbiAgLCBncmVlbjogWzAsIDEyOCwgMF1cbiAgLCBncmVlbnllbGxvdzogWzE3MywgMjU1LCA0N11cbiAgLCBncmV5OiBbMTI4LCAxMjgsIDEyOF1cbiAgLCBob25leWRldzogWzI0MCwgMjU1LCAyNDBdXG4gICwgaG90cGluazogWzI1NSwgMTA1LCAxODBdXG4gICwgaW5kaWFucmVkOiBbMjA1LCA5MiwgOTJdXG4gICwgaW5kaWdvOiBbNzUsIDAsIDEzMF1cbiAgLCBpdm9yeTogWzI1NSwgMjU1LCAyNDBdXG4gICwga2hha2k6IFsyNDAsIDIzMCwgMTQwXVxuICAsIGxhdmVuZGVyOiBbMjMwLCAyMzAsIDI1MF1cbiAgLCBsYXZlbmRlcmJsdXNoOiBbMjU1LCAyNDAsIDI0NV1cbiAgLCBsYXduZ3JlZW46IFsxMjQsIDI1MiwgMF1cbiAgLCBsZW1vbmNoaWZmb246IFsyNTUsIDI1MCwgMjA1XVxuICAsIGxpZ2h0Ymx1ZTogWzE3MywgMjE2LCAyMzBdXG4gICwgbGlnaHRjb3JhbDogWzI0MCwgMTI4LCAxMjhdXG4gICwgbGlnaHRjeWFuOiBbMjI0LCAyNTUsIDI1NV1cbiAgLCBsaWdodGdvbGRlbnJvZHllbGxvdzogWzI1MCwgMjUwLCAyMTBdXG4gICwgbGlnaHRncmF5OiBbMjExLCAyMTEsIDIxMV1cbiAgLCBsaWdodGdyZWVuOiBbMTQ0LCAyMzgsIDE0NF1cbiAgLCBsaWdodGdyZXk6IFsyMTEsIDIxMSwgMjExXVxuICAsIGxpZ2h0cGluazogWzI1NSwgMTgyLCAxOTNdXG4gICwgbGlnaHRzYWxtb246IFsyNTUsIDE2MCwgMTIyXVxuICAsIGxpZ2h0c2VhZ3JlZW46IFszMiwgMTc4LCAxNzBdXG4gICwgbGlnaHRza3libHVlOiBbMTM1LCAyMDYsIDI1MF1cbiAgLCBsaWdodHNsYXRlZ3JheTogWzExOSwgMTM2LCAxNTNdXG4gICwgbGlnaHRzbGF0ZWdyZXk6IFsxMTksIDEzNiwgMTUzXVxuICAsIGxpZ2h0c3RlZWxibHVlOiBbMTc2LCAxOTYsIDIyMl1cbiAgLCBsaWdodHllbGxvdzogWzI1NSwgMjU1LCAyMjRdXG4gICwgbGltZTogWzAsIDI1NSwgMF1cbiAgLCBsaW1lZ3JlZW46IFs1MCwgMjA1LCA1MF1cbiAgLCBsaW5lbjogWzI1MCwgMjQwLCAyMzBdXG4gICwgbWFnZW50YTogWzI1NSwgMCwgMjU1XVxuICAsIG1hcm9vbjogWzEyOCwgMCwgMF1cbiAgLCBtZWRpdW1hcXVhbWFyaW5lOiBbMTAyLCAyMDUsIDE3MF1cbiAgLCBtZWRpdW1ibHVlOiBbMCwgMCwgMjA1XVxuICAsIG1lZGl1bW9yY2hpZDogWzE4NiwgODUsIDIxMV1cbiAgLCBtZWRpdW1wdXJwbGU6IFsxNDcsIDExMiwgMjE5XVxuICAsIG1lZGl1bXNlYWdyZWVuOiBbNjAsIDE3OSwgMTEzXVxuICAsIG1lZGl1bXNsYXRlYmx1ZTogWzEyMywgMTA0LCAyMzhdXG4gICwgbWVkaXVtc3ByaW5nZ3JlZW46IFswLCAyNTAsIDE1NF1cbiAgLCBtZWRpdW10dXJxdW9pc2U6IFs3MiwgMjA5LCAyMDRdXG4gICwgbWVkaXVtdmlvbGV0cmVkOiBbMTk5LCAyMSwgMTMzXVxuICAsIG1pZG5pZ2h0Ymx1ZTogWzI1LCAyNSwgMTEyXVxuICAsIG1pbnRjcmVhbTogWzI0NSwgMjU1LCAyNTBdXG4gICwgbWlzdHlyb3NlOiBbMjU1LCAyMjgsIDIyNV1cbiAgLCBtb2NjYXNpbjogWzI1NSwgMjI4LCAxODFdXG4gICwgbmF2YWpvd2hpdGU6IFsyNTUsIDIyMiwgMTczXVxuICAsIG5hdnk6IFswLCAwLCAxMjhdXG4gICwgb2xkbGFjZTogWzI1MywgMjQ1LCAyMzBdXG4gICwgb2xpdmU6IFsxMjgsIDEyOCwgMF1cbiAgLCBvbGl2ZWRyYWI6IFsxMDcsIDE0MiwgMzVdXG4gICwgb3JhbmdlOiBbMjU1LCAxNjUsIDBdXG4gICwgb3JhbmdlcmVkOiBbMjU1LCA2OSwgMF1cbiAgLCBvcmNoaWQ6IFsyMTgsIDExMiwgMjE0XVxuICAsIHBhbGVnb2xkZW5yb2Q6IFsyMzgsIDIzMiwgMTcwXVxuICAsIHBhbGVncmVlbjogWzE1MiwgMjUxLCAxNTJdXG4gICwgcGFsZXR1cnF1b2lzZTogWzE3NSwgMjM4LCAyMzhdXG4gICwgcGFsZXZpb2xldHJlZDogWzIxOSwgMTEyLCAxNDddXG4gICwgcGFwYXlhd2hpcDogWzI1NSwgMjM5LCAyMTNdXG4gICwgcGVhY2hwdWZmOiBbMjU1LCAyMTgsIDE4NV1cbiAgLCBwZXJ1OiBbMjA1LCAxMzMsIDYzXVxuICAsIHBpbms6IFsyNTUsIDE5MiwgMjAzXVxuICAsIHBsdW06IFsyMjEsIDE2MCwgMjAzXVxuICAsIHBvd2RlcmJsdWU6IFsxNzYsIDIyNCwgMjMwXVxuICAsIHB1cnBsZTogWzEyOCwgMCwgMTI4XVxuICAsIHJlZDogWzI1NSwgMCwgMF1cbiAgLCByb3N5YnJvd246IFsxODgsIDE0MywgMTQzXVxuICAsIHJveWFsYmx1ZTogWzY1LCAxMDUsIDIyNV1cbiAgLCBzYWRkbGVicm93bjogWzEzOSwgNjksIDE5XVxuICAsIHNhbG1vbjogWzI1MCwgMTI4LCAxMTRdXG4gICwgc2FuZHlicm93bjogWzI0NCwgMTY0LCA5Nl1cbiAgLCBzZWFncmVlbjogWzQ2LCAxMzksIDg3XVxuICAsIHNlYXNoZWxsOiBbMjU1LCAyNDUsIDIzOF1cbiAgLCBzaWVubmE6IFsxNjAsIDgyLCA0NV1cbiAgLCBzaWx2ZXI6IFsxOTIsIDE5MiwgMTkyXVxuICAsIHNreWJsdWU6IFsxMzUsIDIwNiwgMjM1XVxuICAsIHNsYXRlYmx1ZTogWzEwNiwgOTAsIDIwNV1cbiAgLCBzbGF0ZWdyYXk6IFsxMTksIDEyOCwgMTQ0XVxuICAsIHNsYXRlZ3JleTogWzExOSwgMTI4LCAxNDRdXG4gICwgc25vdzogWzI1NSwgMjU1LCAyNTBdXG4gICwgc3ByaW5nZ3JlZW46IFswLCAyNTUsIDEyN11cbiAgLCBzdGVlbGJsdWU6IFs3MCwgMTMwLCAxODBdXG4gICwgdGFuOiBbMjEwLCAxODAsIDE0MF1cbiAgLCB0ZWFsOiBbMCwgMTI4LCAxMjhdXG4gICwgdGhpc3RsZTogWzIxNiwgMTkxLCAyMTZdXG4gICwgdG9tYXRvOiBbMjU1LCA5OSwgNzFdXG4gICwgdHVycXVvaXNlOiBbNjQsIDIyNCwgMjA4XVxuICAsIHZpb2xldDogWzIzOCwgMTMwLCAyMzhdXG4gICwgd2hlYXQ6IFsyNDUsIDIyMiwgMTc5XVxuICAsIHdoaXRlOiBbMjU1LCAyNTUsIDI1NV1cbiAgLCB3aGl0ZXNtb2tlOiBbMjQ1LCAyNDUsIDI0NV1cbiAgLCB5ZWxsb3c6IFsyNTUsIDI1NSwgMF1cbiAgLCB5ZWxsb3dncmVlbjogWzE1NCwgMjA1LCA1XVxufTsiLCJcbi8qKlxuICogbnVtYmVyIHBhdHRlcm5cbiAqIEB0eXBlIHtSZWdFeHB9XG4gKi9cblxudmFyIG51bWJlciA9IC9bLStdPyg/OlxcZCtcXC4/XFxkKnxcXC4/XFxkKykoPzpbZUVdWy0rXT9cXGQrKT8vZ1xuXG5tb2R1bGUuZXhwb3J0cyA9IHR3ZWVuXG5cbi8qKlxuICogY3JlYXRlIGEgdHdlZW4gZ2VuZXJhdG9yIGZyb20gYGFgIHRvIGBiYFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBhXG4gKiBAcGFyYW0ge1N0cmluZ30gYlxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKi9cblxuZnVuY3Rpb24gdHdlZW4oYSwgYil7XG5cdHZhciBzdHJpbmcgPSBbXVxuXHR2YXIga2V5cyA9IFtdXG5cdHZhciBmcm9tID0gW11cblx0dmFyIHRvID0gW11cblx0dmFyIGN1cnNvciA9IDBcblx0dmFyIG1cblxuXHR3aGlsZSAobSA9IG51bWJlci5leGVjKGIpKSB7XG5cdFx0aWYgKG0uaW5kZXggPiBjdXJzb3IpIHN0cmluZy5wdXNoKGIuc2xpY2UoY3Vyc29yLCBtLmluZGV4KSlcblx0XHR0by5wdXNoKE51bWJlcihtWzBdKSlcblx0XHRrZXlzLnB1c2goc3RyaW5nLmxlbmd0aClcblx0XHRzdHJpbmcucHVzaChudWxsKVxuXHRcdGN1cnNvciA9IG51bWJlci5sYXN0SW5kZXhcblx0fVxuXHRpZiAoY3Vyc29yIDwgYi5sZW5ndGgpIHN0cmluZy5wdXNoKGIuc2xpY2UoY3Vyc29yKSlcblxuXHR3aGlsZSAobSA9IG51bWJlci5leGVjKGEpKSBmcm9tLnB1c2goTnVtYmVyKG1bMF0pKVxuXG5cdHJldHVybiBmdW5jdGlvbiBmcmFtZShuKXtcblx0XHR2YXIgaSA9IGtleXMubGVuZ3RoXG5cdFx0d2hpbGUgKGktLSkgc3RyaW5nW2tleXNbaV1dID0gZnJvbVtpXSArICh0b1tpXSAtIGZyb21baV0pICogblxuXHRcdHJldHVybiBzdHJpbmcuam9pbignJylcblx0fVxufVxuIiwiXG5tb2R1bGUuZXhwb3J0cyA9IHNlcmlhbGl6ZVxuXG4vKipcbiAqIGNvbnZlcnQgYHBhdGhgIHRvIGEgc3RyaW5nXG4gKlxuICogQHBhcmFtIHtBcnJheX0gcGF0aFxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5cbmZ1bmN0aW9uIHNlcmlhbGl6ZShwYXRoKXtcblx0cmV0dXJuIHBhdGgucmVkdWNlKGZ1bmN0aW9uKHN0ciwgc2VnKXtcblx0XHRyZXR1cm4gc3RyICsgc2VnWzBdICsgc2VnLnNsaWNlKDEpLmpvaW4oJywnKVxuXHR9LCAnJylcbn1cbiIsIlxubW9kdWxlLmV4cG9ydHMgPSBiYWxhbmNlXG5cbi8qKlxuICogZGVmaW5lIGBhYCBhbmQgYGJgIHVzaW5nIHRoZSBzYW1lIG51bWJlciBvZlxuICogcGF0aCBzZWdtZW50cyB3aGlsZSBwcmVzZXJ2aW5nIHRoZWlyIHNoYXBlXG4gKlxuICogQHBhcmFtIHtBcnJheX0gYVxuICogQHBhcmFtIHtBcnJheX0gYlxuICogQHJldHVybiB7QXJyYXl9XG4gKi9cblxuZnVuY3Rpb24gYmFsYW5jZShhLCBiKXtcbiAgdmFyIGRpZmYgPSBhLmxlbmd0aCAtIGIubGVuZ3RoXG4gIHZhciBzaG9ydCA9IGRpZmYgPj0gMCA/IGIgOiBhXG4gIGRpZmYgPSBNYXRoLmFicyhkaWZmKVxuICB3aGlsZSAoZGlmZi0tKSBzaG9ydC5wdXNoKFsnYycsMCwwLDAsMCwwLDBdKVxuICByZXR1cm4gW2EsIGJdXG59XG4iLCJ2YXIgYXBwbHkgPSBGdW5jdGlvbi5wcm90b3R5cGUuYXBwbHlcbm1vZHVsZS5leHBvcnRzID0gZmNvbXBcblxuZnVuY3Rpb24gZmNvbXAoKSB7XG4gIHZhciBmbnMgPSBhcmd1bWVudHNcbiAgICAsIGxlbiA9IGZucy5sZW5ndGhcbiAgICAsIGZuID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB2YWwgPSBhcHBseS5jYWxsKGZuc1swXSwgbnVsbCwgYXJndW1lbnRzKVxuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGxlbjsgaSsrKVxuICAgICAgICAgIHZhbCA9IGZuc1tpXSh2YWwpXG4gICAgICAgIHJldHVybiB2YWxcbiAgICAgIH1cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKylcbiAgICBmbi5kaXNwbGF5TmFtZSA9IChmbi5kaXNwbGF5TmFtZSB8fCAnJylcbiAgICAgICsgKGkgPT09IDAgPyAnJyA6ICcgwrcgJylcbiAgICAgICsgZm5zW2ldLm5hbWVcbiAgcmV0dXJuIGZuXG59XG5cbmZjb21wLnJldmVyc2UgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIGZjb21wLmFwcGx5KG51bGwsIFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKS5yZXZlcnNlKCkpXG59XG4iLCJcbm1vZHVsZS5leHBvcnRzID0gcGFyc2VcblxuLyoqXG4gKiBleHBlY3RlZCBhcmd1bWVudCBsZW5ndGhzXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5cbnZhciBsZW5ndGggPSB7YTogNywgYzogNiwgaDogMSwgbDogMiwgbTogMiwgcTogNCwgczogNCwgdDogMiwgdjogMSwgejogMH1cblxuLyoqXG4gKiBzZWdtZW50IHBhdHRlcm5cbiAqIEB0eXBlIHtSZWdFeHB9XG4gKi9cblxudmFyIHNlZ21lbnQgPSAvKFthc3R2enFtaGxjXSkoW15hc3R2enFtaGxjXSopL2lnXG5cbi8qKlxuICogcGFyc2UgYW4gc3ZnIHBhdGggZGF0YSBzdHJpbmcuIEdlbmVyYXRlcyBhbiBBcnJheVxuICogb2YgY29tbWFuZHMgd2hlcmUgZWFjaCBjb21tYW5kIGlzIGFuIEFycmF5IG9mIHRoZVxuICogZm9ybSBgW2NvbW1hbmQsIGFyZzEsIGFyZzIsIC4uLl1gXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHBhdGhcbiAqIEByZXR1cm4ge0FycmF5fVxuICovXG5cbmZ1bmN0aW9uIHBhcnNlKHBhdGgpIHtcblx0dmFyIGRhdGEgPSBbXVxuXHRwYXRoLnJlcGxhY2Uoc2VnbWVudCwgZnVuY3Rpb24oXywgY29tbWFuZCwgYXJncyl7XG5cdFx0dmFyIHR5cGUgPSBjb21tYW5kLnRvTG93ZXJDYXNlKClcblx0XHRhcmdzID0gcGFyc2VWYWx1ZXMoYXJncylcblxuXHRcdC8vIG92ZXJsb2FkZWQgbW92ZVRvXG5cdFx0aWYgKHR5cGUgPT0gJ20nICYmIGFyZ3MubGVuZ3RoID4gMikge1xuXHRcdFx0ZGF0YS5wdXNoKFtjb21tYW5kXS5jb25jYXQoYXJncy5zcGxpY2UoMCwgMikpKVxuXHRcdFx0dHlwZSA9ICdsJ1xuXHRcdFx0Y29tbWFuZCA9IGNvbW1hbmQgPT0gJ20nID8gJ2wnIDogJ0wnXG5cdFx0fVxuXG5cdFx0d2hpbGUgKHRydWUpIHtcblx0XHRcdGlmIChhcmdzLmxlbmd0aCA9PSBsZW5ndGhbdHlwZV0pIHtcblx0XHRcdFx0YXJncy51bnNoaWZ0KGNvbW1hbmQpXG5cdFx0XHRcdHJldHVybiBkYXRhLnB1c2goYXJncylcblx0XHRcdH1cblx0XHRcdGlmIChhcmdzLmxlbmd0aCA8IGxlbmd0aFt0eXBlXSkgdGhyb3cgbmV3IEVycm9yKCdtYWxmb3JtZWQgcGF0aCBkYXRhJylcblx0XHRcdGRhdGEucHVzaChbY29tbWFuZF0uY29uY2F0KGFyZ3Muc3BsaWNlKDAsIGxlbmd0aFt0eXBlXSkpKVxuXHRcdH1cblx0fSlcblx0cmV0dXJuIGRhdGFcbn1cblxuZnVuY3Rpb24gcGFyc2VWYWx1ZXMoYXJncyl7XG5cdGFyZ3MgPSBhcmdzLm1hdGNoKC8tP1suMC05XSsoPzplWy0rXT9cXGQrKT8vaWcpXG5cdHJldHVybiBhcmdzID8gYXJncy5tYXAoTnVtYmVyKSA6IFtdXG59XG4iLCJcbm1vZHVsZS5leHBvcnRzID0gYWJzb2x1dGl6ZVxuXG4vKipcbiAqIHJlZGVmaW5lIGBwYXRoYCB3aXRoIGFic29sdXRlIGNvb3JkaW5hdGVzXG4gKlxuICogQHBhcmFtIHtBcnJheX0gcGF0aFxuICogQHJldHVybiB7QXJyYXl9XG4gKi9cblxuZnVuY3Rpb24gYWJzb2x1dGl6ZShwYXRoKXtcblx0dmFyIHN0YXJ0WCA9IDBcblx0dmFyIHN0YXJ0WSA9IDBcblx0dmFyIHggPSAwXG5cdHZhciB5ID0gMFxuXG5cdHJldHVybiBwYXRoLm1hcChmdW5jdGlvbihzZWcpe1xuXHRcdHNlZyA9IHNlZy5zbGljZSgpXG5cdFx0dmFyIHR5cGUgPSBzZWdbMF1cblx0XHR2YXIgY29tbWFuZCA9IHR5cGUudG9VcHBlckNhc2UoKVxuXG5cdFx0Ly8gaXMgcmVsYXRpdmVcblx0XHRpZiAodHlwZSAhPSBjb21tYW5kKSB7XG5cdFx0XHRzZWdbMF0gPSBjb21tYW5kXG5cdFx0XHRzd2l0Y2ggKHR5cGUpIHtcblx0XHRcdFx0Y2FzZSAnYSc6XG5cdFx0XHRcdFx0c2VnWzZdICs9IHhcblx0XHRcdFx0XHRzZWdbN10gKz0geVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdGNhc2UgJ3YnOlxuXHRcdFx0XHRcdHNlZ1sxXSArPSB5XG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0Y2FzZSAnaCc6XG5cdFx0XHRcdFx0c2VnWzFdICs9IHhcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdGZvciAodmFyIGkgPSAxOyBpIDwgc2VnLmxlbmd0aDspIHtcblx0XHRcdFx0XHRcdHNlZ1tpKytdICs9IHhcblx0XHRcdFx0XHRcdHNlZ1tpKytdICs9IHlcblx0XHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gdXBkYXRlIGN1cnNvciBzdGF0ZVxuXHRcdHN3aXRjaCAoY29tbWFuZCkge1xuXHRcdFx0Y2FzZSAnWic6XG5cdFx0XHRcdHggPSBzdGFydFhcblx0XHRcdFx0eSA9IHN0YXJ0WVxuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSAnSCc6XG5cdFx0XHRcdHggPSBzZWdbMV1cblx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgJ1YnOlxuXHRcdFx0XHR5ID0gc2VnWzFdXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlICdNJzpcblx0XHRcdFx0eCA9IHN0YXJ0WCA9IHNlZ1sxXVxuXHRcdFx0XHR5ID0gc3RhcnRZID0gc2VnWzJdXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHR4ID0gc2VnW3NlZy5sZW5ndGggLSAyXVxuXHRcdFx0XHR5ID0gc2VnW3NlZy5sZW5ndGggLSAxXVxuXHRcdH1cblxuXHRcdHJldHVybiBzZWdcblx0fSlcbn1cbiIsIlxudmFyIM+AID0gTWF0aC5QSVxudmFyIF8xMjAgPSByYWRpYW5zKDEyMClcblxubW9kdWxlLmV4cG9ydHMgPSBub3JtYWxpemVcblxuLyoqXG4gKiBkZXNjcmliZSBgcGF0aGAgaW4gdGVybXMgb2YgY3ViaWMgYsOpemllciBcbiAqIGN1cnZlcyBhbmQgbW92ZSBjb21tYW5kc1xuICpcbiAqIEBwYXJhbSB7QXJyYXl9IHBhdGhcbiAqIEByZXR1cm4ge0FycmF5fVxuICovXG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZShwYXRoKXtcblx0Ly8gaW5pdCBzdGF0ZVxuXHR2YXIgcHJldlxuXHR2YXIgcmVzdWx0ID0gW11cblx0dmFyIGJlemllclggPSAwXG5cdHZhciBiZXppZXJZID0gMFxuXHR2YXIgc3RhcnRYID0gMFxuXHR2YXIgc3RhcnRZID0gMFxuXHR2YXIgcXVhZFggPSBudWxsXG5cdHZhciBxdWFkWSA9IG51bGxcblx0dmFyIHggPSAwXG5cdHZhciB5ID0gMFxuXG5cdGZvciAodmFyIGkgPSAwLCBsZW4gPSBwYXRoLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG5cdFx0dmFyIHNlZyA9IHBhdGhbaV1cblx0XHR2YXIgY29tbWFuZCA9IHNlZ1swXVxuXHRcdHN3aXRjaCAoY29tbWFuZCkge1xuXHRcdFx0Y2FzZSAnTSc6XG5cdFx0XHRcdHN0YXJ0WCA9IHNlZ1sxXVxuXHRcdFx0XHRzdGFydFkgPSBzZWdbMl1cblx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgJ0EnOlxuXHRcdFx0XHRzZWcgPSBhcmMoeCwgeSxzZWdbMV0sc2VnWzJdLHJhZGlhbnMoc2VnWzNdKSxzZWdbNF0sc2VnWzVdLHNlZ1s2XSxzZWdbN10pXG5cdFx0XHRcdC8vIHNwbGl0IG11bHRpIHBhcnRcblx0XHRcdFx0c2VnLnVuc2hpZnQoJ0MnKVxuXHRcdFx0XHRpZiAoc2VnLmxlbmd0aCA+IDcpIHtcblx0XHRcdFx0XHRyZXN1bHQucHVzaChzZWcuc3BsaWNlKDAsIDcpKVxuXHRcdFx0XHRcdHNlZy51bnNoaWZ0KCdDJylcblx0XHRcdFx0fVxuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSAnUyc6XG5cdFx0XHRcdC8vIGRlZmF1bHQgY29udHJvbCBwb2ludFxuXHRcdFx0XHR2YXIgY3ggPSB4XG5cdFx0XHRcdHZhciBjeSA9IHlcblx0XHRcdFx0aWYgKHByZXYgPT0gJ0MnIHx8IHByZXYgPT0gJ1MnKSB7XG5cdFx0XHRcdFx0Y3ggKz0gY3ggLSBiZXppZXJYIC8vIHJlZmxlY3QgdGhlIHByZXZpb3VzIGNvbW1hbmQncyBjb250cm9sXG5cdFx0XHRcdFx0Y3kgKz0gY3kgLSBiZXppZXJZIC8vIHBvaW50IHJlbGF0aXZlIHRvIHRoZSBjdXJyZW50IHBvaW50XG5cdFx0XHRcdH1cblx0XHRcdFx0c2VnID0gWydDJywgY3gsIGN5LCBzZWdbMV0sIHNlZ1syXSwgc2VnWzNdLCBzZWdbNF1dXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlICdUJzpcblx0XHRcdFx0aWYgKHByZXYgPT0gJ1EnIHx8IHByZXYgPT0gJ1QnKSB7XG5cdFx0XHRcdFx0cXVhZFggPSB4ICogMiAtIHF1YWRYIC8vIGFzIHdpdGggJ1MnIHJlZmxlY3QgcHJldmlvdXMgY29udHJvbCBwb2ludFxuXHRcdFx0XHRcdHF1YWRZID0geSAqIDIgLSBxdWFkWVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHF1YWRYID0geFxuXHRcdFx0XHRcdHF1YWRZID0geVxuXHRcdFx0XHR9XG5cdFx0XHRcdHNlZyA9IHF1YWRyYXRpYyh4LCB5LCBxdWFkWCwgcXVhZFksIHNlZ1sxXSwgc2VnWzJdKVxuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSAnUSc6XG5cdFx0XHRcdHF1YWRYID0gc2VnWzFdXG5cdFx0XHRcdHF1YWRZID0gc2VnWzJdXG5cdFx0XHRcdHNlZyA9IHF1YWRyYXRpYyh4LCB5LCBzZWdbMV0sIHNlZ1syXSwgc2VnWzNdLCBzZWdbNF0pXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlICdMJzpcblx0XHRcdFx0c2VnID0gbGluZSh4LCB5LCBzZWdbMV0sIHNlZ1syXSlcblx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgJ0gnOlxuXHRcdFx0XHRzZWcgPSBsaW5lKHgsIHksIHNlZ1sxXSwgeSlcblx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgJ1YnOlxuXHRcdFx0XHRzZWcgPSBsaW5lKHgsIHksIHgsIHNlZ1sxXSlcblx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgJ1onOlxuXHRcdFx0XHRzZWcgPSBsaW5lKHgsIHksIHN0YXJ0WCwgc3RhcnRZKVxuXHRcdFx0XHRicmVha1xuXHRcdH1cblxuXHRcdC8vIHVwZGF0ZSBzdGF0ZVxuXHRcdHByZXYgPSBjb21tYW5kXG5cdFx0eCA9IHNlZ1tzZWcubGVuZ3RoIC0gMl1cblx0XHR5ID0gc2VnW3NlZy5sZW5ndGggLSAxXVxuXHRcdGlmIChzZWcubGVuZ3RoID4gNCkge1xuXHRcdFx0YmV6aWVyWCA9IHNlZ1tzZWcubGVuZ3RoIC0gNF1cblx0XHRcdGJlemllclkgPSBzZWdbc2VnLmxlbmd0aCAtIDNdXG5cdFx0fSBlbHNlIHtcblx0XHRcdGJlemllclggPSB4XG5cdFx0XHRiZXppZXJZID0geVxuXHRcdH1cblx0XHRyZXN1bHQucHVzaChzZWcpXG5cdH1cblxuXHRyZXR1cm4gcmVzdWx0XG59XG5cbmZ1bmN0aW9uIGxpbmUoeDEsIHkxLCB4MiwgeTIpe1xuXHRyZXR1cm4gWydDJywgeDEsIHkxLCB4MiwgeTIsIHgyLCB5Ml1cbn1cblxuZnVuY3Rpb24gcXVhZHJhdGljKHgxLCB5MSwgY3gsIGN5LCB4MiwgeTIpe1xuXHRyZXR1cm4gW1xuXHRcdCdDJyxcblx0XHR4MS8zICsgKDIvMykgKiBjeCxcblx0XHR5MS8zICsgKDIvMykgKiBjeSxcblx0XHR4Mi8zICsgKDIvMykgKiBjeCxcblx0XHR5Mi8zICsgKDIvMykgKiBjeSxcblx0XHR4Mixcblx0XHR5MlxuXHRdXG59XG5cbi8vIFRoaXMgZnVuY3Rpb24gaXMgcmlwcGVkIGZyb20gXG4vLyBnaXRodWIuY29tL0RtaXRyeUJhcmFub3Zza2l5L3JhcGhhZWwvYmxvYi80ZDk3ZDQvcmFwaGFlbC5qcyNMMjIxNi1MMjMwNCBcbi8vIHdoaWNoIHJlZmVyZW5jZXMgdzMub3JnL1RSL1NWRzExL2ltcGxub3RlLmh0bWwjQXJjSW1wbGVtZW50YXRpb25Ob3Rlc1xuLy8gVE9ETzogbWFrZSBpdCBodW1hbiByZWFkYWJsZVxuXG5mdW5jdGlvbiBhcmMoeDEsIHkxLCByeCwgcnksIGFuZ2xlLCBsYXJnZV9hcmNfZmxhZywgc3dlZXBfZmxhZywgeDIsIHkyLCByZWN1cnNpdmUpIHtcblx0aWYgKCFyZWN1cnNpdmUpIHtcblx0XHR2YXIgeHkgPSByb3RhdGUoeDEsIHkxLCAtYW5nbGUpXG5cdFx0eDEgPSB4eS54XG5cdFx0eTEgPSB4eS55XG5cdFx0eHkgPSByb3RhdGUoeDIsIHkyLCAtYW5nbGUpXG5cdFx0eDIgPSB4eS54XG5cdFx0eTIgPSB4eS55XG5cdFx0dmFyIHggPSAoeDEgLSB4MikgLyAyXG5cdFx0dmFyIHkgPSAoeTEgLSB5MikgLyAyXG5cdFx0dmFyIGggPSAoeCAqIHgpIC8gKHJ4ICogcngpICsgKHkgKiB5KSAvIChyeSAqIHJ5KVxuXHRcdGlmIChoID4gMSkge1xuXHRcdFx0aCA9IE1hdGguc3FydChoKVxuXHRcdFx0cnggPSBoICogcnhcblx0XHRcdHJ5ID0gaCAqIHJ5XG5cdFx0fVxuXHRcdHZhciByeDIgPSByeCAqIHJ4XG5cdFx0dmFyIHJ5MiA9IHJ5ICogcnlcblx0XHR2YXIgayA9IChsYXJnZV9hcmNfZmxhZyA9PSBzd2VlcF9mbGFnID8gLTEgOiAxKVxuXHRcdFx0KiBNYXRoLnNxcnQoTWF0aC5hYnMoKHJ4MiAqIHJ5MiAtIHJ4MiAqIHkgKiB5IC0gcnkyICogeCAqIHgpIC8gKHJ4MiAqIHkgKiB5ICsgcnkyICogeCAqIHgpKSlcblx0XHRpZiAoayA9PSBJbmZpbml0eSkgayA9IDEgLy8gbmV1dHJhbGl6ZVxuXHRcdHZhciBjeCA9IGsgKiByeCAqIHkgLyByeSArICh4MSArIHgyKSAvIDJcblx0XHR2YXIgY3kgPSBrICogLXJ5ICogeCAvIHJ4ICsgKHkxICsgeTIpIC8gMlxuXHRcdHZhciBmMSA9IE1hdGguYXNpbigoKHkxIC0gY3kpIC8gcnkpLnRvRml4ZWQoOSkpXG5cdFx0dmFyIGYyID0gTWF0aC5hc2luKCgoeTIgLSBjeSkgLyByeSkudG9GaXhlZCg5KSlcblxuXHRcdGYxID0geDEgPCBjeCA/IM+AIC0gZjEgOiBmMVxuXHRcdGYyID0geDIgPCBjeCA/IM+AIC0gZjIgOiBmMlxuXHRcdGlmIChmMSA8IDApIGYxID0gz4AgKiAyICsgZjFcblx0XHRpZiAoZjIgPCAwKSBmMiA9IM+AICogMiArIGYyXG5cdFx0aWYgKHN3ZWVwX2ZsYWcgJiYgZjEgPiBmMikgZjEgPSBmMSAtIM+AICogMlxuXHRcdGlmICghc3dlZXBfZmxhZyAmJiBmMiA+IGYxKSBmMiA9IGYyIC0gz4AgKiAyXG5cdH0gZWxzZSB7XG5cdFx0ZjEgPSByZWN1cnNpdmVbMF1cblx0XHRmMiA9IHJlY3Vyc2l2ZVsxXVxuXHRcdGN4ID0gcmVjdXJzaXZlWzJdXG5cdFx0Y3kgPSByZWN1cnNpdmVbM11cblx0fVxuXHQvLyBncmVhdGVyIHRoYW4gMTIwIGRlZ3JlZXMgcmVxdWlyZXMgbXVsdGlwbGUgc2VnbWVudHNcblx0aWYgKE1hdGguYWJzKGYyIC0gZjEpID4gXzEyMCkge1xuXHRcdHZhciBmMm9sZCA9IGYyXG5cdFx0dmFyIHgyb2xkID0geDJcblx0XHR2YXIgeTJvbGQgPSB5MlxuXHRcdGYyID0gZjEgKyBfMTIwICogKHN3ZWVwX2ZsYWcgJiYgZjIgPiBmMSA/IDEgOiAtMSlcblx0XHR4MiA9IGN4ICsgcnggKiBNYXRoLmNvcyhmMilcblx0XHR5MiA9IGN5ICsgcnkgKiBNYXRoLnNpbihmMilcblx0XHR2YXIgcmVzID0gYXJjKHgyLCB5MiwgcngsIHJ5LCBhbmdsZSwgMCwgc3dlZXBfZmxhZywgeDJvbGQsIHkyb2xkLCBbZjIsIGYyb2xkLCBjeCwgY3ldKVxuXHR9XG5cdHZhciB0ID0gTWF0aC50YW4oKGYyIC0gZjEpIC8gNClcblx0dmFyIGh4ID0gNCAvIDMgKiByeCAqIHRcblx0dmFyIGh5ID0gNCAvIDMgKiByeSAqIHRcblx0dmFyIGN1cnZlID0gW1xuXHRcdDIgKiB4MSAtICh4MSArIGh4ICogTWF0aC5zaW4oZjEpKSxcblx0XHQyICogeTEgLSAoeTEgLSBoeSAqIE1hdGguY29zKGYxKSksXG5cdFx0eDIgKyBoeCAqIE1hdGguc2luKGYyKSxcblx0XHR5MiAtIGh5ICogTWF0aC5jb3MoZjIpLFxuXHRcdHgyLFxuXHRcdHkyXG5cdF1cblx0aWYgKHJlY3Vyc2l2ZSkgcmV0dXJuIGN1cnZlXG5cdGlmIChyZXMpIGN1cnZlID0gY3VydmUuY29uY2F0KHJlcylcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBjdXJ2ZS5sZW5ndGg7KSB7XG5cdFx0dmFyIHJvdCA9IHJvdGF0ZShjdXJ2ZVtpXSwgY3VydmVbaSsxXSwgYW5nbGUpXG5cdFx0Y3VydmVbaSsrXSA9IHJvdC54XG5cdFx0Y3VydmVbaSsrXSA9IHJvdC55XG5cdH1cblx0cmV0dXJuIGN1cnZlXG59XG5cbmZ1bmN0aW9uIHJvdGF0ZSh4LCB5LCByYWQpe1xuXHRyZXR1cm4ge1xuXHRcdHg6IHggKiBNYXRoLmNvcyhyYWQpIC0geSAqIE1hdGguc2luKHJhZCksXG5cdFx0eTogeCAqIE1hdGguc2luKHJhZCkgKyB5ICogTWF0aC5jb3MocmFkKVxuXHR9XG59XG5cbmZ1bmN0aW9uIHJhZGlhbnMoZGVncmVzcyl7XG5cdHJldHVybiBkZWdyZXNzICogKM+AIC8gMTgwKVxufVxuIiwiXG5tb2R1bGUuZXhwb3J0cyA9IHJlbGF0aXZlXG5cbi8qKlxuICogZGVmaW5lIGBwYXRoYCB1c2luZyByZWxhdGl2ZSBwb2ludHNcbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBwYXRoXG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqL1xuXG5mdW5jdGlvbiByZWxhdGl2ZShwYXRoKXtcblx0dmFyIHN0YXJ0WCA9IDBcblx0dmFyIHN0YXJ0WSA9IDBcblx0dmFyIHggPSAwXG5cdHZhciB5ID0gMFxuXG5cdHJldHVybiBwYXRoLm1hcChmdW5jdGlvbihzZWcpe1xuXHRcdHNlZyA9IHNlZy5zbGljZSgpXG5cdFx0dmFyIHR5cGUgPSBzZWdbMF1cblx0XHR2YXIgY29tbWFuZCA9IHR5cGUudG9Mb3dlckNhc2UoKVxuXG5cdFx0Ly8gaXMgYWJzb2x1dGVcblx0XHRpZiAodHlwZSAhPSBjb21tYW5kKSB7XG5cdFx0XHRzZWdbMF0gPSBjb21tYW5kXG5cdFx0XHRzd2l0Y2ggKHR5cGUpIHtcblx0XHRcdFx0Y2FzZSAnQSc6XG5cdFx0XHRcdFx0c2VnWzZdIC09IHhcblx0XHRcdFx0XHRzZWdbN10gLT0geVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdGNhc2UgJ1YnOlxuXHRcdFx0XHRcdHNlZ1sxXSAtPSB5XG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0Y2FzZSAnSCc6XG5cdFx0XHRcdFx0c2VnWzFdIC09IHhcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdGZvciAodmFyIGkgPSAxOyBpIDwgc2VnLmxlbmd0aDspIHtcblx0XHRcdFx0XHRcdHNlZ1tpKytdIC09IHhcblx0XHRcdFx0XHRcdHNlZ1tpKytdIC09IHlcblx0XHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gdXBkYXRlIGN1cnNvciBzdGF0ZVxuXHRcdHN3aXRjaCAoY29tbWFuZCkge1xuXHRcdFx0Y2FzZSAneic6XG5cdFx0XHRcdHggPSBzdGFydFhcblx0XHRcdFx0eSA9IHN0YXJ0WVxuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSAnaCc6XG5cdFx0XHRcdHggKz0gc2VnWzFdXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlICd2Jzpcblx0XHRcdFx0eSArPSBzZWdbMV1cblx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgJ20nOlxuXHRcdFx0XHR4ICs9IHNlZ1sxXSBcblx0XHRcdFx0eSArPSBzZWdbMl1cblx0XHRcdFx0c3RhcnRYICs9IHNlZ1sxXVxuXHRcdFx0XHRzdGFydFkgKz0gc2VnWzJdXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHR4ICs9IHNlZ1tzZWcubGVuZ3RoIC0gMl1cblx0XHRcdFx0eSArPSBzZWdbc2VnLmxlbmd0aCAtIDFdXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHNlZ1xuXHR9KVxufVxuIiwiLyoqXG4gKiBNb2R1bGUgRGVwZW5kZW5jaWVzXG4gKi9cblxudmFyIHByZWZpeGVzID0gWydXZWJraXQnLCAnTycsICdNb3onLCAnbXMnXTtcblxuLyoqXG4gKiBFeHBvc2UgYHZlbmRvcmBcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHZlbmRvcjtcblxuLyoqXG4gKiBHZXQgdGhlIHZlbmRvciBwcmVmaXggZm9yIGEgZ2l2ZW4gcHJvcGVydHlcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gcHJvcFxuICogQHBhcmFtIHtPYmplY3R9IHN0eWxlXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cblxuZnVuY3Rpb24gdmVuZG9yKHByb3AsIHN0eWxlKSB7XG4gIC8vIHNob3J0Y3V0IGZvciBuYW1lcyB0aGF0IGFyZSBub3QgdmVuZG9yIHByZWZpeGVkXG4gIGlmIChzdHlsZVtwcm9wXSkgcmV0dXJuIHByb3A7XG5cbiAgLy8gY2hlY2sgZm9yIHZlbmRvciBwcmVmaXhlZCBuYW1lc1xuICB2YXIgY2FwTmFtZSA9IHByb3BbMF0udG9VcHBlckNhc2UoKSArIHByb3Auc2xpY2UoMSk7XG4gIHZhciBvcmlnaW5hbCA9IHByb3A7XG4gIHZhciBpID0gcHJlZml4ZXMubGVuZ3RoO1xuXG4gIHdoaWxlIChpLS0pIHtcbiAgICBwcm9wID0gcHJlZml4ZXNbaV0gKyBjYXBOYW1lO1xuICAgIGlmIChwcm9wIGluIHN0eWxlKSByZXR1cm4gcHJvcDtcbiAgfVxuXG4gIHJldHVybiBvcmlnaW5hbDtcbn1cbiIsIi8qKlxuICogRXhwb3J0IGBzd2FwYFxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gc3dhcDtcblxuLyoqXG4gKiBJbml0aWFsaXplIGBzd2FwYFxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHBhcmFtIHtBcnJheX0gYXJnc1xuICogQHJldHVybiB7TWl4ZWR9XG4gKi9cblxuZnVuY3Rpb24gc3dhcChlbCwgb3B0aW9ucywgZm4sIGFyZ3MpIHtcbiAgLy8gUmVtZW1iZXIgdGhlIG9sZCB2YWx1ZXMsIGFuZCBpbnNlcnQgdGhlIG5ldyBvbmVzXG4gIGZvciAodmFyIGtleSBpbiBvcHRpb25zKSB7XG4gICAgb2xkW2tleV0gPSBlbC5zdHlsZVtrZXldO1xuICAgIGVsLnN0eWxlW2tleV0gPSBvcHRpb25zW2tleV07XG4gIH1cblxuICByZXQgPSBmbi5hcHBseShlbCwgYXJncyB8fCBbXSk7XG5cbiAgLy8gUmV2ZXJ0IHRoZSBvbGQgdmFsdWVzXG4gIGZvciAoa2V5IGluIG9wdGlvbnMpIHtcbiAgICBlbC5zdHlsZVtrZXldID0gb2xkW2tleV07XG4gIH1cblxuICByZXR1cm4gcmV0O1xufVxuIiwiLyoqXG4gKiBFeHBvc2UgYHN0eWxlc2BcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHN0eWxlcztcblxuLyoqXG4gKiBHZXQgYWxsIHRoZSBzdHlsZXNcbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqL1xuXG5mdW5jdGlvbiBzdHlsZXMoZWwpIHtcbiAgcmV0dXJuIGVsLm93bmVyRG9jdW1lbnQuZGVmYXVsdFZpZXcuZ2V0Q29tcHV0ZWRTdHlsZShlbCwgbnVsbCk7XG59XG4iLCJcbi8qKlxuICogQ2hlY2sgaWYgYGVsYCBpcyB3aXRoaW4gdGhlIGRvY3VtZW50LlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGVsKSB7XG4gIHZhciBub2RlID0gZWw7XG4gIHdoaWxlIChub2RlID0gbm9kZS5wYXJlbnROb2RlKSB7XG4gICAgaWYgKG5vZGUgPT0gZG9jdW1lbnQpIHJldHVybiB0cnVlO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn07IiwiXG52YXIgY2xlYW4gPSByZXF1aXJlKCd0by1uby1jYXNlJyk7XG5cblxuLyoqXG4gKiBFeHBvc2UgYHRvU3BhY2VDYXNlYC5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHRvU3BhY2VDYXNlO1xuXG5cbi8qKlxuICogQ29udmVydCBhIGBzdHJpbmdgIHRvIHNwYWNlIGNhc2UuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0cmluZ1xuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5cblxuZnVuY3Rpb24gdG9TcGFjZUNhc2UgKHN0cmluZykge1xuICByZXR1cm4gY2xlYW4oc3RyaW5nKS5yZXBsYWNlKC9bXFxXX10rKC58JCkvZywgZnVuY3Rpb24gKG1hdGNoZXMsIG1hdGNoKSB7XG4gICAgcmV0dXJuIG1hdGNoID8gJyAnICsgbWF0Y2ggOiAnJztcbiAgfSk7XG59IiwiXG4vKipcbiAqIEV4cG9zZSBgdG9Ob0Nhc2VgLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gdG9Ob0Nhc2U7XG5cblxuLyoqXG4gKiBUZXN0IHdoZXRoZXIgYSBzdHJpbmcgaXMgY2FtZWwtY2FzZS5cbiAqL1xuXG52YXIgaGFzU3BhY2UgPSAvXFxzLztcbnZhciBoYXNDYW1lbCA9IC9bYS16XVtBLVpdLztcbnZhciBoYXNTZXBhcmF0b3IgPSAvW1xcV19dLztcblxuXG4vKipcbiAqIFJlbW92ZSBhbnkgc3RhcnRpbmcgY2FzZSBmcm9tIGEgYHN0cmluZ2AsIGxpa2UgY2FtZWwgb3Igc25ha2UsIGJ1dCBrZWVwXG4gKiBzcGFjZXMgYW5kIHB1bmN0dWF0aW9uIHRoYXQgbWF5IGJlIGltcG9ydGFudCBvdGhlcndpc2UuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0cmluZ1xuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5cbmZ1bmN0aW9uIHRvTm9DYXNlIChzdHJpbmcpIHtcbiAgaWYgKGhhc1NwYWNlLnRlc3Qoc3RyaW5nKSkgcmV0dXJuIHN0cmluZy50b0xvd2VyQ2FzZSgpO1xuXG4gIGlmIChoYXNTZXBhcmF0b3IudGVzdChzdHJpbmcpKSBzdHJpbmcgPSB1bnNlcGFyYXRlKHN0cmluZyk7XG4gIGlmIChoYXNDYW1lbC50ZXN0KHN0cmluZykpIHN0cmluZyA9IHVuY2FtZWxpemUoc3RyaW5nKTtcbiAgcmV0dXJuIHN0cmluZy50b0xvd2VyQ2FzZSgpO1xufVxuXG5cbi8qKlxuICogU2VwYXJhdG9yIHNwbGl0dGVyLlxuICovXG5cbnZhciBzZXBhcmF0b3JTcGxpdHRlciA9IC9bXFxXX10rKC58JCkvZztcblxuXG4vKipcbiAqIFVuLXNlcGFyYXRlIGEgYHN0cmluZ2AuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0cmluZ1xuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5cbmZ1bmN0aW9uIHVuc2VwYXJhdGUgKHN0cmluZykge1xuICByZXR1cm4gc3RyaW5nLnJlcGxhY2Uoc2VwYXJhdG9yU3BsaXR0ZXIsIGZ1bmN0aW9uIChtLCBuZXh0KSB7XG4gICAgcmV0dXJuIG5leHQgPyAnICcgKyBuZXh0IDogJyc7XG4gIH0pO1xufVxuXG5cbi8qKlxuICogQ2FtZWxjYXNlIHNwbGl0dGVyLlxuICovXG5cbnZhciBjYW1lbFNwbGl0dGVyID0gLyguKShbQS1aXSspL2c7XG5cblxuLyoqXG4gKiBVbi1jYW1lbGNhc2UgYSBgc3RyaW5nYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyaW5nXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cblxuZnVuY3Rpb24gdW5jYW1lbGl6ZSAoc3RyaW5nKSB7XG4gIHJldHVybiBzdHJpbmcucmVwbGFjZShjYW1lbFNwbGl0dGVyLCBmdW5jdGlvbiAobSwgcHJldmlvdXMsIHVwcGVycykge1xuICAgIHJldHVybiBwcmV2aW91cyArICcgJyArIHVwcGVycy50b0xvd2VyQ2FzZSgpLnNwbGl0KCcnKS5qb2luKCcgJyk7XG4gIH0pO1xufSIsIlxuZXhwb3J0cy5pc2F0dHkgPSBmdW5jdGlvbiAoKSB7IHJldHVybiBmYWxzZTsgfTtcblxuZnVuY3Rpb24gUmVhZFN0cmVhbSgpIHtcbiAgdGhyb3cgbmV3IEVycm9yKCd0dHkuUmVhZFN0cmVhbSBpcyBub3QgaW1wbGVtZW50ZWQnKTtcbn1cbmV4cG9ydHMuUmVhZFN0cmVhbSA9IFJlYWRTdHJlYW07XG5cbmZ1bmN0aW9uIFdyaXRlU3RyZWFtKCkge1xuICB0aHJvdyBuZXcgRXJyb3IoJ3R0eS5SZWFkU3RyZWFtIGlzIG5vdCBpbXBsZW1lbnRlZCcpO1xufVxuZXhwb3J0cy5Xcml0ZVN0cmVhbSA9IFdyaXRlU3RyZWFtO1xuIl19