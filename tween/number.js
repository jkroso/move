
module.exports = function(from, to){
  from = parseFloat(from, 10) || 0
  to = parseFloat(to, 10) || 0
  return function frame(n){
    return from + (to - from) * n
  }
}
