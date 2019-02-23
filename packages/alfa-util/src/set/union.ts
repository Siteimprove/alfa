export function union<T>(fst: Set<T>, snd: Set<T>): Set<T> {
  const result = new Set<T>();

  for (const element of fst) {
    result.add(element);
  }

  for (const element of snd) {
    result.add(element);
  }

  return result;
}
