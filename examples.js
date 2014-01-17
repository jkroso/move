
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
