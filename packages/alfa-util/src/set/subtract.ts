export function subtract<T>(fst: Set<T>, snd: Set<T>): Set<T> {
  const result: Set<T> = new Set();

  for (const element of fst) {
    if (!snd.has(element)) {
      result.add(element);
    }
  }

  return result;
}
