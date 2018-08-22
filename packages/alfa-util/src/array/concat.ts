export function concat<T>(fst: ArrayLike<T>, snd: ArrayLike<T>): Array<T> {
  const result: Array<T> = new Array(fst.length + snd.length);

  let p = 0;

  for (let i = 0, n = fst.length; i < n; i++) {
    result[p++] = fst[i];
  }

  for (let i = 0, n = snd.length; i < n; i++) {
    result[p++] = snd[i];
  }

  return result;
}
