export function intersect<T>(fst: Set<T>, snd: Set<T>): Set<T> {
  if (fst.size > snd.size) {
    [fst, snd] = [snd, fst];
  }

  const result: Set<T> = new Set();

  for (const element of fst) {
    if (snd.has(element)) {
      result.add(element);
    }
  }

  return result;
}
