import moize from "moize";

export type MemoizeOptions = Readonly<{
  cache?: Readonly<{ size?: number; age?: number }>;
}>;

export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  options: MemoizeOptions = {}
): T {
  const { cache = {} } = options;

  return moize(fn, {
    maxSize: cache.size,
    maxAge: cache.age
  });
}
