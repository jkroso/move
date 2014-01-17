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

var style = require('computed-style')
var move = require('move')
var dom = require('dom')
var css = require('css')

dom('.example').each(function(el){
  el.initial = el.find('.sandbox').html()

  el.find('button.play').on('mousedown', function(){
    var boxs = el.find('.box.small')
    var boxs = [].slice.call(boxs.els)
    var box = boxs[0]
    eval(el.find('.source').text())
  })

  el.find('h3')
    .append('<button class="reset">↻</button>')
    .on('mousedown', function(e){
      el.find('.sandbox').html(el.initial)
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

},"/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/df04901/index.js": function(module,exports,require){

var query = require('query')
var Move = require('./move')
var SVG = require('./svg')

module.exports = function(el){
  if (typeof el == 'string') el = query(el)
  if (el instanceof SVGElement) return new SVG(el)
  return new Move(el)
}

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
},"/Users/jkroso/.packin/-/github.com/component/indexof/tarball/0.0.2/index.js": function(module,exports,require){
module.exports = function(arr, obj){
  if (arr.indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
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

},"/Users/jkroso/.packin/-/registry.npmjs.org/lazy-property/-/lazy-property-0.0.2.tgz/package.json": function(module,exports,require){
module.exports = require("./lazyProperty.js")
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
  "/Users/jkroso/Projects/js/move/node_modules/computed-style/index.js": "/Users/jkroso/.packin/-/github.com/jkroso/computed-style/tarball/0.1.0/index.js",
  "/Users/jkroso/Projects/js/move/node_modules/move/index.js": "/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/df04901/index.js",
  "/Users/jkroso/Projects/js/move/node_modules/dom/index.js": "/Users/jkroso/.packin/-/github.com/component/dom/tarball/0.9.0/index.js",
  "/Users/jkroso/Projects/js/move/node_modules/css/index.js": "/Users/jkroso/.packin/-/github.com/component/css/tarball/0.0.3/index.js",
  "/Users/jkroso/.packin/-/github.com/component/dom/tarball/0.9.0/node_modules/matches-selector/index.js": "/Users/jkroso/.packin/-/github.com/component/matches-selector/tarball/0.1.1/index.js",
  "/Users/jkroso/.packin/-/github.com/component/delegate/tarball/0.1.0/node_modules/matches-selector/index.js": "/Users/jkroso/.packin/-/github.com/component/matches-selector/tarball/0.1.1/index.js",
  "/Users/jkroso/.packin/-/github.com/yields/traverse/tarball/0.1.1/node_modules/matches-selector/index.js": "/Users/jkroso/.packin/-/github.com/component/matches-selector/tarball/0.1.1/index.js",
  "/Users/jkroso/.packin/-/github.com/component/dom/tarball/0.9.0/node_modules/delegate/index.js": "/Users/jkroso/.packin/-/github.com/component/delegate/tarball/0.1.0/index.js",
  "/Users/jkroso/.packin/-/github.com/component/dom/tarball/0.9.0/node_modules/classes/index.js": "/Users/jkroso/.packin/-/github.com/component/classes/tarball/1.1.2/index.js",
  "/Users/jkroso/.packin/-/github.com/component/dom/tarball/0.9.0/node_modules/indexof/index.js": "/Users/jkroso/.packin/-/github.com/component/indexof/tarball/0.0.1/index.js",
  "/Users/jkroso/.packin/-/github.com/component/dom/tarball/0.9.0/node_modules/domify/index.js": "/Users/jkroso/.packin/-/github.com/component/domify/tarball/1.0.0/index.js",
  "/Users/jkroso/.packin/-/github.com/component/dom/tarball/0.9.0/node_modules/event/index.js": "/Users/jkroso/.packin/-/github.com/component/event/tarball/0.1.0/index.js",
  "/Users/jkroso/.packin/-/github.com/component/dom/tarball/0.9.0/node_modules/value/index.js": "/Users/jkroso/.packin/-/github.com/component/value/tarball/1.1.0/index.js",
  "/Users/jkroso/.packin/-/github.com/component/dom/tarball/0.9.0/node_modules/query/index.js": "/Users/jkroso/.packin/-/github.com/component/query/tarball/0.0.1/index.js",
  "/Users/jkroso/.packin/-/github.com/component/dom/tarball/0.9.0/node_modules/type/index.js": "/Users/jkroso/.packin/-/github.com/component/type/tarball/1.0.0/index.js",
  "/Users/jkroso/.packin/-/github.com/component/value/tarball/1.1.0/node_modules/type/index.js": "/Users/jkroso/.packin/-/github.com/component/type/tarball/1.0.0/index.js",
  "/Users/jkroso/.packin/-/github.com/component/dom/tarball/0.9.0/node_modules/css/index.js": "/Users/jkroso/.packin/-/github.com/component/css/tarball/0.0.2/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/df04901/node_modules/query/index.js": "/Users/jkroso/.packin/-/github.com/component/query/tarball/0.0.2/index.js",
  "/Users/jkroso/.packin/-/github.com/component/matches-selector/tarball/0.1.1/node_modules/query/index.js": "/Users/jkroso/.packin/-/github.com/component/query/tarball/0.0.2/index.js",
  "/Users/jkroso/.packin/-/github.com/component/dom/tarball/0.9.0/node_modules/traverse/index.js": "/Users/jkroso/.packin/-/github.com/yields/traverse/tarball/0.1.1/index.js",
  "/Users/jkroso/.packin/-/github.com/component/css/tarball/0.0.3/node_modules/debug/index.js": "/Users/jkroso/.packin/-/github.com/visionmedia/debug/tarball/0.7.4/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/df04901/node_modules/animation/index.js": "/Users/jkroso/.packin/-/github.com/jkroso/animation/tarball/0.1.0/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/df04901/node_modules/unmatrix/index.js": "/Users/jkroso/.packin/-/github.com/jkroso/unmatrix/tarball/0.1.0/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/df04901/node_modules/clone/index.js": "/Users/jkroso/.packin/-/github.com/jkroso/clone/tarball/0.3.0/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/df04901/node_modules/prefix/index.js": "/Users/jkroso/.packin/-/registry.npmjs.org/prefix/-/prefix-0.2.1.tgz/index.js",
  "/Users/jkroso/.packin/-/github.com/component/delegate/tarball/0.1.0/node_modules/event/index.js": "/Users/jkroso/.packin/-/github.com/component/event/tarball/0.1.2/index.js",
  "/Users/jkroso/.packin/-/github.com/component/classes/tarball/1.1.2/node_modules/indexof/index.js": "/Users/jkroso/.packin/-/github.com/component/indexof/tarball/0.0.2/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/df04901/node_modules/lazy-property/package.json": "/Users/jkroso/.packin/-/registry.npmjs.org/lazy-property/-/lazy-property-0.0.2.tgz/package.json",
  "/Users/jkroso/.packin/-/github.com/component/css/tarball/0.0.3/node_modules/to-camel-case/index.js": "/Users/jkroso/.packin/-/github.com/ianstormtaylor/to-camel-case/tarball/0.2.1/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/animation/tarball/0.1.0/node_modules/extensible/index.js": "/Users/jkroso/.packin/-/github.com/jkroso/extensible/tarball/0.2.0/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/animation/tarball/0.1.0/node_modules/emitter/index.js": "/Users/jkroso/.packin/-/github.com/jkroso/emitter/tarball/0.10.0/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/animation/tarball/0.1.0/node_modules/now/index.js": "/Users/jkroso/.packin/-/github.com/jkroso/now/tarball/0.1.1/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/clone/tarball/0.3.0/node_modules/type/index.js": "/Users/jkroso/.packin/-/github.com/jkroso/type/tarball/1.0.2/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/animation/tarball/0.1.0/node_modules/parse-duration/index.js": "/Users/jkroso/.packin/-/registry.npmjs.org/parse-duration/-/parse-duration-0.1.0.tgz/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/animation/tarball/0.1.0/node_modules/ease/index.js": "/Users/jkroso/.packin/-/github.com/component/ease/tarball/1.0.0/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/animation/tarball/0.1.0/node_modules/raf/index.js": "/Users/jkroso/.packin/-/github.com/component/raf/tarball/1.1.2/index.js",
  "/Users/jkroso/.packin/-/github.com/component/css/tarball/0.0.3/node_modules/within-document/index.js": "/Users/jkroso/.packin/-/github.com/component/within-document/tarball/0.0.1/index.js",
  "/Users/jkroso/.packin/-/github.com/ianstormtaylor/to-camel-case/tarball/0.2.1/node_modules/to-space-case/index.js": "/Users/jkroso/.packin/-/registry.npmjs.org/to-space-case/-/to-space-case-0.1.2.tgz/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/df04901/node_modules/color-parser/index.js": "/Users/jkroso/.packin/-/registry.npmjs.org/color-parser/-/color-parser-0.1.0.tgz/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/extensible/tarball/0.2.0/node_modules/inherit/index.js": "/Users/jkroso/.packin/-/github.com/nathan7/inherit/tarball/f1a75b4844/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/extensible/tarball/0.2.0/node_modules/merge/index.js": "/Users/jkroso/.packin/-/github.com/yields/merge/tarball/2f357cb501/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/emitter/tarball/0.10.0/node_modules/merge/index.js": "/Users/jkroso/.packin/-/github.com/yields/merge/tarball/2f357cb/index.js",
  "/Users/jkroso/.packin/-/registry.npmjs.org/to-space-case/-/to-space-case-0.1.2.tgz/node_modules/to-no-case/index.js": "/Users/jkroso/.packin/-/registry.npmjs.org/to-no-case/-/to-no-case-0.1.1.tgz/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/df04901/node_modules/string-tween/index.js": "/Users/jkroso/.packin/-/registry.npmjs.org/string-tween/-/string-tween-0.1.0.tgz/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/df04901/node_modules/serialize-svg-path/index.js": "/Users/jkroso/.packin/-/registry.npmjs.org/serialize-svg-path/-/serialize-svg-path-0.1.0.tgz/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/df04901/node_modules/balance-svg-paths/index.js": "/Users/jkroso/.packin/-/registry.npmjs.org/balance-svg-paths/-/balance-svg-paths-0.1.0.tgz/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/df04901/node_modules/fcomp/index.js": "/Users/jkroso/.packin/-/registry.npmjs.org/fcomp/-/fcomp-1.1.0.tgz/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/df04901/node_modules/parse-svg-path/index.js": "/Users/jkroso/.packin/-/registry.npmjs.org/parse-svg-path/-/parse-svg-path-0.1.1.tgz/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/df04901/node_modules/abs-svg-path/index.js": "/Users/jkroso/.packin/-/registry.npmjs.org/abs-svg-path/-/abs-svg-path-0.1.1.tgz/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/df04901/node_modules/normalize-svg-path/index.js": "/Users/jkroso/.packin/-/registry.npmjs.org/normalize-svg-path/-/normalize-svg-path-0.1.0.tgz/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/df04901/node_modules/rel-svg-path/index.js": "/Users/jkroso/.packin/-/registry.npmjs.org/rel-svg-path/-/rel-svg-path-0.1.0.tgz/index.js",
  "/node_modules/tty.js": "/Users/jkroso/.packin/-/registry.npmjs.org/browser-builtins/-/browser-builtins-2.0.0.tgz/builtin/tty.js"
})("/Users/jkroso/Projects/js/move/examples.original.js")
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL1VzZXJzL2prcm9zby9Qcm9qZWN0cy9qcy9tb3ZlL2V4YW1wbGVzLm9yaWdpbmFsLmpzIiwic291cmNlcyI6WyIvbm9kZV9tb2R1bGVzL2Nzcy1pbnN0YWxsLmpzIiwiL25vZGVfbW9kdWxlcy9qYWRlLXJ1bnRpbWUuanMiLCIvVXNlcnMvamtyb3NvL1Byb2plY3RzL2pzL21vdmUvZXhhbXBsZXMub3JpZ2luYWwuanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2prcm9zby9jb21wdXRlZC1zdHlsZS90YXJiYWxsLzAuMS4wL2luZGV4LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9qa3Jvc28vbW92ZS90YXJiYWxsL2RmMDQ5MDEvaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2NvbXBvbmVudC9kb20vdGFyYmFsbC8wLjkuMC9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vY29tcG9uZW50L2Nzcy90YXJiYWxsLzAuMC4zL2luZGV4LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9qa3Jvc28vbW92ZS90YXJiYWxsL2RmMDQ5MDEvc3ZnLmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9qa3Jvc28vbW92ZS90YXJiYWxsL2RmMDQ5MDEvbW92ZS5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vY29tcG9uZW50L21hdGNoZXMtc2VsZWN0b3IvdGFyYmFsbC8wLjEuMS9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vY29tcG9uZW50L2RlbGVnYXRlL3RhcmJhbGwvMC4xLjAvaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2NvbXBvbmVudC9jbGFzc2VzL3RhcmJhbGwvMS4xLjIvaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2NvbXBvbmVudC9pbmRleG9mL3RhcmJhbGwvMC4wLjEvaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2NvbXBvbmVudC9kb21pZnkvdGFyYmFsbC8xLjAuMC9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vY29tcG9uZW50L2V2ZW50L3RhcmJhbGwvMC4xLjAvaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2NvbXBvbmVudC92YWx1ZS90YXJiYWxsLzEuMS4wL2luZGV4LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9jb21wb25lbnQvcXVlcnkvdGFyYmFsbC8wLjAuMS9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vY29tcG9uZW50L3R5cGUvdGFyYmFsbC8xLjAuMC9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vY29tcG9uZW50L2Nzcy90YXJiYWxsLzAuMC4yL2luZGV4LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9jb21wb25lbnQvcXVlcnkvdGFyYmFsbC8wLjAuMi9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20veWllbGRzL3RyYXZlcnNlL3RhcmJhbGwvMC4xLjEvaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2NvbXBvbmVudC9jc3MvdGFyYmFsbC8wLjAuMy9saWIvY3NzLmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS92aXNpb25tZWRpYS9kZWJ1Zy90YXJiYWxsLzAuNy40L2luZGV4LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9jb21wb25lbnQvY3NzL3RhcmJhbGwvMC4wLjMvbGliL3N0eWxlLmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9qa3Jvc28vYW5pbWF0aW9uL3RhcmJhbGwvMC4xLjAvaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2prcm9zby91bm1hdHJpeC90YXJiYWxsLzAuMS4wL2luZGV4LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9qa3Jvc28vY2xvbmUvdGFyYmFsbC8wLjMuMC9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL3JlZ2lzdHJ5Lm5wbWpzLm9yZy9wcmVmaXgvLS9wcmVmaXgtMC4yLjEudGd6L2luZGV4LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9jb21wb25lbnQvZXZlbnQvdGFyYmFsbC8wLjEuMi9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vY29tcG9uZW50L2luZGV4b2YvdGFyYmFsbC8wLjAuMi9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vdmlzaW9ubWVkaWEvZGVidWcvdGFyYmFsbC8wLjcuNC9kZWJ1Zy5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL3JlZ2lzdHJ5Lm5wbWpzLm9yZy9sYXp5LXByb3BlcnR5Ly0vbGF6eS1wcm9wZXJ0eS0wLjAuMi50Z3ovcGFja2FnZS5qc29uIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9jb21wb25lbnQvY3NzL3RhcmJhbGwvMC4wLjMvbGliL2NvbXB1dGVkLmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9jb21wb25lbnQvY3NzL3RhcmJhbGwvMC4wLjMvbGliL3Byb3AuanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2NvbXBvbmVudC9jc3MvdGFyYmFsbC8wLjAuMy9saWIvaG9va3MuanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL3Zpc2lvbm1lZGlhL2RlYnVnL3RhcmJhbGwvMC43LjQvbGliL2RlYnVnLmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9jb21wb25lbnQvY3NzL3RhcmJhbGwvMC4wLjMvbGliL3N1cHBvcnQuanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2lhbnN0b3JtdGF5bG9yL3RvLWNhbWVsLWNhc2UvdGFyYmFsbC8wLjIuMS9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vamtyb3NvL21vdmUvdGFyYmFsbC9kZjA0OTAxL3R3ZWVuL2luZGV4LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vcmVnaXN0cnkubnBtanMub3JnL2xhenktcHJvcGVydHkvLS9sYXp5LXByb3BlcnR5LTAuMC4yLnRnei9sYXp5UHJvcGVydHkuanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2prcm9zby9leHRlbnNpYmxlL3RhcmJhbGwvMC4yLjAvaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2prcm9zby9lbWl0dGVyL3RhcmJhbGwvMC4xMC4wL2luZGV4LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9qa3Jvc28vbm93L3RhcmJhbGwvMC4xLjEvaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2prcm9zby90eXBlL3RhcmJhbGwvMS4wLjIvaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9yZWdpc3RyeS5ucG1qcy5vcmcvcGFyc2UtZHVyYXRpb24vLS9wYXJzZS1kdXJhdGlvbi0wLjEuMC50Z3ovaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2NvbXBvbmVudC9lYXNlL3RhcmJhbGwvMS4wLjAvaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2NvbXBvbmVudC9yYWYvdGFyYmFsbC8xLjEuMi9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vY29tcG9uZW50L2Nzcy90YXJiYWxsLzAuMC4zL2xpYi9zdHlsZXMuanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2NvbXBvbmVudC9jc3MvdGFyYmFsbC8wLjAuMy9saWIvdmVuZG9yLmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9jb21wb25lbnQvY3NzL3RhcmJhbGwvMC4wLjMvbGliL3N3YXAuanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2NvbXBvbmVudC93aXRoaW4tZG9jdW1lbnQvdGFyYmFsbC8wLjAuMS9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL3JlZ2lzdHJ5Lm5wbWpzLm9yZy90by1zcGFjZS1jYXNlLy0vdG8tc3BhY2UtY2FzZS0wLjEuMi50Z3ovaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2prcm9zby9tb3ZlL3RhcmJhbGwvZGYwNDkwMS90d2Vlbi9tYXRyaXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2prcm9zby9tb3ZlL3RhcmJhbGwvZGYwNDkwMS90d2Vlbi9udW1iZXIuanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2prcm9zby9tb3ZlL3RhcmJhbGwvZGYwNDkwMS90d2Vlbi9jb2xvci5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vamtyb3NvL21vdmUvdGFyYmFsbC9kZjA0OTAxL3R3ZWVuL3BhdGguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2prcm9zby9tb3ZlL3RhcmJhbGwvZGYwNDkwMS90d2Vlbi9weC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL3JlZ2lzdHJ5Lm5wbWpzLm9yZy9jb2xvci1wYXJzZXIvLS9jb2xvci1wYXJzZXItMC4xLjAudGd6L2luZGV4LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9uYXRoYW43L2luaGVyaXQvdGFyYmFsbC9mMWE3NWI0ODQ0L2luZGV4LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS95aWVsZHMvbWVyZ2UvdGFyYmFsbC8yZjM1N2NiNTAxL2luZGV4LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS95aWVsZHMvbWVyZ2UvdGFyYmFsbC8yZjM1N2NiL2luZGV4LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vcmVnaXN0cnkubnBtanMub3JnL3RvLW5vLWNhc2UvLS90by1uby1jYXNlLTAuMS4xLnRnei9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL3JlZ2lzdHJ5Lm5wbWpzLm9yZy9jb2xvci1wYXJzZXIvLS9jb2xvci1wYXJzZXItMC4xLjAudGd6L2NvbG9ycy5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL3JlZ2lzdHJ5Lm5wbWpzLm9yZy9zdHJpbmctdHdlZW4vLS9zdHJpbmctdHdlZW4tMC4xLjAudGd6L2luZGV4LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vcmVnaXN0cnkubnBtanMub3JnL3NlcmlhbGl6ZS1zdmctcGF0aC8tL3NlcmlhbGl6ZS1zdmctcGF0aC0wLjEuMC50Z3ovaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9yZWdpc3RyeS5ucG1qcy5vcmcvYmFsYW5jZS1zdmctcGF0aHMvLS9iYWxhbmNlLXN2Zy1wYXRocy0wLjEuMC50Z3ovaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9yZWdpc3RyeS5ucG1qcy5vcmcvZmNvbXAvLS9mY29tcC0xLjEuMC50Z3ovaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9yZWdpc3RyeS5ucG1qcy5vcmcvcGFyc2Utc3ZnLXBhdGgvLS9wYXJzZS1zdmctcGF0aC0wLjEuMS50Z3ovaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9yZWdpc3RyeS5ucG1qcy5vcmcvYWJzLXN2Zy1wYXRoLy0vYWJzLXN2Zy1wYXRoLTAuMS4xLnRnei9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL3JlZ2lzdHJ5Lm5wbWpzLm9yZy9ub3JtYWxpemUtc3ZnLXBhdGgvLS9ub3JtYWxpemUtc3ZnLXBhdGgtMC4xLjAudGd6L2luZGV4LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vcmVnaXN0cnkubnBtanMub3JnL3JlbC1zdmctcGF0aC8tL3JlbC1zdmctcGF0aC0wLjEuMC50Z3ovaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9yZWdpc3RyeS5ucG1qcy5vcmcvYnJvd3Nlci1idWlsdGlucy8tL2Jyb3dzZXItYnVpbHRpbnMtMi4wLjAudGd6L2J1aWx0aW4vdHR5LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FEdk1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FFSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzN5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdFNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcktBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pJQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0tBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeE1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHRleHQpIHtcblx0dmFyIHN0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKVxuXHRzdHlsZS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh0ZXh0KSlcblx0ZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXS5hcHBlbmRDaGlsZChzdHlsZSlcbn0iLCJcclxuLyohXHJcbiAqIEphZGUgLSBydW50aW1lXHJcbiAqIENvcHlyaWdodChjKSAyMDEwIFRKIEhvbG93YXljaHVrIDx0akB2aXNpb24tbWVkaWEuY2E+XHJcbiAqIE1JVCBMaWNlbnNlZFxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBMYW1lIEFycmF5LmlzQXJyYXkoKSBwb2x5ZmlsbCBmb3Igbm93LlxyXG4gKi9cclxuXHJcbmlmICghQXJyYXkuaXNBcnJheSkge1xyXG4gIEFycmF5LmlzQXJyYXkgPSBmdW5jdGlvbihhcnIpe1xyXG4gICAgcmV0dXJuICdbb2JqZWN0IEFycmF5XScgPT0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGFycik7XHJcbiAgfTtcclxufVxyXG5cclxuLyoqXHJcbiAqIExhbWUgT2JqZWN0LmtleXMoKSBwb2x5ZmlsbCBmb3Igbm93LlxyXG4gKi9cclxuXHJcbmlmICghT2JqZWN0LmtleXMpIHtcclxuICBPYmplY3Qua2V5cyA9IGZ1bmN0aW9uKG9iail7XHJcbiAgICB2YXIgYXJyID0gW107XHJcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XHJcbiAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkoa2V5KSkge1xyXG4gICAgICAgIGFyci5wdXNoKGtleSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBhcnI7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogTWVyZ2UgdHdvIGF0dHJpYnV0ZSBvYmplY3RzIGdpdmluZyBwcmVjZWRlbmNlXHJcbiAqIHRvIHZhbHVlcyBpbiBvYmplY3QgYGJgLiBDbGFzc2VzIGFyZSBzcGVjaWFsLWNhc2VkXHJcbiAqIGFsbG93aW5nIGZvciBhcnJheXMgYW5kIG1lcmdpbmcvam9pbmluZyBhcHByb3ByaWF0ZWx5XHJcbiAqIHJlc3VsdGluZyBpbiBhIHN0cmluZy5cclxuICpcclxuICogQHBhcmFtIHtPYmplY3R9IGFcclxuICogQHBhcmFtIHtPYmplY3R9IGJcclxuICogQHJldHVybiB7T2JqZWN0fSBhXHJcbiAqIEBhcGkgcHJpdmF0ZVxyXG4gKi9cclxuXHJcbmV4cG9ydHMubWVyZ2UgPSBmdW5jdGlvbiBtZXJnZShhLCBiKSB7XHJcbiAgdmFyIGFjID0gYVsnY2xhc3MnXTtcclxuICB2YXIgYmMgPSBiWydjbGFzcyddO1xyXG5cclxuICBpZiAoYWMgfHwgYmMpIHtcclxuICAgIGFjID0gYWMgfHwgW107XHJcbiAgICBiYyA9IGJjIHx8IFtdO1xyXG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGFjKSkgYWMgPSBbYWNdO1xyXG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGJjKSkgYmMgPSBbYmNdO1xyXG4gICAgYVsnY2xhc3MnXSA9IGFjLmNvbmNhdChiYykuZmlsdGVyKG51bGxzKTtcclxuICB9XHJcblxyXG4gIGZvciAodmFyIGtleSBpbiBiKSB7XHJcbiAgICBpZiAoa2V5ICE9ICdjbGFzcycpIHtcclxuICAgICAgYVtrZXldID0gYltrZXldO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGE7XHJcbn07XHJcblxyXG4vKipcclxuICogRmlsdGVyIG51bGwgYHZhbGBzLlxyXG4gKlxyXG4gKiBAcGFyYW0geyp9IHZhbFxyXG4gKiBAcmV0dXJuIHtCb29sZWFufVxyXG4gKiBAYXBpIHByaXZhdGVcclxuICovXHJcblxyXG5mdW5jdGlvbiBudWxscyh2YWwpIHtcclxuICByZXR1cm4gdmFsICE9IG51bGwgJiYgdmFsICE9PSAnJztcclxufVxyXG5cclxuLyoqXHJcbiAqIGpvaW4gYXJyYXkgYXMgY2xhc3Nlcy5cclxuICpcclxuICogQHBhcmFtIHsqfSB2YWxcclxuICogQHJldHVybiB7U3RyaW5nfVxyXG4gKiBAYXBpIHByaXZhdGVcclxuICovXHJcblxyXG5mdW5jdGlvbiBqb2luQ2xhc3Nlcyh2YWwpIHtcclxuICByZXR1cm4gQXJyYXkuaXNBcnJheSh2YWwpID8gdmFsLm1hcChqb2luQ2xhc3NlcykuZmlsdGVyKG51bGxzKS5qb2luKCcgJykgOiB2YWw7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZW5kZXIgdGhlIGdpdmVuIGF0dHJpYnV0ZXMgb2JqZWN0LlxyXG4gKlxyXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBlc2NhcGVkXHJcbiAqIEByZXR1cm4ge1N0cmluZ31cclxuICogQGFwaSBwcml2YXRlXHJcbiAqL1xyXG5cclxuZXhwb3J0cy5hdHRycyA9IGZ1bmN0aW9uIGF0dHJzKG9iaiwgZXNjYXBlZCl7XHJcbiAgdmFyIGJ1ZiA9IFtdXHJcbiAgICAsIHRlcnNlID0gb2JqLnRlcnNlO1xyXG5cclxuICBkZWxldGUgb2JqLnRlcnNlO1xyXG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXMob2JqKVxyXG4gICAgLCBsZW4gPSBrZXlzLmxlbmd0aDtcclxuXHJcbiAgaWYgKGxlbikge1xyXG4gICAgYnVmLnB1c2goJycpO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47ICsraSkge1xyXG4gICAgICB2YXIga2V5ID0ga2V5c1tpXVxyXG4gICAgICAgICwgdmFsID0gb2JqW2tleV07XHJcblxyXG4gICAgICBpZiAoJ2Jvb2xlYW4nID09IHR5cGVvZiB2YWwgfHwgbnVsbCA9PSB2YWwpIHtcclxuICAgICAgICBpZiAodmFsKSB7XHJcbiAgICAgICAgICB0ZXJzZVxyXG4gICAgICAgICAgICA/IGJ1Zi5wdXNoKGtleSlcclxuICAgICAgICAgICAgOiBidWYucHVzaChrZXkgKyAnPVwiJyArIGtleSArICdcIicpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIGlmICgwID09IGtleS5pbmRleE9mKCdkYXRhJykgJiYgJ3N0cmluZycgIT0gdHlwZW9mIHZhbCkge1xyXG4gICAgICAgIGJ1Zi5wdXNoKGtleSArIFwiPSdcIiArIEpTT04uc3RyaW5naWZ5KHZhbCkgKyBcIidcIik7XHJcbiAgICAgIH0gZWxzZSBpZiAoJ2NsYXNzJyA9PSBrZXkpIHtcclxuICAgICAgICBpZiAoZXNjYXBlZCAmJiBlc2NhcGVkW2tleV0pe1xyXG4gICAgICAgICAgaWYgKHZhbCA9IGV4cG9ydHMuZXNjYXBlKGpvaW5DbGFzc2VzKHZhbCkpKSB7XHJcbiAgICAgICAgICAgIGJ1Zi5wdXNoKGtleSArICc9XCInICsgdmFsICsgJ1wiJyk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGlmICh2YWwgPSBqb2luQ2xhc3Nlcyh2YWwpKSB7XHJcbiAgICAgICAgICAgIGJ1Zi5wdXNoKGtleSArICc9XCInICsgdmFsICsgJ1wiJyk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2UgaWYgKGVzY2FwZWQgJiYgZXNjYXBlZFtrZXldKSB7XHJcbiAgICAgICAgYnVmLnB1c2goa2V5ICsgJz1cIicgKyBleHBvcnRzLmVzY2FwZSh2YWwpICsgJ1wiJyk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgYnVmLnB1c2goa2V5ICsgJz1cIicgKyB2YWwgKyAnXCInKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGJ1Zi5qb2luKCcgJyk7XHJcbn07XHJcblxyXG4vKipcclxuICogRXNjYXBlIHRoZSBnaXZlbiBzdHJpbmcgb2YgYGh0bWxgLlxyXG4gKlxyXG4gKiBAcGFyYW0ge1N0cmluZ30gaHRtbFxyXG4gKiBAcmV0dXJuIHtTdHJpbmd9XHJcbiAqIEBhcGkgcHJpdmF0ZVxyXG4gKi9cclxuXHJcbmV4cG9ydHMuZXNjYXBlID0gZnVuY3Rpb24gZXNjYXBlKGh0bWwpe1xyXG4gIHJldHVybiBTdHJpbmcoaHRtbClcclxuICAgIC5yZXBsYWNlKC8mL2csICcmYW1wOycpXHJcbiAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXHJcbiAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpXHJcbiAgICAucmVwbGFjZSgvXCIvZywgJyZxdW90OycpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFJlLXRocm93IHRoZSBnaXZlbiBgZXJyYCBpbiBjb250ZXh0IHRvIHRoZVxyXG4gKiB0aGUgamFkZSBpbiBgZmlsZW5hbWVgIGF0IHRoZSBnaXZlbiBgbGluZW5vYC5cclxuICpcclxuICogQHBhcmFtIHtFcnJvcn0gZXJyXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWxlbmFtZVxyXG4gKiBAcGFyYW0ge1N0cmluZ30gbGluZW5vXHJcbiAqIEBhcGkgcHJpdmF0ZVxyXG4gKi9cclxuXHJcbmV4cG9ydHMucmV0aHJvdyA9IGZ1bmN0aW9uIHJldGhyb3coZXJyLCBmaWxlbmFtZSwgbGluZW5vLCBzdHIpe1xyXG4gIGlmICghKGVyciBpbnN0YW5jZW9mIEVycm9yKSkgdGhyb3cgZXJyO1xyXG4gIGlmICgodHlwZW9mIHdpbmRvdyAhPSAndW5kZWZpbmVkJyB8fCAhZmlsZW5hbWUpICYmICFzdHIpIHtcclxuICAgIGVyci5tZXNzYWdlICs9ICcgb24gbGluZSAnICsgbGluZW5vO1xyXG4gICAgdGhyb3cgZXJyO1xyXG4gIH1cclxuICB0cnkge1xyXG4gICAgc3RyID0gIHN0ciB8fCByZXF1aXJlKCdmcycpLnJlYWRGaWxlU3luYyhmaWxlbmFtZSwgJ3V0ZjgnKVxyXG4gIH0gY2F0Y2ggKGV4KSB7XHJcbiAgICByZXRocm93KGVyciwgbnVsbCwgbGluZW5vKVxyXG4gIH1cclxuICB2YXIgY29udGV4dCA9IDNcclxuICAgICwgbGluZXMgPSBzdHIuc3BsaXQoJ1xcbicpXHJcbiAgICAsIHN0YXJ0ID0gTWF0aC5tYXgobGluZW5vIC0gY29udGV4dCwgMClcclxuICAgICwgZW5kID0gTWF0aC5taW4obGluZXMubGVuZ3RoLCBsaW5lbm8gKyBjb250ZXh0KTtcclxuXHJcbiAgLy8gRXJyb3IgY29udGV4dFxyXG4gIHZhciBjb250ZXh0ID0gbGluZXMuc2xpY2Uoc3RhcnQsIGVuZCkubWFwKGZ1bmN0aW9uKGxpbmUsIGkpe1xyXG4gICAgdmFyIGN1cnIgPSBpICsgc3RhcnQgKyAxO1xyXG4gICAgcmV0dXJuIChjdXJyID09IGxpbmVubyA/ICcgID4gJyA6ICcgICAgJylcclxuICAgICAgKyBjdXJyXHJcbiAgICAgICsgJ3wgJ1xyXG4gICAgICArIGxpbmU7XHJcbiAgfSkuam9pbignXFxuJyk7XHJcblxyXG4gIC8vIEFsdGVyIGV4Y2VwdGlvbiBtZXNzYWdlXHJcbiAgZXJyLnBhdGggPSBmaWxlbmFtZTtcclxuICBlcnIubWVzc2FnZSA9IChmaWxlbmFtZSB8fCAnSmFkZScpICsgJzonICsgbGluZW5vXHJcbiAgICArICdcXG4nICsgY29udGV4dCArICdcXG5cXG4nICsgZXJyLm1lc3NhZ2U7XHJcbiAgdGhyb3cgZXJyO1xyXG59O1xyXG4iLCJcbnZhciBzdHlsZSA9IHJlcXVpcmUoJ2NvbXB1dGVkLXN0eWxlJylcbnZhciBtb3ZlID0gcmVxdWlyZSgnbW92ZScpXG52YXIgZG9tID0gcmVxdWlyZSgnZG9tJylcbnZhciBjc3MgPSByZXF1aXJlKCdjc3MnKVxuXG5kb20oJy5leGFtcGxlJykuZWFjaChmdW5jdGlvbihlbCl7XG4gIGVsLmluaXRpYWwgPSBlbC5maW5kKCcuc2FuZGJveCcpLmh0bWwoKVxuXG4gIGVsLmZpbmQoJ2J1dHRvbi5wbGF5Jykub24oJ21vdXNlZG93bicsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIGJveHMgPSBlbC5maW5kKCcuYm94LnNtYWxsJylcbiAgICB2YXIgYm94cyA9IFtdLnNsaWNlLmNhbGwoYm94cy5lbHMpXG4gICAgdmFyIGJveCA9IGJveHNbMF1cbiAgICBldmFsKGVsLmZpbmQoJy5zb3VyY2UnKS50ZXh0KCkpXG4gIH0pXG5cbiAgZWwuZmluZCgnaDMnKVxuICAgIC5hcHBlbmQoJzxidXR0b24gY2xhc3M9XCJyZXNldFwiPuKGuzwvYnV0dG9uPicpXG4gICAgLm9uKCdtb3VzZWRvd24nLCBmdW5jdGlvbihlKXtcbiAgICAgIGVsLmZpbmQoJy5zYW5kYm94JykuaHRtbChlbC5pbml0aWFsKVxuICAgIH0pXG59KVxuIiwiXG4vKipcbiAqIEdldCB0aGUgY29tcHV0ZWQgc3R5bGUgb2YgYSBET00gZWxlbWVudFxuICogXG4gKiAgIHN0eWxlKGRvY3VtZW50LmJvZHkpIC8vID0+IHt3aWR0aDonNTAwcHgnLCAuLi59XG4gKiBcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxlbWVudFxuICogQHJldHVybiB7T2JqZWN0fVxuICovXG5cbi8vIEFjY2Vzc2luZyB2aWEgd2luZG93IGZvciBqc0RPTSBzdXBwb3J0XG5tb2R1bGUuZXhwb3J0cyA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlXG5cbi8vIEZhbGxiYWNrIHRvIGVsZW0uY3VycmVudFN0eWxlIGZvciBJRSA8IDlcbmlmICghbW9kdWxlLmV4cG9ydHMpIHtcblx0bW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZWxlbSkge1xuXHRcdHJldHVybiBlbGVtLmN1cnJlbnRTdHlsZVxuXHR9XG59XG4iLCJcbnZhciBxdWVyeSA9IHJlcXVpcmUoJ3F1ZXJ5JylcbnZhciBNb3ZlID0gcmVxdWlyZSgnLi9tb3ZlJylcbnZhciBTVkcgPSByZXF1aXJlKCcuL3N2ZycpXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZWwpe1xuICBpZiAodHlwZW9mIGVsID09ICdzdHJpbmcnKSBlbCA9IHF1ZXJ5KGVsKVxuICBpZiAoZWwgaW5zdGFuY2VvZiBTVkdFbGVtZW50KSByZXR1cm4gbmV3IFNWRyhlbClcbiAgcmV0dXJuIG5ldyBNb3ZlKGVsKVxufVxuIiwiLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICovXG5cbnZhciBtYXRjaGVzID0gcmVxdWlyZSgnbWF0Y2hlcy1zZWxlY3RvcicpO1xudmFyIGRlbGVnYXRlID0gcmVxdWlyZSgnZGVsZWdhdGUnKTtcbnZhciBjbGFzc2VzID0gcmVxdWlyZSgnY2xhc3NlcycpO1xudmFyIHRyYXZlcnNlID0gcmVxdWlyZSgndHJhdmVyc2UnKTtcbnZhciBpbmRleG9mID0gcmVxdWlyZSgnaW5kZXhvZicpO1xudmFyIGRvbWlmeSA9IHJlcXVpcmUoJ2RvbWlmeScpO1xudmFyIGV2ZW50cyA9IHJlcXVpcmUoJ2V2ZW50Jyk7XG52YXIgdmFsdWUgPSByZXF1aXJlKCd2YWx1ZScpO1xudmFyIHF1ZXJ5ID0gcmVxdWlyZSgncXVlcnknKTtcbnZhciB0eXBlID0gcmVxdWlyZSgndHlwZScpO1xudmFyIGNzcyA9IHJlcXVpcmUoJ2NzcycpO1xuXG4vKipcbiAqIEF0dHJpYnV0ZXMgc3VwcG9ydGVkLlxuICovXG5cbnZhciBhdHRycyA9IFtcbiAgJ2lkJyxcbiAgJ3NyYycsXG4gICdyZWwnLFxuICAnY29scycsXG4gICdyb3dzJyxcbiAgJ3R5cGUnLFxuICAnbmFtZScsXG4gICdocmVmJyxcbiAgJ3RpdGxlJyxcbiAgJ3N0eWxlJyxcbiAgJ3dpZHRoJyxcbiAgJ2hlaWdodCcsXG4gICdhY3Rpb24nLFxuICAnbWV0aG9kJyxcbiAgJ3RhYmluZGV4JyxcbiAgJ3BsYWNlaG9sZGVyJ1xuXTtcblxuLyoqXG4gKiBFeHBvc2UgYGRvbSgpYC5cbiAqL1xuXG5leHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBkb207XG5cbi8qKlxuICogRXhwb3NlIHN1cHBvcnRlZCBhdHRycy5cbiAqL1xuXG5leHBvcnRzLmF0dHJzID0gYXR0cnM7XG5cbi8qKlxuICogUmV0dXJuIGEgZG9tIGBMaXN0YCBmb3IgdGhlIGdpdmVuXG4gKiBgaHRtbGAsIHNlbGVjdG9yLCBvciBlbGVtZW50LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfEVsZW1lbnR8TGlzdH1cbiAqIEByZXR1cm4ge0xpc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIGRvbShzZWxlY3RvciwgY29udGV4dCkge1xuICAvLyBhcnJheVxuICBpZiAoQXJyYXkuaXNBcnJheShzZWxlY3RvcikpIHtcbiAgICByZXR1cm4gbmV3IExpc3Qoc2VsZWN0b3IpO1xuICB9XG5cbiAgLy8gTGlzdFxuICBpZiAoc2VsZWN0b3IgaW5zdGFuY2VvZiBMaXN0KSB7XG4gICAgcmV0dXJuIHNlbGVjdG9yO1xuICB9XG5cbiAgLy8gbm9kZVxuICBpZiAoc2VsZWN0b3Iubm9kZU5hbWUpIHtcbiAgICByZXR1cm4gbmV3IExpc3QoW3NlbGVjdG9yXSk7XG4gIH1cblxuICBpZiAoJ3N0cmluZycgIT0gdHlwZW9mIHNlbGVjdG9yKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignaW52YWxpZCBzZWxlY3RvcicpO1xuICB9XG5cbiAgLy8gaHRtbFxuICBpZiAoJzwnID09IHNlbGVjdG9yLmNoYXJBdCgwKSkge1xuICAgIHJldHVybiBuZXcgTGlzdChbZG9taWZ5KHNlbGVjdG9yKV0sIHNlbGVjdG9yKTtcbiAgfVxuXG4gIC8vIHNlbGVjdG9yXG4gIHZhciBjdHggPSBjb250ZXh0XG4gICAgPyAoY29udGV4dC5lbHMgPyBjb250ZXh0LmVsc1swXSA6IGNvbnRleHQpXG4gICAgOiBkb2N1bWVudDtcblxuICByZXR1cm4gbmV3IExpc3QocXVlcnkuYWxsKHNlbGVjdG9yLCBjdHgpLCBzZWxlY3Rvcik7XG59XG5cbi8qKlxuICogRXhwb3NlIGBMaXN0YCBjb25zdHJ1Y3Rvci5cbiAqL1xuXG5leHBvcnRzLkxpc3QgPSBMaXN0O1xuXG4vKipcbiAqIEluaXRpYWxpemUgYSBuZXcgYExpc3RgIHdpdGggdGhlXG4gKiBnaXZlbiBhcnJheS1pc2ggb2YgYGVsc2AgYW5kIGBzZWxlY3RvcmBcbiAqIHN0cmluZy5cbiAqXG4gKiBAcGFyYW0ge01peGVkfSBlbHNcbiAqIEBwYXJhbSB7U3RyaW5nfSBzZWxlY3RvclxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gTGlzdChlbHMsIHNlbGVjdG9yKSB7XG4gIHRoaXMuZWxzID0gZWxzIHx8IFtdO1xuICB0aGlzLnNlbGVjdG9yID0gc2VsZWN0b3I7XG59XG5cbi8qKlxuICogRW51bWVyYWJsZSBpdGVyYXRvci5cbiAqL1xuXG5MaXN0LnByb3RvdHlwZS5fX2l0ZXJhdGVfXyA9IGZ1bmN0aW9uKCl7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgcmV0dXJuIHtcbiAgICBsZW5ndGg6IGZ1bmN0aW9uKCl7IHJldHVybiBzZWxmLmVscy5sZW5ndGggfSxcbiAgICBnZXQ6IGZ1bmN0aW9uKGkpeyByZXR1cm4gbmV3IExpc3QoW3NlbGYuZWxzW2ldXSkgfVxuICB9XG59O1xuXG4vKipcbiAqIFJlbW92ZSBlbGVtZW50cyBmcm9tIHRoZSBET00uXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5MaXN0LnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbigpe1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZWxzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGVsID0gdGhpcy5lbHNbaV07XG4gICAgdmFyIHBhcmVudCA9IGVsLnBhcmVudE5vZGU7XG4gICAgaWYgKHBhcmVudCkgcGFyZW50LnJlbW92ZUNoaWxkKGVsKTtcbiAgfVxufTtcblxuLyoqXG4gKiBTZXQgYXR0cmlidXRlIGBuYW1lYCB0byBgdmFsYCwgb3IgZ2V0IGF0dHIgYG5hbWVgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gKiBAcGFyYW0ge1N0cmluZ30gW3ZhbF1cbiAqIEByZXR1cm4ge1N0cmluZ3xMaXN0fSBzZWxmXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkxpc3QucHJvdG90eXBlLmF0dHIgPSBmdW5jdGlvbihuYW1lLCB2YWwpe1xuICAvLyBnZXRcbiAgaWYgKDEgPT0gYXJndW1lbnRzLmxlbmd0aCkge1xuICAgIHJldHVybiB0aGlzLmVsc1swXSAmJiB0aGlzLmVsc1swXS5nZXRBdHRyaWJ1dGUobmFtZSk7XG4gIH1cblxuICAvLyByZW1vdmVcbiAgaWYgKG51bGwgPT0gdmFsKSB7XG4gICAgcmV0dXJuIHRoaXMucmVtb3ZlQXR0cihuYW1lKTtcbiAgfVxuXG4gIC8vIHNldFxuICByZXR1cm4gdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKGVsKXtcbiAgICBlbC5zZXRBdHRyaWJ1dGUobmFtZSwgdmFsKTtcbiAgfSk7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBhdHRyaWJ1dGUgYG5hbWVgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gKiBAcmV0dXJuIHtMaXN0fSBzZWxmXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkxpc3QucHJvdG90eXBlLnJlbW92ZUF0dHIgPSBmdW5jdGlvbihuYW1lKXtcbiAgcmV0dXJuIHRoaXMuZm9yRWFjaChmdW5jdGlvbihlbCl7XG4gICAgZWwucmVtb3ZlQXR0cmlidXRlKG5hbWUpO1xuICB9KTtcbn07XG5cbi8qKlxuICogU2V0IHByb3BlcnR5IGBuYW1lYCB0byBgdmFsYCwgb3IgZ2V0IHByb3BlcnR5IGBuYW1lYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICogQHBhcmFtIHtTdHJpbmd9IFt2YWxdXG4gKiBAcmV0dXJuIHtPYmplY3R8TGlzdH0gc2VsZlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5MaXN0LnByb3RvdHlwZS5wcm9wID0gZnVuY3Rpb24obmFtZSwgdmFsKXtcbiAgaWYgKDEgPT0gYXJndW1lbnRzLmxlbmd0aCkge1xuICAgIHJldHVybiB0aGlzLmVsc1swXSAmJiB0aGlzLmVsc1swXVtuYW1lXTtcbiAgfVxuXG4gIHJldHVybiB0aGlzLmZvckVhY2goZnVuY3Rpb24oZWwpe1xuICAgIGVsW25hbWVdID0gdmFsO1xuICB9KTtcbn07XG5cbi8qKlxuICogR2V0IHRoZSBmaXJzdCBlbGVtZW50J3MgdmFsdWUgb3Igc2V0IHNlbGVjdGVkXG4gKiBlbGVtZW50IHZhbHVlcyB0byBgdmFsYC5cbiAqXG4gKiBAcGFyYW0ge01peGVkfSBbdmFsXVxuICogQHJldHVybiB7TWl4ZWR9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkxpc3QucHJvdG90eXBlLnZhbCA9XG5MaXN0LnByb3RvdHlwZS52YWx1ZSA9IGZ1bmN0aW9uKHZhbCl7XG4gIGlmICgwID09IGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICByZXR1cm4gdGhpcy5lbHNbMF1cbiAgICAgID8gdmFsdWUodGhpcy5lbHNbMF0pXG4gICAgICA6IHVuZGVmaW5lZDtcbiAgfVxuXG4gIHJldHVybiB0aGlzLmZvckVhY2goZnVuY3Rpb24oZWwpe1xuICAgIHZhbHVlKGVsLCB2YWwpO1xuICB9KTtcbn07XG5cbi8qKlxuICogUmV0dXJuIGEgY2xvbmVkIGBMaXN0YCB3aXRoIGFsbCBlbGVtZW50cyBjbG9uZWQuXG4gKlxuICogQHJldHVybiB7TGlzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuTGlzdC5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbigpe1xuICB2YXIgYXJyID0gW107XG4gIGZvciAodmFyIGkgPSAwLCBsZW4gPSB0aGlzLmVscy5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xuICAgIGFyci5wdXNoKHRoaXMuZWxzW2ldLmNsb25lTm9kZSh0cnVlKSk7XG4gIH1cbiAgcmV0dXJuIG5ldyBMaXN0KGFycik7XG59O1xuXG4vKipcbiAqIFByZXBlbmQgYHZhbGAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd8RWxlbWVudHxMaXN0fSB2YWxcbiAqIEByZXR1cm4ge0xpc3R9IG5ldyBsaXN0XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkxpc3QucHJvdG90eXBlLnByZXBlbmQgPSBmdW5jdGlvbih2YWwpe1xuICB2YXIgZWwgPSB0aGlzLmVsc1swXTtcbiAgaWYgKCFlbCkgcmV0dXJuIHRoaXM7XG4gIHZhbCA9IGRvbSh2YWwpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHZhbC5lbHMubGVuZ3RoOyArK2kpIHtcbiAgICBpZiAoZWwuY2hpbGRyZW4ubGVuZ3RoKSB7XG4gICAgICBlbC5pbnNlcnRCZWZvcmUodmFsLmVsc1tpXSwgZWwuZmlyc3RDaGlsZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVsLmFwcGVuZENoaWxkKHZhbC5lbHNbaV0pO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdmFsO1xufTtcblxuLyoqXG4gKiBBcHBlbmQgYHZhbGAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd8RWxlbWVudHxMaXN0fSB2YWxcbiAqIEByZXR1cm4ge0xpc3R9IG5ldyBsaXN0XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkxpc3QucHJvdG90eXBlLmFwcGVuZCA9IGZ1bmN0aW9uKHZhbCl7XG4gIHZhciBlbCA9IHRoaXMuZWxzWzBdO1xuICBpZiAoIWVsKSByZXR1cm4gdGhpcztcbiAgdmFsID0gZG9tKHZhbCk7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdmFsLmVscy5sZW5ndGg7ICsraSkge1xuICAgIGVsLmFwcGVuZENoaWxkKHZhbC5lbHNbaV0pO1xuICB9XG4gIHJldHVybiB2YWw7XG59O1xuXG4vKipcbiAqIEFwcGVuZCBzZWxmJ3MgYGVsYCB0byBgdmFsYFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfEVsZW1lbnR8TGlzdH0gdmFsXG4gKiBAcmV0dXJuIHtMaXN0fSBzZWxmXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkxpc3QucHJvdG90eXBlLmFwcGVuZFRvID0gZnVuY3Rpb24odmFsKXtcbiAgZG9tKHZhbCkuYXBwZW5kKHRoaXMpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogSW5zZXJ0IHNlbGYncyBgZWxzYCBhZnRlciBgdmFsYFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfEVsZW1lbnR8TGlzdH0gdmFsXG4gKiBAcmV0dXJuIHtMaXN0fSBzZWxmXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkxpc3QucHJvdG90eXBlLmluc2VydEFmdGVyID0gZnVuY3Rpb24odmFsKXtcbiAgdmFsID0gZG9tKHZhbCkuZWxzWzBdO1xuICBpZiAoIXZhbCB8fCAhdmFsLnBhcmVudE5vZGUpIHJldHVybiB0aGlzO1xuICB0aGlzLmVscy5mb3JFYWNoKGZ1bmN0aW9uKGVsKXtcbiAgICB2YWwucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoZWwsIHZhbC5uZXh0U2libGluZyk7XG4gIH0pO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmV0dXJuIGEgYExpc3RgIGNvbnRhaW5pbmcgdGhlIGVsZW1lbnQgYXQgYGlgLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBpXG4gKiBAcmV0dXJuIHtMaXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5MaXN0LnByb3RvdHlwZS5hdCA9IGZ1bmN0aW9uKGkpe1xuICByZXR1cm4gbmV3IExpc3QoW3RoaXMuZWxzW2ldXSwgdGhpcy5zZWxlY3Rvcik7XG59O1xuXG4vKipcbiAqIFJldHVybiBhIGBMaXN0YCBjb250YWluaW5nIHRoZSBmaXJzdCBlbGVtZW50LlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBpXG4gKiBAcmV0dXJuIHtMaXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5MaXN0LnByb3RvdHlwZS5maXJzdCA9IGZ1bmN0aW9uKCl7XG4gIHJldHVybiBuZXcgTGlzdChbdGhpcy5lbHNbMF1dLCB0aGlzLnNlbGVjdG9yKTtcbn07XG5cbi8qKlxuICogUmV0dXJuIGEgYExpc3RgIGNvbnRhaW5pbmcgdGhlIGxhc3QgZWxlbWVudC5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gaVxuICogQHJldHVybiB7TGlzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuTGlzdC5wcm90b3R5cGUubGFzdCA9IGZ1bmN0aW9uKCl7XG4gIHJldHVybiBuZXcgTGlzdChbdGhpcy5lbHNbdGhpcy5lbHMubGVuZ3RoIC0gMV1dLCB0aGlzLnNlbGVjdG9yKTtcbn07XG5cbi8qKlxuICogUmV0dXJuIGFuIGBFbGVtZW50YCBhdCBgaWAuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IGlcbiAqIEByZXR1cm4ge0VsZW1lbnR9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkxpc3QucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKGkpe1xuICByZXR1cm4gdGhpcy5lbHNbaSB8fCAwXTtcbn07XG5cbi8qKlxuICogUmV0dXJuIGxpc3QgbGVuZ3RoLlxuICpcbiAqIEByZXR1cm4ge051bWJlcn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuTGlzdC5wcm90b3R5cGUubGVuZ3RoID0gZnVuY3Rpb24oKXtcbiAgcmV0dXJuIHRoaXMuZWxzLmxlbmd0aDtcbn07XG5cbi8qKlxuICogUmV0dXJuIGVsZW1lbnQgdGV4dC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtTdHJpbmd8TGlzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuTGlzdC5wcm90b3R5cGUudGV4dCA9IGZ1bmN0aW9uKHN0cil7XG4gIC8vIFRPRE86IHJlYWwgaW1wbFxuICBpZiAoMSA9PSBhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKGVsKXtcbiAgICAgIGVsLnRleHRDb250ZW50ID0gc3RyO1xuICAgIH0pO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgdmFyIHN0ciA9ICcnO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZWxzLmxlbmd0aDsgKytpKSB7XG4gICAgc3RyICs9IHRoaXMuZWxzW2ldLnRleHRDb250ZW50O1xuICB9XG4gIHJldHVybiBzdHI7XG59O1xuXG4vKipcbiAqIFJldHVybiBlbGVtZW50IGh0bWwuXG4gKlxuICogQHJldHVybiB7U3RyaW5nfSBodG1sXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkxpc3QucHJvdG90eXBlLmh0bWwgPSBmdW5jdGlvbihodG1sKXtcbiAgaWYgKDEgPT0gYXJndW1lbnRzLmxlbmd0aCkge1xuICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbihlbCl7XG4gICAgICBlbC5pbm5lckhUTUwgPSBodG1sO1xuICAgIH0pO1xuICB9XG4gIC8vIFRPRE86IHJlYWwgaW1wbFxuICByZXR1cm4gdGhpcy5lbHNbMF0gJiYgdGhpcy5lbHNbMF0uaW5uZXJIVE1MO1xufTtcblxuLyoqXG4gKiBCaW5kIHRvIGBldmVudGAgYW5kIGludm9rZSBgZm4oZSlgLiBXaGVuXG4gKiBhIGBzZWxlY3RvcmAgaXMgZ2l2ZW4gdGhlbiBldmVudHMgYXJlIGRlbGVnYXRlZC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEBwYXJhbSB7U3RyaW5nfSBbc2VsZWN0b3JdXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHBhcmFtIHtCb29sZWFufSBjYXB0dXJlXG4gKiBAcmV0dXJuIHtMaXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5MaXN0LnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uKGV2ZW50LCBzZWxlY3RvciwgZm4sIGNhcHR1cmUpe1xuICBpZiAoJ3N0cmluZycgPT0gdHlwZW9mIHNlbGVjdG9yKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmVscy5sZW5ndGg7ICsraSkge1xuICAgICAgZm4uX2RlbGVnYXRlID0gZGVsZWdhdGUuYmluZCh0aGlzLmVsc1tpXSwgc2VsZWN0b3IsIGV2ZW50LCBmbiwgY2FwdHVyZSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgY2FwdHVyZSA9IGZuO1xuICBmbiA9IHNlbGVjdG9yO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5lbHMubGVuZ3RoOyArK2kpIHtcbiAgICBldmVudHMuYmluZCh0aGlzLmVsc1tpXSwgZXZlbnQsIGZuLCBjYXB0dXJlKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBVbmJpbmQgdG8gYGV2ZW50YCBhbmQgaW52b2tlIGBmbihlKWAuIFdoZW5cbiAqIGEgYHNlbGVjdG9yYCBpcyBnaXZlbiB0aGVuIGRlbGVnYXRlZCBldmVudFxuICogaGFuZGxlcnMgYXJlIHVuYm91bmQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge1N0cmluZ30gW3NlbGVjdG9yXVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gY2FwdHVyZVxuICogQHJldHVybiB7TGlzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuTGlzdC5wcm90b3R5cGUub2ZmID0gZnVuY3Rpb24oZXZlbnQsIHNlbGVjdG9yLCBmbiwgY2FwdHVyZSl7XG4gIGlmICgnc3RyaW5nJyA9PSB0eXBlb2Ygc2VsZWN0b3IpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZWxzLmxlbmd0aDsgKytpKSB7XG4gICAgICAvLyBUT0RPOiBhZGQgc2VsZWN0b3Igc3VwcG9ydCBiYWNrXG4gICAgICBkZWxlZ2F0ZS51bmJpbmQodGhpcy5lbHNbaV0sIGV2ZW50LCBmbi5fZGVsZWdhdGUsIGNhcHR1cmUpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGNhcHR1cmUgPSBmbjtcbiAgZm4gPSBzZWxlY3RvcjtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZWxzLmxlbmd0aDsgKytpKSB7XG4gICAgZXZlbnRzLnVuYmluZCh0aGlzLmVsc1tpXSwgZXZlbnQsIGZuLCBjYXB0dXJlKTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogSXRlcmF0ZSBlbGVtZW50cyBhbmQgaW52b2tlIGBmbihsaXN0LCBpKWAuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge0xpc3R9IHNlbGZcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuTGlzdC5wcm90b3R5cGUuZWFjaCA9IGZ1bmN0aW9uKGZuKXtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmVscy5sZW5ndGg7ICsraSkge1xuICAgIGZuKG5ldyBMaXN0KFt0aGlzLmVsc1tpXV0sIHRoaXMuc2VsZWN0b3IpLCBpKTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogSXRlcmF0ZSBlbGVtZW50cyBhbmQgaW52b2tlIGBmbihlbCwgaSlgLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtMaXN0fSBzZWxmXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkxpc3QucHJvdG90eXBlLmZvckVhY2ggPSBmdW5jdGlvbihmbil7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5lbHMubGVuZ3RoOyArK2kpIHtcbiAgICBmbih0aGlzLmVsc1tpXSwgaSk7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIE1hcCBlbGVtZW50cyBpbnZva2luZyBgZm4obGlzdCwgaSlgLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuTGlzdC5wcm90b3R5cGUubWFwID0gZnVuY3Rpb24oZm4pe1xuICB2YXIgYXJyID0gW107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5lbHMubGVuZ3RoOyArK2kpIHtcbiAgICBhcnIucHVzaChmbihuZXcgTGlzdChbdGhpcy5lbHNbaV1dLCB0aGlzLnNlbGVjdG9yKSwgaSkpO1xuICB9XG4gIHJldHVybiBhcnI7XG59O1xuXG4vKipcbiAqIEZpbHRlciBlbGVtZW50cyBpbnZva2luZyBgZm4obGlzdCwgaSlgLCByZXR1cm5pbmdcbiAqIGEgbmV3IGBMaXN0YCBvZiBlbGVtZW50cyB3aGVuIGEgdHJ1dGh5IHZhbHVlIGlzIHJldHVybmVkLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtMaXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5MaXN0LnByb3RvdHlwZS5zZWxlY3QgPVxuTGlzdC5wcm90b3R5cGUuZmlsdGVyID0gZnVuY3Rpb24oZm4pe1xuICB2YXIgZWw7XG4gIHZhciBsaXN0ID0gbmV3IExpc3QoW10sIHRoaXMuc2VsZWN0b3IpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZWxzLmxlbmd0aDsgKytpKSB7XG4gICAgZWwgPSB0aGlzLmVsc1tpXTtcbiAgICBpZiAoZm4obmV3IExpc3QoW2VsXSwgdGhpcy5zZWxlY3RvciksIGkpKSBsaXN0LmVscy5wdXNoKGVsKTtcbiAgfVxuICByZXR1cm4gbGlzdDtcbn07XG5cbi8qKlxuICogRmlsdGVyIGVsZW1lbnRzIGludm9raW5nIGBmbihsaXN0LCBpKWAsIHJldHVybmluZ1xuICogYSBuZXcgYExpc3RgIG9mIGVsZW1lbnRzIHdoZW4gYSBmYWxzZXkgdmFsdWUgaXMgcmV0dXJuZWQuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge0xpc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkxpc3QucHJvdG90eXBlLnJlamVjdCA9IGZ1bmN0aW9uKGZuKXtcbiAgdmFyIGVsO1xuICB2YXIgbGlzdCA9IG5ldyBMaXN0KFtdLCB0aGlzLnNlbGVjdG9yKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmVscy5sZW5ndGg7ICsraSkge1xuICAgIGVsID0gdGhpcy5lbHNbaV07XG4gICAgaWYgKCFmbihuZXcgTGlzdChbZWxdLCB0aGlzLnNlbGVjdG9yKSwgaSkpIGxpc3QuZWxzLnB1c2goZWwpO1xuICB9XG4gIHJldHVybiBsaXN0O1xufTtcblxuLyoqXG4gKiBBZGQgdGhlIGdpdmVuIGNsYXNzIGBuYW1lYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICogQHJldHVybiB7TGlzdH0gc2VsZlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5MaXN0LnByb3RvdHlwZS5hZGRDbGFzcyA9IGZ1bmN0aW9uKG5hbWUpe1xuICB2YXIgZWw7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5lbHMubGVuZ3RoOyArK2kpIHtcbiAgICBlbCA9IHRoaXMuZWxzW2ldO1xuICAgIGVsLl9jbGFzc2VzID0gZWwuX2NsYXNzZXMgfHwgY2xhc3NlcyhlbCk7XG4gICAgZWwuX2NsYXNzZXMuYWRkKG5hbWUpO1xuICB9XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgdGhlIGdpdmVuIGNsYXNzIGBuYW1lYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xSZWdFeHB9IG5hbWVcbiAqIEByZXR1cm4ge0xpc3R9IHNlbGZcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuTGlzdC5wcm90b3R5cGUucmVtb3ZlQ2xhc3MgPSBmdW5jdGlvbihuYW1lKXtcbiAgdmFyIGVsO1xuXG4gIGlmICgncmVnZXhwJyA9PSB0eXBlKG5hbWUpKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmVscy5sZW5ndGg7ICsraSkge1xuICAgICAgZWwgPSB0aGlzLmVsc1tpXTtcbiAgICAgIGVsLl9jbGFzc2VzID0gZWwuX2NsYXNzZXMgfHwgY2xhc3NlcyhlbCk7XG4gICAgICB2YXIgYXJyID0gZWwuX2NsYXNzZXMuYXJyYXkoKTtcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgYXJyLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIGlmIChuYW1lLnRlc3QoYXJyW2pdKSkge1xuICAgICAgICAgIGVsLl9jbGFzc2VzLnJlbW92ZShhcnJbal0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmVscy5sZW5ndGg7ICsraSkge1xuICAgIGVsID0gdGhpcy5lbHNbaV07XG4gICAgZWwuX2NsYXNzZXMgPSBlbC5fY2xhc3NlcyB8fCBjbGFzc2VzKGVsKTtcbiAgICBlbC5fY2xhc3Nlcy5yZW1vdmUobmFtZSk7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogVG9nZ2xlIHRoZSBnaXZlbiBjbGFzcyBgbmFtZWAsXG4gKiBvcHRpb25hbGx5IGEgYGJvb2xgIG1heSBiZSBnaXZlblxuICogdG8gaW5kaWNhdGUgdGhhdCB0aGUgY2xhc3Mgc2hvdWxkXG4gKiBiZSBhZGRlZCB3aGVuIHRydXRoeS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICogQHBhcmFtIHtCb29sZWFufSBib29sXG4gKiBAcmV0dXJuIHtMaXN0fSBzZWxmXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkxpc3QucHJvdG90eXBlLnRvZ2dsZUNsYXNzID0gZnVuY3Rpb24obmFtZSwgYm9vbCl7XG4gIHZhciBlbDtcbiAgdmFyIGZuID0gJ3RvZ2dsZSc7XG5cbiAgLy8gdG9nZ2xlIHdpdGggYm9vbGVhblxuICBpZiAoMiA9PSBhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgZm4gPSBib29sID8gJ2FkZCcgOiAncmVtb3ZlJztcbiAgfVxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5lbHMubGVuZ3RoOyArK2kpIHtcbiAgICBlbCA9IHRoaXMuZWxzW2ldO1xuICAgIGVsLl9jbGFzc2VzID0gZWwuX2NsYXNzZXMgfHwgY2xhc3NlcyhlbCk7XG4gICAgZWwuX2NsYXNzZXNbZm5dKG5hbWUpO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIENoZWNrIGlmIHRoZSBnaXZlbiBjbGFzcyBgbmFtZWAgaXMgcHJlc2VudC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuTGlzdC5wcm90b3R5cGUuaGFzQ2xhc3MgPSBmdW5jdGlvbihuYW1lKXtcbiAgdmFyIGVsO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZWxzLmxlbmd0aDsgKytpKSB7XG4gICAgZWwgPSB0aGlzLmVsc1tpXTtcbiAgICBlbC5fY2xhc3NlcyA9IGVsLl9jbGFzc2VzIHx8IGNsYXNzZXMoZWwpO1xuICAgIGlmIChlbC5fY2xhc3Nlcy5oYXMobmFtZSkpIHJldHVybiB0cnVlO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn07XG5cbi8qKlxuICogU2V0IENTUyBgcHJvcGAgdG8gYHZhbGAgb3IgZ2V0IGBwcm9wYCB2YWx1ZS5cbiAqIEFsc28gYWNjZXB0cyBhbiBvYmplY3QgKGBwcm9wYDogYHZhbGApXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHByb3BcbiAqIEBwYXJhbSB7TWl4ZWR9IHZhbFxuICogQHJldHVybiB7TGlzdHxTdHJpbmd9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkxpc3QucHJvdG90eXBlLmNzcyA9IGZ1bmN0aW9uKHByb3AsIHZhbCl7XG4gIGlmICgyID09IGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICB2YXIgb2JqID0ge307XG4gICAgb2JqW3Byb3BdID0gdmFsO1xuICAgIHJldHVybiB0aGlzLnNldFN0eWxlKG9iaik7XG4gIH1cblxuICBpZiAoJ29iamVjdCcgPT0gdHlwZShwcm9wKSkge1xuICAgIHJldHVybiB0aGlzLnNldFN0eWxlKHByb3ApO1xuICB9XG5cbiAgcmV0dXJuIHRoaXMuZ2V0U3R5bGUocHJvcCk7XG59O1xuXG4vKipcbiAqIFNldCBDU1MgYHByb3BzYC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gcHJvcHNcbiAqIEByZXR1cm4ge0xpc3R9IHNlbGZcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbkxpc3QucHJvdG90eXBlLnNldFN0eWxlID0gZnVuY3Rpb24ocHJvcHMpe1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZWxzLmxlbmd0aDsgKytpKSB7XG4gICAgY3NzKHRoaXMuZWxzW2ldLCBwcm9wcyk7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEdldCBDU1MgYHByb3BgIHZhbHVlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBwcm9wXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5MaXN0LnByb3RvdHlwZS5nZXRTdHlsZSA9IGZ1bmN0aW9uKHByb3Ape1xuICB2YXIgZWwgPSB0aGlzLmVsc1swXTtcbiAgaWYgKGVsKSByZXR1cm4gZWwuc3R5bGVbcHJvcF07XG59O1xuXG4vKipcbiAqIEZpbmQgY2hpbGRyZW4gbWF0Y2hpbmcgdGhlIGdpdmVuIGBzZWxlY3RvcmAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHNlbGVjdG9yXG4gKiBAcmV0dXJuIHtMaXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5MaXN0LnByb3RvdHlwZS5maW5kID0gZnVuY3Rpb24oc2VsZWN0b3Ipe1xuICByZXR1cm4gZG9tKHNlbGVjdG9yLCB0aGlzKTtcbn07XG5cbi8qKlxuICogRW1wdHkgdGhlIGRvbSBsaXN0XG4gKlxuICogQHJldHVybiBzZWxmXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkxpc3QucHJvdG90eXBlLmVtcHR5ID0gZnVuY3Rpb24oKXtcbiAgdmFyIGVsZW0sIGVsO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5lbHMubGVuZ3RoOyArK2kpIHtcbiAgICBlbCA9IHRoaXMuZWxzW2ldO1xuICAgIHdoaWxlIChlbC5maXJzdENoaWxkKSB7XG4gICAgICBlbC5yZW1vdmVDaGlsZChlbC5maXJzdENoaWxkKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn1cblxuLyoqXG4gKiBDaGVjayBpZiB0aGUgZmlyc3QgZWxlbWVudCBtYXRjaGVzIGBzZWxlY3RvcmAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHNlbGVjdG9yXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5MaXN0LnByb3RvdHlwZS5pcyA9IGZ1bmN0aW9uKHNlbGVjdG9yKXtcbiAgcmV0dXJuIG1hdGNoZXModGhpcy5nZXQoMCksIHNlbGVjdG9yKTtcbn07XG5cbi8qKlxuICogR2V0IHBhcmVudChzKSB3aXRoIG9wdGlvbmFsIGBzZWxlY3RvcmAgYW5kIGBsaW1pdGBcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc2VsZWN0b3JcbiAqIEBwYXJhbSB7TnVtYmVyfSBsaW1pdFxuICogQHJldHVybiB7TGlzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuTGlzdC5wcm90b3R5cGUucGFyZW50ID0gZnVuY3Rpb24oc2VsZWN0b3IsIGxpbWl0KXtcbiAgcmV0dXJuIG5ldyBMaXN0KHRyYXZlcnNlKCdwYXJlbnROb2RlJyxcbiAgICB0aGlzLmdldCgwKSxcbiAgICBzZWxlY3RvcixcbiAgICBsaW1pdFxuICAgIHx8IDEpKTtcbn07XG5cbi8qKlxuICogR2V0IG5leHQgZWxlbWVudChzKSB3aXRoIG9wdGlvbmFsIGBzZWxlY3RvcmAgYW5kIGBsaW1pdGAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHNlbGVjdG9yXG4gKiBAcGFyYW0ge051bWJlcn0gbGltaXRcbiAqIEByZXRydW4ge0xpc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkxpc3QucHJvdG90eXBlLm5leHQgPSBmdW5jdGlvbihzZWxlY3RvciwgbGltaXQpe1xuICByZXR1cm4gbmV3IExpc3QodHJhdmVyc2UoJ25leHRTaWJsaW5nJyxcbiAgICB0aGlzLmdldCgwKSxcbiAgICBzZWxlY3RvcixcbiAgICBsaW1pdFxuICAgIHx8IDEpKTtcbn07XG5cbi8qKlxuICogR2V0IHByZXZpb3VzIGVsZW1lbnQocykgd2l0aCBvcHRpb25hbCBgc2VsZWN0b3JgIGFuZCBgbGltaXRgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzZWxlY3RvclxuICogQHBhcmFtIHtOdW1iZXJ9IGxpbWl0XG4gKiBAcmV0dXJuIHtMaXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5MaXN0LnByb3RvdHlwZS5wcmV2ID1cbkxpc3QucHJvdG90eXBlLnByZXZpb3VzID0gZnVuY3Rpb24oc2VsZWN0b3IsIGxpbWl0KXtcbiAgcmV0dXJuIG5ldyBMaXN0KHRyYXZlcnNlKCdwcmV2aW91c1NpYmxpbmcnLFxuICAgIHRoaXMuZ2V0KDApLFxuICAgIHNlbGVjdG9yLFxuICAgIGxpbWl0XG4gICAgfHwgMSkpO1xufTtcblxuLyoqXG4gKiBBdHRyaWJ1dGUgYWNjZXNzb3JzLlxuICovXG5cbmF0dHJzLmZvckVhY2goZnVuY3Rpb24obmFtZSl7XG4gIExpc3QucHJvdG90eXBlW25hbWVdID0gZnVuY3Rpb24odmFsKXtcbiAgICBpZiAoMCA9PSBhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gdGhpcy5hdHRyKG5hbWUpO1xuICAgIHJldHVybiB0aGlzLmF0dHIobmFtZSwgdmFsKTtcbiAgfTtcbn0pO1xuXG4iLCIvKipcbiAqIE1vZHVsZSBEZXBlbmRlbmNpZXNcbiAqL1xuXG52YXIgZGVidWcgPSByZXF1aXJlKCdkZWJ1ZycpKCdjc3MnKTtcbnZhciBzZXQgPSByZXF1aXJlKCcuL2xpYi9zdHlsZScpO1xudmFyIGdldCA9IHJlcXVpcmUoJy4vbGliL2NzcycpO1xuXG4vKipcbiAqIEV4cG9zZSBgY3NzYFxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gY3NzO1xuXG4vKipcbiAqIEdldCBhbmQgc2V0IGNzcyB2YWx1ZXNcbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gKiBAcGFyYW0ge1N0cmluZ3xPYmplY3R9IHByb3BcbiAqIEBwYXJhbSB7TWl4ZWR9IHZhbFxuICogQHJldHVybiB7RWxlbWVudH0gZWxcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gY3NzKGVsLCBwcm9wLCB2YWwpIHtcbiAgaWYgKCFlbCkgcmV0dXJuO1xuXG4gIGlmICh1bmRlZmluZWQgIT09IHZhbCkge1xuICAgIHZhciBvYmogPSB7fTtcbiAgICBvYmpbcHJvcF0gPSB2YWw7XG4gICAgZGVidWcoJ3NldHRpbmcgc3R5bGVzICVqJywgb2JqKTtcbiAgICByZXR1cm4gc2V0U3R5bGVzKGVsLCBvYmopO1xuICB9XG5cbiAgaWYgKCdvYmplY3QnID09IHR5cGVvZiBwcm9wKSB7XG4gICAgZGVidWcoJ3NldHRpbmcgc3R5bGVzICVqJywgcHJvcCk7XG4gICAgcmV0dXJuIHNldFN0eWxlcyhlbCwgcHJvcCk7XG4gIH1cblxuICBkZWJ1ZygnZ2V0dGluZyAlcycsIHByb3ApO1xuICByZXR1cm4gZ2V0KGVsLCBwcm9wKTtcbn1cblxuLyoqXG4gKiBTZXQgdGhlIHN0eWxlcyBvbiBhbiBlbGVtZW50XG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbFxuICogQHBhcmFtIHtPYmplY3R9IHByb3BzXG4gKiBAcmV0dXJuIHtFbGVtZW50fSBlbFxuICovXG5cbmZ1bmN0aW9uIHNldFN0eWxlcyhlbCwgcHJvcHMpIHtcbiAgZm9yICh2YXIgcHJvcCBpbiBwcm9wcykge1xuICAgIHNldChlbCwgcHJvcCwgcHJvcHNbcHJvcF0pO1xuICB9XG5cbiAgcmV0dXJuIGVsO1xufVxuIiwiXG52YXIgcHJlZml4ID0gcmVxdWlyZSgncHJlZml4JylcbnZhciBNb3ZlID0gcmVxdWlyZSgnLi9tb3ZlJylcblxudmFyIGF0dHJzID0gW1xuICAnY3gnLCAnY3knLFxuICAneCcsICAneScsXG4gICdkJ1xuXS5yZWR1Y2UoZnVuY3Rpb24oYXR0cnMsIGtleSl7XG4gIGF0dHJzW2tleV0gPSB0cnVlXG4gIHJldHVybiBhdHRyc1xufSwge30pXG5cbm1vZHVsZS5leHBvcnRzID0gTW92ZS5leHRlbmQoe1xuICBzZXQ6IGZ1bmN0aW9uKGssIHYpe1xuICAgIGlmICghKGsgaW4gYXR0cnMpKSBrID0gcHJlZml4KGspXG4gICAgdGhpcy5fdG9ba10gPSB2XG4gICAgcmV0dXJuIHRoaXNcbiAgfSxcbiAgY3VycmVudDogZnVuY3Rpb24oayl7XG4gICAgaWYgKGsgaW4gYXR0cnMpIHJldHVybiB0aGlzLmVsLmdldEF0dHJpYnV0ZShrKVxuICAgIHJldHVybiBnZXRDb21wdXRlZFN0eWxlKHRoaXMuZWwpW3ByZWZpeChrKV1cbiAgICAgIHx8IHRoaXMuZWwuZ2V0QXR0cmlidXRlKGspXG4gIH0sXG4gIHJlbmRlcjogZnVuY3Rpb24obil7XG4gICAgbiA9IHRoaXMuX2Vhc2UobilcbiAgICB2YXIgdHdlZW5zID0gdGhpcy50d2VlbnNcbiAgICB2YXIgc3R5bGUgPSB0aGlzLmVsLnN0eWxlXG4gICAgZm9yICh2YXIgayBpbiB0d2VlbnMpIHtcbiAgICAgIGlmIChrIGluIGF0dHJzKSB0aGlzLmVsLnNldEF0dHJpYnV0ZShrLCB0d2VlbnNba10obikpXG4gICAgICBlbHNlIHRoaXMuZWwuc3R5bGVba10gPSB0d2VlbnNba10obilcbiAgICB9XG4gICAgLy8gSEFDSzogZm9yY2UgcmVkcmF3IGJlY2F1c2UgY2hyb21lIGhhcyBzb21lIGJ1Z2d5IG9wdGltaXNhdGlvbnNcbiAgICB0aGlzLmVsLm9mZnNldEhlaWdodCBcbiAgICByZXR1cm4gdGhpc1xuICB9XG59KVxuIiwiXG52YXIgQW5pbWF0aW9uID0gcmVxdWlyZSgnYW5pbWF0aW9uJylcbnZhciBsYXp5ID0gcmVxdWlyZSgnbGF6eS1wcm9wZXJ0eScpXG52YXIgdW5tYXRyaXggPSByZXF1aXJlKCd1bm1hdHJpeCcpXG52YXIgdHdlZW4gPSByZXF1aXJlKCcuL3R3ZWVuJylcbnZhciBwcmVmaXggPSByZXF1aXJlKCdwcmVmaXgnKVxudmFyIGNsb25lID0gcmVxdWlyZSgnY2xvbmUnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IE1vdmVcblxuLyoqXG4gKiAnd2Via2l0VHJhbnNmb3JtJyB8fCAnTW96VHJhbnNmb3JtJyBldGMuLlxuICogQHR5cGUge1N0cmluZ31cbiAqL1xuXG52YXIgdHJhbnNmb3JtID0gcHJlZml4KCd0cmFuc2Zvcm0nKVxuXG4vKipcbiAqIHRoZSBNb3ZlIGNsYXNzXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbFxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBNb3ZlKGVsKXtcbiAgdGhpcy5fdG8gPSB7fVxuICB0aGlzLmVsID0gZWxcbn1cblxuLyoqXG4gKiBpbmhlcml0IGZyb20gQW5pbWF0aW9uXG4gKi9cblxuQW5pbWF0aW9uLmV4dGVuZChNb3ZlKVxuXG4vKipcbiAqIGRlZmF1bHQgZHVyYXRpb25cbiAqL1xuXG5Nb3ZlLnByb3RvdHlwZS5kdXJhdGlvbignMzAwbXMnKVxuXG4vKipcbiAqIGFkZCBgcHJvcGAgdG8gYW5pbWF0aW9uLiBXaGVuIHRoZSBhbmltYXRpb24gaXMgcnVuXG4gKiBgcHJvcGAgd2lsbCBiZSB0d2VlbmVkIGZyb20gaXRzIGN1cnJlbnQgdmFsdWUgdG8gYHRvYFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBwcm9wXG4gKiBAcGFyYW0ge0NTU30gdG9cbiAqIEByZXR1cm4ge3RoaXN9XG4gKi9cblxuTW92ZS5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24ocHJvcCwgdG8pe1xuICB0aGlzLl90b1twcmVmaXgocHJvcCldID0gdG9cbiAgcmV0dXJuIHRoaXNcbn1cblxuLyoqXG4gKiBpbmNyZW1lbnQgYHByb3BgIGJ5IGBuYFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBwcm9wXG4gKiBAcGFyYW0ge051bWJlcn0gdG9cbiAqIEByZXR1cm4ge3RoaXN9XG4gKi9cblxuTW92ZS5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24ocHJvcCwgbil7XG4gIHByb3AgPSBwcmVmaXgocHJvcClcbiAgdmFyIGN1cnIgPSBwYXJzZUludCh0aGlzLmN1cnJlbnQocHJvcCksIDEwKVxuICByZXR1cm4gdGhpcy5zZXQocHJvcCwgY3VyciArIG4pXG59XG5cbi8qKlxuICogZGVjcmVtZW50IGBwcm9wYCBieSBgbmBcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gcHJvcFxuICogQHBhcmFtIHtOdW1iZXJ9IHRvXG4gKiBAcmV0dXJuIHt0aGlzfVxuICovXG5cbk1vdmUucHJvdG90eXBlLnN1YiA9IGZ1bmN0aW9uKHByb3AsIG4pe1xuICBwcm9wID0gcHJlZml4KHByb3ApXG4gIHZhciBjdXJyID0gcGFyc2VJbnQodGhpcy5jdXJyZW50KHByb3ApLCAxMClcbiAgcmV0dXJuIHRoaXMuc2V0KHByb3AsIGN1cnIgLSBuKVxufVxuXG4vKipcbiAqIGdldCB0aGUgY3VycmVudCB2YWx1ZSBvZiBgcHJvcGBcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gcHJvcFxuICogQHJldHVybiB7Q1NTfVxuICovXG5cbk1vdmUucHJvdG90eXBlLmN1cnJlbnQgPSBmdW5jdGlvbihwcm9wKXtcbiAgcmV0dXJuIGdldENvbXB1dGVkU3R5bGUodGhpcy5lbClbcHJvcF1cbn1cblxuLyoqXG4gKiBTa2V3IGJ5IGBkZWdgXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IGRlZ1xuICogQHJldHVybiB7dGhpc31cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuTW92ZS5wcm90b3R5cGUuc2tldyA9IGZ1bmN0aW9uKGRlZyl7XG4gIHRoaXMubWF0cml4LnNrZXcgKz0gZGVnXG4gIHJldHVybiB0aGlzXG59XG5cbi8qKlxuICogVHJhbnNsYXRlIGB4YCBhbmQgYHlgIGF4aXMuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IHhcbiAqIEBwYXJhbSB7TnVtYmVyfSB5XG4gKiBAcGFyYW0ge051bWJlcn0gelxuICogQHJldHVybiB7dGhpc31cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuTW92ZS5wcm90b3R5cGUudHJhbnNsYXRlID0gZnVuY3Rpb24oeCwgeSl7XG4gIHRoaXMubWF0cml4LnRyYW5zbGF0ZVggKz0geFxuICB0aGlzLm1hdHJpeC50cmFuc2xhdGVZICs9IHlcbiAgcmV0dXJuIHRoaXNcbn1cblxuLyoqXG4gKiBUcmFuc2xhdGUgb24gdGhlIHggYXhpcyB0byBgbmAuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IG5cbiAqIEByZXR1cm4ge3RoaXN9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbk1vdmUucHJvdG90eXBlLnRyYW5zbGF0ZVggPVxuTW92ZS5wcm90b3R5cGUueCA9IGZ1bmN0aW9uKG4pe1xuICByZXR1cm4gdGhpcy50cmFuc2xhdGUobiwgMClcbn1cblxuLyoqXG4gKiBUcmFuc2xhdGUgb24gdGhlIHkgYXhpcyB0byBgbmAuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IG5cbiAqIEByZXR1cm4ge3RoaXN9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbk1vdmUucHJvdG90eXBlLnRyYW5zbGF0ZVkgPVxuTW92ZS5wcm90b3R5cGUueSA9IGZ1bmN0aW9uKG4pe1xuICByZXR1cm4gdGhpcy50cmFuc2xhdGUoMCwgbilcbn1cblxuLyoqXG4gKiBTY2FsZSB0aGUgeCBhbmQgeSBheGlzIGJ5IGB4YCwgb3JcbiAqIGluZGl2aWR1YWxseSBzY2FsZSBgeGAgYW5kIGB5YC5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0geFxuICogQHBhcmFtIHtOdW1iZXJ9IHlcbiAqIEByZXR1cm4ge3RoaXN9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbk1vdmUucHJvdG90eXBlLnNjYWxlID0gZnVuY3Rpb24oeCwgeSl7XG4gIGlmICh5ID09IG51bGwpIHkgPSB4XG4gIHRoaXMubWF0cml4LnNjYWxlWCAqPSB4XG4gIHRoaXMubWF0cml4LnNjYWxlWSAqPSB5XG4gIHJldHVybiB0aGlzXG59XG5cbi8qKlxuICogU2NhbGUgeCBheGlzIGJ5IGBuYC5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gblxuICogQHJldHVybiB7dGhpc31cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuTW92ZS5wcm90b3R5cGUuc2NhbGVYID0gZnVuY3Rpb24obil7XG4gIHJldHVybiB0aGlzLnNjYWxlKG4sIDEsIDEpXG59XG5cbi8qKlxuICogU2NhbGUgeSBheGlzIGJ5IGBuYC5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gblxuICogQHJldHVybiB7dGhpc31cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuTW92ZS5wcm90b3R5cGUuc2NhbGVZID0gZnVuY3Rpb24obil7XG4gIHJldHVybiB0aGlzLnNjYWxlKDEsIG4sIDEpXG59XG5cbi8qKlxuICogUm90YXRlIGBuYCBkZWdyZWVzLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBuXG4gKiBAcmV0dXJuIHt0aGlzfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5Nb3ZlLnByb3RvdHlwZS5yb3RhdGUgPSBmdW5jdGlvbihuKXtcbiAgdGhpcy5tYXRyaXgucm90YXRlICs9IG5cbiAgcmV0dXJuIHRoaXNcbn1cblxuLyoqXG4gKiBjc3MgdHJhbnNmb3JtYXRpb24gbWF0cml4IGZvciBgdGhpcy5lbGBcbiAqXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5sYXp5KE1vdmUucHJvdG90eXBlLCAnbWF0cml4JywgZnVuY3Rpb24oKXtcbiAgdmFyIG1hdHJpeCA9IHRoaXMuY3VycmVudCh0cmFuc2Zvcm0pXG4gIGlmICh0eXBlb2YgbWF0cml4ID09ICdzdHJpbmcnKSBtYXRyaXggPSB1bm1hdHJpeChtYXRyaXgpXG4gIHRoaXMuX3RvW3RyYW5zZm9ybV0gPSBtYXRyaXhcbiAgcmV0dXJuIG1hdHJpeFxufSlcblxuLyoqXG4gKiBnZW5lcmF0ZWQgdHdlZW5pbmcgZnVuY3Rpb25zXG4gKlxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxubGF6eShNb3ZlLnByb3RvdHlwZSwgJ3R3ZWVucycsIGZ1bmN0aW9uKCl7XG4gIHZhciB0d2VlbnMgPSB7fVxuICBmb3IgKHZhciBrZXkgaW4gdGhpcy5fdG8pIHtcbiAgICB0d2VlbnNba2V5XSA9IHR3ZWVuKGtleSwgdGhpcy5jdXJyZW50KGtleSksIHRoaXMuX3RvW2tleV0pXG4gIH1cbiAgcmV0dXJuIHR3ZWVuc1xufSlcblxuLyoqXG4gKiByZW5kZXIgdGhlIGFuaW1hdGlvbiBhdCBjb21wbGV0aW9uIGxldmVsIGBuYFxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBuXG4gKiBAcmV0dXJuIHt0aGlzfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5Nb3ZlLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbihuKXtcbiAgbiA9IHRoaXMuX2Vhc2UobilcbiAgdmFyIHR3ZWVucyA9IHRoaXMudHdlZW5zXG4gIHZhciBzdHlsZSA9IHRoaXMuZWwuc3R5bGVcbiAgZm9yICh2YXIgayBpbiB0d2VlbnMpIHN0eWxlW2tdID0gdHdlZW5zW2tdKG4pXG4gIHJldHVybiB0aGlzXG59XG5cbi8qKlxuICogQ3JlYXRlIGEgbmV3IE1vdmUgaW5zdGFuY2Ugd2hpY2ggd2lsbCBydW5cbiAqIHdoZW4gYHRoaXNgIG1vdmUgY29tcGxldGVzLiBPcHRpb25hbGx5IHlvdSBjYW5cbiAqIHBhc3MgaW4gYSBNb3ZlIGluc3RhbmNlIG9yIEZ1bmN0aW9uIHRvIGJlIHJ1blxuICogb24gY29tcGxldGlvbiBvZiBgdGhpc2AgYW5pbWF0aW9uLlxuICpcbiAqIEBwYXJhbSB7TW92ZXxGdW5jdGlvbn0gW21vdmVdXG4gKiBAcmV0dXJuIHt0aGlzfERlZmVycmVkTW92ZX1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuTW92ZS5wcm90b3R5cGUudGhlbiA9IGZ1bmN0aW9uKG1vdmUpe1xuICBpZiAobW92ZSkge1xuICAgIHZhciBmbiAgPSB0eXBlb2YgbW92ZSAhPSAnZnVuY3Rpb24nXG4gICAgICA/IGZ1bmN0aW9uKCl7IG1vdmUucnVuKCkgfVxuICAgICAgOiBtb3ZlXG4gICAgdGhpcy5vbignZW5kJywgZm4pXG4gICAgdGhpcy5ydW5uaW5nIHx8IHRoaXMucGFyZW50IHx8IHRoaXMucnVuKClcbiAgICByZXR1cm4gdGhpc1xuICB9XG4gIG1vdmUgPSBkZWZlcih0aGlzKVxuICB0aGlzLnRoZW4obW92ZSlcbiAgcmV0dXJuIG1vdmVcbn1cblxuLyoqXG4gKiBjcmVhdGUgYSBzcGVjaWFsaXplZCBzdWItY2xhc3Mgb2YgYE1vdmVgIGZvciB1c2VcbiAqIGluIGB0aGVuKClgXG4gKlxuICogQHBhcmFtIHtNb3ZlfSBwYXJlbnRcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGRlZmVyKHBhcmVudCl7XG4gIHZhciBjaGlsZCA9IG5ldyBwYXJlbnQuY29uc3RydWN0b3IocGFyZW50LmVsKVxuICBjaGlsZC5fZHVyYXRpb24gPSBwYXJlbnQuX2R1cmF0aW9uXG4gIGNoaWxkLl9lYXNlID0gcGFyZW50Ll9lYXNlXG4gIGNoaWxkLnBhcmVudCA9IHBhcmVudFxuICBjaGlsZC5jdXJyZW50ID0gZnVuY3Rpb24ocHJvcCl7XG4gICAgdmFyIGFuaW0gPSB0aGlzLnBhcmVudFxuICAgIGRvIGlmIChwcm9wIGluIGFuaW0uX3RvKSByZXR1cm4gY2xvbmUoYW5pbS5fdG9bcHJvcF0pXG4gICAgd2hpbGUgKGFuaW0gPSBhbmltLnBhcmVudClcbiAgICByZXR1cm4gdGhpcy5jb25zdHJ1Y3Rvci5wcm90b3R5cGUuY3VycmVudC5jYWxsKHRoaXMsIHByb3ApXG4gIH1cbiAgcmV0dXJuIGNoaWxkXG59XG4iLCIvKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxudmFyIHF1ZXJ5ID0gcmVxdWlyZSgncXVlcnknKTtcblxuLyoqXG4gKiBFbGVtZW50IHByb3RvdHlwZS5cbiAqL1xuXG52YXIgcHJvdG8gPSBFbGVtZW50LnByb3RvdHlwZTtcblxuLyoqXG4gKiBWZW5kb3IgZnVuY3Rpb24uXG4gKi9cblxudmFyIHZlbmRvciA9IHByb3RvLm1hdGNoZXNcbiAgfHwgcHJvdG8ud2Via2l0TWF0Y2hlc1NlbGVjdG9yXG4gIHx8IHByb3RvLm1vek1hdGNoZXNTZWxlY3RvclxuICB8fCBwcm90by5tc01hdGNoZXNTZWxlY3RvclxuICB8fCBwcm90by5vTWF0Y2hlc1NlbGVjdG9yO1xuXG4vKipcbiAqIEV4cG9zZSBgbWF0Y2goKWAuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBtYXRjaDtcblxuLyoqXG4gKiBNYXRjaCBgZWxgIHRvIGBzZWxlY3RvcmAuXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbFxuICogQHBhcmFtIHtTdHJpbmd9IHNlbGVjdG9yXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBtYXRjaChlbCwgc2VsZWN0b3IpIHtcbiAgaWYgKHZlbmRvcikgcmV0dXJuIHZlbmRvci5jYWxsKGVsLCBzZWxlY3Rvcik7XG4gIHZhciBub2RlcyA9IHF1ZXJ5LmFsbChzZWxlY3RvciwgZWwucGFyZW50Tm9kZSk7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbm9kZXMubGVuZ3RoOyArK2kpIHtcbiAgICBpZiAobm9kZXNbaV0gPT0gZWwpIHJldHVybiB0cnVlO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cbiIsIlxuLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICovXG5cbnZhciBtYXRjaGVzID0gcmVxdWlyZSgnbWF0Y2hlcy1zZWxlY3RvcicpXG4gICwgZXZlbnQgPSByZXF1aXJlKCdldmVudCcpO1xuXG4vKipcbiAqIERlbGVnYXRlIGV2ZW50IGB0eXBlYCB0byBgc2VsZWN0b3JgXG4gKiBhbmQgaW52b2tlIGBmbihlKWAuIEEgY2FsbGJhY2sgZnVuY3Rpb25cbiAqIGlzIHJldHVybmVkIHdoaWNoIG1heSBiZSBwYXNzZWQgdG8gYC51bmJpbmQoKWAuXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbFxuICogQHBhcmFtIHtTdHJpbmd9IHNlbGVjdG9yXG4gKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gY2FwdHVyZVxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMuYmluZCA9IGZ1bmN0aW9uKGVsLCBzZWxlY3RvciwgdHlwZSwgZm4sIGNhcHR1cmUpe1xuICByZXR1cm4gZXZlbnQuYmluZChlbCwgdHlwZSwgZnVuY3Rpb24oZSl7XG4gICAgaWYgKG1hdGNoZXMoZS50YXJnZXQsIHNlbGVjdG9yKSkgZm4oZSk7XG4gIH0sIGNhcHR1cmUpO1xuICByZXR1cm4gY2FsbGJhY2s7XG59O1xuXG4vKipcbiAqIFVuYmluZCBldmVudCBgdHlwZWAncyBjYWxsYmFjayBgZm5gLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHBhcmFtIHtCb29sZWFufSBjYXB0dXJlXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMudW5iaW5kID0gZnVuY3Rpb24oZWwsIHR5cGUsIGZuLCBjYXB0dXJlKXtcbiAgZXZlbnQudW5iaW5kKGVsLCB0eXBlLCBmbiwgY2FwdHVyZSk7XG59O1xuIiwiXG4vKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxudmFyIGluZGV4ID0gcmVxdWlyZSgnaW5kZXhvZicpO1xuXG4vKipcbiAqIFdoaXRlc3BhY2UgcmVnZXhwLlxuICovXG5cbnZhciByZSA9IC9cXHMrLztcblxuLyoqXG4gKiB0b1N0cmluZyByZWZlcmVuY2UuXG4gKi9cblxudmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuLyoqXG4gKiBXcmFwIGBlbGAgaW4gYSBgQ2xhc3NMaXN0YC5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gKiBAcmV0dXJuIHtDbGFzc0xpc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZWwpe1xuICByZXR1cm4gbmV3IENsYXNzTGlzdChlbCk7XG59O1xuXG4vKipcbiAqIEluaXRpYWxpemUgYSBuZXcgQ2xhc3NMaXN0IGZvciBgZWxgLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIENsYXNzTGlzdChlbCkge1xuICB0aGlzLmVsID0gZWw7XG4gIHRoaXMubGlzdCA9IGVsLmNsYXNzTGlzdDtcbn1cblxuLyoqXG4gKiBBZGQgY2xhc3MgYG5hbWVgIGlmIG5vdCBhbHJlYWR5IHByZXNlbnQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAqIEByZXR1cm4ge0NsYXNzTGlzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuQ2xhc3NMaXN0LnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbihuYW1lKXtcbiAgLy8gY2xhc3NMaXN0XG4gIGlmICh0aGlzLmxpc3QpIHtcbiAgICB0aGlzLmxpc3QuYWRkKG5hbWUpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gZmFsbGJhY2tcbiAgdmFyIGFyciA9IHRoaXMuYXJyYXkoKTtcbiAgdmFyIGkgPSBpbmRleChhcnIsIG5hbWUpO1xuICBpZiAoIX5pKSBhcnIucHVzaChuYW1lKTtcbiAgdGhpcy5lbC5jbGFzc05hbWUgPSBhcnIuam9pbignICcpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmVtb3ZlIGNsYXNzIGBuYW1lYCB3aGVuIHByZXNlbnQsIG9yXG4gKiBwYXNzIGEgcmVndWxhciBleHByZXNzaW9uIHRvIHJlbW92ZVxuICogYW55IHdoaWNoIG1hdGNoLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfFJlZ0V4cH0gbmFtZVxuICogQHJldHVybiB7Q2xhc3NMaXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5DbGFzc0xpc3QucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uKG5hbWUpe1xuICBpZiAoJ1tvYmplY3QgUmVnRXhwXScgPT0gdG9TdHJpbmcuY2FsbChuYW1lKSkge1xuICAgIHJldHVybiB0aGlzLnJlbW92ZU1hdGNoaW5nKG5hbWUpO1xuICB9XG5cbiAgLy8gY2xhc3NMaXN0XG4gIGlmICh0aGlzLmxpc3QpIHtcbiAgICB0aGlzLmxpc3QucmVtb3ZlKG5hbWUpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gZmFsbGJhY2tcbiAgdmFyIGFyciA9IHRoaXMuYXJyYXkoKTtcbiAgdmFyIGkgPSBpbmRleChhcnIsIG5hbWUpO1xuICBpZiAofmkpIGFyci5zcGxpY2UoaSwgMSk7XG4gIHRoaXMuZWwuY2xhc3NOYW1lID0gYXJyLmpvaW4oJyAnKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBhbGwgY2xhc3NlcyBtYXRjaGluZyBgcmVgLlxuICpcbiAqIEBwYXJhbSB7UmVnRXhwfSByZVxuICogQHJldHVybiB7Q2xhc3NMaXN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuQ2xhc3NMaXN0LnByb3RvdHlwZS5yZW1vdmVNYXRjaGluZyA9IGZ1bmN0aW9uKHJlKXtcbiAgdmFyIGFyciA9IHRoaXMuYXJyYXkoKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAocmUudGVzdChhcnJbaV0pKSB7XG4gICAgICB0aGlzLnJlbW92ZShhcnJbaV0pO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogVG9nZ2xlIGNsYXNzIGBuYW1lYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICogQHJldHVybiB7Q2xhc3NMaXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5DbGFzc0xpc3QucHJvdG90eXBlLnRvZ2dsZSA9IGZ1bmN0aW9uKG5hbWUpe1xuICAvLyBjbGFzc0xpc3RcbiAgaWYgKHRoaXMubGlzdCkge1xuICAgIHRoaXMubGlzdC50b2dnbGUobmFtZSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyBmYWxsYmFja1xuICBpZiAodGhpcy5oYXMobmFtZSkpIHtcbiAgICB0aGlzLnJlbW92ZShuYW1lKTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLmFkZChuYW1lKTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmV0dXJuIGFuIGFycmF5IG9mIGNsYXNzZXMuXG4gKlxuICogQHJldHVybiB7QXJyYXl9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkNsYXNzTGlzdC5wcm90b3R5cGUuYXJyYXkgPSBmdW5jdGlvbigpe1xuICB2YXIgc3RyID0gdGhpcy5lbC5jbGFzc05hbWUucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpO1xuICB2YXIgYXJyID0gc3RyLnNwbGl0KHJlKTtcbiAgaWYgKCcnID09PSBhcnJbMF0pIGFyci5zaGlmdCgpO1xuICByZXR1cm4gYXJyO1xufTtcblxuLyoqXG4gKiBDaGVjayBpZiBjbGFzcyBgbmFtZWAgaXMgcHJlc2VudC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICogQHJldHVybiB7Q2xhc3NMaXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5DbGFzc0xpc3QucHJvdG90eXBlLmhhcyA9XG5DbGFzc0xpc3QucHJvdG90eXBlLmNvbnRhaW5zID0gZnVuY3Rpb24obmFtZSl7XG4gIHJldHVybiB0aGlzLmxpc3RcbiAgICA/IHRoaXMubGlzdC5jb250YWlucyhuYW1lKVxuICAgIDogISEgfmluZGV4KHRoaXMuYXJyYXkoKSwgbmFtZSk7XG59O1xuIiwiXG52YXIgaW5kZXhPZiA9IFtdLmluZGV4T2Y7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oYXJyLCBvYmope1xuICBpZiAoaW5kZXhPZikgcmV0dXJuIGFyci5pbmRleE9mKG9iaik7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgKytpKSB7XG4gICAgaWYgKGFycltpXSA9PT0gb2JqKSByZXR1cm4gaTtcbiAgfVxuICByZXR1cm4gLTE7XG59OyIsIlxuLyoqXG4gKiBFeHBvc2UgYHBhcnNlYC5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHBhcnNlO1xuXG4vKipcbiAqIFdyYXAgbWFwIGZyb20ganF1ZXJ5LlxuICovXG5cbnZhciBtYXAgPSB7XG4gIG9wdGlvbjogWzEsICc8c2VsZWN0IG11bHRpcGxlPVwibXVsdGlwbGVcIj4nLCAnPC9zZWxlY3Q+J10sXG4gIG9wdGdyb3VwOiBbMSwgJzxzZWxlY3QgbXVsdGlwbGU9XCJtdWx0aXBsZVwiPicsICc8L3NlbGVjdD4nXSxcbiAgbGVnZW5kOiBbMSwgJzxmaWVsZHNldD4nLCAnPC9maWVsZHNldD4nXSxcbiAgdGhlYWQ6IFsxLCAnPHRhYmxlPicsICc8L3RhYmxlPiddLFxuICB0Ym9keTogWzEsICc8dGFibGU+JywgJzwvdGFibGU+J10sXG4gIHRmb290OiBbMSwgJzx0YWJsZT4nLCAnPC90YWJsZT4nXSxcbiAgY29sZ3JvdXA6IFsxLCAnPHRhYmxlPicsICc8L3RhYmxlPiddLFxuICBjYXB0aW9uOiBbMSwgJzx0YWJsZT4nLCAnPC90YWJsZT4nXSxcbiAgdHI6IFsyLCAnPHRhYmxlPjx0Ym9keT4nLCAnPC90Ym9keT48L3RhYmxlPiddLFxuICB0ZDogWzMsICc8dGFibGU+PHRib2R5Pjx0cj4nLCAnPC90cj48L3Rib2R5PjwvdGFibGU+J10sXG4gIHRoOiBbMywgJzx0YWJsZT48dGJvZHk+PHRyPicsICc8L3RyPjwvdGJvZHk+PC90YWJsZT4nXSxcbiAgY29sOiBbMiwgJzx0YWJsZT48dGJvZHk+PC90Ym9keT48Y29sZ3JvdXA+JywgJzwvY29sZ3JvdXA+PC90YWJsZT4nXSxcbiAgX2RlZmF1bHQ6IFswLCAnJywgJyddXG59O1xuXG4vKipcbiAqIFBhcnNlIGBodG1sYCBhbmQgcmV0dXJuIHRoZSBjaGlsZHJlbi5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gaHRtbFxuICogQHJldHVybiB7QXJyYXl9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBwYXJzZShodG1sKSB7XG4gIGlmICgnc3RyaW5nJyAhPSB0eXBlb2YgaHRtbCkgdGhyb3cgbmV3IFR5cGVFcnJvcignU3RyaW5nIGV4cGVjdGVkJyk7XG5cbiAgLy8gdGFnIG5hbWVcbiAgdmFyIG0gPSAvPChbXFx3Ol0rKS8uZXhlYyhodG1sKTtcbiAgaWYgKCFtKSB0aHJvdyBuZXcgRXJyb3IoJ05vIGVsZW1lbnRzIHdlcmUgZ2VuZXJhdGVkLicpO1xuICB2YXIgdGFnID0gbVsxXTtcblxuICAvLyBib2R5IHN1cHBvcnRcbiAgaWYgKHRhZyA9PSAnYm9keScpIHtcbiAgICB2YXIgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdodG1sJyk7XG4gICAgZWwuaW5uZXJIVE1MID0gaHRtbDtcbiAgICByZXR1cm4gZWwucmVtb3ZlQ2hpbGQoZWwubGFzdENoaWxkKTtcbiAgfVxuXG4gIC8vIHdyYXAgbWFwXG4gIHZhciB3cmFwID0gbWFwW3RhZ10gfHwgbWFwLl9kZWZhdWx0O1xuICB2YXIgZGVwdGggPSB3cmFwWzBdO1xuICB2YXIgcHJlZml4ID0gd3JhcFsxXTtcbiAgdmFyIHN1ZmZpeCA9IHdyYXBbMl07XG4gIHZhciBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBlbC5pbm5lckhUTUwgPSBwcmVmaXggKyBodG1sICsgc3VmZml4O1xuICB3aGlsZSAoZGVwdGgtLSkgZWwgPSBlbC5sYXN0Q2hpbGQ7XG5cbiAgdmFyIGVscyA9IGVsLmNoaWxkcmVuO1xuICBpZiAoMSA9PSBlbHMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGVsLnJlbW92ZUNoaWxkKGVsc1swXSk7XG4gIH1cblxuICB2YXIgZnJhZ21lbnQgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gIHdoaWxlIChlbHMubGVuZ3RoKSB7XG4gICAgZnJhZ21lbnQuYXBwZW5kQ2hpbGQoZWwucmVtb3ZlQ2hpbGQoZWxzWzBdKSk7XG4gIH1cblxuICByZXR1cm4gZnJhZ21lbnQ7XG59XG4iLCJcbi8qKlxuICogQmluZCBgZWxgIGV2ZW50IGB0eXBlYCB0byBgZm5gLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHBhcmFtIHtCb29sZWFufSBjYXB0dXJlXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy5iaW5kID0gZnVuY3Rpb24oZWwsIHR5cGUsIGZuLCBjYXB0dXJlKXtcbiAgaWYgKGVsLmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgICBlbC5hZGRFdmVudExpc3RlbmVyKHR5cGUsIGZuLCBjYXB0dXJlKTtcbiAgfSBlbHNlIHtcbiAgICBlbC5hdHRhY2hFdmVudCgnb24nICsgdHlwZSwgZm4pO1xuICB9XG4gIHJldHVybiBmbjtcbn07XG5cbi8qKlxuICogVW5iaW5kIGBlbGAgZXZlbnQgYHR5cGVgJ3MgY2FsbGJhY2sgYGZuYC5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gY2FwdHVyZVxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMudW5iaW5kID0gZnVuY3Rpb24oZWwsIHR5cGUsIGZuLCBjYXB0dXJlKXtcbiAgaWYgKGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIpIHtcbiAgICBlbC5yZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGZuLCBjYXB0dXJlKTtcbiAgfSBlbHNlIHtcbiAgICBlbC5kZXRhY2hFdmVudCgnb24nICsgdHlwZSwgZm4pO1xuICB9XG4gIHJldHVybiBmbjtcbn07XG4iLCJcbi8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL1xuXG52YXIgdHlwZU9mID0gcmVxdWlyZSgndHlwZScpO1xuXG4vKipcbiAqIFNldCBvciBnZXQgYGVsYCdzJyB2YWx1ZS5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gKiBAcGFyYW0ge01peGVkfSB2YWxcbiAqIEByZXR1cm4ge01peGVkfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGVsLCB2YWwpe1xuICBpZiAoMiA9PSBhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gc2V0KGVsLCB2YWwpO1xuICByZXR1cm4gZ2V0KGVsKTtcbn07XG5cbi8qKlxuICogR2V0IGBlbGAncyB2YWx1ZS5cbiAqL1xuXG5mdW5jdGlvbiBnZXQoZWwpIHtcbiAgc3dpdGNoICh0eXBlKGVsKSkge1xuICAgIGNhc2UgJ2NoZWNrYm94JzpcbiAgICBjYXNlICdyYWRpbyc6XG4gICAgICBpZiAoZWwuY2hlY2tlZCkge1xuICAgICAgICB2YXIgYXR0ciA9IGVsLmdldEF0dHJpYnV0ZSgndmFsdWUnKTtcbiAgICAgICAgcmV0dXJuIG51bGwgPT0gYXR0ciA/IHRydWUgOiBhdHRyO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIGNhc2UgJ3JhZGlvZ3JvdXAnOlxuICAgICAgZm9yICh2YXIgaSA9IDAsIHJhZGlvOyByYWRpbyA9IGVsW2ldOyBpKyspIHtcbiAgICAgICAgaWYgKHJhZGlvLmNoZWNrZWQpIHJldHVybiByYWRpby52YWx1ZTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3NlbGVjdCc6XG4gICAgICBmb3IgKHZhciBpID0gMCwgb3B0aW9uOyBvcHRpb24gPSBlbC5vcHRpb25zW2ldOyBpKyspIHtcbiAgICAgICAgaWYgKG9wdGlvbi5zZWxlY3RlZCkgcmV0dXJuIG9wdGlvbi52YWx1ZTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZWwudmFsdWU7XG4gIH1cbn1cblxuLyoqXG4gKiBTZXQgYGVsYCdzIHZhbHVlLlxuICovXG5cbmZ1bmN0aW9uIHNldChlbCwgdmFsKSB7XG4gIHN3aXRjaCAodHlwZShlbCkpIHtcbiAgICBjYXNlICdjaGVja2JveCc6XG4gICAgY2FzZSAncmFkaW8nOlxuICAgICAgaWYgKHZhbCkge1xuICAgICAgICBlbC5jaGVja2VkID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVsLmNoZWNrZWQgPSBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3JhZGlvZ3JvdXAnOlxuICAgICAgZm9yICh2YXIgaSA9IDAsIHJhZGlvOyByYWRpbyA9IGVsW2ldOyBpKyspIHtcbiAgICAgICAgcmFkaW8uY2hlY2tlZCA9IHJhZGlvLnZhbHVlID09PSB2YWw7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdzZWxlY3QnOlxuICAgICAgZm9yICh2YXIgaSA9IDAsIG9wdGlvbjsgb3B0aW9uID0gZWwub3B0aW9uc1tpXTsgaSsrKSB7XG4gICAgICAgIG9wdGlvbi5zZWxlY3RlZCA9IG9wdGlvbi52YWx1ZSA9PT0gdmFsO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIGVsLnZhbHVlID0gdmFsO1xuICB9XG59XG5cbi8qKlxuICogRWxlbWVudCB0eXBlLlxuICovXG5cbmZ1bmN0aW9uIHR5cGUoZWwpIHtcbiAgdmFyIGdyb3VwID0gJ2FycmF5JyA9PSB0eXBlT2YoZWwpIHx8ICdvYmplY3QnID09IHR5cGVPZihlbCk7XG4gIGlmIChncm91cCkgZWwgPSBlbFswXTtcbiAgdmFyIG5hbWUgPSBlbC5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpO1xuICB2YXIgdHlwZSA9IGVsLmdldEF0dHJpYnV0ZSgndHlwZScpO1xuXG4gIGlmIChncm91cCAmJiB0eXBlICYmICdyYWRpbycgPT0gdHlwZS50b0xvd2VyQ2FzZSgpKSByZXR1cm4gJ3JhZGlvZ3JvdXAnO1xuICBpZiAoJ2lucHV0JyA9PSBuYW1lICYmIHR5cGUgJiYgJ2NoZWNrYm94JyA9PSB0eXBlLnRvTG93ZXJDYXNlKCkpIHJldHVybiAnY2hlY2tib3gnO1xuICBpZiAoJ2lucHV0JyA9PSBuYW1lICYmIHR5cGUgJiYgJ3JhZGlvJyA9PSB0eXBlLnRvTG93ZXJDYXNlKCkpIHJldHVybiAncmFkaW8nO1xuICBpZiAoJ3NlbGVjdCcgPT0gbmFtZSkgcmV0dXJuICdzZWxlY3QnO1xuICByZXR1cm4gbmFtZTtcbn1cbiIsIlxuZnVuY3Rpb24gb25lKHNlbGVjdG9yLCBlbCkge1xuICByZXR1cm4gZWwucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG59XG5cbmV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHNlbGVjdG9yLCBlbCl7XG4gIGVsID0gZWwgfHwgZG9jdW1lbnQ7XG4gIHJldHVybiBvbmUoc2VsZWN0b3IsIGVsKTtcbn07XG5cbmV4cG9ydHMuYWxsID0gZnVuY3Rpb24oc2VsZWN0b3IsIGVsKXtcbiAgZWwgPSBlbCB8fCBkb2N1bWVudDtcbiAgcmV0dXJuIGVsLnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xufTtcblxuZXhwb3J0cy5lbmdpbmUgPSBmdW5jdGlvbihvYmope1xuICBpZiAoIW9iai5vbmUpIHRocm93IG5ldyBFcnJvcignLm9uZSBjYWxsYmFjayByZXF1aXJlZCcpO1xuICBpZiAoIW9iai5hbGwpIHRocm93IG5ldyBFcnJvcignLmFsbCBjYWxsYmFjayByZXF1aXJlZCcpO1xuICBvbmUgPSBvYmoub25lO1xuICBleHBvcnRzLmFsbCA9IG9iai5hbGw7XG59O1xuIiwiXG4vKipcbiAqIHRvU3RyaW5nIHJlZi5cbiAqL1xuXG52YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG4vKipcbiAqIFJldHVybiB0aGUgdHlwZSBvZiBgdmFsYC5cbiAqXG4gKiBAcGFyYW0ge01peGVkfSB2YWxcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHVibGljXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih2YWwpe1xuICBzd2l0Y2ggKHRvU3RyaW5nLmNhbGwodmFsKSkge1xuICAgIGNhc2UgJ1tvYmplY3QgRnVuY3Rpb25dJzogcmV0dXJuICdmdW5jdGlvbic7XG4gICAgY2FzZSAnW29iamVjdCBEYXRlXSc6IHJldHVybiAnZGF0ZSc7XG4gICAgY2FzZSAnW29iamVjdCBSZWdFeHBdJzogcmV0dXJuICdyZWdleHAnO1xuICAgIGNhc2UgJ1tvYmplY3QgQXJndW1lbnRzXSc6IHJldHVybiAnYXJndW1lbnRzJztcbiAgICBjYXNlICdbb2JqZWN0IEFycmF5XSc6IHJldHVybiAnYXJyYXknO1xuICAgIGNhc2UgJ1tvYmplY3QgU3RyaW5nXSc6IHJldHVybiAnc3RyaW5nJztcbiAgfVxuXG4gIGlmICh2YWwgPT09IG51bGwpIHJldHVybiAnbnVsbCc7XG4gIGlmICh2YWwgPT09IHVuZGVmaW5lZCkgcmV0dXJuICd1bmRlZmluZWQnO1xuICBpZiAodmFsICYmIHZhbC5ub2RlVHlwZSA9PT0gMSkgcmV0dXJuICdlbGVtZW50JztcbiAgaWYgKHZhbCA9PT0gT2JqZWN0KHZhbCkpIHJldHVybiAnb2JqZWN0JztcblxuICByZXR1cm4gdHlwZW9mIHZhbDtcbn07XG4iLCJcbi8qKlxuICogUHJvcGVydGllcyB0byBpZ25vcmUgYXBwZW5kaW5nIFwicHhcIi5cbiAqL1xuXG52YXIgaWdub3JlID0ge1xuICBjb2x1bW5Db3VudDogdHJ1ZSxcbiAgZmlsbE9wYWNpdHk6IHRydWUsXG4gIGZvbnRXZWlnaHQ6IHRydWUsXG4gIGxpbmVIZWlnaHQ6IHRydWUsXG4gIG9wYWNpdHk6IHRydWUsXG4gIG9ycGhhbnM6IHRydWUsXG4gIHdpZG93czogdHJ1ZSxcbiAgekluZGV4OiB0cnVlLFxuICB6b29tOiB0cnVlXG59O1xuXG4vKipcbiAqIFNldCBgZWxgIGNzcyB2YWx1ZXMuXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbFxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHJldHVybiB7RWxlbWVudH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihlbCwgb2JqKXtcbiAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgIHZhciB2YWwgPSBvYmpba2V5XTtcbiAgICBpZiAoJ251bWJlcicgPT0gdHlwZW9mIHZhbCAmJiAhaWdub3JlW2tleV0pIHZhbCArPSAncHgnO1xuICAgIGVsLnN0eWxlW2tleV0gPSB2YWw7XG4gIH1cbiAgcmV0dXJuIGVsO1xufTtcbiIsImZ1bmN0aW9uIG9uZShzZWxlY3RvciwgZWwpIHtcbiAgcmV0dXJuIGVsLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xufVxuXG5leHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzZWxlY3RvciwgZWwpe1xuICBlbCA9IGVsIHx8IGRvY3VtZW50O1xuICByZXR1cm4gb25lKHNlbGVjdG9yLCBlbCk7XG59O1xuXG5leHBvcnRzLmFsbCA9IGZ1bmN0aW9uKHNlbGVjdG9yLCBlbCl7XG4gIGVsID0gZWwgfHwgZG9jdW1lbnQ7XG4gIHJldHVybiBlbC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcbn07XG5cbmV4cG9ydHMuZW5naW5lID0gZnVuY3Rpb24ob2JqKXtcbiAgaWYgKCFvYmoub25lKSB0aHJvdyBuZXcgRXJyb3IoJy5vbmUgY2FsbGJhY2sgcmVxdWlyZWQnKTtcbiAgaWYgKCFvYmouYWxsKSB0aHJvdyBuZXcgRXJyb3IoJy5hbGwgY2FsbGJhY2sgcmVxdWlyZWQnKTtcbiAgb25lID0gb2JqLm9uZTtcbiAgZXhwb3J0cy5hbGwgPSBvYmouYWxsO1xuICByZXR1cm4gZXhwb3J0cztcbn07XG4iLCJcbi8qKlxuICogZGVwZW5kZW5jaWVzXG4gKi9cblxudmFyIG1hdGNoZXMgPSByZXF1aXJlKCdtYXRjaGVzLXNlbGVjdG9yJyk7XG5cbi8qKlxuICogVHJhdmVyc2Ugd2l0aCB0aGUgZ2l2ZW4gYGVsYCwgYHNlbGVjdG9yYCBhbmQgYGxlbmAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7U3RyaW5nfSBzZWxlY3RvclxuICogQHBhcmFtIHtOdW1iZXJ9IGxlblxuICogQHJldHVybiB7QXJyYXl9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24odHlwZSwgZWwsIHNlbGVjdG9yLCBsZW4pe1xuICB2YXIgZWwgPSBlbFt0eXBlXVxuICAgICwgbiA9IGxlbiB8fCAxXG4gICAgLCByZXQgPSBbXTtcblxuICBpZiAoIWVsKSByZXR1cm4gcmV0O1xuXG4gIGRvIHtcbiAgICBpZiAobiA9PSByZXQubGVuZ3RoKSBicmVhaztcbiAgICBpZiAoMSAhPSBlbC5ub2RlVHlwZSkgY29udGludWU7XG4gICAgaWYgKG1hdGNoZXMoZWwsIHNlbGVjdG9yKSkgcmV0LnB1c2goZWwpO1xuICAgIGlmICghc2VsZWN0b3IpIHJldC5wdXNoKGVsKTtcbiAgfSB3aGlsZSAoZWwgPSBlbFt0eXBlXSk7XG5cbiAgcmV0dXJuIHJldDtcbn1cbiIsIi8qKlxuICogTW9kdWxlIERlcGVuZGVuY2llc1xuICovXG5cbnZhciBkZWJ1ZyA9IHJlcXVpcmUoJ2RlYnVnJykoJ2Nzczpjc3MnKTtcbnZhciBjYW1lbGNhc2UgPSByZXF1aXJlKCd0by1jYW1lbC1jYXNlJyk7XG52YXIgY29tcHV0ZWQgPSByZXF1aXJlKCcuL2NvbXB1dGVkJyk7XG52YXIgcHJvcGVydHkgPSByZXF1aXJlKCcuL3Byb3AnKTtcblxuLyoqXG4gKiBFeHBvc2UgYGNzc2BcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNzcztcblxuLyoqXG4gKiBDU1MgTm9ybWFsIFRyYW5zZm9ybXNcbiAqL1xuXG52YXIgY3NzTm9ybWFsVHJhbnNmb3JtID0ge1xuICBsZXR0ZXJTcGFjaW5nOiAwLFxuICBmb250V2VpZ2h0OiA0MDBcbn07XG5cbi8qKlxuICogR2V0IGEgQ1NTIHZhbHVlXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbFxuICogQHBhcmFtIHtTdHJpbmd9IHByb3BcbiAqIEBwYXJhbSB7TWl4ZWR9IGV4dHJhXG4gKiBAcGFyYW0ge0FycmF5fSBzdHlsZXNcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuXG5mdW5jdGlvbiBjc3MoZWwsIHByb3AsIGV4dHJhLCBzdHlsZXMpIHtcbiAgdmFyIGhvb2tzID0gcmVxdWlyZSgnLi9ob29rcycpO1xuICB2YXIgb3JpZyA9IGNhbWVsY2FzZShwcm9wKTtcbiAgdmFyIHN0eWxlID0gZWwuc3R5bGU7XG4gIHZhciB2YWw7XG5cbiAgcHJvcCA9IHByb3BlcnR5KHByb3AsIHN0eWxlKTtcbiAgdmFyIGhvb2sgPSBob29rc1twcm9wXSB8fCBob29rc1tvcmlnXTtcblxuICAvLyBJZiBhIGhvb2sgd2FzIHByb3ZpZGVkIGdldCB0aGUgY29tcHV0ZWQgdmFsdWUgZnJvbSB0aGVyZVxuICBpZiAoaG9vayAmJiBob29rLmdldCkge1xuICAgIGRlYnVnKCdnZXQgaG9vayBwcm92aWRlZC4gdXNlIHRoYXQnKTtcbiAgICB2YWwgPSBob29rLmdldChlbCwgdHJ1ZSwgZXh0cmEpO1xuICB9XG5cbiAgLy8gT3RoZXJ3aXNlLCBpZiBhIHdheSB0byBnZXQgdGhlIGNvbXB1dGVkIHZhbHVlIGV4aXN0cywgdXNlIHRoYXRcbiAgaWYgKHVuZGVmaW5lZCA9PSB2YWwpIHtcbiAgICBkZWJ1ZygnZmV0Y2ggdGhlIGNvbXB1dGVkIHZhbHVlIG9mICVzJywgcHJvcCk7XG4gICAgdmFsID0gY29tcHV0ZWQoZWwsIHByb3ApO1xuICB9XG5cbiAgaWYgKCdub3JtYWwnID09IHZhbCAmJiBjc3NOb3JtYWxUcmFuc2Zvcm1bcHJvcF0pIHtcbiAgICB2YWwgPSBjc3NOb3JtYWxUcmFuc2Zvcm1bcHJvcF07XG4gICAgZGVidWcoJ25vcm1hbCA9PiAlcycsIHZhbCk7XG4gIH1cblxuICAvLyBSZXR1cm4sIGNvbnZlcnRpbmcgdG8gbnVtYmVyIGlmIGZvcmNlZCBvciBhIHF1YWxpZmllciB3YXMgcHJvdmlkZWQgYW5kIHZhbCBsb29rcyBudW1lcmljXG4gIGlmICgnJyA9PSBleHRyYSB8fCBleHRyYSkge1xuICAgIGRlYnVnKCdjb252ZXJ0aW5nIHZhbHVlOiAlcyBpbnRvIGEgbnVtYmVyJyk7XG4gICAgdmFyIG51bSA9IHBhcnNlRmxvYXQodmFsKTtcbiAgICByZXR1cm4gdHJ1ZSA9PT0gZXh0cmEgfHwgaXNOdW1lcmljKG51bSkgPyBudW0gfHwgMCA6IHZhbDtcbiAgfVxuXG4gIHJldHVybiB2YWw7XG59XG5cbi8qKlxuICogSXMgTnVtZXJpY1xuICpcbiAqIEBwYXJhbSB7TWl4ZWR9IG9ialxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuXG5mdW5jdGlvbiBpc051bWVyaWMob2JqKSB7XG4gIHJldHVybiAhaXNOYW4ocGFyc2VGbG9hdChvYmopKSAmJiBpc0Zpbml0ZShvYmopO1xufVxuIiwiaWYgKCd1bmRlZmluZWQnID09IHR5cGVvZiB3aW5kb3cpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2xpYi9kZWJ1ZycpO1xufSBlbHNlIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2RlYnVnJyk7XG59XG4iLCIvKipcbiAqIE1vZHVsZSBEZXBlbmRlbmNpZXNcbiAqL1xuXG52YXIgZGVidWcgPSByZXF1aXJlKCdkZWJ1ZycpKCdjc3M6c3R5bGUnKTtcbnZhciBjYW1lbGNhc2UgPSByZXF1aXJlKCd0by1jYW1lbC1jYXNlJyk7XG52YXIgc3VwcG9ydCA9IHJlcXVpcmUoJy4vc3VwcG9ydCcpO1xudmFyIHByb3BlcnR5ID0gcmVxdWlyZSgnLi9wcm9wJyk7XG52YXIgaG9va3MgPSByZXF1aXJlKCcuL2hvb2tzJyk7XG5cbi8qKlxuICogRXhwb3NlIGBzdHlsZWBcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHN0eWxlO1xuXG4vKipcbiAqIFBvc3NpYmx5LXVuaXRsZXNzIHByb3BlcnRpZXNcbiAqXG4gKiBEb24ndCBhdXRvbWF0aWNhbGx5IGFkZCAncHgnIHRvIHRoZXNlIHByb3BlcnRpZXNcbiAqL1xuXG52YXIgY3NzTnVtYmVyID0ge1xuICBcImNvbHVtbkNvdW50XCI6IHRydWUsXG4gIFwiZmlsbE9wYWNpdHlcIjogdHJ1ZSxcbiAgXCJmb250V2VpZ2h0XCI6IHRydWUsXG4gIFwibGluZUhlaWdodFwiOiB0cnVlLFxuICBcIm9wYWNpdHlcIjogdHJ1ZSxcbiAgXCJvcmRlclwiOiB0cnVlLFxuICBcIm9ycGhhbnNcIjogdHJ1ZSxcbiAgXCJ3aWRvd3NcIjogdHJ1ZSxcbiAgXCJ6SW5kZXhcIjogdHJ1ZSxcbiAgXCJ6b29tXCI6IHRydWVcbn07XG5cbi8qKlxuICogU2V0IGEgY3NzIHZhbHVlXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbFxuICogQHBhcmFtIHtTdHJpbmd9IHByb3BcbiAqIEBwYXJhbSB7TWl4ZWR9IHZhbFxuICogQHBhcmFtIHtNaXhlZH0gZXh0cmFcbiAqL1xuXG5mdW5jdGlvbiBzdHlsZShlbCwgcHJvcCwgdmFsLCBleHRyYSkge1xuICAvLyBEb24ndCBzZXQgc3R5bGVzIG9uIHRleHQgYW5kIGNvbW1lbnQgbm9kZXNcbiAgaWYgKCFlbCB8fCBlbC5ub2RlVHlwZSA9PT0gMyB8fCBlbC5ub2RlVHlwZSA9PT0gOCB8fCAhZWwuc3R5bGUgKSByZXR1cm47XG5cbiAgdmFyIG9yaWcgPSBjYW1lbGNhc2UocHJvcCk7XG4gIHZhciBzdHlsZSA9IGVsLnN0eWxlO1xuICB2YXIgdHlwZSA9IHR5cGVvZiB2YWw7XG5cbiAgaWYgKCF2YWwpIHJldHVybiBnZXQoZWwsIHByb3AsIG9yaWcsIGV4dHJhKTtcblxuICBwcm9wID0gcHJvcGVydHkocHJvcCwgc3R5bGUpO1xuXG4gIHZhciBob29rID0gaG9va3NbcHJvcF0gfHwgaG9va3Nbb3JpZ107XG5cbiAgLy8gSWYgYSBudW1iZXIgd2FzIHBhc3NlZCBpbiwgYWRkICdweCcgdG8gdGhlIChleGNlcHQgZm9yIGNlcnRhaW4gQ1NTIHByb3BlcnRpZXMpXG4gIGlmICgnbnVtYmVyJyA9PSB0eXBlICYmICFjc3NOdW1iZXJbb3JpZ10pIHtcbiAgICBkZWJ1ZygnYWRkaW5nIFwicHhcIiB0byBlbmQgb2YgbnVtYmVyJyk7XG4gICAgdmFsICs9ICdweCc7XG4gIH1cblxuICAvLyBGaXhlcyBqUXVlcnkgIzg5MDgsIGl0IGNhbiBiZSBkb25lIG1vcmUgY29ycmVjdGx5IGJ5IHNwZWNpZnlpbmcgc2V0dGVycyBpbiBjc3NIb29rcyxcbiAgLy8gYnV0IGl0IHdvdWxkIG1lYW4gdG8gZGVmaW5lIGVpZ2h0IChmb3IgZXZlcnkgcHJvYmxlbWF0aWMgcHJvcGVydHkpIGlkZW50aWNhbCBmdW5jdGlvbnNcbiAgaWYgKCFzdXBwb3J0LmNsZWFyQ2xvbmVTdHlsZSAmJiAnJyA9PT0gdmFsICYmIDAgPT09IHByb3AuaW5kZXhPZignYmFja2dyb3VuZCcpKSB7XG4gICAgZGVidWcoJ3NldCBwcm9wZXJ0eSAoJXMpIHZhbHVlIHRvIFwiaW5oZXJpdFwiJywgcHJvcCk7XG4gICAgc3R5bGVbcHJvcF0gPSAnaW5oZXJpdCc7XG4gIH1cblxuICAvLyBJZiBhIGhvb2sgd2FzIHByb3ZpZGVkLCB1c2UgdGhhdCB2YWx1ZSwgb3RoZXJ3aXNlIGp1c3Qgc2V0IHRoZSBzcGVjaWZpZWQgdmFsdWVcbiAgaWYgKCFob29rIHx8ICFob29rLnNldCB8fCB1bmRlZmluZWQgIT09ICh2YWwgPSBob29rLnNldChlbCwgdmFsLCBleHRyYSkpKSB7XG4gICAgLy8gU3VwcG9ydDogQ2hyb21lLCBTYWZhcmlcbiAgICAvLyBTZXR0aW5nIHN0eWxlIHRvIGJsYW5rIHN0cmluZyByZXF1aXJlZCB0byBkZWxldGUgXCJzdHlsZTogeCAhaW1wb3J0YW50O1wiXG4gICAgZGVidWcoJ3NldCBob29rIGRlZmluZWQuIHNldHRpbmcgcHJvcGVydHkgKCVzKSB0byAlcycsIHByb3AsIHZhbCk7XG4gICAgc3R5bGVbcHJvcF0gPSAnJztcbiAgICBzdHlsZVtwcm9wXSA9IHZhbDtcbiAgfVxuXG59XG5cbi8qKlxuICogR2V0IHRoZSBzdHlsZVxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7U3RyaW5nfSBwcm9wXG4gKiBAcGFyYW0ge1N0cmluZ30gb3JpZ1xuICogQHBhcmFtIHtNaXhlZH0gZXh0cmFcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuXG5mdW5jdGlvbiBnZXQoZWwsIHByb3AsIG9yaWcsIGV4dHJhKSB7XG4gIHZhciBzdHlsZSA9IGVsLnN0eWxlO1xuICB2YXIgaG9vayA9IGhvb2tzW3Byb3BdIHx8IGhvb2tzW29yaWddO1xuICB2YXIgcmV0O1xuXG4gIGlmIChob29rICYmIGhvb2suZ2V0ICYmIHVuZGVmaW5lZCAhPT0gKHJldCA9IGhvb2suZ2V0KGVsLCBmYWxzZSwgZXh0cmEpKSkge1xuICAgIGRlYnVnKCdnZXQgaG9vayBkZWZpbmVkLCByZXR1cm5pbmc6ICVzJywgcmV0KTtcbiAgICByZXR1cm4gcmV0O1xuICB9XG5cbiAgcmV0ID0gc3R5bGVbcHJvcF07XG4gIGRlYnVnKCdnZXR0aW5nICVzJywgcmV0KTtcbiAgcmV0dXJuIHJldDtcbn1cbiIsIlxudmFyIGV4dGVuc2libGUgPSByZXF1aXJlKCdleHRlbnNpYmxlJylcbnZhciBtcyA9IHJlcXVpcmUoJ3BhcnNlLWR1cmF0aW9uJylcbnZhciBFbWl0dGVyID0gcmVxdWlyZSgnZW1pdHRlcicpXG52YXIgZWFzZSA9IHJlcXVpcmUoJ2Vhc2UnKVxudmFyIG5vdyA9IHJlcXVpcmUoJ25vdycpXG52YXIgcmFmID0gcmVxdWlyZSgncmFmJylcblxubW9kdWxlLmV4cG9ydHMgPSBBbmltYXRpb25cblxuZnVuY3Rpb24gQW5pbWF0aW9uKCl7fVxuXG4vKipcbiAqIG1peGluIG1ldGhvZHNcbiAqL1xuXG5FbWl0dGVyKEFuaW1hdGlvbi5wcm90b3R5cGUpXG5leHRlbnNpYmxlKEFuaW1hdGlvbilcblxuLyoqXG4gKiBzZXQgZHVyYXRpb24gdG8gYG5gIG1pbGxpc2Vjb25kcy4gWW91IGNhbiBhbHNvXG4gKiBwYXNzIGEgbmF0dXJhbCBsYW5ndWFnZSBzdHJpbmdcbiAqXG4gKiBAcGFyYW0ge051bWJlcnxTdHJpbmd9IG5cbiAqIEByZXR1cm4ge3RoaXN9XG4gKi9cblxuQW5pbWF0aW9uLnByb3RvdHlwZS5kdXJhdGlvbiA9IGZ1bmN0aW9uKG4pe1xuICBpZiAodHlwZW9mIG4gPT0gJ3N0cmluZycpIG4gPSBtcyhuKVxuICB0aGlzLl9kdXJhdGlvbiA9IG5cbiAgcmV0dXJuIHRoaXNcbn1cblxuLyoqXG4gKiBTZXQgZWFzaW5nIGZ1bmN0aW9uIHRvIGBmbmAuXG4gKlxuICogICBhbmltYXRpb24uZWFzZSgnaW4tb3V0LXNpbmUnKVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfEZ1bmN0aW9ufSBmblxuICogQHJldHVybiB7dGhpc31cbiAqL1xuXG5BbmltYXRpb24ucHJvdG90eXBlLmVhc2UgPSBmdW5jdGlvbihmbil7XG4gIGlmICh0eXBlb2YgZm4gPT0gJ3N0cmluZycpIGZuID0gZWFzZVtmbl1cbiAgaWYgKCFmbikgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIGVhc2luZyBmdW5jdGlvbicpXG4gIHRoaXMuX2Vhc2UgPSBmblxuICByZXR1cm4gdGhpc1xufVxuXG5BbmltYXRpb24ucHJvdG90eXBlLmVhc2UoJ2xpbmVhcicpIC8vIGRlZmF1bHRcblxuLyoqXG4gKiBydW4gdGhlIGFuaW1hdGlvbiB3aXRoIGFuIG9wdGlvbmFsIGR1cmF0aW9uXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ8U3RyaW5nfEZ1bmN0aW9ufSBbbl1cbiAqIEByZXR1cm4ge3RoaXN9XG4gKi9cblxuQW5pbWF0aW9uLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbihuKXtcbiAgaWYgKG4gIT0gbnVsbCkgdGhpcy5kdXJhdGlvbihuKVxuICB2YXIgZHVyYXRpb24gPSB0aGlzLl9kdXJhdGlvblxuICB2YXIgc3RhcnQgPSBub3coKVxuICB2YXIgc2VsZiA9IHRoaXNcbiAgcmFmKGZ1bmN0aW9uIGxvb3AoKXtcbiAgICB2YXIgcHJvZ3Jlc3MgPSAobm93KCkgLSBzdGFydCkgLyBkdXJhdGlvblxuICAgIGlmIChwcm9ncmVzcyA+PSAxKSB7XG4gICAgICBzZWxmLnJlbmRlcigxKVxuICAgICAgc2VsZi5ydW5uaW5nID0gZmFsc2VcbiAgICAgIHNlbGYuZW1pdCgnZW5kJylcbiAgICB9IGVsc2Uge1xuICAgICAgc2VsZi5yZW5kZXIocHJvZ3Jlc3MpXG4gICAgICByYWYobG9vcClcbiAgICB9XG4gIH0pXG4gIHRoaXMucnVubmluZyA9IHRydWVcbiAgcmV0dXJuIHRoaXNcbn1cbiIsIlxuLyoqXG4gKiBFeHBvc2UgYHVubWF0cml4YCBhbmQgaGVscGVyc1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IHVubWF0cml4O1xuZXhwb3J0cy5kZWNvbXBvc2UgPSBkZWNvbXBvc2U7XG5leHBvcnRzLnBhcnNlID0gcGFyc2U7XG5cbi8qKlxuICogVW5tYXRyaXhcbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cblxuZnVuY3Rpb24gdW5tYXRyaXgoc3RyKSB7XG4gIHJldHVybiBkZWNvbXBvc2UocGFyc2Uoc3RyKSk7XG59XG5cbi8qKlxuICogVW5tYXRyaXg6IHBhcnNlIHRoZSB2YWx1ZXMgb2YgdGhlIG1hdHJpeFxuICpcbiAqIEFsZ29yaXRobSBmcm9tOlxuICpcbiAqIC0gaHR0cDovL2hnLm1vemlsbGEub3JnL21vemlsbGEtY2VudHJhbC9maWxlLzdjYjNlOTc5NWQwNC9sYXlvdXQvc3R5bGUvbnNTdHlsZUFuaW1hdGlvbi5jcHBcbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBtIChtYXRyaXgpXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBkZWNvbXBvc2UobSkge1xuICB2YXIgQSA9IG1bMF07XG4gIHZhciBCID0gbVsxXTtcbiAgdmFyIEMgPSBtWzJdO1xuICB2YXIgRCA9IG1bM107XG4gIHZhciBkZXRlcm1pbmFudCA9IEEgKiBEIC0gQiAqIEM7XG5cbiAgLy8gc3RlcCgxKVxuICBpZiAoIWRldGVybWluYW50KSB0aHJvdyBuZXcgRXJyb3IoJ3RyYW5zZm9ybSN1bm1hdHJpeDogbWF0cml4IGlzIHNpbmd1bGFyJyk7XG5cbiAgLy8gc3RlcCAoMylcbiAgdmFyIHNjYWxlWCA9IE1hdGguc3FydChBICogQSArIEIgKiBCKTtcbiAgQSAvPSBzY2FsZVg7XG4gIEIgLz0gc2NhbGVYO1xuXG4gIC8vIHN0ZXAgKDQpXG4gIHZhciBza2V3ID0gQSAqIEMgKyBCICogRDtcbiAgQyAtPSBBICogc2tldztcbiAgRCAtPSBCICogc2tldztcblxuICAvLyBzdGVwICg1KVxuICB2YXIgc2NhbGVZID0gTWF0aC5zcXJ0KEMgKiBDICsgRCAqIEQpO1xuICBDIC89IHNjYWxlWTtcbiAgRCAvPSBzY2FsZVk7XG4gIHNrZXcgLz0gc2NhbGVZO1xuXG4gIC8vIHN0ZXAgKDYpXG4gIGlmIChkZXRlcm1pbmFudCA8IDApIHtcbiAgICBBID0gLUE7XG4gICAgQiA9IC1CO1xuICAgIHNrZXcgPSAtc2tldztcbiAgICBzY2FsZVggPSAtc2NhbGVYO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICB0cmFuc2xhdGVYOiBtWzRdLFxuICAgIHRyYW5zbGF0ZVk6IG1bNV0sXG4gICAgcm90YXRlOiBydG9kKE1hdGguYXRhbjIoQiwgQSkpLFxuICAgIHNrZXc6IHJ0b2QoTWF0aC5hdGFuKHNrZXcpKSxcbiAgICBzY2FsZVg6IHJvdW5kKHNjYWxlWCksXG4gICAgc2NhbGVZOiByb3VuZChzY2FsZVkpXG4gIH07XG59XG5cbi8qKlxuICogU3RyaW5nIHRvIG1hdHJpeFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHlsZVxuICogQHJldHVybiB7QXJyYXl9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBwYXJzZShzdHIpIHtcbiAgdmFyIG0gPSBzdHIuc2xpY2UoNykubWF0Y2goL1tcXGRcXC5cXC1dKy9nKTtcbiAgaWYgKCFtKSByZXR1cm4gWzEsIDAsIDAsIDEsIDAsIDBdXG4gIHJldHVybiBtLmxlbmd0aCA9PSA2XG4gICAgPyBtLm1hcChOdW1iZXIpXG4gICAgOiBbXG4gICAgICAgICttWzBdICwgK21bMV0sXG4gICAgICAgICttWzRdICwgK21bNV0sXG4gICAgICAgICttWzEyXSwgK21bMTNdXG4gICAgICBdO1xufVxuXG4vKipcbiAqIFJhZGlhbnMgdG8gZGVncmVlc1xuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSByYWRpYW5zXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IGRlZ3JlZXNcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHJ0b2QocmFkaWFucykge1xuICB2YXIgZGVnID0gcmFkaWFucyAqIDE4MCAvIE1hdGguUEk7XG4gIHJldHVybiByb3VuZChkZWcpO1xufVxuXG4vKipcbiAqIFJvdW5kIHRvIHRoZSBuZWFyZXN0IGh1bmRyZWR0aFxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBuXG4gKiBAcmV0dXJuIHtOdW1iZXJ9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiByb3VuZChuKSB7XG4gIHJldHVybiBNYXRoLnJvdW5kKG4gKiAxMDApIC8gMTAwO1xufVxuIiwiXG4vKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxudmFyIHR5cGUgPSByZXF1aXJlKCd0eXBlJyk7XG5cbi8qKlxuICogQ2xvbmVzIHZhbHVlc1xuICpcbiAqIEBwYXJhbSB7TWl4ZWR9IGFueSBvYmplY3RcbiAqIEBhcGkgcHVibGljXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihvYmope1xuICByZXR1cm4gY2xvbmUob2JqLCBbXSwgW10pO1xufVxuXG4vKipcbiAqIGludGVybmFsIGRpc3BhdGNoZXIuIGlmIG5vIHNwZWNpZmljIGhhbmRsZXJzIGFyZVxuICogYXZhaWxhYmxlIGBvYmpgIGl0c2VsZiB3aWxsIGJlIHJldHVybmVkXG4gKiBcbiAqIEBwYXJhbSB7WH0gb2JqXG4gKiBAcGFyYW0ge0FycmF5fSBzZWVuXG4gKiBAcGFyYW0ge0FycmF5fSBjb3BpZXNcbiAqIEByZXR1cm4ge1h9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBjbG9uZShvYmosIHNlZW4sIGNvcGllcyl7XG4gIHZhciBmbiA9IGhhbmRsZVt0eXBlKG9iaildO1xuICByZXR1cm4gZm4gPyBmbihvYmosIHNlZW4sIGNvcGllcykgOiBvYmo7XG59XG5cbi8qKlxuICogdHlwZSBzcGVjaWZpYyBoYW5kbGVyc1xuICogXG4gKiBAcGFyYW0ge1h9IGFcbiAqIEBwYXJhbSB7QXJyYXl9IHNlZW5cbiAqIEBwYXJhbSB7QXJyYXl9IGNvcGllc1xuICogQHJldHVybiB7WH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbnZhciBoYW5kbGUgPSB7XG4gIG9iamVjdDogZnVuY3Rpb24oYSwgc2VlbiwgY29waWVzKXtcbiAgICB2YXIgayA9IHNlZW4uaW5kZXhPZihhKTtcbiAgICBpZiAoayA+PSAwKSByZXR1cm4gY29waWVzW2tdO1xuICAgIHZhciBjb3B5ID0gT2JqZWN0LmNyZWF0ZShhKTtcbiAgICBjb3BpZXMucHVzaChjb3B5KTtcbiAgICBzZWVuLnB1c2goYSk7XG4gICAgZm9yICh2YXIgayBpbiBhKSB7XG4gICAgICBjb3B5W2tdID0gY2xvbmUoYVtrXSwgc2VlbiwgY29waWVzKTtcbiAgICB9XG4gICAgcmV0dXJuIGNvcHk7XG4gIH0sXG4gIGFycmF5OiBjb3B5QXJyYXksXG4gIGFyZ3VtZW50czogY29weUFycmF5LFxuICByZWdleHA6IGZ1bmN0aW9uKGEpe1xuICAgIHZhciBmbGFncyA9ICcnXG4gICAgICArIChhLm11bHRpbGluZSA/ICdtJyA6ICcnKVxuICAgICAgKyAoYS5nbG9iYWwgPyAnZycgOiAnJylcbiAgICAgICsgKGEuaWdub3JlQ2FzZSA/ICdpJyA6ICcnKVxuICAgIHJldHVybiBuZXcgUmVnRXhwKGEuc291cmNlLCBmbGFncyk7XG4gIH0sXG4gIGRhdGU6IGZ1bmN0aW9uKGEpe1xuICAgIHJldHVybiBuZXcgRGF0ZShhLmdldFRpbWUoKSk7XG4gIH0sXG4gIHN0cmluZzogdW5ib3gsXG4gIG51bWJlcjogdW5ib3gsXG4gIGJvb2xlYW46IHVuYm94LFxuICBlbGVtZW50OiBmdW5jdGlvbihhLCBzZWVuLCBjb3BpZXMpe1xuICAgIHZhciBrID0gc2Vlbi5pbmRleE9mKGEpO1xuICAgIGlmIChrID49IDApIHJldHVybiBjb3BpZXNba107XG4gICAgdmFyIGNvcHkgPSBhLmNsb25lTm9kZSh0cnVlKTtcbiAgICBjb3BpZXMucHVzaChjb3B5KTtcbiAgICBzZWVuLnB1c2goYSk7XG4gICAgcmV0dXJuIGNvcHk7XG4gIH1cbn1cblxuZnVuY3Rpb24gdW5ib3goYSl7IHJldHVybiBhLnZhbHVlT2YoKSB9XG5cbmZ1bmN0aW9uIGNvcHlBcnJheShhLCBzZWVuLCBjb3BpZXMpe1xuICB2YXIgaSA9IHNlZW4uaW5kZXhPZihhKTtcbiAgaWYgKGkgPj0gMCkgcmV0dXJuIGNvcGllc1tpXTtcbiAgdmFyIGNvcHkgPSBuZXcgQXJyYXkoaSA9IGEubGVuZ3RoKTtcbiAgc2Vlbi5wdXNoKGEpO1xuICBjb3BpZXMucHVzaChjb3B5KTtcbiAgd2hpbGUgKGktLSkge1xuICAgIGNvcHlbaV0gPSBjbG9uZShhW2ldLCBzZWVuLCBjb3BpZXMpO1xuICB9XG4gIHJldHVybiBjb3B5O1xufVxuIiwiXG52YXIgc3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJykuc3R5bGVcbnZhciBwcmVmaXhlcyA9ICdPIG1zIE1veiB3ZWJraXQnLnNwbGl0KCcgJylcbnZhciB1cHBlciA9IC8oW0EtWl0pL2dcblxudmFyIG1lbW8gPSB7fVxuXG4vKipcbiAqIG1lbW9pemVkIGBwcmVmaXhgXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBmdW5jdGlvbihrZXkpe1xuICByZXR1cm4ga2V5IGluIG1lbW9cbiAgICA/IG1lbW9ba2V5XVxuICAgIDogbWVtb1trZXldID0gcHJlZml4KGtleSlcbn1cblxuZXhwb3J0cy5wcmVmaXggPSBwcmVmaXhcbmV4cG9ydHMuZGFzaCA9IGRhc2hlZFByZWZpeFxuXG4vKipcbiAqIHByZWZpeCBga2V5YFxuICpcbiAqICAgcHJlZml4KCd0cmFuc2Zvcm0nKSAvLyA9PiB3ZWJraXRUcmFuc2Zvcm1cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIHByZWZpeChrZXkpe1xuICAvLyBjYW1lbCBjYXNlXG4gIGtleSA9IGtleS5yZXBsYWNlKC8tKFthLXpdKS9nLCBmdW5jdGlvbihfLCBjaGFyKXtcbiAgICByZXR1cm4gY2hhci50b1VwcGVyQ2FzZSgpXG4gIH0pXG5cbiAgLy8gd2l0aG91dCBwcmVmaXhcbiAgaWYgKHN0eWxlW2tleV0gIT09IHVuZGVmaW5lZCkgcmV0dXJuIGtleVxuXG4gIC8vIHdpdGggcHJlZml4XG4gIHZhciBLZXkgPSBjYXBpdGFsaXplKGtleSlcbiAgdmFyIGkgPSBwcmVmaXhlcy5sZW5ndGhcbiAgd2hpbGUgKGktLSkge1xuICAgIHZhciBuYW1lID0gcHJlZml4ZXNbaV0gKyBLZXlcbiAgICBpZiAoc3R5bGVbbmFtZV0gIT09IHVuZGVmaW5lZCkgcmV0dXJuIG5hbWVcbiAgfVxuXG4gIHRocm93IG5ldyBFcnJvcigndW5hYmxlIHRvIHByZWZpeCAnICsga2V5KVxufVxuXG5mdW5jdGlvbiBjYXBpdGFsaXplKHN0cil7XG4gIHJldHVybiBzdHIuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzdHIuc2xpY2UoMSlcbn1cblxuLyoqXG4gKiBjcmVhdGUgYSBkYXNoZXJpemVkIHByZWZpeFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gZGFzaGVkUHJlZml4KGtleSl7XG4gIGtleSA9IHByZWZpeChrZXkpXG4gIGlmICh1cHBlci50ZXN0KGtleSkpIGtleSA9ICctJyArIGtleS5yZXBsYWNlKHVwcGVyLCAnLSQxJylcbiAgcmV0dXJuIGtleS50b0xvd2VyQ2FzZSgpXG59XG4iLCJ2YXIgYmluZCA9IHdpbmRvdy5hZGRFdmVudExpc3RlbmVyID8gJ2FkZEV2ZW50TGlzdGVuZXInIDogJ2F0dGFjaEV2ZW50JyxcbiAgICB1bmJpbmQgPSB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciA/ICdyZW1vdmVFdmVudExpc3RlbmVyJyA6ICdkZXRhY2hFdmVudCcsXG4gICAgcHJlZml4ID0gYmluZCAhPT0gJ2FkZEV2ZW50TGlzdGVuZXInID8gJ29uJyA6ICcnO1xuXG4vKipcbiAqIEJpbmQgYGVsYCBldmVudCBgdHlwZWAgdG8gYGZuYC5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gY2FwdHVyZVxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMuYmluZCA9IGZ1bmN0aW9uKGVsLCB0eXBlLCBmbiwgY2FwdHVyZSl7XG4gIGVsW2JpbmRdKHByZWZpeCArIHR5cGUsIGZuLCBjYXB0dXJlIHx8IGZhbHNlKTtcblxuICByZXR1cm4gZm47XG59O1xuXG4vKipcbiAqIFVuYmluZCBgZWxgIGV2ZW50IGB0eXBlYCdzIGNhbGxiYWNrIGBmbmAuXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbFxuICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGNhcHR1cmVcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5leHBvcnRzLnVuYmluZCA9IGZ1bmN0aW9uKGVsLCB0eXBlLCBmbiwgY2FwdHVyZSl7XG4gIGVsW3VuYmluZF0ocHJlZml4ICsgdHlwZSwgZm4sIGNhcHR1cmUgfHwgZmFsc2UpO1xuXG4gIHJldHVybiBmbjtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihhcnIsIG9iail7XG4gIGlmIChhcnIuaW5kZXhPZikgcmV0dXJuIGFyci5pbmRleE9mKG9iaik7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgKytpKSB7XG4gICAgaWYgKGFycltpXSA9PT0gb2JqKSByZXR1cm4gaTtcbiAgfVxuICByZXR1cm4gLTE7XG59OyIsIlxuLyoqXG4gKiBFeHBvc2UgYGRlYnVnKClgIGFzIHRoZSBtb2R1bGUuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBkZWJ1ZztcblxuLyoqXG4gKiBDcmVhdGUgYSBkZWJ1Z2dlciB3aXRoIHRoZSBnaXZlbiBgbmFtZWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAqIEByZXR1cm4ge1R5cGV9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIGRlYnVnKG5hbWUpIHtcbiAgaWYgKCFkZWJ1Zy5lbmFibGVkKG5hbWUpKSByZXR1cm4gZnVuY3Rpb24oKXt9O1xuXG4gIHJldHVybiBmdW5jdGlvbihmbXQpe1xuICAgIGZtdCA9IGNvZXJjZShmbXQpO1xuXG4gICAgdmFyIGN1cnIgPSBuZXcgRGF0ZTtcbiAgICB2YXIgbXMgPSBjdXJyIC0gKGRlYnVnW25hbWVdIHx8IGN1cnIpO1xuICAgIGRlYnVnW25hbWVdID0gY3VycjtcblxuICAgIGZtdCA9IG5hbWVcbiAgICAgICsgJyAnXG4gICAgICArIGZtdFxuICAgICAgKyAnICsnICsgZGVidWcuaHVtYW5pemUobXMpO1xuXG4gICAgLy8gVGhpcyBoYWNrZXJ5IGlzIHJlcXVpcmVkIGZvciBJRThcbiAgICAvLyB3aGVyZSBgY29uc29sZS5sb2dgIGRvZXNuJ3QgaGF2ZSAnYXBwbHknXG4gICAgd2luZG93LmNvbnNvbGVcbiAgICAgICYmIGNvbnNvbGUubG9nXG4gICAgICAmJiBGdW5jdGlvbi5wcm90b3R5cGUuYXBwbHkuY2FsbChjb25zb2xlLmxvZywgY29uc29sZSwgYXJndW1lbnRzKTtcbiAgfVxufVxuXG4vKipcbiAqIFRoZSBjdXJyZW50bHkgYWN0aXZlIGRlYnVnIG1vZGUgbmFtZXMuXG4gKi9cblxuZGVidWcubmFtZXMgPSBbXTtcbmRlYnVnLnNraXBzID0gW107XG5cbi8qKlxuICogRW5hYmxlcyBhIGRlYnVnIG1vZGUgYnkgbmFtZS4gVGhpcyBjYW4gaW5jbHVkZSBtb2Rlc1xuICogc2VwYXJhdGVkIGJ5IGEgY29sb24gYW5kIHdpbGRjYXJkcy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5kZWJ1Zy5lbmFibGUgPSBmdW5jdGlvbihuYW1lKSB7XG4gIHRyeSB7XG4gICAgbG9jYWxTdG9yYWdlLmRlYnVnID0gbmFtZTtcbiAgfSBjYXRjaChlKXt9XG5cbiAgdmFyIHNwbGl0ID0gKG5hbWUgfHwgJycpLnNwbGl0KC9bXFxzLF0rLylcbiAgICAsIGxlbiA9IHNwbGl0Lmxlbmd0aDtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgbmFtZSA9IHNwbGl0W2ldLnJlcGxhY2UoJyonLCAnLio/Jyk7XG4gICAgaWYgKG5hbWVbMF0gPT09ICctJykge1xuICAgICAgZGVidWcuc2tpcHMucHVzaChuZXcgUmVnRXhwKCdeJyArIG5hbWUuc3Vic3RyKDEpICsgJyQnKSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgZGVidWcubmFtZXMucHVzaChuZXcgUmVnRXhwKCdeJyArIG5hbWUgKyAnJCcpKTtcbiAgICB9XG4gIH1cbn07XG5cbi8qKlxuICogRGlzYWJsZSBkZWJ1ZyBvdXRwdXQuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5kZWJ1Zy5kaXNhYmxlID0gZnVuY3Rpb24oKXtcbiAgZGVidWcuZW5hYmxlKCcnKTtcbn07XG5cbi8qKlxuICogSHVtYW5pemUgdGhlIGdpdmVuIGBtc2AuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IG1cbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmRlYnVnLmh1bWFuaXplID0gZnVuY3Rpb24obXMpIHtcbiAgdmFyIHNlYyA9IDEwMDBcbiAgICAsIG1pbiA9IDYwICogMTAwMFxuICAgICwgaG91ciA9IDYwICogbWluO1xuXG4gIGlmIChtcyA+PSBob3VyKSByZXR1cm4gKG1zIC8gaG91cikudG9GaXhlZCgxKSArICdoJztcbiAgaWYgKG1zID49IG1pbikgcmV0dXJuIChtcyAvIG1pbikudG9GaXhlZCgxKSArICdtJztcbiAgaWYgKG1zID49IHNlYykgcmV0dXJuIChtcyAvIHNlYyB8IDApICsgJ3MnO1xuICByZXR1cm4gbXMgKyAnbXMnO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIGdpdmVuIG1vZGUgbmFtZSBpcyBlbmFibGVkLCBmYWxzZSBvdGhlcndpc2UuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmRlYnVnLmVuYWJsZWQgPSBmdW5jdGlvbihuYW1lKSB7XG4gIGZvciAodmFyIGkgPSAwLCBsZW4gPSBkZWJ1Zy5za2lwcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIGlmIChkZWJ1Zy5za2lwc1tpXS50ZXN0KG5hbWUpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIGZvciAodmFyIGkgPSAwLCBsZW4gPSBkZWJ1Zy5uYW1lcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIGlmIChkZWJ1Zy5uYW1lc1tpXS50ZXN0KG5hbWUpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufTtcblxuLyoqXG4gKiBDb2VyY2UgYHZhbGAuXG4gKi9cblxuZnVuY3Rpb24gY29lcmNlKHZhbCkge1xuICBpZiAodmFsIGluc3RhbmNlb2YgRXJyb3IpIHJldHVybiB2YWwuc3RhY2sgfHwgdmFsLm1lc3NhZ2U7XG4gIHJldHVybiB2YWw7XG59XG5cbi8vIHBlcnNpc3RcblxudHJ5IHtcbiAgaWYgKHdpbmRvdy5sb2NhbFN0b3JhZ2UpIGRlYnVnLmVuYWJsZShsb2NhbFN0b3JhZ2UuZGVidWcpO1xufSBjYXRjaChlKXt9XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCIuL2xhenlQcm9wZXJ0eS5qc1wiKSIsIi8qKlxuICogTW9kdWxlIERlcGVuZGVuY2llc1xuICovXG5cbnZhciBkZWJ1ZyA9IHJlcXVpcmUoJ2RlYnVnJykoJ2Nzczpjb21wdXRlZCcpO1xudmFyIHdpdGhpbkRvY3VtZW50ID0gcmVxdWlyZSgnd2l0aGluLWRvY3VtZW50Jyk7XG52YXIgc3R5bGVzID0gcmVxdWlyZSgnLi9zdHlsZXMnKTtcblxuLyoqXG4gKiBFeHBvc2UgYGNvbXB1dGVkYFxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gY29tcHV0ZWQ7XG5cbi8qKlxuICogR2V0IHRoZSBjb21wdXRlZCBzdHlsZVxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7U3RyaW5nfSBwcm9wXG4gKiBAcGFyYW0ge0FycmF5fSBwcmVjb21wdXRlZCAob3B0aW9uYWwpXG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGNvbXB1dGVkKGVsLCBwcm9wLCBwcmVjb21wdXRlZCkge1xuICBjb21wdXRlZCA9IHByZWNvbXB1dGVkIHx8IHN0eWxlcyhlbCk7XG4gIGlmICghY29tcHV0ZWQpIHJldHVybjtcblxuICB2YXIgcmV0ID0gY29tcHV0ZWQuZ2V0UHJvcGVydHlWYWx1ZShwcm9wKSB8fCBjb21wdXRlZFtwcm9wXTtcblxuICBpZiAoJycgPT09IHJldCAmJiAhd2l0aGluRG9jdW1lbnQoZWwpKSB7XG4gICAgZGVidWcoJ2VsZW1lbnQgbm90IHdpdGhpbiBkb2N1bWVudCwgdHJ5IGZpbmRpbmcgZnJvbSBzdHlsZSBhdHRyaWJ1dGUnKTtcbiAgICB2YXIgc3R5bGUgPSByZXF1aXJlKCcuL3N0eWxlJyk7XG4gICAgcmV0ID0gc3R5bGUoZWwsIHByb3ApO1xuICB9XG5cbiAgZGVidWcoJ2NvbXB1dGVkIHZhbHVlIG9mICVzOiAlcycsIHByb3AsIHJldCk7XG5cbiAgLy8gU3VwcG9ydDogSUVcbiAgLy8gSUUgcmV0dXJucyB6SW5kZXggdmFsdWUgYXMgYW4gaW50ZWdlci5cbiAgcmV0dXJuIHVuZGVmaW5lZCA9PT0gcmV0ID8gcmV0IDogcmV0ICsgJyc7XG59XG4iLCIvKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXNcbiAqL1xuXG52YXIgZGVidWcgPSByZXF1aXJlKCdkZWJ1ZycpKCdjc3M6cHJvcCcpO1xudmFyIGNhbWVsY2FzZSA9IHJlcXVpcmUoJ3RvLWNhbWVsLWNhc2UnKTtcbnZhciB2ZW5kb3IgPSByZXF1aXJlKCcuL3ZlbmRvcicpO1xuXG4vKipcbiAqIEV4cG9ydCBgcHJvcGBcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHByb3A7XG5cbi8qKlxuICogTm9ybWFsaXplIFByb3BlcnRpZXNcbiAqL1xuXG52YXIgY3NzUHJvcHMgPSB7XG4gICdmbG9hdCc6ICdjc3NGbG9hdCdcbn07XG5cbi8qKlxuICogR2V0IHRoZSB2ZW5kb3IgcHJlZml4ZWQgcHJvcGVydHlcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gcHJvcFxuICogQHBhcmFtIHtTdHJpbmd9IHN0eWxlXG4gKiBAcmV0dXJuIHtTdHJpbmd9IHByb3BcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHByb3AocHJvcCwgc3R5bGUpIHtcbiAgcHJvcCA9IGNzc1Byb3BzW3Byb3BdIHx8IChjc3NQcm9wc1twcm9wXSA9IHZlbmRvcihwcm9wLCBzdHlsZSkpO1xuICBkZWJ1ZygndHJhbnNmb3JtIHByb3BlcnR5OiAlcyA9PiAlcycpO1xuICByZXR1cm4gcHJvcDtcbn1cbiIsIi8qKlxuICogTW9kdWxlIERlcGVuZGVuY2llc1xuICovXG5cbnZhciBjc3MgPSByZXF1aXJlKCcuL2NzcycpO1xudmFyIGNzc1Nob3cgPSB7IHBvc2l0aW9uOiAnYWJzb2x1dGUnLCB2aXNpYmlsaXR5OiAnaGlkZGVuJywgZGlzcGxheTogJ2Jsb2NrJyB9O1xudmFyIHBudW0gPSAoL1srLV0/KD86XFxkKlxcLnwpXFxkKyg/OltlRV1bKy1dP1xcZCt8KS8pLnNvdXJjZTtcbnZhciBybnVtbm9ucHggPSBuZXcgUmVnRXhwKCAnXignICsgcG51bSArICcpKD8hcHgpW2EteiVdKyQnLCAnaScpO1xudmFyIHJudW1zcGxpdCA9IG5ldyBSZWdFeHAoICdeKCcgKyBwbnVtICsgJykoLiopJCcsICdpJyk7XG52YXIgcmRpc3BsYXlzd2FwID0gL14obm9uZXx0YWJsZSg/IS1jW2VhXSkuKykvO1xudmFyIHN0eWxlcyA9IHJlcXVpcmUoJy4vc3R5bGVzJyk7XG52YXIgc3VwcG9ydCA9IHJlcXVpcmUoJy4vc3VwcG9ydCcpO1xudmFyIHN3YXAgPSByZXF1aXJlKCcuL3N3YXAnKTtcbnZhciBjb21wdXRlZCA9IHJlcXVpcmUoJy4vY29tcHV0ZWQnKTtcbnZhciBjc3NFeHBhbmQgPSBbIFwiVG9wXCIsIFwiUmlnaHRcIiwgXCJCb3R0b21cIiwgXCJMZWZ0XCIgXTtcblxuLyoqXG4gKiBIZWlnaHQgJiBXaWR0aFxuICovXG5cblsnd2lkdGgnLCAnaGVpZ2h0J10uZm9yRWFjaChmdW5jdGlvbihuYW1lKSB7XG4gIGV4cG9ydHNbbmFtZV0gPSB7fTtcblxuICBleHBvcnRzW25hbWVdLmdldCA9IGZ1bmN0aW9uKGVsLCBjb21wdXRlLCBleHRyYSkge1xuICAgIGlmICghY29tcHV0ZSkgcmV0dXJuO1xuICAgIC8vIGNlcnRhaW4gZWxlbWVudHMgY2FuIGhhdmUgZGltZW5zaW9uIGluZm8gaWYgd2UgaW52aXNpYmx5IHNob3cgdGhlbVxuICAgIC8vIGhvd2V2ZXIsIGl0IG11c3QgaGF2ZSBhIGN1cnJlbnQgZGlzcGxheSBzdHlsZSB0aGF0IHdvdWxkIGJlbmVmaXQgZnJvbSB0aGlzXG4gICAgcmV0dXJuIDAgPT0gZWwub2Zmc2V0V2lkdGggJiYgcmRpc3BsYXlzd2FwLnRlc3QoY3NzKGVsLCAnZGlzcGxheScpKVxuICAgICAgPyBzd2FwKGVsLCBjc3NTaG93LCBmdW5jdGlvbigpIHsgcmV0dXJuIGdldFdpZHRoT3JIZWlnaHQoZWwsIG5hbWUsIGV4dHJhKTsgfSlcbiAgICAgIDogZ2V0V2lkdGhPckhlaWdodChlbCwgbmFtZSwgZXh0cmEpO1xuICB9XG5cbiAgZXhwb3J0c1tuYW1lXS5zZXQgPSBmdW5jdGlvbihlbCwgdmFsLCBleHRyYSkge1xuICAgIHZhciBzdHlsZXMgPSBleHRyYSAmJiBzdHlsZXMoZWwpO1xuICAgIHJldHVybiBzZXRQb3NpdGl2ZU51bWJlcihlbCwgdmFsLCBleHRyYVxuICAgICAgPyBhdWdtZW50V2lkdGhPckhlaWdodChlbCwgbmFtZSwgZXh0cmEsICdib3JkZXItYm94JyA9PSBjc3MoZWwsICdib3hTaXppbmcnLCBmYWxzZSwgc3R5bGVzKSwgc3R5bGVzKVxuICAgICAgOiAwXG4gICAgKTtcbiAgfTtcblxufSk7XG5cbi8qKlxuICogT3BhY2l0eVxuICovXG5cbmV4cG9ydHMub3BhY2l0eSA9IHt9O1xuZXhwb3J0cy5vcGFjaXR5LmdldCA9IGZ1bmN0aW9uKGVsLCBjb21wdXRlKSB7XG4gIGlmICghY29tcHV0ZSkgcmV0dXJuO1xuICB2YXIgcmV0ID0gY29tcHV0ZWQoZWwsICdvcGFjaXR5Jyk7XG4gIHJldHVybiAnJyA9PSByZXQgPyAnMScgOiByZXQ7XG59XG5cbi8qKlxuICogVXRpbGl0eTogU2V0IFBvc2l0aXZlIE51bWJlclxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7TWl4ZWR9IHZhbFxuICogQHBhcmFtIHtOdW1iZXJ9IHN1YnRyYWN0XG4gKiBAcmV0dXJuIHtOdW1iZXJ9XG4gKi9cblxuZnVuY3Rpb24gc2V0UG9zaXRpdmVOdW1iZXIoZWwsIHZhbCwgc3VidHJhY3QpIHtcbiAgdmFyIG1hdGNoZXMgPSBybnVtc3BsaXQuZXhlYyh2YWwpO1xuICByZXR1cm4gbWF0Y2hlcyA/XG4gICAgLy8gR3VhcmQgYWdhaW5zdCB1bmRlZmluZWQgJ3N1YnRyYWN0JywgZS5nLiwgd2hlbiB1c2VkIGFzIGluIGNzc0hvb2tzXG4gICAgTWF0aC5tYXgoMCwgbWF0Y2hlc1sxXSkgKyAobWF0Y2hlc1syXSB8fCAncHgnKSA6XG4gICAgdmFsO1xufVxuXG4vKipcbiAqIFV0aWxpdHk6IEdldCB0aGUgd2lkdGggb3IgaGVpZ2h0XG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbFxuICogQHBhcmFtIHtTdHJpbmd9IHByb3BcbiAqIEBwYXJhbSB7TWl4ZWR9IGV4dHJhXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cblxuZnVuY3Rpb24gZ2V0V2lkdGhPckhlaWdodChlbCwgcHJvcCwgZXh0cmEpIHtcbiAgLy8gU3RhcnQgd2l0aCBvZmZzZXQgcHJvcGVydHksIHdoaWNoIGlzIGVxdWl2YWxlbnQgdG8gdGhlIGJvcmRlci1ib3ggdmFsdWVcbiAgdmFyIHZhbHVlSXNCb3JkZXJCb3ggPSB0cnVlO1xuICB2YXIgdmFsID0gcHJvcCA9PT0gJ3dpZHRoJyA/IGVsLm9mZnNldFdpZHRoIDogZWwub2Zmc2V0SGVpZ2h0O1xuICB2YXIgc3R5bGVzID0gY29tcHV0ZWQoZWwpO1xuICB2YXIgaXNCb3JkZXJCb3ggPSBzdXBwb3J0LmJveFNpemluZyAmJiBjc3MoZWwsICdib3hTaXppbmcnKSA9PT0gJ2JvcmRlci1ib3gnO1xuXG4gIC8vIHNvbWUgbm9uLWh0bWwgZWxlbWVudHMgcmV0dXJuIHVuZGVmaW5lZCBmb3Igb2Zmc2V0V2lkdGgsIHNvIGNoZWNrIGZvciBudWxsL3VuZGVmaW5lZFxuICAvLyBzdmcgLSBodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD02NDkyODVcbiAgLy8gTWF0aE1MIC0gaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9NDkxNjY4XG4gIGlmICh2YWwgPD0gMCB8fCB2YWwgPT0gbnVsbCkge1xuICAgIC8vIEZhbGwgYmFjayB0byBjb21wdXRlZCB0aGVuIHVuY29tcHV0ZWQgY3NzIGlmIG5lY2Vzc2FyeVxuICAgIHZhbCA9IGNvbXB1dGVkKGVsLCBwcm9wLCBzdHlsZXMpO1xuXG4gICAgaWYgKHZhbCA8IDAgfHwgdmFsID09IG51bGwpIHtcbiAgICAgIHZhbCA9IGVsLnN0eWxlW3Byb3BdO1xuICAgIH1cblxuICAgIC8vIENvbXB1dGVkIHVuaXQgaXMgbm90IHBpeGVscy4gU3RvcCBoZXJlIGFuZCByZXR1cm4uXG4gICAgaWYgKHJudW1ub25weC50ZXN0KHZhbCkpIHtcbiAgICAgIHJldHVybiB2YWw7XG4gICAgfVxuXG4gICAgLy8gd2UgbmVlZCB0aGUgY2hlY2sgZm9yIHN0eWxlIGluIGNhc2UgYSBicm93c2VyIHdoaWNoIHJldHVybnMgdW5yZWxpYWJsZSB2YWx1ZXNcbiAgICAvLyBmb3IgZ2V0Q29tcHV0ZWRTdHlsZSBzaWxlbnRseSBmYWxscyBiYWNrIHRvIHRoZSByZWxpYWJsZSBlbC5zdHlsZVxuICAgIHZhbHVlSXNCb3JkZXJCb3ggPSBpc0JvcmRlckJveCAmJiAoc3VwcG9ydC5ib3hTaXppbmdSZWxpYWJsZSgpIHx8IHZhbCA9PT0gZWwuc3R5bGVbcHJvcF0pO1xuXG4gICAgLy8gTm9ybWFsaXplICcsIGF1dG8sIGFuZCBwcmVwYXJlIGZvciBleHRyYVxuICAgIHZhbCA9IHBhcnNlRmxvYXQodmFsKSB8fCAwO1xuICB9XG5cbiAgLy8gdXNlIHRoZSBhY3RpdmUgYm94LXNpemluZyBtb2RlbCB0byBhZGQvc3VidHJhY3QgaXJyZWxldmFudCBzdHlsZXNcbiAgZXh0cmEgPSBleHRyYSB8fCAoaXNCb3JkZXJCb3ggPyAnYm9yZGVyJyA6ICdjb250ZW50Jyk7XG4gIHZhbCArPSBhdWdtZW50V2lkdGhPckhlaWdodChlbCwgcHJvcCwgZXh0cmEsIHZhbHVlSXNCb3JkZXJCb3gsIHN0eWxlcyk7XG4gIHJldHVybiB2YWwgKyAncHgnO1xufVxuXG4vKipcbiAqIFV0aWxpdHk6IEF1Z21lbnQgdGhlIHdpZHRoIG9yIHRoZSBoZWlnaHRcbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gKiBAcGFyYW0ge1N0cmluZ30gcHJvcFxuICogQHBhcmFtIHtNaXhlZH0gZXh0cmFcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gaXNCb3JkZXJCb3hcbiAqIEBwYXJhbSB7QXJyYXl9IHN0eWxlc1xuICovXG5cbmZ1bmN0aW9uIGF1Z21lbnRXaWR0aE9ySGVpZ2h0KGVsLCBwcm9wLCBleHRyYSwgaXNCb3JkZXJCb3gsIHN0eWxlcykge1xuICAvLyBJZiB3ZSBhbHJlYWR5IGhhdmUgdGhlIHJpZ2h0IG1lYXN1cmVtZW50LCBhdm9pZCBhdWdtZW50YXRpb24sXG4gIC8vIE90aGVyd2lzZSBpbml0aWFsaXplIGZvciBob3Jpem9udGFsIG9yIHZlcnRpY2FsIHByb3BlcnRpZXNcbiAgdmFyIGkgPSBleHRyYSA9PT0gKGlzQm9yZGVyQm94ID8gJ2JvcmRlcicgOiAnY29udGVudCcpID8gNCA6ICd3aWR0aCcgPT0gcHJvcCA/IDEgOiAwO1xuICB2YXIgdmFsID0gMDtcblxuICBmb3IgKDsgaSA8IDQ7IGkgKz0gMikge1xuICAgIC8vIGJvdGggYm94IG1vZGVscyBleGNsdWRlIG1hcmdpbiwgc28gYWRkIGl0IGlmIHdlIHdhbnQgaXRcbiAgICBpZiAoZXh0cmEgPT09ICdtYXJnaW4nKSB7XG4gICAgICB2YWwgKz0gY3NzKGVsLCBleHRyYSArIGNzc0V4cGFuZFtpXSwgdHJ1ZSwgc3R5bGVzKTtcbiAgICB9XG5cbiAgICBpZiAoaXNCb3JkZXJCb3gpIHtcbiAgICAgIC8vIGJvcmRlci1ib3ggaW5jbHVkZXMgcGFkZGluZywgc28gcmVtb3ZlIGl0IGlmIHdlIHdhbnQgY29udGVudFxuICAgICAgaWYgKGV4dHJhID09PSAnY29udGVudCcpIHtcbiAgICAgICAgdmFsIC09IGNzcyhlbCwgJ3BhZGRpbmcnICsgY3NzRXhwYW5kW2ldLCB0cnVlLCBzdHlsZXMpO1xuICAgICAgfVxuXG4gICAgICAvLyBhdCB0aGlzIHBvaW50LCBleHRyYSBpc24ndCBib3JkZXIgbm9yIG1hcmdpbiwgc28gcmVtb3ZlIGJvcmRlclxuICAgICAgaWYgKGV4dHJhICE9PSAnbWFyZ2luJykge1xuICAgICAgICB2YWwgLT0gY3NzKGVsLCAnYm9yZGVyJyArIGNzc0V4cGFuZFtpXSArICdXaWR0aCcsIHRydWUsIHN0eWxlcyk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGF0IHRoaXMgcG9pbnQsIGV4dHJhIGlzbid0IGNvbnRlbnQsIHNvIGFkZCBwYWRkaW5nXG4gICAgICB2YWwgKz0gY3NzKGVsLCAncGFkZGluZycgKyBjc3NFeHBhbmRbaV0sIHRydWUsIHN0eWxlcyk7XG5cbiAgICAgIC8vIGF0IHRoaXMgcG9pbnQsIGV4dHJhIGlzbid0IGNvbnRlbnQgbm9yIHBhZGRpbmcsIHNvIGFkZCBib3JkZXJcbiAgICAgIGlmIChleHRyYSAhPT0gJ3BhZGRpbmcnKSB7XG4gICAgICAgIHZhbCArPSBjc3MoZWwsICdib3JkZXInICsgY3NzRXhwYW5kW2ldICsgJ1dpZHRoJywgdHJ1ZSwgc3R5bGVzKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdmFsO1xufVxuIiwiLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICovXG5cbnZhciB0dHkgPSByZXF1aXJlKCd0dHknKTtcblxuLyoqXG4gKiBFeHBvc2UgYGRlYnVnKClgIGFzIHRoZSBtb2R1bGUuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBkZWJ1ZztcblxuLyoqXG4gKiBFbmFibGVkIGRlYnVnZ2Vycy5cbiAqL1xuXG52YXIgbmFtZXMgPSBbXVxuICAsIHNraXBzID0gW107XG5cbihwcm9jZXNzLmVudi5ERUJVRyB8fCAnJylcbiAgLnNwbGl0KC9bXFxzLF0rLylcbiAgLmZvckVhY2goZnVuY3Rpb24obmFtZSl7XG4gICAgbmFtZSA9IG5hbWUucmVwbGFjZSgnKicsICcuKj8nKTtcbiAgICBpZiAobmFtZVswXSA9PT0gJy0nKSB7XG4gICAgICBza2lwcy5wdXNoKG5ldyBSZWdFeHAoJ14nICsgbmFtZS5zdWJzdHIoMSkgKyAnJCcpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbmFtZXMucHVzaChuZXcgUmVnRXhwKCdeJyArIG5hbWUgKyAnJCcpKTtcbiAgICB9XG4gIH0pO1xuXG4vKipcbiAqIENvbG9ycy5cbiAqL1xuXG52YXIgY29sb3JzID0gWzYsIDIsIDMsIDQsIDUsIDFdO1xuXG4vKipcbiAqIFByZXZpb3VzIGRlYnVnKCkgY2FsbC5cbiAqL1xuXG52YXIgcHJldiA9IHt9O1xuXG4vKipcbiAqIFByZXZpb3VzbHkgYXNzaWduZWQgY29sb3IuXG4gKi9cblxudmFyIHByZXZDb2xvciA9IDA7XG5cbi8qKlxuICogSXMgc3Rkb3V0IGEgVFRZPyBDb2xvcmVkIG91dHB1dCBpcyBkaXNhYmxlZCB3aGVuIGB0cnVlYC5cbiAqL1xuXG52YXIgaXNhdHR5ID0gdHR5LmlzYXR0eSgyKTtcblxuLyoqXG4gKiBTZWxlY3QgYSBjb2xvci5cbiAqXG4gKiBAcmV0dXJuIHtOdW1iZXJ9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBjb2xvcigpIHtcbiAgcmV0dXJuIGNvbG9yc1twcmV2Q29sb3IrKyAlIGNvbG9ycy5sZW5ndGhdO1xufVxuXG4vKipcbiAqIEh1bWFuaXplIHRoZSBnaXZlbiBgbXNgLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBtXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBodW1hbml6ZShtcykge1xuICB2YXIgc2VjID0gMTAwMFxuICAgICwgbWluID0gNjAgKiAxMDAwXG4gICAgLCBob3VyID0gNjAgKiBtaW47XG5cbiAgaWYgKG1zID49IGhvdXIpIHJldHVybiAobXMgLyBob3VyKS50b0ZpeGVkKDEpICsgJ2gnO1xuICBpZiAobXMgPj0gbWluKSByZXR1cm4gKG1zIC8gbWluKS50b0ZpeGVkKDEpICsgJ20nO1xuICBpZiAobXMgPj0gc2VjKSByZXR1cm4gKG1zIC8gc2VjIHwgMCkgKyAncyc7XG4gIHJldHVybiBtcyArICdtcyc7XG59XG5cbi8qKlxuICogQ3JlYXRlIGEgZGVidWdnZXIgd2l0aCB0aGUgZ2l2ZW4gYG5hbWVgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gKiBAcmV0dXJuIHtUeXBlfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBkZWJ1ZyhuYW1lKSB7XG4gIGZ1bmN0aW9uIGRpc2FibGVkKCl7fVxuICBkaXNhYmxlZC5lbmFibGVkID0gZmFsc2U7XG5cbiAgdmFyIG1hdGNoID0gc2tpcHMuc29tZShmdW5jdGlvbihyZSl7XG4gICAgcmV0dXJuIHJlLnRlc3QobmFtZSk7XG4gIH0pO1xuXG4gIGlmIChtYXRjaCkgcmV0dXJuIGRpc2FibGVkO1xuXG4gIG1hdGNoID0gbmFtZXMuc29tZShmdW5jdGlvbihyZSl7XG4gICAgcmV0dXJuIHJlLnRlc3QobmFtZSk7XG4gIH0pO1xuXG4gIGlmICghbWF0Y2gpIHJldHVybiBkaXNhYmxlZDtcbiAgdmFyIGMgPSBjb2xvcigpO1xuXG4gIGZ1bmN0aW9uIGNvbG9yZWQoZm10KSB7XG4gICAgZm10ID0gY29lcmNlKGZtdCk7XG5cbiAgICB2YXIgY3VyciA9IG5ldyBEYXRlO1xuICAgIHZhciBtcyA9IGN1cnIgLSAocHJldltuYW1lXSB8fCBjdXJyKTtcbiAgICBwcmV2W25hbWVdID0gY3VycjtcblxuICAgIGZtdCA9ICcgIFxcdTAwMWJbOScgKyBjICsgJ20nICsgbmFtZSArICcgJ1xuICAgICAgKyAnXFx1MDAxYlszJyArIGMgKyAnbVxcdTAwMWJbOTBtJ1xuICAgICAgKyBmbXQgKyAnXFx1MDAxYlszJyArIGMgKyAnbSdcbiAgICAgICsgJyArJyArIGh1bWFuaXplKG1zKSArICdcXHUwMDFiWzBtJztcblxuICAgIGNvbnNvbGUuZXJyb3IuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHBsYWluKGZtdCkge1xuICAgIGZtdCA9IGNvZXJjZShmbXQpO1xuXG4gICAgZm10ID0gbmV3IERhdGUoKS50b1VUQ1N0cmluZygpXG4gICAgICArICcgJyArIG5hbWUgKyAnICcgKyBmbXQ7XG4gICAgY29uc29sZS5lcnJvci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG5cbiAgY29sb3JlZC5lbmFibGVkID0gcGxhaW4uZW5hYmxlZCA9IHRydWU7XG5cbiAgcmV0dXJuIGlzYXR0eSB8fCBwcm9jZXNzLmVudi5ERUJVR19DT0xPUlNcbiAgICA/IGNvbG9yZWRcbiAgICA6IHBsYWluO1xufVxuXG4vKipcbiAqIENvZXJjZSBgdmFsYC5cbiAqL1xuXG5mdW5jdGlvbiBjb2VyY2UodmFsKSB7XG4gIGlmICh2YWwgaW5zdGFuY2VvZiBFcnJvcikgcmV0dXJuIHZhbC5zdGFjayB8fCB2YWwubWVzc2FnZTtcbiAgcmV0dXJuIHZhbDtcbn1cbiIsIi8qKlxuICogU3VwcG9ydCB2YWx1ZXNcbiAqL1xuXG52YXIgcmVsaWFibGVNYXJnaW5SaWdodDtcbnZhciBib3hTaXppbmdSZWxpYWJsZVZhbDtcbnZhciBwaXhlbFBvc2l0aW9uVmFsO1xudmFyIGNsZWFyQ2xvbmVTdHlsZTtcblxuLyoqXG4gKiBDb250YWluZXIgc2V0dXBcbiAqL1xuXG52YXIgZG9jRWxlbSA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcbnZhciBjb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbnZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblxuLyoqXG4gKiBDbGVhciBjbG9uZSBzdHlsZVxuICovXG5cbmRpdi5zdHlsZS5iYWNrZ3JvdW5kQ2xpcCA9ICdjb250ZW50LWJveCc7XG5kaXYuY2xvbmVOb2RlKHRydWUpLnN0eWxlLmJhY2tncm91bmRDbGlwID0gJyc7XG5leHBvcnRzLmNsZWFyQ2xvbmVTdHlsZSA9IGRpdi5zdHlsZS5iYWNrZ3JvdW5kQ2xpcCA9PT0gJ2NvbnRlbnQtYm94JztcblxuY29udGFpbmVyLnN0eWxlLmNzc1RleHQgPSAnYm9yZGVyOjA7d2lkdGg6MDtoZWlnaHQ6MDtwb3NpdGlvbjphYnNvbHV0ZTt0b3A6MDtsZWZ0Oi05OTk5cHg7bWFyZ2luLXRvcDoxcHgnO1xuY29udGFpbmVyLmFwcGVuZENoaWxkKGRpdik7XG5cbi8qKlxuICogUGl4ZWwgcG9zaXRpb25cbiAqXG4gKiBXZWJraXQgYnVnOiBodHRwczovL2J1Z3Mud2Via2l0Lm9yZy9zaG93X2J1Zy5jZ2k/aWQ9MjkwODRcbiAqIGdldENvbXB1dGVkU3R5bGUgcmV0dXJucyBwZXJjZW50IHdoZW4gc3BlY2lmaWVkIGZvciB0b3AvbGVmdC9ib3R0b20vcmlnaHRcbiAqIHJhdGhlciB0aGFuIG1ha2UgdGhlIGNzcyBtb2R1bGUgZGVwZW5kIG9uIHRoZSBvZmZzZXQgbW9kdWxlLCB3ZSBqdXN0IGNoZWNrIGZvciBpdCBoZXJlXG4gKi9cblxuZXhwb3J0cy5waXhlbFBvc2l0aW9uID0gZnVuY3Rpb24oKSB7XG4gIGlmICh1bmRlZmluZWQgPT0gcGl4ZWxQb3NpdGlvblZhbCkgY29tcHV0ZVBpeGVsUG9zaXRpb25BbmRCb3hTaXppbmdSZWxpYWJsZSgpO1xuICByZXR1cm4gcGl4ZWxQb3NpdGlvblZhbDtcbn1cblxuLyoqXG4gKiBSZWxpYWJsZSBib3ggc2l6aW5nXG4gKi9cblxuZXhwb3J0cy5ib3hTaXppbmdSZWxpYWJsZSA9IGZ1bmN0aW9uKCkge1xuICBpZiAodW5kZWZpbmVkID09IGJveFNpemluZ1JlbGlhYmxlVmFsKSBjb21wdXRlUGl4ZWxQb3NpdGlvbkFuZEJveFNpemluZ1JlbGlhYmxlKCk7XG4gIHJldHVybiBib3hTaXppbmdSZWxpYWJsZVZhbDtcbn1cblxuLyoqXG4gKiBSZWxpYWJsZSBtYXJnaW4gcmlnaHRcbiAqXG4gKiBTdXBwb3J0OiBBbmRyb2lkIDIuM1xuICogQ2hlY2sgaWYgZGl2IHdpdGggZXhwbGljaXQgd2lkdGggYW5kIG5vIG1hcmdpbi1yaWdodCBpbmNvcnJlY3RseVxuICogZ2V0cyBjb21wdXRlZCBtYXJnaW4tcmlnaHQgYmFzZWQgb24gd2lkdGggb2YgY29udGFpbmVyLiAoIzMzMzMpXG4gKiBXZWJLaXQgQnVnIDEzMzQzIC0gZ2V0Q29tcHV0ZWRTdHlsZSByZXR1cm5zIHdyb25nIHZhbHVlIGZvciBtYXJnaW4tcmlnaHRcbiAqIFRoaXMgc3VwcG9ydCBmdW5jdGlvbiBpcyBvbmx5IGV4ZWN1dGVkIG9uY2Ugc28gbm8gbWVtb2l6aW5nIGlzIG5lZWRlZC5cbiAqXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5cbmV4cG9ydHMucmVsaWFibGVNYXJnaW5SaWdodCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgcmV0O1xuICB2YXIgbWFyZ2luRGl2ID0gZGl2LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiApKTtcblxuICBtYXJnaW5EaXYuc3R5bGUuY3NzVGV4dCA9IGRpdi5zdHlsZS5jc3NUZXh0ID0gZGl2UmVzZXQ7XG4gIG1hcmdpbkRpdi5zdHlsZS5tYXJnaW5SaWdodCA9IG1hcmdpbkRpdi5zdHlsZS53aWR0aCA9IFwiMFwiO1xuICBkaXYuc3R5bGUud2lkdGggPSBcIjFweFwiO1xuICBkb2NFbGVtLmFwcGVuZENoaWxkKGNvbnRhaW5lcik7XG5cbiAgcmV0ID0gIXBhcnNlRmxvYXQod2luZG93LmdldENvbXB1dGVkU3R5bGUobWFyZ2luRGl2LCBudWxsKS5tYXJnaW5SaWdodCk7XG5cbiAgZG9jRWxlbS5yZW1vdmVDaGlsZChjb250YWluZXIpO1xuXG4gIC8vIENsZWFuIHVwIHRoZSBkaXYgZm9yIG90aGVyIHN1cHBvcnQgdGVzdHMuXG4gIGRpdi5pbm5lckhUTUwgPSBcIlwiO1xuXG4gIHJldHVybiByZXQ7XG59XG5cbi8qKlxuICogRXhlY3V0aW5nIGJvdGggcGl4ZWxQb3NpdGlvbiAmIGJveFNpemluZ1JlbGlhYmxlIHRlc3RzIHJlcXVpcmUgb25seSBvbmUgbGF5b3V0XG4gKiBzbyB0aGV5J3JlIGV4ZWN1dGVkIGF0IHRoZSBzYW1lIHRpbWUgdG8gc2F2ZSB0aGUgc2Vjb25kIGNvbXB1dGF0aW9uLlxuICovXG5cbmZ1bmN0aW9uIGNvbXB1dGVQaXhlbFBvc2l0aW9uQW5kQm94U2l6aW5nUmVsaWFibGUoKSB7XG4gIC8vIFN1cHBvcnQ6IEZpcmVmb3gsIEFuZHJvaWQgMi4zIChQcmVmaXhlZCBib3gtc2l6aW5nIHZlcnNpb25zKS5cbiAgZGl2LnN0eWxlLmNzc1RleHQgPSBcIi13ZWJraXQtYm94LXNpemluZzpib3JkZXItYm94Oy1tb3otYm94LXNpemluZzpib3JkZXItYm94O1wiICtcbiAgICBcImJveC1zaXppbmc6Ym9yZGVyLWJveDtwYWRkaW5nOjFweDtib3JkZXI6MXB4O2Rpc3BsYXk6YmxvY2s7d2lkdGg6NHB4O21hcmdpbi10b3A6MSU7XCIgK1xuICAgIFwicG9zaXRpb246YWJzb2x1dGU7dG9wOjElXCI7XG4gIGRvY0VsZW0uYXBwZW5kQ2hpbGQoY29udGFpbmVyKTtcblxuICB2YXIgZGl2U3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShkaXYsIG51bGwpO1xuICBwaXhlbFBvc2l0aW9uVmFsID0gZGl2U3R5bGUudG9wICE9PSBcIjElXCI7XG4gIGJveFNpemluZ1JlbGlhYmxlVmFsID0gZGl2U3R5bGUud2lkdGggPT09IFwiNHB4XCI7XG5cbiAgZG9jRWxlbS5yZW1vdmVDaGlsZChjb250YWluZXIpO1xufVxuXG5cbiIsIlxudmFyIHRvU3BhY2UgPSByZXF1aXJlKCd0by1zcGFjZS1jYXNlJyk7XG5cblxuLyoqXG4gKiBFeHBvc2UgYHRvQ2FtZWxDYXNlYC5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHRvQ2FtZWxDYXNlO1xuXG5cbi8qKlxuICogQ29udmVydCBhIGBzdHJpbmdgIHRvIGNhbWVsIGNhc2UuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0cmluZ1xuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5cblxuZnVuY3Rpb24gdG9DYW1lbENhc2UgKHN0cmluZykge1xuICByZXR1cm4gdG9TcGFjZShzdHJpbmcpLnJlcGxhY2UoL1xccyhcXHcpL2csIGZ1bmN0aW9uIChtYXRjaGVzLCBsZXR0ZXIpIHtcbiAgICByZXR1cm4gbGV0dGVyLnRvVXBwZXJDYXNlKCk7XG4gIH0pO1xufSIsIlxudmFyIHBhcnNlQ29sb3IgPSByZXF1aXJlKCdjb2xvci1wYXJzZXInKVxudmFyIHByZWZpeCA9IHJlcXVpcmUoJ3ByZWZpeCcpXG5cbm1vZHVsZS5leHBvcnRzID0gdHdlZW5cblxudmFyIGRlZmF1bHRUeXBlcyA9IHtcbiAgZmlsbE9wYWNpdHk6ICdudW1iZXInLFxuICBmb250V2VpZ2h0OiAnbnVtYmVyJyxcbiAgb3BhY2l0eTogJ251bWJlcicsXG4gIHpJbmRleDogJ251bWJlcicsXG4gIHpvb206ICdudW1iZXInLFxuICB0cmFuc2Zvcm06ICdtYXRyaXgnLFxuICBkOiAncGF0aCdcbn1cblxuZGVmYXVsdFR5cGVzW3ByZWZpeCgndHJhbnNmb3JtJyldID0gJ21hdHJpeCdcblxuLyoqXG4gKiBjcmVhdGUgYSB0d2VlbiBmdW5jdGlvblxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBwcm9wXG4gKiBAcGFyYW0ge0FueX0gZnJvbVxuICogQHBhcmFtIHtBbnl9IHRvXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqL1xuXG5mdW5jdGlvbiB0d2Vlbihwcm9wLCBmcm9tLCB0byl7XG4gIHZhciBmbiA9IHR5cGVvZiB0byA9PSAnc3RyaW5nJyAmJiB0d2Vlblt0eXBlKHRvKV1cbiAgaWYgKCFmbikgZm4gPSB0d2VlbltkZWZhdWx0VHlwZXNbcHJvcF0gfHwgJ3B4J11cbiAgcmV0dXJuIGZuKGZyb20sIHRvKVxufVxuXG50d2Vlbi5udW1iZXIgPSByZXF1aXJlKCcuL251bWJlcicpXG50d2Vlbi5tYXRyaXggPSByZXF1aXJlKCcuL21hdHJpeCcpXG50d2Vlbi5jb2xvciA9IHJlcXVpcmUoJy4vY29sb3InKVxudHdlZW4ucGF0aCA9IHJlcXVpcmUoJy4vcGF0aCcpXG50d2Vlbi5weCA9IHJlcXVpcmUoJy4vcHgnKVxuXG4vKipcbiAqIGRldGVybWluZSB0eXBlIG9mIGBjc3NgIHZhbHVlXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGNzc1xuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gdHlwZShjc3Mpe1xuICBpZiAoL15tYXRyaXgoM2QpP1xcKFteKV0qXFwpJC8udGVzdChjc3MpKSByZXR1cm4gJ21hdHJpeCdcbiAgaWYgKC9eWy0uXFxkXStweC8udGVzdChjc3MpKSByZXR1cm4gJ3B4J1xuICBpZiAocGFyc2VDb2xvcihjc3MpKSByZXR1cm4gJ2NvbG9yJ1xufVxuIiwiXCJ1c2Ugc3RyaWN0XCJcblxuZnVuY3Rpb24gYWRkTGF6eVByb3BlcnR5KG9iamVjdCwgbmFtZSwgaW5pdGlhbGl6ZXIsIGVudW1lcmFibGUpIHtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iamVjdCwgbmFtZSwge1xuICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgdiA9IGluaXRpYWxpemVyLmNhbGwodGhpcylcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBuYW1lLCB7IHZhbHVlOiB2LCBlbnVtZXJhYmxlOiAhIWVudW1lcmFibGUsIHdyaXRhYmxlOiB0cnVlIH0pXG4gICAgICByZXR1cm4gdlxuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbih2KSB7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgbmFtZSwgeyB2YWx1ZTogdiwgZW51bWVyYWJsZTogISFlbnVtZXJhYmxlLCB3cml0YWJsZTogdHJ1ZSB9KVxuICAgICAgcmV0dXJuIHZcbiAgICB9LFxuICAgIGVudW1lcmFibGU6ICEhZW51bWVyYWJsZSxcbiAgICBjb25maWd1cmFibGU6IHRydWVcbiAgfSlcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBhZGRMYXp5UHJvcGVydHlcbiIsIlxuLyoqXG4gKiBkZXBlbmRlbmNpZXNcbiAqL1xuXG52YXIgaW5oZXJpdCA9IHJlcXVpcmUoJ2luaGVyaXQnKTtcbnZhciBtZXJnZSA9IHJlcXVpcmUoJ21lcmdlJyk7XG5cbi8qKlxuICogRXhwb3J0IGBleHRlbnNpYmxlYFxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZXh0ZW5zaWJsZTtcblxuLyoqXG4gKiBNYWtlIHRoZSBnaXZlbiBgQWAgZXh0ZW5zaWJsZS5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBBXG4gKiBAcmV0dXJuIHtBfVxuICovXG5cbmZ1bmN0aW9uIGV4dGVuc2libGUoQSl7XG4gIEEuZXh0ZW5kID0gZXh0ZW5kO1xuICByZXR1cm4gQTtcbn07XG5cbi8qKlxuICogbWFrZSBgY2hpbGRgIGluaGVyaXQgZnJvbSBgdGhpc2AuIFVubGVzcyBgZmluYWxgLFxuICogYGNoaWxkYCB3aWxsIGFsc28gYmUgbWFkZSBleHRlbnNpYmxlLiBJZiB5b3UgZG9uJ3QgXG4gKiBwYXNzIGEgYGNoaWxkYCBhIG5ldyBvbmUgd2lsbCBiZSBjcmVhdGVkLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtjaGlsZF1cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gW2ZpbmFsXVxuICogQHJldHVybiB7Y2hpbGR9XG4gKi9cblxuZnVuY3Rpb24gZXh0ZW5kKGNoaWxkLCBmaW5hbCl7XG4gIHZhciBBID0gdGhpcztcbiAgdmFyIEIgPSAnZnVuY3Rpb24nICE9IHR5cGVvZiBjaGlsZFxuICAgID8gZnVuY3Rpb24oKXsgQS5hcHBseSh0aGlzLCBhcmd1bWVudHMpOyB9XG4gICAgOiBjaGlsZDtcbiAgIWZpbmFsICYmIGV4dGVuc2libGUoQik7XG4gIGluaGVyaXQoQiwgQSk7XG4gIGlmICgnb2JqZWN0JyA9PSB0eXBlb2YgY2hpbGQpIG1lcmdlKEIucHJvdG90eXBlLCBjaGlsZCk7XG4gIHJldHVybiBCO1xufTtcbiIsIlxudmFyIG1lcmdlID0gcmVxdWlyZSgnbWVyZ2UnKVxudmFyIG93biA9IE9iamVjdC5oYXNPd25Qcm9wZXJ0eVxudmFyIGNhbGwgPSBGdW5jdGlvbi5jYWxsXG5cbm1vZHVsZS5leHBvcnRzID0gRW1pdHRlclxuXG4vKipcbiAqIEVtaXR0ZXIgY29uc3RydWN0b3IuIENhbiBvcHRpb25hbGx5IGFsc28gYWN0IGFzIGEgbWl4aW5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gW29ial1cbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xuXG5mdW5jdGlvbiBFbWl0dGVyKG9iail7XG5cdGlmIChvYmopIHJldHVybiBtZXJnZShvYmosIEVtaXR0ZXIucHJvdG90eXBlKVxufVxuXG4vKipcbiAqIFByb2Nlc3MgYGV2ZW50YC4gQWxsIGFyZ3VtZW50cyBhZnRlciBgdG9waWNgIHdpbGxcbiAqIGJlIHBhc3NlZCB0byBhbGwgbGlzdGVuZXJzXG4gKlxuICogICBlbWl0dGVyLmVtaXQoJ2V2ZW50JywgbmV3IERhdGUpXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHRvcGljXG4gKiBAcGFyYW0ge0FueX0gWy4uLmFyZ3NdXG4gKiBAcmV0dXJuIHt0aGlzfVxuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbih0b3BpYyl7XG5cdHZhciBzdWIgPSB0aGlzLl9ldmVudHNcblx0aWYgKCEoc3ViICYmIChzdWIgPSBzdWJbdG9waWNdKSkpIHJldHVybiB0aGlzXG5cdC8vIHNpbmdsZSBzdWJzcmlwdGlvbiBjYXNlXG5cdGlmICh0eXBlb2Ygc3ViID09ICdmdW5jdGlvbicpIHtcblx0XHQvLyBhdm9pZCB1c2luZyAuYXBwbHkoKSBmb3Igc3BlZWRcblx0XHRzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcblx0XHRcdGNhc2UgMTogc3ViLmNhbGwodGhpcyk7YnJlYWtcblx0XHRcdGNhc2UgMjogc3ViLmNhbGwodGhpcywgYXJndW1lbnRzWzFdKTticmVha1xuXHRcdFx0Y2FzZSAzOiBzdWIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSk7YnJlYWtcblx0XHRcdGNhc2UgNDogc3ViLmNhbGwodGhpcywgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0sIGFyZ3VtZW50c1szXSk7YnJlYWtcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdC8vIGBhcmd1bWVudHNgIGlzIG1hZ2ljIDopXG5cdFx0XHRcdHRvcGljID0gdGhpc1xuXHRcdFx0XHRjYWxsLmFwcGx5KHN1YiwgYXJndW1lbnRzKVxuXHRcdH1cblx0fSBlbHNlIHtcblx0XHR2YXIgZm5cblx0XHR2YXIgaSA9IDBcblx0XHR2YXIgbCA9IHN1Yi5sZW5ndGhcblx0XHRzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcblx0XHRcdGNhc2UgMTogd2hpbGUgKGkgPCBsKSBzdWJbaSsrXS5jYWxsKHRoaXMpO2JyZWFrXG5cdFx0XHRjYXNlIDI6IHdoaWxlIChpIDwgbCkgc3ViW2krK10uY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0pO2JyZWFrXG5cdFx0XHRjYXNlIDM6IHdoaWxlIChpIDwgbCkgc3ViW2krK10uY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSk7YnJlYWtcblx0XHRcdGNhc2UgNDogd2hpbGUgKGkgPCBsKSBzdWJbaSsrXS5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdLCBhcmd1bWVudHNbM10pO2JyZWFrXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHR0b3BpYyA9IHRoaXNcblx0XHRcdFx0d2hpbGUgKGkgPCBsKSBjYWxsLmFwcGx5KHN1YltpKytdLCBhcmd1bWVudHMpXG5cdFx0fVxuXHR9XG5cdHJldHVybiB0aGlzXG59XG5cbi8qKlxuICogQWRkIGEgc3Vic2NyaXB0aW9uIHVuZGVyIGEgdG9waWMgbmFtZVxuICpcbiAqICAgZW1pdHRlci5vbignZXZlbnQnLCBmdW5jdGlvbihkYXRhKXt9KVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB0b3BpY1xuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge3RoaXN9XG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUub24gPSBmdW5jdGlvbih0b3BpYywgZm4pe1xuXHRpZiAoIW93bi5jYWxsKHRoaXMsICdfZXZlbnRzJykpIHRoaXMuX2V2ZW50cyA9IGNsb25lKHRoaXMuX2V2ZW50cylcblx0dmFyIGV2ZW50cyA9IHRoaXMuX2V2ZW50c1xuXHRpZiAodHlwZW9mIGV2ZW50c1t0b3BpY10gPT0gJ2Z1bmN0aW9uJykge1xuXHRcdGV2ZW50c1t0b3BpY10gPSBbZXZlbnRzW3RvcGljXSwgZm5dXG5cdH0gZWxzZSBpZiAoZXZlbnRzW3RvcGljXSkge1xuXHRcdGV2ZW50c1t0b3BpY10gPSBldmVudHNbdG9waWNdLmNvbmNhdChmbilcblx0fSBlbHNlIHtcblx0XHRldmVudHNbdG9waWNdID0gZm5cblx0fVxuXHRyZXR1cm4gdGhpc1xufVxuXG4vKipcbiAqIFJlbW92ZSBzdWJzY3JpcHRpb25zXG4gKlxuICogICBlbWl0dGVyLm9mZigpICAgICAgICAgICAgLy8gY2xlYXJzIGFsbCBsaXN0ZW5lcnNcbiAqICAgZW1pdHRlci5vZmYoJ3RvcGljJykgICAgIC8vIGNsZWFycyBhbGwgYHRvcGljYCBsaXN0ZW5lcnNcbiAqICAgZW1pdHRlci5vZmYoJ3RvcGljJywgZm4pIC8vIGFzIGFib3ZlIGJ1dCBvbmx5IHdoZXJlIGBsaXN0ZW5lciA9PSBmbmBcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gW3RvcGljXVxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2ZuXVxuICogQHJldHVybiB7dGhpc31cbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5vZmYgPSBmdW5jdGlvbih0b3BpYywgZm4pe1xuXHRpZiAoIXRoaXMuX2V2ZW50cykgcmV0dXJuIHRoaXNcblx0aWYgKCFvd24uY2FsbCh0aGlzLCAnX2V2ZW50cycpKSB0aGlzLl9ldmVudHMgPSBjbG9uZSh0aGlzLl9ldmVudHMpXG5cdHZhciBldmVudHMgPSB0aGlzLl9ldmVudHNcblxuXHRpZiAodG9waWMgPT0gbnVsbCkge1xuXHRcdGZvciAodmFyIGkgaW4gZXZlbnRzKSBkZWxldGUgZXZlbnRzW2ldXG5cdH0gZWxzZSBpZiAoZm4gPT0gbnVsbCkge1xuXHRcdGRlbGV0ZSBldmVudHNbdG9waWNdXG5cdH0gZWxzZSB7XG5cdFx0dmFyIHN1YnMgPSBldmVudHNbdG9waWNdXG5cdFx0aWYgKCFzdWJzKSByZXR1cm4gdGhpc1xuXHRcdGlmICh0eXBlb2Ygc3VicyA9PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRpZiAoc3VicyA9PT0gZm4pIGRlbGV0ZSBldmVudHNbdG9waWNdXG5cdFx0fSBlbHNlIHtcblx0XHRcdHN1YnMgPSBldmVudHNbdG9waWNdID0gc3Vicy5maWx0ZXIoZnVuY3Rpb24obGlzdGVuZXIpe1xuXHRcdFx0XHRyZXR1cm4gbGlzdGVuZXIgIT09IGZuXG5cdFx0XHR9KVxuXHRcdFx0Ly8gdGlkeVxuXHRcdFx0aWYgKHN1YnMubGVuZ3RoID09IDEpIGV2ZW50c1t0b3BpY10gPSBzdWJzWzBdXG5cdFx0XHRlbHNlIGlmICghc3Vicy5sZW5ndGgpIGRlbGV0ZSBldmVudHNbdG9waWNdXG5cdFx0fVxuXHR9XG5cdHJldHVybiB0aGlzXG59XG5cbi8qKlxuICogc3Vic2NyaWJlIGBmbmAgYnV0IHJlbW92ZSBpZiBhZnRlciBpdHMgZmlyc3QgaW52b2NhdGlvblxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB0b3BpY1xuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge3RoaXN9XG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uKHRvcGljLCBmbil7XG5cdHZhciBzZWxmID0gdGhpc1xuXHRyZXR1cm4gdGhpcy5vbih0b3BpYywgZnVuY3Rpb24gb25jZSgpe1xuXHRcdHNlbGYub2ZmKHRvcGljLCBvbmNlKVxuXHRcdGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cylcblx0fSlcbn1cblxuLyoqXG4gKiBzZWUgaWYgYGVtaXR0ZXJgIGhhcyBhbnkgc3Vic2NyaXB0aW9ucyBtYXRjaGluZ1xuICogYHRvcGljYCBhbmQgb3B0aW9uYWxseSBhbHNvIGBmbmBcbiAqXG4gKiBAcGFyYW0ge0VtaXR0ZXJ9IGVtaXR0ZXJcbiAqIEBwYXJhbSB7U3RyaW5nfSB0b3BpY1xuICogQHBhcmFtIHtGdW5jdGlvbn0gW2ZuXVxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuXG5FbWl0dGVyLmhhc1N1YnNjcmlwdGlvbiA9IGZ1bmN0aW9uKGVtaXR0ZXIsIHRvcGljLCBmbil7XG5cdHZhciBmbnMgPSBFbWl0dGVyLnN1YnNjcmlwdGlvbnMoZW1pdHRlciwgdG9waWMpXG5cdGlmIChmbiA9PSBudWxsKSByZXR1cm4gQm9vbGVhbihmbnMubGVuZ3RoKVxuXHRyZXR1cm4gZm5zLmluZGV4T2YoZm4pID49IDBcbn1cblxuLyoqXG4gKiBnZXQgYW4gQXJyYXkgb2Ygc3Vic2NyaXB0aW9ucyBmb3IgYHRvcGljYFxuICpcbiAqIEBwYXJhbSB7RW1pdHRlcn0gZW1pdHRlclxuICogQHBhcmFtIHtTdHJpbmd9IHRvcGljXG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqL1xuXG5FbWl0dGVyLnN1YnNjcmlwdGlvbnMgPSBmdW5jdGlvbihlbWl0dGVyLCB0b3BpYyl7XG5cdHZhciBmbnMgPSBlbWl0dGVyLl9ldmVudHNcblx0aWYgKCFmbnMgfHwgIShmbnMgPSBmbnNbdG9waWNdKSkgcmV0dXJuIFtdXG5cdGlmICh0eXBlb2YgZm5zID09ICdmdW5jdGlvbicpIHJldHVybiBbZm5zXVxuXHRyZXR1cm4gZm5zLnNsaWNlKClcbn1cblxuZnVuY3Rpb24gY2xvbmUob2JqKXtcblx0cmV0dXJuIG1lcmdlKHt9LCBvYmopXG59XG4iLCJcbnZhciBnbG9iYWwgPSBmdW5jdGlvbigpe3JldHVybiB0aGlzfSgpXG52YXIgcGVyZm9ybWFuY2UgPSBnbG9iYWwucGVyZm9ybWFuY2VcblxuLyoqXG4gKiBHZXQgYSB0aW1lc3RhbXBcbiAqIFxuICogQHJldHVybiB7TnVtYmVyfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XG4gIHJldHVybiBwZXJmb3JtYW5jZS5ub3coKVxufVxuXG4vLyBmYWxsYmFja1xuXG5pZiAoIXBlcmZvcm1hbmNlIHx8IHR5cGVvZiBwZXJmb3JtYW5jZS5ub3cgIT0gJ2Z1bmN0aW9uJykge1xuXHRtb2R1bGUuZXhwb3J0cyA9IERhdGUubm93IHx8IGZ1bmN0aW9uKCl7IHJldHVybiArKG5ldyBEYXRlKSB9XG59XG4iLCJcbnZhciB0b1N0cmluZyA9IHt9LnRvU3RyaW5nXG52YXIgRG9tTm9kZSA9IHR5cGVvZiB3aW5kb3cgIT0gJ3VuZGVmaW5lZCdcblx0PyB3aW5kb3cuTm9kZVxuXHQ6IEZ1bmN0aW9uXG5cbi8qKlxuICogUmV0dXJuIHRoZSB0eXBlIG9mIGB2YWxgLlxuICpcbiAqIEBwYXJhbSB7TWl4ZWR9IHZhbFxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBmdW5jdGlvbih4KXtcblx0dmFyIHR5cGUgPSB0eXBlb2YgeFxuXHRpZiAodHlwZSAhPSAnb2JqZWN0JykgcmV0dXJuIHR5cGVcblx0dHlwZSA9IHR5cGVzW3RvU3RyaW5nLmNhbGwoeCldXG5cdGlmICh0eXBlKSByZXR1cm4gdHlwZVxuXHRpZiAoeCBpbnN0YW5jZW9mIERvbU5vZGUpIHN3aXRjaCAoeC5ub2RlVHlwZSkge1xuXHRcdGNhc2UgMTogIHJldHVybiAnZWxlbWVudCdcblx0XHRjYXNlIDM6ICByZXR1cm4gJ3RleHQtbm9kZSdcblx0XHRjYXNlIDk6ICByZXR1cm4gJ2RvY3VtZW50J1xuXHRcdGNhc2UgMTE6IHJldHVybiAnZG9jdW1lbnQtZnJhZ21lbnQnXG5cdFx0ZGVmYXVsdDogcmV0dXJuICdkb20tbm9kZSdcblx0fVxufVxuXG52YXIgdHlwZXMgPSBleHBvcnRzLnR5cGVzID0ge1xuXHQnW29iamVjdCBGdW5jdGlvbl0nOiAnZnVuY3Rpb24nLFxuXHQnW29iamVjdCBEYXRlXSc6ICdkYXRlJyxcblx0J1tvYmplY3QgUmVnRXhwXSc6ICdyZWdleHAnLFxuXHQnW29iamVjdCBBcmd1bWVudHNdJzogJ2FyZ3VtZW50cycsXG5cdCdbb2JqZWN0IEFycmF5XSc6ICdhcnJheScsXG5cdCdbb2JqZWN0IFN0cmluZ10nOiAnc3RyaW5nJyxcblx0J1tvYmplY3QgTnVsbF0nOiAnbnVsbCcsXG5cdCdbb2JqZWN0IFVuZGVmaW5lZF0nOiAndW5kZWZpbmVkJyxcblx0J1tvYmplY3QgTnVtYmVyXSc6ICdudW1iZXInLFxuXHQnW29iamVjdCBCb29sZWFuXSc6ICdib29sZWFuJyxcblx0J1tvYmplY3QgT2JqZWN0XSc6ICdvYmplY3QnLFxuXHQnW29iamVjdCBUZXh0XSc6ICd0ZXh0LW5vZGUnLFxuXHQnW29iamVjdCBVaW50OEFycmF5XSc6ICc4Yml0LWFycmF5Jyxcblx0J1tvYmplY3QgVWludDE2QXJyYXldJzogJzE2Yml0LWFycmF5Jyxcblx0J1tvYmplY3QgVWludDMyQXJyYXldJzogJzMyYml0LWFycmF5Jyxcblx0J1tvYmplY3QgVWludDhDbGFtcGVkQXJyYXldJzogJzhiaXQtYXJyYXknLFxuXHQnW29iamVjdCBFcnJvcl0nOiAnZXJyb3InLFxuXHQnW29iamVjdCBGb3JtRGF0YV0nOiAnZm9ybS1kYXRhJyxcblx0J1tvYmplY3QgRmlsZV0nOiAnZmlsZScsXG5cdCdbb2JqZWN0IEJsb2JdJzogJ2Jsb2InXG59IiwiXG52YXIgZHVyYXRpb24gPSAvKC0/XFxkKlxcLj9cXGQrKD86ZVstK10/XFxkKyk/KVxccyooW2Etel0qKS9pZ1xuXG5tb2R1bGUuZXhwb3J0cyA9IHBhcnNlXG5cbi8qKlxuICogY29udmVyc2lvbiByYXRpb3NcbiAqL1xuXG5wYXJzZS5tcyA9IDFcbnBhcnNlLnNlY29uZHMgPVxucGFyc2Uuc2Vjb25kID1cbnBhcnNlLnNlYyA9XG5wYXJzZS5zID0gcGFyc2UubXMgKiAxMDAwXG5wYXJzZS5taW51dGVzID1cbnBhcnNlLm1pbnV0ZSA9XG5wYXJzZS5taW4gPVxucGFyc2UubWlucyA9XG5wYXJzZS5tID0gcGFyc2UucyAqIDYwXG5wYXJzZS5ob3VycyA9XG5wYXJzZS5ob3VyID1cbnBhcnNlLmhyID1cbnBhcnNlLmggPSBwYXJzZS5tICogNjBcbnBhcnNlLmRheXMgPVxucGFyc2UuZGF5ID1cbnBhcnNlLmQgPSBwYXJzZS5oICogMjRcbnBhcnNlLndlZWtzID1cbnBhcnNlLndlZWsgPVxucGFyc2Uud2sgPVxucGFyc2UudyA9IHBhcnNlLmQgKiA3XG5wYXJzZS55ZWFycyA9XG5wYXJzZS55ZWFyID1cbnBhcnNlLnlyID1cbnBhcnNlLnkgPSBwYXJzZS5kICogMzY1LjI1XG5cbi8qKlxuICogY29udmVydCBgc3RyYCB0byBtc1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge051bWJlcn1cbiAqL1xuXG5mdW5jdGlvbiBwYXJzZShzdHIpe1xuXHR2YXIgcmVzdWx0ID0gMFxuXHRzdHIucmVwbGFjZShkdXJhdGlvbiwgZnVuY3Rpb24oXywgbiwgdW5pdHMpe1xuXHRcdHJlc3VsdCArPSBwYXJzZUZsb2F0KG4sIDEwKSAqIChwYXJzZVt1bml0c10gfHwgMSlcblx0fSlcblx0cmV0dXJuIHJlc3VsdFxufVxuIiwiXG5leHBvcnRzLmxpbmVhciA9IGZ1bmN0aW9uKG4pe1xuICByZXR1cm4gbjtcbn07XG5cbmV4cG9ydHMuaW5RdWFkID0gZnVuY3Rpb24obil7XG4gIHJldHVybiBuICogbjtcbn07XG5cbmV4cG9ydHMub3V0UXVhZCA9IGZ1bmN0aW9uKG4pe1xuICByZXR1cm4gbiAqICgyIC0gbik7XG59O1xuXG5leHBvcnRzLmluT3V0UXVhZCA9IGZ1bmN0aW9uKG4pe1xuICBuICo9IDI7XG4gIGlmIChuIDwgMSkgcmV0dXJuIDAuNSAqIG4gKiBuO1xuICByZXR1cm4gLSAwLjUgKiAoLS1uICogKG4gLSAyKSAtIDEpO1xufTtcblxuZXhwb3J0cy5pbkN1YmUgPSBmdW5jdGlvbihuKXtcbiAgcmV0dXJuIG4gKiBuICogbjtcbn07XG5cbmV4cG9ydHMub3V0Q3ViZSA9IGZ1bmN0aW9uKG4pe1xuICByZXR1cm4gLS1uICogbiAqIG4gKyAxO1xufTtcblxuZXhwb3J0cy5pbk91dEN1YmUgPSBmdW5jdGlvbihuKXtcbiAgbiAqPSAyO1xuICBpZiAobiA8IDEpIHJldHVybiAwLjUgKiBuICogbiAqIG47XG4gIHJldHVybiAwLjUgKiAoKG4gLT0gMiApICogbiAqIG4gKyAyKTtcbn07XG5cbmV4cG9ydHMuaW5RdWFydCA9IGZ1bmN0aW9uKG4pe1xuICByZXR1cm4gbiAqIG4gKiBuICogbjtcbn07XG5cbmV4cG9ydHMub3V0UXVhcnQgPSBmdW5jdGlvbihuKXtcbiAgcmV0dXJuIDEgLSAoLS1uICogbiAqIG4gKiBuKTtcbn07XG5cbmV4cG9ydHMuaW5PdXRRdWFydCA9IGZ1bmN0aW9uKG4pe1xuICBuICo9IDI7XG4gIGlmIChuIDwgMSkgcmV0dXJuIDAuNSAqIG4gKiBuICogbiAqIG47XG4gIHJldHVybiAtMC41ICogKChuIC09IDIpICogbiAqIG4gKiBuIC0gMik7XG59O1xuXG5leHBvcnRzLmluUXVpbnQgPSBmdW5jdGlvbihuKXtcbiAgcmV0dXJuIG4gKiBuICogbiAqIG4gKiBuO1xufVxuXG5leHBvcnRzLm91dFF1aW50ID0gZnVuY3Rpb24obil7XG4gIHJldHVybiAtLW4gKiBuICogbiAqIG4gKiBuICsgMTtcbn1cblxuZXhwb3J0cy5pbk91dFF1aW50ID0gZnVuY3Rpb24obil7XG4gIG4gKj0gMjtcbiAgaWYgKG4gPCAxKSByZXR1cm4gMC41ICogbiAqIG4gKiBuICogbiAqIG47XG4gIHJldHVybiAwLjUgKiAoKG4gLT0gMikgKiBuICogbiAqIG4gKiBuICsgMik7XG59O1xuXG5leHBvcnRzLmluU2luZSA9IGZ1bmN0aW9uKG4pe1xuICByZXR1cm4gMSAtIE1hdGguY29zKG4gKiBNYXRoLlBJIC8gMiApO1xufTtcblxuZXhwb3J0cy5vdXRTaW5lID0gZnVuY3Rpb24obil7XG4gIHJldHVybiBNYXRoLnNpbihuICogTWF0aC5QSSAvIDIpO1xufTtcblxuZXhwb3J0cy5pbk91dFNpbmUgPSBmdW5jdGlvbihuKXtcbiAgcmV0dXJuIC41ICogKDEgLSBNYXRoLmNvcyhNYXRoLlBJICogbikpO1xufTtcblxuZXhwb3J0cy5pbkV4cG8gPSBmdW5jdGlvbihuKXtcbiAgcmV0dXJuIDAgPT0gbiA/IDAgOiBNYXRoLnBvdygxMDI0LCBuIC0gMSk7XG59O1xuXG5leHBvcnRzLm91dEV4cG8gPSBmdW5jdGlvbihuKXtcbiAgcmV0dXJuIDEgPT0gbiA/IG4gOiAxIC0gTWF0aC5wb3coMiwgLTEwICogbik7XG59O1xuXG5leHBvcnRzLmluT3V0RXhwbyA9IGZ1bmN0aW9uKG4pe1xuICBpZiAoMCA9PSBuKSByZXR1cm4gMDtcbiAgaWYgKDEgPT0gbikgcmV0dXJuIDE7XG4gIGlmICgobiAqPSAyKSA8IDEpIHJldHVybiAuNSAqIE1hdGgucG93KDEwMjQsIG4gLSAxKTtcbiAgcmV0dXJuIC41ICogKC1NYXRoLnBvdygyLCAtMTAgKiAobiAtIDEpKSArIDIpO1xufTtcblxuZXhwb3J0cy5pbkNpcmMgPSBmdW5jdGlvbihuKXtcbiAgcmV0dXJuIDEgLSBNYXRoLnNxcnQoMSAtIG4gKiBuKTtcbn07XG5cbmV4cG9ydHMub3V0Q2lyYyA9IGZ1bmN0aW9uKG4pe1xuICByZXR1cm4gTWF0aC5zcXJ0KDEgLSAoLS1uICogbikpO1xufTtcblxuZXhwb3J0cy5pbk91dENpcmMgPSBmdW5jdGlvbihuKXtcbiAgbiAqPSAyXG4gIGlmIChuIDwgMSkgcmV0dXJuIC0wLjUgKiAoTWF0aC5zcXJ0KDEgLSBuICogbikgLSAxKTtcbiAgcmV0dXJuIDAuNSAqIChNYXRoLnNxcnQoMSAtIChuIC09IDIpICogbikgKyAxKTtcbn07XG5cbmV4cG9ydHMuaW5CYWNrID0gZnVuY3Rpb24obil7XG4gIHZhciBzID0gMS43MDE1ODtcbiAgcmV0dXJuIG4gKiBuICogKCggcyArIDEgKSAqIG4gLSBzKTtcbn07XG5cbmV4cG9ydHMub3V0QmFjayA9IGZ1bmN0aW9uKG4pe1xuICB2YXIgcyA9IDEuNzAxNTg7XG4gIHJldHVybiAtLW4gKiBuICogKChzICsgMSkgKiBuICsgcykgKyAxO1xufTtcblxuZXhwb3J0cy5pbk91dEJhY2sgPSBmdW5jdGlvbihuKXtcbiAgdmFyIHMgPSAxLjcwMTU4ICogMS41MjU7XG4gIGlmICggKCBuICo9IDIgKSA8IDEgKSByZXR1cm4gMC41ICogKCBuICogbiAqICggKCBzICsgMSApICogbiAtIHMgKSApO1xuICByZXR1cm4gMC41ICogKCAoIG4gLT0gMiApICogbiAqICggKCBzICsgMSApICogbiArIHMgKSArIDIgKTtcbn07XG5cbmV4cG9ydHMuaW5Cb3VuY2UgPSBmdW5jdGlvbihuKXtcbiAgcmV0dXJuIDEgLSBleHBvcnRzLm91dEJvdW5jZSgxIC0gbik7XG59O1xuXG5leHBvcnRzLm91dEJvdW5jZSA9IGZ1bmN0aW9uKG4pe1xuICBpZiAoIG4gPCAoIDEgLyAyLjc1ICkgKSB7XG4gICAgcmV0dXJuIDcuNTYyNSAqIG4gKiBuO1xuICB9IGVsc2UgaWYgKCBuIDwgKCAyIC8gMi43NSApICkge1xuICAgIHJldHVybiA3LjU2MjUgKiAoIG4gLT0gKCAxLjUgLyAyLjc1ICkgKSAqIG4gKyAwLjc1O1xuICB9IGVsc2UgaWYgKCBuIDwgKCAyLjUgLyAyLjc1ICkgKSB7XG4gICAgcmV0dXJuIDcuNTYyNSAqICggbiAtPSAoIDIuMjUgLyAyLjc1ICkgKSAqIG4gKyAwLjkzNzU7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIDcuNTYyNSAqICggbiAtPSAoIDIuNjI1IC8gMi43NSApICkgKiBuICsgMC45ODQzNzU7XG4gIH1cbn07XG5cbmV4cG9ydHMuaW5PdXRCb3VuY2UgPSBmdW5jdGlvbihuKXtcbiAgaWYgKG4gPCAuNSkgcmV0dXJuIGV4cG9ydHMuaW5Cb3VuY2UobiAqIDIpICogLjU7XG4gIHJldHVybiBleHBvcnRzLm91dEJvdW5jZShuICogMiAtIDEpICogLjUgKyAuNTtcbn07XG5cbi8vIGFsaWFzZXNcblxuZXhwb3J0c1snaW4tcXVhZCddID0gZXhwb3J0cy5pblF1YWQ7XG5leHBvcnRzWydvdXQtcXVhZCddID0gZXhwb3J0cy5vdXRRdWFkO1xuZXhwb3J0c1snaW4tb3V0LXF1YWQnXSA9IGV4cG9ydHMuaW5PdXRRdWFkO1xuZXhwb3J0c1snaW4tY3ViZSddID0gZXhwb3J0cy5pbkN1YmU7XG5leHBvcnRzWydvdXQtY3ViZSddID0gZXhwb3J0cy5vdXRDdWJlO1xuZXhwb3J0c1snaW4tb3V0LWN1YmUnXSA9IGV4cG9ydHMuaW5PdXRDdWJlO1xuZXhwb3J0c1snaW4tcXVhcnQnXSA9IGV4cG9ydHMuaW5RdWFydDtcbmV4cG9ydHNbJ291dC1xdWFydCddID0gZXhwb3J0cy5vdXRRdWFydDtcbmV4cG9ydHNbJ2luLW91dC1xdWFydCddID0gZXhwb3J0cy5pbk91dFF1YXJ0O1xuZXhwb3J0c1snaW4tcXVpbnQnXSA9IGV4cG9ydHMuaW5RdWludDtcbmV4cG9ydHNbJ291dC1xdWludCddID0gZXhwb3J0cy5vdXRRdWludDtcbmV4cG9ydHNbJ2luLW91dC1xdWludCddID0gZXhwb3J0cy5pbk91dFF1aW50O1xuZXhwb3J0c1snaW4tc2luZSddID0gZXhwb3J0cy5pblNpbmU7XG5leHBvcnRzWydvdXQtc2luZSddID0gZXhwb3J0cy5vdXRTaW5lO1xuZXhwb3J0c1snaW4tb3V0LXNpbmUnXSA9IGV4cG9ydHMuaW5PdXRTaW5lO1xuZXhwb3J0c1snaW4tZXhwbyddID0gZXhwb3J0cy5pbkV4cG87XG5leHBvcnRzWydvdXQtZXhwbyddID0gZXhwb3J0cy5vdXRFeHBvO1xuZXhwb3J0c1snaW4tb3V0LWV4cG8nXSA9IGV4cG9ydHMuaW5PdXRFeHBvO1xuZXhwb3J0c1snaW4tY2lyYyddID0gZXhwb3J0cy5pbkNpcmM7XG5leHBvcnRzWydvdXQtY2lyYyddID0gZXhwb3J0cy5vdXRDaXJjO1xuZXhwb3J0c1snaW4tb3V0LWNpcmMnXSA9IGV4cG9ydHMuaW5PdXRDaXJjO1xuZXhwb3J0c1snaW4tYmFjayddID0gZXhwb3J0cy5pbkJhY2s7XG5leHBvcnRzWydvdXQtYmFjayddID0gZXhwb3J0cy5vdXRCYWNrO1xuZXhwb3J0c1snaW4tb3V0LWJhY2snXSA9IGV4cG9ydHMuaW5PdXRCYWNrO1xuZXhwb3J0c1snaW4tYm91bmNlJ10gPSBleHBvcnRzLmluQm91bmNlO1xuZXhwb3J0c1snb3V0LWJvdW5jZSddID0gZXhwb3J0cy5vdXRCb3VuY2U7XG5leHBvcnRzWydpbi1vdXQtYm91bmNlJ10gPSBleHBvcnRzLmluT3V0Qm91bmNlO1xuIiwiLyoqXG4gKiBFeHBvc2UgYHJlcXVlc3RBbmltYXRpb25GcmFtZSgpYC5cbiAqL1xuXG5leHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lXG4gIHx8IHdpbmRvdy53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWVcbiAgfHwgd2luZG93Lm1velJlcXVlc3RBbmltYXRpb25GcmFtZVxuICB8fCB3aW5kb3cub1JlcXVlc3RBbmltYXRpb25GcmFtZVxuICB8fCB3aW5kb3cubXNSZXF1ZXN0QW5pbWF0aW9uRnJhbWVcbiAgfHwgZmFsbGJhY2s7XG5cbi8qKlxuICogRmFsbGJhY2sgaW1wbGVtZW50YXRpb24uXG4gKi9cblxudmFyIHByZXYgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbmZ1bmN0aW9uIGZhbGxiYWNrKGZuKSB7XG4gIHZhciBjdXJyID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gIHZhciBtcyA9IE1hdGgubWF4KDAsIDE2IC0gKGN1cnIgLSBwcmV2KSk7XG4gIHZhciByZXEgPSBzZXRUaW1lb3V0KGZuLCBtcyk7XG4gIHByZXYgPSBjdXJyO1xuICByZXR1cm4gcmVxO1xufVxuXG4vKipcbiAqIENhbmNlbC5cbiAqL1xuXG52YXIgY2FuY2VsID0gd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lXG4gIHx8IHdpbmRvdy53ZWJraXRDYW5jZWxBbmltYXRpb25GcmFtZVxuICB8fCB3aW5kb3cubW96Q2FuY2VsQW5pbWF0aW9uRnJhbWVcbiAgfHwgd2luZG93Lm9DYW5jZWxBbmltYXRpb25GcmFtZVxuICB8fCB3aW5kb3cubXNDYW5jZWxBbmltYXRpb25GcmFtZVxuICB8fCB3aW5kb3cuY2xlYXJUaW1lb3V0O1xuXG5leHBvcnRzLmNhbmNlbCA9IGZ1bmN0aW9uKGlkKXtcbiAgY2FuY2VsLmNhbGwod2luZG93LCBpZCk7XG59O1xuIiwiLyoqXG4gKiBFeHBvc2UgYHN0eWxlc2BcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHN0eWxlcztcblxuLyoqXG4gKiBHZXQgYWxsIHRoZSBzdHlsZXNcbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqL1xuXG5mdW5jdGlvbiBzdHlsZXMoZWwpIHtcbiAgcmV0dXJuIGVsLm93bmVyRG9jdW1lbnQuZGVmYXVsdFZpZXcuZ2V0Q29tcHV0ZWRTdHlsZShlbCwgbnVsbCk7XG59XG4iLCIvKipcbiAqIE1vZHVsZSBEZXBlbmRlbmNpZXNcbiAqL1xuXG52YXIgcHJlZml4ZXMgPSBbJ1dlYmtpdCcsICdPJywgJ01veicsICdtcyddO1xuXG4vKipcbiAqIEV4cG9zZSBgdmVuZG9yYFxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gdmVuZG9yO1xuXG4vKipcbiAqIEdldCB0aGUgdmVuZG9yIHByZWZpeCBmb3IgYSBnaXZlbiBwcm9wZXJ0eVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBwcm9wXG4gKiBAcGFyYW0ge09iamVjdH0gc3R5bGVcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuXG5mdW5jdGlvbiB2ZW5kb3IocHJvcCwgc3R5bGUpIHtcbiAgLy8gc2hvcnRjdXQgZm9yIG5hbWVzIHRoYXQgYXJlIG5vdCB2ZW5kb3IgcHJlZml4ZWRcbiAgaWYgKHN0eWxlW3Byb3BdKSByZXR1cm4gcHJvcDtcblxuICAvLyBjaGVjayBmb3IgdmVuZG9yIHByZWZpeGVkIG5hbWVzXG4gIHZhciBjYXBOYW1lID0gcHJvcFswXS50b1VwcGVyQ2FzZSgpICsgcHJvcC5zbGljZSgxKTtcbiAgdmFyIG9yaWdpbmFsID0gcHJvcDtcbiAgdmFyIGkgPSBwcmVmaXhlcy5sZW5ndGg7XG5cbiAgd2hpbGUgKGktLSkge1xuICAgIHByb3AgPSBwcmVmaXhlc1tpXSArIGNhcE5hbWU7XG4gICAgaWYgKHByb3AgaW4gc3R5bGUpIHJldHVybiBwcm9wO1xuICB9XG5cbiAgcmV0dXJuIG9yaWdpbmFsO1xufVxuIiwiLyoqXG4gKiBFeHBvcnQgYHN3YXBgXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBzd2FwO1xuXG4vKipcbiAqIEluaXRpYWxpemUgYHN3YXBgXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbFxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcGFyYW0ge0FycmF5fSBhcmdzXG4gKiBAcmV0dXJuIHtNaXhlZH1cbiAqL1xuXG5mdW5jdGlvbiBzd2FwKGVsLCBvcHRpb25zLCBmbiwgYXJncykge1xuICAvLyBSZW1lbWJlciB0aGUgb2xkIHZhbHVlcywgYW5kIGluc2VydCB0aGUgbmV3IG9uZXNcbiAgZm9yICh2YXIga2V5IGluIG9wdGlvbnMpIHtcbiAgICBvbGRba2V5XSA9IGVsLnN0eWxlW2tleV07XG4gICAgZWwuc3R5bGVba2V5XSA9IG9wdGlvbnNba2V5XTtcbiAgfVxuXG4gIHJldCA9IGZuLmFwcGx5KGVsLCBhcmdzIHx8IFtdKTtcblxuICAvLyBSZXZlcnQgdGhlIG9sZCB2YWx1ZXNcbiAgZm9yIChrZXkgaW4gb3B0aW9ucykge1xuICAgIGVsLnN0eWxlW2tleV0gPSBvbGRba2V5XTtcbiAgfVxuXG4gIHJldHVybiByZXQ7XG59XG4iLCJcbi8qKlxuICogQ2hlY2sgaWYgYGVsYCBpcyB3aXRoaW4gdGhlIGRvY3VtZW50LlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGVsKSB7XG4gIHZhciBub2RlID0gZWw7XG4gIHdoaWxlIChub2RlID0gbm9kZS5wYXJlbnROb2RlKSB7XG4gICAgaWYgKG5vZGUgPT0gZG9jdW1lbnQpIHJldHVybiB0cnVlO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn07IiwiXG52YXIgY2xlYW4gPSByZXF1aXJlKCd0by1uby1jYXNlJyk7XG5cblxuLyoqXG4gKiBFeHBvc2UgYHRvU3BhY2VDYXNlYC5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHRvU3BhY2VDYXNlO1xuXG5cbi8qKlxuICogQ29udmVydCBhIGBzdHJpbmdgIHRvIHNwYWNlIGNhc2UuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0cmluZ1xuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5cblxuZnVuY3Rpb24gdG9TcGFjZUNhc2UgKHN0cmluZykge1xuICByZXR1cm4gY2xlYW4oc3RyaW5nKS5yZXBsYWNlKC9bXFxXX10rKC58JCkvZywgZnVuY3Rpb24gKG1hdGNoZXMsIG1hdGNoKSB7XG4gICAgcmV0dXJuIG1hdGNoID8gJyAnICsgbWF0Y2ggOiAnJztcbiAgfSk7XG59IiwiXG52YXIgdHdlZW4gPSByZXF1aXJlKCdzdHJpbmctdHdlZW4nKVxudmFyIHVubWF0cml4ID0gcmVxdWlyZSgndW5tYXRyaXgnKVxudmFyIGtleXMgPSBPYmplY3Qua2V5c1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGZyb20sIHRvKXtcbiAgcmV0dXJuIHR3ZWVuKG5vcm1hbGl6ZShmcm9tKSwgbm9ybWFsaXplKHRvKSlcbn1cblxuZnVuY3Rpb24gbm9ybWFsaXplKG0pe1xuICBpZiAodHlwZW9mIG0gPT0gJ3N0cmluZycpIG0gPSB1bm1hdHJpeChtKVxuICByZXR1cm4ga2V5cyh1bml0KS5yZWR1Y2UoZnVuY3Rpb24oc3RyLCBrZXkpe1xuICAgIHJldHVybiBzdHIgKyBrZXkgKyAnKCcgKyBtW2tleV0gKyB1bml0W2tleV0gKyAnKSdcbiAgfSwgJycpXG59XG5cbnZhciB1bml0ID0ge1xuICB0cmFuc2xhdGVYOiAncHgnLFxuICB0cmFuc2xhdGVZOiAncHgnLFxuICByb3RhdGU6ICdkZWcnLFxuICBza2V3OiAnZGVnJyxcbiAgc2NhbGVYOiAnJyxcbiAgc2NhbGVZOiAnJ1xufSIsIlxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihmcm9tLCB0byl7XG4gIGZyb20gPSBwYXJzZUZsb2F0KGZyb20sIDEwKSB8fCAwXG4gIHRvID0gcGFyc2VGbG9hdCh0bywgMTApIHx8IDBcbiAgcmV0dXJuIGZ1bmN0aW9uIGZyYW1lKG4pe1xuICAgIHJldHVybiBmcm9tICsgKHRvIC0gZnJvbSkgKiBuXG4gIH1cbn1cbiIsIlxudmFyIHBhcnNlID0gcmVxdWlyZSgnY29sb3ItcGFyc2VyJylcbnZhciByb3VuZCA9IE1hdGgucm91bmRcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihmcm9tLCB0byl7XG4gIGZyb20gPSByZ2JhKGZyb20pXG4gIHRvID0gcmdiYSh0bylcbiAgdmFyIGN1cnIgPSB0by5zbGljZSgpXG4gIHJldHVybiBmdW5jdGlvbiBmcmFtZShuKXtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDM7IGkrKykge1xuICAgICAgY3VycltpXSA9IHJvdW5kKGZyb21baV0gKyAodG9baV0gLSBmcm9tW2ldKSAqIG4pXG4gICAgfVxuICAgIC8vIGRvbid0IHJvdW5kIGFscGhhXG4gICAgY3VyclszXSA9IGZyb21baV0gKyAodG9baV0gLSBmcm9tW2ldKSAqIG5cbiAgICByZXR1cm4gJ3JnYmEoJyArIGN1cnIgKyAnKSdcbiAgfVxufVxuXG5mdW5jdGlvbiByZ2JhKGNvbG9yKXtcbiAgY29sb3IgPSBwYXJzZShjb2xvcilcbiAgaWYgKCFjb2xvcikgcmV0dXJuIFsyNTUsMjU1LDI1NSwwXSAvLyB0cmFuc3BhcmVudFxuICByZXR1cm4gW1xuICAgIGNvbG9yLnIsXG4gICAgY29sb3IuZyxcbiAgICBjb2xvci5iLFxuICAgIChjb2xvci5hID09IG51bGwgPyAxIDogY29sb3IuYSlcbiAgXVxufVxuIiwiXG52YXIgdG9TdHJpbmcgPSByZXF1aXJlKCdzZXJpYWxpemUtc3ZnLXBhdGgnKVxudmFyIGJhbGFuY2UgPSByZXF1aXJlKCdiYWxhbmNlLXN2Zy1wYXRocycpXG52YXIgdHdlZW4gPSByZXF1aXJlKCdzdHJpbmctdHdlZW4nKVxudmFyIG5vcm1hbGl6ZSA9IHJlcXVpcmUoJ2Zjb21wJykoXG4gIHJlcXVpcmUoJ3BhcnNlLXN2Zy1wYXRoJyksXG4gIHJlcXVpcmUoJ2Ficy1zdmctcGF0aCcpLFxuICByZXF1aXJlKCdub3JtYWxpemUtc3ZnLXBhdGgnKSxcbiAgcmVxdWlyZSgncmVsLXN2Zy1wYXRoJykpXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZnJvbSwgdG8pe1xuICB2YXIgZW5kcyA9IGJhbGFuY2Uobm9ybWFsaXplKGZyb20pLCBub3JtYWxpemUodG8pKVxuICByZXR1cm4gdHdlZW4odG9TdHJpbmcoZW5kc1swXSksIHRvU3RyaW5nKGVuZHNbMV0pKVxufVxuIiwiXG52YXIgdHdlZW4gPSByZXF1aXJlKCcuL251bWJlcicpXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZnJvbSwgdG8pe1xuICB2YXIgZnJhbWUgPSB0d2Vlbihmcm9tLCB0bylcbiAgcmV0dXJuIGZ1bmN0aW9uKG4pe1xuICAgIHJldHVybiBmcmFtZShuKS50b0ZpeGVkKDEpICsgJ3B4J1xuICB9XG59XG4iLCJcbi8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL1xuXG52YXIgY29sb3JzID0gcmVxdWlyZSgnLi9jb2xvcnMnKTtcblxuLyoqXG4gKiBFeHBvc2UgYHBhcnNlYC5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHBhcnNlO1xuXG4vKipcbiAqIFBhcnNlIGBzdHJgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gcGFyc2Uoc3RyKSB7XG4gIHJldHVybiBuYW1lZChzdHIpXG4gICAgfHwgaGV4MyhzdHIpXG4gICAgfHwgaGV4NihzdHIpXG4gICAgfHwgcmdiKHN0cilcbiAgICB8fCByZ2JhKHN0cik7XG59XG5cbi8qKlxuICogUGFyc2UgbmFtZWQgY3NzIGNvbG9yIGBzdHJgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIG5hbWVkKHN0cikge1xuICB2YXIgYyA9IGNvbG9yc1tzdHIudG9Mb3dlckNhc2UoKV07XG4gIGlmICghYykgcmV0dXJuO1xuICByZXR1cm4ge1xuICAgIHI6IGNbMF0sXG4gICAgZzogY1sxXSxcbiAgICBiOiBjWzJdXG4gIH1cbn1cblxuLyoqXG4gKiBQYXJzZSByZ2IobiwgbiwgbilcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiByZ2Ioc3RyKSB7XG4gIGlmICgwID09IHN0ci5pbmRleE9mKCdyZ2IoJykpIHtcbiAgICBzdHIgPSBzdHIubWF0Y2goL3JnYlxcKChbXildKylcXCkvKVsxXTtcbiAgICB2YXIgcGFydHMgPSBzdHIuc3BsaXQoLyAqLCAqLykubWFwKE51bWJlcik7XG4gICAgcmV0dXJuIHtcbiAgICAgIHI6IHBhcnRzWzBdLFxuICAgICAgZzogcGFydHNbMV0sXG4gICAgICBiOiBwYXJ0c1syXSxcbiAgICAgIGE6IDFcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBQYXJzZSByZ2JhKG4sIG4sIG4sIG4pXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gcmdiYShzdHIpIHtcbiAgaWYgKDAgPT0gc3RyLmluZGV4T2YoJ3JnYmEoJykpIHtcbiAgICBzdHIgPSBzdHIubWF0Y2goL3JnYmFcXCgoW14pXSspXFwpLylbMV07XG4gICAgdmFyIHBhcnRzID0gc3RyLnNwbGl0KC8gKiwgKi8pLm1hcChOdW1iZXIpO1xuICAgIHJldHVybiB7XG4gICAgICByOiBwYXJ0c1swXSxcbiAgICAgIGc6IHBhcnRzWzFdLFxuICAgICAgYjogcGFydHNbMl0sXG4gICAgICBhOiBwYXJ0c1szXVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIFBhcnNlICNubm5ubm5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBoZXg2KHN0cikge1xuICBpZiAoJyMnID09IHN0clswXSAmJiA3ID09IHN0ci5sZW5ndGgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgcjogcGFyc2VJbnQoc3RyLnNsaWNlKDEsIDMpLCAxNiksXG4gICAgICBnOiBwYXJzZUludChzdHIuc2xpY2UoMywgNSksIDE2KSxcbiAgICAgIGI6IHBhcnNlSW50KHN0ci5zbGljZSg1LCA3KSwgMTYpLFxuICAgICAgYTogMVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIFBhcnNlICNubm5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBoZXgzKHN0cikge1xuICBpZiAoJyMnID09IHN0clswXSAmJiA0ID09IHN0ci5sZW5ndGgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgcjogcGFyc2VJbnQoc3RyWzFdICsgc3RyWzFdLCAxNiksXG4gICAgICBnOiBwYXJzZUludChzdHJbMl0gKyBzdHJbMl0sIDE2KSxcbiAgICAgIGI6IHBhcnNlSW50KHN0clszXSArIHN0clszXSwgMTYpLFxuICAgICAgYTogMVxuICAgIH1cbiAgfVxufVxuXG4iLCJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oYSwgYil7XG4gIHZhciBmbiA9IGZ1bmN0aW9uKCl7fTtcbiAgZm4ucHJvdG90eXBlID0gYi5wcm90b3R5cGU7XG4gIGEucHJvdG90eXBlID0gbmV3IGZuO1xuICBhLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGE7XG59OyIsIlxuLyoqXG4gKiBtZXJnZSBgYmAncyBwcm9wZXJ0aWVzIHdpdGggYGFgJ3MuXG4gKlxuICogZXhhbXBsZTpcbiAqXG4gKiAgICAgICAgdmFyIHVzZXIgPSB7fTtcbiAqICAgICAgICBtZXJnZSh1c2VyLCBjb25zb2xlKTtcbiAqICAgICAgICAvLyA+IHsgbG9nOiBmbiwgZGlyOiBmbiAuLn1cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gYVxuICogQHBhcmFtIHtPYmplY3R9IGJcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChhLCBiKSB7XG4gIGZvciAodmFyIGsgaW4gYikgYVtrXSA9IGJba107XG4gIHJldHVybiBhO1xufTtcbiIsIlxuLyoqXG4gKiBtZXJnZSBgYmAncyBwcm9wZXJ0aWVzIHdpdGggYGFgJ3MuXG4gKlxuICogZXhhbXBsZTpcbiAqXG4gKiAgICAgICAgdmFyIHVzZXIgPSB7fTtcbiAqICAgICAgICBtZXJnZSh1c2VyLCBjb25zb2xlKTtcbiAqICAgICAgICAvLyA+IHsgbG9nOiBmbiwgZGlyOiBmbiAuLn1cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gYVxuICogQHBhcmFtIHtPYmplY3R9IGJcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChhLCBiKSB7XG4gIGZvciAodmFyIGsgaW4gYikgYVtrXSA9IGJba107XG4gIHJldHVybiBhO1xufTtcbiIsIlxuLyoqXG4gKiBFeHBvc2UgYHRvTm9DYXNlYC5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHRvTm9DYXNlO1xuXG5cbi8qKlxuICogVGVzdCB3aGV0aGVyIGEgc3RyaW5nIGlzIGNhbWVsLWNhc2UuXG4gKi9cblxudmFyIGhhc1NwYWNlID0gL1xccy87XG52YXIgaGFzQ2FtZWwgPSAvW2Etel1bQS1aXS87XG52YXIgaGFzU2VwYXJhdG9yID0gL1tcXFdfXS87XG5cblxuLyoqXG4gKiBSZW1vdmUgYW55IHN0YXJ0aW5nIGNhc2UgZnJvbSBhIGBzdHJpbmdgLCBsaWtlIGNhbWVsIG9yIHNuYWtlLCBidXQga2VlcFxuICogc3BhY2VzIGFuZCBwdW5jdHVhdGlvbiB0aGF0IG1heSBiZSBpbXBvcnRhbnQgb3RoZXJ3aXNlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJpbmdcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuXG5mdW5jdGlvbiB0b05vQ2FzZSAoc3RyaW5nKSB7XG4gIGlmIChoYXNTcGFjZS50ZXN0KHN0cmluZykpIHJldHVybiBzdHJpbmcudG9Mb3dlckNhc2UoKTtcblxuICBpZiAoaGFzU2VwYXJhdG9yLnRlc3Qoc3RyaW5nKSkgc3RyaW5nID0gdW5zZXBhcmF0ZShzdHJpbmcpO1xuICBpZiAoaGFzQ2FtZWwudGVzdChzdHJpbmcpKSBzdHJpbmcgPSB1bmNhbWVsaXplKHN0cmluZyk7XG4gIHJldHVybiBzdHJpbmcudG9Mb3dlckNhc2UoKTtcbn1cblxuXG4vKipcbiAqIFNlcGFyYXRvciBzcGxpdHRlci5cbiAqL1xuXG52YXIgc2VwYXJhdG9yU3BsaXR0ZXIgPSAvW1xcV19dKygufCQpL2c7XG5cblxuLyoqXG4gKiBVbi1zZXBhcmF0ZSBhIGBzdHJpbmdgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJpbmdcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuXG5mdW5jdGlvbiB1bnNlcGFyYXRlIChzdHJpbmcpIHtcbiAgcmV0dXJuIHN0cmluZy5yZXBsYWNlKHNlcGFyYXRvclNwbGl0dGVyLCBmdW5jdGlvbiAobSwgbmV4dCkge1xuICAgIHJldHVybiBuZXh0ID8gJyAnICsgbmV4dCA6ICcnO1xuICB9KTtcbn1cblxuXG4vKipcbiAqIENhbWVsY2FzZSBzcGxpdHRlci5cbiAqL1xuXG52YXIgY2FtZWxTcGxpdHRlciA9IC8oLikoW0EtWl0rKS9nO1xuXG5cbi8qKlxuICogVW4tY2FtZWxjYXNlIGEgYHN0cmluZ2AuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0cmluZ1xuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5cbmZ1bmN0aW9uIHVuY2FtZWxpemUgKHN0cmluZykge1xuICByZXR1cm4gc3RyaW5nLnJlcGxhY2UoY2FtZWxTcGxpdHRlciwgZnVuY3Rpb24gKG0sIHByZXZpb3VzLCB1cHBlcnMpIHtcbiAgICByZXR1cm4gcHJldmlvdXMgKyAnICcgKyB1cHBlcnMudG9Mb3dlckNhc2UoKS5zcGxpdCgnJykuam9pbignICcpO1xuICB9KTtcbn0iLCJcbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGFsaWNlYmx1ZTogWzI0MCwgMjQ4LCAyNTVdXG4gICwgYW50aXF1ZXdoaXRlOiBbMjUwLCAyMzUsIDIxNV1cbiAgLCBhcXVhOiBbMCwgMjU1LCAyNTVdXG4gICwgYXF1YW1hcmluZTogWzEyNywgMjU1LCAyMTJdXG4gICwgYXp1cmU6IFsyNDAsIDI1NSwgMjU1XVxuICAsIGJlaWdlOiBbMjQ1LCAyNDUsIDIyMF1cbiAgLCBiaXNxdWU6IFsyNTUsIDIyOCwgMTk2XVxuICAsIGJsYWNrOiBbMCwgMCwgMF1cbiAgLCBibGFuY2hlZGFsbW9uZDogWzI1NSwgMjM1LCAyMDVdXG4gICwgYmx1ZTogWzAsIDAsIDI1NV1cbiAgLCBibHVldmlvbGV0OiBbMTM4LCA0MywgMjI2XVxuICAsIGJyb3duOiBbMTY1LCA0MiwgNDJdXG4gICwgYnVybHl3b29kOiBbMjIyLCAxODQsIDEzNV1cbiAgLCBjYWRldGJsdWU6IFs5NSwgMTU4LCAxNjBdXG4gICwgY2hhcnRyZXVzZTogWzEyNywgMjU1LCAwXVxuICAsIGNob2NvbGF0ZTogWzIxMCwgMTA1LCAzMF1cbiAgLCBjb3JhbDogWzI1NSwgMTI3LCA4MF1cbiAgLCBjb3JuZmxvd2VyYmx1ZTogWzEwMCwgMTQ5LCAyMzddXG4gICwgY29ybnNpbGs6IFsyNTUsIDI0OCwgMjIwXVxuICAsIGNyaW1zb246IFsyMjAsIDIwLCA2MF1cbiAgLCBjeWFuOiBbMCwgMjU1LCAyNTVdXG4gICwgZGFya2JsdWU6IFswLCAwLCAxMzldXG4gICwgZGFya2N5YW46IFswLCAxMzksIDEzOV1cbiAgLCBkYXJrZ29sZGVucm9kOiBbMTg0LCAxMzIsIDExXVxuICAsIGRhcmtncmF5OiBbMTY5LCAxNjksIDE2OV1cbiAgLCBkYXJrZ3JlZW46IFswLCAxMDAsIDBdXG4gICwgZGFya2dyZXk6IFsxNjksIDE2OSwgMTY5XVxuICAsIGRhcmtraGFraTogWzE4OSwgMTgzLCAxMDddXG4gICwgZGFya21hZ2VudGE6IFsxMzksIDAsIDEzOV1cbiAgLCBkYXJrb2xpdmVncmVlbjogWzg1LCAxMDcsIDQ3XVxuICAsIGRhcmtvcmFuZ2U6IFsyNTUsIDE0MCwgMF1cbiAgLCBkYXJrb3JjaGlkOiBbMTUzLCA1MCwgMjA0XVxuICAsIGRhcmtyZWQ6IFsxMzksIDAsIDBdXG4gICwgZGFya3NhbG1vbjogWzIzMywgMTUwLCAxMjJdXG4gICwgZGFya3NlYWdyZWVuOiBbMTQzLCAxODgsIDE0M11cbiAgLCBkYXJrc2xhdGVibHVlOiBbNzIsIDYxLCAxMzldXG4gICwgZGFya3NsYXRlZ3JheTogWzQ3LCA3OSwgNzldXG4gICwgZGFya3NsYXRlZ3JleTogWzQ3LCA3OSwgNzldXG4gICwgZGFya3R1cnF1b2lzZTogWzAsIDIwNiwgMjA5XVxuICAsIGRhcmt2aW9sZXQ6IFsxNDgsIDAsIDIxMV1cbiAgLCBkZWVwcGluazogWzI1NSwgMjAsIDE0N11cbiAgLCBkZWVwc2t5Ymx1ZTogWzAsIDE5MSwgMjU1XVxuICAsIGRpbWdyYXk6IFsxMDUsIDEwNSwgMTA1XVxuICAsIGRpbWdyZXk6IFsxMDUsIDEwNSwgMTA1XVxuICAsIGRvZGdlcmJsdWU6IFszMCwgMTQ0LCAyNTVdXG4gICwgZmlyZWJyaWNrOiBbMTc4LCAzNCwgMzRdXG4gICwgZmxvcmFsd2hpdGU6IFsyNTUsIDI1NSwgMjQwXVxuICAsIGZvcmVzdGdyZWVuOiBbMzQsIDEzOSwgMzRdXG4gICwgZnVjaHNpYTogWzI1NSwgMCwgMjU1XVxuICAsIGdhaW5zYm9ybzogWzIyMCwgMjIwLCAyMjBdXG4gICwgZ2hvc3R3aGl0ZTogWzI0OCwgMjQ4LCAyNTVdXG4gICwgZ29sZDogWzI1NSwgMjE1LCAwXVxuICAsIGdvbGRlbnJvZDogWzIxOCwgMTY1LCAzMl1cbiAgLCBncmF5OiBbMTI4LCAxMjgsIDEyOF1cbiAgLCBncmVlbjogWzAsIDEyOCwgMF1cbiAgLCBncmVlbnllbGxvdzogWzE3MywgMjU1LCA0N11cbiAgLCBncmV5OiBbMTI4LCAxMjgsIDEyOF1cbiAgLCBob25leWRldzogWzI0MCwgMjU1LCAyNDBdXG4gICwgaG90cGluazogWzI1NSwgMTA1LCAxODBdXG4gICwgaW5kaWFucmVkOiBbMjA1LCA5MiwgOTJdXG4gICwgaW5kaWdvOiBbNzUsIDAsIDEzMF1cbiAgLCBpdm9yeTogWzI1NSwgMjU1LCAyNDBdXG4gICwga2hha2k6IFsyNDAsIDIzMCwgMTQwXVxuICAsIGxhdmVuZGVyOiBbMjMwLCAyMzAsIDI1MF1cbiAgLCBsYXZlbmRlcmJsdXNoOiBbMjU1LCAyNDAsIDI0NV1cbiAgLCBsYXduZ3JlZW46IFsxMjQsIDI1MiwgMF1cbiAgLCBsZW1vbmNoaWZmb246IFsyNTUsIDI1MCwgMjA1XVxuICAsIGxpZ2h0Ymx1ZTogWzE3MywgMjE2LCAyMzBdXG4gICwgbGlnaHRjb3JhbDogWzI0MCwgMTI4LCAxMjhdXG4gICwgbGlnaHRjeWFuOiBbMjI0LCAyNTUsIDI1NV1cbiAgLCBsaWdodGdvbGRlbnJvZHllbGxvdzogWzI1MCwgMjUwLCAyMTBdXG4gICwgbGlnaHRncmF5OiBbMjExLCAyMTEsIDIxMV1cbiAgLCBsaWdodGdyZWVuOiBbMTQ0LCAyMzgsIDE0NF1cbiAgLCBsaWdodGdyZXk6IFsyMTEsIDIxMSwgMjExXVxuICAsIGxpZ2h0cGluazogWzI1NSwgMTgyLCAxOTNdXG4gICwgbGlnaHRzYWxtb246IFsyNTUsIDE2MCwgMTIyXVxuICAsIGxpZ2h0c2VhZ3JlZW46IFszMiwgMTc4LCAxNzBdXG4gICwgbGlnaHRza3libHVlOiBbMTM1LCAyMDYsIDI1MF1cbiAgLCBsaWdodHNsYXRlZ3JheTogWzExOSwgMTM2LCAxNTNdXG4gICwgbGlnaHRzbGF0ZWdyZXk6IFsxMTksIDEzNiwgMTUzXVxuICAsIGxpZ2h0c3RlZWxibHVlOiBbMTc2LCAxOTYsIDIyMl1cbiAgLCBsaWdodHllbGxvdzogWzI1NSwgMjU1LCAyMjRdXG4gICwgbGltZTogWzAsIDI1NSwgMF1cbiAgLCBsaW1lZ3JlZW46IFs1MCwgMjA1LCA1MF1cbiAgLCBsaW5lbjogWzI1MCwgMjQwLCAyMzBdXG4gICwgbWFnZW50YTogWzI1NSwgMCwgMjU1XVxuICAsIG1hcm9vbjogWzEyOCwgMCwgMF1cbiAgLCBtZWRpdW1hcXVhbWFyaW5lOiBbMTAyLCAyMDUsIDE3MF1cbiAgLCBtZWRpdW1ibHVlOiBbMCwgMCwgMjA1XVxuICAsIG1lZGl1bW9yY2hpZDogWzE4NiwgODUsIDIxMV1cbiAgLCBtZWRpdW1wdXJwbGU6IFsxNDcsIDExMiwgMjE5XVxuICAsIG1lZGl1bXNlYWdyZWVuOiBbNjAsIDE3OSwgMTEzXVxuICAsIG1lZGl1bXNsYXRlYmx1ZTogWzEyMywgMTA0LCAyMzhdXG4gICwgbWVkaXVtc3ByaW5nZ3JlZW46IFswLCAyNTAsIDE1NF1cbiAgLCBtZWRpdW10dXJxdW9pc2U6IFs3MiwgMjA5LCAyMDRdXG4gICwgbWVkaXVtdmlvbGV0cmVkOiBbMTk5LCAyMSwgMTMzXVxuICAsIG1pZG5pZ2h0Ymx1ZTogWzI1LCAyNSwgMTEyXVxuICAsIG1pbnRjcmVhbTogWzI0NSwgMjU1LCAyNTBdXG4gICwgbWlzdHlyb3NlOiBbMjU1LCAyMjgsIDIyNV1cbiAgLCBtb2NjYXNpbjogWzI1NSwgMjI4LCAxODFdXG4gICwgbmF2YWpvd2hpdGU6IFsyNTUsIDIyMiwgMTczXVxuICAsIG5hdnk6IFswLCAwLCAxMjhdXG4gICwgb2xkbGFjZTogWzI1MywgMjQ1LCAyMzBdXG4gICwgb2xpdmU6IFsxMjgsIDEyOCwgMF1cbiAgLCBvbGl2ZWRyYWI6IFsxMDcsIDE0MiwgMzVdXG4gICwgb3JhbmdlOiBbMjU1LCAxNjUsIDBdXG4gICwgb3JhbmdlcmVkOiBbMjU1LCA2OSwgMF1cbiAgLCBvcmNoaWQ6IFsyMTgsIDExMiwgMjE0XVxuICAsIHBhbGVnb2xkZW5yb2Q6IFsyMzgsIDIzMiwgMTcwXVxuICAsIHBhbGVncmVlbjogWzE1MiwgMjUxLCAxNTJdXG4gICwgcGFsZXR1cnF1b2lzZTogWzE3NSwgMjM4LCAyMzhdXG4gICwgcGFsZXZpb2xldHJlZDogWzIxOSwgMTEyLCAxNDddXG4gICwgcGFwYXlhd2hpcDogWzI1NSwgMjM5LCAyMTNdXG4gICwgcGVhY2hwdWZmOiBbMjU1LCAyMTgsIDE4NV1cbiAgLCBwZXJ1OiBbMjA1LCAxMzMsIDYzXVxuICAsIHBpbms6IFsyNTUsIDE5MiwgMjAzXVxuICAsIHBsdW06IFsyMjEsIDE2MCwgMjAzXVxuICAsIHBvd2RlcmJsdWU6IFsxNzYsIDIyNCwgMjMwXVxuICAsIHB1cnBsZTogWzEyOCwgMCwgMTI4XVxuICAsIHJlZDogWzI1NSwgMCwgMF1cbiAgLCByb3N5YnJvd246IFsxODgsIDE0MywgMTQzXVxuICAsIHJveWFsYmx1ZTogWzY1LCAxMDUsIDIyNV1cbiAgLCBzYWRkbGVicm93bjogWzEzOSwgNjksIDE5XVxuICAsIHNhbG1vbjogWzI1MCwgMTI4LCAxMTRdXG4gICwgc2FuZHlicm93bjogWzI0NCwgMTY0LCA5Nl1cbiAgLCBzZWFncmVlbjogWzQ2LCAxMzksIDg3XVxuICAsIHNlYXNoZWxsOiBbMjU1LCAyNDUsIDIzOF1cbiAgLCBzaWVubmE6IFsxNjAsIDgyLCA0NV1cbiAgLCBzaWx2ZXI6IFsxOTIsIDE5MiwgMTkyXVxuICAsIHNreWJsdWU6IFsxMzUsIDIwNiwgMjM1XVxuICAsIHNsYXRlYmx1ZTogWzEwNiwgOTAsIDIwNV1cbiAgLCBzbGF0ZWdyYXk6IFsxMTksIDEyOCwgMTQ0XVxuICAsIHNsYXRlZ3JleTogWzExOSwgMTI4LCAxNDRdXG4gICwgc25vdzogWzI1NSwgMjU1LCAyNTBdXG4gICwgc3ByaW5nZ3JlZW46IFswLCAyNTUsIDEyN11cbiAgLCBzdGVlbGJsdWU6IFs3MCwgMTMwLCAxODBdXG4gICwgdGFuOiBbMjEwLCAxODAsIDE0MF1cbiAgLCB0ZWFsOiBbMCwgMTI4LCAxMjhdXG4gICwgdGhpc3RsZTogWzIxNiwgMTkxLCAyMTZdXG4gICwgdG9tYXRvOiBbMjU1LCA5OSwgNzFdXG4gICwgdHVycXVvaXNlOiBbNjQsIDIyNCwgMjA4XVxuICAsIHZpb2xldDogWzIzOCwgMTMwLCAyMzhdXG4gICwgd2hlYXQ6IFsyNDUsIDIyMiwgMTc5XVxuICAsIHdoaXRlOiBbMjU1LCAyNTUsIDI1NV1cbiAgLCB3aGl0ZXNtb2tlOiBbMjQ1LCAyNDUsIDI0NV1cbiAgLCB5ZWxsb3c6IFsyNTUsIDI1NSwgMF1cbiAgLCB5ZWxsb3dncmVlbjogWzE1NCwgMjA1LCA1XVxufTsiLCJcbi8qKlxuICogbnVtYmVyIHBhdHRlcm5cbiAqIEB0eXBlIHtSZWdFeHB9XG4gKi9cblxudmFyIG51bWJlciA9IC9bLStdPyg/OlxcZCtcXC4/XFxkKnxcXC4/XFxkKykoPzpbZUVdWy0rXT9cXGQrKT8vZ1xuXG5tb2R1bGUuZXhwb3J0cyA9IHR3ZWVuXG5cbi8qKlxuICogY3JlYXRlIGEgdHdlZW4gZ2VuZXJhdG9yIGZyb20gYGFgIHRvIGBiYFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBhXG4gKiBAcGFyYW0ge1N0cmluZ30gYlxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKi9cblxuZnVuY3Rpb24gdHdlZW4oYSwgYil7XG5cdHZhciBzdHJpbmcgPSBbXVxuXHR2YXIga2V5cyA9IFtdXG5cdHZhciBmcm9tID0gW11cblx0dmFyIHRvID0gW11cblx0dmFyIGN1cnNvciA9IDBcblx0dmFyIG1cblxuXHR3aGlsZSAobSA9IG51bWJlci5leGVjKGIpKSB7XG5cdFx0aWYgKG0uaW5kZXggPiBjdXJzb3IpIHN0cmluZy5wdXNoKGIuc2xpY2UoY3Vyc29yLCBtLmluZGV4KSlcblx0XHR0by5wdXNoKE51bWJlcihtWzBdKSlcblx0XHRrZXlzLnB1c2goc3RyaW5nLmxlbmd0aClcblx0XHRzdHJpbmcucHVzaChudWxsKVxuXHRcdGN1cnNvciA9IG51bWJlci5sYXN0SW5kZXhcblx0fVxuXHRpZiAoY3Vyc29yIDwgYi5sZW5ndGgpIHN0cmluZy5wdXNoKGIuc2xpY2UoY3Vyc29yKSlcblxuXHR3aGlsZSAobSA9IG51bWJlci5leGVjKGEpKSBmcm9tLnB1c2goTnVtYmVyKG1bMF0pKVxuXG5cdHJldHVybiBmdW5jdGlvbiBmcmFtZShuKXtcblx0XHR2YXIgaSA9IGtleXMubGVuZ3RoXG5cdFx0d2hpbGUgKGktLSkgc3RyaW5nW2tleXNbaV1dID0gZnJvbVtpXSArICh0b1tpXSAtIGZyb21baV0pICogblxuXHRcdHJldHVybiBzdHJpbmcuam9pbignJylcblx0fVxufVxuIiwiXG5tb2R1bGUuZXhwb3J0cyA9IHNlcmlhbGl6ZVxuXG4vKipcbiAqIGNvbnZlcnQgYHBhdGhgIHRvIGEgc3RyaW5nXG4gKlxuICogQHBhcmFtIHtBcnJheX0gcGF0aFxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5cbmZ1bmN0aW9uIHNlcmlhbGl6ZShwYXRoKXtcblx0cmV0dXJuIHBhdGgucmVkdWNlKGZ1bmN0aW9uKHN0ciwgc2VnKXtcblx0XHRyZXR1cm4gc3RyICsgc2VnWzBdICsgc2VnLnNsaWNlKDEpLmpvaW4oJywnKVxuXHR9LCAnJylcbn1cbiIsIlxubW9kdWxlLmV4cG9ydHMgPSBiYWxhbmNlXG5cbi8qKlxuICogZGVmaW5lIGBhYCBhbmQgYGJgIHVzaW5nIHRoZSBzYW1lIG51bWJlciBvZlxuICogcGF0aCBzZWdtZW50cyB3aGlsZSBwcmVzZXJ2aW5nIHRoZWlyIHNoYXBlXG4gKlxuICogQHBhcmFtIHtBcnJheX0gYVxuICogQHBhcmFtIHtBcnJheX0gYlxuICogQHJldHVybiB7QXJyYXl9XG4gKi9cblxuZnVuY3Rpb24gYmFsYW5jZShhLCBiKXtcbiAgdmFyIGRpZmYgPSBhLmxlbmd0aCAtIGIubGVuZ3RoXG4gIHZhciBzaG9ydCA9IGRpZmYgPj0gMCA/IGIgOiBhXG4gIGRpZmYgPSBNYXRoLmFicyhkaWZmKVxuICB3aGlsZSAoZGlmZi0tKSBzaG9ydC5wdXNoKFsnYycsMCwwLDAsMCwwLDBdKVxuICByZXR1cm4gW2EsIGJdXG59XG4iLCJ2YXIgYXBwbHkgPSBGdW5jdGlvbi5wcm90b3R5cGUuYXBwbHlcbm1vZHVsZS5leHBvcnRzID0gZmNvbXBcblxuZnVuY3Rpb24gZmNvbXAoKSB7XG4gIHZhciBmbnMgPSBhcmd1bWVudHNcbiAgICAsIGxlbiA9IGZucy5sZW5ndGhcbiAgICAsIGZuID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB2YWwgPSBhcHBseS5jYWxsKGZuc1swXSwgbnVsbCwgYXJndW1lbnRzKVxuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGxlbjsgaSsrKVxuICAgICAgICAgIHZhbCA9IGZuc1tpXSh2YWwpXG4gICAgICAgIHJldHVybiB2YWxcbiAgICAgIH1cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKylcbiAgICBmbi5kaXNwbGF5TmFtZSA9IChmbi5kaXNwbGF5TmFtZSB8fCAnJylcbiAgICAgICsgKGkgPT09IDAgPyAnJyA6ICcgwrcgJylcbiAgICAgICsgZm5zW2ldLm5hbWVcbiAgcmV0dXJuIGZuXG59XG5cbmZjb21wLnJldmVyc2UgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIGZjb21wLmFwcGx5KG51bGwsIFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKS5yZXZlcnNlKCkpXG59XG4iLCJcbm1vZHVsZS5leHBvcnRzID0gcGFyc2VcblxuLyoqXG4gKiBleHBlY3RlZCBhcmd1bWVudCBsZW5ndGhzXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5cbnZhciBsZW5ndGggPSB7YTogNywgYzogNiwgaDogMSwgbDogMiwgbTogMiwgcTogNCwgczogNCwgdDogMiwgdjogMSwgejogMH1cblxuLyoqXG4gKiBzZWdtZW50IHBhdHRlcm5cbiAqIEB0eXBlIHtSZWdFeHB9XG4gKi9cblxudmFyIHNlZ21lbnQgPSAvKFthc3R2enFtaGxjXSkoW15hc3R2enFtaGxjXSopL2lnXG5cbi8qKlxuICogcGFyc2UgYW4gc3ZnIHBhdGggZGF0YSBzdHJpbmcuIEdlbmVyYXRlcyBhbiBBcnJheVxuICogb2YgY29tbWFuZHMgd2hlcmUgZWFjaCBjb21tYW5kIGlzIGFuIEFycmF5IG9mIHRoZVxuICogZm9ybSBgW2NvbW1hbmQsIGFyZzEsIGFyZzIsIC4uLl1gXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHBhdGhcbiAqIEByZXR1cm4ge0FycmF5fVxuICovXG5cbmZ1bmN0aW9uIHBhcnNlKHBhdGgpIHtcblx0dmFyIGRhdGEgPSBbXVxuXHRwYXRoLnJlcGxhY2Uoc2VnbWVudCwgZnVuY3Rpb24oXywgY29tbWFuZCwgYXJncyl7XG5cdFx0dmFyIHR5cGUgPSBjb21tYW5kLnRvTG93ZXJDYXNlKClcblx0XHRhcmdzID0gcGFyc2VWYWx1ZXMoYXJncylcblxuXHRcdC8vIG92ZXJsb2FkZWQgbW92ZVRvXG5cdFx0aWYgKHR5cGUgPT0gJ20nICYmIGFyZ3MubGVuZ3RoID4gMikge1xuXHRcdFx0ZGF0YS5wdXNoKFtjb21tYW5kXS5jb25jYXQoYXJncy5zcGxpY2UoMCwgMikpKVxuXHRcdFx0dHlwZSA9ICdsJ1xuXHRcdFx0Y29tbWFuZCA9IGNvbW1hbmQgPT0gJ20nID8gJ2wnIDogJ0wnXG5cdFx0fVxuXG5cdFx0d2hpbGUgKHRydWUpIHtcblx0XHRcdGlmIChhcmdzLmxlbmd0aCA9PSBsZW5ndGhbdHlwZV0pIHtcblx0XHRcdFx0YXJncy51bnNoaWZ0KGNvbW1hbmQpXG5cdFx0XHRcdHJldHVybiBkYXRhLnB1c2goYXJncylcblx0XHRcdH1cblx0XHRcdGlmIChhcmdzLmxlbmd0aCA8IGxlbmd0aFt0eXBlXSkgdGhyb3cgbmV3IEVycm9yKCdtYWxmb3JtZWQgcGF0aCBkYXRhJylcblx0XHRcdGRhdGEucHVzaChbY29tbWFuZF0uY29uY2F0KGFyZ3Muc3BsaWNlKDAsIGxlbmd0aFt0eXBlXSkpKVxuXHRcdH1cblx0fSlcblx0cmV0dXJuIGRhdGFcbn1cblxuZnVuY3Rpb24gcGFyc2VWYWx1ZXMoYXJncyl7XG5cdGFyZ3MgPSBhcmdzLm1hdGNoKC8tP1suMC05XSsoPzplWy0rXT9cXGQrKT8vaWcpXG5cdHJldHVybiBhcmdzID8gYXJncy5tYXAoTnVtYmVyKSA6IFtdXG59XG4iLCJcbm1vZHVsZS5leHBvcnRzID0gYWJzb2x1dGl6ZVxuXG4vKipcbiAqIHJlZGVmaW5lIGBwYXRoYCB3aXRoIGFic29sdXRlIGNvb3JkaW5hdGVzXG4gKlxuICogQHBhcmFtIHtBcnJheX0gcGF0aFxuICogQHJldHVybiB7QXJyYXl9XG4gKi9cblxuZnVuY3Rpb24gYWJzb2x1dGl6ZShwYXRoKXtcblx0dmFyIHN0YXJ0WCA9IDBcblx0dmFyIHN0YXJ0WSA9IDBcblx0dmFyIHggPSAwXG5cdHZhciB5ID0gMFxuXG5cdHJldHVybiBwYXRoLm1hcChmdW5jdGlvbihzZWcpe1xuXHRcdHNlZyA9IHNlZy5zbGljZSgpXG5cdFx0dmFyIHR5cGUgPSBzZWdbMF1cblx0XHR2YXIgY29tbWFuZCA9IHR5cGUudG9VcHBlckNhc2UoKVxuXG5cdFx0Ly8gaXMgcmVsYXRpdmVcblx0XHRpZiAodHlwZSAhPSBjb21tYW5kKSB7XG5cdFx0XHRzZWdbMF0gPSBjb21tYW5kXG5cdFx0XHRzd2l0Y2ggKHR5cGUpIHtcblx0XHRcdFx0Y2FzZSAnYSc6XG5cdFx0XHRcdFx0c2VnWzZdICs9IHhcblx0XHRcdFx0XHRzZWdbN10gKz0geVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdGNhc2UgJ3YnOlxuXHRcdFx0XHRcdHNlZ1sxXSArPSB5XG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0Y2FzZSAnaCc6XG5cdFx0XHRcdFx0c2VnWzFdICs9IHhcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdGZvciAodmFyIGkgPSAxOyBpIDwgc2VnLmxlbmd0aDspIHtcblx0XHRcdFx0XHRcdHNlZ1tpKytdICs9IHhcblx0XHRcdFx0XHRcdHNlZ1tpKytdICs9IHlcblx0XHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gdXBkYXRlIGN1cnNvciBzdGF0ZVxuXHRcdHN3aXRjaCAoY29tbWFuZCkge1xuXHRcdFx0Y2FzZSAnWic6XG5cdFx0XHRcdHggPSBzdGFydFhcblx0XHRcdFx0eSA9IHN0YXJ0WVxuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSAnSCc6XG5cdFx0XHRcdHggPSBzZWdbMV1cblx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgJ1YnOlxuXHRcdFx0XHR5ID0gc2VnWzFdXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlICdNJzpcblx0XHRcdFx0eCA9IHN0YXJ0WCA9IHNlZ1sxXVxuXHRcdFx0XHR5ID0gc3RhcnRZID0gc2VnWzJdXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHR4ID0gc2VnW3NlZy5sZW5ndGggLSAyXVxuXHRcdFx0XHR5ID0gc2VnW3NlZy5sZW5ndGggLSAxXVxuXHRcdH1cblxuXHRcdHJldHVybiBzZWdcblx0fSlcbn1cbiIsIlxudmFyIM+AID0gTWF0aC5QSVxudmFyIF8xMjAgPSByYWRpYW5zKDEyMClcblxubW9kdWxlLmV4cG9ydHMgPSBub3JtYWxpemVcblxuLyoqXG4gKiBkZXNjcmliZSBgcGF0aGAgaW4gdGVybXMgb2YgY3ViaWMgYsOpemllciBcbiAqIGN1cnZlcyBhbmQgbW92ZSBjb21tYW5kc1xuICpcbiAqIEBwYXJhbSB7QXJyYXl9IHBhdGhcbiAqIEByZXR1cm4ge0FycmF5fVxuICovXG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZShwYXRoKXtcblx0Ly8gaW5pdCBzdGF0ZVxuXHR2YXIgcHJldlxuXHR2YXIgcmVzdWx0ID0gW11cblx0dmFyIGJlemllclggPSAwXG5cdHZhciBiZXppZXJZID0gMFxuXHR2YXIgc3RhcnRYID0gMFxuXHR2YXIgc3RhcnRZID0gMFxuXHR2YXIgcXVhZFggPSBudWxsXG5cdHZhciBxdWFkWSA9IG51bGxcblx0dmFyIHggPSAwXG5cdHZhciB5ID0gMFxuXG5cdGZvciAodmFyIGkgPSAwLCBsZW4gPSBwYXRoLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG5cdFx0dmFyIHNlZyA9IHBhdGhbaV1cblx0XHR2YXIgY29tbWFuZCA9IHNlZ1swXVxuXHRcdHN3aXRjaCAoY29tbWFuZCkge1xuXHRcdFx0Y2FzZSAnTSc6XG5cdFx0XHRcdHN0YXJ0WCA9IHNlZ1sxXVxuXHRcdFx0XHRzdGFydFkgPSBzZWdbMl1cblx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgJ0EnOlxuXHRcdFx0XHRzZWcgPSBhcmMoeCwgeSxzZWdbMV0sc2VnWzJdLHJhZGlhbnMoc2VnWzNdKSxzZWdbNF0sc2VnWzVdLHNlZ1s2XSxzZWdbN10pXG5cdFx0XHRcdC8vIHNwbGl0IG11bHRpIHBhcnRcblx0XHRcdFx0c2VnLnVuc2hpZnQoJ0MnKVxuXHRcdFx0XHRpZiAoc2VnLmxlbmd0aCA+IDcpIHtcblx0XHRcdFx0XHRyZXN1bHQucHVzaChzZWcuc3BsaWNlKDAsIDcpKVxuXHRcdFx0XHRcdHNlZy51bnNoaWZ0KCdDJylcblx0XHRcdFx0fVxuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSAnUyc6XG5cdFx0XHRcdC8vIGRlZmF1bHQgY29udHJvbCBwb2ludFxuXHRcdFx0XHR2YXIgY3ggPSB4XG5cdFx0XHRcdHZhciBjeSA9IHlcblx0XHRcdFx0aWYgKHByZXYgPT0gJ0MnIHx8IHByZXYgPT0gJ1MnKSB7XG5cdFx0XHRcdFx0Y3ggKz0gY3ggLSBiZXppZXJYIC8vIHJlZmxlY3QgdGhlIHByZXZpb3VzIGNvbW1hbmQncyBjb250cm9sXG5cdFx0XHRcdFx0Y3kgKz0gY3kgLSBiZXppZXJZIC8vIHBvaW50IHJlbGF0aXZlIHRvIHRoZSBjdXJyZW50IHBvaW50XG5cdFx0XHRcdH1cblx0XHRcdFx0c2VnID0gWydDJywgY3gsIGN5LCBzZWdbMV0sIHNlZ1syXSwgc2VnWzNdLCBzZWdbNF1dXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlICdUJzpcblx0XHRcdFx0aWYgKHByZXYgPT0gJ1EnIHx8IHByZXYgPT0gJ1QnKSB7XG5cdFx0XHRcdFx0cXVhZFggPSB4ICogMiAtIHF1YWRYIC8vIGFzIHdpdGggJ1MnIHJlZmxlY3QgcHJldmlvdXMgY29udHJvbCBwb2ludFxuXHRcdFx0XHRcdHF1YWRZID0geSAqIDIgLSBxdWFkWVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHF1YWRYID0geFxuXHRcdFx0XHRcdHF1YWRZID0geVxuXHRcdFx0XHR9XG5cdFx0XHRcdHNlZyA9IHF1YWRyYXRpYyh4LCB5LCBxdWFkWCwgcXVhZFksIHNlZ1sxXSwgc2VnWzJdKVxuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSAnUSc6XG5cdFx0XHRcdHF1YWRYID0gc2VnWzFdXG5cdFx0XHRcdHF1YWRZID0gc2VnWzJdXG5cdFx0XHRcdHNlZyA9IHF1YWRyYXRpYyh4LCB5LCBzZWdbMV0sIHNlZ1syXSwgc2VnWzNdLCBzZWdbNF0pXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlICdMJzpcblx0XHRcdFx0c2VnID0gbGluZSh4LCB5LCBzZWdbMV0sIHNlZ1syXSlcblx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgJ0gnOlxuXHRcdFx0XHRzZWcgPSBsaW5lKHgsIHksIHNlZ1sxXSwgeSlcblx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgJ1YnOlxuXHRcdFx0XHRzZWcgPSBsaW5lKHgsIHksIHgsIHNlZ1sxXSlcblx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgJ1onOlxuXHRcdFx0XHRzZWcgPSBsaW5lKHgsIHksIHN0YXJ0WCwgc3RhcnRZKVxuXHRcdFx0XHRicmVha1xuXHRcdH1cblxuXHRcdC8vIHVwZGF0ZSBzdGF0ZVxuXHRcdHByZXYgPSBjb21tYW5kXG5cdFx0eCA9IHNlZ1tzZWcubGVuZ3RoIC0gMl1cblx0XHR5ID0gc2VnW3NlZy5sZW5ndGggLSAxXVxuXHRcdGlmIChzZWcubGVuZ3RoID4gNCkge1xuXHRcdFx0YmV6aWVyWCA9IHNlZ1tzZWcubGVuZ3RoIC0gNF1cblx0XHRcdGJlemllclkgPSBzZWdbc2VnLmxlbmd0aCAtIDNdXG5cdFx0fSBlbHNlIHtcblx0XHRcdGJlemllclggPSB4XG5cdFx0XHRiZXppZXJZID0geVxuXHRcdH1cblx0XHRyZXN1bHQucHVzaChzZWcpXG5cdH1cblxuXHRyZXR1cm4gcmVzdWx0XG59XG5cbmZ1bmN0aW9uIGxpbmUoeDEsIHkxLCB4MiwgeTIpe1xuXHRyZXR1cm4gWydDJywgeDEsIHkxLCB4MiwgeTIsIHgyLCB5Ml1cbn1cblxuZnVuY3Rpb24gcXVhZHJhdGljKHgxLCB5MSwgY3gsIGN5LCB4MiwgeTIpe1xuXHRyZXR1cm4gW1xuXHRcdCdDJyxcblx0XHR4MS8zICsgKDIvMykgKiBjeCxcblx0XHR5MS8zICsgKDIvMykgKiBjeSxcblx0XHR4Mi8zICsgKDIvMykgKiBjeCxcblx0XHR5Mi8zICsgKDIvMykgKiBjeSxcblx0XHR4Mixcblx0XHR5MlxuXHRdXG59XG5cbi8vIFRoaXMgZnVuY3Rpb24gaXMgcmlwcGVkIGZyb20gXG4vLyBnaXRodWIuY29tL0RtaXRyeUJhcmFub3Zza2l5L3JhcGhhZWwvYmxvYi80ZDk3ZDQvcmFwaGFlbC5qcyNMMjIxNi1MMjMwNCBcbi8vIHdoaWNoIHJlZmVyZW5jZXMgdzMub3JnL1RSL1NWRzExL2ltcGxub3RlLmh0bWwjQXJjSW1wbGVtZW50YXRpb25Ob3Rlc1xuLy8gVE9ETzogbWFrZSBpdCBodW1hbiByZWFkYWJsZVxuXG5mdW5jdGlvbiBhcmMoeDEsIHkxLCByeCwgcnksIGFuZ2xlLCBsYXJnZV9hcmNfZmxhZywgc3dlZXBfZmxhZywgeDIsIHkyLCByZWN1cnNpdmUpIHtcblx0aWYgKCFyZWN1cnNpdmUpIHtcblx0XHR2YXIgeHkgPSByb3RhdGUoeDEsIHkxLCAtYW5nbGUpXG5cdFx0eDEgPSB4eS54XG5cdFx0eTEgPSB4eS55XG5cdFx0eHkgPSByb3RhdGUoeDIsIHkyLCAtYW5nbGUpXG5cdFx0eDIgPSB4eS54XG5cdFx0eTIgPSB4eS55XG5cdFx0dmFyIHggPSAoeDEgLSB4MikgLyAyXG5cdFx0dmFyIHkgPSAoeTEgLSB5MikgLyAyXG5cdFx0dmFyIGggPSAoeCAqIHgpIC8gKHJ4ICogcngpICsgKHkgKiB5KSAvIChyeSAqIHJ5KVxuXHRcdGlmIChoID4gMSkge1xuXHRcdFx0aCA9IE1hdGguc3FydChoKVxuXHRcdFx0cnggPSBoICogcnhcblx0XHRcdHJ5ID0gaCAqIHJ5XG5cdFx0fVxuXHRcdHZhciByeDIgPSByeCAqIHJ4XG5cdFx0dmFyIHJ5MiA9IHJ5ICogcnlcblx0XHR2YXIgayA9IChsYXJnZV9hcmNfZmxhZyA9PSBzd2VlcF9mbGFnID8gLTEgOiAxKVxuXHRcdFx0KiBNYXRoLnNxcnQoTWF0aC5hYnMoKHJ4MiAqIHJ5MiAtIHJ4MiAqIHkgKiB5IC0gcnkyICogeCAqIHgpIC8gKHJ4MiAqIHkgKiB5ICsgcnkyICogeCAqIHgpKSlcblx0XHRpZiAoayA9PSBJbmZpbml0eSkgayA9IDEgLy8gbmV1dHJhbGl6ZVxuXHRcdHZhciBjeCA9IGsgKiByeCAqIHkgLyByeSArICh4MSArIHgyKSAvIDJcblx0XHR2YXIgY3kgPSBrICogLXJ5ICogeCAvIHJ4ICsgKHkxICsgeTIpIC8gMlxuXHRcdHZhciBmMSA9IE1hdGguYXNpbigoKHkxIC0gY3kpIC8gcnkpLnRvRml4ZWQoOSkpXG5cdFx0dmFyIGYyID0gTWF0aC5hc2luKCgoeTIgLSBjeSkgLyByeSkudG9GaXhlZCg5KSlcblxuXHRcdGYxID0geDEgPCBjeCA/IM+AIC0gZjEgOiBmMVxuXHRcdGYyID0geDIgPCBjeCA/IM+AIC0gZjIgOiBmMlxuXHRcdGlmIChmMSA8IDApIGYxID0gz4AgKiAyICsgZjFcblx0XHRpZiAoZjIgPCAwKSBmMiA9IM+AICogMiArIGYyXG5cdFx0aWYgKHN3ZWVwX2ZsYWcgJiYgZjEgPiBmMikgZjEgPSBmMSAtIM+AICogMlxuXHRcdGlmICghc3dlZXBfZmxhZyAmJiBmMiA+IGYxKSBmMiA9IGYyIC0gz4AgKiAyXG5cdH0gZWxzZSB7XG5cdFx0ZjEgPSByZWN1cnNpdmVbMF1cblx0XHRmMiA9IHJlY3Vyc2l2ZVsxXVxuXHRcdGN4ID0gcmVjdXJzaXZlWzJdXG5cdFx0Y3kgPSByZWN1cnNpdmVbM11cblx0fVxuXHQvLyBncmVhdGVyIHRoYW4gMTIwIGRlZ3JlZXMgcmVxdWlyZXMgbXVsdGlwbGUgc2VnbWVudHNcblx0aWYgKE1hdGguYWJzKGYyIC0gZjEpID4gXzEyMCkge1xuXHRcdHZhciBmMm9sZCA9IGYyXG5cdFx0dmFyIHgyb2xkID0geDJcblx0XHR2YXIgeTJvbGQgPSB5MlxuXHRcdGYyID0gZjEgKyBfMTIwICogKHN3ZWVwX2ZsYWcgJiYgZjIgPiBmMSA/IDEgOiAtMSlcblx0XHR4MiA9IGN4ICsgcnggKiBNYXRoLmNvcyhmMilcblx0XHR5MiA9IGN5ICsgcnkgKiBNYXRoLnNpbihmMilcblx0XHR2YXIgcmVzID0gYXJjKHgyLCB5MiwgcngsIHJ5LCBhbmdsZSwgMCwgc3dlZXBfZmxhZywgeDJvbGQsIHkyb2xkLCBbZjIsIGYyb2xkLCBjeCwgY3ldKVxuXHR9XG5cdHZhciB0ID0gTWF0aC50YW4oKGYyIC0gZjEpIC8gNClcblx0dmFyIGh4ID0gNCAvIDMgKiByeCAqIHRcblx0dmFyIGh5ID0gNCAvIDMgKiByeSAqIHRcblx0dmFyIGN1cnZlID0gW1xuXHRcdDIgKiB4MSAtICh4MSArIGh4ICogTWF0aC5zaW4oZjEpKSxcblx0XHQyICogeTEgLSAoeTEgLSBoeSAqIE1hdGguY29zKGYxKSksXG5cdFx0eDIgKyBoeCAqIE1hdGguc2luKGYyKSxcblx0XHR5MiAtIGh5ICogTWF0aC5jb3MoZjIpLFxuXHRcdHgyLFxuXHRcdHkyXG5cdF1cblx0aWYgKHJlY3Vyc2l2ZSkgcmV0dXJuIGN1cnZlXG5cdGlmIChyZXMpIGN1cnZlID0gY3VydmUuY29uY2F0KHJlcylcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBjdXJ2ZS5sZW5ndGg7KSB7XG5cdFx0dmFyIHJvdCA9IHJvdGF0ZShjdXJ2ZVtpXSwgY3VydmVbaSsxXSwgYW5nbGUpXG5cdFx0Y3VydmVbaSsrXSA9IHJvdC54XG5cdFx0Y3VydmVbaSsrXSA9IHJvdC55XG5cdH1cblx0cmV0dXJuIGN1cnZlXG59XG5cbmZ1bmN0aW9uIHJvdGF0ZSh4LCB5LCByYWQpe1xuXHRyZXR1cm4ge1xuXHRcdHg6IHggKiBNYXRoLmNvcyhyYWQpIC0geSAqIE1hdGguc2luKHJhZCksXG5cdFx0eTogeCAqIE1hdGguc2luKHJhZCkgKyB5ICogTWF0aC5jb3MocmFkKVxuXHR9XG59XG5cbmZ1bmN0aW9uIHJhZGlhbnMoZGVncmVzcyl7XG5cdHJldHVybiBkZWdyZXNzICogKM+AIC8gMTgwKVxufVxuIiwiXG5tb2R1bGUuZXhwb3J0cyA9IHJlbGF0aXZlXG5cbi8qKlxuICogZGVmaW5lIGBwYXRoYCB1c2luZyByZWxhdGl2ZSBwb2ludHNcbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBwYXRoXG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqL1xuXG5mdW5jdGlvbiByZWxhdGl2ZShwYXRoKXtcblx0dmFyIHN0YXJ0WCA9IDBcblx0dmFyIHN0YXJ0WSA9IDBcblx0dmFyIHggPSAwXG5cdHZhciB5ID0gMFxuXG5cdHJldHVybiBwYXRoLm1hcChmdW5jdGlvbihzZWcpe1xuXHRcdHNlZyA9IHNlZy5zbGljZSgpXG5cdFx0dmFyIHR5cGUgPSBzZWdbMF1cblx0XHR2YXIgY29tbWFuZCA9IHR5cGUudG9Mb3dlckNhc2UoKVxuXG5cdFx0Ly8gaXMgYWJzb2x1dGVcblx0XHRpZiAodHlwZSAhPSBjb21tYW5kKSB7XG5cdFx0XHRzZWdbMF0gPSBjb21tYW5kXG5cdFx0XHRzd2l0Y2ggKHR5cGUpIHtcblx0XHRcdFx0Y2FzZSAnQSc6XG5cdFx0XHRcdFx0c2VnWzZdIC09IHhcblx0XHRcdFx0XHRzZWdbN10gLT0geVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdGNhc2UgJ1YnOlxuXHRcdFx0XHRcdHNlZ1sxXSAtPSB5XG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0Y2FzZSAnSCc6XG5cdFx0XHRcdFx0c2VnWzFdIC09IHhcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdGZvciAodmFyIGkgPSAxOyBpIDwgc2VnLmxlbmd0aDspIHtcblx0XHRcdFx0XHRcdHNlZ1tpKytdIC09IHhcblx0XHRcdFx0XHRcdHNlZ1tpKytdIC09IHlcblx0XHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gdXBkYXRlIGN1cnNvciBzdGF0ZVxuXHRcdHN3aXRjaCAoY29tbWFuZCkge1xuXHRcdFx0Y2FzZSAneic6XG5cdFx0XHRcdHggPSBzdGFydFhcblx0XHRcdFx0eSA9IHN0YXJ0WVxuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSAnaCc6XG5cdFx0XHRcdHggKz0gc2VnWzFdXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlICd2Jzpcblx0XHRcdFx0eSArPSBzZWdbMV1cblx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgJ20nOlxuXHRcdFx0XHR4ICs9IHNlZ1sxXSBcblx0XHRcdFx0eSArPSBzZWdbMl1cblx0XHRcdFx0c3RhcnRYICs9IHNlZ1sxXVxuXHRcdFx0XHRzdGFydFkgKz0gc2VnWzJdXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHR4ICs9IHNlZ1tzZWcubGVuZ3RoIC0gMl1cblx0XHRcdFx0eSArPSBzZWdbc2VnLmxlbmd0aCAtIDFdXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHNlZ1xuXHR9KVxufVxuIiwiXG5leHBvcnRzLmlzYXR0eSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIGZhbHNlOyB9O1xuXG5mdW5jdGlvbiBSZWFkU3RyZWFtKCkge1xuICB0aHJvdyBuZXcgRXJyb3IoJ3R0eS5SZWFkU3RyZWFtIGlzIG5vdCBpbXBsZW1lbnRlZCcpO1xufVxuZXhwb3J0cy5SZWFkU3RyZWFtID0gUmVhZFN0cmVhbTtcblxuZnVuY3Rpb24gV3JpdGVTdHJlYW0oKSB7XG4gIHRocm93IG5ldyBFcnJvcigndHR5LlJlYWRTdHJlYW0gaXMgbm90IGltcGxlbWVudGVkJyk7XG59XG5leHBvcnRzLldyaXRlU3RyZWFtID0gV3JpdGVTdHJlYW07XG4iXX0=