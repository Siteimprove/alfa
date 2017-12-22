import moize from 'moize'

type Fn = (...args: any[]) => any

type Options = {
  cache?: { size?: number, age?: number }
}

export function memoize<T extends Fn> (fn: T, options: Options = {}): T {
  const { cache = {} } = options

  return moize(fn, {
    maxSize: cache.size,
    maxAge: cache.age
  })
}
