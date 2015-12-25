import prefix from 'prefix'
import move from '..'

var box, mv, spy
before(function(){
  spy = chai.spy()
  box = document.createElement('div')
  document.body.appendChild(box)
  mv = move(box).duration(10)
})

after(function(){
  document.body.removeChild(box)
})

describe('.set()', function(){
  it('should handle default types', function(){
    move(box, {
      opacity: 0,
      margin: 5
    }).render(.5)
    box.style.margin.should.eql('2.5px')
    box.style.opacity.should.eql('0.5')
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

  it('should pull current value down from grandparents', function(){
    move(box).x(5).then().then().x(-2).render(.5)
    var frame = 'translateX(4px) translateY(0px) rotate(0deg) skew(0deg) scaleX(1) scaleY(1)'
    box.style.should.have.property(prefix('transform'), frame)
  })

  it('should not auto-run deferred moves', function(done){
    var a = mv.x(5).on('end', function(){
      b.run.should.not.have.been.called()
      done()
    })
    var b = a.then()
    b.run = spy
    b.then()
  })
})
