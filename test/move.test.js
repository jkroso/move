
var move = require('..')
var chai = require('./chai')

var box
var mv
beforeEach(function(){
	spy = chai.spy()
	box = document.createElement('div')
	document.body.appendChild(box)
	mv = move(box).duration(10)
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

	describe('.then()', function(){
		it('should support passing in move instances', function(done){
			var next = move(box).duration(10)
			mv.on('end', spy)
			mv.then(next).should.equal(mv)
			next.on('end', function(){
				spy.should.have.been.called(1)
				done()
			})
		})
	})
})