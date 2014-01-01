
module.exports = function(from, to){
  from = parse(from)
  to = parse(to)
  return function frame(n){
    return from + (to - from) * n
  }
}

function parse(px){
  return parseFloat(px, 10) || 0
}