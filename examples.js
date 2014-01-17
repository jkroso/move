
var move = require('move')
var dom = require('dom')

dom('.example').each(function(example){
  example.initial = example.find('.sandbox').html()
  var play = example.find('button.play')

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
