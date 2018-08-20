import { BrowserSpecific } from "./browser-specific";

/**
 * Given a value, check if the value is browser specific.
 */
export function isBrowserSpecific<T>(
  value: T | BrowserSpecific<T>
): value is BrowserSpecific<T> {
  return value instanceof BrowserSpecific;
}
