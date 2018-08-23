import { BrowserSpecific } from "./browser-specific";
import { Browsers } from "./browsers";
import { BrowserName } from "./types";

/**
 * @internal
 */
export function isBrowserName(name: string): name is BrowserName {
  return name in Browsers;
}

/**
 * @internal
 */
export function isBrowserSpecific<T>(
  value: T | BrowserSpecific<T>
): value is BrowserSpecific<T> {
  return value instanceof BrowserSpecific;
}
