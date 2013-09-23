
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