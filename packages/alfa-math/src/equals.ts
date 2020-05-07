const { abs, min } = Math;

export function equals(
  a: number,
  b: number,
  epsilon: number = Number.EPSILON
): boolean {
  if (a === b) {
    return true;
  }

  const diff = abs(a - b);

  if (a === 0 || b === 0) {
    return diff < epsilon;
  }

  return diff / min(abs(b) + abs(a), Number.MAX_VALUE) < epsilon;
}
