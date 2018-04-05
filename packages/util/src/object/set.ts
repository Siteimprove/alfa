export function set<T, P extends keyof T>(
  target: T,
  property: P,
  value: T[P]
): T {
  target[property] = value;
  return target;
}
