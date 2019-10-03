import { BrowserSpecific } from "./browser-specific";

// generic builder
export function binOp<T, U, V>(
  op: (t: T, u: U) => V
): (
  t: T | BrowserSpecific<T>,
  u: U | BrowserSpecific<U>
) => V | BrowserSpecific<V> {
  return (t, u) =>
    BrowserSpecific.map(t, x => BrowserSpecific.map(u, y => op(x, y)));
}

// Frequently used operations
export const and = binOp((x: boolean, y: boolean) => x && y);
export const or = binOp((x: boolean, y: boolean) => x || y);
