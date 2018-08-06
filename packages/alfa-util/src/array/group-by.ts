export function groupBy<T, K>(
  array: ArrayLike<T>,
  iteratee: (element: T) => K
): Map<K, Array<T>> {
  const groups: Map<K, Array<T>> = new Map();

  for (let i = 0, n = array.length; i < n; i++) {
    const element = array[i];
    const group = iteratee(element);

    let target = groups.get(group);

    if (target === undefined) {
      target = [];
      groups.set(group, target);
    }

    target.push(element);
  }

  return groups;
}
