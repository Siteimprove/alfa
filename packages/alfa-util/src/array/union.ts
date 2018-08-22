export function union<T>(fst: ArrayLike<T>, snd: ArrayLike<T>): Set<T> {
  const result: Set<T> = new Set();

  for (let i = 0, n = fst.length; i < n; i++) {
    result.add(fst[i]);
  }

  for (let i = 0, n = snd.length; i < n; i++) {
    result.add(snd[i]);
  }

  return result;
}
