const EmptyObject = Object.create({})

// [a] -> [b] -> {a: b}
// a shoud be a string
const zipToObj = xs => ys => ys.reduce(
  (red, y, i) => ({ ...red, [xs[i]]: y }),
  EmptyObject,
)
// {a: b} -> a -> b
const ObjToFn = obj => key => obj[key]

// [key] -> [a] -> key -> a
export const zipToFn = xs => ys =>
  ObjToFn(zipToObj(xs)(ys))

// (b -> bool) -> [a -> b] -> a -> b
export const until = p => ([f, ...fs]) => (x) => {
  const y = f(x)
  if (p(y) || fs.length === 0) { return y }
  return until(p)(fs)(x)
}

// (a{n-1} -> an,..., a1 -> a2, a0 -> a1) -> a0 -> an
export const compose = (...fs) => x =>
  fs.reduceRight((y, f) => f(y), x)
export const pipeline = (...fs) => x =>
  fs.reduce((y, f) => f(y), x)

// (a -> b -> c) -> b -> a -> c
export const flip = f => x => y => f(y)(x)

// (a -> b -> ... -> resType) -> (a, b, ...) -> resType
export const uncurry = f => (...args) => {
  if (args.length === 0) return f
  const [x, ...xs] = args
  const g = f(x)
  return uncurry(g)(...xs)
}
// curry ....
// export const curry = f => x => {
//   f.call(null, x)
// }

// m is Array
// a -> m a
export const pure = x => [x]
// (a -> b) -> m a -> m b
export const map = f => mx => mx.map(f)
// m (m a) -> m a
export const join = mmx => mmx.reduce((red, mx) => [...red, ...mx], [])
// (a -> m b) -> m a -> m b
export const ap = f => compose(join, map(f))
// ((a, b) -> c) -> m a -> m b -> m c
export const zipWith2 = f => xs => ys =>
  xs.reduce((red, x, i) => [...red, f(x, ys[i])], [])

// (a -> b) -> a -> b
const apply = f => x => f(x)
// a -> (a -> b) -> b
const evaluate = flip(apply)
// a -> m (a -> b) -> m b
export const iterEval = compose(
  map,
  evaluate,
)

export const debug = f => (...args) => {
  debugger
  return f(...args)
}
// m (a -> b) -> a -> m b
export const iterApply = flip(iterEval)
// m (a -> b -> c) -> a -> b -> m c
// const tmp = fs => //iterApply(iterApply(fs)(x))(y)
//   compose(iterApply, iterApply(fs))
