
var move = require('..')
var chai = require('./chai')

var box
var mv
beforeEach(function(){
	box = document.createElement('div')
	document.body.appendChild(box)
	mv = move(box)
})

afterEach(function(){
	document.body.removeChild(box)
})

describe('move', function(){
	describe('.set()', function(){
		it('should handle default types', function(){
			mv.set('opacity', 0)
				.set('margin', 5)
				.frame(.5)
				.should.eql({
					margin: '2.5px',
					opacity: .5,
				})
		})
	})
})