import { BrowserSpecific } from "./browser-specific";
import { BrowserQuery } from "./types";

export function branch<T>(
  target: BrowserSpecific<T> | null,
  value: T,
  browsers: ReadonlyArray<BrowserQuery>
): BrowserSpecific<T> {
  if (target === null) {
    return BrowserSpecific.of([{ value, browsers }]);
  }

  return BrowserSpecific.of([...target.values, { value, browsers }]);
}
