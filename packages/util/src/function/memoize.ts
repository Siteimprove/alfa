import moize from 'moize'

type Fn = (...args: any[]) => any

export function memoize<T extends Fn> (fn: T): T {
  return moize(fn)
}
