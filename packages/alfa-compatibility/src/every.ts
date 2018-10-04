import { BrowserSpecific } from "./browser-specific";
import { isBrowserSpecific } from "./guards";

export function every<T>(
  value: T | BrowserSpecific<T>,
  iteratee: (value: T) => boolean = Boolean
): boolean {
  if (isBrowserSpecific(value)) {
    return value.values.every(({ value }) => iteratee(value));
  }

  return iteratee(value);
}
