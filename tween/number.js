const numberTween = (from, to) => {
  from = parseFloat(from, 10) || 0
  to = parseFloat(to, 10) || 0
  return n => from + (to - from) * n
}

export default numberTween
