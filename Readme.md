
# move

  Pure JS DOM animation. Still at the experimental stage. Inspiration coming from [move.js](//github.com/visionmedia/move.js) and [firmin](http://extralogical.net/projects/firmin) though by staying in JS as much as possible I hope to be able to go a lot further. 

  Note: it's plenty fast for most use cases but CSS animations will probably always be faster.

## Installation

With your favourite package manager:

- [packin](//github.com/jkroso/packin): `packin add jkroso/move`
- [component](//github.com/component/component#installing-packages): `component install jkroso/move`
- [npm](//npmjs.org/doc/cli/npm-install.html): `npm install jkroso/move`

then in your app:

```js
var move = require('move')
```

## Usage

```js
move(document.body)
  .set('background-color', 'blue')
  .rotate(30)
  .scale(2)
  .ease('out-bounce')
  .duration('.2s')
  .then()
    .rotate(-30)
    .scale(.5)
```

This will enlarge the document while rotating it clockwise and changing the background color to blue. `then()` 200ms later when that animation completes it will animate back to its original size and rotation.

## Running the tests

Just run `make` and navigate your browser to [test/index.html](test/index.html)
