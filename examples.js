
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
