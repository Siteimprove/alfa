export function set<T, K extends keyof T>(
  object: T,
  key: K,
  value: T[K]
): void {
  object[key] = value;
}
