import toString from 'serialize-svg-path'
import balance from 'balance-svg-paths'
import norm from 'normalize-svg-path'
import parse from 'parse-svg-path'
import tween from 'string-tween'
import abs from 'abs-svg-path'
import rel from 'rel-svg-path'
import fcomp from 'fcomp'

const normalize = fcomp(parse, abs, norm, rel)

const pathTween = (from, to) => {
  const [start,end] = balance(normalize(from), normalize(to))
  return tween(toString(start), toString(end))
}

export default pathTween
