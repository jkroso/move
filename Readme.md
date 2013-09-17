
# move

  Pure JS DOM animation. Still at the experimental stage. Inspiration coming from [move.js](//github.com/visionmedia/move.js) and [firmin](http://extralogical.net/projects/firmin) though by staying in JS as much as possible I hope to be able to go a lot further.

## limitations

- performance: Should be plenty fast but CSS animations will probably always be faster.

- x-browser: At this stage it only works in webkit based browsers or browsers with a `WebKitCSSMatrix` polyfill. This is only temporary but it will take a bit of effort to work around.

## Installation

_With [packin](//github.com/jkroso/packin) or [component](//github.com/component/component)_

    $ packin add jkroso/move

then in your app:

```js
var move = require('move')
```

## API

### Move(el)

  the Move class

### Move#set(prop:String, to:CSS)

  add `prop` to animation. When the animation is run
  `prop` will be tweened from its current value to `to`

### Move#add(prop:String, to:Number)

  increment `prop` by `n`

### Move#sub(prop:String, to:Number)

  decrement `prop` by `n`

### Move#current(prop:String)

  get the current value of `prop`

### Move#skew(x:Number, y:Number)

  Skew `x` and `y`.

### Move#skewX(n:Number)

  Skew x by `n`.

### Move#skewY(n:Number)

  Skew y by `n`.

### Move#translate(x:Number, y:Number)

  Translate `x` and `y` axis.

### Move#scale(x:Number, y:Number)

  Scale the x and y axis by `x`, or
  individually scale `x` and `y`.

### Move#scaleX(n:Number)

  Scale x axis by `n`.

### Move#scaleY(n:Number)

  Scale y axis by `n`.

### Move#rotate(n:Number)

  Rotate `n` degrees.

### Move#reset()

  reset the animation so it can be re-used

### Move#duration(n:Number|String)

  set duration to `n`. if `n` is a string it
  is assumed to be in seconds

### Move#then(fn:Function)

  Defer `fn` until the animation is complete

### Move#run([n]:Number|String)

  run the animation with an optional duration

## Running the tests

Just run `make` and navigate your browser to the test directory.
