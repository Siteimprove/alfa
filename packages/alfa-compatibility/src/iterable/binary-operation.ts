import { BrowserSpecific } from "../browser-specific";

export function binOp<T, U, V>(
  op: (t: T, u: U) => V
): (
  t: T | BrowserSpecific<T>,
  u: U | BrowserSpecific<U>
) => V | BrowserSpecific<V> {
  return (t, u) =>
    BrowserSpecific.map(t, x => BrowserSpecific.map(u, y => op(x, y)));
}
