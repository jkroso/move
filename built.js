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
"/Users/jkroso/.packin/-/github.com/component/classes/tarball/1.1.2/index.js": function(module,exports,require){

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

},"/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/df04901/index.js": function(module,exports,require){

var query = require('query')
var Move = require('./move')
var SVG = require('./svg')

module.exports = function(el){
  if (typeof el == 'string') el = query(el)
  if (el instanceof SVGElement) return new SVG(el)
  return new Move(el)
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

},"/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/df04901/tween/px.js": function(module,exports,require){

var tween = require('./number')

module.exports = function(from, to){
  var frame = tween(from, to)
  return function(n){
    return frame(n).toFixed(1) + 'px'
  }
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

},"/Users/jkroso/.packin/-/github.com/nathan7/inherit/tarball/f1a75b4844/index.js": function(module,exports,require){

module.exports = function(a, b){
  var fn = function(){};
  fn.prototype = b.prototype;
  a.prototype = new fn;
  a.prototype.constructor = a;
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

},"/Users/jkroso/.packin/-/github.com/visionmedia/debug/tarball/0.7.4/index.js": function(module,exports,require){
if ('undefined' == typeof window) {
  module.exports = require('./lib/debug');
} else {
  module.exports = require('./debug');
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

},"/Users/jkroso/.packin/-/registry.npmjs.org/browser-builtins/-/browser-builtins-3.1.0.tgz/builtin/tty.js": function(module,exports,require){

exports.isatty = function () { return false; };

function ReadStream() {
  throw new Error('tty.ReadStream is not implemented');
}
exports.ReadStream = ReadStream;

function WriteStream() {
  throw new Error('tty.ReadStream is not implemented');
}
exports.WriteStream = WriteStream;

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

},"/Users/jkroso/.packin/-/registry.npmjs.org/lazy-property/-/lazy-property-0.0.2.tgz/package.json": function(module,exports,require){
module.exports = require("./lazyProperty.js")
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

},"/node_modules/css-install.js": function(module,exports,require){
module.exports = function(text){
 var style = document.createElement('style')
 style.appendChild(document.createTextNode(text))
 document.head.appendChild(style)
}
},"/node_modules/css-install.js": function(module,exports,require){
module.exports = function (text) {
 var style = document.createElement('style')
 style.appendChild(document.createTextNode(text))
 document.getElementsByTagName('head')[0].appendChild(style)
}
},"/node_modules/jade-runtime.js": function(module,exports,require){
'use strict';

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
  if (arguments.length === 1) {
    var attrs = a[0];
    for (var i = 1; i < a.length; i++) {
      attrs = merge(attrs, a[i]);
    }
    return attrs;
  }
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
 */
exports.joinClasses = joinClasses;
function joinClasses(val) {
  return Array.isArray(val) ? val.map(joinClasses).filter(nulls).join(' ') : val;
}

/**
 * Render the given classes.
 *
 * @param {Array} classes
 * @param {Array.<Boolean>} escaped
 * @return {String}
 */
exports.cls = function cls(classes, escaped) {
  var buf = [];
  for (var i = 0; i < classes.length; i++) {
    if (escaped && escaped[i]) {
      buf.push(exports.escape(joinClasses([classes[i]])));
    } else {
      buf.push(joinClasses(classes[i]));
    }
  }
  var text = joinClasses(buf);
  if (text.length) {
    return ' class="' + text + '"';
  } else {
    return '';
  }
};

/**
 * Render the given attribute.
 *
 * @param {String} key
 * @param {String} val
 * @param {Boolean} escaped
 * @param {Boolean} terse
 * @return {String}
 */
exports.attr = function attr(key, val, escaped, terse) {
  if ('boolean' == typeof val || null == val) {
    if (val) {
      return ' ' + (terse ? key : key + '="' + key + '"');
    } else {
      return '';
    }
  } else if (0 == key.indexOf('data') && 'string' != typeof val) {
    return ' ' + key + "='" + JSON.stringify(val).replace(/'/g, '&apos;') + "'";
  } else if (escaped) {
    return ' ' + key + '="' + exports.escape(val) + '"';
  } else {
    return ' ' + key + '="' + val + '"';
  }
};

/**
 * Render the given attributes object.
 *
 * @param {Object} obj
 * @param {Object} escaped
 * @return {String}
 */
exports.attrs = function attrs(obj, terse){
  var buf = [];

  var keys = Object.keys(obj);

  if (keys.length) {
    for (var i = 0; i < keys.length; ++i) {
      var key = keys[i]
        , val = obj[key];

      if ('class' == key) {
        if (val = joinClasses(val)) {
          buf.push(' ' + key + '="' + val + '"');
        }
      } else {
        buf.push(exports.attr(key, val, false, terse));
      }
    }
  }

  return buf.join('');
};

/**
 * Escape the given string of `html`.
 *
 * @param {String} html
 * @return {String}
 * @api private
 */

exports.escape = function escape(html){
  var result = String(html)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
  if (result === '' + html) return html;
  else return result;
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

}},{
  "/Users/jkroso/.packin/-/github.com/component/dom/tarball/2e041f9/node_modules/classes/index.js": "/Users/jkroso/.packin/-/github.com/component/classes/tarball/1.1.2/index.js",
  "/Users/jkroso/.packin/-/github.com/component/dom/tarball/2e041f9/node_modules/css/index.js": "/Users/jkroso/.packin/-/github.com/component/css/tarball/0.0.3/index.js",
  "/Users/jkroso/.packin/-/github.com/component/dom/tarball/2e041f9/node_modules/delegate/index.js": "/Users/jkroso/.packin/-/github.com/component/delegate/tarball/0.1.0/index.js",
  "/Users/jkroso/Projects/js/move/node_modules/dom/index.js": "/Users/jkroso/.packin/-/github.com/component/dom/tarball/2e041f9/index.js",
  "/Users/jkroso/.packin/-/github.com/component/dom/tarball/2e041f9/node_modules/domify/index.js": "/Users/jkroso/.packin/-/github.com/component/domify/tarball/1.0.0/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/animation/tarball/0.1.0/node_modules/ease/index.js": "/Users/jkroso/.packin/-/github.com/component/ease/tarball/1.0.0/index.js",
  "/Users/jkroso/.packin/-/github.com/component/dom/tarball/2e041f9/node_modules/event/index.js": "/Users/jkroso/.packin/-/github.com/component/event/tarball/0.1.2/index.js",
  "/Users/jkroso/.packin/-/github.com/component/delegate/tarball/0.1.0/node_modules/event/index.js": "/Users/jkroso/.packin/-/github.com/component/event/tarball/0.1.2/index.js",
  "/Users/jkroso/.packin/-/github.com/component/classes/tarball/1.1.2/node_modules/indexof/index.js": "/Users/jkroso/.packin/-/github.com/component/indexof/tarball/0.0.2/index.js",
  "/Users/jkroso/.packin/-/github.com/component/dom/tarball/2e041f9/node_modules/matches-selector/index.js": "/Users/jkroso/.packin/-/github.com/component/matches-selector/tarball/0.1.1/index.js",
  "/Users/jkroso/.packin/-/github.com/component/delegate/tarball/0.1.0/node_modules/matches-selector/index.js": "/Users/jkroso/.packin/-/github.com/component/matches-selector/tarball/0.1.1/index.js",
  "/Users/jkroso/.packin/-/github.com/yields/traverse/tarball/0.1.1/node_modules/matches-selector/index.js": "/Users/jkroso/.packin/-/github.com/component/matches-selector/tarball/0.1.1/index.js",
  "/Users/jkroso/.packin/-/github.com/component/to-function/tarball/getter/fns/node_modules/props/index.js": "/Users/jkroso/.packin/-/github.com/component/props/tarball/1.1.0/index.js",
  "/Users/jkroso/.packin/-/github.com/component/dom/tarball/2e041f9/node_modules/query/index.js": "/Users/jkroso/.packin/-/github.com/component/query/tarball/0.0.1/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/df04901/node_modules/query/index.js": "/Users/jkroso/.packin/-/github.com/component/query/tarball/0.0.2/index.js",
  "/Users/jkroso/.packin/-/github.com/component/matches-selector/tarball/0.1.1/node_modules/query/index.js": "/Users/jkroso/.packin/-/github.com/component/query/tarball/0.0.2/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/animation/tarball/0.1.0/node_modules/raf/index.js": "/Users/jkroso/.packin/-/github.com/component/raf/tarball/1.1.2/index.js",
  "/Users/jkroso/.packin/-/github.com/component/dom/tarball/2e041f9/node_modules/to-function/index.js": "/Users/jkroso/.packin/-/github.com/component/to-function/tarball/getter/fns/index.js",
  "/Users/jkroso/.packin/-/github.com/component/dom/tarball/2e041f9/node_modules/trim/index.js": "/Users/jkroso/.packin/-/github.com/component/trim/tarball/0.0.1/index.js",
  "/Users/jkroso/.packin/-/github.com/component/value/tarball/1.1.0/node_modules/type/index.js": "/Users/jkroso/.packin/-/github.com/component/type/tarball/1.0.0/index.js",
  "/Users/jkroso/.packin/-/github.com/component/dom/tarball/2e041f9/node_modules/value/index.js": "/Users/jkroso/.packin/-/github.com/component/value/tarball/1.1.0/index.js",
  "/Users/jkroso/.packin/-/github.com/component/css/tarball/0.0.3/node_modules/within-document/index.js": "/Users/jkroso/.packin/-/github.com/component/within-document/tarball/0.0.1/index.js",
  "/Users/jkroso/.packin/-/github.com/component/css/tarball/0.0.3/node_modules/to-camel-case/index.js": "/Users/jkroso/.packin/-/github.com/ianstormtaylor/to-camel-case/tarball/0.2.1/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/df04901/node_modules/animation/index.js": "/Users/jkroso/.packin/-/github.com/jkroso/animation/tarball/0.1.0/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/df04901/node_modules/clone/index.js": "/Users/jkroso/.packin/-/github.com/jkroso/clone/tarball/0.3.0/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/animation/tarball/0.1.0/node_modules/emitter/index.js": "/Users/jkroso/.packin/-/github.com/jkroso/emitter/tarball/0.10.0/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/animation/tarball/0.1.0/node_modules/extensible/index.js": "/Users/jkroso/.packin/-/github.com/jkroso/extensible/tarball/0.2.0/index.js",
  "/Users/jkroso/Projects/js/move/node_modules/move/index.js": "/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/df04901/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/animation/tarball/0.1.0/node_modules/now/index.js": "/Users/jkroso/.packin/-/github.com/jkroso/now/tarball/0.1.1/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/clone/tarball/0.3.0/node_modules/type/index.js": "/Users/jkroso/.packin/-/github.com/jkroso/type/tarball/1.0.2/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/df04901/node_modules/unmatrix/index.js": "/Users/jkroso/.packin/-/github.com/jkroso/unmatrix/tarball/0.1.0/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/extensible/tarball/0.2.0/node_modules/inherit/index.js": "/Users/jkroso/.packin/-/github.com/nathan7/inherit/tarball/f1a75b4844/index.js",
  "/Users/jkroso/.packin/-/github.com/component/css/tarball/0.0.3/node_modules/debug/index.js": "/Users/jkroso/.packin/-/github.com/visionmedia/debug/tarball/0.7.4/index.js",
  "/Users/jkroso/.packin/-/github.com/component/dom/tarball/2e041f9/node_modules/isArray/index.js": "/Users/jkroso/.packin/-/github.com/yields/isArray/tarball/1.0.0/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/emitter/tarball/0.10.0/node_modules/merge/index.js": "/Users/jkroso/.packin/-/github.com/yields/merge/tarball/2f357cb/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/extensible/tarball/0.2.0/node_modules/merge/index.js": "/Users/jkroso/.packin/-/github.com/yields/merge/tarball/2f357cb501/index.js",
  "/Users/jkroso/.packin/-/github.com/component/dom/tarball/2e041f9/node_modules/traverse/index.js": "/Users/jkroso/.packin/-/github.com/yields/traverse/tarball/0.1.1/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/df04901/node_modules/abs-svg-path/index.js": "/Users/jkroso/.packin/-/registry.npmjs.org/abs-svg-path/-/abs-svg-path-0.1.1.tgz/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/df04901/node_modules/balance-svg-paths/index.js": "/Users/jkroso/.packin/-/registry.npmjs.org/balance-svg-paths/-/balance-svg-paths-0.1.0.tgz/index.js",
  "/node_modules/tty.js": "/Users/jkroso/.packin/-/registry.npmjs.org/browser-builtins/-/browser-builtins-3.1.0.tgz/builtin/tty.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/df04901/node_modules/color-parser/index.js": "/Users/jkroso/.packin/-/registry.npmjs.org/color-parser/-/color-parser-0.1.0.tgz/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/df04901/node_modules/fcomp/index.js": "/Users/jkroso/.packin/-/registry.npmjs.org/fcomp/-/fcomp-1.1.0.tgz/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/df04901/node_modules/lazy-property/package.json": "/Users/jkroso/.packin/-/registry.npmjs.org/lazy-property/-/lazy-property-0.0.2.tgz/package.json",
  "/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/df04901/node_modules/normalize-svg-path/index.js": "/Users/jkroso/.packin/-/registry.npmjs.org/normalize-svg-path/-/normalize-svg-path-0.1.0.tgz/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/animation/tarball/0.1.0/node_modules/parse-duration/index.js": "/Users/jkroso/.packin/-/registry.npmjs.org/parse-duration/-/parse-duration-0.1.0.tgz/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/df04901/node_modules/parse-svg-path/index.js": "/Users/jkroso/.packin/-/registry.npmjs.org/parse-svg-path/-/parse-svg-path-0.1.1.tgz/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/df04901/node_modules/prefix/index.js": "/Users/jkroso/.packin/-/registry.npmjs.org/prefix/-/prefix-0.2.1.tgz/index.js",
  "/Users/jkroso/.packin/-/github.com/component/to-function/tarball/getter/fns/node_modules/props-component/index.js": "/Users/jkroso/.packin/-/registry.npmjs.org/props-component/-/props-component-1.0.3.tgz/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/df04901/node_modules/rel-svg-path/index.js": "/Users/jkroso/.packin/-/registry.npmjs.org/rel-svg-path/-/rel-svg-path-0.1.0.tgz/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/df04901/node_modules/serialize-svg-path/index.js": "/Users/jkroso/.packin/-/registry.npmjs.org/serialize-svg-path/-/serialize-svg-path-0.1.0.tgz/index.js",
  "/Users/jkroso/.packin/-/github.com/jkroso/move/tarball/df04901/node_modules/string-tween/index.js": "/Users/jkroso/.packin/-/registry.npmjs.org/string-tween/-/string-tween-0.1.0.tgz/index.js",
  "/Users/jkroso/.packin/-/registry.npmjs.org/to-space-case/-/to-space-case-0.1.2.tgz/node_modules/to-no-case/index.js": "/Users/jkroso/.packin/-/registry.npmjs.org/to-no-case/-/to-no-case-0.1.1.tgz/index.js",
  "/Users/jkroso/.packin/-/github.com/ianstormtaylor/to-camel-case/tarball/0.2.1/node_modules/to-space-case/index.js": "/Users/jkroso/.packin/-/registry.npmjs.org/to-space-case/-/to-space-case-0.1.2.tgz/index.js",
  "/Users/jkroso/Projects/js/move/examples.js": "/Users/jkroso/Projects/js/move/examples.original.js"
})("/Users/jkroso/Projects/js/move/examples.original.js")
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL1VzZXJzL2prcm9zby9Qcm9qZWN0cy9qcy9tb3ZlL2V4YW1wbGVzLm9yaWdpbmFsLmpzIiwic291cmNlcyI6WyIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2NvbXBvbmVudC9jbGFzc2VzL3RhcmJhbGwvMS4xLjIvaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2NvbXBvbmVudC9jc3MvdGFyYmFsbC8wLjAuMy9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vY29tcG9uZW50L2Nzcy90YXJiYWxsLzAuMC4zL2xpYi9jb21wdXRlZC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vY29tcG9uZW50L2Nzcy90YXJiYWxsLzAuMC4zL2xpYi9jc3MuanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2NvbXBvbmVudC9jc3MvdGFyYmFsbC8wLjAuMy9saWIvaG9va3MuanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2NvbXBvbmVudC9jc3MvdGFyYmFsbC8wLjAuMy9saWIvcHJvcC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vY29tcG9uZW50L2Nzcy90YXJiYWxsLzAuMC4zL2xpYi9zdHlsZS5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vY29tcG9uZW50L2Nzcy90YXJiYWxsLzAuMC4zL2xpYi9zdHlsZXMuanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2NvbXBvbmVudC9jc3MvdGFyYmFsbC8wLjAuMy9saWIvc3VwcG9ydC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vY29tcG9uZW50L2Nzcy90YXJiYWxsLzAuMC4zL2xpYi9zd2FwLmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9jb21wb25lbnQvY3NzL3RhcmJhbGwvMC4wLjMvbGliL3ZlbmRvci5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vY29tcG9uZW50L2RlbGVnYXRlL3RhcmJhbGwvMC4xLjAvaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2NvbXBvbmVudC9kb20vdGFyYmFsbC8yZTA0MWY5L2luZGV4LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9jb21wb25lbnQvZG9tL3RhcmJhbGwvMmUwNDFmOS9saWIvYXR0cmlidXRlcy5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vY29tcG9uZW50L2RvbS90YXJiYWxsLzJlMDQxZjkvbGliL2NsYXNzZXMuanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2NvbXBvbmVudC9kb20vdGFyYmFsbC8yZTA0MWY5L2xpYi9ldmVudHMuanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2NvbXBvbmVudC9kb20vdGFyYmFsbC8yZTA0MWY5L2xpYi9tYW5pcHVsYXRlLmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9jb21wb25lbnQvZG9tL3RhcmJhbGwvMmUwNDFmOS9saWIvdHJhdmVyc2UuanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2NvbXBvbmVudC9kb21pZnkvdGFyYmFsbC8xLjAuMC9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vY29tcG9uZW50L2Vhc2UvdGFyYmFsbC8xLjAuMC9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vY29tcG9uZW50L2V2ZW50L3RhcmJhbGwvMC4xLjIvaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2NvbXBvbmVudC9pbmRleG9mL3RhcmJhbGwvMC4wLjIvaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2NvbXBvbmVudC9tYXRjaGVzLXNlbGVjdG9yL3RhcmJhbGwvMC4xLjEvaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2NvbXBvbmVudC9wcm9wcy90YXJiYWxsLzEuMS4wL2luZGV4LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9jb21wb25lbnQvcXVlcnkvdGFyYmFsbC8wLjAuMS9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vY29tcG9uZW50L3F1ZXJ5L3RhcmJhbGwvMC4wLjIvaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2NvbXBvbmVudC9yYWYvdGFyYmFsbC8xLjEuMi9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vY29tcG9uZW50L3RvLWZ1bmN0aW9uL3RhcmJhbGwvZ2V0dGVyL2Zucy9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vY29tcG9uZW50L3RyaW0vdGFyYmFsbC8wLjAuMS9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vY29tcG9uZW50L3R5cGUvdGFyYmFsbC8xLjAuMC9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vY29tcG9uZW50L3ZhbHVlL3RhcmJhbGwvMS4xLjAvaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2NvbXBvbmVudC93aXRoaW4tZG9jdW1lbnQvdGFyYmFsbC8wLjAuMS9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vaWFuc3Rvcm10YXlsb3IvdG8tY2FtZWwtY2FzZS90YXJiYWxsLzAuMi4xL2luZGV4LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9qa3Jvc28vYW5pbWF0aW9uL3RhcmJhbGwvMC4xLjAvaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2prcm9zby9jbG9uZS90YXJiYWxsLzAuMy4wL2luZGV4LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9qa3Jvc28vZW1pdHRlci90YXJiYWxsLzAuMTAuMC9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vamtyb3NvL2V4dGVuc2libGUvdGFyYmFsbC8wLjIuMC9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vamtyb3NvL21vdmUvdGFyYmFsbC9kZjA0OTAxL2luZGV4LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9qa3Jvc28vbW92ZS90YXJiYWxsL2RmMDQ5MDEvbW92ZS5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vamtyb3NvL21vdmUvdGFyYmFsbC9kZjA0OTAxL3N2Zy5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vamtyb3NvL21vdmUvdGFyYmFsbC9kZjA0OTAxL3R3ZWVuL2NvbG9yLmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9qa3Jvc28vbW92ZS90YXJiYWxsL2RmMDQ5MDEvdHdlZW4vaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2prcm9zby9tb3ZlL3RhcmJhbGwvZGYwNDkwMS90d2Vlbi9tYXRyaXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2prcm9zby9tb3ZlL3RhcmJhbGwvZGYwNDkwMS90d2Vlbi9udW1iZXIuanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2prcm9zby9tb3ZlL3RhcmJhbGwvZGYwNDkwMS90d2Vlbi9wYXRoLmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS9qa3Jvc28vbW92ZS90YXJiYWxsL2RmMDQ5MDEvdHdlZW4vcHguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL2prcm9zby9ub3cvdGFyYmFsbC8wLjEuMS9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vamtyb3NvL3R5cGUvdGFyYmFsbC8xLjAuMi9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL2dpdGh1Yi5jb20vamtyb3NvL3VubWF0cml4L3RhcmJhbGwvMC4xLjAvaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL25hdGhhbjcvaW5oZXJpdC90YXJiYWxsL2YxYTc1YjQ4NDQvaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL3Zpc2lvbm1lZGlhL2RlYnVnL3RhcmJhbGwvMC43LjQvZGVidWcuanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL3Zpc2lvbm1lZGlhL2RlYnVnL3RhcmJhbGwvMC43LjQvaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9naXRodWIuY29tL3Zpc2lvbm1lZGlhL2RlYnVnL3RhcmJhbGwvMC43LjQvbGliL2RlYnVnLmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS95aWVsZHMvaXNBcnJheS90YXJiYWxsLzEuMC4wL2luZGV4LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS95aWVsZHMvbWVyZ2UvdGFyYmFsbC8yZjM1N2NiL2luZGV4LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS95aWVsZHMvbWVyZ2UvdGFyYmFsbC8yZjM1N2NiNTAxL2luZGV4LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vZ2l0aHViLmNvbS95aWVsZHMvdHJhdmVyc2UvdGFyYmFsbC8wLjEuMS9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL3JlZ2lzdHJ5Lm5wbWpzLm9yZy9hYnMtc3ZnLXBhdGgvLS9hYnMtc3ZnLXBhdGgtMC4xLjEudGd6L2luZGV4LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vcmVnaXN0cnkubnBtanMub3JnL2JhbGFuY2Utc3ZnLXBhdGhzLy0vYmFsYW5jZS1zdmctcGF0aHMtMC4xLjAudGd6L2luZGV4LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vcmVnaXN0cnkubnBtanMub3JnL2Jyb3dzZXItYnVpbHRpbnMvLS9icm93c2VyLWJ1aWx0aW5zLTMuMS4wLnRnei9idWlsdGluL3R0eS5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL3JlZ2lzdHJ5Lm5wbWpzLm9yZy9jb2xvci1wYXJzZXIvLS9jb2xvci1wYXJzZXItMC4xLjAudGd6L2NvbG9ycy5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL3JlZ2lzdHJ5Lm5wbWpzLm9yZy9jb2xvci1wYXJzZXIvLS9jb2xvci1wYXJzZXItMC4xLjAudGd6L2luZGV4LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vcmVnaXN0cnkubnBtanMub3JnL2Zjb21wLy0vZmNvbXAtMS4xLjAudGd6L2luZGV4LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vcmVnaXN0cnkubnBtanMub3JnL2xhenktcHJvcGVydHkvLS9sYXp5LXByb3BlcnR5LTAuMC4yLnRnei9sYXp5UHJvcGVydHkuanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9yZWdpc3RyeS5ucG1qcy5vcmcvbGF6eS1wcm9wZXJ0eS8tL2xhenktcHJvcGVydHktMC4wLjIudGd6L3BhY2thZ2UuanNvbiIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL3JlZ2lzdHJ5Lm5wbWpzLm9yZy9ub3JtYWxpemUtc3ZnLXBhdGgvLS9ub3JtYWxpemUtc3ZnLXBhdGgtMC4xLjAudGd6L2luZGV4LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vcmVnaXN0cnkubnBtanMub3JnL3BhcnNlLWR1cmF0aW9uLy0vcGFyc2UtZHVyYXRpb24tMC4xLjAudGd6L2luZGV4LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vcmVnaXN0cnkubnBtanMub3JnL3BhcnNlLXN2Zy1wYXRoLy0vcGFyc2Utc3ZnLXBhdGgtMC4xLjEudGd6L2luZGV4LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vcmVnaXN0cnkubnBtanMub3JnL3ByZWZpeC8tL3ByZWZpeC0wLjIuMS50Z3ovaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9yZWdpc3RyeS5ucG1qcy5vcmcvcHJvcHMtY29tcG9uZW50Ly0vcHJvcHMtY29tcG9uZW50LTEuMC4zLnRnei9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL3JlZ2lzdHJ5Lm5wbWpzLm9yZy9yZWwtc3ZnLXBhdGgvLS9yZWwtc3ZnLXBhdGgtMC4xLjAudGd6L2luZGV4LmpzIiwiL1VzZXJzL2prcm9zby8ucGFja2luLy0vcmVnaXN0cnkubnBtanMub3JnL3NlcmlhbGl6ZS1zdmctcGF0aC8tL3NlcmlhbGl6ZS1zdmctcGF0aC0wLjEuMC50Z3ovaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9yZWdpc3RyeS5ucG1qcy5vcmcvc3RyaW5nLXR3ZWVuLy0vc3RyaW5nLXR3ZWVuLTAuMS4wLnRnei9pbmRleC5qcyIsIi9Vc2Vycy9qa3Jvc28vLnBhY2tpbi8tL3JlZ2lzdHJ5Lm5wbWpzLm9yZy90by1uby1jYXNlLy0vdG8tbm8tY2FzZS0wLjEuMS50Z3ovaW5kZXguanMiLCIvVXNlcnMvamtyb3NvLy5wYWNraW4vLS9yZWdpc3RyeS5ucG1qcy5vcmcvdG8tc3BhY2UtY2FzZS8tL3RvLXNwYWNlLWNhc2UtMC4xLjIudGd6L2luZGV4LmpzIiwiL1VzZXJzL2prcm9zby9Qcm9qZWN0cy9qcy9tb3ZlL2V4YW1wbGVzLm9yaWdpbmFsLmpzIiwiL25vZGVfbW9kdWxlcy9jc3MtaW5zdGFsbC5qcyIsIi9ub2RlX21vZHVsZXMvamFkZS1ydW50aW1lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1TkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdlFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDalNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbIlxuLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICovXG5cbnZhciBpbmRleCA9IHJlcXVpcmUoJ2luZGV4b2YnKTtcblxuLyoqXG4gKiBXaGl0ZXNwYWNlIHJlZ2V4cC5cbiAqL1xuXG52YXIgcmUgPSAvXFxzKy87XG5cbi8qKlxuICogdG9TdHJpbmcgcmVmZXJlbmNlLlxuICovXG5cbnZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbi8qKlxuICogV3JhcCBgZWxgIGluIGEgYENsYXNzTGlzdGAuXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbFxuICogQHJldHVybiB7Q2xhc3NMaXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGVsKXtcbiAgcmV0dXJuIG5ldyBDbGFzc0xpc3QoZWwpO1xufTtcblxuLyoqXG4gKiBJbml0aWFsaXplIGEgbmV3IENsYXNzTGlzdCBmb3IgYGVsYC5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBDbGFzc0xpc3QoZWwpIHtcbiAgdGhpcy5lbCA9IGVsO1xuICB0aGlzLmxpc3QgPSBlbC5jbGFzc0xpc3Q7XG59XG5cbi8qKlxuICogQWRkIGNsYXNzIGBuYW1lYCBpZiBub3QgYWxyZWFkeSBwcmVzZW50LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gKiBAcmV0dXJuIHtDbGFzc0xpc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkNsYXNzTGlzdC5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24obmFtZSl7XG4gIC8vIGNsYXNzTGlzdFxuICBpZiAodGhpcy5saXN0KSB7XG4gICAgdGhpcy5saXN0LmFkZChuYW1lKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIGZhbGxiYWNrXG4gIHZhciBhcnIgPSB0aGlzLmFycmF5KCk7XG4gIHZhciBpID0gaW5kZXgoYXJyLCBuYW1lKTtcbiAgaWYgKCF+aSkgYXJyLnB1c2gobmFtZSk7XG4gIHRoaXMuZWwuY2xhc3NOYW1lID0gYXJyLmpvaW4oJyAnKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBjbGFzcyBgbmFtZWAgd2hlbiBwcmVzZW50LCBvclxuICogcGFzcyBhIHJlZ3VsYXIgZXhwcmVzc2lvbiB0byByZW1vdmVcbiAqIGFueSB3aGljaCBtYXRjaC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xSZWdFeHB9IG5hbWVcbiAqIEByZXR1cm4ge0NsYXNzTGlzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuQ2xhc3NMaXN0LnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbihuYW1lKXtcbiAgaWYgKCdbb2JqZWN0IFJlZ0V4cF0nID09IHRvU3RyaW5nLmNhbGwobmFtZSkpIHtcbiAgICByZXR1cm4gdGhpcy5yZW1vdmVNYXRjaGluZyhuYW1lKTtcbiAgfVxuXG4gIC8vIGNsYXNzTGlzdFxuICBpZiAodGhpcy5saXN0KSB7XG4gICAgdGhpcy5saXN0LnJlbW92ZShuYW1lKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIGZhbGxiYWNrXG4gIHZhciBhcnIgPSB0aGlzLmFycmF5KCk7XG4gIHZhciBpID0gaW5kZXgoYXJyLCBuYW1lKTtcbiAgaWYgKH5pKSBhcnIuc3BsaWNlKGksIDEpO1xuICB0aGlzLmVsLmNsYXNzTmFtZSA9IGFyci5qb2luKCcgJyk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgYWxsIGNsYXNzZXMgbWF0Y2hpbmcgYHJlYC5cbiAqXG4gKiBAcGFyYW0ge1JlZ0V4cH0gcmVcbiAqIEByZXR1cm4ge0NsYXNzTGlzdH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbkNsYXNzTGlzdC5wcm90b3R5cGUucmVtb3ZlTWF0Y2hpbmcgPSBmdW5jdGlvbihyZSl7XG4gIHZhciBhcnIgPSB0aGlzLmFycmF5KCk7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKHJlLnRlc3QoYXJyW2ldKSkge1xuICAgICAgdGhpcy5yZW1vdmUoYXJyW2ldKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFRvZ2dsZSBjbGFzcyBgbmFtZWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAqIEByZXR1cm4ge0NsYXNzTGlzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuQ2xhc3NMaXN0LnByb3RvdHlwZS50b2dnbGUgPSBmdW5jdGlvbihuYW1lKXtcbiAgLy8gY2xhc3NMaXN0XG4gIGlmICh0aGlzLmxpc3QpIHtcbiAgICB0aGlzLmxpc3QudG9nZ2xlKG5hbWUpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gZmFsbGJhY2tcbiAgaWYgKHRoaXMuaGFzKG5hbWUpKSB7XG4gICAgdGhpcy5yZW1vdmUobmFtZSk7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5hZGQobmFtZSk7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJldHVybiBhbiBhcnJheSBvZiBjbGFzc2VzLlxuICpcbiAqIEByZXR1cm4ge0FycmF5fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5DbGFzc0xpc3QucHJvdG90eXBlLmFycmF5ID0gZnVuY3Rpb24oKXtcbiAgdmFyIHN0ciA9IHRoaXMuZWwuY2xhc3NOYW1lLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKTtcbiAgdmFyIGFyciA9IHN0ci5zcGxpdChyZSk7XG4gIGlmICgnJyA9PT0gYXJyWzBdKSBhcnIuc2hpZnQoKTtcbiAgcmV0dXJuIGFycjtcbn07XG5cbi8qKlxuICogQ2hlY2sgaWYgY2xhc3MgYG5hbWVgIGlzIHByZXNlbnQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAqIEByZXR1cm4ge0NsYXNzTGlzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuQ2xhc3NMaXN0LnByb3RvdHlwZS5oYXMgPVxuQ2xhc3NMaXN0LnByb3RvdHlwZS5jb250YWlucyA9IGZ1bmN0aW9uKG5hbWUpe1xuICByZXR1cm4gdGhpcy5saXN0XG4gICAgPyB0aGlzLmxpc3QuY29udGFpbnMobmFtZSlcbiAgICA6ICEhIH5pbmRleCh0aGlzLmFycmF5KCksIG5hbWUpO1xufTtcbiIsIi8qKlxuICogTW9kdWxlIERlcGVuZGVuY2llc1xuICovXG5cbnZhciBkZWJ1ZyA9IHJlcXVpcmUoJ2RlYnVnJykoJ2NzcycpO1xudmFyIHNldCA9IHJlcXVpcmUoJy4vbGliL3N0eWxlJyk7XG52YXIgZ2V0ID0gcmVxdWlyZSgnLi9saWIvY3NzJyk7XG5cbi8qKlxuICogRXhwb3NlIGBjc3NgXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBjc3M7XG5cbi8qKlxuICogR2V0IGFuZCBzZXQgY3NzIHZhbHVlc1xuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7U3RyaW5nfE9iamVjdH0gcHJvcFxuICogQHBhcmFtIHtNaXhlZH0gdmFsXG4gKiBAcmV0dXJuIHtFbGVtZW50fSBlbFxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBjc3MoZWwsIHByb3AsIHZhbCkge1xuICBpZiAoIWVsKSByZXR1cm47XG5cbiAgaWYgKHVuZGVmaW5lZCAhPT0gdmFsKSB7XG4gICAgdmFyIG9iaiA9IHt9O1xuICAgIG9ialtwcm9wXSA9IHZhbDtcbiAgICBkZWJ1Zygnc2V0dGluZyBzdHlsZXMgJWonLCBvYmopO1xuICAgIHJldHVybiBzZXRTdHlsZXMoZWwsIG9iaik7XG4gIH1cblxuICBpZiAoJ29iamVjdCcgPT0gdHlwZW9mIHByb3ApIHtcbiAgICBkZWJ1Zygnc2V0dGluZyBzdHlsZXMgJWonLCBwcm9wKTtcbiAgICByZXR1cm4gc2V0U3R5bGVzKGVsLCBwcm9wKTtcbiAgfVxuXG4gIGRlYnVnKCdnZXR0aW5nICVzJywgcHJvcCk7XG4gIHJldHVybiBnZXQoZWwsIHByb3ApO1xufVxuXG4vKipcbiAqIFNldCB0aGUgc3R5bGVzIG9uIGFuIGVsZW1lbnRcbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gKiBAcGFyYW0ge09iamVjdH0gcHJvcHNcbiAqIEByZXR1cm4ge0VsZW1lbnR9IGVsXG4gKi9cblxuZnVuY3Rpb24gc2V0U3R5bGVzKGVsLCBwcm9wcykge1xuICBmb3IgKHZhciBwcm9wIGluIHByb3BzKSB7XG4gICAgc2V0KGVsLCBwcm9wLCBwcm9wc1twcm9wXSk7XG4gIH1cblxuICByZXR1cm4gZWw7XG59XG4iLCIvKipcbiAqIE1vZHVsZSBEZXBlbmRlbmNpZXNcbiAqL1xuXG52YXIgZGVidWcgPSByZXF1aXJlKCdkZWJ1ZycpKCdjc3M6Y29tcHV0ZWQnKTtcbnZhciB3aXRoaW5Eb2N1bWVudCA9IHJlcXVpcmUoJ3dpdGhpbi1kb2N1bWVudCcpO1xudmFyIHN0eWxlcyA9IHJlcXVpcmUoJy4vc3R5bGVzJyk7XG5cbi8qKlxuICogRXhwb3NlIGBjb21wdXRlZGBcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNvbXB1dGVkO1xuXG4vKipcbiAqIEdldCB0aGUgY29tcHV0ZWQgc3R5bGVcbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gKiBAcGFyYW0ge1N0cmluZ30gcHJvcFxuICogQHBhcmFtIHtBcnJheX0gcHJlY29tcHV0ZWQgKG9wdGlvbmFsKVxuICogQHJldHVybiB7QXJyYXl9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBjb21wdXRlZChlbCwgcHJvcCwgcHJlY29tcHV0ZWQpIHtcbiAgY29tcHV0ZWQgPSBwcmVjb21wdXRlZCB8fCBzdHlsZXMoZWwpO1xuICBpZiAoIWNvbXB1dGVkKSByZXR1cm47XG5cbiAgdmFyIHJldCA9IGNvbXB1dGVkLmdldFByb3BlcnR5VmFsdWUocHJvcCkgfHwgY29tcHV0ZWRbcHJvcF07XG5cbiAgaWYgKCcnID09PSByZXQgJiYgIXdpdGhpbkRvY3VtZW50KGVsKSkge1xuICAgIGRlYnVnKCdlbGVtZW50IG5vdCB3aXRoaW4gZG9jdW1lbnQsIHRyeSBmaW5kaW5nIGZyb20gc3R5bGUgYXR0cmlidXRlJyk7XG4gICAgdmFyIHN0eWxlID0gcmVxdWlyZSgnLi9zdHlsZScpO1xuICAgIHJldCA9IHN0eWxlKGVsLCBwcm9wKTtcbiAgfVxuXG4gIGRlYnVnKCdjb21wdXRlZCB2YWx1ZSBvZiAlczogJXMnLCBwcm9wLCByZXQpO1xuXG4gIC8vIFN1cHBvcnQ6IElFXG4gIC8vIElFIHJldHVybnMgekluZGV4IHZhbHVlIGFzIGFuIGludGVnZXIuXG4gIHJldHVybiB1bmRlZmluZWQgPT09IHJldCA/IHJldCA6IHJldCArICcnO1xufVxuIiwiLyoqXG4gKiBNb2R1bGUgRGVwZW5kZW5jaWVzXG4gKi9cblxudmFyIGRlYnVnID0gcmVxdWlyZSgnZGVidWcnKSgnY3NzOmNzcycpO1xudmFyIGNhbWVsY2FzZSA9IHJlcXVpcmUoJ3RvLWNhbWVsLWNhc2UnKTtcbnZhciBjb21wdXRlZCA9IHJlcXVpcmUoJy4vY29tcHV0ZWQnKTtcbnZhciBwcm9wZXJ0eSA9IHJlcXVpcmUoJy4vcHJvcCcpO1xuXG4vKipcbiAqIEV4cG9zZSBgY3NzYFxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gY3NzO1xuXG4vKipcbiAqIENTUyBOb3JtYWwgVHJhbnNmb3Jtc1xuICovXG5cbnZhciBjc3NOb3JtYWxUcmFuc2Zvcm0gPSB7XG4gIGxldHRlclNwYWNpbmc6IDAsXG4gIGZvbnRXZWlnaHQ6IDQwMFxufTtcblxuLyoqXG4gKiBHZXQgYSBDU1MgdmFsdWVcbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gKiBAcGFyYW0ge1N0cmluZ30gcHJvcFxuICogQHBhcmFtIHtNaXhlZH0gZXh0cmFcbiAqIEBwYXJhbSB7QXJyYXl9IHN0eWxlc1xuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5cbmZ1bmN0aW9uIGNzcyhlbCwgcHJvcCwgZXh0cmEsIHN0eWxlcykge1xuICB2YXIgaG9va3MgPSByZXF1aXJlKCcuL2hvb2tzJyk7XG4gIHZhciBvcmlnID0gY2FtZWxjYXNlKHByb3ApO1xuICB2YXIgc3R5bGUgPSBlbC5zdHlsZTtcbiAgdmFyIHZhbDtcblxuICBwcm9wID0gcHJvcGVydHkocHJvcCwgc3R5bGUpO1xuICB2YXIgaG9vayA9IGhvb2tzW3Byb3BdIHx8IGhvb2tzW29yaWddO1xuXG4gIC8vIElmIGEgaG9vayB3YXMgcHJvdmlkZWQgZ2V0IHRoZSBjb21wdXRlZCB2YWx1ZSBmcm9tIHRoZXJlXG4gIGlmIChob29rICYmIGhvb2suZ2V0KSB7XG4gICAgZGVidWcoJ2dldCBob29rIHByb3ZpZGVkLiB1c2UgdGhhdCcpO1xuICAgIHZhbCA9IGhvb2suZ2V0KGVsLCB0cnVlLCBleHRyYSk7XG4gIH1cblxuICAvLyBPdGhlcndpc2UsIGlmIGEgd2F5IHRvIGdldCB0aGUgY29tcHV0ZWQgdmFsdWUgZXhpc3RzLCB1c2UgdGhhdFxuICBpZiAodW5kZWZpbmVkID09IHZhbCkge1xuICAgIGRlYnVnKCdmZXRjaCB0aGUgY29tcHV0ZWQgdmFsdWUgb2YgJXMnLCBwcm9wKTtcbiAgICB2YWwgPSBjb21wdXRlZChlbCwgcHJvcCk7XG4gIH1cblxuICBpZiAoJ25vcm1hbCcgPT0gdmFsICYmIGNzc05vcm1hbFRyYW5zZm9ybVtwcm9wXSkge1xuICAgIHZhbCA9IGNzc05vcm1hbFRyYW5zZm9ybVtwcm9wXTtcbiAgICBkZWJ1Zygnbm9ybWFsID0+ICVzJywgdmFsKTtcbiAgfVxuXG4gIC8vIFJldHVybiwgY29udmVydGluZyB0byBudW1iZXIgaWYgZm9yY2VkIG9yIGEgcXVhbGlmaWVyIHdhcyBwcm92aWRlZCBhbmQgdmFsIGxvb2tzIG51bWVyaWNcbiAgaWYgKCcnID09IGV4dHJhIHx8IGV4dHJhKSB7XG4gICAgZGVidWcoJ2NvbnZlcnRpbmcgdmFsdWU6ICVzIGludG8gYSBudW1iZXInKTtcbiAgICB2YXIgbnVtID0gcGFyc2VGbG9hdCh2YWwpO1xuICAgIHJldHVybiB0cnVlID09PSBleHRyYSB8fCBpc051bWVyaWMobnVtKSA/IG51bSB8fCAwIDogdmFsO1xuICB9XG5cbiAgcmV0dXJuIHZhbDtcbn1cblxuLyoqXG4gKiBJcyBOdW1lcmljXG4gKlxuICogQHBhcmFtIHtNaXhlZH0gb2JqXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5cbmZ1bmN0aW9uIGlzTnVtZXJpYyhvYmopIHtcbiAgcmV0dXJuICFpc05hbihwYXJzZUZsb2F0KG9iaikpICYmIGlzRmluaXRlKG9iaik7XG59XG4iLCIvKipcbiAqIE1vZHVsZSBEZXBlbmRlbmNpZXNcbiAqL1xuXG52YXIgY3NzID0gcmVxdWlyZSgnLi9jc3MnKTtcbnZhciBjc3NTaG93ID0geyBwb3NpdGlvbjogJ2Fic29sdXRlJywgdmlzaWJpbGl0eTogJ2hpZGRlbicsIGRpc3BsYXk6ICdibG9jaycgfTtcbnZhciBwbnVtID0gKC9bKy1dPyg/OlxcZCpcXC58KVxcZCsoPzpbZUVdWystXT9cXGQrfCkvKS5zb3VyY2U7XG52YXIgcm51bW5vbnB4ID0gbmV3IFJlZ0V4cCggJ14oJyArIHBudW0gKyAnKSg/IXB4KVthLXolXSskJywgJ2knKTtcbnZhciBybnVtc3BsaXQgPSBuZXcgUmVnRXhwKCAnXignICsgcG51bSArICcpKC4qKSQnLCAnaScpO1xudmFyIHJkaXNwbGF5c3dhcCA9IC9eKG5vbmV8dGFibGUoPyEtY1tlYV0pLispLztcbnZhciBzdHlsZXMgPSByZXF1aXJlKCcuL3N0eWxlcycpO1xudmFyIHN1cHBvcnQgPSByZXF1aXJlKCcuL3N1cHBvcnQnKTtcbnZhciBzd2FwID0gcmVxdWlyZSgnLi9zd2FwJyk7XG52YXIgY29tcHV0ZWQgPSByZXF1aXJlKCcuL2NvbXB1dGVkJyk7XG52YXIgY3NzRXhwYW5kID0gWyBcIlRvcFwiLCBcIlJpZ2h0XCIsIFwiQm90dG9tXCIsIFwiTGVmdFwiIF07XG5cbi8qKlxuICogSGVpZ2h0ICYgV2lkdGhcbiAqL1xuXG5bJ3dpZHRoJywgJ2hlaWdodCddLmZvckVhY2goZnVuY3Rpb24obmFtZSkge1xuICBleHBvcnRzW25hbWVdID0ge307XG5cbiAgZXhwb3J0c1tuYW1lXS5nZXQgPSBmdW5jdGlvbihlbCwgY29tcHV0ZSwgZXh0cmEpIHtcbiAgICBpZiAoIWNvbXB1dGUpIHJldHVybjtcbiAgICAvLyBjZXJ0YWluIGVsZW1lbnRzIGNhbiBoYXZlIGRpbWVuc2lvbiBpbmZvIGlmIHdlIGludmlzaWJseSBzaG93IHRoZW1cbiAgICAvLyBob3dldmVyLCBpdCBtdXN0IGhhdmUgYSBjdXJyZW50IGRpc3BsYXkgc3R5bGUgdGhhdCB3b3VsZCBiZW5lZml0IGZyb20gdGhpc1xuICAgIHJldHVybiAwID09IGVsLm9mZnNldFdpZHRoICYmIHJkaXNwbGF5c3dhcC50ZXN0KGNzcyhlbCwgJ2Rpc3BsYXknKSlcbiAgICAgID8gc3dhcChlbCwgY3NzU2hvdywgZnVuY3Rpb24oKSB7IHJldHVybiBnZXRXaWR0aE9ySGVpZ2h0KGVsLCBuYW1lLCBleHRyYSk7IH0pXG4gICAgICA6IGdldFdpZHRoT3JIZWlnaHQoZWwsIG5hbWUsIGV4dHJhKTtcbiAgfVxuXG4gIGV4cG9ydHNbbmFtZV0uc2V0ID0gZnVuY3Rpb24oZWwsIHZhbCwgZXh0cmEpIHtcbiAgICB2YXIgc3R5bGVzID0gZXh0cmEgJiYgc3R5bGVzKGVsKTtcbiAgICByZXR1cm4gc2V0UG9zaXRpdmVOdW1iZXIoZWwsIHZhbCwgZXh0cmFcbiAgICAgID8gYXVnbWVudFdpZHRoT3JIZWlnaHQoZWwsIG5hbWUsIGV4dHJhLCAnYm9yZGVyLWJveCcgPT0gY3NzKGVsLCAnYm94U2l6aW5nJywgZmFsc2UsIHN0eWxlcyksIHN0eWxlcylcbiAgICAgIDogMFxuICAgICk7XG4gIH07XG5cbn0pO1xuXG4vKipcbiAqIE9wYWNpdHlcbiAqL1xuXG5leHBvcnRzLm9wYWNpdHkgPSB7fTtcbmV4cG9ydHMub3BhY2l0eS5nZXQgPSBmdW5jdGlvbihlbCwgY29tcHV0ZSkge1xuICBpZiAoIWNvbXB1dGUpIHJldHVybjtcbiAgdmFyIHJldCA9IGNvbXB1dGVkKGVsLCAnb3BhY2l0eScpO1xuICByZXR1cm4gJycgPT0gcmV0ID8gJzEnIDogcmV0O1xufVxuXG4vKipcbiAqIFV0aWxpdHk6IFNldCBQb3NpdGl2ZSBOdW1iZXJcbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gKiBAcGFyYW0ge01peGVkfSB2YWxcbiAqIEBwYXJhbSB7TnVtYmVyfSBzdWJ0cmFjdFxuICogQHJldHVybiB7TnVtYmVyfVxuICovXG5cbmZ1bmN0aW9uIHNldFBvc2l0aXZlTnVtYmVyKGVsLCB2YWwsIHN1YnRyYWN0KSB7XG4gIHZhciBtYXRjaGVzID0gcm51bXNwbGl0LmV4ZWModmFsKTtcbiAgcmV0dXJuIG1hdGNoZXMgP1xuICAgIC8vIEd1YXJkIGFnYWluc3QgdW5kZWZpbmVkICdzdWJ0cmFjdCcsIGUuZy4sIHdoZW4gdXNlZCBhcyBpbiBjc3NIb29rc1xuICAgIE1hdGgubWF4KDAsIG1hdGNoZXNbMV0pICsgKG1hdGNoZXNbMl0gfHwgJ3B4JykgOlxuICAgIHZhbDtcbn1cblxuLyoqXG4gKiBVdGlsaXR5OiBHZXQgdGhlIHdpZHRoIG9yIGhlaWdodFxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7U3RyaW5nfSBwcm9wXG4gKiBAcGFyYW0ge01peGVkfSBleHRyYVxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5cbmZ1bmN0aW9uIGdldFdpZHRoT3JIZWlnaHQoZWwsIHByb3AsIGV4dHJhKSB7XG4gIC8vIFN0YXJ0IHdpdGggb2Zmc2V0IHByb3BlcnR5LCB3aGljaCBpcyBlcXVpdmFsZW50IHRvIHRoZSBib3JkZXItYm94IHZhbHVlXG4gIHZhciB2YWx1ZUlzQm9yZGVyQm94ID0gdHJ1ZTtcbiAgdmFyIHZhbCA9IHByb3AgPT09ICd3aWR0aCcgPyBlbC5vZmZzZXRXaWR0aCA6IGVsLm9mZnNldEhlaWdodDtcbiAgdmFyIHN0eWxlcyA9IGNvbXB1dGVkKGVsKTtcbiAgdmFyIGlzQm9yZGVyQm94ID0gc3VwcG9ydC5ib3hTaXppbmcgJiYgY3NzKGVsLCAnYm94U2l6aW5nJykgPT09ICdib3JkZXItYm94JztcblxuICAvLyBzb21lIG5vbi1odG1sIGVsZW1lbnRzIHJldHVybiB1bmRlZmluZWQgZm9yIG9mZnNldFdpZHRoLCBzbyBjaGVjayBmb3IgbnVsbC91bmRlZmluZWRcbiAgLy8gc3ZnIC0gaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9NjQ5Mjg1XG4gIC8vIE1hdGhNTCAtIGh0dHBzOi8vYnVnemlsbGEubW96aWxsYS5vcmcvc2hvd19idWcuY2dpP2lkPTQ5MTY2OFxuICBpZiAodmFsIDw9IDAgfHwgdmFsID09IG51bGwpIHtcbiAgICAvLyBGYWxsIGJhY2sgdG8gY29tcHV0ZWQgdGhlbiB1bmNvbXB1dGVkIGNzcyBpZiBuZWNlc3NhcnlcbiAgICB2YWwgPSBjb21wdXRlZChlbCwgcHJvcCwgc3R5bGVzKTtcblxuICAgIGlmICh2YWwgPCAwIHx8IHZhbCA9PSBudWxsKSB7XG4gICAgICB2YWwgPSBlbC5zdHlsZVtwcm9wXTtcbiAgICB9XG5cbiAgICAvLyBDb21wdXRlZCB1bml0IGlzIG5vdCBwaXhlbHMuIFN0b3AgaGVyZSBhbmQgcmV0dXJuLlxuICAgIGlmIChybnVtbm9ucHgudGVzdCh2YWwpKSB7XG4gICAgICByZXR1cm4gdmFsO1xuICAgIH1cblxuICAgIC8vIHdlIG5lZWQgdGhlIGNoZWNrIGZvciBzdHlsZSBpbiBjYXNlIGEgYnJvd3NlciB3aGljaCByZXR1cm5zIHVucmVsaWFibGUgdmFsdWVzXG4gICAgLy8gZm9yIGdldENvbXB1dGVkU3R5bGUgc2lsZW50bHkgZmFsbHMgYmFjayB0byB0aGUgcmVsaWFibGUgZWwuc3R5bGVcbiAgICB2YWx1ZUlzQm9yZGVyQm94ID0gaXNCb3JkZXJCb3ggJiYgKHN1cHBvcnQuYm94U2l6aW5nUmVsaWFibGUoKSB8fCB2YWwgPT09IGVsLnN0eWxlW3Byb3BdKTtcblxuICAgIC8vIE5vcm1hbGl6ZSAnLCBhdXRvLCBhbmQgcHJlcGFyZSBmb3IgZXh0cmFcbiAgICB2YWwgPSBwYXJzZUZsb2F0KHZhbCkgfHwgMDtcbiAgfVxuXG4gIC8vIHVzZSB0aGUgYWN0aXZlIGJveC1zaXppbmcgbW9kZWwgdG8gYWRkL3N1YnRyYWN0IGlycmVsZXZhbnQgc3R5bGVzXG4gIGV4dHJhID0gZXh0cmEgfHwgKGlzQm9yZGVyQm94ID8gJ2JvcmRlcicgOiAnY29udGVudCcpO1xuICB2YWwgKz0gYXVnbWVudFdpZHRoT3JIZWlnaHQoZWwsIHByb3AsIGV4dHJhLCB2YWx1ZUlzQm9yZGVyQm94LCBzdHlsZXMpO1xuICByZXR1cm4gdmFsICsgJ3B4Jztcbn1cblxuLyoqXG4gKiBVdGlsaXR5OiBBdWdtZW50IHRoZSB3aWR0aCBvciB0aGUgaGVpZ2h0XG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbFxuICogQHBhcmFtIHtTdHJpbmd9IHByb3BcbiAqIEBwYXJhbSB7TWl4ZWR9IGV4dHJhXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGlzQm9yZGVyQm94XG4gKiBAcGFyYW0ge0FycmF5fSBzdHlsZXNcbiAqL1xuXG5mdW5jdGlvbiBhdWdtZW50V2lkdGhPckhlaWdodChlbCwgcHJvcCwgZXh0cmEsIGlzQm9yZGVyQm94LCBzdHlsZXMpIHtcbiAgLy8gSWYgd2UgYWxyZWFkeSBoYXZlIHRoZSByaWdodCBtZWFzdXJlbWVudCwgYXZvaWQgYXVnbWVudGF0aW9uLFxuICAvLyBPdGhlcndpc2UgaW5pdGlhbGl6ZSBmb3IgaG9yaXpvbnRhbCBvciB2ZXJ0aWNhbCBwcm9wZXJ0aWVzXG4gIHZhciBpID0gZXh0cmEgPT09IChpc0JvcmRlckJveCA/ICdib3JkZXInIDogJ2NvbnRlbnQnKSA/IDQgOiAnd2lkdGgnID09IHByb3AgPyAxIDogMDtcbiAgdmFyIHZhbCA9IDA7XG5cbiAgZm9yICg7IGkgPCA0OyBpICs9IDIpIHtcbiAgICAvLyBib3RoIGJveCBtb2RlbHMgZXhjbHVkZSBtYXJnaW4sIHNvIGFkZCBpdCBpZiB3ZSB3YW50IGl0XG4gICAgaWYgKGV4dHJhID09PSAnbWFyZ2luJykge1xuICAgICAgdmFsICs9IGNzcyhlbCwgZXh0cmEgKyBjc3NFeHBhbmRbaV0sIHRydWUsIHN0eWxlcyk7XG4gICAgfVxuXG4gICAgaWYgKGlzQm9yZGVyQm94KSB7XG4gICAgICAvLyBib3JkZXItYm94IGluY2x1ZGVzIHBhZGRpbmcsIHNvIHJlbW92ZSBpdCBpZiB3ZSB3YW50IGNvbnRlbnRcbiAgICAgIGlmIChleHRyYSA9PT0gJ2NvbnRlbnQnKSB7XG4gICAgICAgIHZhbCAtPSBjc3MoZWwsICdwYWRkaW5nJyArIGNzc0V4cGFuZFtpXSwgdHJ1ZSwgc3R5bGVzKTtcbiAgICAgIH1cblxuICAgICAgLy8gYXQgdGhpcyBwb2ludCwgZXh0cmEgaXNuJ3QgYm9yZGVyIG5vciBtYXJnaW4sIHNvIHJlbW92ZSBib3JkZXJcbiAgICAgIGlmIChleHRyYSAhPT0gJ21hcmdpbicpIHtcbiAgICAgICAgdmFsIC09IGNzcyhlbCwgJ2JvcmRlcicgKyBjc3NFeHBhbmRbaV0gKyAnV2lkdGgnLCB0cnVlLCBzdHlsZXMpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBhdCB0aGlzIHBvaW50LCBleHRyYSBpc24ndCBjb250ZW50LCBzbyBhZGQgcGFkZGluZ1xuICAgICAgdmFsICs9IGNzcyhlbCwgJ3BhZGRpbmcnICsgY3NzRXhwYW5kW2ldLCB0cnVlLCBzdHlsZXMpO1xuXG4gICAgICAvLyBhdCB0aGlzIHBvaW50LCBleHRyYSBpc24ndCBjb250ZW50IG5vciBwYWRkaW5nLCBzbyBhZGQgYm9yZGVyXG4gICAgICBpZiAoZXh0cmEgIT09ICdwYWRkaW5nJykge1xuICAgICAgICB2YWwgKz0gY3NzKGVsLCAnYm9yZGVyJyArIGNzc0V4cGFuZFtpXSArICdXaWR0aCcsIHRydWUsIHN0eWxlcyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHZhbDtcbn1cbiIsIi8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llc1xuICovXG5cbnZhciBkZWJ1ZyA9IHJlcXVpcmUoJ2RlYnVnJykoJ2Nzczpwcm9wJyk7XG52YXIgY2FtZWxjYXNlID0gcmVxdWlyZSgndG8tY2FtZWwtY2FzZScpO1xudmFyIHZlbmRvciA9IHJlcXVpcmUoJy4vdmVuZG9yJyk7XG5cbi8qKlxuICogRXhwb3J0IGBwcm9wYFxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gcHJvcDtcblxuLyoqXG4gKiBOb3JtYWxpemUgUHJvcGVydGllc1xuICovXG5cbnZhciBjc3NQcm9wcyA9IHtcbiAgJ2Zsb2F0JzogJ2Nzc0Zsb2F0J1xufTtcblxuLyoqXG4gKiBHZXQgdGhlIHZlbmRvciBwcmVmaXhlZCBwcm9wZXJ0eVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBwcm9wXG4gKiBAcGFyYW0ge1N0cmluZ30gc3R5bGVcbiAqIEByZXR1cm4ge1N0cmluZ30gcHJvcFxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gcHJvcChwcm9wLCBzdHlsZSkge1xuICBwcm9wID0gY3NzUHJvcHNbcHJvcF0gfHwgKGNzc1Byb3BzW3Byb3BdID0gdmVuZG9yKHByb3AsIHN0eWxlKSk7XG4gIGRlYnVnKCd0cmFuc2Zvcm0gcHJvcGVydHk6ICVzID0+ICVzJyk7XG4gIHJldHVybiBwcm9wO1xufVxuIiwiLyoqXG4gKiBNb2R1bGUgRGVwZW5kZW5jaWVzXG4gKi9cblxudmFyIGRlYnVnID0gcmVxdWlyZSgnZGVidWcnKSgnY3NzOnN0eWxlJyk7XG52YXIgY2FtZWxjYXNlID0gcmVxdWlyZSgndG8tY2FtZWwtY2FzZScpO1xudmFyIHN1cHBvcnQgPSByZXF1aXJlKCcuL3N1cHBvcnQnKTtcbnZhciBwcm9wZXJ0eSA9IHJlcXVpcmUoJy4vcHJvcCcpO1xudmFyIGhvb2tzID0gcmVxdWlyZSgnLi9ob29rcycpO1xuXG4vKipcbiAqIEV4cG9zZSBgc3R5bGVgXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBzdHlsZTtcblxuLyoqXG4gKiBQb3NzaWJseS11bml0bGVzcyBwcm9wZXJ0aWVzXG4gKlxuICogRG9uJ3QgYXV0b21hdGljYWxseSBhZGQgJ3B4JyB0byB0aGVzZSBwcm9wZXJ0aWVzXG4gKi9cblxudmFyIGNzc051bWJlciA9IHtcbiAgXCJjb2x1bW5Db3VudFwiOiB0cnVlLFxuICBcImZpbGxPcGFjaXR5XCI6IHRydWUsXG4gIFwiZm9udFdlaWdodFwiOiB0cnVlLFxuICBcImxpbmVIZWlnaHRcIjogdHJ1ZSxcbiAgXCJvcGFjaXR5XCI6IHRydWUsXG4gIFwib3JkZXJcIjogdHJ1ZSxcbiAgXCJvcnBoYW5zXCI6IHRydWUsXG4gIFwid2lkb3dzXCI6IHRydWUsXG4gIFwiekluZGV4XCI6IHRydWUsXG4gIFwiem9vbVwiOiB0cnVlXG59O1xuXG4vKipcbiAqIFNldCBhIGNzcyB2YWx1ZVxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7U3RyaW5nfSBwcm9wXG4gKiBAcGFyYW0ge01peGVkfSB2YWxcbiAqIEBwYXJhbSB7TWl4ZWR9IGV4dHJhXG4gKi9cblxuZnVuY3Rpb24gc3R5bGUoZWwsIHByb3AsIHZhbCwgZXh0cmEpIHtcbiAgLy8gRG9uJ3Qgc2V0IHN0eWxlcyBvbiB0ZXh0IGFuZCBjb21tZW50IG5vZGVzXG4gIGlmICghZWwgfHwgZWwubm9kZVR5cGUgPT09IDMgfHwgZWwubm9kZVR5cGUgPT09IDggfHwgIWVsLnN0eWxlICkgcmV0dXJuO1xuXG4gIHZhciBvcmlnID0gY2FtZWxjYXNlKHByb3ApO1xuICB2YXIgc3R5bGUgPSBlbC5zdHlsZTtcbiAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsO1xuXG4gIGlmICghdmFsKSByZXR1cm4gZ2V0KGVsLCBwcm9wLCBvcmlnLCBleHRyYSk7XG5cbiAgcHJvcCA9IHByb3BlcnR5KHByb3AsIHN0eWxlKTtcblxuICB2YXIgaG9vayA9IGhvb2tzW3Byb3BdIHx8IGhvb2tzW29yaWddO1xuXG4gIC8vIElmIGEgbnVtYmVyIHdhcyBwYXNzZWQgaW4sIGFkZCAncHgnIHRvIHRoZSAoZXhjZXB0IGZvciBjZXJ0YWluIENTUyBwcm9wZXJ0aWVzKVxuICBpZiAoJ251bWJlcicgPT0gdHlwZSAmJiAhY3NzTnVtYmVyW29yaWddKSB7XG4gICAgZGVidWcoJ2FkZGluZyBcInB4XCIgdG8gZW5kIG9mIG51bWJlcicpO1xuICAgIHZhbCArPSAncHgnO1xuICB9XG5cbiAgLy8gRml4ZXMgalF1ZXJ5ICM4OTA4LCBpdCBjYW4gYmUgZG9uZSBtb3JlIGNvcnJlY3RseSBieSBzcGVjaWZ5aW5nIHNldHRlcnMgaW4gY3NzSG9va3MsXG4gIC8vIGJ1dCBpdCB3b3VsZCBtZWFuIHRvIGRlZmluZSBlaWdodCAoZm9yIGV2ZXJ5IHByb2JsZW1hdGljIHByb3BlcnR5KSBpZGVudGljYWwgZnVuY3Rpb25zXG4gIGlmICghc3VwcG9ydC5jbGVhckNsb25lU3R5bGUgJiYgJycgPT09IHZhbCAmJiAwID09PSBwcm9wLmluZGV4T2YoJ2JhY2tncm91bmQnKSkge1xuICAgIGRlYnVnKCdzZXQgcHJvcGVydHkgKCVzKSB2YWx1ZSB0byBcImluaGVyaXRcIicsIHByb3ApO1xuICAgIHN0eWxlW3Byb3BdID0gJ2luaGVyaXQnO1xuICB9XG5cbiAgLy8gSWYgYSBob29rIHdhcyBwcm92aWRlZCwgdXNlIHRoYXQgdmFsdWUsIG90aGVyd2lzZSBqdXN0IHNldCB0aGUgc3BlY2lmaWVkIHZhbHVlXG4gIGlmICghaG9vayB8fCAhaG9vay5zZXQgfHwgdW5kZWZpbmVkICE9PSAodmFsID0gaG9vay5zZXQoZWwsIHZhbCwgZXh0cmEpKSkge1xuICAgIC8vIFN1cHBvcnQ6IENocm9tZSwgU2FmYXJpXG4gICAgLy8gU2V0dGluZyBzdHlsZSB0byBibGFuayBzdHJpbmcgcmVxdWlyZWQgdG8gZGVsZXRlIFwic3R5bGU6IHggIWltcG9ydGFudDtcIlxuICAgIGRlYnVnKCdzZXQgaG9vayBkZWZpbmVkLiBzZXR0aW5nIHByb3BlcnR5ICglcykgdG8gJXMnLCBwcm9wLCB2YWwpO1xuICAgIHN0eWxlW3Byb3BdID0gJyc7XG4gICAgc3R5bGVbcHJvcF0gPSB2YWw7XG4gIH1cblxufVxuXG4vKipcbiAqIEdldCB0aGUgc3R5bGVcbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gKiBAcGFyYW0ge1N0cmluZ30gcHJvcFxuICogQHBhcmFtIHtTdHJpbmd9IG9yaWdcbiAqIEBwYXJhbSB7TWl4ZWR9IGV4dHJhXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cblxuZnVuY3Rpb24gZ2V0KGVsLCBwcm9wLCBvcmlnLCBleHRyYSkge1xuICB2YXIgc3R5bGUgPSBlbC5zdHlsZTtcbiAgdmFyIGhvb2sgPSBob29rc1twcm9wXSB8fCBob29rc1tvcmlnXTtcbiAgdmFyIHJldDtcblxuICBpZiAoaG9vayAmJiBob29rLmdldCAmJiB1bmRlZmluZWQgIT09IChyZXQgPSBob29rLmdldChlbCwgZmFsc2UsIGV4dHJhKSkpIHtcbiAgICBkZWJ1ZygnZ2V0IGhvb2sgZGVmaW5lZCwgcmV0dXJuaW5nOiAlcycsIHJldCk7XG4gICAgcmV0dXJuIHJldDtcbiAgfVxuXG4gIHJldCA9IHN0eWxlW3Byb3BdO1xuICBkZWJ1ZygnZ2V0dGluZyAlcycsIHJldCk7XG4gIHJldHVybiByZXQ7XG59XG4iLCIvKipcbiAqIEV4cG9zZSBgc3R5bGVzYFxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gc3R5bGVzO1xuXG4vKipcbiAqIEdldCBhbGwgdGhlIHN0eWxlc1xuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEByZXR1cm4ge0FycmF5fVxuICovXG5cbmZ1bmN0aW9uIHN0eWxlcyhlbCkge1xuICByZXR1cm4gZWwub3duZXJEb2N1bWVudC5kZWZhdWx0Vmlldy5nZXRDb21wdXRlZFN0eWxlKGVsLCBudWxsKTtcbn1cbiIsIi8qKlxuICogU3VwcG9ydCB2YWx1ZXNcbiAqL1xuXG52YXIgcmVsaWFibGVNYXJnaW5SaWdodDtcbnZhciBib3hTaXppbmdSZWxpYWJsZVZhbDtcbnZhciBwaXhlbFBvc2l0aW9uVmFsO1xudmFyIGNsZWFyQ2xvbmVTdHlsZTtcblxuLyoqXG4gKiBDb250YWluZXIgc2V0dXBcbiAqL1xuXG52YXIgZG9jRWxlbSA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcbnZhciBjb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbnZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblxuLyoqXG4gKiBDbGVhciBjbG9uZSBzdHlsZVxuICovXG5cbmRpdi5zdHlsZS5iYWNrZ3JvdW5kQ2xpcCA9ICdjb250ZW50LWJveCc7XG5kaXYuY2xvbmVOb2RlKHRydWUpLnN0eWxlLmJhY2tncm91bmRDbGlwID0gJyc7XG5leHBvcnRzLmNsZWFyQ2xvbmVTdHlsZSA9IGRpdi5zdHlsZS5iYWNrZ3JvdW5kQ2xpcCA9PT0gJ2NvbnRlbnQtYm94JztcblxuY29udGFpbmVyLnN0eWxlLmNzc1RleHQgPSAnYm9yZGVyOjA7d2lkdGg6MDtoZWlnaHQ6MDtwb3NpdGlvbjphYnNvbHV0ZTt0b3A6MDtsZWZ0Oi05OTk5cHg7bWFyZ2luLXRvcDoxcHgnO1xuY29udGFpbmVyLmFwcGVuZENoaWxkKGRpdik7XG5cbi8qKlxuICogUGl4ZWwgcG9zaXRpb25cbiAqXG4gKiBXZWJraXQgYnVnOiBodHRwczovL2J1Z3Mud2Via2l0Lm9yZy9zaG93X2J1Zy5jZ2k/aWQ9MjkwODRcbiAqIGdldENvbXB1dGVkU3R5bGUgcmV0dXJucyBwZXJjZW50IHdoZW4gc3BlY2lmaWVkIGZvciB0b3AvbGVmdC9ib3R0b20vcmlnaHRcbiAqIHJhdGhlciB0aGFuIG1ha2UgdGhlIGNzcyBtb2R1bGUgZGVwZW5kIG9uIHRoZSBvZmZzZXQgbW9kdWxlLCB3ZSBqdXN0IGNoZWNrIGZvciBpdCBoZXJlXG4gKi9cblxuZXhwb3J0cy5waXhlbFBvc2l0aW9uID0gZnVuY3Rpb24oKSB7XG4gIGlmICh1bmRlZmluZWQgPT0gcGl4ZWxQb3NpdGlvblZhbCkgY29tcHV0ZVBpeGVsUG9zaXRpb25BbmRCb3hTaXppbmdSZWxpYWJsZSgpO1xuICByZXR1cm4gcGl4ZWxQb3NpdGlvblZhbDtcbn1cblxuLyoqXG4gKiBSZWxpYWJsZSBib3ggc2l6aW5nXG4gKi9cblxuZXhwb3J0cy5ib3hTaXppbmdSZWxpYWJsZSA9IGZ1bmN0aW9uKCkge1xuICBpZiAodW5kZWZpbmVkID09IGJveFNpemluZ1JlbGlhYmxlVmFsKSBjb21wdXRlUGl4ZWxQb3NpdGlvbkFuZEJveFNpemluZ1JlbGlhYmxlKCk7XG4gIHJldHVybiBib3hTaXppbmdSZWxpYWJsZVZhbDtcbn1cblxuLyoqXG4gKiBSZWxpYWJsZSBtYXJnaW4gcmlnaHRcbiAqXG4gKiBTdXBwb3J0OiBBbmRyb2lkIDIuM1xuICogQ2hlY2sgaWYgZGl2IHdpdGggZXhwbGljaXQgd2lkdGggYW5kIG5vIG1hcmdpbi1yaWdodCBpbmNvcnJlY3RseVxuICogZ2V0cyBjb21wdXRlZCBtYXJnaW4tcmlnaHQgYmFzZWQgb24gd2lkdGggb2YgY29udGFpbmVyLiAoIzMzMzMpXG4gKiBXZWJLaXQgQnVnIDEzMzQzIC0gZ2V0Q29tcHV0ZWRTdHlsZSByZXR1cm5zIHdyb25nIHZhbHVlIGZvciBtYXJnaW4tcmlnaHRcbiAqIFRoaXMgc3VwcG9ydCBmdW5jdGlvbiBpcyBvbmx5IGV4ZWN1dGVkIG9uY2Ugc28gbm8gbWVtb2l6aW5nIGlzIG5lZWRlZC5cbiAqXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5cbmV4cG9ydHMucmVsaWFibGVNYXJnaW5SaWdodCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgcmV0O1xuICB2YXIgbWFyZ2luRGl2ID0gZGl2LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiApKTtcblxuICBtYXJnaW5EaXYuc3R5bGUuY3NzVGV4dCA9IGRpdi5zdHlsZS5jc3NUZXh0ID0gZGl2UmVzZXQ7XG4gIG1hcmdpbkRpdi5zdHlsZS5tYXJnaW5SaWdodCA9IG1hcmdpbkRpdi5zdHlsZS53aWR0aCA9IFwiMFwiO1xuICBkaXYuc3R5bGUud2lkdGggPSBcIjFweFwiO1xuICBkb2NFbGVtLmFwcGVuZENoaWxkKGNvbnRhaW5lcik7XG5cbiAgcmV0ID0gIXBhcnNlRmxvYXQod2luZG93LmdldENvbXB1dGVkU3R5bGUobWFyZ2luRGl2LCBudWxsKS5tYXJnaW5SaWdodCk7XG5cbiAgZG9jRWxlbS5yZW1vdmVDaGlsZChjb250YWluZXIpO1xuXG4gIC8vIENsZWFuIHVwIHRoZSBkaXYgZm9yIG90aGVyIHN1cHBvcnQgdGVzdHMuXG4gIGRpdi5pbm5lckhUTUwgPSBcIlwiO1xuXG4gIHJldHVybiByZXQ7XG59XG5cbi8qKlxuICogRXhlY3V0aW5nIGJvdGggcGl4ZWxQb3NpdGlvbiAmIGJveFNpemluZ1JlbGlhYmxlIHRlc3RzIHJlcXVpcmUgb25seSBvbmUgbGF5b3V0XG4gKiBzbyB0aGV5J3JlIGV4ZWN1dGVkIGF0IHRoZSBzYW1lIHRpbWUgdG8gc2F2ZSB0aGUgc2Vjb25kIGNvbXB1dGF0aW9uLlxuICovXG5cbmZ1bmN0aW9uIGNvbXB1dGVQaXhlbFBvc2l0aW9uQW5kQm94U2l6aW5nUmVsaWFibGUoKSB7XG4gIC8vIFN1cHBvcnQ6IEZpcmVmb3gsIEFuZHJvaWQgMi4zIChQcmVmaXhlZCBib3gtc2l6aW5nIHZlcnNpb25zKS5cbiAgZGl2LnN0eWxlLmNzc1RleHQgPSBcIi13ZWJraXQtYm94LXNpemluZzpib3JkZXItYm94Oy1tb3otYm94LXNpemluZzpib3JkZXItYm94O1wiICtcbiAgICBcImJveC1zaXppbmc6Ym9yZGVyLWJveDtwYWRkaW5nOjFweDtib3JkZXI6MXB4O2Rpc3BsYXk6YmxvY2s7d2lkdGg6NHB4O21hcmdpbi10b3A6MSU7XCIgK1xuICAgIFwicG9zaXRpb246YWJzb2x1dGU7dG9wOjElXCI7XG4gIGRvY0VsZW0uYXBwZW5kQ2hpbGQoY29udGFpbmVyKTtcblxuICB2YXIgZGl2U3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShkaXYsIG51bGwpO1xuICBwaXhlbFBvc2l0aW9uVmFsID0gZGl2U3R5bGUudG9wICE9PSBcIjElXCI7XG4gIGJveFNpemluZ1JlbGlhYmxlVmFsID0gZGl2U3R5bGUud2lkdGggPT09IFwiNHB4XCI7XG5cbiAgZG9jRWxlbS5yZW1vdmVDaGlsZChjb250YWluZXIpO1xufVxuXG5cbiIsIi8qKlxuICogRXhwb3J0IGBzd2FwYFxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gc3dhcDtcblxuLyoqXG4gKiBJbml0aWFsaXplIGBzd2FwYFxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHBhcmFtIHtBcnJheX0gYXJnc1xuICogQHJldHVybiB7TWl4ZWR9XG4gKi9cblxuZnVuY3Rpb24gc3dhcChlbCwgb3B0aW9ucywgZm4sIGFyZ3MpIHtcbiAgLy8gUmVtZW1iZXIgdGhlIG9sZCB2YWx1ZXMsIGFuZCBpbnNlcnQgdGhlIG5ldyBvbmVzXG4gIGZvciAodmFyIGtleSBpbiBvcHRpb25zKSB7XG4gICAgb2xkW2tleV0gPSBlbC5zdHlsZVtrZXldO1xuICAgIGVsLnN0eWxlW2tleV0gPSBvcHRpb25zW2tleV07XG4gIH1cblxuICByZXQgPSBmbi5hcHBseShlbCwgYXJncyB8fCBbXSk7XG5cbiAgLy8gUmV2ZXJ0IHRoZSBvbGQgdmFsdWVzXG4gIGZvciAoa2V5IGluIG9wdGlvbnMpIHtcbiAgICBlbC5zdHlsZVtrZXldID0gb2xkW2tleV07XG4gIH1cblxuICByZXR1cm4gcmV0O1xufVxuIiwiLyoqXG4gKiBNb2R1bGUgRGVwZW5kZW5jaWVzXG4gKi9cblxudmFyIHByZWZpeGVzID0gWydXZWJraXQnLCAnTycsICdNb3onLCAnbXMnXTtcblxuLyoqXG4gKiBFeHBvc2UgYHZlbmRvcmBcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHZlbmRvcjtcblxuLyoqXG4gKiBHZXQgdGhlIHZlbmRvciBwcmVmaXggZm9yIGEgZ2l2ZW4gcHJvcGVydHlcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gcHJvcFxuICogQHBhcmFtIHtPYmplY3R9IHN0eWxlXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cblxuZnVuY3Rpb24gdmVuZG9yKHByb3AsIHN0eWxlKSB7XG4gIC8vIHNob3J0Y3V0IGZvciBuYW1lcyB0aGF0IGFyZSBub3QgdmVuZG9yIHByZWZpeGVkXG4gIGlmIChzdHlsZVtwcm9wXSkgcmV0dXJuIHByb3A7XG5cbiAgLy8gY2hlY2sgZm9yIHZlbmRvciBwcmVmaXhlZCBuYW1lc1xuICB2YXIgY2FwTmFtZSA9IHByb3BbMF0udG9VcHBlckNhc2UoKSArIHByb3Auc2xpY2UoMSk7XG4gIHZhciBvcmlnaW5hbCA9IHByb3A7XG4gIHZhciBpID0gcHJlZml4ZXMubGVuZ3RoO1xuXG4gIHdoaWxlIChpLS0pIHtcbiAgICBwcm9wID0gcHJlZml4ZXNbaV0gKyBjYXBOYW1lO1xuICAgIGlmIChwcm9wIGluIHN0eWxlKSByZXR1cm4gcHJvcDtcbiAgfVxuXG4gIHJldHVybiBvcmlnaW5hbDtcbn1cbiIsIlxuLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICovXG5cbnZhciBtYXRjaGVzID0gcmVxdWlyZSgnbWF0Y2hlcy1zZWxlY3RvcicpXG4gICwgZXZlbnQgPSByZXF1aXJlKCdldmVudCcpO1xuXG4vKipcbiAqIERlbGVnYXRlIGV2ZW50IGB0eXBlYCB0byBgc2VsZWN0b3JgXG4gKiBhbmQgaW52b2tlIGBmbihlKWAuIEEgY2FsbGJhY2sgZnVuY3Rpb25cbiAqIGlzIHJldHVybmVkIHdoaWNoIG1heSBiZSBwYXNzZWQgdG8gYC51bmJpbmQoKWAuXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbFxuICogQHBhcmFtIHtTdHJpbmd9IHNlbGVjdG9yXG4gKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gY2FwdHVyZVxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMuYmluZCA9IGZ1bmN0aW9uKGVsLCBzZWxlY3RvciwgdHlwZSwgZm4sIGNhcHR1cmUpe1xuICByZXR1cm4gZXZlbnQuYmluZChlbCwgdHlwZSwgZnVuY3Rpb24oZSl7XG4gICAgaWYgKG1hdGNoZXMoZS50YXJnZXQsIHNlbGVjdG9yKSkgZm4oZSk7XG4gIH0sIGNhcHR1cmUpO1xuICByZXR1cm4gY2FsbGJhY2s7XG59O1xuXG4vKipcbiAqIFVuYmluZCBldmVudCBgdHlwZWAncyBjYWxsYmFjayBgZm5gLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHBhcmFtIHtCb29sZWFufSBjYXB0dXJlXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMudW5iaW5kID0gZnVuY3Rpb24oZWwsIHR5cGUsIGZuLCBjYXB0dXJlKXtcbiAgZXZlbnQudW5iaW5kKGVsLCB0eXBlLCBmbiwgY2FwdHVyZSk7XG59O1xuIiwiLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICovXG5cbnZhciBpc0FycmF5ID0gcmVxdWlyZSgnaXNBcnJheScpO1xudmFyIGRvbWlmeSA9IHJlcXVpcmUoJ2RvbWlmeScpO1xudmFyIGV2ZW50cyA9IHJlcXVpcmUoJ2V2ZW50Jyk7XG52YXIgcXVlcnkgPSByZXF1aXJlKCdxdWVyeScpO1xudmFyIHRyaW0gPSByZXF1aXJlKCd0cmltJyk7XG52YXIgc2xpY2UgPSBbXS5zbGljZTtcblxuLyoqXG4gKiBBdHRyaWJ1dGVzIHN1cHBvcnRlZC5cbiAqL1xuXG52YXIgYXR0cnMgPSBbXG4gICdpZCcsXG4gICdzcmMnLFxuICAncmVsJyxcbiAgJ2NvbHMnLFxuICAncm93cycsXG4gICd0eXBlJyxcbiAgJ25hbWUnLFxuICAnaHJlZicsXG4gICd0aXRsZScsXG4gICdzdHlsZScsXG4gICd3aWR0aCcsXG4gICdoZWlnaHQnLFxuICAnYWN0aW9uJyxcbiAgJ21ldGhvZCcsXG4gICd0YWJpbmRleCcsXG4gICdwbGFjZWhvbGRlcidcbl07XG5cbi8qXG4gKiBBIHNpbXBsZSB3YXkgdG8gY2hlY2sgZm9yIEhUTUwgc3RyaW5ncyBvciBJRCBzdHJpbmdzXG4gKi9cblxudmFyIHF1aWNrRXhwciA9IC9eKD86W14jPF0qKDxbXFx3XFxXXSs+KVtePl0qJHwjKFtcXHdcXC1dKikkKS87XG5cbi8qKlxuICogRXhwb3NlIGBkb20oKWAuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBkb207XG5cbi8qKlxuICogUmV0dXJuIGEgZG9tIGBMaXN0YCBmb3IgdGhlIGdpdmVuXG4gKiBgaHRtbGAsIHNlbGVjdG9yLCBvciBlbGVtZW50LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfEVsZW1lbnR8TGlzdH0gc2VsZWN0b3JcbiAqIEBwYXJhbSB7U3RyaW5nfEVMZW1lbnR8Y29udGV4dH0gY29udGV4dFxuICogQHJldHVybiB7TGlzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gZG9tKHNlbGVjdG9yLCBjb250ZXh0KSB7XG4gIC8vIGFycmF5XG4gIGlmIChpc0FycmF5KHNlbGVjdG9yKSkge1xuICAgIHJldHVybiBuZXcgTGlzdChzZWxlY3Rvcik7XG4gIH1cblxuICAvLyBMaXN0XG4gIGlmIChzZWxlY3RvciBpbnN0YW5jZW9mIExpc3QpIHtcbiAgICByZXR1cm4gc2VsZWN0b3I7XG4gIH1cblxuICAvLyBub2RlXG4gIGlmIChzZWxlY3Rvci5ub2RlTmFtZSkge1xuICAgIHJldHVybiBuZXcgTGlzdChbc2VsZWN0b3JdKTtcbiAgfVxuXG4gIGlmICgnc3RyaW5nJyAhPSB0eXBlb2Ygc2VsZWN0b3IpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdpbnZhbGlkIHNlbGVjdG9yJyk7XG4gIH1cblxuICAvLyBodG1sXG4gIHZhciBodG1sc2VsZWN0b3IgPSB0cmltLmxlZnQoc2VsZWN0b3IpO1xuICBpZiAoaXNIVE1MKGh0bWxzZWxlY3RvcikpIHtcbiAgICByZXR1cm4gbmV3IExpc3QoW2RvbWlmeShodG1sc2VsZWN0b3IpXSwgaHRtbHNlbGVjdG9yKTtcbiAgfVxuXG4gIC8vIHNlbGVjdG9yXG4gIHZhciBjdHggPSBjb250ZXh0XG4gICAgPyAoY29udGV4dCBpbnN0YW5jZW9mIExpc3QgPyBjb250ZXh0WzBdIDogY29udGV4dClcbiAgICA6IGRvY3VtZW50O1xuXG4gIHJldHVybiBuZXcgTGlzdChxdWVyeS5hbGwoc2VsZWN0b3IsIGN0eCksIHNlbGVjdG9yKTtcbn1cblxuLyoqXG4gKiBTdGF0aWM6IEV4cG9zZSBgTGlzdGBcbiAqL1xuXG5kb20uTGlzdCA9IExpc3Q7XG5cbi8qKlxuICogU3RhdGljOiBFeHBvc2Ugc3VwcG9ydGVkIGF0dHJzLlxuICovXG5cbmRvbS5hdHRycyA9IGF0dHJzO1xuXG4vKipcbiAqIFN0YXRpYzogTWl4aW4gYSBmdW5jdGlvblxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fFN0cmluZ30gbmFtZVxuICogQHBhcmFtIHtPYmplY3R8RnVuY3Rpb259IG9ialxuICogQHJldHVybiB7TGlzdH0gc2VsZlxuICovXG5cbmRvbS51c2UgPSBmdW5jdGlvbihuYW1lLCBmbikge1xuICB2YXIga2V5cyA9IFtdO1xuICB2YXIgdG1wO1xuXG4gIGlmICgyID09IGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICBrZXlzLnB1c2gobmFtZSk7XG4gICAgdG1wID0ge307XG4gICAgdG1wW25hbWVdID0gZm47XG4gICAgZm4gPSB0bXA7XG4gIH0gZWxzZSBpZiAobmFtZS5uYW1lKSB7XG4gICAgLy8gdXNlIGZ1bmN0aW9uIG5hbWVcbiAgICBmbiA9IG5hbWU7XG4gICAgbmFtZSA9IG5hbWUubmFtZTtcbiAgICBrZXlzLnB1c2gobmFtZSk7XG4gICAgdG1wID0ge307XG4gICAgdG1wW25hbWVdID0gZm47XG4gICAgZm4gPSB0bXA7XG4gIH0gZWxzZSB7XG4gICAga2V5cyA9IE9iamVjdC5rZXlzKG5hbWUpO1xuICAgIGZuID0gbmFtZTtcbiAgfVxuXG4gIGZvcih2YXIgaSA9IDAsIGxlbiA9IGtleXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICBMaXN0LnByb3RvdHlwZVtrZXlzW2ldXSA9IGZuW2tleXNbaV1dO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBhIG5ldyBgTGlzdGAgd2l0aCB0aGVcbiAqIGdpdmVuIGFycmF5LWlzaCBvZiBgZWxzYCBhbmQgYHNlbGVjdG9yYFxuICogc3RyaW5nLlxuICpcbiAqIEBwYXJhbSB7TWl4ZWR9IGVsc1xuICogQHBhcmFtIHtTdHJpbmd9IHNlbGVjdG9yXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBMaXN0KGVscywgc2VsZWN0b3IpIHtcbiAgZWxzID0gZWxzIHx8IFtdO1xuICB2YXIgbGVuID0gdGhpcy5sZW5ndGggPSBlbHMubGVuZ3RoO1xuICBmb3IodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHRoaXNbaV0gPSBlbHNbaV07XG4gIHRoaXMuc2VsZWN0b3IgPSBzZWxlY3Rvcjtcbn1cblxuLyoqXG4gKiBSZW1ha2UgdGhlIGxpc3RcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xFTGVtZW50fGNvbnRleHR9IGNvbnRleHRcbiAqIEByZXR1cm4ge0xpc3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5MaXN0LnByb3RvdHlwZS5kb20gPSBkb207XG5cbi8qKlxuICogTWFrZSBgTGlzdGAgYW4gYXJyYXktbGlrZSBvYmplY3RcbiAqL1xuXG5MaXN0LnByb3RvdHlwZS5sZW5ndGggPSAwO1xuTGlzdC5wcm90b3R5cGUuc3BsaWNlID0gQXJyYXkucHJvdG90eXBlLnNwbGljZTtcblxuLyoqXG4gKiBBcnJheS1saWtlIG9iamVjdCB0byBhcnJheVxuICpcbiAqIEByZXR1cm4ge0FycmF5fVxuICovXG5cbkxpc3QucHJvdG90eXBlLnRvQXJyYXkgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHNsaWNlLmNhbGwodGhpcyk7XG59XG5cbi8qKlxuICogQXR0cmlidXRlIGFjY2Vzc29ycy5cbiAqL1xuXG5hdHRycy5mb3JFYWNoKGZ1bmN0aW9uKG5hbWUpe1xuICBMaXN0LnByb3RvdHlwZVtuYW1lXSA9IGZ1bmN0aW9uKHZhbCl7XG4gICAgaWYgKDAgPT0gYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHRoaXMuYXR0cihuYW1lKTtcbiAgICByZXR1cm4gdGhpcy5hdHRyKG5hbWUsIHZhbCk7XG4gIH07XG59KTtcblxuLyoqXG4gKiBNaXhpbiB0aGUgQVBJXG4gKi9cblxuZG9tLnVzZShyZXF1aXJlKCcuL2xpYi9hdHRyaWJ1dGVzJykpO1xuZG9tLnVzZShyZXF1aXJlKCcuL2xpYi9jbGFzc2VzJykpO1xuZG9tLnVzZShyZXF1aXJlKCcuL2xpYi9ldmVudHMnKSk7XG5kb20udXNlKHJlcXVpcmUoJy4vbGliL21hbmlwdWxhdGUnKSk7XG5kb20udXNlKHJlcXVpcmUoJy4vbGliL3RyYXZlcnNlJykpO1xuXG4vKipcbiAqIENoZWNrIGlmIHRoZSBzdHJpbmcgaXMgSFRNTFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBpc0hUTUwoc3RyKSB7XG4gIC8vIEZhc3RlciB0aGFuIHJ1bm5pbmcgcmVnZXgsIGlmIHN0ciBzdGFydHMgd2l0aCBgPGAgYW5kIGVuZHMgd2l0aCBgPmAsIGFzc3VtZSBpdCdzIEhUTUxcbiAgaWYgKHN0ci5jaGFyQXQoMCkgPT09ICc8JyAmJiBzdHIuY2hhckF0KHN0ci5sZW5ndGggLSAxKSA9PT0gJz4nICYmIHN0ci5sZW5ndGggPj0gMykgcmV0dXJuIHRydWU7XG5cbiAgLy8gUnVuIHRoZSByZWdleFxuICB2YXIgbWF0Y2ggPSBxdWlja0V4cHIuZXhlYyhzdHIpO1xuICByZXR1cm4gISEobWF0Y2ggJiYgbWF0Y2hbMV0pO1xufVxuIiwiLyoqXG4gKiBNb2R1bGUgRGVwZW5kZW5jaWVzXG4gKi9cblxudmFyIHZhbHVlID0gcmVxdWlyZSgndmFsdWUnKTtcblxuLyoqXG4gKiBTZXQgYXR0cmlidXRlIGBuYW1lYCB0byBgdmFsYCwgb3IgZ2V0IGF0dHIgYG5hbWVgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gKiBAcGFyYW0ge1N0cmluZ30gW3ZhbF1cbiAqIEByZXR1cm4ge1N0cmluZ3xMaXN0fSBzZWxmXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMuYXR0ciA9IGZ1bmN0aW9uKG5hbWUsIHZhbCl7XG4gIC8vIGdldFxuICBpZiAoMSA9PSBhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIHRoaXNbMF0gJiYgdGhpc1swXS5nZXRBdHRyaWJ1dGUobmFtZSk7XG4gIH1cblxuICAvLyByZW1vdmVcbiAgaWYgKG51bGwgPT0gdmFsKSB7XG4gICAgcmV0dXJuIHRoaXMucmVtb3ZlQXR0cihuYW1lKTtcbiAgfVxuXG4gIC8vIHNldFxuICByZXR1cm4gdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKGVsKXtcbiAgICBlbC5zZXRBdHRyaWJ1dGUobmFtZSwgdmFsKTtcbiAgfSk7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBhdHRyaWJ1dGUgYG5hbWVgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gKiBAcmV0dXJuIHtMaXN0fSBzZWxmXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMucmVtb3ZlQXR0ciA9IGZ1bmN0aW9uKG5hbWUpe1xuICByZXR1cm4gdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKGVsKXtcbiAgICBlbC5yZW1vdmVBdHRyaWJ1dGUobmFtZSk7XG4gIH0pO1xufTtcblxuLyoqXG4gKiBTZXQgcHJvcGVydHkgYG5hbWVgIHRvIGB2YWxgLCBvciBnZXQgcHJvcGVydHkgYG5hbWVgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gKiBAcGFyYW0ge1N0cmluZ30gW3ZhbF1cbiAqIEByZXR1cm4ge09iamVjdHxMaXN0fSBzZWxmXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMucHJvcCA9IGZ1bmN0aW9uKG5hbWUsIHZhbCl7XG4gIGlmICgxID09IGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICByZXR1cm4gdGhpc1swXSAmJiB0aGlzWzBdW25hbWVdO1xuICB9XG5cbiAgcmV0dXJuIHRoaXMuZm9yRWFjaChmdW5jdGlvbihlbCl7XG4gICAgZWxbbmFtZV0gPSB2YWw7XG4gIH0pO1xufTtcblxuLyoqXG4gKiBHZXQgdGhlIGZpcnN0IGVsZW1lbnQncyB2YWx1ZSBvciBzZXQgc2VsZWN0ZWRcbiAqIGVsZW1lbnQgdmFsdWVzIHRvIGB2YWxgLlxuICpcbiAqIEBwYXJhbSB7TWl4ZWR9IFt2YWxdXG4gKiBAcmV0dXJuIHtNaXhlZH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy52YWwgPVxuZXhwb3J0cy52YWx1ZSA9IGZ1bmN0aW9uKHZhbCl7XG4gIGlmICgwID09IGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICByZXR1cm4gdGhpc1swXVxuICAgICAgPyB2YWx1ZSh0aGlzWzBdKVxuICAgICAgOiB1bmRlZmluZWQ7XG4gIH1cblxuICByZXR1cm4gdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKGVsKXtcbiAgICB2YWx1ZShlbCwgdmFsKTtcbiAgfSk7XG59O1xuIiwiLyoqXG4gKiBNb2R1bGUgRGVwZW5kZW5jaWVzXG4gKi9cblxudmFyIGNsYXNzZXMgPSByZXF1aXJlKCdjbGFzc2VzJyk7XG5cbi8qKlxuICogQWRkIHRoZSBnaXZlbiBjbGFzcyBgbmFtZWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAqIEByZXR1cm4ge0xpc3R9IHNlbGZcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy5hZGRDbGFzcyA9IGZ1bmN0aW9uKG5hbWUpe1xuICByZXR1cm4gdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKGVsKSB7XG4gICAgZWwuX2NsYXNzZXMgPSBlbC5fY2xhc3NlcyB8fCBjbGFzc2VzKGVsKTtcbiAgICBlbC5fY2xhc3Nlcy5hZGQobmFtZSk7XG4gIH0pO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgdGhlIGdpdmVuIGNsYXNzIGBuYW1lYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xSZWdFeHB9IG5hbWVcbiAqIEByZXR1cm4ge0xpc3R9IHNlbGZcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy5yZW1vdmVDbGFzcyA9IGZ1bmN0aW9uKG5hbWUpe1xuICByZXR1cm4gdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKGVsKSB7XG4gICAgZWwuX2NsYXNzZXMgPSBlbC5fY2xhc3NlcyB8fCBjbGFzc2VzKGVsKTtcbiAgICBlbC5fY2xhc3Nlcy5yZW1vdmUobmFtZSk7XG4gIH0pO1xufTtcblxuLyoqXG4gKiBUb2dnbGUgdGhlIGdpdmVuIGNsYXNzIGBuYW1lYCxcbiAqIG9wdGlvbmFsbHkgYSBgYm9vbGAgbWF5IGJlIGdpdmVuXG4gKiB0byBpbmRpY2F0ZSB0aGF0IHRoZSBjbGFzcyBzaG91bGRcbiAqIGJlIGFkZGVkIHdoZW4gdHJ1dGh5LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGJvb2xcbiAqIEByZXR1cm4ge0xpc3R9IHNlbGZcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy50b2dnbGVDbGFzcyA9IGZ1bmN0aW9uKG5hbWUsIGJvb2wpe1xuICB2YXIgZm4gPSAndG9nZ2xlJztcblxuICAvLyB0b2dnbGUgd2l0aCBib29sZWFuXG4gIGlmICgyID09IGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICBmbiA9IGJvb2wgPyAnYWRkJyA6ICdyZW1vdmUnO1xuICB9XG5cbiAgcmV0dXJuIHRoaXMuZm9yRWFjaChmdW5jdGlvbihlbCkge1xuICAgIGVsLl9jbGFzc2VzID0gZWwuX2NsYXNzZXMgfHwgY2xhc3NlcyhlbCk7XG4gICAgZWwuX2NsYXNzZXNbZm5dKG5hbWUpO1xuICB9KVxufTtcblxuLyoqXG4gKiBDaGVjayBpZiB0aGUgZ2l2ZW4gY2xhc3MgYG5hbWVgIGlzIHByZXNlbnQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMuaGFzQ2xhc3MgPSBmdW5jdGlvbihuYW1lKXtcbiAgdmFyIGVsO1xuXG4gIGZvcih2YXIgaSA9IDAsIGxlbiA9IHRoaXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICBlbCA9IHRoaXNbaV07XG4gICAgZWwuX2NsYXNzZXMgPSBlbC5fY2xhc3NlcyB8fCBjbGFzc2VzKGVsKTtcbiAgICBpZiAoZWwuX2NsYXNzZXMuaGFzKG5hbWUpKSByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiBmYWxzZTtcbn07XG4iLCIvKipcbiAqIE1vZHVsZSBEZXBlbmRlbmNpZXNcbiAqL1xuXG52YXIgZXZlbnRzID0gcmVxdWlyZSgnZXZlbnQnKTtcbnZhciBkZWxlZ2F0ZSA9IHJlcXVpcmUoJ2RlbGVnYXRlJyk7XG5cbi8qKlxuICogQmluZCB0byBgZXZlbnRgIGFuZCBpbnZva2UgYGZuKGUpYC4gV2hlblxuICogYSBgc2VsZWN0b3JgIGlzIGdpdmVuIHRoZW4gZXZlbnRzIGFyZSBkZWxlZ2F0ZWQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge1N0cmluZ30gW3NlbGVjdG9yXVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gY2FwdHVyZVxuICogQHJldHVybiB7TGlzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy5vbiA9IGZ1bmN0aW9uKGV2ZW50LCBzZWxlY3RvciwgZm4sIGNhcHR1cmUpe1xuICBpZiAoJ3N0cmluZycgPT0gdHlwZW9mIHNlbGVjdG9yKSB7XG4gICAgcmV0dXJuIHRoaXMuZm9yRWFjaChmdW5jdGlvbiAoZWwpIHtcbiAgICAgIGZuLl9kZWxlZ2F0ZSA9IGRlbGVnYXRlLmJpbmQoZWwsIHNlbGVjdG9yLCBldmVudCwgZm4sIGNhcHR1cmUpO1xuICAgIH0pO1xuICB9XG5cbiAgY2FwdHVyZSA9IGZuO1xuICBmbiA9IHNlbGVjdG9yO1xuXG4gIHJldHVybiB0aGlzLmZvckVhY2goZnVuY3Rpb24gKGVsKSB7XG4gICAgZXZlbnRzLmJpbmQoZWwsIGV2ZW50LCBmbiwgY2FwdHVyZSk7XG4gIH0pO1xufTtcblxuLyoqXG4gKiBVbmJpbmQgdG8gYGV2ZW50YCBhbmQgaW52b2tlIGBmbihlKWAuIFdoZW5cbiAqIGEgYHNlbGVjdG9yYCBpcyBnaXZlbiB0aGVuIGRlbGVnYXRlZCBldmVudFxuICogaGFuZGxlcnMgYXJlIHVuYm91bmQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge1N0cmluZ30gW3NlbGVjdG9yXVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gY2FwdHVyZVxuICogQHJldHVybiB7TGlzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy5vZmYgPSBmdW5jdGlvbihldmVudCwgc2VsZWN0b3IsIGZuLCBjYXB0dXJlKXtcbiAgaWYgKCdzdHJpbmcnID09IHR5cGVvZiBzZWxlY3Rvcikge1xuICAgIHJldHVybiB0aGlzLmZvckVhY2goZnVuY3Rpb24gKGVsKSB7XG4gICAgICAvLyBUT0RPOiBhZGQgc2VsZWN0b3Igc3VwcG9ydCBiYWNrXG4gICAgICBkZWxlZ2F0ZS51bmJpbmQoZWwsIGV2ZW50LCBmbi5fZGVsZWdhdGUsIGNhcHR1cmUpO1xuICAgIH0pO1xuICB9XG5cbiAgY2FwdHVyZSA9IGZuO1xuICBmbiA9IHNlbGVjdG9yO1xuXG4gIHJldHVybiB0aGlzLmZvckVhY2goZnVuY3Rpb24gKGVsKSB7XG4gICAgZXZlbnRzLnVuYmluZChlbCwgZXZlbnQsIGZuLCBjYXB0dXJlKTtcbiAgfSk7XG59O1xuIiwiLyoqXG4gKiBNb2R1bGUgRGVwZW5kZW5jaWVzXG4gKi9cblxudmFyIHZhbHVlID0gcmVxdWlyZSgndmFsdWUnKTtcbnZhciBjc3MgPSByZXF1aXJlKCdjc3MnKTtcblxuLyoqXG4gKiBSZXR1cm4gZWxlbWVudCB0ZXh0LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge1N0cmluZ3xMaXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5leHBvcnRzLnRleHQgPSBmdW5jdGlvbihzdHIpIHtcbiAgaWYgKDEgPT0gYXJndW1lbnRzLmxlbmd0aCkge1xuICAgIHJldHVybiB0aGlzLmZvckVhY2goZnVuY3Rpb24oZWwpIHtcbiAgICAgIHZhciBub2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoc3RyKTtcbiAgICAgIGVsLnRleHRDb250ZW50ID0gJyc7XG4gICAgICBlbC5hcHBlbmRDaGlsZChub2RlKTtcbiAgICB9KTtcbiAgfVxuXG4gIHZhciBvdXQgPSAnJztcbiAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKGVsKSB7XG4gICAgb3V0ICs9IGdldFRleHQoZWwpO1xuICB9KTtcblxuICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBHZXQgdGV4dCBoZWxwZXIgZnJvbSBTaXp6bGUuXG4gKlxuICogU291cmNlOiBodHRwczovL2dpdGh1Yi5jb20vanF1ZXJ5L3NpenpsZS9ibG9iL21hc3Rlci9zcmMvc2l6emxlLmpzI0w5MTQtTDk0N1xuICpcbiAqIEBwYXJhbSB7RWxlbWVudHxBcnJheX0gZWxcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuXG5mdW5jdGlvbiBnZXRUZXh0KGVsKSB7XG4gIHZhciByZXQgPSAnJztcbiAgdmFyIHR5cGUgPSBlbC5ub2RlVHlwZTtcbiAgdmFyIG5vZGU7XG5cbiAgc3dpdGNoKHR5cGUpIHtcbiAgICBjYXNlIDE6XG4gICAgY2FzZSA5OlxuICAgIGNhc2UgMTE6XG4gICAgICBpZiAoJ3N0cmluZycgPT0gdHlwZW9mIGVsLnRleHRDb250ZW50KSByZXR1cm4gZWwudGV4dENvbnRlbnQ7XG4gICAgICBmb3IgKGVsID0gZWwuZmlyc3RDaGlsZDsgZWw7IGVsID0gZWwubmV4dFNpYmxpbmcpIHJldCArPSB0ZXh0KGVsKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgMzpcbiAgICBjYXNlIDQ6XG4gICAgICByZXR1cm4gZWwubm9kZVZhbHVlO1xuICAgIGRlZmF1bHQ6XG4gICAgICB3aGlsZSAobm9kZSA9IGVsW2krK10pIHtcbiAgICAgICAgcmV0ICs9IGdldFRleHQobm9kZSk7XG4gICAgICB9XG4gIH1cblxuICByZXR1cm4gcmV0O1xufVxuXG4vKipcbiAqIFJldHVybiBlbGVtZW50IGh0bWwuXG4gKlxuICogQHJldHVybiB7U3RyaW5nfSBodG1sXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMuaHRtbCA9IGZ1bmN0aW9uKGh0bWwpIHtcbiAgaWYgKDEgPT0gYXJndW1lbnRzLmxlbmd0aCkge1xuICAgIHJldHVybiB0aGlzLmZvckVhY2goZnVuY3Rpb24oZWwpIHtcbiAgICAgIGVsLmlubmVySFRNTCA9IGh0bWw7XG4gICAgfSk7XG4gIH1cblxuICAvLyBUT0RPOiByZWFsIGltcGxcbiAgcmV0dXJuIHRoaXNbMF0gJiYgdGhpc1swXS5pbm5lckhUTUw7XG59O1xuXG4vKipcbiAqIEdldCBhbmQgc2V0IHRoZSBjc3MgdmFsdWVcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xPYmplY3R9IHByb3BcbiAqIEBwYXJhbSB7TWl4ZWR9IHZhbFxuICogQHJldHVybiB7TWl4ZWR9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMuY3NzID0gZnVuY3Rpb24ocHJvcCwgdmFsKSB7XG4gIC8vIGdldHRlclxuICBpZiAoIXZhbCAmJiAnb2JqZWN0JyAhPSB0eXBlb2YgcHJvcCkge1xuICAgIHJldHVybiBjc3ModGhpc1swXSwgcHJvcCk7XG4gIH1cbiAgLy8gc2V0dGVyXG4gIHRoaXMuZm9yRWFjaChmdW5jdGlvbihlbCkge1xuICAgIGNzcyhlbCwgcHJvcCwgdmFsKTtcbiAgfSk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFByZXBlbmQgYHZhbGAuXG4gKlxuICogRnJvbSBqUXVlcnk6IGlmIHRoZXJlIGlzIG1vcmUgdGhhbiBvbmUgdGFyZ2V0IGVsZW1lbnRcbiAqIGNsb25lZCBjb3BpZXMgb2YgdGhlIGluc2VydGVkIGVsZW1lbnQgd2lsbCBiZSBjcmVhdGVkXG4gKiBmb3IgZWFjaCB0YXJnZXQgYWZ0ZXIgdGhlIGZpcnN0LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfEVsZW1lbnR8TGlzdH0gdmFsXG4gKiBAcmV0dXJuIHtMaXN0fSBzZWxmXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMucHJlcGVuZCA9IGZ1bmN0aW9uKHZhbCkge1xuICB2YXIgZG9tID0gdGhpcy5kb207XG5cbiAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKHRhcmdldCwgaSkge1xuICAgIGRvbSh2YWwpLmZvckVhY2goZnVuY3Rpb24oc2VsZWN0b3IpIHtcbiAgICAgIHNlbGVjdG9yID0gaSA/IHNlbGVjdG9yLmNsb25lTm9kZSh0cnVlKSA6IHNlbGVjdG9yO1xuICAgICAgaWYgKHRhcmdldC5jaGlsZHJlbi5sZW5ndGgpIHtcbiAgICAgICAgdGFyZ2V0Lmluc2VydEJlZm9yZShzZWxlY3RvciwgdGFyZ2V0LmZpcnN0Q2hpbGQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGFyZ2V0LmFwcGVuZENoaWxkKHNlbGVjdG9yKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEFwcGVuZCBgdmFsYC5cbiAqXG4gKiBGcm9tIGpRdWVyeTogaWYgdGhlcmUgaXMgbW9yZSB0aGFuIG9uZSB0YXJnZXQgZWxlbWVudFxuICogY2xvbmVkIGNvcGllcyBvZiB0aGUgaW5zZXJ0ZWQgZWxlbWVudCB3aWxsIGJlIGNyZWF0ZWRcbiAqIGZvciBlYWNoIHRhcmdldCBhZnRlciB0aGUgZmlyc3QuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd8RWxlbWVudHxMaXN0fSB2YWxcbiAqIEByZXR1cm4ge0xpc3R9IHNlbGZcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy5hcHBlbmQgPSBmdW5jdGlvbih2YWwpIHtcbiAgdmFyIGRvbSA9IHRoaXMuZG9tO1xuXG4gIHRoaXMuZm9yRWFjaChmdW5jdGlvbih0YXJnZXQsIGkpIHtcbiAgICBkb20odmFsKS5mb3JFYWNoKGZ1bmN0aW9uKGVsKSB7XG4gICAgICBlbCA9IGkgPyBlbC5jbG9uZU5vZGUodHJ1ZSkgOiBlbDtcbiAgICAgIHRhcmdldC5hcHBlbmRDaGlsZChlbCk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBJbnNlcnQgc2VsZidzIGBlbHNgIGFmdGVyIGB2YWxgXG4gKlxuICogRnJvbSBqUXVlcnk6IGlmIHRoZXJlIGlzIG1vcmUgdGhhbiBvbmUgdGFyZ2V0IGVsZW1lbnQsXG4gKiBjbG9uZWQgY29waWVzIG9mIHRoZSBpbnNlcnRlZCBlbGVtZW50IHdpbGwgYmUgY3JlYXRlZFxuICogZm9yIGVhY2ggdGFyZ2V0IGFmdGVyIHRoZSBmaXJzdCwgYW5kIHRoYXQgbmV3IHNldFxuICogKHRoZSBvcmlnaW5hbCBlbGVtZW50IHBsdXMgY2xvbmVzKSBpcyByZXR1cm5lZC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xFbGVtZW50fExpc3R9IHZhbFxuICogQHJldHVybiB7TGlzdH0gc2VsZlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5leHBvcnRzLmluc2VydEFmdGVyID0gZnVuY3Rpb24odmFsKSB7XG4gIHZhciBkb20gPSB0aGlzLmRvbTtcblxuICB0aGlzLmZvckVhY2goZnVuY3Rpb24oZWwpIHtcbiAgICBkb20odmFsKS5mb3JFYWNoKGZ1bmN0aW9uKHRhcmdldCwgaSkge1xuICAgICAgaWYgKCF0YXJnZXQucGFyZW50Tm9kZSkgcmV0dXJuO1xuICAgICAgZWwgPSBpID8gZWwuY2xvbmVOb2RlKHRydWUpIDogZWw7XG4gICAgICB0YXJnZXQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoZWwsIHRhcmdldC5uZXh0U2libGluZyk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBBcHBlbmQgc2VsZidzIGBlbGAgdG8gYHZhbGBcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xFbGVtZW50fExpc3R9IHZhbFxuICogQHJldHVybiB7TGlzdH0gc2VsZlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5leHBvcnRzLmFwcGVuZFRvID0gZnVuY3Rpb24odmFsKSB7XG4gIHRoaXMuZG9tKHZhbCkuYXBwZW5kKHRoaXMpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmVwbGFjZSBlbGVtZW50cyBpbiB0aGUgRE9NLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfEVsZW1lbnR8TGlzdH0gdmFsXG4gKiBAcmV0dXJuIHtMaXN0fSBzZWxmXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMucmVwbGFjZSA9IGZ1bmN0aW9uKHZhbCkge1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHZhciBsaXN0ID0gdGhpcy5kb20odmFsKTtcblxuICBsaXN0LmZvckVhY2goZnVuY3Rpb24oZWwsIGkpIHtcbiAgICB2YXIgb2xkID0gc2VsZltpXTtcbiAgICB2YXIgcGFyZW50ID0gb2xkLnBhcmVudE5vZGU7XG4gICAgaWYgKCFwYXJlbnQpIHJldHVybjtcbiAgICBlbCA9IGkgPyBlbC5jbG9uZU5vZGUodHJ1ZSkgOiBlbDtcbiAgICBwYXJlbnQucmVwbGFjZUNoaWxkKGVsLCBvbGQpO1xuICB9KTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogRW1wdHkgdGhlIGRvbSBsaXN0XG4gKlxuICogQHJldHVybiBzZWxmXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMuZW1wdHkgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuZm9yRWFjaChmdW5jdGlvbihlbCkge1xuICAgIGVsLnRleHRDb250ZW50ID0gJyc7XG4gIH0pO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgYWxsIGVsZW1lbnRzIGluIHRoZSBkb20gbGlzdFxuICpcbiAqIEByZXR1cm4ge0xpc3R9IHNlbGZcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy5yZW1vdmUgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuZm9yRWFjaChmdW5jdGlvbihlbCkge1xuICAgIHZhciBwYXJlbnQgPSBlbC5wYXJlbnROb2RlO1xuICAgIGlmIChwYXJlbnQpIHBhcmVudC5yZW1vdmVDaGlsZChlbCk7XG4gIH0pO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gYSBjbG9uZWQgZG9tIGxpc3Qgd2l0aCBhbGwgZWxlbWVudHMgY2xvbmVkLlxuICpcbiAqIEByZXR1cm4ge0xpc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMuY2xvbmUgPSBmdW5jdGlvbigpIHtcbiAgdmFyIG91dCA9IHRoaXMubWFwKGZ1bmN0aW9uKGVsKSB7XG4gICAgcmV0dXJuIGVsLmNsb25lTm9kZSh0cnVlKTtcbiAgfSk7XG5cbiAgcmV0dXJuIHRoaXMuZG9tKG91dCk7XG59O1xuIiwiLyoqXG4gKiBNb2R1bGUgRGVwZW5kZW5jaWVzXG4gKi9cblxudmFyIHByb3RvID0gQXJyYXkucHJvdG90eXBlO1xudmFyIHRyYXZlcnNlID0gcmVxdWlyZSgndHJhdmVyc2UnKTtcbnZhciB0b0Z1bmN0aW9uID0gcmVxdWlyZSgndG8tZnVuY3Rpb24nKTtcbnZhciBtYXRjaGVzID0gcmVxdWlyZSgnbWF0Y2hlcy1zZWxlY3RvcicpO1xuXG4vKipcbiAqIEZpbmQgY2hpbGRyZW4gbWF0Y2hpbmcgdGhlIGdpdmVuIGBzZWxlY3RvcmAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHNlbGVjdG9yXG4gKiBAcmV0dXJuIHtMaXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5leHBvcnRzLmZpbmQgPSBmdW5jdGlvbihzZWxlY3Rvcil7XG4gIHJldHVybiB0aGlzLmRvbShzZWxlY3RvciwgdGhpcyk7XG59O1xuXG4vKipcbiAqIENoZWNrIGlmIHRoZSBhbnkgZWxlbWVudCBpbiB0aGUgc2VsZWN0aW9uXG4gKiBtYXRjaGVzIGBzZWxlY3RvcmAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHNlbGVjdG9yXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5leHBvcnRzLmlzID0gZnVuY3Rpb24oc2VsZWN0b3Ipe1xuICBmb3IodmFyIGkgPSAwLCBlbDsgZWwgPSB0aGlzW2ldOyBpKyspIHtcbiAgICBpZiAobWF0Y2hlcyhlbCwgc2VsZWN0b3IpKSByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiBmYWxzZTtcbn07XG5cbi8qKlxuICogR2V0IHBhcmVudChzKSB3aXRoIG9wdGlvbmFsIGBzZWxlY3RvcmAgYW5kIGBsaW1pdGBcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc2VsZWN0b3JcbiAqIEBwYXJhbSB7TnVtYmVyfSBsaW1pdFxuICogQHJldHVybiB7TGlzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy5wYXJlbnQgPSBmdW5jdGlvbihzZWxlY3RvciwgbGltaXQpe1xuICByZXR1cm4gdGhpcy5kb20odHJhdmVyc2UoJ3BhcmVudE5vZGUnLFxuICAgIHRoaXNbMF0sXG4gICAgc2VsZWN0b3IsXG4gICAgbGltaXRcbiAgICB8fCAxKSk7XG59O1xuXG4vKipcbiAqIEdldCBuZXh0IGVsZW1lbnQocykgd2l0aCBvcHRpb25hbCBgc2VsZWN0b3JgIGFuZCBgbGltaXRgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzZWxlY3RvclxuICogQHBhcmFtIHtOdW1iZXJ9IGxpbWl0XG4gKiBAcmV0cnVuIHtMaXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5leHBvcnRzLm5leHQgPSBmdW5jdGlvbihzZWxlY3RvciwgbGltaXQpe1xuICByZXR1cm4gdGhpcy5kb20odHJhdmVyc2UoJ25leHRTaWJsaW5nJyxcbiAgICB0aGlzWzBdLFxuICAgIHNlbGVjdG9yLFxuICAgIGxpbWl0XG4gICAgfHwgMSkpO1xufTtcblxuLyoqXG4gKiBHZXQgcHJldmlvdXMgZWxlbWVudChzKSB3aXRoIG9wdGlvbmFsIGBzZWxlY3RvcmAgYW5kIGBsaW1pdGAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHNlbGVjdG9yXG4gKiBAcGFyYW0ge051bWJlcn0gbGltaXRcbiAqIEByZXR1cm4ge0xpc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMucHJldiA9XG5leHBvcnRzLnByZXZpb3VzID0gZnVuY3Rpb24oc2VsZWN0b3IsIGxpbWl0KXtcbiAgcmV0dXJuIHRoaXMuZG9tKHRyYXZlcnNlKCdwcmV2aW91c1NpYmxpbmcnLFxuICAgIHRoaXNbMF0sXG4gICAgc2VsZWN0b3IsXG4gICAgbGltaXRcbiAgICB8fCAxKSk7XG59O1xuXG4vKipcbiAqIEl0ZXJhdGUgb3ZlciBlYWNoIGVsZW1lbnQgY3JlYXRpbmcgYSBuZXcgbGlzdCB3aXRoXG4gKiBvbmUgaXRlbSBhbmQgaW52b2tpbmcgYGZuKGxpc3QsIGkpYC5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7TGlzdH0gc2VsZlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5leHBvcnRzLmVhY2ggPSBmdW5jdGlvbihmbil7XG4gIHZhciBkb20gPSB0aGlzLmRvbTtcblxuICBmb3IgKHZhciBpID0gMCwgbGlzdCwgbGVuID0gdGhpcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIGxpc3QgPSBkb20odGhpc1tpXSk7XG4gICAgZm4uY2FsbChsaXN0LCBsaXN0LCBpKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBJdGVyYXRlIG92ZXIgZWFjaCBlbGVtZW50IGFuZCBpbnZva2UgYGZuKGVsLCBpKWBcbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7TGlzdH0gc2VsZlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5leHBvcnRzLmZvckVhY2ggPSBmdW5jdGlvbihmbikge1xuICBmb3IgKHZhciBpID0gMCwgbGVuID0gdGhpcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIGZuLmNhbGwodGhpc1tpXSwgdGhpc1tpXSwgaSk7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogTWFwIGVhY2ggcmV0dXJuIHZhbHVlIGZyb20gYGZuKHZhbCwgaSlgLlxuICpcbiAqIFBhc3NpbmcgYSBjYWxsYmFjayBmdW5jdGlvbjpcbiAqXG4gKiAgICBpbnB1dHMubWFwKGZ1bmN0aW9uKGlucHV0KXtcbiAqICAgICAgcmV0dXJuIGlucHV0LnR5cGVcbiAqICAgIH0pXG4gKlxuICogUGFzc2luZyBhIHByb3BlcnR5IHN0cmluZzpcbiAqXG4gKiAgICBpbnB1dHMubWFwKCd0eXBlJylcbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7TGlzdH0gc2VsZlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5leHBvcnRzLm1hcCA9IGZ1bmN0aW9uKGZuKXtcbiAgZm4gPSB0b0Z1bmN0aW9uKGZuKTtcbiAgdmFyIGRvbSA9IHRoaXMuZG9tO1xuICB2YXIgb3V0ID0gW107XG5cbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHRoaXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICBvdXQucHVzaChmbi5jYWxsKGRvbSh0aGlzW2ldKSwgdGhpc1tpXSwgaSkpO1xuICB9XG5cbiAgcmV0dXJuIHRoaXMuZG9tKG91dCk7XG59O1xuXG4vKipcbiAqIFNlbGVjdCBhbGwgdmFsdWVzIHRoYXQgcmV0dXJuIGEgdHJ1dGh5IHZhbHVlIG9mIGBmbih2YWwsIGkpYC5cbiAqXG4gKiAgICBpbnB1dHMuc2VsZWN0KGZ1bmN0aW9uKGlucHV0KXtcbiAqICAgICAgcmV0dXJuIGlucHV0LnR5cGUgPT0gJ3Bhc3N3b3JkJ1xuICogICAgfSlcbiAqXG4gKiAgV2l0aCBhIHByb3BlcnR5OlxuICpcbiAqICAgIGlucHV0cy5zZWxlY3QoJ3R5cGUgPT0gcGFzc3dvcmQnKVxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb258U3RyaW5nfSBmblxuICogQHJldHVybiB7TGlzdH0gc2VsZlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5leHBvcnRzLmZpbHRlciA9XG5leHBvcnRzLnNlbGVjdCA9IGZ1bmN0aW9uKGZuKXtcbiAgZm4gPSB0b0Z1bmN0aW9uKGZuKTtcbiAgdmFyIGRvbSA9IHRoaXMuZG9tO1xuICB2YXIgb3V0ID0gW107XG4gIHZhciB2YWw7XG5cbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHRoaXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICB2YWwgPSBmbi5jYWxsKGRvbSh0aGlzW2ldKSwgdGhpc1tpXSwgaSk7XG4gICAgaWYgKHZhbCkgb3V0LnB1c2godGhpc1tpXSk7XG4gIH1cblxuICByZXR1cm4gdGhpcy5kb20ob3V0KTtcbn07XG5cbi8qKlxuICogUmVqZWN0IGFsbCB2YWx1ZXMgdGhhdCByZXR1cm4gYSB0cnV0aHkgdmFsdWUgb2YgYGZuKHZhbCwgaSlgLlxuICpcbiAqIFJlamVjdGluZyB1c2luZyBhIGNhbGxiYWNrOlxuICpcbiAqICAgIGlucHV0LnJlamVjdChmdW5jdGlvbih1c2VyKXtcbiAqICAgICAgcmV0dXJuIGlucHV0Lmxlbmd0aCA8IDIwXG4gKiAgICB9KVxuICpcbiAqIFJlamVjdGluZyB3aXRoIGEgcHJvcGVydHk6XG4gKlxuICogICAgaXRlbXMucmVqZWN0KCdwYXNzd29yZCcpXG4gKlxuICogUmVqZWN0aW5nIHZhbHVlcyB2aWEgYD09YDpcbiAqXG4gKiAgICBkYXRhLnJlamVjdChudWxsKVxuICogICAgaW5wdXQucmVqZWN0KGZpbGUpXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbnxTdHJpbmd8TWl4ZWR9IGZuXG4gKiBAcmV0dXJuIHtMaXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5leHBvcnRzLnJlamVjdCA9IGZ1bmN0aW9uKGZuKXtcbiAgdmFyIG91dCA9IFtdO1xuICB2YXIgbGVuID0gdGhpcy5sZW5ndGg7XG4gIHZhciB2YWwsIGk7XG5cbiAgaWYgKCdzdHJpbmcnID09IHR5cGVvZiBmbikgZm4gPSB0b0Z1bmN0aW9uKGZuKTtcblxuICBpZiAoZm4pIHtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIHZhbCA9IGZuLmNhbGwoZG9tKHRoaXNbaV0pLCB0aGlzW2ldLCBpKTtcbiAgICAgIGlmICghdmFsKSBvdXQucHVzaCh0aGlzW2ldKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBpZiAodGhpc1tpXSAhPSBmbikgb3V0LnB1c2godGhpc1tpXSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXMuZG9tKG91dCk7XG59O1xuXG4vKipcbiAqIFJldHVybiBhIGBMaXN0YCBjb250YWluaW5nIHRoZSBlbGVtZW50IGF0IGBpYC5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gaVxuICogQHJldHVybiB7TGlzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy5hdCA9IGZ1bmN0aW9uKGkpe1xuICByZXR1cm4gdGhpcy5kb20odGhpc1tpXSk7XG59O1xuXG4vKipcbiAqIFJldHVybiBhIGBMaXN0YCBjb250YWluaW5nIHRoZSBmaXJzdCBlbGVtZW50LlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBpXG4gKiBAcmV0dXJuIHtMaXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5leHBvcnRzLmZpcnN0ID0gZnVuY3Rpb24oKXtcbiAgcmV0dXJuIHRoaXMuZG9tKHRoaXNbMF0pO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gYSBgTGlzdGAgY29udGFpbmluZyB0aGUgbGFzdCBlbGVtZW50LlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBpXG4gKiBAcmV0dXJuIHtMaXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5leHBvcnRzLmxhc3QgPSBmdW5jdGlvbigpe1xuICByZXR1cm4gdGhpcy5kb20odGhpc1t0aGlzLmxlbmd0aCAtIDFdKTtcbn07XG5cbi8qKlxuICogTWl4aW4gdGhlIGFycmF5IGZ1bmN0aW9uc1xuICovXG5cbltcbiAgJ3B1c2gnLFxuICAncG9wJyxcbiAgJ3NoaWZ0JyxcbiAgJ3NwbGljZScsXG4gICd1bnNoaWZ0JyxcbiAgJ3JldmVyc2UnLFxuICAnc29ydCcsXG4gICd0b1N0cmluZycsXG4gICdjb25jYXQnLFxuICAnam9pbicsXG4gICdzbGljZSdcbl0uZm9yRWFjaChmdW5jdGlvbihtZXRob2QpIHtcbiAgZXhwb3J0c1ttZXRob2RdID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHByb3RvW21ldGhvZF0uYXBwbHkodGhpcy50b0FycmF5KCksIGFyZ3VtZW50cyk7XG4gIH07XG59KTtcblxuIiwiXG4vKipcbiAqIEV4cG9zZSBgcGFyc2VgLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gcGFyc2U7XG5cbi8qKlxuICogV3JhcCBtYXAgZnJvbSBqcXVlcnkuXG4gKi9cblxudmFyIG1hcCA9IHtcbiAgb3B0aW9uOiBbMSwgJzxzZWxlY3QgbXVsdGlwbGU9XCJtdWx0aXBsZVwiPicsICc8L3NlbGVjdD4nXSxcbiAgb3B0Z3JvdXA6IFsxLCAnPHNlbGVjdCBtdWx0aXBsZT1cIm11bHRpcGxlXCI+JywgJzwvc2VsZWN0PiddLFxuICBsZWdlbmQ6IFsxLCAnPGZpZWxkc2V0PicsICc8L2ZpZWxkc2V0PiddLFxuICB0aGVhZDogWzEsICc8dGFibGU+JywgJzwvdGFibGU+J10sXG4gIHRib2R5OiBbMSwgJzx0YWJsZT4nLCAnPC90YWJsZT4nXSxcbiAgdGZvb3Q6IFsxLCAnPHRhYmxlPicsICc8L3RhYmxlPiddLFxuICBjb2xncm91cDogWzEsICc8dGFibGU+JywgJzwvdGFibGU+J10sXG4gIGNhcHRpb246IFsxLCAnPHRhYmxlPicsICc8L3RhYmxlPiddLFxuICB0cjogWzIsICc8dGFibGU+PHRib2R5PicsICc8L3Rib2R5PjwvdGFibGU+J10sXG4gIHRkOiBbMywgJzx0YWJsZT48dGJvZHk+PHRyPicsICc8L3RyPjwvdGJvZHk+PC90YWJsZT4nXSxcbiAgdGg6IFszLCAnPHRhYmxlPjx0Ym9keT48dHI+JywgJzwvdHI+PC90Ym9keT48L3RhYmxlPiddLFxuICBjb2w6IFsyLCAnPHRhYmxlPjx0Ym9keT48L3Rib2R5Pjxjb2xncm91cD4nLCAnPC9jb2xncm91cD48L3RhYmxlPiddLFxuICBfZGVmYXVsdDogWzAsICcnLCAnJ11cbn07XG5cbi8qKlxuICogUGFyc2UgYGh0bWxgIGFuZCByZXR1cm4gdGhlIGNoaWxkcmVuLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBodG1sXG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHBhcnNlKGh0bWwpIHtcbiAgaWYgKCdzdHJpbmcnICE9IHR5cGVvZiBodG1sKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdTdHJpbmcgZXhwZWN0ZWQnKTtcblxuICAvLyB0YWcgbmFtZVxuICB2YXIgbSA9IC88KFtcXHc6XSspLy5leGVjKGh0bWwpO1xuICBpZiAoIW0pIHRocm93IG5ldyBFcnJvcignTm8gZWxlbWVudHMgd2VyZSBnZW5lcmF0ZWQuJyk7XG4gIHZhciB0YWcgPSBtWzFdO1xuXG4gIC8vIGJvZHkgc3VwcG9ydFxuICBpZiAodGFnID09ICdib2R5Jykge1xuICAgIHZhciBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2h0bWwnKTtcbiAgICBlbC5pbm5lckhUTUwgPSBodG1sO1xuICAgIHJldHVybiBlbC5yZW1vdmVDaGlsZChlbC5sYXN0Q2hpbGQpO1xuICB9XG5cbiAgLy8gd3JhcCBtYXBcbiAgdmFyIHdyYXAgPSBtYXBbdGFnXSB8fCBtYXAuX2RlZmF1bHQ7XG4gIHZhciBkZXB0aCA9IHdyYXBbMF07XG4gIHZhciBwcmVmaXggPSB3cmFwWzFdO1xuICB2YXIgc3VmZml4ID0gd3JhcFsyXTtcbiAgdmFyIGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIGVsLmlubmVySFRNTCA9IHByZWZpeCArIGh0bWwgKyBzdWZmaXg7XG4gIHdoaWxlIChkZXB0aC0tKSBlbCA9IGVsLmxhc3RDaGlsZDtcblxuICB2YXIgZWxzID0gZWwuY2hpbGRyZW47XG4gIGlmICgxID09IGVscy5sZW5ndGgpIHtcbiAgICByZXR1cm4gZWwucmVtb3ZlQ2hpbGQoZWxzWzBdKTtcbiAgfVxuXG4gIHZhciBmcmFnbWVudCA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgd2hpbGUgKGVscy5sZW5ndGgpIHtcbiAgICBmcmFnbWVudC5hcHBlbmRDaGlsZChlbC5yZW1vdmVDaGlsZChlbHNbMF0pKTtcbiAgfVxuXG4gIHJldHVybiBmcmFnbWVudDtcbn1cbiIsIlxuZXhwb3J0cy5saW5lYXIgPSBmdW5jdGlvbihuKXtcbiAgcmV0dXJuIG47XG59O1xuXG5leHBvcnRzLmluUXVhZCA9IGZ1bmN0aW9uKG4pe1xuICByZXR1cm4gbiAqIG47XG59O1xuXG5leHBvcnRzLm91dFF1YWQgPSBmdW5jdGlvbihuKXtcbiAgcmV0dXJuIG4gKiAoMiAtIG4pO1xufTtcblxuZXhwb3J0cy5pbk91dFF1YWQgPSBmdW5jdGlvbihuKXtcbiAgbiAqPSAyO1xuICBpZiAobiA8IDEpIHJldHVybiAwLjUgKiBuICogbjtcbiAgcmV0dXJuIC0gMC41ICogKC0tbiAqIChuIC0gMikgLSAxKTtcbn07XG5cbmV4cG9ydHMuaW5DdWJlID0gZnVuY3Rpb24obil7XG4gIHJldHVybiBuICogbiAqIG47XG59O1xuXG5leHBvcnRzLm91dEN1YmUgPSBmdW5jdGlvbihuKXtcbiAgcmV0dXJuIC0tbiAqIG4gKiBuICsgMTtcbn07XG5cbmV4cG9ydHMuaW5PdXRDdWJlID0gZnVuY3Rpb24obil7XG4gIG4gKj0gMjtcbiAgaWYgKG4gPCAxKSByZXR1cm4gMC41ICogbiAqIG4gKiBuO1xuICByZXR1cm4gMC41ICogKChuIC09IDIgKSAqIG4gKiBuICsgMik7XG59O1xuXG5leHBvcnRzLmluUXVhcnQgPSBmdW5jdGlvbihuKXtcbiAgcmV0dXJuIG4gKiBuICogbiAqIG47XG59O1xuXG5leHBvcnRzLm91dFF1YXJ0ID0gZnVuY3Rpb24obil7XG4gIHJldHVybiAxIC0gKC0tbiAqIG4gKiBuICogbik7XG59O1xuXG5leHBvcnRzLmluT3V0UXVhcnQgPSBmdW5jdGlvbihuKXtcbiAgbiAqPSAyO1xuICBpZiAobiA8IDEpIHJldHVybiAwLjUgKiBuICogbiAqIG4gKiBuO1xuICByZXR1cm4gLTAuNSAqICgobiAtPSAyKSAqIG4gKiBuICogbiAtIDIpO1xufTtcblxuZXhwb3J0cy5pblF1aW50ID0gZnVuY3Rpb24obil7XG4gIHJldHVybiBuICogbiAqIG4gKiBuICogbjtcbn1cblxuZXhwb3J0cy5vdXRRdWludCA9IGZ1bmN0aW9uKG4pe1xuICByZXR1cm4gLS1uICogbiAqIG4gKiBuICogbiArIDE7XG59XG5cbmV4cG9ydHMuaW5PdXRRdWludCA9IGZ1bmN0aW9uKG4pe1xuICBuICo9IDI7XG4gIGlmIChuIDwgMSkgcmV0dXJuIDAuNSAqIG4gKiBuICogbiAqIG4gKiBuO1xuICByZXR1cm4gMC41ICogKChuIC09IDIpICogbiAqIG4gKiBuICogbiArIDIpO1xufTtcblxuZXhwb3J0cy5pblNpbmUgPSBmdW5jdGlvbihuKXtcbiAgcmV0dXJuIDEgLSBNYXRoLmNvcyhuICogTWF0aC5QSSAvIDIgKTtcbn07XG5cbmV4cG9ydHMub3V0U2luZSA9IGZ1bmN0aW9uKG4pe1xuICByZXR1cm4gTWF0aC5zaW4obiAqIE1hdGguUEkgLyAyKTtcbn07XG5cbmV4cG9ydHMuaW5PdXRTaW5lID0gZnVuY3Rpb24obil7XG4gIHJldHVybiAuNSAqICgxIC0gTWF0aC5jb3MoTWF0aC5QSSAqIG4pKTtcbn07XG5cbmV4cG9ydHMuaW5FeHBvID0gZnVuY3Rpb24obil7XG4gIHJldHVybiAwID09IG4gPyAwIDogTWF0aC5wb3coMTAyNCwgbiAtIDEpO1xufTtcblxuZXhwb3J0cy5vdXRFeHBvID0gZnVuY3Rpb24obil7XG4gIHJldHVybiAxID09IG4gPyBuIDogMSAtIE1hdGgucG93KDIsIC0xMCAqIG4pO1xufTtcblxuZXhwb3J0cy5pbk91dEV4cG8gPSBmdW5jdGlvbihuKXtcbiAgaWYgKDAgPT0gbikgcmV0dXJuIDA7XG4gIGlmICgxID09IG4pIHJldHVybiAxO1xuICBpZiAoKG4gKj0gMikgPCAxKSByZXR1cm4gLjUgKiBNYXRoLnBvdygxMDI0LCBuIC0gMSk7XG4gIHJldHVybiAuNSAqICgtTWF0aC5wb3coMiwgLTEwICogKG4gLSAxKSkgKyAyKTtcbn07XG5cbmV4cG9ydHMuaW5DaXJjID0gZnVuY3Rpb24obil7XG4gIHJldHVybiAxIC0gTWF0aC5zcXJ0KDEgLSBuICogbik7XG59O1xuXG5leHBvcnRzLm91dENpcmMgPSBmdW5jdGlvbihuKXtcbiAgcmV0dXJuIE1hdGguc3FydCgxIC0gKC0tbiAqIG4pKTtcbn07XG5cbmV4cG9ydHMuaW5PdXRDaXJjID0gZnVuY3Rpb24obil7XG4gIG4gKj0gMlxuICBpZiAobiA8IDEpIHJldHVybiAtMC41ICogKE1hdGguc3FydCgxIC0gbiAqIG4pIC0gMSk7XG4gIHJldHVybiAwLjUgKiAoTWF0aC5zcXJ0KDEgLSAobiAtPSAyKSAqIG4pICsgMSk7XG59O1xuXG5leHBvcnRzLmluQmFjayA9IGZ1bmN0aW9uKG4pe1xuICB2YXIgcyA9IDEuNzAxNTg7XG4gIHJldHVybiBuICogbiAqICgoIHMgKyAxICkgKiBuIC0gcyk7XG59O1xuXG5leHBvcnRzLm91dEJhY2sgPSBmdW5jdGlvbihuKXtcbiAgdmFyIHMgPSAxLjcwMTU4O1xuICByZXR1cm4gLS1uICogbiAqICgocyArIDEpICogbiArIHMpICsgMTtcbn07XG5cbmV4cG9ydHMuaW5PdXRCYWNrID0gZnVuY3Rpb24obil7XG4gIHZhciBzID0gMS43MDE1OCAqIDEuNTI1O1xuICBpZiAoICggbiAqPSAyICkgPCAxICkgcmV0dXJuIDAuNSAqICggbiAqIG4gKiAoICggcyArIDEgKSAqIG4gLSBzICkgKTtcbiAgcmV0dXJuIDAuNSAqICggKCBuIC09IDIgKSAqIG4gKiAoICggcyArIDEgKSAqIG4gKyBzICkgKyAyICk7XG59O1xuXG5leHBvcnRzLmluQm91bmNlID0gZnVuY3Rpb24obil7XG4gIHJldHVybiAxIC0gZXhwb3J0cy5vdXRCb3VuY2UoMSAtIG4pO1xufTtcblxuZXhwb3J0cy5vdXRCb3VuY2UgPSBmdW5jdGlvbihuKXtcbiAgaWYgKCBuIDwgKCAxIC8gMi43NSApICkge1xuICAgIHJldHVybiA3LjU2MjUgKiBuICogbjtcbiAgfSBlbHNlIGlmICggbiA8ICggMiAvIDIuNzUgKSApIHtcbiAgICByZXR1cm4gNy41NjI1ICogKCBuIC09ICggMS41IC8gMi43NSApICkgKiBuICsgMC43NTtcbiAgfSBlbHNlIGlmICggbiA8ICggMi41IC8gMi43NSApICkge1xuICAgIHJldHVybiA3LjU2MjUgKiAoIG4gLT0gKCAyLjI1IC8gMi43NSApICkgKiBuICsgMC45Mzc1O1xuICB9IGVsc2Uge1xuICAgIHJldHVybiA3LjU2MjUgKiAoIG4gLT0gKCAyLjYyNSAvIDIuNzUgKSApICogbiArIDAuOTg0Mzc1O1xuICB9XG59O1xuXG5leHBvcnRzLmluT3V0Qm91bmNlID0gZnVuY3Rpb24obil7XG4gIGlmIChuIDwgLjUpIHJldHVybiBleHBvcnRzLmluQm91bmNlKG4gKiAyKSAqIC41O1xuICByZXR1cm4gZXhwb3J0cy5vdXRCb3VuY2UobiAqIDIgLSAxKSAqIC41ICsgLjU7XG59O1xuXG4vLyBhbGlhc2VzXG5cbmV4cG9ydHNbJ2luLXF1YWQnXSA9IGV4cG9ydHMuaW5RdWFkO1xuZXhwb3J0c1snb3V0LXF1YWQnXSA9IGV4cG9ydHMub3V0UXVhZDtcbmV4cG9ydHNbJ2luLW91dC1xdWFkJ10gPSBleHBvcnRzLmluT3V0UXVhZDtcbmV4cG9ydHNbJ2luLWN1YmUnXSA9IGV4cG9ydHMuaW5DdWJlO1xuZXhwb3J0c1snb3V0LWN1YmUnXSA9IGV4cG9ydHMub3V0Q3ViZTtcbmV4cG9ydHNbJ2luLW91dC1jdWJlJ10gPSBleHBvcnRzLmluT3V0Q3ViZTtcbmV4cG9ydHNbJ2luLXF1YXJ0J10gPSBleHBvcnRzLmluUXVhcnQ7XG5leHBvcnRzWydvdXQtcXVhcnQnXSA9IGV4cG9ydHMub3V0UXVhcnQ7XG5leHBvcnRzWydpbi1vdXQtcXVhcnQnXSA9IGV4cG9ydHMuaW5PdXRRdWFydDtcbmV4cG9ydHNbJ2luLXF1aW50J10gPSBleHBvcnRzLmluUXVpbnQ7XG5leHBvcnRzWydvdXQtcXVpbnQnXSA9IGV4cG9ydHMub3V0UXVpbnQ7XG5leHBvcnRzWydpbi1vdXQtcXVpbnQnXSA9IGV4cG9ydHMuaW5PdXRRdWludDtcbmV4cG9ydHNbJ2luLXNpbmUnXSA9IGV4cG9ydHMuaW5TaW5lO1xuZXhwb3J0c1snb3V0LXNpbmUnXSA9IGV4cG9ydHMub3V0U2luZTtcbmV4cG9ydHNbJ2luLW91dC1zaW5lJ10gPSBleHBvcnRzLmluT3V0U2luZTtcbmV4cG9ydHNbJ2luLWV4cG8nXSA9IGV4cG9ydHMuaW5FeHBvO1xuZXhwb3J0c1snb3V0LWV4cG8nXSA9IGV4cG9ydHMub3V0RXhwbztcbmV4cG9ydHNbJ2luLW91dC1leHBvJ10gPSBleHBvcnRzLmluT3V0RXhwbztcbmV4cG9ydHNbJ2luLWNpcmMnXSA9IGV4cG9ydHMuaW5DaXJjO1xuZXhwb3J0c1snb3V0LWNpcmMnXSA9IGV4cG9ydHMub3V0Q2lyYztcbmV4cG9ydHNbJ2luLW91dC1jaXJjJ10gPSBleHBvcnRzLmluT3V0Q2lyYztcbmV4cG9ydHNbJ2luLWJhY2snXSA9IGV4cG9ydHMuaW5CYWNrO1xuZXhwb3J0c1snb3V0LWJhY2snXSA9IGV4cG9ydHMub3V0QmFjaztcbmV4cG9ydHNbJ2luLW91dC1iYWNrJ10gPSBleHBvcnRzLmluT3V0QmFjaztcbmV4cG9ydHNbJ2luLWJvdW5jZSddID0gZXhwb3J0cy5pbkJvdW5jZTtcbmV4cG9ydHNbJ291dC1ib3VuY2UnXSA9IGV4cG9ydHMub3V0Qm91bmNlO1xuZXhwb3J0c1snaW4tb3V0LWJvdW5jZSddID0gZXhwb3J0cy5pbk91dEJvdW5jZTtcbiIsInZhciBiaW5kID0gd2luZG93LmFkZEV2ZW50TGlzdGVuZXIgPyAnYWRkRXZlbnRMaXN0ZW5lcicgOiAnYXR0YWNoRXZlbnQnLFxuICAgIHVuYmluZCA9IHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyID8gJ3JlbW92ZUV2ZW50TGlzdGVuZXInIDogJ2RldGFjaEV2ZW50JyxcbiAgICBwcmVmaXggPSBiaW5kICE9PSAnYWRkRXZlbnRMaXN0ZW5lcicgPyAnb24nIDogJyc7XG5cbi8qKlxuICogQmluZCBgZWxgIGV2ZW50IGB0eXBlYCB0byBgZm5gLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHBhcmFtIHtCb29sZWFufSBjYXB0dXJlXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy5iaW5kID0gZnVuY3Rpb24oZWwsIHR5cGUsIGZuLCBjYXB0dXJlKXtcbiAgZWxbYmluZF0ocHJlZml4ICsgdHlwZSwgZm4sIGNhcHR1cmUgfHwgZmFsc2UpO1xuXG4gIHJldHVybiBmbjtcbn07XG5cbi8qKlxuICogVW5iaW5kIGBlbGAgZXZlbnQgYHR5cGVgJ3MgY2FsbGJhY2sgYGZuYC5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gY2FwdHVyZVxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMudW5iaW5kID0gZnVuY3Rpb24oZWwsIHR5cGUsIGZuLCBjYXB0dXJlKXtcbiAgZWxbdW5iaW5kXShwcmVmaXggKyB0eXBlLCBmbiwgY2FwdHVyZSB8fCBmYWxzZSk7XG5cbiAgcmV0dXJuIGZuO1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGFyciwgb2JqKXtcbiAgaWYgKGFyci5pbmRleE9mKSByZXR1cm4gYXJyLmluZGV4T2Yob2JqKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyArK2kpIHtcbiAgICBpZiAoYXJyW2ldID09PSBvYmopIHJldHVybiBpO1xuICB9XG4gIHJldHVybiAtMTtcbn07IiwiLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICovXG5cbnZhciBxdWVyeSA9IHJlcXVpcmUoJ3F1ZXJ5Jyk7XG5cbi8qKlxuICogRWxlbWVudCBwcm90b3R5cGUuXG4gKi9cblxudmFyIHByb3RvID0gRWxlbWVudC5wcm90b3R5cGU7XG5cbi8qKlxuICogVmVuZG9yIGZ1bmN0aW9uLlxuICovXG5cbnZhciB2ZW5kb3IgPSBwcm90by5tYXRjaGVzXG4gIHx8IHByb3RvLndlYmtpdE1hdGNoZXNTZWxlY3RvclxuICB8fCBwcm90by5tb3pNYXRjaGVzU2VsZWN0b3JcbiAgfHwgcHJvdG8ubXNNYXRjaGVzU2VsZWN0b3JcbiAgfHwgcHJvdG8ub01hdGNoZXNTZWxlY3RvcjtcblxuLyoqXG4gKiBFeHBvc2UgYG1hdGNoKClgLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gbWF0Y2g7XG5cbi8qKlxuICogTWF0Y2ggYGVsYCB0byBgc2VsZWN0b3JgLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7U3RyaW5nfSBzZWxlY3RvclxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gbWF0Y2goZWwsIHNlbGVjdG9yKSB7XG4gIGlmICh2ZW5kb3IpIHJldHVybiB2ZW5kb3IuY2FsbChlbCwgc2VsZWN0b3IpO1xuICB2YXIgbm9kZXMgPSBxdWVyeS5hbGwoc2VsZWN0b3IsIGVsLnBhcmVudE5vZGUpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgKytpKSB7XG4gICAgaWYgKG5vZGVzW2ldID09IGVsKSByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG4iLCJcbi8qKlxuICogUmV0dXJuIGltbWVkaWF0ZSBpZGVudGlmaWVycyBwYXJzZWQgZnJvbSBgc3RyYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcGFyYW0ge1N0cmluZ3xGdW5jdGlvbn0gbWFwIGZ1bmN0aW9uIG9yIHByZWZpeFxuICogQHJldHVybiB7QXJyYXl9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc3RyLCBmbil7XG4gIHZhciBwID0gdW5pcXVlKHByb3BzKHN0cikpO1xuICBpZiAoZm4gJiYgJ3N0cmluZycgPT0gdHlwZW9mIGZuKSBmbiA9IHByZWZpeGVkKGZuKTtcbiAgaWYgKGZuKSByZXR1cm4gbWFwKHN0ciwgcCwgZm4pO1xuICByZXR1cm4gcDtcbn07XG5cbi8qKlxuICogUmV0dXJuIGltbWVkaWF0ZSBpZGVudGlmaWVycyBpbiBgc3RyYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHByb3BzKHN0cikge1xuICByZXR1cm4gc3RyXG4gICAgLnJlcGxhY2UoL1xcLlxcdyt8XFx3KyAqXFwofFwiW15cIl0qXCJ8J1teJ10qJ3xcXC8oW14vXSspXFwvL2csICcnKVxuICAgIC5tYXRjaCgvW2EtekEtWl9dXFx3Ki9nKVxuICAgIHx8IFtdO1xufVxuXG4vKipcbiAqIFJldHVybiBgc3RyYCB3aXRoIGBwcm9wc2AgbWFwcGVkIHdpdGggYGZuYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcGFyYW0ge0FycmF5fSBwcm9wc1xuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIG1hcChzdHIsIHByb3BzLCBmbikge1xuICB2YXIgcmUgPSAvXFwuXFx3K3xcXHcrICpcXCh8XCJbXlwiXSpcInwnW14nXSonfFxcLyhbXi9dKylcXC98W2EtekEtWl9dXFx3Ki9nO1xuICByZXR1cm4gc3RyLnJlcGxhY2UocmUsIGZ1bmN0aW9uKF8pe1xuICAgIGlmICgnKCcgPT0gX1tfLmxlbmd0aCAtIDFdKSByZXR1cm4gZm4oXyk7XG4gICAgaWYgKCF+cHJvcHMuaW5kZXhPZihfKSkgcmV0dXJuIF87XG4gICAgcmV0dXJuIGZuKF8pO1xuICB9KTtcbn1cblxuLyoqXG4gKiBSZXR1cm4gdW5pcXVlIGFycmF5LlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGFyclxuICogQHJldHVybiB7QXJyYXl9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiB1bmlxdWUoYXJyKSB7XG4gIHZhciByZXQgPSBbXTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xuICAgIGlmICh+cmV0LmluZGV4T2YoYXJyW2ldKSkgY29udGludWU7XG4gICAgcmV0LnB1c2goYXJyW2ldKTtcbiAgfVxuXG4gIHJldHVybiByZXQ7XG59XG5cbi8qKlxuICogTWFwIHdpdGggcHJlZml4IGBzdHJgLlxuICovXG5cbmZ1bmN0aW9uIHByZWZpeGVkKHN0cikge1xuICByZXR1cm4gZnVuY3Rpb24oXyl7XG4gICAgcmV0dXJuIHN0ciArIF87XG4gIH1cbn1cbiIsIlxuZnVuY3Rpb24gb25lKHNlbGVjdG9yLCBlbCkge1xuICByZXR1cm4gZWwucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG59XG5cbmV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHNlbGVjdG9yLCBlbCl7XG4gIGVsID0gZWwgfHwgZG9jdW1lbnQ7XG4gIHJldHVybiBvbmUoc2VsZWN0b3IsIGVsKTtcbn07XG5cbmV4cG9ydHMuYWxsID0gZnVuY3Rpb24oc2VsZWN0b3IsIGVsKXtcbiAgZWwgPSBlbCB8fCBkb2N1bWVudDtcbiAgcmV0dXJuIGVsLnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xufTtcblxuZXhwb3J0cy5lbmdpbmUgPSBmdW5jdGlvbihvYmope1xuICBpZiAoIW9iai5vbmUpIHRocm93IG5ldyBFcnJvcignLm9uZSBjYWxsYmFjayByZXF1aXJlZCcpO1xuICBpZiAoIW9iai5hbGwpIHRocm93IG5ldyBFcnJvcignLmFsbCBjYWxsYmFjayByZXF1aXJlZCcpO1xuICBvbmUgPSBvYmoub25lO1xuICBleHBvcnRzLmFsbCA9IG9iai5hbGw7XG59O1xuIiwiZnVuY3Rpb24gb25lKHNlbGVjdG9yLCBlbCkge1xuICByZXR1cm4gZWwucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG59XG5cbmV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHNlbGVjdG9yLCBlbCl7XG4gIGVsID0gZWwgfHwgZG9jdW1lbnQ7XG4gIHJldHVybiBvbmUoc2VsZWN0b3IsIGVsKTtcbn07XG5cbmV4cG9ydHMuYWxsID0gZnVuY3Rpb24oc2VsZWN0b3IsIGVsKXtcbiAgZWwgPSBlbCB8fCBkb2N1bWVudDtcbiAgcmV0dXJuIGVsLnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xufTtcblxuZXhwb3J0cy5lbmdpbmUgPSBmdW5jdGlvbihvYmope1xuICBpZiAoIW9iai5vbmUpIHRocm93IG5ldyBFcnJvcignLm9uZSBjYWxsYmFjayByZXF1aXJlZCcpO1xuICBpZiAoIW9iai5hbGwpIHRocm93IG5ldyBFcnJvcignLmFsbCBjYWxsYmFjayByZXF1aXJlZCcpO1xuICBvbmUgPSBvYmoub25lO1xuICBleHBvcnRzLmFsbCA9IG9iai5hbGw7XG4gIHJldHVybiBleHBvcnRzO1xufTtcbiIsIi8qKlxuICogRXhwb3NlIGByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKWAuXG4gKi9cblxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZVxuICB8fCB3aW5kb3cud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lXG4gIHx8IHdpbmRvdy5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWVcbiAgfHwgd2luZG93Lm9SZXF1ZXN0QW5pbWF0aW9uRnJhbWVcbiAgfHwgd2luZG93Lm1zUmVxdWVzdEFuaW1hdGlvbkZyYW1lXG4gIHx8IGZhbGxiYWNrO1xuXG4vKipcbiAqIEZhbGxiYWNrIGltcGxlbWVudGF0aW9uLlxuICovXG5cbnZhciBwcmV2ID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5mdW5jdGlvbiBmYWxsYmFjayhmbikge1xuICB2YXIgY3VyciA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICB2YXIgbXMgPSBNYXRoLm1heCgwLCAxNiAtIChjdXJyIC0gcHJldikpO1xuICB2YXIgcmVxID0gc2V0VGltZW91dChmbiwgbXMpO1xuICBwcmV2ID0gY3VycjtcbiAgcmV0dXJuIHJlcTtcbn1cblxuLyoqXG4gKiBDYW5jZWwuXG4gKi9cblxudmFyIGNhbmNlbCA9IHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZVxuICB8fCB3aW5kb3cud2Via2l0Q2FuY2VsQW5pbWF0aW9uRnJhbWVcbiAgfHwgd2luZG93Lm1vekNhbmNlbEFuaW1hdGlvbkZyYW1lXG4gIHx8IHdpbmRvdy5vQ2FuY2VsQW5pbWF0aW9uRnJhbWVcbiAgfHwgd2luZG93Lm1zQ2FuY2VsQW5pbWF0aW9uRnJhbWVcbiAgfHwgd2luZG93LmNsZWFyVGltZW91dDtcblxuZXhwb3J0cy5jYW5jZWwgPSBmdW5jdGlvbihpZCl7XG4gIGNhbmNlbC5jYWxsKHdpbmRvdywgaWQpO1xufTtcbiIsIi8qKlxuICogTW9kdWxlIERlcGVuZGVuY2llc1xuICovXG5cbnRyeSB7XG4gIHZhciBleHByID0gcmVxdWlyZSgncHJvcHMnKTtcbn0gY2F0Y2goZSkge1xuICB2YXIgZXhwciA9IHJlcXVpcmUoJ3Byb3BzLWNvbXBvbmVudCcpO1xufVxuXG4vKipcbiAqIEV4cG9zZSBgdG9GdW5jdGlvbigpYC5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHRvRnVuY3Rpb247XG5cbi8qKlxuICogQ29udmVydCBgb2JqYCB0byBhIGBGdW5jdGlvbmAuXG4gKlxuICogQHBhcmFtIHtNaXhlZH0gb2JqXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHRvRnVuY3Rpb24ob2JqKSB7XG4gIHN3aXRjaCAoe30udG9TdHJpbmcuY2FsbChvYmopKSB7XG4gICAgY2FzZSAnW29iamVjdCBPYmplY3RdJzpcbiAgICAgIHJldHVybiBvYmplY3RUb0Z1bmN0aW9uKG9iaik7XG4gICAgY2FzZSAnW29iamVjdCBGdW5jdGlvbl0nOlxuICAgICAgcmV0dXJuIG9iajtcbiAgICBjYXNlICdbb2JqZWN0IFN0cmluZ10nOlxuICAgICAgcmV0dXJuIHN0cmluZ1RvRnVuY3Rpb24ob2JqKTtcbiAgICBjYXNlICdbb2JqZWN0IFJlZ0V4cF0nOlxuICAgICAgcmV0dXJuIHJlZ2V4cFRvRnVuY3Rpb24ob2JqKTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGRlZmF1bHRUb0Z1bmN0aW9uKG9iaik7XG4gIH1cbn1cblxuLyoqXG4gKiBEZWZhdWx0IHRvIHN0cmljdCBlcXVhbGl0eS5cbiAqXG4gKiBAcGFyYW0ge01peGVkfSB2YWxcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gZGVmYXVsdFRvRnVuY3Rpb24odmFsKSB7XG4gIHJldHVybiBmdW5jdGlvbihvYmope1xuICAgIHJldHVybiB2YWwgPT09IG9iajtcbiAgfVxufVxuXG4vKipcbiAqIENvbnZlcnQgYHJlYCB0byBhIGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSB7UmVnRXhwfSByZVxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiByZWdleHBUb0Z1bmN0aW9uKHJlKSB7XG4gIHJldHVybiBmdW5jdGlvbihvYmope1xuICAgIHJldHVybiByZS50ZXN0KG9iaik7XG4gIH1cbn1cblxuLyoqXG4gKiBDb252ZXJ0IHByb3BlcnR5IGBzdHJgIHRvIGEgZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBzdHJpbmdUb0Z1bmN0aW9uKHN0cikge1xuICAvLyBpbW1lZGlhdGUgc3VjaCBhcyBcIj4gMjBcIlxuICBpZiAoL14gKlxcVysvLnRlc3Qoc3RyKSkgcmV0dXJuIG5ldyBGdW5jdGlvbignXycsICdyZXR1cm4gXyAnICsgc3RyKTtcblxuICAvLyBwcm9wZXJ0aWVzIHN1Y2ggYXMgXCJuYW1lLmZpcnN0XCIgb3IgXCJhZ2UgPiAxOFwiIG9yIFwiYWdlID4gMTggJiYgYWdlIDwgMzZcIlxuICByZXR1cm4gbmV3IEZ1bmN0aW9uKCdfJywgJ3JldHVybiAnICsgZ2V0KHN0cikpO1xufVxuXG4vKipcbiAqIENvbnZlcnQgYG9iamVjdGAgdG8gYSBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0XG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIG9iamVjdFRvRnVuY3Rpb24ob2JqKSB7XG4gIHZhciBtYXRjaCA9IHt9XG4gIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICBtYXRjaFtrZXldID0gdHlwZW9mIG9ialtrZXldID09PSAnc3RyaW5nJ1xuICAgICAgPyBkZWZhdWx0VG9GdW5jdGlvbihvYmpba2V5XSlcbiAgICAgIDogdG9GdW5jdGlvbihvYmpba2V5XSlcbiAgfVxuICByZXR1cm4gZnVuY3Rpb24odmFsKXtcbiAgICBpZiAodHlwZW9mIHZhbCAhPT0gJ29iamVjdCcpIHJldHVybiBmYWxzZTtcbiAgICBmb3IgKHZhciBrZXkgaW4gbWF0Y2gpIHtcbiAgICAgIGlmICghKGtleSBpbiB2YWwpKSByZXR1cm4gZmFsc2U7XG4gICAgICBpZiAoIW1hdGNoW2tleV0odmFsW2tleV0pKSByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG59XG5cbi8qKlxuICogQnVpbHQgdGhlIGdldHRlciBmdW5jdGlvbi4gU3VwcG9ydHMgZ2V0dGVyIHN0eWxlIGZ1bmN0aW9uc1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGdldChzdHIpIHtcbiAgdmFyIHByb3BzID0gZXhwcihzdHIpO1xuICBpZiAoIXByb3BzLmxlbmd0aCkgcmV0dXJuICdfLicgKyBzdHI7XG5cbiAgdmFyIHZhbDtcbiAgZm9yKHZhciBpID0gMCwgcHJvcDsgcHJvcCA9IHByb3BzW2ldOyBpKyspIHtcbiAgICB2YWwgPSAnXy4nICsgcHJvcDtcbiAgICB2YWwgPSBcIignZnVuY3Rpb24nID09IHR5cGVvZiBcIiArIHZhbCArIFwiID8gXCIgKyB2YWwgKyBcIigpIDogXCIgKyB2YWwgKyBcIilcIjtcbiAgICBzdHIgPSBzdHIucmVwbGFjZShuZXcgUmVnRXhwKHByb3AsICdnJyksIHZhbCk7XG4gIH1cblxuICByZXR1cm4gc3RyO1xufVxuIiwiXG5leHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSB0cmltO1xuXG5mdW5jdGlvbiB0cmltKHN0cil7XG4gIGlmIChzdHIudHJpbSkgcmV0dXJuIHN0ci50cmltKCk7XG4gIHJldHVybiBzdHIucmVwbGFjZSgvXlxccyp8XFxzKiQvZywgJycpO1xufVxuXG5leHBvcnRzLmxlZnQgPSBmdW5jdGlvbihzdHIpe1xuICBpZiAoc3RyLnRyaW1MZWZ0KSByZXR1cm4gc3RyLnRyaW1MZWZ0KCk7XG4gIHJldHVybiBzdHIucmVwbGFjZSgvXlxccyovLCAnJyk7XG59O1xuXG5leHBvcnRzLnJpZ2h0ID0gZnVuY3Rpb24oc3RyKXtcbiAgaWYgKHN0ci50cmltUmlnaHQpIHJldHVybiBzdHIudHJpbVJpZ2h0KCk7XG4gIHJldHVybiBzdHIucmVwbGFjZSgvXFxzKiQvLCAnJyk7XG59O1xuIiwiXG4vKipcbiAqIHRvU3RyaW5nIHJlZi5cbiAqL1xuXG52YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG4vKipcbiAqIFJldHVybiB0aGUgdHlwZSBvZiBgdmFsYC5cbiAqXG4gKiBAcGFyYW0ge01peGVkfSB2YWxcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHVibGljXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih2YWwpe1xuICBzd2l0Y2ggKHRvU3RyaW5nLmNhbGwodmFsKSkge1xuICAgIGNhc2UgJ1tvYmplY3QgRnVuY3Rpb25dJzogcmV0dXJuICdmdW5jdGlvbic7XG4gICAgY2FzZSAnW29iamVjdCBEYXRlXSc6IHJldHVybiAnZGF0ZSc7XG4gICAgY2FzZSAnW29iamVjdCBSZWdFeHBdJzogcmV0dXJuICdyZWdleHAnO1xuICAgIGNhc2UgJ1tvYmplY3QgQXJndW1lbnRzXSc6IHJldHVybiAnYXJndW1lbnRzJztcbiAgICBjYXNlICdbb2JqZWN0IEFycmF5XSc6IHJldHVybiAnYXJyYXknO1xuICAgIGNhc2UgJ1tvYmplY3QgU3RyaW5nXSc6IHJldHVybiAnc3RyaW5nJztcbiAgfVxuXG4gIGlmICh2YWwgPT09IG51bGwpIHJldHVybiAnbnVsbCc7XG4gIGlmICh2YWwgPT09IHVuZGVmaW5lZCkgcmV0dXJuICd1bmRlZmluZWQnO1xuICBpZiAodmFsICYmIHZhbC5ub2RlVHlwZSA9PT0gMSkgcmV0dXJuICdlbGVtZW50JztcbiAgaWYgKHZhbCA9PT0gT2JqZWN0KHZhbCkpIHJldHVybiAnb2JqZWN0JztcblxuICByZXR1cm4gdHlwZW9mIHZhbDtcbn07XG4iLCJcbi8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL1xuXG52YXIgdHlwZU9mID0gcmVxdWlyZSgndHlwZScpO1xuXG4vKipcbiAqIFNldCBvciBnZXQgYGVsYCdzJyB2YWx1ZS5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gKiBAcGFyYW0ge01peGVkfSB2YWxcbiAqIEByZXR1cm4ge01peGVkfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGVsLCB2YWwpe1xuICBpZiAoMiA9PSBhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gc2V0KGVsLCB2YWwpO1xuICByZXR1cm4gZ2V0KGVsKTtcbn07XG5cbi8qKlxuICogR2V0IGBlbGAncyB2YWx1ZS5cbiAqL1xuXG5mdW5jdGlvbiBnZXQoZWwpIHtcbiAgc3dpdGNoICh0eXBlKGVsKSkge1xuICAgIGNhc2UgJ2NoZWNrYm94JzpcbiAgICBjYXNlICdyYWRpbyc6XG4gICAgICBpZiAoZWwuY2hlY2tlZCkge1xuICAgICAgICB2YXIgYXR0ciA9IGVsLmdldEF0dHJpYnV0ZSgndmFsdWUnKTtcbiAgICAgICAgcmV0dXJuIG51bGwgPT0gYXR0ciA/IHRydWUgOiBhdHRyO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIGNhc2UgJ3JhZGlvZ3JvdXAnOlxuICAgICAgZm9yICh2YXIgaSA9IDAsIHJhZGlvOyByYWRpbyA9IGVsW2ldOyBpKyspIHtcbiAgICAgICAgaWYgKHJhZGlvLmNoZWNrZWQpIHJldHVybiByYWRpby52YWx1ZTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3NlbGVjdCc6XG4gICAgICBmb3IgKHZhciBpID0gMCwgb3B0aW9uOyBvcHRpb24gPSBlbC5vcHRpb25zW2ldOyBpKyspIHtcbiAgICAgICAgaWYgKG9wdGlvbi5zZWxlY3RlZCkgcmV0dXJuIG9wdGlvbi52YWx1ZTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZWwudmFsdWU7XG4gIH1cbn1cblxuLyoqXG4gKiBTZXQgYGVsYCdzIHZhbHVlLlxuICovXG5cbmZ1bmN0aW9uIHNldChlbCwgdmFsKSB7XG4gIHN3aXRjaCAodHlwZShlbCkpIHtcbiAgICBjYXNlICdjaGVja2JveCc6XG4gICAgY2FzZSAncmFkaW8nOlxuICAgICAgaWYgKHZhbCkge1xuICAgICAgICBlbC5jaGVja2VkID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVsLmNoZWNrZWQgPSBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3JhZGlvZ3JvdXAnOlxuICAgICAgZm9yICh2YXIgaSA9IDAsIHJhZGlvOyByYWRpbyA9IGVsW2ldOyBpKyspIHtcbiAgICAgICAgcmFkaW8uY2hlY2tlZCA9IHJhZGlvLnZhbHVlID09PSB2YWw7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdzZWxlY3QnOlxuICAgICAgZm9yICh2YXIgaSA9IDAsIG9wdGlvbjsgb3B0aW9uID0gZWwub3B0aW9uc1tpXTsgaSsrKSB7XG4gICAgICAgIG9wdGlvbi5zZWxlY3RlZCA9IG9wdGlvbi52YWx1ZSA9PT0gdmFsO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIGVsLnZhbHVlID0gdmFsO1xuICB9XG59XG5cbi8qKlxuICogRWxlbWVudCB0eXBlLlxuICovXG5cbmZ1bmN0aW9uIHR5cGUoZWwpIHtcbiAgdmFyIGdyb3VwID0gJ2FycmF5JyA9PSB0eXBlT2YoZWwpIHx8ICdvYmplY3QnID09IHR5cGVPZihlbCk7XG4gIGlmIChncm91cCkgZWwgPSBlbFswXTtcbiAgdmFyIG5hbWUgPSBlbC5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpO1xuICB2YXIgdHlwZSA9IGVsLmdldEF0dHJpYnV0ZSgndHlwZScpO1xuXG4gIGlmIChncm91cCAmJiB0eXBlICYmICdyYWRpbycgPT0gdHlwZS50b0xvd2VyQ2FzZSgpKSByZXR1cm4gJ3JhZGlvZ3JvdXAnO1xuICBpZiAoJ2lucHV0JyA9PSBuYW1lICYmIHR5cGUgJiYgJ2NoZWNrYm94JyA9PSB0eXBlLnRvTG93ZXJDYXNlKCkpIHJldHVybiAnY2hlY2tib3gnO1xuICBpZiAoJ2lucHV0JyA9PSBuYW1lICYmIHR5cGUgJiYgJ3JhZGlvJyA9PSB0eXBlLnRvTG93ZXJDYXNlKCkpIHJldHVybiAncmFkaW8nO1xuICBpZiAoJ3NlbGVjdCcgPT0gbmFtZSkgcmV0dXJuICdzZWxlY3QnO1xuICByZXR1cm4gbmFtZTtcbn1cbiIsIlxuLyoqXG4gKiBDaGVjayBpZiBgZWxgIGlzIHdpdGhpbiB0aGUgZG9jdW1lbnQuXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbFxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZWwpIHtcbiAgdmFyIG5vZGUgPSBlbDtcbiAgd2hpbGUgKG5vZGUgPSBub2RlLnBhcmVudE5vZGUpIHtcbiAgICBpZiAobm9kZSA9PSBkb2N1bWVudCkgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufTsiLCJcbnZhciB0b1NwYWNlID0gcmVxdWlyZSgndG8tc3BhY2UtY2FzZScpO1xuXG5cbi8qKlxuICogRXhwb3NlIGB0b0NhbWVsQ2FzZWAuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSB0b0NhbWVsQ2FzZTtcblxuXG4vKipcbiAqIENvbnZlcnQgYSBgc3RyaW5nYCB0byBjYW1lbCBjYXNlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJpbmdcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuXG5cbmZ1bmN0aW9uIHRvQ2FtZWxDYXNlIChzdHJpbmcpIHtcbiAgcmV0dXJuIHRvU3BhY2Uoc3RyaW5nKS5yZXBsYWNlKC9cXHMoXFx3KS9nLCBmdW5jdGlvbiAobWF0Y2hlcywgbGV0dGVyKSB7XG4gICAgcmV0dXJuIGxldHRlci50b1VwcGVyQ2FzZSgpO1xuICB9KTtcbn0iLCJcbnZhciBleHRlbnNpYmxlID0gcmVxdWlyZSgnZXh0ZW5zaWJsZScpXG52YXIgbXMgPSByZXF1aXJlKCdwYXJzZS1kdXJhdGlvbicpXG52YXIgRW1pdHRlciA9IHJlcXVpcmUoJ2VtaXR0ZXInKVxudmFyIGVhc2UgPSByZXF1aXJlKCdlYXNlJylcbnZhciBub3cgPSByZXF1aXJlKCdub3cnKVxudmFyIHJhZiA9IHJlcXVpcmUoJ3JhZicpXG5cbm1vZHVsZS5leHBvcnRzID0gQW5pbWF0aW9uXG5cbmZ1bmN0aW9uIEFuaW1hdGlvbigpe31cblxuLyoqXG4gKiBtaXhpbiBtZXRob2RzXG4gKi9cblxuRW1pdHRlcihBbmltYXRpb24ucHJvdG90eXBlKVxuZXh0ZW5zaWJsZShBbmltYXRpb24pXG5cbi8qKlxuICogc2V0IGR1cmF0aW9uIHRvIGBuYCBtaWxsaXNlY29uZHMuIFlvdSBjYW4gYWxzb1xuICogcGFzcyBhIG5hdHVyYWwgbGFuZ3VhZ2Ugc3RyaW5nXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ8U3RyaW5nfSBuXG4gKiBAcmV0dXJuIHt0aGlzfVxuICovXG5cbkFuaW1hdGlvbi5wcm90b3R5cGUuZHVyYXRpb24gPSBmdW5jdGlvbihuKXtcbiAgaWYgKHR5cGVvZiBuID09ICdzdHJpbmcnKSBuID0gbXMobilcbiAgdGhpcy5fZHVyYXRpb24gPSBuXG4gIHJldHVybiB0aGlzXG59XG5cbi8qKlxuICogU2V0IGVhc2luZyBmdW5jdGlvbiB0byBgZm5gLlxuICpcbiAqICAgYW5pbWF0aW9uLmVhc2UoJ2luLW91dC1zaW5lJylcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge3RoaXN9XG4gKi9cblxuQW5pbWF0aW9uLnByb3RvdHlwZS5lYXNlID0gZnVuY3Rpb24oZm4pe1xuICBpZiAodHlwZW9mIGZuID09ICdzdHJpbmcnKSBmbiA9IGVhc2VbZm5dXG4gIGlmICghZm4pIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBlYXNpbmcgZnVuY3Rpb24nKVxuICB0aGlzLl9lYXNlID0gZm5cbiAgcmV0dXJuIHRoaXNcbn1cblxuQW5pbWF0aW9uLnByb3RvdHlwZS5lYXNlKCdsaW5lYXInKSAvLyBkZWZhdWx0XG5cbi8qKlxuICogcnVuIHRoZSBhbmltYXRpb24gd2l0aCBhbiBvcHRpb25hbCBkdXJhdGlvblxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfFN0cmluZ3xGdW5jdGlvbn0gW25dXG4gKiBAcmV0dXJuIHt0aGlzfVxuICovXG5cbkFuaW1hdGlvbi5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24obil7XG4gIGlmIChuICE9IG51bGwpIHRoaXMuZHVyYXRpb24obilcbiAgdmFyIGR1cmF0aW9uID0gdGhpcy5fZHVyYXRpb25cbiAgdmFyIHN0YXJ0ID0gbm93KClcbiAgdmFyIHNlbGYgPSB0aGlzXG4gIHJhZihmdW5jdGlvbiBsb29wKCl7XG4gICAgdmFyIHByb2dyZXNzID0gKG5vdygpIC0gc3RhcnQpIC8gZHVyYXRpb25cbiAgICBpZiAocHJvZ3Jlc3MgPj0gMSkge1xuICAgICAgc2VsZi5yZW5kZXIoMSlcbiAgICAgIHNlbGYucnVubmluZyA9IGZhbHNlXG4gICAgICBzZWxmLmVtaXQoJ2VuZCcpXG4gICAgfSBlbHNlIHtcbiAgICAgIHNlbGYucmVuZGVyKHByb2dyZXNzKVxuICAgICAgcmFmKGxvb3ApXG4gICAgfVxuICB9KVxuICB0aGlzLnJ1bm5pbmcgPSB0cnVlXG4gIHJldHVybiB0aGlzXG59XG4iLCJcbi8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL1xuXG52YXIgdHlwZSA9IHJlcXVpcmUoJ3R5cGUnKTtcblxuLyoqXG4gKiBDbG9uZXMgdmFsdWVzXG4gKlxuICogQHBhcmFtIHtNaXhlZH0gYW55IG9iamVjdFxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG9iail7XG4gIHJldHVybiBjbG9uZShvYmosIFtdLCBbXSk7XG59XG5cbi8qKlxuICogaW50ZXJuYWwgZGlzcGF0Y2hlci4gaWYgbm8gc3BlY2lmaWMgaGFuZGxlcnMgYXJlXG4gKiBhdmFpbGFibGUgYG9iamAgaXRzZWxmIHdpbGwgYmUgcmV0dXJuZWRcbiAqIFxuICogQHBhcmFtIHtYfSBvYmpcbiAqIEBwYXJhbSB7QXJyYXl9IHNlZW5cbiAqIEBwYXJhbSB7QXJyYXl9IGNvcGllc1xuICogQHJldHVybiB7WH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGNsb25lKG9iaiwgc2VlbiwgY29waWVzKXtcbiAgdmFyIGZuID0gaGFuZGxlW3R5cGUob2JqKV07XG4gIHJldHVybiBmbiA/IGZuKG9iaiwgc2VlbiwgY29waWVzKSA6IG9iajtcbn1cblxuLyoqXG4gKiB0eXBlIHNwZWNpZmljIGhhbmRsZXJzXG4gKiBcbiAqIEBwYXJhbSB7WH0gYVxuICogQHBhcmFtIHtBcnJheX0gc2VlblxuICogQHBhcmFtIHtBcnJheX0gY29waWVzXG4gKiBAcmV0dXJuIHtYfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxudmFyIGhhbmRsZSA9IHtcbiAgb2JqZWN0OiBmdW5jdGlvbihhLCBzZWVuLCBjb3BpZXMpe1xuICAgIHZhciBrID0gc2Vlbi5pbmRleE9mKGEpO1xuICAgIGlmIChrID49IDApIHJldHVybiBjb3BpZXNba107XG4gICAgdmFyIGNvcHkgPSBPYmplY3QuY3JlYXRlKGEpO1xuICAgIGNvcGllcy5wdXNoKGNvcHkpO1xuICAgIHNlZW4ucHVzaChhKTtcbiAgICBmb3IgKHZhciBrIGluIGEpIHtcbiAgICAgIGNvcHlba10gPSBjbG9uZShhW2tdLCBzZWVuLCBjb3BpZXMpO1xuICAgIH1cbiAgICByZXR1cm4gY29weTtcbiAgfSxcbiAgYXJyYXk6IGNvcHlBcnJheSxcbiAgYXJndW1lbnRzOiBjb3B5QXJyYXksXG4gIHJlZ2V4cDogZnVuY3Rpb24oYSl7XG4gICAgdmFyIGZsYWdzID0gJydcbiAgICAgICsgKGEubXVsdGlsaW5lID8gJ20nIDogJycpXG4gICAgICArIChhLmdsb2JhbCA/ICdnJyA6ICcnKVxuICAgICAgKyAoYS5pZ25vcmVDYXNlID8gJ2knIDogJycpXG4gICAgcmV0dXJuIG5ldyBSZWdFeHAoYS5zb3VyY2UsIGZsYWdzKTtcbiAgfSxcbiAgZGF0ZTogZnVuY3Rpb24oYSl7XG4gICAgcmV0dXJuIG5ldyBEYXRlKGEuZ2V0VGltZSgpKTtcbiAgfSxcbiAgc3RyaW5nOiB1bmJveCxcbiAgbnVtYmVyOiB1bmJveCxcbiAgYm9vbGVhbjogdW5ib3gsXG4gIGVsZW1lbnQ6IGZ1bmN0aW9uKGEsIHNlZW4sIGNvcGllcyl7XG4gICAgdmFyIGsgPSBzZWVuLmluZGV4T2YoYSk7XG4gICAgaWYgKGsgPj0gMCkgcmV0dXJuIGNvcGllc1trXTtcbiAgICB2YXIgY29weSA9IGEuY2xvbmVOb2RlKHRydWUpO1xuICAgIGNvcGllcy5wdXNoKGNvcHkpO1xuICAgIHNlZW4ucHVzaChhKTtcbiAgICByZXR1cm4gY29weTtcbiAgfVxufVxuXG5mdW5jdGlvbiB1bmJveChhKXsgcmV0dXJuIGEudmFsdWVPZigpIH1cblxuZnVuY3Rpb24gY29weUFycmF5KGEsIHNlZW4sIGNvcGllcyl7XG4gIHZhciBpID0gc2Vlbi5pbmRleE9mKGEpO1xuICBpZiAoaSA+PSAwKSByZXR1cm4gY29waWVzW2ldO1xuICB2YXIgY29weSA9IG5ldyBBcnJheShpID0gYS5sZW5ndGgpO1xuICBzZWVuLnB1c2goYSk7XG4gIGNvcGllcy5wdXNoKGNvcHkpO1xuICB3aGlsZSAoaS0tKSB7XG4gICAgY29weVtpXSA9IGNsb25lKGFbaV0sIHNlZW4sIGNvcGllcyk7XG4gIH1cbiAgcmV0dXJuIGNvcHk7XG59XG4iLCJcbnZhciBtZXJnZSA9IHJlcXVpcmUoJ21lcmdlJylcbnZhciBvd24gPSBPYmplY3QuaGFzT3duUHJvcGVydHlcbnZhciBjYWxsID0gRnVuY3Rpb24uY2FsbFxuXG5tb2R1bGUuZXhwb3J0cyA9IEVtaXR0ZXJcblxuLyoqXG4gKiBFbWl0dGVyIGNvbnN0cnVjdG9yLiBDYW4gb3B0aW9uYWxseSBhbHNvIGFjdCBhcyBhIG1peGluXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IFtvYmpdXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cblxuZnVuY3Rpb24gRW1pdHRlcihvYmope1xuXHRpZiAob2JqKSByZXR1cm4gbWVyZ2Uob2JqLCBFbWl0dGVyLnByb3RvdHlwZSlcbn1cblxuLyoqXG4gKiBQcm9jZXNzIGBldmVudGAuIEFsbCBhcmd1bWVudHMgYWZ0ZXIgYHRvcGljYCB3aWxsXG4gKiBiZSBwYXNzZWQgdG8gYWxsIGxpc3RlbmVyc1xuICpcbiAqICAgZW1pdHRlci5lbWl0KCdldmVudCcsIG5ldyBEYXRlKVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB0b3BpY1xuICogQHBhcmFtIHtBbnl9IFsuLi5hcmdzXVxuICogQHJldHVybiB7dGhpc31cbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24odG9waWMpe1xuXHR2YXIgc3ViID0gdGhpcy5fZXZlbnRzXG5cdGlmICghKHN1YiAmJiAoc3ViID0gc3ViW3RvcGljXSkpKSByZXR1cm4gdGhpc1xuXHQvLyBzaW5nbGUgc3Vic3JpcHRpb24gY2FzZVxuXHRpZiAodHlwZW9mIHN1YiA9PSAnZnVuY3Rpb24nKSB7XG5cdFx0Ly8gYXZvaWQgdXNpbmcgLmFwcGx5KCkgZm9yIHNwZWVkXG5cdFx0c3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG5cdFx0XHRjYXNlIDE6IHN1Yi5jYWxsKHRoaXMpO2JyZWFrXG5cdFx0XHRjYXNlIDI6IHN1Yi5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSk7YnJlYWtcblx0XHRcdGNhc2UgMzogc3ViLmNhbGwodGhpcywgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0pO2JyZWFrXG5cdFx0XHRjYXNlIDQ6IHN1Yi5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdLCBhcmd1bWVudHNbM10pO2JyZWFrXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHQvLyBgYXJndW1lbnRzYCBpcyBtYWdpYyA6KVxuXHRcdFx0XHR0b3BpYyA9IHRoaXNcblx0XHRcdFx0Y2FsbC5hcHBseShzdWIsIGFyZ3VtZW50cylcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0dmFyIGZuXG5cdFx0dmFyIGkgPSAwXG5cdFx0dmFyIGwgPSBzdWIubGVuZ3RoXG5cdFx0c3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG5cdFx0XHRjYXNlIDE6IHdoaWxlIChpIDwgbCkgc3ViW2krK10uY2FsbCh0aGlzKTticmVha1xuXHRcdFx0Y2FzZSAyOiB3aGlsZSAoaSA8IGwpIHN1YltpKytdLmNhbGwodGhpcywgYXJndW1lbnRzWzFdKTticmVha1xuXHRcdFx0Y2FzZSAzOiB3aGlsZSAoaSA8IGwpIHN1YltpKytdLmNhbGwodGhpcywgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0pO2JyZWFrXG5cdFx0XHRjYXNlIDQ6IHdoaWxlIChpIDwgbCkgc3ViW2krK10uY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSwgYXJndW1lbnRzWzNdKTticmVha1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0dG9waWMgPSB0aGlzXG5cdFx0XHRcdHdoaWxlIChpIDwgbCkgY2FsbC5hcHBseShzdWJbaSsrXSwgYXJndW1lbnRzKVxuXHRcdH1cblx0fVxuXHRyZXR1cm4gdGhpc1xufVxuXG4vKipcbiAqIEFkZCBhIHN1YnNjcmlwdGlvbiB1bmRlciBhIHRvcGljIG5hbWVcbiAqXG4gKiAgIGVtaXR0ZXIub24oJ2V2ZW50JywgZnVuY3Rpb24oZGF0YSl7fSlcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdG9waWNcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHt0aGlzfVxuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLm9uID0gZnVuY3Rpb24odG9waWMsIGZuKXtcblx0aWYgKCFvd24uY2FsbCh0aGlzLCAnX2V2ZW50cycpKSB0aGlzLl9ldmVudHMgPSBjbG9uZSh0aGlzLl9ldmVudHMpXG5cdHZhciBldmVudHMgPSB0aGlzLl9ldmVudHNcblx0aWYgKHR5cGVvZiBldmVudHNbdG9waWNdID09ICdmdW5jdGlvbicpIHtcblx0XHRldmVudHNbdG9waWNdID0gW2V2ZW50c1t0b3BpY10sIGZuXVxuXHR9IGVsc2UgaWYgKGV2ZW50c1t0b3BpY10pIHtcblx0XHRldmVudHNbdG9waWNdID0gZXZlbnRzW3RvcGljXS5jb25jYXQoZm4pXG5cdH0gZWxzZSB7XG5cdFx0ZXZlbnRzW3RvcGljXSA9IGZuXG5cdH1cblx0cmV0dXJuIHRoaXNcbn1cblxuLyoqXG4gKiBSZW1vdmUgc3Vic2NyaXB0aW9uc1xuICpcbiAqICAgZW1pdHRlci5vZmYoKSAgICAgICAgICAgIC8vIGNsZWFycyBhbGwgbGlzdGVuZXJzXG4gKiAgIGVtaXR0ZXIub2ZmKCd0b3BpYycpICAgICAvLyBjbGVhcnMgYWxsIGB0b3BpY2AgbGlzdGVuZXJzXG4gKiAgIGVtaXR0ZXIub2ZmKCd0b3BpYycsIGZuKSAvLyBhcyBhYm92ZSBidXQgb25seSB3aGVyZSBgbGlzdGVuZXIgPT0gZm5gXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IFt0b3BpY11cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtmbl1cbiAqIEByZXR1cm4ge3RoaXN9XG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUub2ZmID0gZnVuY3Rpb24odG9waWMsIGZuKXtcblx0aWYgKCF0aGlzLl9ldmVudHMpIHJldHVybiB0aGlzXG5cdGlmICghb3duLmNhbGwodGhpcywgJ19ldmVudHMnKSkgdGhpcy5fZXZlbnRzID0gY2xvbmUodGhpcy5fZXZlbnRzKVxuXHR2YXIgZXZlbnRzID0gdGhpcy5fZXZlbnRzXG5cblx0aWYgKHRvcGljID09IG51bGwpIHtcblx0XHRmb3IgKHZhciBpIGluIGV2ZW50cykgZGVsZXRlIGV2ZW50c1tpXVxuXHR9IGVsc2UgaWYgKGZuID09IG51bGwpIHtcblx0XHRkZWxldGUgZXZlbnRzW3RvcGljXVxuXHR9IGVsc2Uge1xuXHRcdHZhciBzdWJzID0gZXZlbnRzW3RvcGljXVxuXHRcdGlmICghc3VicykgcmV0dXJuIHRoaXNcblx0XHRpZiAodHlwZW9mIHN1YnMgPT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0aWYgKHN1YnMgPT09IGZuKSBkZWxldGUgZXZlbnRzW3RvcGljXVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRzdWJzID0gZXZlbnRzW3RvcGljXSA9IHN1YnMuZmlsdGVyKGZ1bmN0aW9uKGxpc3RlbmVyKXtcblx0XHRcdFx0cmV0dXJuIGxpc3RlbmVyICE9PSBmblxuXHRcdFx0fSlcblx0XHRcdC8vIHRpZHlcblx0XHRcdGlmIChzdWJzLmxlbmd0aCA9PSAxKSBldmVudHNbdG9waWNdID0gc3Vic1swXVxuXHRcdFx0ZWxzZSBpZiAoIXN1YnMubGVuZ3RoKSBkZWxldGUgZXZlbnRzW3RvcGljXVxuXHRcdH1cblx0fVxuXHRyZXR1cm4gdGhpc1xufVxuXG4vKipcbiAqIHN1YnNjcmliZSBgZm5gIGJ1dCByZW1vdmUgaWYgYWZ0ZXIgaXRzIGZpcnN0IGludm9jYXRpb25cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdG9waWNcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHt0aGlzfVxuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbih0b3BpYywgZm4pe1xuXHR2YXIgc2VsZiA9IHRoaXNcblx0cmV0dXJuIHRoaXMub24odG9waWMsIGZ1bmN0aW9uIG9uY2UoKXtcblx0XHRzZWxmLm9mZih0b3BpYywgb25jZSlcblx0XHRmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG5cdH0pXG59XG5cbi8qKlxuICogc2VlIGlmIGBlbWl0dGVyYCBoYXMgYW55IHN1YnNjcmlwdGlvbnMgbWF0Y2hpbmdcbiAqIGB0b3BpY2AgYW5kIG9wdGlvbmFsbHkgYWxzbyBgZm5gXG4gKlxuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyXG4gKiBAcGFyYW0ge1N0cmluZ30gdG9waWNcbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtmbl1cbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cblxuRW1pdHRlci5oYXNTdWJzY3JpcHRpb24gPSBmdW5jdGlvbihlbWl0dGVyLCB0b3BpYywgZm4pe1xuXHR2YXIgZm5zID0gRW1pdHRlci5zdWJzY3JpcHRpb25zKGVtaXR0ZXIsIHRvcGljKVxuXHRpZiAoZm4gPT0gbnVsbCkgcmV0dXJuIEJvb2xlYW4oZm5zLmxlbmd0aClcblx0cmV0dXJuIGZucy5pbmRleE9mKGZuKSA+PSAwXG59XG5cbi8qKlxuICogZ2V0IGFuIEFycmF5IG9mIHN1YnNjcmlwdGlvbnMgZm9yIGB0b3BpY2BcbiAqXG4gKiBAcGFyYW0ge0VtaXR0ZXJ9IGVtaXR0ZXJcbiAqIEBwYXJhbSB7U3RyaW5nfSB0b3BpY1xuICogQHJldHVybiB7QXJyYXl9XG4gKi9cblxuRW1pdHRlci5zdWJzY3JpcHRpb25zID0gZnVuY3Rpb24oZW1pdHRlciwgdG9waWMpe1xuXHR2YXIgZm5zID0gZW1pdHRlci5fZXZlbnRzXG5cdGlmICghZm5zIHx8ICEoZm5zID0gZm5zW3RvcGljXSkpIHJldHVybiBbXVxuXHRpZiAodHlwZW9mIGZucyA9PSAnZnVuY3Rpb24nKSByZXR1cm4gW2Zuc11cblx0cmV0dXJuIGZucy5zbGljZSgpXG59XG5cbmZ1bmN0aW9uIGNsb25lKG9iail7XG5cdHJldHVybiBtZXJnZSh7fSwgb2JqKVxufVxuIiwiXG4vKipcbiAqIGRlcGVuZGVuY2llc1xuICovXG5cbnZhciBpbmhlcml0ID0gcmVxdWlyZSgnaW5oZXJpdCcpO1xudmFyIG1lcmdlID0gcmVxdWlyZSgnbWVyZ2UnKTtcblxuLyoqXG4gKiBFeHBvcnQgYGV4dGVuc2libGVgXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBleHRlbnNpYmxlO1xuXG4vKipcbiAqIE1ha2UgdGhlIGdpdmVuIGBBYCBleHRlbnNpYmxlLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IEFcbiAqIEByZXR1cm4ge0F9XG4gKi9cblxuZnVuY3Rpb24gZXh0ZW5zaWJsZShBKXtcbiAgQS5leHRlbmQgPSBleHRlbmQ7XG4gIHJldHVybiBBO1xufTtcblxuLyoqXG4gKiBtYWtlIGBjaGlsZGAgaW5oZXJpdCBmcm9tIGB0aGlzYC4gVW5sZXNzIGBmaW5hbGAsXG4gKiBgY2hpbGRgIHdpbGwgYWxzbyBiZSBtYWRlIGV4dGVuc2libGUuIElmIHlvdSBkb24ndCBcbiAqIHBhc3MgYSBgY2hpbGRgIGEgbmV3IG9uZSB3aWxsIGJlIGNyZWF0ZWQuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2NoaWxkXVxuICogQHBhcmFtIHtCb29sZWFufSBbZmluYWxdXG4gKiBAcmV0dXJuIHtjaGlsZH1cbiAqL1xuXG5mdW5jdGlvbiBleHRlbmQoY2hpbGQsIGZpbmFsKXtcbiAgdmFyIEEgPSB0aGlzO1xuICB2YXIgQiA9ICdmdW5jdGlvbicgIT0gdHlwZW9mIGNoaWxkXG4gICAgPyBmdW5jdGlvbigpeyBBLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7IH1cbiAgICA6IGNoaWxkO1xuICAhZmluYWwgJiYgZXh0ZW5zaWJsZShCKTtcbiAgaW5oZXJpdChCLCBBKTtcbiAgaWYgKCdvYmplY3QnID09IHR5cGVvZiBjaGlsZCkgbWVyZ2UoQi5wcm90b3R5cGUsIGNoaWxkKTtcbiAgcmV0dXJuIEI7XG59O1xuIiwiXG52YXIgcXVlcnkgPSByZXF1aXJlKCdxdWVyeScpXG52YXIgTW92ZSA9IHJlcXVpcmUoJy4vbW92ZScpXG52YXIgU1ZHID0gcmVxdWlyZSgnLi9zdmcnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGVsKXtcbiAgaWYgKHR5cGVvZiBlbCA9PSAnc3RyaW5nJykgZWwgPSBxdWVyeShlbClcbiAgaWYgKGVsIGluc3RhbmNlb2YgU1ZHRWxlbWVudCkgcmV0dXJuIG5ldyBTVkcoZWwpXG4gIHJldHVybiBuZXcgTW92ZShlbClcbn1cbiIsIlxudmFyIEFuaW1hdGlvbiA9IHJlcXVpcmUoJ2FuaW1hdGlvbicpXG52YXIgbGF6eSA9IHJlcXVpcmUoJ2xhenktcHJvcGVydHknKVxudmFyIHVubWF0cml4ID0gcmVxdWlyZSgndW5tYXRyaXgnKVxudmFyIHR3ZWVuID0gcmVxdWlyZSgnLi90d2VlbicpXG52YXIgcHJlZml4ID0gcmVxdWlyZSgncHJlZml4JylcbnZhciBjbG9uZSA9IHJlcXVpcmUoJ2Nsb25lJylcblxubW9kdWxlLmV4cG9ydHMgPSBNb3ZlXG5cbi8qKlxuICogJ3dlYmtpdFRyYW5zZm9ybScgfHwgJ01velRyYW5zZm9ybScgZXRjLi5cbiAqIEB0eXBlIHtTdHJpbmd9XG4gKi9cblxudmFyIHRyYW5zZm9ybSA9IHByZWZpeCgndHJhbnNmb3JtJylcblxuLyoqXG4gKiB0aGUgTW92ZSBjbGFzc1xuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gTW92ZShlbCl7XG4gIHRoaXMuX3RvID0ge31cbiAgdGhpcy5lbCA9IGVsXG59XG5cbi8qKlxuICogaW5oZXJpdCBmcm9tIEFuaW1hdGlvblxuICovXG5cbkFuaW1hdGlvbi5leHRlbmQoTW92ZSlcblxuLyoqXG4gKiBkZWZhdWx0IGR1cmF0aW9uXG4gKi9cblxuTW92ZS5wcm90b3R5cGUuZHVyYXRpb24oJzMwMG1zJylcblxuLyoqXG4gKiBhZGQgYHByb3BgIHRvIGFuaW1hdGlvbi4gV2hlbiB0aGUgYW5pbWF0aW9uIGlzIHJ1blxuICogYHByb3BgIHdpbGwgYmUgdHdlZW5lZCBmcm9tIGl0cyBjdXJyZW50IHZhbHVlIHRvIGB0b2BcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gcHJvcFxuICogQHBhcmFtIHtDU1N9IHRvXG4gKiBAcmV0dXJuIHt0aGlzfVxuICovXG5cbk1vdmUucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uKHByb3AsIHRvKXtcbiAgdGhpcy5fdG9bcHJlZml4KHByb3ApXSA9IHRvXG4gIHJldHVybiB0aGlzXG59XG5cbi8qKlxuICogaW5jcmVtZW50IGBwcm9wYCBieSBgbmBcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gcHJvcFxuICogQHBhcmFtIHtOdW1iZXJ9IHRvXG4gKiBAcmV0dXJuIHt0aGlzfVxuICovXG5cbk1vdmUucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uKHByb3AsIG4pe1xuICBwcm9wID0gcHJlZml4KHByb3ApXG4gIHZhciBjdXJyID0gcGFyc2VJbnQodGhpcy5jdXJyZW50KHByb3ApLCAxMClcbiAgcmV0dXJuIHRoaXMuc2V0KHByb3AsIGN1cnIgKyBuKVxufVxuXG4vKipcbiAqIGRlY3JlbWVudCBgcHJvcGAgYnkgYG5gXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHByb3BcbiAqIEBwYXJhbSB7TnVtYmVyfSB0b1xuICogQHJldHVybiB7dGhpc31cbiAqL1xuXG5Nb3ZlLnByb3RvdHlwZS5zdWIgPSBmdW5jdGlvbihwcm9wLCBuKXtcbiAgcHJvcCA9IHByZWZpeChwcm9wKVxuICB2YXIgY3VyciA9IHBhcnNlSW50KHRoaXMuY3VycmVudChwcm9wKSwgMTApXG4gIHJldHVybiB0aGlzLnNldChwcm9wLCBjdXJyIC0gbilcbn1cblxuLyoqXG4gKiBnZXQgdGhlIGN1cnJlbnQgdmFsdWUgb2YgYHByb3BgXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHByb3BcbiAqIEByZXR1cm4ge0NTU31cbiAqL1xuXG5Nb3ZlLnByb3RvdHlwZS5jdXJyZW50ID0gZnVuY3Rpb24ocHJvcCl7XG4gIHJldHVybiBnZXRDb21wdXRlZFN0eWxlKHRoaXMuZWwpW3Byb3BdXG59XG5cbi8qKlxuICogU2tldyBieSBgZGVnYFxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBkZWdcbiAqIEByZXR1cm4ge3RoaXN9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbk1vdmUucHJvdG90eXBlLnNrZXcgPSBmdW5jdGlvbihkZWcpe1xuICB0aGlzLm1hdHJpeC5za2V3ICs9IGRlZ1xuICByZXR1cm4gdGhpc1xufVxuXG4vKipcbiAqIFRyYW5zbGF0ZSBgeGAgYW5kIGB5YCBheGlzLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSB4XG4gKiBAcGFyYW0ge051bWJlcn0geVxuICogQHBhcmFtIHtOdW1iZXJ9IHpcbiAqIEByZXR1cm4ge3RoaXN9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbk1vdmUucHJvdG90eXBlLnRyYW5zbGF0ZSA9IGZ1bmN0aW9uKHgsIHkpe1xuICB0aGlzLm1hdHJpeC50cmFuc2xhdGVYICs9IHhcbiAgdGhpcy5tYXRyaXgudHJhbnNsYXRlWSArPSB5XG4gIHJldHVybiB0aGlzXG59XG5cbi8qKlxuICogVHJhbnNsYXRlIG9uIHRoZSB4IGF4aXMgdG8gYG5gLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBuXG4gKiBAcmV0dXJuIHt0aGlzfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5Nb3ZlLnByb3RvdHlwZS50cmFuc2xhdGVYID1cbk1vdmUucHJvdG90eXBlLnggPSBmdW5jdGlvbihuKXtcbiAgcmV0dXJuIHRoaXMudHJhbnNsYXRlKG4sIDApXG59XG5cbi8qKlxuICogVHJhbnNsYXRlIG9uIHRoZSB5IGF4aXMgdG8gYG5gLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBuXG4gKiBAcmV0dXJuIHt0aGlzfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5Nb3ZlLnByb3RvdHlwZS50cmFuc2xhdGVZID1cbk1vdmUucHJvdG90eXBlLnkgPSBmdW5jdGlvbihuKXtcbiAgcmV0dXJuIHRoaXMudHJhbnNsYXRlKDAsIG4pXG59XG5cbi8qKlxuICogU2NhbGUgdGhlIHggYW5kIHkgYXhpcyBieSBgeGAsIG9yXG4gKiBpbmRpdmlkdWFsbHkgc2NhbGUgYHhgIGFuZCBgeWAuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IHhcbiAqIEBwYXJhbSB7TnVtYmVyfSB5XG4gKiBAcmV0dXJuIHt0aGlzfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5Nb3ZlLnByb3RvdHlwZS5zY2FsZSA9IGZ1bmN0aW9uKHgsIHkpe1xuICBpZiAoeSA9PSBudWxsKSB5ID0geFxuICB0aGlzLm1hdHJpeC5zY2FsZVggKj0geFxuICB0aGlzLm1hdHJpeC5zY2FsZVkgKj0geVxuICByZXR1cm4gdGhpc1xufVxuXG4vKipcbiAqIFNjYWxlIHggYXhpcyBieSBgbmAuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IG5cbiAqIEByZXR1cm4ge3RoaXN9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbk1vdmUucHJvdG90eXBlLnNjYWxlWCA9IGZ1bmN0aW9uKG4pe1xuICByZXR1cm4gdGhpcy5zY2FsZShuLCAxLCAxKVxufVxuXG4vKipcbiAqIFNjYWxlIHkgYXhpcyBieSBgbmAuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IG5cbiAqIEByZXR1cm4ge3RoaXN9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbk1vdmUucHJvdG90eXBlLnNjYWxlWSA9IGZ1bmN0aW9uKG4pe1xuICByZXR1cm4gdGhpcy5zY2FsZSgxLCBuLCAxKVxufVxuXG4vKipcbiAqIFJvdGF0ZSBgbmAgZGVncmVlcy5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gblxuICogQHJldHVybiB7dGhpc31cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuTW92ZS5wcm90b3R5cGUucm90YXRlID0gZnVuY3Rpb24obil7XG4gIHRoaXMubWF0cml4LnJvdGF0ZSArPSBuXG4gIHJldHVybiB0aGlzXG59XG5cbi8qKlxuICogY3NzIHRyYW5zZm9ybWF0aW9uIG1hdHJpeCBmb3IgYHRoaXMuZWxgXG4gKlxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxubGF6eShNb3ZlLnByb3RvdHlwZSwgJ21hdHJpeCcsIGZ1bmN0aW9uKCl7XG4gIHZhciBtYXRyaXggPSB0aGlzLmN1cnJlbnQodHJhbnNmb3JtKVxuICBpZiAodHlwZW9mIG1hdHJpeCA9PSAnc3RyaW5nJykgbWF0cml4ID0gdW5tYXRyaXgobWF0cml4KVxuICB0aGlzLl90b1t0cmFuc2Zvcm1dID0gbWF0cml4XG4gIHJldHVybiBtYXRyaXhcbn0pXG5cbi8qKlxuICogZ2VuZXJhdGVkIHR3ZWVuaW5nIGZ1bmN0aW9uc1xuICpcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmxhenkoTW92ZS5wcm90b3R5cGUsICd0d2VlbnMnLCBmdW5jdGlvbigpe1xuICB2YXIgdHdlZW5zID0ge31cbiAgZm9yICh2YXIga2V5IGluIHRoaXMuX3RvKSB7XG4gICAgdHdlZW5zW2tleV0gPSB0d2VlbihrZXksIHRoaXMuY3VycmVudChrZXkpLCB0aGlzLl90b1trZXldKVxuICB9XG4gIHJldHVybiB0d2VlbnNcbn0pXG5cbi8qKlxuICogcmVuZGVyIHRoZSBhbmltYXRpb24gYXQgY29tcGxldGlvbiBsZXZlbCBgbmBcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gblxuICogQHJldHVybiB7dGhpc31cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuTW92ZS5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24obil7XG4gIG4gPSB0aGlzLl9lYXNlKG4pXG4gIHZhciB0d2VlbnMgPSB0aGlzLnR3ZWVuc1xuICB2YXIgc3R5bGUgPSB0aGlzLmVsLnN0eWxlXG4gIGZvciAodmFyIGsgaW4gdHdlZW5zKSBzdHlsZVtrXSA9IHR3ZWVuc1trXShuKVxuICByZXR1cm4gdGhpc1xufVxuXG4vKipcbiAqIENyZWF0ZSBhIG5ldyBNb3ZlIGluc3RhbmNlIHdoaWNoIHdpbGwgcnVuXG4gKiB3aGVuIGB0aGlzYCBtb3ZlIGNvbXBsZXRlcy4gT3B0aW9uYWxseSB5b3UgY2FuXG4gKiBwYXNzIGluIGEgTW92ZSBpbnN0YW5jZSBvciBGdW5jdGlvbiB0byBiZSBydW5cbiAqIG9uIGNvbXBsZXRpb24gb2YgYHRoaXNgIGFuaW1hdGlvbi5cbiAqXG4gKiBAcGFyYW0ge01vdmV8RnVuY3Rpb259IFttb3ZlXVxuICogQHJldHVybiB7dGhpc3xEZWZlcnJlZE1vdmV9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbk1vdmUucHJvdG90eXBlLnRoZW4gPSBmdW5jdGlvbihtb3ZlKXtcbiAgaWYgKG1vdmUpIHtcbiAgICB2YXIgZm4gID0gdHlwZW9mIG1vdmUgIT0gJ2Z1bmN0aW9uJ1xuICAgICAgPyBmdW5jdGlvbigpeyBtb3ZlLnJ1bigpIH1cbiAgICAgIDogbW92ZVxuICAgIHRoaXMub24oJ2VuZCcsIGZuKVxuICAgIHRoaXMucnVubmluZyB8fCB0aGlzLnBhcmVudCB8fCB0aGlzLnJ1bigpXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuICBtb3ZlID0gZGVmZXIodGhpcylcbiAgdGhpcy50aGVuKG1vdmUpXG4gIHJldHVybiBtb3ZlXG59XG5cbi8qKlxuICogY3JlYXRlIGEgc3BlY2lhbGl6ZWQgc3ViLWNsYXNzIG9mIGBNb3ZlYCBmb3IgdXNlXG4gKiBpbiBgdGhlbigpYFxuICpcbiAqIEBwYXJhbSB7TW92ZX0gcGFyZW50XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBkZWZlcihwYXJlbnQpe1xuICB2YXIgY2hpbGQgPSBuZXcgcGFyZW50LmNvbnN0cnVjdG9yKHBhcmVudC5lbClcbiAgY2hpbGQuX2R1cmF0aW9uID0gcGFyZW50Ll9kdXJhdGlvblxuICBjaGlsZC5fZWFzZSA9IHBhcmVudC5fZWFzZVxuICBjaGlsZC5wYXJlbnQgPSBwYXJlbnRcbiAgY2hpbGQuY3VycmVudCA9IGZ1bmN0aW9uKHByb3Ape1xuICAgIHZhciBhbmltID0gdGhpcy5wYXJlbnRcbiAgICBkbyBpZiAocHJvcCBpbiBhbmltLl90bykgcmV0dXJuIGNsb25lKGFuaW0uX3RvW3Byb3BdKVxuICAgIHdoaWxlIChhbmltID0gYW5pbS5wYXJlbnQpXG4gICAgcmV0dXJuIHRoaXMuY29uc3RydWN0b3IucHJvdG90eXBlLmN1cnJlbnQuY2FsbCh0aGlzLCBwcm9wKVxuICB9XG4gIHJldHVybiBjaGlsZFxufVxuIiwiXG52YXIgcHJlZml4ID0gcmVxdWlyZSgncHJlZml4JylcbnZhciBNb3ZlID0gcmVxdWlyZSgnLi9tb3ZlJylcblxudmFyIGF0dHJzID0gW1xuICAnY3gnLCAnY3knLFxuICAneCcsICAneScsXG4gICdkJ1xuXS5yZWR1Y2UoZnVuY3Rpb24oYXR0cnMsIGtleSl7XG4gIGF0dHJzW2tleV0gPSB0cnVlXG4gIHJldHVybiBhdHRyc1xufSwge30pXG5cbm1vZHVsZS5leHBvcnRzID0gTW92ZS5leHRlbmQoe1xuICBzZXQ6IGZ1bmN0aW9uKGssIHYpe1xuICAgIGlmICghKGsgaW4gYXR0cnMpKSBrID0gcHJlZml4KGspXG4gICAgdGhpcy5fdG9ba10gPSB2XG4gICAgcmV0dXJuIHRoaXNcbiAgfSxcbiAgY3VycmVudDogZnVuY3Rpb24oayl7XG4gICAgaWYgKGsgaW4gYXR0cnMpIHJldHVybiB0aGlzLmVsLmdldEF0dHJpYnV0ZShrKVxuICAgIHJldHVybiBnZXRDb21wdXRlZFN0eWxlKHRoaXMuZWwpW3ByZWZpeChrKV1cbiAgICAgIHx8IHRoaXMuZWwuZ2V0QXR0cmlidXRlKGspXG4gIH0sXG4gIHJlbmRlcjogZnVuY3Rpb24obil7XG4gICAgbiA9IHRoaXMuX2Vhc2UobilcbiAgICB2YXIgdHdlZW5zID0gdGhpcy50d2VlbnNcbiAgICB2YXIgc3R5bGUgPSB0aGlzLmVsLnN0eWxlXG4gICAgZm9yICh2YXIgayBpbiB0d2VlbnMpIHtcbiAgICAgIGlmIChrIGluIGF0dHJzKSB0aGlzLmVsLnNldEF0dHJpYnV0ZShrLCB0d2VlbnNba10obikpXG4gICAgICBlbHNlIHRoaXMuZWwuc3R5bGVba10gPSB0d2VlbnNba10obilcbiAgICB9XG4gICAgLy8gSEFDSzogZm9yY2UgcmVkcmF3IGJlY2F1c2UgY2hyb21lIGhhcyBzb21lIGJ1Z2d5IG9wdGltaXNhdGlvbnNcbiAgICB0aGlzLmVsLm9mZnNldEhlaWdodCBcbiAgICByZXR1cm4gdGhpc1xuICB9XG59KVxuIiwiXG52YXIgcGFyc2UgPSByZXF1aXJlKCdjb2xvci1wYXJzZXInKVxudmFyIHJvdW5kID0gTWF0aC5yb3VuZFxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGZyb20sIHRvKXtcbiAgZnJvbSA9IHJnYmEoZnJvbSlcbiAgdG8gPSByZ2JhKHRvKVxuICB2YXIgY3VyciA9IHRvLnNsaWNlKClcbiAgcmV0dXJuIGZ1bmN0aW9uIGZyYW1lKG4pe1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMzsgaSsrKSB7XG4gICAgICBjdXJyW2ldID0gcm91bmQoZnJvbVtpXSArICh0b1tpXSAtIGZyb21baV0pICogbilcbiAgICB9XG4gICAgLy8gZG9uJ3Qgcm91bmQgYWxwaGFcbiAgICBjdXJyWzNdID0gZnJvbVtpXSArICh0b1tpXSAtIGZyb21baV0pICogblxuICAgIHJldHVybiAncmdiYSgnICsgY3VyciArICcpJ1xuICB9XG59XG5cbmZ1bmN0aW9uIHJnYmEoY29sb3Ipe1xuICBjb2xvciA9IHBhcnNlKGNvbG9yKVxuICBpZiAoIWNvbG9yKSByZXR1cm4gWzI1NSwyNTUsMjU1LDBdIC8vIHRyYW5zcGFyZW50XG4gIHJldHVybiBbXG4gICAgY29sb3IucixcbiAgICBjb2xvci5nLFxuICAgIGNvbG9yLmIsXG4gICAgKGNvbG9yLmEgPT0gbnVsbCA/IDEgOiBjb2xvci5hKVxuICBdXG59XG4iLCJcbnZhciBwYXJzZUNvbG9yID0gcmVxdWlyZSgnY29sb3ItcGFyc2VyJylcbnZhciBwcmVmaXggPSByZXF1aXJlKCdwcmVmaXgnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IHR3ZWVuXG5cbnZhciBkZWZhdWx0VHlwZXMgPSB7XG4gIGZpbGxPcGFjaXR5OiAnbnVtYmVyJyxcbiAgZm9udFdlaWdodDogJ251bWJlcicsXG4gIG9wYWNpdHk6ICdudW1iZXInLFxuICB6SW5kZXg6ICdudW1iZXInLFxuICB6b29tOiAnbnVtYmVyJyxcbiAgdHJhbnNmb3JtOiAnbWF0cml4JyxcbiAgZDogJ3BhdGgnXG59XG5cbmRlZmF1bHRUeXBlc1twcmVmaXgoJ3RyYW5zZm9ybScpXSA9ICdtYXRyaXgnXG5cbi8qKlxuICogY3JlYXRlIGEgdHdlZW4gZnVuY3Rpb25cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gcHJvcFxuICogQHBhcmFtIHtBbnl9IGZyb21cbiAqIEBwYXJhbSB7QW55fSB0b1xuICogQHJldHVybiB7RnVuY3Rpb259XG4gKi9cblxuZnVuY3Rpb24gdHdlZW4ocHJvcCwgZnJvbSwgdG8pe1xuICB2YXIgZm4gPSB0eXBlb2YgdG8gPT0gJ3N0cmluZycgJiYgdHdlZW5bdHlwZSh0byldXG4gIGlmICghZm4pIGZuID0gdHdlZW5bZGVmYXVsdFR5cGVzW3Byb3BdIHx8ICdweCddXG4gIHJldHVybiBmbihmcm9tLCB0bylcbn1cblxudHdlZW4ubnVtYmVyID0gcmVxdWlyZSgnLi9udW1iZXInKVxudHdlZW4ubWF0cml4ID0gcmVxdWlyZSgnLi9tYXRyaXgnKVxudHdlZW4uY29sb3IgPSByZXF1aXJlKCcuL2NvbG9yJylcbnR3ZWVuLnBhdGggPSByZXF1aXJlKCcuL3BhdGgnKVxudHdlZW4ucHggPSByZXF1aXJlKCcuL3B4JylcblxuLyoqXG4gKiBkZXRlcm1pbmUgdHlwZSBvZiBgY3NzYCB2YWx1ZVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBjc3NcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHR5cGUoY3NzKXtcbiAgaWYgKC9ebWF0cml4KDNkKT9cXChbXildKlxcKSQvLnRlc3QoY3NzKSkgcmV0dXJuICdtYXRyaXgnXG4gIGlmICgvXlstLlxcZF0rcHgvLnRlc3QoY3NzKSkgcmV0dXJuICdweCdcbiAgaWYgKHBhcnNlQ29sb3IoY3NzKSkgcmV0dXJuICdjb2xvcidcbn1cbiIsIlxudmFyIHR3ZWVuID0gcmVxdWlyZSgnc3RyaW5nLXR3ZWVuJylcbnZhciB1bm1hdHJpeCA9IHJlcXVpcmUoJ3VubWF0cml4JylcbnZhciBrZXlzID0gT2JqZWN0LmtleXNcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihmcm9tLCB0byl7XG4gIHJldHVybiB0d2Vlbihub3JtYWxpemUoZnJvbSksIG5vcm1hbGl6ZSh0bykpXG59XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZShtKXtcbiAgaWYgKHR5cGVvZiBtID09ICdzdHJpbmcnKSBtID0gdW5tYXRyaXgobSlcbiAgcmV0dXJuIGtleXModW5pdCkucmVkdWNlKGZ1bmN0aW9uKHN0ciwga2V5KXtcbiAgICByZXR1cm4gc3RyICsga2V5ICsgJygnICsgbVtrZXldICsgdW5pdFtrZXldICsgJyknXG4gIH0sICcnKVxufVxuXG52YXIgdW5pdCA9IHtcbiAgdHJhbnNsYXRlWDogJ3B4JyxcbiAgdHJhbnNsYXRlWTogJ3B4JyxcbiAgcm90YXRlOiAnZGVnJyxcbiAgc2tldzogJ2RlZycsXG4gIHNjYWxlWDogJycsXG4gIHNjYWxlWTogJydcbn0iLCJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZnJvbSwgdG8pe1xuICBmcm9tID0gcGFyc2VGbG9hdChmcm9tLCAxMCkgfHwgMFxuICB0byA9IHBhcnNlRmxvYXQodG8sIDEwKSB8fCAwXG4gIHJldHVybiBmdW5jdGlvbiBmcmFtZShuKXtcbiAgICByZXR1cm4gZnJvbSArICh0byAtIGZyb20pICogblxuICB9XG59XG4iLCJcbnZhciB0b1N0cmluZyA9IHJlcXVpcmUoJ3NlcmlhbGl6ZS1zdmctcGF0aCcpXG52YXIgYmFsYW5jZSA9IHJlcXVpcmUoJ2JhbGFuY2Utc3ZnLXBhdGhzJylcbnZhciB0d2VlbiA9IHJlcXVpcmUoJ3N0cmluZy10d2VlbicpXG52YXIgbm9ybWFsaXplID0gcmVxdWlyZSgnZmNvbXAnKShcbiAgcmVxdWlyZSgncGFyc2Utc3ZnLXBhdGgnKSxcbiAgcmVxdWlyZSgnYWJzLXN2Zy1wYXRoJyksXG4gIHJlcXVpcmUoJ25vcm1hbGl6ZS1zdmctcGF0aCcpLFxuICByZXF1aXJlKCdyZWwtc3ZnLXBhdGgnKSlcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihmcm9tLCB0byl7XG4gIHZhciBlbmRzID0gYmFsYW5jZShub3JtYWxpemUoZnJvbSksIG5vcm1hbGl6ZSh0bykpXG4gIHJldHVybiB0d2Vlbih0b1N0cmluZyhlbmRzWzBdKSwgdG9TdHJpbmcoZW5kc1sxXSkpXG59XG4iLCJcbnZhciB0d2VlbiA9IHJlcXVpcmUoJy4vbnVtYmVyJylcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihmcm9tLCB0byl7XG4gIHZhciBmcmFtZSA9IHR3ZWVuKGZyb20sIHRvKVxuICByZXR1cm4gZnVuY3Rpb24obil7XG4gICAgcmV0dXJuIGZyYW1lKG4pLnRvRml4ZWQoMSkgKyAncHgnXG4gIH1cbn1cbiIsIlxudmFyIGdsb2JhbCA9IGZ1bmN0aW9uKCl7cmV0dXJuIHRoaXN9KClcbnZhciBwZXJmb3JtYW5jZSA9IGdsb2JhbC5wZXJmb3JtYW5jZVxuXG4vKipcbiAqIEdldCBhIHRpbWVzdGFtcFxuICogXG4gKiBAcmV0dXJuIHtOdW1iZXJ9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKXtcbiAgcmV0dXJuIHBlcmZvcm1hbmNlLm5vdygpXG59XG5cbi8vIGZhbGxiYWNrXG5cbmlmICghcGVyZm9ybWFuY2UgfHwgdHlwZW9mIHBlcmZvcm1hbmNlLm5vdyAhPSAnZnVuY3Rpb24nKSB7XG5cdG1vZHVsZS5leHBvcnRzID0gRGF0ZS5ub3cgfHwgZnVuY3Rpb24oKXsgcmV0dXJuICsobmV3IERhdGUpIH1cbn1cbiIsIlxudmFyIHRvU3RyaW5nID0ge30udG9TdHJpbmdcbnZhciBEb21Ob2RlID0gdHlwZW9mIHdpbmRvdyAhPSAndW5kZWZpbmVkJ1xuXHQ/IHdpbmRvdy5Ob2RlXG5cdDogRnVuY3Rpb25cblxuLyoqXG4gKiBSZXR1cm4gdGhlIHR5cGUgb2YgYHZhbGAuXG4gKlxuICogQHBhcmFtIHtNaXhlZH0gdmFsXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IGZ1bmN0aW9uKHgpe1xuXHR2YXIgdHlwZSA9IHR5cGVvZiB4XG5cdGlmICh0eXBlICE9ICdvYmplY3QnKSByZXR1cm4gdHlwZVxuXHR0eXBlID0gdHlwZXNbdG9TdHJpbmcuY2FsbCh4KV1cblx0aWYgKHR5cGUpIHJldHVybiB0eXBlXG5cdGlmICh4IGluc3RhbmNlb2YgRG9tTm9kZSkgc3dpdGNoICh4Lm5vZGVUeXBlKSB7XG5cdFx0Y2FzZSAxOiAgcmV0dXJuICdlbGVtZW50J1xuXHRcdGNhc2UgMzogIHJldHVybiAndGV4dC1ub2RlJ1xuXHRcdGNhc2UgOTogIHJldHVybiAnZG9jdW1lbnQnXG5cdFx0Y2FzZSAxMTogcmV0dXJuICdkb2N1bWVudC1mcmFnbWVudCdcblx0XHRkZWZhdWx0OiByZXR1cm4gJ2RvbS1ub2RlJ1xuXHR9XG59XG5cbnZhciB0eXBlcyA9IGV4cG9ydHMudHlwZXMgPSB7XG5cdCdbb2JqZWN0IEZ1bmN0aW9uXSc6ICdmdW5jdGlvbicsXG5cdCdbb2JqZWN0IERhdGVdJzogJ2RhdGUnLFxuXHQnW29iamVjdCBSZWdFeHBdJzogJ3JlZ2V4cCcsXG5cdCdbb2JqZWN0IEFyZ3VtZW50c10nOiAnYXJndW1lbnRzJyxcblx0J1tvYmplY3QgQXJyYXldJzogJ2FycmF5Jyxcblx0J1tvYmplY3QgU3RyaW5nXSc6ICdzdHJpbmcnLFxuXHQnW29iamVjdCBOdWxsXSc6ICdudWxsJyxcblx0J1tvYmplY3QgVW5kZWZpbmVkXSc6ICd1bmRlZmluZWQnLFxuXHQnW29iamVjdCBOdW1iZXJdJzogJ251bWJlcicsXG5cdCdbb2JqZWN0IEJvb2xlYW5dJzogJ2Jvb2xlYW4nLFxuXHQnW29iamVjdCBPYmplY3RdJzogJ29iamVjdCcsXG5cdCdbb2JqZWN0IFRleHRdJzogJ3RleHQtbm9kZScsXG5cdCdbb2JqZWN0IFVpbnQ4QXJyYXldJzogJzhiaXQtYXJyYXknLFxuXHQnW29iamVjdCBVaW50MTZBcnJheV0nOiAnMTZiaXQtYXJyYXknLFxuXHQnW29iamVjdCBVaW50MzJBcnJheV0nOiAnMzJiaXQtYXJyYXknLFxuXHQnW29iamVjdCBVaW50OENsYW1wZWRBcnJheV0nOiAnOGJpdC1hcnJheScsXG5cdCdbb2JqZWN0IEVycm9yXSc6ICdlcnJvcicsXG5cdCdbb2JqZWN0IEZvcm1EYXRhXSc6ICdmb3JtLWRhdGEnLFxuXHQnW29iamVjdCBGaWxlXSc6ICdmaWxlJyxcblx0J1tvYmplY3QgQmxvYl0nOiAnYmxvYidcbn0iLCJcbi8qKlxuICogRXhwb3NlIGB1bm1hdHJpeGAgYW5kIGhlbHBlcnNcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSB1bm1hdHJpeDtcbmV4cG9ydHMuZGVjb21wb3NlID0gZGVjb21wb3NlO1xuZXhwb3J0cy5wYXJzZSA9IHBhcnNlO1xuXG4vKipcbiAqIFVubWF0cml4XG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbFxuICogQHJldHVybiB7T2JqZWN0fVxuICovXG5cbmZ1bmN0aW9uIHVubWF0cml4KHN0cikge1xuICByZXR1cm4gZGVjb21wb3NlKHBhcnNlKHN0cikpO1xufVxuXG4vKipcbiAqIFVubWF0cml4OiBwYXJzZSB0aGUgdmFsdWVzIG9mIHRoZSBtYXRyaXhcbiAqXG4gKiBBbGdvcml0aG0gZnJvbTpcbiAqXG4gKiAtIGh0dHA6Ly9oZy5tb3ppbGxhLm9yZy9tb3ppbGxhLWNlbnRyYWwvZmlsZS83Y2IzZTk3OTVkMDQvbGF5b3V0L3N0eWxlL25zU3R5bGVBbmltYXRpb24uY3BwXG4gKlxuICogQHBhcmFtIHtBcnJheX0gbSAobWF0cml4KVxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gZGVjb21wb3NlKG0pIHtcbiAgdmFyIEEgPSBtWzBdO1xuICB2YXIgQiA9IG1bMV07XG4gIHZhciBDID0gbVsyXTtcbiAgdmFyIEQgPSBtWzNdO1xuICB2YXIgZGV0ZXJtaW5hbnQgPSBBICogRCAtIEIgKiBDO1xuXG4gIC8vIHN0ZXAoMSlcbiAgaWYgKCFkZXRlcm1pbmFudCkgdGhyb3cgbmV3IEVycm9yKCd0cmFuc2Zvcm0jdW5tYXRyaXg6IG1hdHJpeCBpcyBzaW5ndWxhcicpO1xuXG4gIC8vIHN0ZXAgKDMpXG4gIHZhciBzY2FsZVggPSBNYXRoLnNxcnQoQSAqIEEgKyBCICogQik7XG4gIEEgLz0gc2NhbGVYO1xuICBCIC89IHNjYWxlWDtcblxuICAvLyBzdGVwICg0KVxuICB2YXIgc2tldyA9IEEgKiBDICsgQiAqIEQ7XG4gIEMgLT0gQSAqIHNrZXc7XG4gIEQgLT0gQiAqIHNrZXc7XG5cbiAgLy8gc3RlcCAoNSlcbiAgdmFyIHNjYWxlWSA9IE1hdGguc3FydChDICogQyArIEQgKiBEKTtcbiAgQyAvPSBzY2FsZVk7XG4gIEQgLz0gc2NhbGVZO1xuICBza2V3IC89IHNjYWxlWTtcblxuICAvLyBzdGVwICg2KVxuICBpZiAoZGV0ZXJtaW5hbnQgPCAwKSB7XG4gICAgQSA9IC1BO1xuICAgIEIgPSAtQjtcbiAgICBza2V3ID0gLXNrZXc7XG4gICAgc2NhbGVYID0gLXNjYWxlWDtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgdHJhbnNsYXRlWDogbVs0XSxcbiAgICB0cmFuc2xhdGVZOiBtWzVdLFxuICAgIHJvdGF0ZTogcnRvZChNYXRoLmF0YW4yKEIsIEEpKSxcbiAgICBza2V3OiBydG9kKE1hdGguYXRhbihza2V3KSksXG4gICAgc2NhbGVYOiByb3VuZChzY2FsZVgpLFxuICAgIHNjYWxlWTogcm91bmQoc2NhbGVZKVxuICB9O1xufVxuXG4vKipcbiAqIFN0cmluZyB0byBtYXRyaXhcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3R5bGVcbiAqIEByZXR1cm4ge0FycmF5fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gcGFyc2Uoc3RyKSB7XG4gIHZhciBtID0gc3RyLnNsaWNlKDcpLm1hdGNoKC9bXFxkXFwuXFwtXSsvZyk7XG4gIGlmICghbSkgcmV0dXJuIFsxLCAwLCAwLCAxLCAwLCAwXVxuICByZXR1cm4gbS5sZW5ndGggPT0gNlxuICAgID8gbS5tYXAoTnVtYmVyKVxuICAgIDogW1xuICAgICAgICArbVswXSAsICttWzFdLFxuICAgICAgICArbVs0XSAsICttWzVdLFxuICAgICAgICArbVsxMl0sICttWzEzXVxuICAgICAgXTtcbn1cblxuLyoqXG4gKiBSYWRpYW5zIHRvIGRlZ3JlZXNcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gcmFkaWFuc1xuICogQHJldHVybiB7TnVtYmVyfSBkZWdyZWVzXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBydG9kKHJhZGlhbnMpIHtcbiAgdmFyIGRlZyA9IHJhZGlhbnMgKiAxODAgLyBNYXRoLlBJO1xuICByZXR1cm4gcm91bmQoZGVnKTtcbn1cblxuLyoqXG4gKiBSb3VuZCB0byB0aGUgbmVhcmVzdCBodW5kcmVkdGhcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gblxuICogQHJldHVybiB7TnVtYmVyfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gcm91bmQobikge1xuICByZXR1cm4gTWF0aC5yb3VuZChuICogMTAwKSAvIDEwMDtcbn1cbiIsIlxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihhLCBiKXtcbiAgdmFyIGZuID0gZnVuY3Rpb24oKXt9O1xuICBmbi5wcm90b3R5cGUgPSBiLnByb3RvdHlwZTtcbiAgYS5wcm90b3R5cGUgPSBuZXcgZm47XG4gIGEucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gYTtcbn07IiwiXG4vKipcbiAqIEV4cG9zZSBgZGVidWcoKWAgYXMgdGhlIG1vZHVsZS5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRlYnVnO1xuXG4vKipcbiAqIENyZWF0ZSBhIGRlYnVnZ2VyIHdpdGggdGhlIGdpdmVuIGBuYW1lYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICogQHJldHVybiB7VHlwZX1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gZGVidWcobmFtZSkge1xuICBpZiAoIWRlYnVnLmVuYWJsZWQobmFtZSkpIHJldHVybiBmdW5jdGlvbigpe307XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKGZtdCl7XG4gICAgZm10ID0gY29lcmNlKGZtdCk7XG5cbiAgICB2YXIgY3VyciA9IG5ldyBEYXRlO1xuICAgIHZhciBtcyA9IGN1cnIgLSAoZGVidWdbbmFtZV0gfHwgY3Vycik7XG4gICAgZGVidWdbbmFtZV0gPSBjdXJyO1xuXG4gICAgZm10ID0gbmFtZVxuICAgICAgKyAnICdcbiAgICAgICsgZm10XG4gICAgICArICcgKycgKyBkZWJ1Zy5odW1hbml6ZShtcyk7XG5cbiAgICAvLyBUaGlzIGhhY2tlcnkgaXMgcmVxdWlyZWQgZm9yIElFOFxuICAgIC8vIHdoZXJlIGBjb25zb2xlLmxvZ2AgZG9lc24ndCBoYXZlICdhcHBseSdcbiAgICB3aW5kb3cuY29uc29sZVxuICAgICAgJiYgY29uc29sZS5sb2dcbiAgICAgICYmIEZ1bmN0aW9uLnByb3RvdHlwZS5hcHBseS5jYWxsKGNvbnNvbGUubG9nLCBjb25zb2xlLCBhcmd1bWVudHMpO1xuICB9XG59XG5cbi8qKlxuICogVGhlIGN1cnJlbnRseSBhY3RpdmUgZGVidWcgbW9kZSBuYW1lcy5cbiAqL1xuXG5kZWJ1Zy5uYW1lcyA9IFtdO1xuZGVidWcuc2tpcHMgPSBbXTtcblxuLyoqXG4gKiBFbmFibGVzIGEgZGVidWcgbW9kZSBieSBuYW1lLiBUaGlzIGNhbiBpbmNsdWRlIG1vZGVzXG4gKiBzZXBhcmF0ZWQgYnkgYSBjb2xvbiBhbmQgd2lsZGNhcmRzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmRlYnVnLmVuYWJsZSA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgdHJ5IHtcbiAgICBsb2NhbFN0b3JhZ2UuZGVidWcgPSBuYW1lO1xuICB9IGNhdGNoKGUpe31cblxuICB2YXIgc3BsaXQgPSAobmFtZSB8fCAnJykuc3BsaXQoL1tcXHMsXSsvKVxuICAgICwgbGVuID0gc3BsaXQubGVuZ3RoO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICBuYW1lID0gc3BsaXRbaV0ucmVwbGFjZSgnKicsICcuKj8nKTtcbiAgICBpZiAobmFtZVswXSA9PT0gJy0nKSB7XG4gICAgICBkZWJ1Zy5za2lwcy5wdXNoKG5ldyBSZWdFeHAoJ14nICsgbmFtZS5zdWJzdHIoMSkgKyAnJCcpKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBkZWJ1Zy5uYW1lcy5wdXNoKG5ldyBSZWdFeHAoJ14nICsgbmFtZSArICckJykpO1xuICAgIH1cbiAgfVxufTtcblxuLyoqXG4gKiBEaXNhYmxlIGRlYnVnIG91dHB1dC5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmRlYnVnLmRpc2FibGUgPSBmdW5jdGlvbigpe1xuICBkZWJ1Zy5lbmFibGUoJycpO1xufTtcblxuLyoqXG4gKiBIdW1hbml6ZSB0aGUgZ2l2ZW4gYG1zYC5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gbVxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZGVidWcuaHVtYW5pemUgPSBmdW5jdGlvbihtcykge1xuICB2YXIgc2VjID0gMTAwMFxuICAgICwgbWluID0gNjAgKiAxMDAwXG4gICAgLCBob3VyID0gNjAgKiBtaW47XG5cbiAgaWYgKG1zID49IGhvdXIpIHJldHVybiAobXMgLyBob3VyKS50b0ZpeGVkKDEpICsgJ2gnO1xuICBpZiAobXMgPj0gbWluKSByZXR1cm4gKG1zIC8gbWluKS50b0ZpeGVkKDEpICsgJ20nO1xuICBpZiAobXMgPj0gc2VjKSByZXR1cm4gKG1zIC8gc2VjIHwgMCkgKyAncyc7XG4gIHJldHVybiBtcyArICdtcyc7XG59O1xuXG4vKipcbiAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgZ2l2ZW4gbW9kZSBuYW1lIGlzIGVuYWJsZWQsIGZhbHNlIG90aGVyd2lzZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZGVidWcuZW5hYmxlZCA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGRlYnVnLnNraXBzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgaWYgKGRlYnVnLnNraXBzW2ldLnRlc3QobmFtZSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGRlYnVnLm5hbWVzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgaWYgKGRlYnVnLm5hbWVzW2ldLnRlc3QobmFtZSkpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59O1xuXG4vKipcbiAqIENvZXJjZSBgdmFsYC5cbiAqL1xuXG5mdW5jdGlvbiBjb2VyY2UodmFsKSB7XG4gIGlmICh2YWwgaW5zdGFuY2VvZiBFcnJvcikgcmV0dXJuIHZhbC5zdGFjayB8fCB2YWwubWVzc2FnZTtcbiAgcmV0dXJuIHZhbDtcbn1cblxuLy8gcGVyc2lzdFxuXG50cnkge1xuICBpZiAod2luZG93LmxvY2FsU3RvcmFnZSkgZGVidWcuZW5hYmxlKGxvY2FsU3RvcmFnZS5kZWJ1Zyk7XG59IGNhdGNoKGUpe31cbiIsImlmICgndW5kZWZpbmVkJyA9PSB0eXBlb2Ygd2luZG93KSB7XG4gIG1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9saWIvZGVidWcnKTtcbn0gZWxzZSB7XG4gIG1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9kZWJ1ZycpO1xufVxuIiwiLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICovXG5cbnZhciB0dHkgPSByZXF1aXJlKCd0dHknKTtcblxuLyoqXG4gKiBFeHBvc2UgYGRlYnVnKClgIGFzIHRoZSBtb2R1bGUuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBkZWJ1ZztcblxuLyoqXG4gKiBFbmFibGVkIGRlYnVnZ2Vycy5cbiAqL1xuXG52YXIgbmFtZXMgPSBbXVxuICAsIHNraXBzID0gW107XG5cbihwcm9jZXNzLmVudi5ERUJVRyB8fCAnJylcbiAgLnNwbGl0KC9bXFxzLF0rLylcbiAgLmZvckVhY2goZnVuY3Rpb24obmFtZSl7XG4gICAgbmFtZSA9IG5hbWUucmVwbGFjZSgnKicsICcuKj8nKTtcbiAgICBpZiAobmFtZVswXSA9PT0gJy0nKSB7XG4gICAgICBza2lwcy5wdXNoKG5ldyBSZWdFeHAoJ14nICsgbmFtZS5zdWJzdHIoMSkgKyAnJCcpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbmFtZXMucHVzaChuZXcgUmVnRXhwKCdeJyArIG5hbWUgKyAnJCcpKTtcbiAgICB9XG4gIH0pO1xuXG4vKipcbiAqIENvbG9ycy5cbiAqL1xuXG52YXIgY29sb3JzID0gWzYsIDIsIDMsIDQsIDUsIDFdO1xuXG4vKipcbiAqIFByZXZpb3VzIGRlYnVnKCkgY2FsbC5cbiAqL1xuXG52YXIgcHJldiA9IHt9O1xuXG4vKipcbiAqIFByZXZpb3VzbHkgYXNzaWduZWQgY29sb3IuXG4gKi9cblxudmFyIHByZXZDb2xvciA9IDA7XG5cbi8qKlxuICogSXMgc3Rkb3V0IGEgVFRZPyBDb2xvcmVkIG91dHB1dCBpcyBkaXNhYmxlZCB3aGVuIGB0cnVlYC5cbiAqL1xuXG52YXIgaXNhdHR5ID0gdHR5LmlzYXR0eSgyKTtcblxuLyoqXG4gKiBTZWxlY3QgYSBjb2xvci5cbiAqXG4gKiBAcmV0dXJuIHtOdW1iZXJ9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBjb2xvcigpIHtcbiAgcmV0dXJuIGNvbG9yc1twcmV2Q29sb3IrKyAlIGNvbG9ycy5sZW5ndGhdO1xufVxuXG4vKipcbiAqIEh1bWFuaXplIHRoZSBnaXZlbiBgbXNgLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBtXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBodW1hbml6ZShtcykge1xuICB2YXIgc2VjID0gMTAwMFxuICAgICwgbWluID0gNjAgKiAxMDAwXG4gICAgLCBob3VyID0gNjAgKiBtaW47XG5cbiAgaWYgKG1zID49IGhvdXIpIHJldHVybiAobXMgLyBob3VyKS50b0ZpeGVkKDEpICsgJ2gnO1xuICBpZiAobXMgPj0gbWluKSByZXR1cm4gKG1zIC8gbWluKS50b0ZpeGVkKDEpICsgJ20nO1xuICBpZiAobXMgPj0gc2VjKSByZXR1cm4gKG1zIC8gc2VjIHwgMCkgKyAncyc7XG4gIHJldHVybiBtcyArICdtcyc7XG59XG5cbi8qKlxuICogQ3JlYXRlIGEgZGVidWdnZXIgd2l0aCB0aGUgZ2l2ZW4gYG5hbWVgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gKiBAcmV0dXJuIHtUeXBlfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBkZWJ1ZyhuYW1lKSB7XG4gIGZ1bmN0aW9uIGRpc2FibGVkKCl7fVxuICBkaXNhYmxlZC5lbmFibGVkID0gZmFsc2U7XG5cbiAgdmFyIG1hdGNoID0gc2tpcHMuc29tZShmdW5jdGlvbihyZSl7XG4gICAgcmV0dXJuIHJlLnRlc3QobmFtZSk7XG4gIH0pO1xuXG4gIGlmIChtYXRjaCkgcmV0dXJuIGRpc2FibGVkO1xuXG4gIG1hdGNoID0gbmFtZXMuc29tZShmdW5jdGlvbihyZSl7XG4gICAgcmV0dXJuIHJlLnRlc3QobmFtZSk7XG4gIH0pO1xuXG4gIGlmICghbWF0Y2gpIHJldHVybiBkaXNhYmxlZDtcbiAgdmFyIGMgPSBjb2xvcigpO1xuXG4gIGZ1bmN0aW9uIGNvbG9yZWQoZm10KSB7XG4gICAgZm10ID0gY29lcmNlKGZtdCk7XG5cbiAgICB2YXIgY3VyciA9IG5ldyBEYXRlO1xuICAgIHZhciBtcyA9IGN1cnIgLSAocHJldltuYW1lXSB8fCBjdXJyKTtcbiAgICBwcmV2W25hbWVdID0gY3VycjtcblxuICAgIGZtdCA9ICcgIFxcdTAwMWJbOScgKyBjICsgJ20nICsgbmFtZSArICcgJ1xuICAgICAgKyAnXFx1MDAxYlszJyArIGMgKyAnbVxcdTAwMWJbOTBtJ1xuICAgICAgKyBmbXQgKyAnXFx1MDAxYlszJyArIGMgKyAnbSdcbiAgICAgICsgJyArJyArIGh1bWFuaXplKG1zKSArICdcXHUwMDFiWzBtJztcblxuICAgIGNvbnNvbGUuZXJyb3IuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHBsYWluKGZtdCkge1xuICAgIGZtdCA9IGNvZXJjZShmbXQpO1xuXG4gICAgZm10ID0gbmV3IERhdGUoKS50b1VUQ1N0cmluZygpXG4gICAgICArICcgJyArIG5hbWUgKyAnICcgKyBmbXQ7XG4gICAgY29uc29sZS5lcnJvci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG5cbiAgY29sb3JlZC5lbmFibGVkID0gcGxhaW4uZW5hYmxlZCA9IHRydWU7XG5cbiAgcmV0dXJuIGlzYXR0eSB8fCBwcm9jZXNzLmVudi5ERUJVR19DT0xPUlNcbiAgICA/IGNvbG9yZWRcbiAgICA6IHBsYWluO1xufVxuXG4vKipcbiAqIENvZXJjZSBgdmFsYC5cbiAqL1xuXG5mdW5jdGlvbiBjb2VyY2UodmFsKSB7XG4gIGlmICh2YWwgaW5zdGFuY2VvZiBFcnJvcikgcmV0dXJuIHZhbC5zdGFjayB8fCB2YWwubWVzc2FnZTtcbiAgcmV0dXJuIHZhbDtcbn1cbiIsIlxuLyoqXG4gKiBpc0FycmF5XG4gKi9cblxudmFyIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5O1xuXG4vKipcbiAqIHRvU3RyaW5nXG4gKi9cblxudmFyIHN0ciA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbi8qKlxuICogV2V0aGVyIG9yIG5vdCB0aGUgZ2l2ZW4gYHZhbGBcbiAqIGlzIGFuIGFycmF5LlxuICpcbiAqIGV4YW1wbGU6XG4gKlxuICogICAgICAgIGlzQXJyYXkoW10pO1xuICogICAgICAgIC8vID4gdHJ1ZVxuICogICAgICAgIGlzQXJyYXkoYXJndW1lbnRzKTtcbiAqICAgICAgICAvLyA+IGZhbHNlXG4gKiAgICAgICAgaXNBcnJheSgnJyk7XG4gKiAgICAgICAgLy8gPiBmYWxzZVxuICpcbiAqIEBwYXJhbSB7bWl4ZWR9IHZhbFxuICogQHJldHVybiB7Ym9vbH1cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGlzQXJyYXkgfHwgZnVuY3Rpb24gKHZhbCkge1xuICByZXR1cm4gISEgdmFsICYmICdbb2JqZWN0IEFycmF5XScgPT0gc3RyLmNhbGwodmFsKTtcbn07XG4iLCJcbi8qKlxuICogbWVyZ2UgYGJgJ3MgcHJvcGVydGllcyB3aXRoIGBhYCdzLlxuICpcbiAqIGV4YW1wbGU6XG4gKlxuICogICAgICAgIHZhciB1c2VyID0ge307XG4gKiAgICAgICAgbWVyZ2UodXNlciwgY29uc29sZSk7XG4gKiAgICAgICAgLy8gPiB7IGxvZzogZm4sIGRpcjogZm4gLi59XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGFcbiAqIEBwYXJhbSB7T2JqZWN0fSBiXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoYSwgYikge1xuICBmb3IgKHZhciBrIGluIGIpIGFba10gPSBiW2tdO1xuICByZXR1cm4gYTtcbn07XG4iLCJcbi8qKlxuICogbWVyZ2UgYGJgJ3MgcHJvcGVydGllcyB3aXRoIGBhYCdzLlxuICpcbiAqIGV4YW1wbGU6XG4gKlxuICogICAgICAgIHZhciB1c2VyID0ge307XG4gKiAgICAgICAgbWVyZ2UodXNlciwgY29uc29sZSk7XG4gKiAgICAgICAgLy8gPiB7IGxvZzogZm4sIGRpcjogZm4gLi59XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGFcbiAqIEBwYXJhbSB7T2JqZWN0fSBiXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoYSwgYikge1xuICBmb3IgKHZhciBrIGluIGIpIGFba10gPSBiW2tdO1xuICByZXR1cm4gYTtcbn07XG4iLCJcbi8qKlxuICogZGVwZW5kZW5jaWVzXG4gKi9cblxudmFyIG1hdGNoZXMgPSByZXF1aXJlKCdtYXRjaGVzLXNlbGVjdG9yJyk7XG5cbi8qKlxuICogVHJhdmVyc2Ugd2l0aCB0aGUgZ2l2ZW4gYGVsYCwgYHNlbGVjdG9yYCBhbmQgYGxlbmAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7U3RyaW5nfSBzZWxlY3RvclxuICogQHBhcmFtIHtOdW1iZXJ9IGxlblxuICogQHJldHVybiB7QXJyYXl9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24odHlwZSwgZWwsIHNlbGVjdG9yLCBsZW4pe1xuICB2YXIgZWwgPSBlbFt0eXBlXVxuICAgICwgbiA9IGxlbiB8fCAxXG4gICAgLCByZXQgPSBbXTtcblxuICBpZiAoIWVsKSByZXR1cm4gcmV0O1xuXG4gIGRvIHtcbiAgICBpZiAobiA9PSByZXQubGVuZ3RoKSBicmVhaztcbiAgICBpZiAoMSAhPSBlbC5ub2RlVHlwZSkgY29udGludWU7XG4gICAgaWYgKG1hdGNoZXMoZWwsIHNlbGVjdG9yKSkgcmV0LnB1c2goZWwpO1xuICAgIGlmICghc2VsZWN0b3IpIHJldC5wdXNoKGVsKTtcbiAgfSB3aGlsZSAoZWwgPSBlbFt0eXBlXSk7XG5cbiAgcmV0dXJuIHJldDtcbn1cbiIsIlxubW9kdWxlLmV4cG9ydHMgPSBhYnNvbHV0aXplXG5cbi8qKlxuICogcmVkZWZpbmUgYHBhdGhgIHdpdGggYWJzb2x1dGUgY29vcmRpbmF0ZXNcbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBwYXRoXG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqL1xuXG5mdW5jdGlvbiBhYnNvbHV0aXplKHBhdGgpe1xuXHR2YXIgc3RhcnRYID0gMFxuXHR2YXIgc3RhcnRZID0gMFxuXHR2YXIgeCA9IDBcblx0dmFyIHkgPSAwXG5cblx0cmV0dXJuIHBhdGgubWFwKGZ1bmN0aW9uKHNlZyl7XG5cdFx0c2VnID0gc2VnLnNsaWNlKClcblx0XHR2YXIgdHlwZSA9IHNlZ1swXVxuXHRcdHZhciBjb21tYW5kID0gdHlwZS50b1VwcGVyQ2FzZSgpXG5cblx0XHQvLyBpcyByZWxhdGl2ZVxuXHRcdGlmICh0eXBlICE9IGNvbW1hbmQpIHtcblx0XHRcdHNlZ1swXSA9IGNvbW1hbmRcblx0XHRcdHN3aXRjaCAodHlwZSkge1xuXHRcdFx0XHRjYXNlICdhJzpcblx0XHRcdFx0XHRzZWdbNl0gKz0geFxuXHRcdFx0XHRcdHNlZ1s3XSArPSB5XG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0Y2FzZSAndic6XG5cdFx0XHRcdFx0c2VnWzFdICs9IHlcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRjYXNlICdoJzpcblx0XHRcdFx0XHRzZWdbMV0gKz0geFxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0Zm9yICh2YXIgaSA9IDE7IGkgPCBzZWcubGVuZ3RoOykge1xuXHRcdFx0XHRcdFx0c2VnW2krK10gKz0geFxuXHRcdFx0XHRcdFx0c2VnW2krK10gKz0geVxuXHRcdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyB1cGRhdGUgY3Vyc29yIHN0YXRlXG5cdFx0c3dpdGNoIChjb21tYW5kKSB7XG5cdFx0XHRjYXNlICdaJzpcblx0XHRcdFx0eCA9IHN0YXJ0WFxuXHRcdFx0XHR5ID0gc3RhcnRZXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlICdIJzpcblx0XHRcdFx0eCA9IHNlZ1sxXVxuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSAnVic6XG5cdFx0XHRcdHkgPSBzZWdbMV1cblx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgJ00nOlxuXHRcdFx0XHR4ID0gc3RhcnRYID0gc2VnWzFdXG5cdFx0XHRcdHkgPSBzdGFydFkgPSBzZWdbMl1cblx0XHRcdFx0YnJlYWtcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHggPSBzZWdbc2VnLmxlbmd0aCAtIDJdXG5cdFx0XHRcdHkgPSBzZWdbc2VnLmxlbmd0aCAtIDFdXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHNlZ1xuXHR9KVxufVxuIiwiXG5tb2R1bGUuZXhwb3J0cyA9IGJhbGFuY2VcblxuLyoqXG4gKiBkZWZpbmUgYGFgIGFuZCBgYmAgdXNpbmcgdGhlIHNhbWUgbnVtYmVyIG9mXG4gKiBwYXRoIHNlZ21lbnRzIHdoaWxlIHByZXNlcnZpbmcgdGhlaXIgc2hhcGVcbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBhXG4gKiBAcGFyYW0ge0FycmF5fSBiXG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqL1xuXG5mdW5jdGlvbiBiYWxhbmNlKGEsIGIpe1xuICB2YXIgZGlmZiA9IGEubGVuZ3RoIC0gYi5sZW5ndGhcbiAgdmFyIHNob3J0ID0gZGlmZiA+PSAwID8gYiA6IGFcbiAgZGlmZiA9IE1hdGguYWJzKGRpZmYpXG4gIHdoaWxlIChkaWZmLS0pIHNob3J0LnB1c2goWydjJywwLDAsMCwwLDAsMF0pXG4gIHJldHVybiBbYSwgYl1cbn1cbiIsIlxuZXhwb3J0cy5pc2F0dHkgPSBmdW5jdGlvbiAoKSB7IHJldHVybiBmYWxzZTsgfTtcblxuZnVuY3Rpb24gUmVhZFN0cmVhbSgpIHtcbiAgdGhyb3cgbmV3IEVycm9yKCd0dHkuUmVhZFN0cmVhbSBpcyBub3QgaW1wbGVtZW50ZWQnKTtcbn1cbmV4cG9ydHMuUmVhZFN0cmVhbSA9IFJlYWRTdHJlYW07XG5cbmZ1bmN0aW9uIFdyaXRlU3RyZWFtKCkge1xuICB0aHJvdyBuZXcgRXJyb3IoJ3R0eS5SZWFkU3RyZWFtIGlzIG5vdCBpbXBsZW1lbnRlZCcpO1xufVxuZXhwb3J0cy5Xcml0ZVN0cmVhbSA9IFdyaXRlU3RyZWFtO1xuIiwiXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBhbGljZWJsdWU6IFsyNDAsIDI0OCwgMjU1XVxuICAsIGFudGlxdWV3aGl0ZTogWzI1MCwgMjM1LCAyMTVdXG4gICwgYXF1YTogWzAsIDI1NSwgMjU1XVxuICAsIGFxdWFtYXJpbmU6IFsxMjcsIDI1NSwgMjEyXVxuICAsIGF6dXJlOiBbMjQwLCAyNTUsIDI1NV1cbiAgLCBiZWlnZTogWzI0NSwgMjQ1LCAyMjBdXG4gICwgYmlzcXVlOiBbMjU1LCAyMjgsIDE5Nl1cbiAgLCBibGFjazogWzAsIDAsIDBdXG4gICwgYmxhbmNoZWRhbG1vbmQ6IFsyNTUsIDIzNSwgMjA1XVxuICAsIGJsdWU6IFswLCAwLCAyNTVdXG4gICwgYmx1ZXZpb2xldDogWzEzOCwgNDMsIDIyNl1cbiAgLCBicm93bjogWzE2NSwgNDIsIDQyXVxuICAsIGJ1cmx5d29vZDogWzIyMiwgMTg0LCAxMzVdXG4gICwgY2FkZXRibHVlOiBbOTUsIDE1OCwgMTYwXVxuICAsIGNoYXJ0cmV1c2U6IFsxMjcsIDI1NSwgMF1cbiAgLCBjaG9jb2xhdGU6IFsyMTAsIDEwNSwgMzBdXG4gICwgY29yYWw6IFsyNTUsIDEyNywgODBdXG4gICwgY29ybmZsb3dlcmJsdWU6IFsxMDAsIDE0OSwgMjM3XVxuICAsIGNvcm5zaWxrOiBbMjU1LCAyNDgsIDIyMF1cbiAgLCBjcmltc29uOiBbMjIwLCAyMCwgNjBdXG4gICwgY3lhbjogWzAsIDI1NSwgMjU1XVxuICAsIGRhcmtibHVlOiBbMCwgMCwgMTM5XVxuICAsIGRhcmtjeWFuOiBbMCwgMTM5LCAxMzldXG4gICwgZGFya2dvbGRlbnJvZDogWzE4NCwgMTMyLCAxMV1cbiAgLCBkYXJrZ3JheTogWzE2OSwgMTY5LCAxNjldXG4gICwgZGFya2dyZWVuOiBbMCwgMTAwLCAwXVxuICAsIGRhcmtncmV5OiBbMTY5LCAxNjksIDE2OV1cbiAgLCBkYXJra2hha2k6IFsxODksIDE4MywgMTA3XVxuICAsIGRhcmttYWdlbnRhOiBbMTM5LCAwLCAxMzldXG4gICwgZGFya29saXZlZ3JlZW46IFs4NSwgMTA3LCA0N11cbiAgLCBkYXJrb3JhbmdlOiBbMjU1LCAxNDAsIDBdXG4gICwgZGFya29yY2hpZDogWzE1MywgNTAsIDIwNF1cbiAgLCBkYXJrcmVkOiBbMTM5LCAwLCAwXVxuICAsIGRhcmtzYWxtb246IFsyMzMsIDE1MCwgMTIyXVxuICAsIGRhcmtzZWFncmVlbjogWzE0MywgMTg4LCAxNDNdXG4gICwgZGFya3NsYXRlYmx1ZTogWzcyLCA2MSwgMTM5XVxuICAsIGRhcmtzbGF0ZWdyYXk6IFs0NywgNzksIDc5XVxuICAsIGRhcmtzbGF0ZWdyZXk6IFs0NywgNzksIDc5XVxuICAsIGRhcmt0dXJxdW9pc2U6IFswLCAyMDYsIDIwOV1cbiAgLCBkYXJrdmlvbGV0OiBbMTQ4LCAwLCAyMTFdXG4gICwgZGVlcHBpbms6IFsyNTUsIDIwLCAxNDddXG4gICwgZGVlcHNreWJsdWU6IFswLCAxOTEsIDI1NV1cbiAgLCBkaW1ncmF5OiBbMTA1LCAxMDUsIDEwNV1cbiAgLCBkaW1ncmV5OiBbMTA1LCAxMDUsIDEwNV1cbiAgLCBkb2RnZXJibHVlOiBbMzAsIDE0NCwgMjU1XVxuICAsIGZpcmVicmljazogWzE3OCwgMzQsIDM0XVxuICAsIGZsb3JhbHdoaXRlOiBbMjU1LCAyNTUsIDI0MF1cbiAgLCBmb3Jlc3RncmVlbjogWzM0LCAxMzksIDM0XVxuICAsIGZ1Y2hzaWE6IFsyNTUsIDAsIDI1NV1cbiAgLCBnYWluc2Jvcm86IFsyMjAsIDIyMCwgMjIwXVxuICAsIGdob3N0d2hpdGU6IFsyNDgsIDI0OCwgMjU1XVxuICAsIGdvbGQ6IFsyNTUsIDIxNSwgMF1cbiAgLCBnb2xkZW5yb2Q6IFsyMTgsIDE2NSwgMzJdXG4gICwgZ3JheTogWzEyOCwgMTI4LCAxMjhdXG4gICwgZ3JlZW46IFswLCAxMjgsIDBdXG4gICwgZ3JlZW55ZWxsb3c6IFsxNzMsIDI1NSwgNDddXG4gICwgZ3JleTogWzEyOCwgMTI4LCAxMjhdXG4gICwgaG9uZXlkZXc6IFsyNDAsIDI1NSwgMjQwXVxuICAsIGhvdHBpbms6IFsyNTUsIDEwNSwgMTgwXVxuICAsIGluZGlhbnJlZDogWzIwNSwgOTIsIDkyXVxuICAsIGluZGlnbzogWzc1LCAwLCAxMzBdXG4gICwgaXZvcnk6IFsyNTUsIDI1NSwgMjQwXVxuICAsIGtoYWtpOiBbMjQwLCAyMzAsIDE0MF1cbiAgLCBsYXZlbmRlcjogWzIzMCwgMjMwLCAyNTBdXG4gICwgbGF2ZW5kZXJibHVzaDogWzI1NSwgMjQwLCAyNDVdXG4gICwgbGF3bmdyZWVuOiBbMTI0LCAyNTIsIDBdXG4gICwgbGVtb25jaGlmZm9uOiBbMjU1LCAyNTAsIDIwNV1cbiAgLCBsaWdodGJsdWU6IFsxNzMsIDIxNiwgMjMwXVxuICAsIGxpZ2h0Y29yYWw6IFsyNDAsIDEyOCwgMTI4XVxuICAsIGxpZ2h0Y3lhbjogWzIyNCwgMjU1LCAyNTVdXG4gICwgbGlnaHRnb2xkZW5yb2R5ZWxsb3c6IFsyNTAsIDI1MCwgMjEwXVxuICAsIGxpZ2h0Z3JheTogWzIxMSwgMjExLCAyMTFdXG4gICwgbGlnaHRncmVlbjogWzE0NCwgMjM4LCAxNDRdXG4gICwgbGlnaHRncmV5OiBbMjExLCAyMTEsIDIxMV1cbiAgLCBsaWdodHBpbms6IFsyNTUsIDE4MiwgMTkzXVxuICAsIGxpZ2h0c2FsbW9uOiBbMjU1LCAxNjAsIDEyMl1cbiAgLCBsaWdodHNlYWdyZWVuOiBbMzIsIDE3OCwgMTcwXVxuICAsIGxpZ2h0c2t5Ymx1ZTogWzEzNSwgMjA2LCAyNTBdXG4gICwgbGlnaHRzbGF0ZWdyYXk6IFsxMTksIDEzNiwgMTUzXVxuICAsIGxpZ2h0c2xhdGVncmV5OiBbMTE5LCAxMzYsIDE1M11cbiAgLCBsaWdodHN0ZWVsYmx1ZTogWzE3NiwgMTk2LCAyMjJdXG4gICwgbGlnaHR5ZWxsb3c6IFsyNTUsIDI1NSwgMjI0XVxuICAsIGxpbWU6IFswLCAyNTUsIDBdXG4gICwgbGltZWdyZWVuOiBbNTAsIDIwNSwgNTBdXG4gICwgbGluZW46IFsyNTAsIDI0MCwgMjMwXVxuICAsIG1hZ2VudGE6IFsyNTUsIDAsIDI1NV1cbiAgLCBtYXJvb246IFsxMjgsIDAsIDBdXG4gICwgbWVkaXVtYXF1YW1hcmluZTogWzEwMiwgMjA1LCAxNzBdXG4gICwgbWVkaXVtYmx1ZTogWzAsIDAsIDIwNV1cbiAgLCBtZWRpdW1vcmNoaWQ6IFsxODYsIDg1LCAyMTFdXG4gICwgbWVkaXVtcHVycGxlOiBbMTQ3LCAxMTIsIDIxOV1cbiAgLCBtZWRpdW1zZWFncmVlbjogWzYwLCAxNzksIDExM11cbiAgLCBtZWRpdW1zbGF0ZWJsdWU6IFsxMjMsIDEwNCwgMjM4XVxuICAsIG1lZGl1bXNwcmluZ2dyZWVuOiBbMCwgMjUwLCAxNTRdXG4gICwgbWVkaXVtdHVycXVvaXNlOiBbNzIsIDIwOSwgMjA0XVxuICAsIG1lZGl1bXZpb2xldHJlZDogWzE5OSwgMjEsIDEzM11cbiAgLCBtaWRuaWdodGJsdWU6IFsyNSwgMjUsIDExMl1cbiAgLCBtaW50Y3JlYW06IFsyNDUsIDI1NSwgMjUwXVxuICAsIG1pc3R5cm9zZTogWzI1NSwgMjI4LCAyMjVdXG4gICwgbW9jY2FzaW46IFsyNTUsIDIyOCwgMTgxXVxuICAsIG5hdmFqb3doaXRlOiBbMjU1LCAyMjIsIDE3M11cbiAgLCBuYXZ5OiBbMCwgMCwgMTI4XVxuICAsIG9sZGxhY2U6IFsyNTMsIDI0NSwgMjMwXVxuICAsIG9saXZlOiBbMTI4LCAxMjgsIDBdXG4gICwgb2xpdmVkcmFiOiBbMTA3LCAxNDIsIDM1XVxuICAsIG9yYW5nZTogWzI1NSwgMTY1LCAwXVxuICAsIG9yYW5nZXJlZDogWzI1NSwgNjksIDBdXG4gICwgb3JjaGlkOiBbMjE4LCAxMTIsIDIxNF1cbiAgLCBwYWxlZ29sZGVucm9kOiBbMjM4LCAyMzIsIDE3MF1cbiAgLCBwYWxlZ3JlZW46IFsxNTIsIDI1MSwgMTUyXVxuICAsIHBhbGV0dXJxdW9pc2U6IFsxNzUsIDIzOCwgMjM4XVxuICAsIHBhbGV2aW9sZXRyZWQ6IFsyMTksIDExMiwgMTQ3XVxuICAsIHBhcGF5YXdoaXA6IFsyNTUsIDIzOSwgMjEzXVxuICAsIHBlYWNocHVmZjogWzI1NSwgMjE4LCAxODVdXG4gICwgcGVydTogWzIwNSwgMTMzLCA2M11cbiAgLCBwaW5rOiBbMjU1LCAxOTIsIDIwM11cbiAgLCBwbHVtOiBbMjIxLCAxNjAsIDIwM11cbiAgLCBwb3dkZXJibHVlOiBbMTc2LCAyMjQsIDIzMF1cbiAgLCBwdXJwbGU6IFsxMjgsIDAsIDEyOF1cbiAgLCByZWQ6IFsyNTUsIDAsIDBdXG4gICwgcm9zeWJyb3duOiBbMTg4LCAxNDMsIDE0M11cbiAgLCByb3lhbGJsdWU6IFs2NSwgMTA1LCAyMjVdXG4gICwgc2FkZGxlYnJvd246IFsxMzksIDY5LCAxOV1cbiAgLCBzYWxtb246IFsyNTAsIDEyOCwgMTE0XVxuICAsIHNhbmR5YnJvd246IFsyNDQsIDE2NCwgOTZdXG4gICwgc2VhZ3JlZW46IFs0NiwgMTM5LCA4N11cbiAgLCBzZWFzaGVsbDogWzI1NSwgMjQ1LCAyMzhdXG4gICwgc2llbm5hOiBbMTYwLCA4MiwgNDVdXG4gICwgc2lsdmVyOiBbMTkyLCAxOTIsIDE5Ml1cbiAgLCBza3libHVlOiBbMTM1LCAyMDYsIDIzNV1cbiAgLCBzbGF0ZWJsdWU6IFsxMDYsIDkwLCAyMDVdXG4gICwgc2xhdGVncmF5OiBbMTE5LCAxMjgsIDE0NF1cbiAgLCBzbGF0ZWdyZXk6IFsxMTksIDEyOCwgMTQ0XVxuICAsIHNub3c6IFsyNTUsIDI1NSwgMjUwXVxuICAsIHNwcmluZ2dyZWVuOiBbMCwgMjU1LCAxMjddXG4gICwgc3RlZWxibHVlOiBbNzAsIDEzMCwgMTgwXVxuICAsIHRhbjogWzIxMCwgMTgwLCAxNDBdXG4gICwgdGVhbDogWzAsIDEyOCwgMTI4XVxuICAsIHRoaXN0bGU6IFsyMTYsIDE5MSwgMjE2XVxuICAsIHRvbWF0bzogWzI1NSwgOTksIDcxXVxuICAsIHR1cnF1b2lzZTogWzY0LCAyMjQsIDIwOF1cbiAgLCB2aW9sZXQ6IFsyMzgsIDEzMCwgMjM4XVxuICAsIHdoZWF0OiBbMjQ1LCAyMjIsIDE3OV1cbiAgLCB3aGl0ZTogWzI1NSwgMjU1LCAyNTVdXG4gICwgd2hpdGVzbW9rZTogWzI0NSwgMjQ1LCAyNDVdXG4gICwgeWVsbG93OiBbMjU1LCAyNTUsIDBdXG4gICwgeWVsbG93Z3JlZW46IFsxNTQsIDIwNSwgNV1cbn07IiwiXG4vKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxudmFyIGNvbG9ycyA9IHJlcXVpcmUoJy4vY29sb3JzJyk7XG5cbi8qKlxuICogRXhwb3NlIGBwYXJzZWAuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBwYXJzZTtcblxuLyoqXG4gKiBQYXJzZSBgc3RyYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIHBhcnNlKHN0cikge1xuICByZXR1cm4gbmFtZWQoc3RyKVxuICAgIHx8IGhleDMoc3RyKVxuICAgIHx8IGhleDYoc3RyKVxuICAgIHx8IHJnYihzdHIpXG4gICAgfHwgcmdiYShzdHIpO1xufVxuXG4vKipcbiAqIFBhcnNlIG5hbWVkIGNzcyBjb2xvciBgc3RyYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBuYW1lZChzdHIpIHtcbiAgdmFyIGMgPSBjb2xvcnNbc3RyLnRvTG93ZXJDYXNlKCldO1xuICBpZiAoIWMpIHJldHVybjtcbiAgcmV0dXJuIHtcbiAgICByOiBjWzBdLFxuICAgIGc6IGNbMV0sXG4gICAgYjogY1syXVxuICB9XG59XG5cbi8qKlxuICogUGFyc2UgcmdiKG4sIG4sIG4pXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gcmdiKHN0cikge1xuICBpZiAoMCA9PSBzdHIuaW5kZXhPZigncmdiKCcpKSB7XG4gICAgc3RyID0gc3RyLm1hdGNoKC9yZ2JcXCgoW14pXSspXFwpLylbMV07XG4gICAgdmFyIHBhcnRzID0gc3RyLnNwbGl0KC8gKiwgKi8pLm1hcChOdW1iZXIpO1xuICAgIHJldHVybiB7XG4gICAgICByOiBwYXJ0c1swXSxcbiAgICAgIGc6IHBhcnRzWzFdLFxuICAgICAgYjogcGFydHNbMl0sXG4gICAgICBhOiAxXG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogUGFyc2UgcmdiYShuLCBuLCBuLCBuKVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHJnYmEoc3RyKSB7XG4gIGlmICgwID09IHN0ci5pbmRleE9mKCdyZ2JhKCcpKSB7XG4gICAgc3RyID0gc3RyLm1hdGNoKC9yZ2JhXFwoKFteKV0rKVxcKS8pWzFdO1xuICAgIHZhciBwYXJ0cyA9IHN0ci5zcGxpdCgvICosICovKS5tYXAoTnVtYmVyKTtcbiAgICByZXR1cm4ge1xuICAgICAgcjogcGFydHNbMF0sXG4gICAgICBnOiBwYXJ0c1sxXSxcbiAgICAgIGI6IHBhcnRzWzJdLFxuICAgICAgYTogcGFydHNbM11cbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBQYXJzZSAjbm5ubm5uXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gaGV4NihzdHIpIHtcbiAgaWYgKCcjJyA9PSBzdHJbMF0gJiYgNyA9PSBzdHIubGVuZ3RoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHI6IHBhcnNlSW50KHN0ci5zbGljZSgxLCAzKSwgMTYpLFxuICAgICAgZzogcGFyc2VJbnQoc3RyLnNsaWNlKDMsIDUpLCAxNiksXG4gICAgICBiOiBwYXJzZUludChzdHIuc2xpY2UoNSwgNyksIDE2KSxcbiAgICAgIGE6IDFcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBQYXJzZSAjbm5uXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gaGV4MyhzdHIpIHtcbiAgaWYgKCcjJyA9PSBzdHJbMF0gJiYgNCA9PSBzdHIubGVuZ3RoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHI6IHBhcnNlSW50KHN0clsxXSArIHN0clsxXSwgMTYpLFxuICAgICAgZzogcGFyc2VJbnQoc3RyWzJdICsgc3RyWzJdLCAxNiksXG4gICAgICBiOiBwYXJzZUludChzdHJbM10gKyBzdHJbM10sIDE2KSxcbiAgICAgIGE6IDFcbiAgICB9XG4gIH1cbn1cblxuIiwidmFyIGFwcGx5ID0gRnVuY3Rpb24ucHJvdG90eXBlLmFwcGx5XG5tb2R1bGUuZXhwb3J0cyA9IGZjb21wXG5cbmZ1bmN0aW9uIGZjb21wKCkge1xuICB2YXIgZm5zID0gYXJndW1lbnRzXG4gICAgLCBsZW4gPSBmbnMubGVuZ3RoXG4gICAgLCBmbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgdmFsID0gYXBwbHkuY2FsbChmbnNbMF0sIG51bGwsIGFyZ3VtZW50cylcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBsZW47IGkrKylcbiAgICAgICAgICB2YWwgPSBmbnNbaV0odmFsKVxuICAgICAgICByZXR1cm4gdmFsXG4gICAgICB9XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspXG4gICAgZm4uZGlzcGxheU5hbWUgPSAoZm4uZGlzcGxheU5hbWUgfHwgJycpXG4gICAgICArIChpID09PSAwID8gJycgOiAnIMK3ICcpXG4gICAgICArIGZuc1tpXS5uYW1lXG4gIHJldHVybiBmblxufVxuXG5mY29tcC5yZXZlcnNlID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiBmY29tcC5hcHBseShudWxsLCBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cykucmV2ZXJzZSgpKVxufVxuIiwiXCJ1c2Ugc3RyaWN0XCJcblxuZnVuY3Rpb24gYWRkTGF6eVByb3BlcnR5KG9iamVjdCwgbmFtZSwgaW5pdGlhbGl6ZXIsIGVudW1lcmFibGUpIHtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iamVjdCwgbmFtZSwge1xuICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgdiA9IGluaXRpYWxpemVyLmNhbGwodGhpcylcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBuYW1lLCB7IHZhbHVlOiB2LCBlbnVtZXJhYmxlOiAhIWVudW1lcmFibGUsIHdyaXRhYmxlOiB0cnVlIH0pXG4gICAgICByZXR1cm4gdlxuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbih2KSB7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgbmFtZSwgeyB2YWx1ZTogdiwgZW51bWVyYWJsZTogISFlbnVtZXJhYmxlLCB3cml0YWJsZTogdHJ1ZSB9KVxuICAgICAgcmV0dXJuIHZcbiAgICB9LFxuICAgIGVudW1lcmFibGU6ICEhZW51bWVyYWJsZSxcbiAgICBjb25maWd1cmFibGU6IHRydWVcbiAgfSlcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBhZGRMYXp5UHJvcGVydHlcbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIi4vbGF6eVByb3BlcnR5LmpzXCIpIiwiXG52YXIgz4AgPSBNYXRoLlBJXG52YXIgXzEyMCA9IHJhZGlhbnMoMTIwKVxuXG5tb2R1bGUuZXhwb3J0cyA9IG5vcm1hbGl6ZVxuXG4vKipcbiAqIGRlc2NyaWJlIGBwYXRoYCBpbiB0ZXJtcyBvZiBjdWJpYyBiw6l6aWVyIFxuICogY3VydmVzIGFuZCBtb3ZlIGNvbW1hbmRzXG4gKlxuICogQHBhcmFtIHtBcnJheX0gcGF0aFxuICogQHJldHVybiB7QXJyYXl9XG4gKi9cblxuZnVuY3Rpb24gbm9ybWFsaXplKHBhdGgpe1xuXHQvLyBpbml0IHN0YXRlXG5cdHZhciBwcmV2XG5cdHZhciByZXN1bHQgPSBbXVxuXHR2YXIgYmV6aWVyWCA9IDBcblx0dmFyIGJlemllclkgPSAwXG5cdHZhciBzdGFydFggPSAwXG5cdHZhciBzdGFydFkgPSAwXG5cdHZhciBxdWFkWCA9IG51bGxcblx0dmFyIHF1YWRZID0gbnVsbFxuXHR2YXIgeCA9IDBcblx0dmFyIHkgPSAwXG5cblx0Zm9yICh2YXIgaSA9IDAsIGxlbiA9IHBhdGgubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcblx0XHR2YXIgc2VnID0gcGF0aFtpXVxuXHRcdHZhciBjb21tYW5kID0gc2VnWzBdXG5cdFx0c3dpdGNoIChjb21tYW5kKSB7XG5cdFx0XHRjYXNlICdNJzpcblx0XHRcdFx0c3RhcnRYID0gc2VnWzFdXG5cdFx0XHRcdHN0YXJ0WSA9IHNlZ1syXVxuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSAnQSc6XG5cdFx0XHRcdHNlZyA9IGFyYyh4LCB5LHNlZ1sxXSxzZWdbMl0scmFkaWFucyhzZWdbM10pLHNlZ1s0XSxzZWdbNV0sc2VnWzZdLHNlZ1s3XSlcblx0XHRcdFx0Ly8gc3BsaXQgbXVsdGkgcGFydFxuXHRcdFx0XHRzZWcudW5zaGlmdCgnQycpXG5cdFx0XHRcdGlmIChzZWcubGVuZ3RoID4gNykge1xuXHRcdFx0XHRcdHJlc3VsdC5wdXNoKHNlZy5zcGxpY2UoMCwgNykpXG5cdFx0XHRcdFx0c2VnLnVuc2hpZnQoJ0MnKVxuXHRcdFx0XHR9XG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlICdTJzpcblx0XHRcdFx0Ly8gZGVmYXVsdCBjb250cm9sIHBvaW50XG5cdFx0XHRcdHZhciBjeCA9IHhcblx0XHRcdFx0dmFyIGN5ID0geVxuXHRcdFx0XHRpZiAocHJldiA9PSAnQycgfHwgcHJldiA9PSAnUycpIHtcblx0XHRcdFx0XHRjeCArPSBjeCAtIGJlemllclggLy8gcmVmbGVjdCB0aGUgcHJldmlvdXMgY29tbWFuZCdzIGNvbnRyb2xcblx0XHRcdFx0XHRjeSArPSBjeSAtIGJlemllclkgLy8gcG9pbnQgcmVsYXRpdmUgdG8gdGhlIGN1cnJlbnQgcG9pbnRcblx0XHRcdFx0fVxuXHRcdFx0XHRzZWcgPSBbJ0MnLCBjeCwgY3ksIHNlZ1sxXSwgc2VnWzJdLCBzZWdbM10sIHNlZ1s0XV1cblx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgJ1QnOlxuXHRcdFx0XHRpZiAocHJldiA9PSAnUScgfHwgcHJldiA9PSAnVCcpIHtcblx0XHRcdFx0XHRxdWFkWCA9IHggKiAyIC0gcXVhZFggLy8gYXMgd2l0aCAnUycgcmVmbGVjdCBwcmV2aW91cyBjb250cm9sIHBvaW50XG5cdFx0XHRcdFx0cXVhZFkgPSB5ICogMiAtIHF1YWRZXG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cXVhZFggPSB4XG5cdFx0XHRcdFx0cXVhZFkgPSB5XG5cdFx0XHRcdH1cblx0XHRcdFx0c2VnID0gcXVhZHJhdGljKHgsIHksIHF1YWRYLCBxdWFkWSwgc2VnWzFdLCBzZWdbMl0pXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlICdRJzpcblx0XHRcdFx0cXVhZFggPSBzZWdbMV1cblx0XHRcdFx0cXVhZFkgPSBzZWdbMl1cblx0XHRcdFx0c2VnID0gcXVhZHJhdGljKHgsIHksIHNlZ1sxXSwgc2VnWzJdLCBzZWdbM10sIHNlZ1s0XSlcblx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgJ0wnOlxuXHRcdFx0XHRzZWcgPSBsaW5lKHgsIHksIHNlZ1sxXSwgc2VnWzJdKVxuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSAnSCc6XG5cdFx0XHRcdHNlZyA9IGxpbmUoeCwgeSwgc2VnWzFdLCB5KVxuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSAnVic6XG5cdFx0XHRcdHNlZyA9IGxpbmUoeCwgeSwgeCwgc2VnWzFdKVxuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSAnWic6XG5cdFx0XHRcdHNlZyA9IGxpbmUoeCwgeSwgc3RhcnRYLCBzdGFydFkpXG5cdFx0XHRcdGJyZWFrXG5cdFx0fVxuXG5cdFx0Ly8gdXBkYXRlIHN0YXRlXG5cdFx0cHJldiA9IGNvbW1hbmRcblx0XHR4ID0gc2VnW3NlZy5sZW5ndGggLSAyXVxuXHRcdHkgPSBzZWdbc2VnLmxlbmd0aCAtIDFdXG5cdFx0aWYgKHNlZy5sZW5ndGggPiA0KSB7XG5cdFx0XHRiZXppZXJYID0gc2VnW3NlZy5sZW5ndGggLSA0XVxuXHRcdFx0YmV6aWVyWSA9IHNlZ1tzZWcubGVuZ3RoIC0gM11cblx0XHR9IGVsc2Uge1xuXHRcdFx0YmV6aWVyWCA9IHhcblx0XHRcdGJlemllclkgPSB5XG5cdFx0fVxuXHRcdHJlc3VsdC5wdXNoKHNlZylcblx0fVxuXG5cdHJldHVybiByZXN1bHRcbn1cblxuZnVuY3Rpb24gbGluZSh4MSwgeTEsIHgyLCB5Mil7XG5cdHJldHVybiBbJ0MnLCB4MSwgeTEsIHgyLCB5MiwgeDIsIHkyXVxufVxuXG5mdW5jdGlvbiBxdWFkcmF0aWMoeDEsIHkxLCBjeCwgY3ksIHgyLCB5Mil7XG5cdHJldHVybiBbXG5cdFx0J0MnLFxuXHRcdHgxLzMgKyAoMi8zKSAqIGN4LFxuXHRcdHkxLzMgKyAoMi8zKSAqIGN5LFxuXHRcdHgyLzMgKyAoMi8zKSAqIGN4LFxuXHRcdHkyLzMgKyAoMi8zKSAqIGN5LFxuXHRcdHgyLFxuXHRcdHkyXG5cdF1cbn1cblxuLy8gVGhpcyBmdW5jdGlvbiBpcyByaXBwZWQgZnJvbSBcbi8vIGdpdGh1Yi5jb20vRG1pdHJ5QmFyYW5vdnNraXkvcmFwaGFlbC9ibG9iLzRkOTdkNC9yYXBoYWVsLmpzI0wyMjE2LUwyMzA0IFxuLy8gd2hpY2ggcmVmZXJlbmNlcyB3My5vcmcvVFIvU1ZHMTEvaW1wbG5vdGUuaHRtbCNBcmNJbXBsZW1lbnRhdGlvbk5vdGVzXG4vLyBUT0RPOiBtYWtlIGl0IGh1bWFuIHJlYWRhYmxlXG5cbmZ1bmN0aW9uIGFyYyh4MSwgeTEsIHJ4LCByeSwgYW5nbGUsIGxhcmdlX2FyY19mbGFnLCBzd2VlcF9mbGFnLCB4MiwgeTIsIHJlY3Vyc2l2ZSkge1xuXHRpZiAoIXJlY3Vyc2l2ZSkge1xuXHRcdHZhciB4eSA9IHJvdGF0ZSh4MSwgeTEsIC1hbmdsZSlcblx0XHR4MSA9IHh5Lnhcblx0XHR5MSA9IHh5Lnlcblx0XHR4eSA9IHJvdGF0ZSh4MiwgeTIsIC1hbmdsZSlcblx0XHR4MiA9IHh5Lnhcblx0XHR5MiA9IHh5Lnlcblx0XHR2YXIgeCA9ICh4MSAtIHgyKSAvIDJcblx0XHR2YXIgeSA9ICh5MSAtIHkyKSAvIDJcblx0XHR2YXIgaCA9ICh4ICogeCkgLyAocnggKiByeCkgKyAoeSAqIHkpIC8gKHJ5ICogcnkpXG5cdFx0aWYgKGggPiAxKSB7XG5cdFx0XHRoID0gTWF0aC5zcXJ0KGgpXG5cdFx0XHRyeCA9IGggKiByeFxuXHRcdFx0cnkgPSBoICogcnlcblx0XHR9XG5cdFx0dmFyIHJ4MiA9IHJ4ICogcnhcblx0XHR2YXIgcnkyID0gcnkgKiByeVxuXHRcdHZhciBrID0gKGxhcmdlX2FyY19mbGFnID09IHN3ZWVwX2ZsYWcgPyAtMSA6IDEpXG5cdFx0XHQqIE1hdGguc3FydChNYXRoLmFicygocngyICogcnkyIC0gcngyICogeSAqIHkgLSByeTIgKiB4ICogeCkgLyAocngyICogeSAqIHkgKyByeTIgKiB4ICogeCkpKVxuXHRcdGlmIChrID09IEluZmluaXR5KSBrID0gMSAvLyBuZXV0cmFsaXplXG5cdFx0dmFyIGN4ID0gayAqIHJ4ICogeSAvIHJ5ICsgKHgxICsgeDIpIC8gMlxuXHRcdHZhciBjeSA9IGsgKiAtcnkgKiB4IC8gcnggKyAoeTEgKyB5MikgLyAyXG5cdFx0dmFyIGYxID0gTWF0aC5hc2luKCgoeTEgLSBjeSkgLyByeSkudG9GaXhlZCg5KSlcblx0XHR2YXIgZjIgPSBNYXRoLmFzaW4oKCh5MiAtIGN5KSAvIHJ5KS50b0ZpeGVkKDkpKVxuXG5cdFx0ZjEgPSB4MSA8IGN4ID8gz4AgLSBmMSA6IGYxXG5cdFx0ZjIgPSB4MiA8IGN4ID8gz4AgLSBmMiA6IGYyXG5cdFx0aWYgKGYxIDwgMCkgZjEgPSDPgCAqIDIgKyBmMVxuXHRcdGlmIChmMiA8IDApIGYyID0gz4AgKiAyICsgZjJcblx0XHRpZiAoc3dlZXBfZmxhZyAmJiBmMSA+IGYyKSBmMSA9IGYxIC0gz4AgKiAyXG5cdFx0aWYgKCFzd2VlcF9mbGFnICYmIGYyID4gZjEpIGYyID0gZjIgLSDPgCAqIDJcblx0fSBlbHNlIHtcblx0XHRmMSA9IHJlY3Vyc2l2ZVswXVxuXHRcdGYyID0gcmVjdXJzaXZlWzFdXG5cdFx0Y3ggPSByZWN1cnNpdmVbMl1cblx0XHRjeSA9IHJlY3Vyc2l2ZVszXVxuXHR9XG5cdC8vIGdyZWF0ZXIgdGhhbiAxMjAgZGVncmVlcyByZXF1aXJlcyBtdWx0aXBsZSBzZWdtZW50c1xuXHRpZiAoTWF0aC5hYnMoZjIgLSBmMSkgPiBfMTIwKSB7XG5cdFx0dmFyIGYyb2xkID0gZjJcblx0XHR2YXIgeDJvbGQgPSB4MlxuXHRcdHZhciB5Mm9sZCA9IHkyXG5cdFx0ZjIgPSBmMSArIF8xMjAgKiAoc3dlZXBfZmxhZyAmJiBmMiA+IGYxID8gMSA6IC0xKVxuXHRcdHgyID0gY3ggKyByeCAqIE1hdGguY29zKGYyKVxuXHRcdHkyID0gY3kgKyByeSAqIE1hdGguc2luKGYyKVxuXHRcdHZhciByZXMgPSBhcmMoeDIsIHkyLCByeCwgcnksIGFuZ2xlLCAwLCBzd2VlcF9mbGFnLCB4Mm9sZCwgeTJvbGQsIFtmMiwgZjJvbGQsIGN4LCBjeV0pXG5cdH1cblx0dmFyIHQgPSBNYXRoLnRhbigoZjIgLSBmMSkgLyA0KVxuXHR2YXIgaHggPSA0IC8gMyAqIHJ4ICogdFxuXHR2YXIgaHkgPSA0IC8gMyAqIHJ5ICogdFxuXHR2YXIgY3VydmUgPSBbXG5cdFx0MiAqIHgxIC0gKHgxICsgaHggKiBNYXRoLnNpbihmMSkpLFxuXHRcdDIgKiB5MSAtICh5MSAtIGh5ICogTWF0aC5jb3MoZjEpKSxcblx0XHR4MiArIGh4ICogTWF0aC5zaW4oZjIpLFxuXHRcdHkyIC0gaHkgKiBNYXRoLmNvcyhmMiksXG5cdFx0eDIsXG5cdFx0eTJcblx0XVxuXHRpZiAocmVjdXJzaXZlKSByZXR1cm4gY3VydmVcblx0aWYgKHJlcykgY3VydmUgPSBjdXJ2ZS5jb25jYXQocmVzKVxuXHRmb3IgKHZhciBpID0gMDsgaSA8IGN1cnZlLmxlbmd0aDspIHtcblx0XHR2YXIgcm90ID0gcm90YXRlKGN1cnZlW2ldLCBjdXJ2ZVtpKzFdLCBhbmdsZSlcblx0XHRjdXJ2ZVtpKytdID0gcm90Lnhcblx0XHRjdXJ2ZVtpKytdID0gcm90Lnlcblx0fVxuXHRyZXR1cm4gY3VydmVcbn1cblxuZnVuY3Rpb24gcm90YXRlKHgsIHksIHJhZCl7XG5cdHJldHVybiB7XG5cdFx0eDogeCAqIE1hdGguY29zKHJhZCkgLSB5ICogTWF0aC5zaW4ocmFkKSxcblx0XHR5OiB4ICogTWF0aC5zaW4ocmFkKSArIHkgKiBNYXRoLmNvcyhyYWQpXG5cdH1cbn1cblxuZnVuY3Rpb24gcmFkaWFucyhkZWdyZXNzKXtcblx0cmV0dXJuIGRlZ3Jlc3MgKiAoz4AgLyAxODApXG59XG4iLCJcbnZhciBkdXJhdGlvbiA9IC8oLT9cXGQqXFwuP1xcZCsoPzplWy0rXT9cXGQrKT8pXFxzKihbYS16XSopL2lnXG5cbm1vZHVsZS5leHBvcnRzID0gcGFyc2VcblxuLyoqXG4gKiBjb252ZXJzaW9uIHJhdGlvc1xuICovXG5cbnBhcnNlLm1zID0gMVxucGFyc2Uuc2Vjb25kcyA9XG5wYXJzZS5zZWNvbmQgPVxucGFyc2Uuc2VjID1cbnBhcnNlLnMgPSBwYXJzZS5tcyAqIDEwMDBcbnBhcnNlLm1pbnV0ZXMgPVxucGFyc2UubWludXRlID1cbnBhcnNlLm1pbiA9XG5wYXJzZS5taW5zID1cbnBhcnNlLm0gPSBwYXJzZS5zICogNjBcbnBhcnNlLmhvdXJzID1cbnBhcnNlLmhvdXIgPVxucGFyc2UuaHIgPVxucGFyc2UuaCA9IHBhcnNlLm0gKiA2MFxucGFyc2UuZGF5cyA9XG5wYXJzZS5kYXkgPVxucGFyc2UuZCA9IHBhcnNlLmggKiAyNFxucGFyc2Uud2Vla3MgPVxucGFyc2Uud2VlayA9XG5wYXJzZS53ayA9XG5wYXJzZS53ID0gcGFyc2UuZCAqIDdcbnBhcnNlLnllYXJzID1cbnBhcnNlLnllYXIgPVxucGFyc2UueXIgPVxucGFyc2UueSA9IHBhcnNlLmQgKiAzNjUuMjVcblxuLyoqXG4gKiBjb252ZXJ0IGBzdHJgIHRvIG1zXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7TnVtYmVyfVxuICovXG5cbmZ1bmN0aW9uIHBhcnNlKHN0cil7XG5cdHZhciByZXN1bHQgPSAwXG5cdHN0ci5yZXBsYWNlKGR1cmF0aW9uLCBmdW5jdGlvbihfLCBuLCB1bml0cyl7XG5cdFx0cmVzdWx0ICs9IHBhcnNlRmxvYXQobiwgMTApICogKHBhcnNlW3VuaXRzXSB8fCAxKVxuXHR9KVxuXHRyZXR1cm4gcmVzdWx0XG59XG4iLCJcbm1vZHVsZS5leHBvcnRzID0gcGFyc2VcblxuLyoqXG4gKiBleHBlY3RlZCBhcmd1bWVudCBsZW5ndGhzXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5cbnZhciBsZW5ndGggPSB7YTogNywgYzogNiwgaDogMSwgbDogMiwgbTogMiwgcTogNCwgczogNCwgdDogMiwgdjogMSwgejogMH1cblxuLyoqXG4gKiBzZWdtZW50IHBhdHRlcm5cbiAqIEB0eXBlIHtSZWdFeHB9XG4gKi9cblxudmFyIHNlZ21lbnQgPSAvKFthc3R2enFtaGxjXSkoW15hc3R2enFtaGxjXSopL2lnXG5cbi8qKlxuICogcGFyc2UgYW4gc3ZnIHBhdGggZGF0YSBzdHJpbmcuIEdlbmVyYXRlcyBhbiBBcnJheVxuICogb2YgY29tbWFuZHMgd2hlcmUgZWFjaCBjb21tYW5kIGlzIGFuIEFycmF5IG9mIHRoZVxuICogZm9ybSBgW2NvbW1hbmQsIGFyZzEsIGFyZzIsIC4uLl1gXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHBhdGhcbiAqIEByZXR1cm4ge0FycmF5fVxuICovXG5cbmZ1bmN0aW9uIHBhcnNlKHBhdGgpIHtcblx0dmFyIGRhdGEgPSBbXVxuXHRwYXRoLnJlcGxhY2Uoc2VnbWVudCwgZnVuY3Rpb24oXywgY29tbWFuZCwgYXJncyl7XG5cdFx0dmFyIHR5cGUgPSBjb21tYW5kLnRvTG93ZXJDYXNlKClcblx0XHRhcmdzID0gcGFyc2VWYWx1ZXMoYXJncylcblxuXHRcdC8vIG92ZXJsb2FkZWQgbW92ZVRvXG5cdFx0aWYgKHR5cGUgPT0gJ20nICYmIGFyZ3MubGVuZ3RoID4gMikge1xuXHRcdFx0ZGF0YS5wdXNoKFtjb21tYW5kXS5jb25jYXQoYXJncy5zcGxpY2UoMCwgMikpKVxuXHRcdFx0dHlwZSA9ICdsJ1xuXHRcdFx0Y29tbWFuZCA9IGNvbW1hbmQgPT0gJ20nID8gJ2wnIDogJ0wnXG5cdFx0fVxuXG5cdFx0d2hpbGUgKHRydWUpIHtcblx0XHRcdGlmIChhcmdzLmxlbmd0aCA9PSBsZW5ndGhbdHlwZV0pIHtcblx0XHRcdFx0YXJncy51bnNoaWZ0KGNvbW1hbmQpXG5cdFx0XHRcdHJldHVybiBkYXRhLnB1c2goYXJncylcblx0XHRcdH1cblx0XHRcdGlmIChhcmdzLmxlbmd0aCA8IGxlbmd0aFt0eXBlXSkgdGhyb3cgbmV3IEVycm9yKCdtYWxmb3JtZWQgcGF0aCBkYXRhJylcblx0XHRcdGRhdGEucHVzaChbY29tbWFuZF0uY29uY2F0KGFyZ3Muc3BsaWNlKDAsIGxlbmd0aFt0eXBlXSkpKVxuXHRcdH1cblx0fSlcblx0cmV0dXJuIGRhdGFcbn1cblxuZnVuY3Rpb24gcGFyc2VWYWx1ZXMoYXJncyl7XG5cdGFyZ3MgPSBhcmdzLm1hdGNoKC8tP1suMC05XSsoPzplWy0rXT9cXGQrKT8vaWcpXG5cdHJldHVybiBhcmdzID8gYXJncy5tYXAoTnVtYmVyKSA6IFtdXG59XG4iLCJcbnZhciBzdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKS5zdHlsZVxudmFyIHByZWZpeGVzID0gJ08gbXMgTW96IHdlYmtpdCcuc3BsaXQoJyAnKVxudmFyIHVwcGVyID0gLyhbQS1aXSkvZ1xuXG52YXIgbWVtbyA9IHt9XG5cbi8qKlxuICogbWVtb2l6ZWQgYHByZWZpeGBcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IGZ1bmN0aW9uKGtleSl7XG4gIHJldHVybiBrZXkgaW4gbWVtb1xuICAgID8gbWVtb1trZXldXG4gICAgOiBtZW1vW2tleV0gPSBwcmVmaXgoa2V5KVxufVxuXG5leHBvcnRzLnByZWZpeCA9IHByZWZpeFxuZXhwb3J0cy5kYXNoID0gZGFzaGVkUHJlZml4XG5cbi8qKlxuICogcHJlZml4IGBrZXlgXG4gKlxuICogICBwcmVmaXgoJ3RyYW5zZm9ybScpIC8vID0+IHdlYmtpdFRyYW5zZm9ybVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gcHJlZml4KGtleSl7XG4gIC8vIGNhbWVsIGNhc2VcbiAga2V5ID0ga2V5LnJlcGxhY2UoLy0oW2Etel0pL2csIGZ1bmN0aW9uKF8sIGNoYXIpe1xuICAgIHJldHVybiBjaGFyLnRvVXBwZXJDYXNlKClcbiAgfSlcblxuICAvLyB3aXRob3V0IHByZWZpeFxuICBpZiAoc3R5bGVba2V5XSAhPT0gdW5kZWZpbmVkKSByZXR1cm4ga2V5XG5cbiAgLy8gd2l0aCBwcmVmaXhcbiAgdmFyIEtleSA9IGNhcGl0YWxpemUoa2V5KVxuICB2YXIgaSA9IHByZWZpeGVzLmxlbmd0aFxuICB3aGlsZSAoaS0tKSB7XG4gICAgdmFyIG5hbWUgPSBwcmVmaXhlc1tpXSArIEtleVxuICAgIGlmIChzdHlsZVtuYW1lXSAhPT0gdW5kZWZpbmVkKSByZXR1cm4gbmFtZVxuICB9XG5cbiAgdGhyb3cgbmV3IEVycm9yKCd1bmFibGUgdG8gcHJlZml4ICcgKyBrZXkpXG59XG5cbmZ1bmN0aW9uIGNhcGl0YWxpemUoc3RyKXtcbiAgcmV0dXJuIHN0ci5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHN0ci5zbGljZSgxKVxufVxuXG4vKipcbiAqIGNyZWF0ZSBhIGRhc2hlcml6ZWQgcHJlZml4XG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBkYXNoZWRQcmVmaXgoa2V5KXtcbiAga2V5ID0gcHJlZml4KGtleSlcbiAgaWYgKHVwcGVyLnRlc3Qoa2V5KSkga2V5ID0gJy0nICsga2V5LnJlcGxhY2UodXBwZXIsICctJDEnKVxuICByZXR1cm4ga2V5LnRvTG93ZXJDYXNlKClcbn1cbiIsIlxuLyoqXG4gKiBSZXR1cm4gaW1tZWRpYXRlIGlkZW50aWZpZXJzIHBhcnNlZCBmcm9tIGBzdHJgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge0FycmF5fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHN0ciwgcHJlZml4KXtcbiAgdmFyIHAgPSB1bmlxdWUocHJvcHMoc3RyKSk7XG4gIGlmIChwcmVmaXgpIHJldHVybiBwcmVmaXhlZChzdHIsIHAsIHByZWZpeCk7XG4gIHJldHVybiBwO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gaW1tZWRpYXRlIGlkZW50aWZpZXJzIGluIGBzdHJgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge0FycmF5fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gcHJvcHMoc3RyKSB7XG4gIHJldHVybiBzdHJcbiAgICAucmVwbGFjZSgvXFwuXFx3K3xcXHcrICpcXCh8XCJbXlwiXSpcInwnW14nXSonfFxcLyhbXi9dKylcXC8vZywgJycpXG4gICAgLm1hdGNoKC9bYS16QS1aX11cXHcqL2cpXG4gICAgfHwgW107XG59XG5cbi8qKlxuICogUmV0dXJuIGBzdHJgIHdpdGggYHByb3BzYCBwcmVmaXhlZCB3aXRoIGBwcmVmaXhgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEBwYXJhbSB7QXJyYXl9IHByb3BzXG4gKiBAcGFyYW0ge1N0cmluZ30gcHJlZml4XG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBwcmVmaXhlZChzdHIsIHByb3BzLCBwcmVmaXgpIHtcbiAgdmFyIHJlID0gL1xcLlxcdyt8XFx3KyAqXFwofFwiW15cIl0qXCJ8J1teJ10qJ3xcXC8oW14vXSspXFwvfFthLXpBLVpfXVxcdyovZztcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKHJlLCBmdW5jdGlvbihfKXtcbiAgICBpZiAoJygnID09IF9bXy5sZW5ndGggLSAxXSkgcmV0dXJuIHByZWZpeCArIF87XG4gICAgaWYgKCF+cHJvcHMuaW5kZXhPZihfKSkgcmV0dXJuIF87XG4gICAgcmV0dXJuIHByZWZpeCArIF87XG4gIH0pO1xufVxuXG4vKipcbiAqIFJldHVybiB1bmlxdWUgYXJyYXkuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gYXJyXG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHVuaXF1ZShhcnIpIHtcbiAgdmFyIHJldCA9IFtdO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKH5yZXQuaW5kZXhPZihhcnJbaV0pKSBjb250aW51ZTtcbiAgICByZXQucHVzaChhcnJbaV0pO1xuICB9XG5cbiAgcmV0dXJuIHJldDtcbn1cbiIsIlxubW9kdWxlLmV4cG9ydHMgPSByZWxhdGl2ZVxuXG4vKipcbiAqIGRlZmluZSBgcGF0aGAgdXNpbmcgcmVsYXRpdmUgcG9pbnRzXG4gKlxuICogQHBhcmFtIHtBcnJheX0gcGF0aFxuICogQHJldHVybiB7QXJyYXl9XG4gKi9cblxuZnVuY3Rpb24gcmVsYXRpdmUocGF0aCl7XG5cdHZhciBzdGFydFggPSAwXG5cdHZhciBzdGFydFkgPSAwXG5cdHZhciB4ID0gMFxuXHR2YXIgeSA9IDBcblxuXHRyZXR1cm4gcGF0aC5tYXAoZnVuY3Rpb24oc2VnKXtcblx0XHRzZWcgPSBzZWcuc2xpY2UoKVxuXHRcdHZhciB0eXBlID0gc2VnWzBdXG5cdFx0dmFyIGNvbW1hbmQgPSB0eXBlLnRvTG93ZXJDYXNlKClcblxuXHRcdC8vIGlzIGFic29sdXRlXG5cdFx0aWYgKHR5cGUgIT0gY29tbWFuZCkge1xuXHRcdFx0c2VnWzBdID0gY29tbWFuZFxuXHRcdFx0c3dpdGNoICh0eXBlKSB7XG5cdFx0XHRcdGNhc2UgJ0EnOlxuXHRcdFx0XHRcdHNlZ1s2XSAtPSB4XG5cdFx0XHRcdFx0c2VnWzddIC09IHlcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRjYXNlICdWJzpcblx0XHRcdFx0XHRzZWdbMV0gLT0geVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdGNhc2UgJ0gnOlxuXHRcdFx0XHRcdHNlZ1sxXSAtPSB4XG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRmb3IgKHZhciBpID0gMTsgaSA8IHNlZy5sZW5ndGg7KSB7XG5cdFx0XHRcdFx0XHRzZWdbaSsrXSAtPSB4XG5cdFx0XHRcdFx0XHRzZWdbaSsrXSAtPSB5XG5cdFx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIHVwZGF0ZSBjdXJzb3Igc3RhdGVcblx0XHRzd2l0Y2ggKGNvbW1hbmQpIHtcblx0XHRcdGNhc2UgJ3onOlxuXHRcdFx0XHR4ID0gc3RhcnRYXG5cdFx0XHRcdHkgPSBzdGFydFlcblx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgJ2gnOlxuXHRcdFx0XHR4ICs9IHNlZ1sxXVxuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSAndic6XG5cdFx0XHRcdHkgKz0gc2VnWzFdXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlICdtJzpcblx0XHRcdFx0eCArPSBzZWdbMV0gXG5cdFx0XHRcdHkgKz0gc2VnWzJdXG5cdFx0XHRcdHN0YXJ0WCArPSBzZWdbMV1cblx0XHRcdFx0c3RhcnRZICs9IHNlZ1syXVxuXHRcdFx0XHRicmVha1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0eCArPSBzZWdbc2VnLmxlbmd0aCAtIDJdXG5cdFx0XHRcdHkgKz0gc2VnW3NlZy5sZW5ndGggLSAxXVxuXHRcdH1cblxuXHRcdHJldHVybiBzZWdcblx0fSlcbn1cbiIsIlxubW9kdWxlLmV4cG9ydHMgPSBzZXJpYWxpemVcblxuLyoqXG4gKiBjb252ZXJ0IGBwYXRoYCB0byBhIHN0cmluZ1xuICpcbiAqIEBwYXJhbSB7QXJyYXl9IHBhdGhcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuXG5mdW5jdGlvbiBzZXJpYWxpemUocGF0aCl7XG5cdHJldHVybiBwYXRoLnJlZHVjZShmdW5jdGlvbihzdHIsIHNlZyl7XG5cdFx0cmV0dXJuIHN0ciArIHNlZ1swXSArIHNlZy5zbGljZSgxKS5qb2luKCcsJylcblx0fSwgJycpXG59XG4iLCJcbi8qKlxuICogbnVtYmVyIHBhdHRlcm5cbiAqIEB0eXBlIHtSZWdFeHB9XG4gKi9cblxudmFyIG51bWJlciA9IC9bLStdPyg/OlxcZCtcXC4/XFxkKnxcXC4/XFxkKykoPzpbZUVdWy0rXT9cXGQrKT8vZ1xuXG5tb2R1bGUuZXhwb3J0cyA9IHR3ZWVuXG5cbi8qKlxuICogY3JlYXRlIGEgdHdlZW4gZ2VuZXJhdG9yIGZyb20gYGFgIHRvIGBiYFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBhXG4gKiBAcGFyYW0ge1N0cmluZ30gYlxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKi9cblxuZnVuY3Rpb24gdHdlZW4oYSwgYil7XG5cdHZhciBzdHJpbmcgPSBbXVxuXHR2YXIga2V5cyA9IFtdXG5cdHZhciBmcm9tID0gW11cblx0dmFyIHRvID0gW11cblx0dmFyIGN1cnNvciA9IDBcblx0dmFyIG1cblxuXHR3aGlsZSAobSA9IG51bWJlci5leGVjKGIpKSB7XG5cdFx0aWYgKG0uaW5kZXggPiBjdXJzb3IpIHN0cmluZy5wdXNoKGIuc2xpY2UoY3Vyc29yLCBtLmluZGV4KSlcblx0XHR0by5wdXNoKE51bWJlcihtWzBdKSlcblx0XHRrZXlzLnB1c2goc3RyaW5nLmxlbmd0aClcblx0XHRzdHJpbmcucHVzaChudWxsKVxuXHRcdGN1cnNvciA9IG51bWJlci5sYXN0SW5kZXhcblx0fVxuXHRpZiAoY3Vyc29yIDwgYi5sZW5ndGgpIHN0cmluZy5wdXNoKGIuc2xpY2UoY3Vyc29yKSlcblxuXHR3aGlsZSAobSA9IG51bWJlci5leGVjKGEpKSBmcm9tLnB1c2goTnVtYmVyKG1bMF0pKVxuXG5cdHJldHVybiBmdW5jdGlvbiBmcmFtZShuKXtcblx0XHR2YXIgaSA9IGtleXMubGVuZ3RoXG5cdFx0d2hpbGUgKGktLSkgc3RyaW5nW2tleXNbaV1dID0gZnJvbVtpXSArICh0b1tpXSAtIGZyb21baV0pICogblxuXHRcdHJldHVybiBzdHJpbmcuam9pbignJylcblx0fVxufVxuIiwiXG4vKipcbiAqIEV4cG9zZSBgdG9Ob0Nhc2VgLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gdG9Ob0Nhc2U7XG5cblxuLyoqXG4gKiBUZXN0IHdoZXRoZXIgYSBzdHJpbmcgaXMgY2FtZWwtY2FzZS5cbiAqL1xuXG52YXIgaGFzU3BhY2UgPSAvXFxzLztcbnZhciBoYXNDYW1lbCA9IC9bYS16XVtBLVpdLztcbnZhciBoYXNTZXBhcmF0b3IgPSAvW1xcV19dLztcblxuXG4vKipcbiAqIFJlbW92ZSBhbnkgc3RhcnRpbmcgY2FzZSBmcm9tIGEgYHN0cmluZ2AsIGxpa2UgY2FtZWwgb3Igc25ha2UsIGJ1dCBrZWVwXG4gKiBzcGFjZXMgYW5kIHB1bmN0dWF0aW9uIHRoYXQgbWF5IGJlIGltcG9ydGFudCBvdGhlcndpc2UuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0cmluZ1xuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5cbmZ1bmN0aW9uIHRvTm9DYXNlIChzdHJpbmcpIHtcbiAgaWYgKGhhc1NwYWNlLnRlc3Qoc3RyaW5nKSkgcmV0dXJuIHN0cmluZy50b0xvd2VyQ2FzZSgpO1xuXG4gIGlmIChoYXNTZXBhcmF0b3IudGVzdChzdHJpbmcpKSBzdHJpbmcgPSB1bnNlcGFyYXRlKHN0cmluZyk7XG4gIGlmIChoYXNDYW1lbC50ZXN0KHN0cmluZykpIHN0cmluZyA9IHVuY2FtZWxpemUoc3RyaW5nKTtcbiAgcmV0dXJuIHN0cmluZy50b0xvd2VyQ2FzZSgpO1xufVxuXG5cbi8qKlxuICogU2VwYXJhdG9yIHNwbGl0dGVyLlxuICovXG5cbnZhciBzZXBhcmF0b3JTcGxpdHRlciA9IC9bXFxXX10rKC58JCkvZztcblxuXG4vKipcbiAqIFVuLXNlcGFyYXRlIGEgYHN0cmluZ2AuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0cmluZ1xuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5cbmZ1bmN0aW9uIHVuc2VwYXJhdGUgKHN0cmluZykge1xuICByZXR1cm4gc3RyaW5nLnJlcGxhY2Uoc2VwYXJhdG9yU3BsaXR0ZXIsIGZ1bmN0aW9uIChtLCBuZXh0KSB7XG4gICAgcmV0dXJuIG5leHQgPyAnICcgKyBuZXh0IDogJyc7XG4gIH0pO1xufVxuXG5cbi8qKlxuICogQ2FtZWxjYXNlIHNwbGl0dGVyLlxuICovXG5cbnZhciBjYW1lbFNwbGl0dGVyID0gLyguKShbQS1aXSspL2c7XG5cblxuLyoqXG4gKiBVbi1jYW1lbGNhc2UgYSBgc3RyaW5nYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyaW5nXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cblxuZnVuY3Rpb24gdW5jYW1lbGl6ZSAoc3RyaW5nKSB7XG4gIHJldHVybiBzdHJpbmcucmVwbGFjZShjYW1lbFNwbGl0dGVyLCBmdW5jdGlvbiAobSwgcHJldmlvdXMsIHVwcGVycykge1xuICAgIHJldHVybiBwcmV2aW91cyArICcgJyArIHVwcGVycy50b0xvd2VyQ2FzZSgpLnNwbGl0KCcnKS5qb2luKCcgJyk7XG4gIH0pO1xufSIsIlxudmFyIGNsZWFuID0gcmVxdWlyZSgndG8tbm8tY2FzZScpO1xuXG5cbi8qKlxuICogRXhwb3NlIGB0b1NwYWNlQ2FzZWAuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSB0b1NwYWNlQ2FzZTtcblxuXG4vKipcbiAqIENvbnZlcnQgYSBgc3RyaW5nYCB0byBzcGFjZSBjYXNlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJpbmdcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuXG5cbmZ1bmN0aW9uIHRvU3BhY2VDYXNlIChzdHJpbmcpIHtcbiAgcmV0dXJuIGNsZWFuKHN0cmluZykucmVwbGFjZSgvW1xcV19dKygufCQpL2csIGZ1bmN0aW9uIChtYXRjaGVzLCBtYXRjaCkge1xuICAgIHJldHVybiBtYXRjaCA/ICcgJyArIG1hdGNoIDogJyc7XG4gIH0pO1xufSIsIlxudmFyIG1vdmUgPSByZXF1aXJlKCdtb3ZlJylcbnZhciBkb20gPSByZXF1aXJlKCdkb20nKVxuXG5kb20oJy5leGFtcGxlJykuZWFjaChmdW5jdGlvbihleGFtcGxlKXtcbiAgZXhhbXBsZS5pbml0aWFsID0gZXhhbXBsZS5maW5kKCcuc2FuZGJveCcpLmh0bWwoKVxuICB2YXIgcGxheSA9IGV4YW1wbGUuZmluZCgnYnV0dG9uLnBsYXknKVxuICBleGFtcGxlLmZpbmQoJy5zb3VyY2UgY29kZScpLmh0bWwoaGlnaGxpZ2h0KGV4YW1wbGUuZmluZCgnLnNvdXJjZScpLnRleHQoKSkpXG5cbiAgaWYgKCFwbGF5Lmxlbmd0aCkgcmV0dXJuIHJ1bigpXG5cbiAgcGxheS5vbignbW91c2Vkb3duJywgcnVuKVxuXG4gIGV4YW1wbGUuZmluZCgnaDMnKS5hcHBlbmQoJzxidXR0b24gY2xhc3M9XCJyZXNldFwiPuKGuzwvYnV0dG9uPicpXG4gIGV4YW1wbGUuZmluZCgnYnV0dG9uLnJlc2V0Jykub24oJ21vdXNlZG93bicsIGZ1bmN0aW9uKGUpe1xuICAgIGV4YW1wbGUuZmluZCgnLnNhbmRib3gnKS5odG1sKGV4YW1wbGUuaW5pdGlhbClcbiAgfSlcblxuICBmdW5jdGlvbiBydW4oKXtcbiAgICB2YXIgYm94cyA9IGV4YW1wbGUuZmluZCgnLmJveC5zbWFsbCcpLnRvQXJyYXkoKVxuICAgIHZhciBzYW5kYm94ID0gZXhhbXBsZS5maW5kKCcuc2FuZGJveCcpWzBdXG4gICAgdmFyIGJveCA9IGJveHNbMF0gfHwgc2FuZGJveC5maXJzdENoaWxkXG4gICAgZXZhbChleGFtcGxlLmZpbmQoJy5zb3VyY2UnKS50ZXh0KCkpXG4gIH1cbn0pXG5cbi8qKlxuICogSGlnaGxpZ2h0IHRoZSBnaXZlbiBzdHJpbmcgb2YgYGpzYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30ganNcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGhpZ2hsaWdodChqcykge1xuICByZXR1cm4ganNcbiAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKVxuICAgIC5yZXBsYWNlKC9cXC9cXC8oLiopL2dtLCAnPHNwYW4gY2xhc3M9XCJjb21tZW50XCI+Ly8kMTwvc3Bhbj4nKVxuICAgIC5yZXBsYWNlKC8oJy4qPycpL2dtLCAnPHNwYW4gY2xhc3M9XCJzdHJpbmdcIj4kMTwvc3Bhbj4nKVxuICAgIC5yZXBsYWNlKC8oXFxkK1xcLlxcZCspL2dtLCAnPHNwYW4gY2xhc3M9XCJudW1iZXJcIj4kMTwvc3Bhbj4nKVxuICAgIC5yZXBsYWNlKC8oXFxkKykvZ20sICc8c3BhbiBjbGFzcz1cIm51bWJlclwiPiQxPC9zcGFuPicpXG4gICAgLnJlcGxhY2UoL1xcYm5ldyAqKFxcdyspL2dtLCAnPHNwYW4gY2xhc3M9XCJrZXl3b3JkXCI+bmV3PC9zcGFuPiA8c3BhbiBjbGFzcz1cImluaXRcIj4kMTwvc3Bhbj4nKVxuICAgIC5yZXBsYWNlKC9cXGIoZnVuY3Rpb258bmV3fHRocm93fHJldHVybnx2YXJ8aWZ8ZWxzZSlcXGIvZ20sICc8c3BhbiBjbGFzcz1cImtleXdvcmRcIj4kMTwvc3Bhbj4nKVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAodGV4dCkge1xuIHZhciBzdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJylcbiBzdHlsZS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh0ZXh0KSlcbiBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdLmFwcGVuZENoaWxkKHN0eWxlKVxufSIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBNZXJnZSB0d28gYXR0cmlidXRlIG9iamVjdHMgZ2l2aW5nIHByZWNlZGVuY2VcbiAqIHRvIHZhbHVlcyBpbiBvYmplY3QgYGJgLiBDbGFzc2VzIGFyZSBzcGVjaWFsLWNhc2VkXG4gKiBhbGxvd2luZyBmb3IgYXJyYXlzIGFuZCBtZXJnaW5nL2pvaW5pbmcgYXBwcm9wcmlhdGVseVxuICogcmVzdWx0aW5nIGluIGEgc3RyaW5nLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBhXG4gKiBAcGFyYW0ge09iamVjdH0gYlxuICogQHJldHVybiB7T2JqZWN0fSBhXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5leHBvcnRzLm1lcmdlID0gZnVuY3Rpb24gbWVyZ2UoYSwgYikge1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgIHZhciBhdHRycyA9IGFbMF07XG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhLmxlbmd0aDsgaSsrKSB7XG4gICAgICBhdHRycyA9IG1lcmdlKGF0dHJzLCBhW2ldKTtcbiAgICB9XG4gICAgcmV0dXJuIGF0dHJzO1xuICB9XG4gIHZhciBhYyA9IGFbJ2NsYXNzJ107XG4gIHZhciBiYyA9IGJbJ2NsYXNzJ107XG5cbiAgaWYgKGFjIHx8IGJjKSB7XG4gICAgYWMgPSBhYyB8fCBbXTtcbiAgICBiYyA9IGJjIHx8IFtdO1xuICAgIGlmICghQXJyYXkuaXNBcnJheShhYykpIGFjID0gW2FjXTtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoYmMpKSBiYyA9IFtiY107XG4gICAgYVsnY2xhc3MnXSA9IGFjLmNvbmNhdChiYykuZmlsdGVyKG51bGxzKTtcbiAgfVxuXG4gIGZvciAodmFyIGtleSBpbiBiKSB7XG4gICAgaWYgKGtleSAhPSAnY2xhc3MnKSB7XG4gICAgICBhW2tleV0gPSBiW2tleV07XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGE7XG59O1xuXG4vKipcbiAqIEZpbHRlciBudWxsIGB2YWxgcy5cbiAqXG4gKiBAcGFyYW0geyp9IHZhbFxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIG51bGxzKHZhbCkge1xuICByZXR1cm4gdmFsICE9IG51bGwgJiYgdmFsICE9PSAnJztcbn1cblxuLyoqXG4gKiBqb2luIGFycmF5IGFzIGNsYXNzZXMuXG4gKlxuICogQHBhcmFtIHsqfSB2YWxcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuZXhwb3J0cy5qb2luQ2xhc3NlcyA9IGpvaW5DbGFzc2VzO1xuZnVuY3Rpb24gam9pbkNsYXNzZXModmFsKSB7XG4gIHJldHVybiBBcnJheS5pc0FycmF5KHZhbCkgPyB2YWwubWFwKGpvaW5DbGFzc2VzKS5maWx0ZXIobnVsbHMpLmpvaW4oJyAnKSA6IHZhbDtcbn1cblxuLyoqXG4gKiBSZW5kZXIgdGhlIGdpdmVuIGNsYXNzZXMuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gY2xhc3Nlc1xuICogQHBhcmFtIHtBcnJheS48Qm9vbGVhbj59IGVzY2FwZWRcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuZXhwb3J0cy5jbHMgPSBmdW5jdGlvbiBjbHMoY2xhc3NlcywgZXNjYXBlZCkge1xuICB2YXIgYnVmID0gW107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgY2xhc3Nlcy5sZW5ndGg7IGkrKykge1xuICAgIGlmIChlc2NhcGVkICYmIGVzY2FwZWRbaV0pIHtcbiAgICAgIGJ1Zi5wdXNoKGV4cG9ydHMuZXNjYXBlKGpvaW5DbGFzc2VzKFtjbGFzc2VzW2ldXSkpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYnVmLnB1c2goam9pbkNsYXNzZXMoY2xhc3Nlc1tpXSkpO1xuICAgIH1cbiAgfVxuICB2YXIgdGV4dCA9IGpvaW5DbGFzc2VzKGJ1Zik7XG4gIGlmICh0ZXh0Lmxlbmd0aCkge1xuICAgIHJldHVybiAnIGNsYXNzPVwiJyArIHRleHQgKyAnXCInO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiAnJztcbiAgfVxufTtcblxuLyoqXG4gKiBSZW5kZXIgdGhlIGdpdmVuIGF0dHJpYnV0ZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gKiBAcGFyYW0ge1N0cmluZ30gdmFsXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGVzY2FwZWRcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gdGVyc2VcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuZXhwb3J0cy5hdHRyID0gZnVuY3Rpb24gYXR0cihrZXksIHZhbCwgZXNjYXBlZCwgdGVyc2UpIHtcbiAgaWYgKCdib29sZWFuJyA9PSB0eXBlb2YgdmFsIHx8IG51bGwgPT0gdmFsKSB7XG4gICAgaWYgKHZhbCkge1xuICAgICAgcmV0dXJuICcgJyArICh0ZXJzZSA/IGtleSA6IGtleSArICc9XCInICsga2V5ICsgJ1wiJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAnJztcbiAgICB9XG4gIH0gZWxzZSBpZiAoMCA9PSBrZXkuaW5kZXhPZignZGF0YScpICYmICdzdHJpbmcnICE9IHR5cGVvZiB2YWwpIHtcbiAgICByZXR1cm4gJyAnICsga2V5ICsgXCI9J1wiICsgSlNPTi5zdHJpbmdpZnkodmFsKS5yZXBsYWNlKC8nL2csICcmYXBvczsnKSArIFwiJ1wiO1xuICB9IGVsc2UgaWYgKGVzY2FwZWQpIHtcbiAgICByZXR1cm4gJyAnICsga2V5ICsgJz1cIicgKyBleHBvcnRzLmVzY2FwZSh2YWwpICsgJ1wiJztcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gJyAnICsga2V5ICsgJz1cIicgKyB2YWwgKyAnXCInO1xuICB9XG59O1xuXG4vKipcbiAqIFJlbmRlciB0aGUgZ2l2ZW4gYXR0cmlidXRlcyBvYmplY3QuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHBhcmFtIHtPYmplY3R9IGVzY2FwZWRcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuZXhwb3J0cy5hdHRycyA9IGZ1bmN0aW9uIGF0dHJzKG9iaiwgdGVyc2Upe1xuICB2YXIgYnVmID0gW107XG5cbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhvYmopO1xuXG4gIGlmIChrZXlzLmxlbmd0aCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7ICsraSkge1xuICAgICAgdmFyIGtleSA9IGtleXNbaV1cbiAgICAgICAgLCB2YWwgPSBvYmpba2V5XTtcblxuICAgICAgaWYgKCdjbGFzcycgPT0ga2V5KSB7XG4gICAgICAgIGlmICh2YWwgPSBqb2luQ2xhc3Nlcyh2YWwpKSB7XG4gICAgICAgICAgYnVmLnB1c2goJyAnICsga2V5ICsgJz1cIicgKyB2YWwgKyAnXCInKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYnVmLnB1c2goZXhwb3J0cy5hdHRyKGtleSwgdmFsLCBmYWxzZSwgdGVyc2UpKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gYnVmLmpvaW4oJycpO1xufTtcblxuLyoqXG4gKiBFc2NhcGUgdGhlIGdpdmVuIHN0cmluZyBvZiBgaHRtbGAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGh0bWxcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmV4cG9ydHMuZXNjYXBlID0gZnVuY3Rpb24gZXNjYXBlKGh0bWwpe1xuICB2YXIgcmVzdWx0ID0gU3RyaW5nKGh0bWwpXG4gICAgLnJlcGxhY2UoLyYvZywgJyZhbXA7JylcbiAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKVxuICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7Jyk7XG4gIGlmIChyZXN1bHQgPT09ICcnICsgaHRtbCkgcmV0dXJuIGh0bWw7XG4gIGVsc2UgcmV0dXJuIHJlc3VsdDtcbn07XG5cbi8qKlxuICogUmUtdGhyb3cgdGhlIGdpdmVuIGBlcnJgIGluIGNvbnRleHQgdG8gdGhlXG4gKiB0aGUgamFkZSBpbiBgZmlsZW5hbWVgIGF0IHRoZSBnaXZlbiBgbGluZW5vYC5cbiAqXG4gKiBAcGFyYW0ge0Vycm9yfSBlcnJcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWxlbmFtZVxuICogQHBhcmFtIHtTdHJpbmd9IGxpbmVub1xuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZXhwb3J0cy5yZXRocm93ID0gZnVuY3Rpb24gcmV0aHJvdyhlcnIsIGZpbGVuYW1lLCBsaW5lbm8sIHN0cil7XG4gIGlmICghKGVyciBpbnN0YW5jZW9mIEVycm9yKSkgdGhyb3cgZXJyO1xuICBpZiAoKHR5cGVvZiB3aW5kb3cgIT0gJ3VuZGVmaW5lZCcgfHwgIWZpbGVuYW1lKSAmJiAhc3RyKSB7XG4gICAgZXJyLm1lc3NhZ2UgKz0gJyBvbiBsaW5lICcgKyBsaW5lbm87XG4gICAgdGhyb3cgZXJyO1xuICB9XG4gIHRyeSB7XG4gICAgc3RyID0gIHN0ciB8fCByZXF1aXJlKCdmcycpLnJlYWRGaWxlU3luYyhmaWxlbmFtZSwgJ3V0ZjgnKVxuICB9IGNhdGNoIChleCkge1xuICAgIHJldGhyb3coZXJyLCBudWxsLCBsaW5lbm8pXG4gIH1cbiAgdmFyIGNvbnRleHQgPSAzXG4gICAgLCBsaW5lcyA9IHN0ci5zcGxpdCgnXFxuJylcbiAgICAsIHN0YXJ0ID0gTWF0aC5tYXgobGluZW5vIC0gY29udGV4dCwgMClcbiAgICAsIGVuZCA9IE1hdGgubWluKGxpbmVzLmxlbmd0aCwgbGluZW5vICsgY29udGV4dCk7XG5cbiAgLy8gRXJyb3IgY29udGV4dFxuICB2YXIgY29udGV4dCA9IGxpbmVzLnNsaWNlKHN0YXJ0LCBlbmQpLm1hcChmdW5jdGlvbihsaW5lLCBpKXtcbiAgICB2YXIgY3VyciA9IGkgKyBzdGFydCArIDE7XG4gICAgcmV0dXJuIChjdXJyID09IGxpbmVubyA/ICcgID4gJyA6ICcgICAgJylcbiAgICAgICsgY3VyclxuICAgICAgKyAnfCAnXG4gICAgICArIGxpbmU7XG4gIH0pLmpvaW4oJ1xcbicpO1xuXG4gIC8vIEFsdGVyIGV4Y2VwdGlvbiBtZXNzYWdlXG4gIGVyci5wYXRoID0gZmlsZW5hbWU7XG4gIGVyci5tZXNzYWdlID0gKGZpbGVuYW1lIHx8ICdKYWRlJykgKyAnOicgKyBsaW5lbm9cbiAgICArICdcXG4nICsgY29udGV4dCArICdcXG5cXG4nICsgZXJyLm1lc3NhZ2U7XG4gIHRocm93IGVycjtcbn07XG4iXX0=