export function concat<T>(fst: ArrayLike<T>, snd: ArrayLike<T>): Array<T> {
  const result = new Array(fst.length + snd.length);

  for (let i = 0, n = fst.length; i < n; i++) {
    result[i] = fst[i];
  }

  for (let i = 0, j = fst.length, n = snd.length; i < n; i++, j++) {
    result[j] = snd[i];
  }

  return result;
}
