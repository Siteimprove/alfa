import { BrowserSpecific } from "./browser-specific";
import { expandBrowsers } from "./expand-browsers";
import { BrowserQuery } from "./types";

export function branch<T>(
  target: BrowserSpecific<T>,
  value: T,
  browsers: ReadonlyArray<BrowserQuery>
): BrowserSpecific<T> {
  const expanded = expandBrowsers(browsers);

  if (expanded.size === 0) {
    return target;
  }

  return BrowserSpecific.of([
    ...target.values,
    {
      value,
      browsers: expanded
    }
  ]);
}
